import hassapi as hass

KAIROSHUB_STATE_ENTITY              = "sensor.system_state"
KAIROSHUB_STATE_DETAIL_ENTITY       = "sensor.system_state_detail"
KAIROSHUB_SW_VERSION                = "sensor.kairoshub_sw_version"
KAIROSHUB_SW_LAST_CHECK             = "sensor.kairoshub_sw_last_check"
KAIROSHUB_CONFIGURATION_SW_VERSION   = "sensor.hakairos_configuration_sw_version"
KAIROSHUB_CONFIGURATION_SW_LAST_CHECK= "sensor.hakairos_configuration_sw_last_check"
KAIROSHUB_SYSTEM_OWNER               = "input_text.system_name"

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
        systemOwner         = self.get_state(KAIROSHUB_SYSTEM_OWNER)
        assistanceAttributes = self.get_state("input_boolean.assistance_request",attribute="all").get("attributes",{})

        hassState["state"] = state
        hassState["stateDetail"] = stateDetail
        hassState["kairoshub_version"] = khSwVersion
        hassState["kairoshub_last_software_check"] = khSwLastCheck
        hassState["kairoshub_configuration_version"] = khConfSwVersion
        hassState["kairoshub_configuration_last_software_check"] = khConfSwLastCheck
        hassState["system_owner"] = systemOwner
        hassState["system_id"] = systemCode   

        if state=="MAINTENEANCE":
            self.set_state("input_boolean.assistance_request",state='on', attributes=assistanceAttributes)
            self.log("Restoring Assistance Button state. state: on",level="INFO")
        else:
            self.set_state("input_boolean.assistance_request",state='off', attributes=assistanceAttributes)
            self.log("Restoring Assistance Button state. state: off",level="INFO")
        
        self.log("Retrieved global state for the application. state: %s", hassState, level="INFO")

        eventData = {
            "eventType" : "TECHNICAL",
            "systemCode": systemCode,
            "platform"  : "HASSIO_EVENT",
            "message"   : "HELLO",
            "technicalMessage": hassState
        }
       
        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="HASSIO", message=eventData)
        