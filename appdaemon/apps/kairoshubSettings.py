from datetime import datetime, timedelta
import hassapi as hass
import json

file = "./kairoshubSettings.json"


class KairoshubSettings(hass.Hass):
    def initialize(self):
        self.listen_event(self.syncSettings, "AD_SETTINGS_SYNC")
        self.listen_event(self.restoreSettings, "AD_SETTINGS_RESTORE")
        self.listen_event(self.pushSettings, "AD_SETTINGS_PUSH")
        self.listen_event(self.fileCheck, "AD_SETTINGS_FILE_CHECK")
        self.listen_event(self.copyPrograms, "AD_COPY_PROGRAMS")
        self.listen_event(self.__systemKeySync, "AD_SETTINGS_SYSTEM_KEY_SYNC")
        self.listen_event(self.__systemKeyPush, "AD_SETTING_SYSTEM_KEY_PUSH")

    def syncSettings(self, event_name, data, kwargs):
        self.log("Retrieving stored user settings")

        userSettings = {
            "hub_zones": {},
            "rollers": {},
            "heating": {},
            "light": {},
            "scene": {}
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
            if "rollers" in entity:
                domain = "rollers"
            elif "heating" in entity:
                domain = "heating"
            elif "light" in entity:
                domain = "light"
            elif "scene" in entity:
                domain = "scene"

            userSettings[domain][entity.split(".")[1]] = self.get_state(entity)

        for entity in functionSettingsList:
            entityName = self.toCamelCase(entity)
            functionSettings[entityName] = self.get_state(entity)

        self.log("User settings: %s", userSettings, level="DEBUG")
        self.log("Functionalities: %s", functionSettings, level="DEBUG")

        timestamp = datetime.strptime(self.get_state(
            "sensor.date_time_iso"), "%Y-%m-%dT%H:%M:%S")

        jsonData = {}
        with open(file, "w") as f:
            jsonData["userSettings"] = userSettings
            jsonData["functionSettings"] = functionSettings
            jsonData["lifetime"] = (
                timestamp+timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")
            json.dump(jsonData, f)

        self.log("User settings stored on filesystem.", level="INFO")
        jsonData.pop("lifetime", None)
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

    def restoreSettings(self, event_name, data, kwargs):

        userSettings = {}
        functionSettings = {}
        systemCode = self.get_state("input_text.system_code")

        self.log("Retrieving user settings", level="INFO")

        try:
            timestamp = self.get_state("sensor.date_time_iso")
            with open(file) as f:
                jsonData = json.load(f)
                if "lifetime" not in jsonData or jsonData["lifetime"] < timestamp:
                    self.log("User settings expired.", level="INFO")
                    raise FileNotFoundError
                userSettings = jsonData["userSettings"] if "userSettings" in jsonData else ""
                functionSettings = jsonData["functionSettings"] if "functionSettings" in jsonData else ""
                self.__updateSensors(userSettings, functionSettings)
                self.log("User settings restored by filesystem", level="INFO")

        except FileNotFoundError:
            self.log("User settings not found", level="WARNING")
            self.log("Requesting user settings to cloud", level="INFO")

            eventData = {
                "eventType": "SETTINGS_RESTORE_REQ",
                "sender": systemCode,
                "systemCode": systemCode,
                "message": "SETTINGS RESTORE REQUEST"
            }

            self.fire_event("HAKAFKA_PRODUCER_PRODUCE",
                            topic="TECHNICAL", message=eventData)

        except Exception:
            raise

    def pushSettings(self, event_name, data, kwargs):

        self.log("Pushing settings to file. Settings provided: %s",
                 data, level="INFO")

        jsonData = data["data"]["technicalMessage"]
        try:
            with open(file, "w") as f:
                json.dump(jsonData, f)
                userSettings = jsonData["userSettings"] if "userSettings" in jsonData else ""
                functionSettings = jsonData["functionSettings"] if "functionSettings" in jsonData else ""
                self.__updateSensors(userSettings, functionSettings)
        except Exception:
            raise

        self.log("Settings pushed", level="INFO")

    def fileCheck(self, event_name, data, kwargs):
        self.log("Checking file content. file: %s", file)
        try:
            timestamp = self.get_state("sensor.date_time_iso")
            with open(file) as f:
                jsonData = json.load(f)
                if jsonData["lifetime"] < timestamp:
                    self.fire_event("AD_SETTINGS_RESTORE")
                self.log("File settings content: %s", jsonData, level="INFO")

        except FileNotFoundError:
            self.log("File settings not found", level="WARNING")

    def __updateSensors(self, userSettings, functionSettings):

        for key in userSettings:
            for entity in userSettings[key]:
                domain = self.getEntityDomain(entity)
                attributes = self.get_state(
                    domain+entity, attribute="attributes")
                self.set_state(
                    domain+entity, state=userSettings[key][entity], attributes=attributes)

        for entity in functionSettings:
            entityName = self.toSnakeCase(entity)
            state = ("off", "on")[functionSettings[entity] == "true"]
            self.set_state("input_boolean."+entityName, state=state)

    def getEntityDomain(self, entity):

        if "rollers" in entity or "heating" in entity:
            domain = "input_number."
        elif "zn" in entity:
            domain = "input_text."
        elif "offset_sunset" in entity:
            domain = "input_datetime."
        elif "scene" in entity or "light_type" in entity:
            domain = "input_select."

        return domain

    def copyPrograms(self, event_name, data, kwargs):

        progId = data["program"][-1]
        last_change = ["", datetime.min]
        days = ["monday", "tuesday", "wednesday",
                "thursday", "friday", "saturday", "sunday"]
        self.turn_off("input_boolean.copy_program{}".format(progId))

        self.log("Copying program %s schedule", progId, level="INFO")

        for day in days:
            ont, offset = self.get_state("input_datetime.thermostat_{}_on_period{}".format(
                day, progId), attribute="last_changed").split("+")
            ont = ont.split(".")[0]
            offset = int(offset[:2])
            ont = datetime.strptime(
                ont, "%Y-%m-%dT%H:%M:%S") - timedelta(hours=offset)

            offt, offset = self.get_state("input_datetime.thermostat_{}_off_period{}".format(
                day, progId), attribute="last_changed").split("+")
            offt = offt.split(".")[0]
            offset = int(offset[:2])
            offt = datetime.strptime(
                offt, "%Y-%m-%dT%H:%M:%S") - timedelta(hours=offset)

            if ont > last_change[1]:
                last_change[1] = ont
                last_change[0] = day
            if offt > last_change[1]:
                last_change[1] = offt
                last_change[0] = day

        on_time = self.get_state("input_datetime.thermostat_{}_on_period{}".format(
            last_change[0], progId), attribute="all")
        on_time_state = on_time.pop("state")
        off_time = self.get_state("input_datetime.thermostat_{}_off_period{}".format(
            last_change[0], progId), attribute="all")
        off_time_state = off_time.pop("state")

        self.log("Setting all program as %s's schedule",
                 last_change[0], level="INFO")
        self.log("Setting all program timers to:\nStart: %s\nEnd: %s",
                 on_time_state, off_time_state, level="INFO")

        for day in days:
            self.set_state("input_datetime.thermostat_{}_on_period{}".format(
                day, progId), state=on_time_state, attributes=on_time["attributes"])
            self.set_state("input_datetime.thermostat_{}_off_period{}".format(
                day, progId), state=off_time_state, attributes=off_time["attributes"])

    def __systemKeySync(self, event_name, data, kwargs):

        self.log("Requesting key to cloud", level="INFO")
        systemCode = self.get_state("input_text.system_code")

        eventData = {
            "eventType": "SYSTEM_KEY_SYNC",
            "sender": systemCode,
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
