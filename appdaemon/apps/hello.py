import hassapi as hass

KAIROSHUB_STATE_ENTITY              = "sensor.system_state"
KAIROSHUB_STATE_DETAIL_ENTITY       = "sensor.system_state_detail"
KAIROSHUB_SW_VERSION                = "sensor.kairoshub_sw_version"
KAIROSHUB_SW_LAST_CHECK             = "sensor.kairoshub_sw_last_check"
KAIROSHUB_CONFIGURATION_SW_VERSION   = "sensor.hakairos_configuration_sw_version"
KAIROSHUB_CONFIGURATION_SW_LAST_CHECK= "sensor.hakairos_configuration_sw_last_check"

class HelloWorld(hass.Hass):
    def initialize(self):
        self.listen_event(self.ha_event, "AD_KAIROSHUB_STARTED")

    def ha_event(self, event_name, data, kwargs):    
        self.log("Hello from AppDaemon")
        self.log("You are now ready to run Apps!")

        self.log("Retrieving data from software manifest")

        hassState       = {}

        systemCode      = self.get_state("input_text.system_code")
        state           = self.get_state(KAIROSHUB_STATE_ENTITY)
        stateDetail     = self.get_state(KAIROSHUB_STATE_DETAIL_ENTITY)
        khSwVersion     = self.get_state(KAIROSHUB_SW_VERSION)
        khSwLastCheck   = self.get_state(KAIROSHUB_SW_LAST_CHECK)
        khConfSwLastCheck   = self.get_state(KAIROSHUB_CONFIGURATION_SW_LAST_CHECK)
        khConfSwVersion     = self.get_state(KAIROSHUB_CONFIGURATION_SW_VERSION)

        hassState["state"] = state
        hassState["stateDetail"] = stateDetail
        hassState["kairoshub_version"] = khSwVersion
        hassState["kairoshub_last_software_check"] = khSwLastCheck
        hassState["kairoshub_configuration_version"] = khConfSwVersion
        hassState["kairoshub_configuration_last_software_check"] = khConfSwLastCheck 

        self.log("Retrieved global state for the application. state: %s", hassState, level="INFO")

        eventData = {
            "eventType" : "TECHNICAL",
            "systemCode": systemCode,
            "platform"  : "HASSIO_EVENT",
            "message"   : "HELLO",
            "technicalMessage": hassState
        }
       
        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="HASSIO", message=eventData)
        