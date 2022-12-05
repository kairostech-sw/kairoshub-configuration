from datetime import datetime, timedelta
import hassapi as hass
import json

file="./kairoshubSettings.json"

class KairoshubSettings(hass.Hass):
    def initialize(self):
        self.listen_event(self.syncSettings, "AD_SETTINGS_SYNC")
        self.listen_event(self.restoreSettings, "AD_SETTINGS_RESTORE")
        self.listen_event(self.pushSettings, "AD_SETTINGS_PUSH")
        self.listen_event(self.fileCheck, "AD_SETTINGS_FILE_CHECK")
    
    def syncSettings(self, event_name, data, kwargs):
        self.log("Retrieving user settings")
        
        userSettings={"hub_zones":{}, "rollers":{},"heating":{}}
        functionSettings={}

        systemCode           = self.get_state("input_text.system_code")
        userSettingsList     = self.get_state("group.kairoshub_settings", attribute="entity_id")
        functionSettingsList = self.get_state("group.kairoshub_functionalities",attribute="entity_id")
        zonesGroup = self.get_state("group.zones", attribute="entity_id")

        domain = "hub_zones"
        for group in zonesGroup:
            zones = self.get_state(group, attribute="entity_id")
            for entity in zones:
                userSettings[domain][entity.split(".")[1]] = self.get_state(entity)

        for entity in userSettingsList:
            if "rollers" in entity:
                domain = "rollers"
            elif "heating" in entity:
                domain = "heating"

            userSettings[domain][entity.split(".")[1]] = self.get_state(entity)

        for entity in functionSettingsList:
            functionSettings[entity.split(".")[1]]=self.get_state(entity)

        self.log("User settings: %s", userSettings, level="DEBUG")
        self.log("Functionalities: %s", functionSettings, level="DEBUG")

        timestamp = datetime.strptime(self.get_state("sensor.date_time_iso"),"%Y-%m-%dT%H:%M:%S")

        with open(file,"w") as f:
            jsonData={}
            jsonData["userSettings"]=userSettings
            jsonData["functionSettings"]=functionSettings
            jsonData["lifetime"] = (timestamp+timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")
            json.dump(jsonData,f)

        self.log("User settings synced", level="INFO")
        eventData= {
            "eventType" : "SETTINGS_SYNC",
            "sender"    : systemCode,
            "message"   : "SETTINGS SYNC",
            "technicalMessage": jsonData,
            "timestamp": timestamp
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)
            
    def restoreSettings(self, event_name, data, kwargs):

        userSettings={}
        functionSettings={}
        systemCode = self.get_state("input_text.system_code")

        self.log("Retrieving user settings", level="INFO")

        try:
            timestamp = self.get_state("sensor.date_time_iso")
            with open(file) as f:
                jsonData=json.load(f)
                userSettings=jsonData["userSettings"] if "userSettings" in jsonData else ""
                functionSettings=jsonData["functionSettings"] if "functionSettings" in jsonData else ""
                if jsonData["lifetime"] < timestamp:
                    raise FileNotFoundError
                self.__updateSensors__(userSettings, functionSettings)
                self.log("User settings restored by filesystem",level="INFO")

        except FileNotFoundError:
            self.log("User settings not found", level="WARNING")
            self.log("Requesting user settings to cloud", level="INFO")

            eventData = {
                "eventType" : "SETTINGS_RESTORE_REQ",
                "sender" : systemCode,
                "message" : "SETTINGS RESTORE REQUEST"
            } 

            self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)

        except Exception as e:
            raise

    def pushSettings(self, event_name, data, kwargs):
       
        self.log("Pushing settings to file. Settings provided: %s", data, level="INFO")

        jsonData=data["data"]["technicalMessage"]
        try:        
            with open(file,"w") as f:
                json.dump(jsonData,f)
                userSettings=jsonData["userSettings"] if "userSettings" in jsonData else ""
                functionSettings=jsonData["functionSettings"] if "functionSettings" in jsonData else ""
                self.__updateSensors__(userSettings, functionSettings)
        except Exception:
            raise

        self.log("Settings pushed", level="INFO")

    def fileCheck(self, event_name, data, kwargs):
        self.log("Checking file content. file: %s", file)
        try:
            timestamp = self.get_state("sensor.date_time_iso")
            with open(file) as f:
                jsonData=json.load(f)
                if jsonData["lifetime"] < timestamp:
                    self.fire_event("AD_SETTINGS_RESTORE")
                self.log("File settings content: %s", jsonData,level="INFO")

        except FileNotFoundError:
            self.log("File settings not found", level="WARNING")

    def __updateSensors__(self, userSettings, functionSettings):

        rollersAttributes = {"min":"0", "max":"100","step":"5", "mode":"slider", "icon":"mdi:window-shutter"}
        heatingAttributes = {"min":"18", "max":"31", "step":"0.5", "mode":"slider", "name": "Temperatura Per Riscaldamento Manuale", "icon": "mdi:thermometer"}
        for key in userSettings:
            for entity in userSettings[key]:
                if "rollers" in entity:
                    domain = "input_number."
                    if "not" in entity:
                        rollersAttributes["name"] = "Posizione Fuori Casa"
                    else:
                        rollersAttributes["name"] = "Posizione In Casa"
                    attributes = rollersAttributes
                elif "heating" in entity :
                    domain = "input_number."
                    attributes = heatingAttributes
                elif "zn" in entity:
                    domain ="input_text."
                    attributes = {"friendly_name": entity.upper()}
                self.set_state(domain+entity, state = userSettings[key][entity], attributes = attributes)
    
        for entity in functionSettings:
            self.set_state("input_boolean."+entity,state=functionSettings[entity])
