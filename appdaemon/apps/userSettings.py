import hassapi as hass
import json

file="/home/pi/workspace/usersettings.json"

class UserSettings(hass.Hass):

    def initialize(self):
        self.listen_event(self.setting, "AD_SETTINGS_SYNCH")
        self.listen_event(self.restoreSettings, "AD_SETTINGS_RESTORE")
        self.listen_event(self.remoteRestoreRequest, "AD_SETTINGS_REMOTE_RESTORE_REQUEST")
        self.listen_event(self.remoteRestore, "AD_SETTINGS_REMOTE_RESTORE")
    
    def setting(self, event_name, data, kwargs):
        self.log("Retrieving user settings")
        
        userSettings={}
        attributes={}

        systemCode       = self.get_state("input_text.system_code")
        userSettingsList = self.get_state("group.kairoshub_settings", attribute="entity_id")

        for entity in userSettingsList:
            attributes=self.get_state(entity,attribute="all").get("attributes",{})
            attributes["state"]=self.get_state(entity)
            userSettings[entity]=attributes
        
        self.log("user settings: %s",userSettings)
        
        with open(file,"w") as f:
            json.dump(userSettings,f)

        mjson= {
            "eventType" : "TECHNICAL",
            "systemCode": systemCode,
            "platform"  : "HASSIO_EVENT",
            "message"   : "USER SETTINGS",
            "technicalMessage": userSettings
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="HASSIO_SETTINGS", message=mjson)
            
    def restoreSettings(self, event_name, data, kwargs):

        userSettings={}

        self.log("Retrieving user settings")
        with open(file) as f:
            userSettings=json.load(f)

        for entity in userSettings:
            self.set_state(entity,state=userSettings[entity].pop("state"),attributes=userSettings[entity])
        
        self.log("User settings restored")

    def remoteRestoreRequest(self, event_name, data, kwargs):

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="HASSIO_USER_SETTINGS", message="SETTINGS_RESTORE_REQUEST")

    def remoteRestore(self, event_name, data, kwargs):

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="HASSIO_USER_SETTINGS", message="usersettings.json")

