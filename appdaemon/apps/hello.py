import hassapi as hass
from datetime import datetime

KAIROSHUB_STATE_ENTITY               = "sensor.system_state"
KAIROSHUB_STATE_DETAIL_ENTITY        = "sensor.system_state_detail"
KAIROSHUB_SW_VERSION                 = "sensor.kairoshub_sw_version"
KAIROSHUB_SW_LAST_CHECK              = "sensor.kairoshub_sw_last_check"
KAIROSHUB_CONFIGURATION_SW_VERSION   = "sensor.hakairos_configuration_sw_version"
KAIROSHUB_CONFIGURATION_SW_LAST_CHECK= "sensor.hakairos_configuration_sw_last_check"
KAIROSHUB_SSID                       = "sensor.kairoshub_ssid"
KAIROSHUB_SIGNAL                     = "sensor.kairoshub_signal"
KAIROSHUB_IP_ADDR                    = "sensor.kairoshub_ip_address"
KAIROSHUB_SYSTEM_OWNER               = "input_text.system_name"
KAIROSHUB_SYSTEM_CODE                = "input_text.system_code"
KAIROSHUB_SYSTEM_KEY                 = "input_text.system_key"

class HelloWorld(hass.Hass):
    def initialize(self):
        self.listen_event(self.ha_event, "AD_KAIROSHUB_STARTED")

    def ha_event(self, event_name, data, kwargs):
        self.log("Hello from kairosHUB!")

        self.log("Retrieving data from software manifest..")

        hassState       = {}

        mqttSystemCode = self.get_state("sensor.kairoshub_system_code")
        mqttSystemOwner = self.get_state("sensor.kairoshub_owner")

        currentSystemCode = self.get_state(KAIROSHUB_SYSTEM_CODE)
        currentSystemOwner = self.get_state(KAIROSHUB_SYSTEM_OWNER)
        currentSystemKey = self.get_state(KAIROSHUB_SYSTEM_KEY)

        # HOTFIX recupero impianti installati
        if not currentSystemCode.startswith("H") and (mqttSystemCode == "" or mqttSystemCode == "unknown" or mqttSystemCode == "undefined") :
            self.log("ERROR, system code not valid!! falling back into mainteneance mode",level="ERROR")
            self.fire_event("HA_ASSSISTANCE_ON")
            return

        if "unknown" == mqttSystemCode and currentSystemCode != "" and currentSystemCode.startswith("H"):
            self.log("Setting system code value on mqtt")
            self.fire_event("AD_MQTT_PUBLISH",topic="kairostech/system_code",payload=currentSystemCode)

        if "unknown" != mqttSystemCode and currentSystemCode != mqttSystemCode:
            self.log("Setting new system code value")
            self.set_state(KAIROSHUB_SYSTEM_CODE, state=mqttSystemCode.upper())

        if "unknown" == mqttSystemOwner and currentSystemOwner != "":
            self.log("Setting system owner value on mqtt")
            self.fire_event("AD_MQTT_PUBLISH",topic="kairostech/owner",payload=currentSystemOwner)

        if "unknown" != mqttSystemOwner and currentSystemOwner != mqttSystemOwner:
            self.log("Setting new system owner value")
            self.set_state(KAIROSHUB_SYSTEM_OWNER, state=mqttSystemOwner)

        if not currentSystemKey.isnumeric() or len(currentSystemKey) != 6:
            self.log("System key is invalid", level="WARNING")
            self.fire_event("AD_SETTINGS_SYSTEM_KEY_SYNC")

        systemCode	= self.get_state(KAIROSHUB_SYSTEM_CODE)
        systemOwner	= self.get_state(KAIROSHUB_SYSTEM_OWNER)

        state           = self.get_state(KAIROSHUB_STATE_ENTITY)
        stateDetail     = self.get_state(KAIROSHUB_STATE_DETAIL_ENTITY)
        khSwVersion     = self.get_state(KAIROSHUB_SW_VERSION)
        khSwLastCheck   = self.get_state(KAIROSHUB_SW_LAST_CHECK)
        khConfSwLastCheck   = self.get_state(KAIROSHUB_CONFIGURATION_SW_LAST_CHECK)
        khConfSwVersion     = self.get_state(KAIROSHUB_CONFIGURATION_SW_VERSION)
        ssid = self.get_state(KAIROSHUB_SSID)
        signal = self.get_state(KAIROSHUB_SIGNAL)
        ip = self.get_state(KAIROSHUB_IP_ADDR)

        hassState["state"] = state
        hassState["stateDetail"] = stateDetail
        hassState["kairoshub_version"] = khSwVersion
        hassState["kairoshub_last_software_check"] = khSwLastCheck
        hassState["kairoshub_configuration_version"] = khConfSwVersion
        hassState["kairoshub_configuration_last_software_check"] = khConfSwLastCheck
        hassState["system_owner"] = systemOwner
        hassState["system_id"] = systemCode
        hassState["ssid"] = ssid
        hassState["rssi"] = signal
        hassState["ip"] = ip

        if state=="MAINTENEANCE":
            self.turn_on("input_boolean.assistance_request")
            self.log("Restoring Assistance Button state. state: on",level="INFO")
            self.fire_event("HA_ASSSISTANCE_ON")
        else:
            self.turn_off("input_boolean.assistance_request")
            self.log("Restoring Assistance Button state. state: off",level="INFO")

        self.log("Retrieved global state for the application. state: %s", hassState, level="INFO")

        hassCopy = hassState.copy()
        state = hassCopy.pop("state")
        hassCopy["version"] = hassCopy["kairoshub_version"]+"#"+ hassCopy["kairoshub_configuration_version"]
        self.set_state("sensor.kairos_home_state", state=state, attributes=hassCopy)

        eventData = {
            "eventType" : "HELLO",
            "systemCode": systemCode,
            "message"   : "HELLO!",
            "technicalMessage": hassState
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)
        self.fire_event("AD_SETTINGS_RESTORE")
        self.call_service("frontend/reload_themes")
        deviceRequest = {
            "eventType": "DEVICE_REQ",
            "systemCode": systemCode,
            "message": "DEVICE REQ",
            "timestamp": datetime.strptime(self.get_state("sensor.date_time_iso"),"%Y-%m-%dT%H:%M:%S")
        }
        self.log("Requesting installed devices", level="INFO")
        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=deviceRequest)