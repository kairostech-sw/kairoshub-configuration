import hassapi as hass
import json

file="/home/pi/workspace/kairoshubSettings.json"

class KairoshubSettings(hass.Hass):
    def initialize(self):
        self.listen_event(self.syncSettings, "AD_SETTINGS_SYNC")
        self.listen_event(self.restoreSettings, "AD_SETTINGS_RESTORE")
        self.listen_event(self.pushSettings, "AD_SETTINGS_PUSH")
    
    def syncSettings(self, event_name, data, kwargs):
        self.log("Retrieving user settings")
        
        userSettings={}
        functionSettings={}
        attributes={}

        systemCode           = self.get_state("input_text.system_code")
        userSettingsList     = self.get_state("group.kairoshub_settings", attribute="entity_id")
        functionSettingsList = self.get_state("group.kairoshub_functionalities",attribute="entity_id")

        for entity in userSettingsList:
            attributes=self.get_state(entity,attribute="all").get("attributes",{})
            attributes["state"]=self.get_state(entity)
            userSettings[entity]=attributes
        
        for entity in functionSettingsList:
            attributes=self.get_state(entity,attribute="all").get("attributes",{})
            attributes["state"]=self.get_state(entity)
            functionSettings[entity]=attributes
        
        self.log("User settings: %s", userSettings, level="DEBUG")
        self.log("Functionalities: %s", functionSettings, level="DEBUG")
        

        with open(file,"w") as f:
            jsonData={}
            jsonData["userSettings"]=userSettings
            jsonData["functionSettings"]=functionSettings
            json.dump(jsonData,f)

        self.log("User settings synced", level="INFO")
        eventData= {
            "eventType" : "SETTINGS_SYNC",
            "sender"    : systemCode,
            "message"   : "SETTINGS SYNC",
            "technicalMessage": jsonData
        }

        self.fire_event("HAKAIROS_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)
            
    def restoreSettings(self, event_name, data, kwargs):

        userSettings={}
        functionSettings={}
        systemCode = self.get_state("input_text.system_code")

        self.log("Retrieving user settings", level="INFO")

        try:
            with open(file) as f:
                jsonData=json.load(f)
                userSettings=jsonData["userSettings"]
                functionSettings=jsonData["functionSettings"]
                
                self.__writeToFile__(userSettings, functionSettings)
                self.log("User settings restored",level="INFO")

        except FileNotFoundError:
            self.log("User settings not found", level="WARNING")
            self.log("Requesting user settings to cloud", level="INFO")

            eventData = {
                "eventType" : "SETTINGS_RESTORE_REQ",
                "sender" : systemCode,
                "message" : "SETTINGS RESTORE REQUEST",
                "technicalMessage" : "{}"
            } 

            self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)

        except Exception as e:
            raise

    def pushSettings(self, event_name, data, kwargs):
       
        self.log("Pushing settings to file",level="INFO")
        
        jsonData=data["eventData"]["technicalMessage"]
        try:        
            with open(file,"w") as f:
                json.dump(jsonData,f)
                userSettings=jsonData["userSettings"]
                functionSettings=jsonData["functionSettings"]
                self.__writeToFile__(userSettings, functionSettings)
        except Exception:
            raise

        self.log("Settings pushed", level="INFO")
        
    def __writeToFile__(self, userSettings, functionSettings):

        for entity in userSettings:
            self.set_state(entity,state=userSettings[entity].pop("state"),attributes=userSettings[entity])
    
        for entity in functionSettings:
            self.set_state(entity,state=functionSettings[entity].pop("state"),attributes=functionSettings[entity])
