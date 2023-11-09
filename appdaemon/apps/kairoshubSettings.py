from datetime import datetime, timedelta
import hassapi as hass
import json

file = "./kairoshubSettings.json"


class KairoshubSettings(hass.Hass):
    def initialize(self):
        self.listen_event(self.syncSettings, "AD_SETTINGS_SYNC")
        self.listen_event(self.restoreSettings, "AD_SETTINGS_RESTORE")
        self.listen_event(self.forceCloudRestoreSettings,
                          "AD_SETTINGS_RESTORE_FORCE")
        self.listen_event(self.pushSettings, "AD_SETTINGS_PUSH")
        self.listen_event(self.fileCheck, "AD_SETTINGS_FILE_CHECK")
        self.listen_event(self.__systemKeySync, "AD_SETTINGS_SYSTEM_KEY_SYNC")
        self.listen_event(self.__systemKeyPush, "AD_SETTING_SYSTEM_KEY_PUSH")

    def syncSettings(self, event_name, data, kwargs):
        self.log("Retrieving stored user settings")

        userSettings = {
            "hub_zones": {},
            "rollers": {},
            "heating": {},
            # "light": {},
            # "scene": {}
        }
        functionSettings = {}

        systemCode = self.get_state("input_text.system_code")
        userSettingsList = self.get_state(
            "group.kairoshub_settings", attribute="entity_id")
        functionSettingsList = self.get_state(
            "group.kairoshub_functionalities", attribute="entity_id")
        zonesGroup = self.get_state("group.zones", attribute="entity_id")

        domain = "hub_zones"
        for group in zonesGroup:
            zones = self.get_state(group, attribute="entity_id")
            for entity in zones:
                userSettings[domain][entity.split(
                    ".")[1]] = self.get_state(entity)

        for entity in userSettingsList:
            if "position" in entity:
                domain = "rollers"
            elif "temperature" in entity:
                domain = "heating"
            elif "light" in entity:
                # domain = "light"
                continue
            elif "scene" in entity:
                # domain = "scene"
                continue

            userSettings[domain][entity.split(".")[1]] = self.get_state(entity)

        for entity in functionSettingsList:
            entityName = self.toCamelCase(entity)
            functionSettings[entityName] = self.get_state(entity) == "on"

        self.log("User settings: %s", userSettings, level="DEBUG")
        self.log("Functionalities: %s", functionSettings, level="DEBUG")

        timestamp = datetime.strptime(self.get_state(
            "sensor.date_time_iso"), "%Y-%m-%dT%H:%M:%S")

        jsonData = {}

        try:
            self.log("Storing user settings on filesystem.", level="INFO")
            jsonData = self.writeFileSettings(userSettings, functionSettings)

            eventData = {
                "eventType": "SETTINGS_SYNC",
                "sender": systemCode,
                "systemCode": systemCode,
                "message": "SETTINGS SYNC",
                "technicalMessage": jsonData,
                "timestamp": timestamp
            }

            self.log("Storing user settings on cloud", level="INFO")
            self.fire_event("HAKAFKA_PRODUCER_PRODUCE",
                            topic="TECHNICAL", message=eventData)
        except Exception as e:
            self.log("Error on user setting filesystem store. Error: %s"+e)

    def restoreSettings(self, event_name, data, kwargs):

        userSettings = {}
        functionSettings = {}

        self.log("Retrieving user settings", level="INFO")

        try:
            jsonData = self.readFileSettings()
            userSettings = jsonData["userSettings"] if "userSettings" in jsonData else ""
            functionSettings = jsonData["functionSettings"] if "functionSettings" in jsonData else ""
            self.__updateSensors(userSettings, functionSettings)
            self.log("User settings restored by filesystem", level="INFO")

        except FileNotFoundError:
            self.log("User settings not found", level="WARNING")
            self.log("Requesting user settings to cloud", level="INFO")

            self.forceCloudRestoreSettings(event_name, data, kwargs)

        except Exception:
            raise

    def forceCloudRestoreSettings(self, event_name, data, kwargs):

        systemCode = self.get_state("input_text.system_code")

        self.log("Forcing cloud restore settings", level="WARNING")

        eventData = {
            "eventType": "SETTINGS_RESTORE_REQ",
            "sender": systemCode,
            "systemCode": systemCode,
            "message": "SETTINGS RESTORE REQUEST"
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE",
                        topic="TECHNICAL", message=eventData)

    def pushSettings(self, event_name, data, kwargs):

        self.log("Pushing settings to file. data provided: %s",
                 data, level="INFO")

        jsonData = data["data"]["technicalMessage"]
        try:
            userSettings = jsonData["userSettings"] if "userSettings" in jsonData else ""
            functionSettings = jsonData["functionSettings"] if "functionSettings" in jsonData else ""
            self.writeFileSettings(userSettings, functionSettings)
            self.__updateSensors(userSettings, functionSettings)
        except Exception:
            raise

        self.log("Settings pushed", level="INFO")

    def fileCheck(self, event_name, data, kwargs):
        self.log("Checking file content. file: %s", file)
        try:
            jsonData = self.readFileSettings()
            self.log("File settings content: %s", jsonData, level="INFO")

        except FileNotFoundError:
            self.log("File settings not found, requesting new one",
                     level="WARNING")
            self.fire_event("AD_SETTINGS_RESTORE")

    def __updateSensors(self, userSettings, functionSettings):

        self.log(
            "Updating user settings and function settings entities", level="INFO")
        for key in userSettings:
            for entity in userSettings[key]:
                domain = self.getEntityDomain(entity)
                attributes = self.get_state(
                    domain+entity, attribute="attributes")
                self.set_state(
                    domain+entity, state=userSettings[key][entity], attributes=attributes)

        for entity in functionSettings:
            entityName = self.toSnakeCase(entity)
            state = ("off", "on")[
                str(functionSettings[entity]).lower() == "true"]
            self.set_state("input_boolean."+entityName, state=state)

    def getEntityDomain(self, entity):

        if "position" in entity or "temperature" in entity:
            domain = "input_number."
        elif "zn" in entity:
            domain = "input_text."
        elif "offset_sunset" in entity:
            domain = "input_datetime."
        elif "scene" in entity or "light_type" in entity:
            domain = "input_select."

        return domain

    def __systemKeySync(self, event_name, data, kwargs):

        self.log("Requesting key to cloud", level="INFO")
        systemCode = self.get_state("input_text.system_code")

        eventData = {
            "eventType": "SYSTEM_KEY_SYNC",
            "sender": systemCode,
            "systemCode": systemCode,
            "message": "SYSTEM KEY SYNC"
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE",
                        topic="TECHNICAL", message=eventData)

    def __systemKeyPush(self, event_name, data, kwargs):

        self.log("Updating key", level="INFO")

        key = data["data"]["technicalMessage"]["systemKey"]
        self.set_state("input_text.system_key", state=key)

        self.log("Key updated", level="INFO")

    def toCamelCase(self, text):
        text = text.split(".")[1].split("_")
        if len(text) > 1:
            text = text[0] + "".join(letter.capitalize()
                                     for letter in text[1:])
        return text

    def toSnakeCase(self, text):
        return ''.join(['_'+i.lower() if i.isupper()
                        else i for i in text]).lstrip('_')

    def writeFileSettings(self, userSettings, functionSettings):

        currentTimestamp = datetime.strptime(self.get_state(
            "sensor.date_time_iso"), "%Y-%m-%dT%H:%M:%S")
        lifetime = (currentTimestamp+timedelta(days=1)
                    ).strftime("%Y-%m-%dT%H:%M:%S")

        self.log("Setting new setting faile lifetime to: %s", lifetime)

        jsonData = {}
        with open(file, "w") as f:
            jsonData["userSettings"] = userSettings
            jsonData["functionSettings"] = functionSettings
            jsonData["lifetime"] = lifetime

            json.dump(jsonData, f)

        self.log("File settings store to fs %s", jsonData)
        jsonData.pop("lifetime", None)
        return jsonData

    def readFileSettings(self):
        self.log("Reading file settings")

        currentTimestamp = self.get_state("sensor.date_time_iso")
        with open(file) as f:
            jsonData = json.load(f)
            if "lifetime" not in jsonData or jsonData["lifetime"] < currentTimestamp:
                self.log("File settings expired.", level="INFO")
                raise FileNotFoundError
            else:
                self.log("Settings file content. %s", jsonData, level="INFO")
                jsonData.pop("lifetime", None)
            return jsonData
