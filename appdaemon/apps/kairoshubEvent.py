import hassapi as hass

class KairoshubEvent(hass.Hass):

    def initialize(self):
        self.listen_event(self.ha_event, "INBOUND_EVENT")

    def ha_event(self, event_name, data, kwargs):

        eventType = None
        try:
            eventType = data["eventType"]
            sender = data["sender"] if "sender" in data else ""

            event = {
                "eventType": eventType,
                "sender": sender
            }

            if "SETTINGS" in eventType:
                self.fire_event("AD_"+ eventType, data=data)

            if "HEATING_COMMAND_OFF" in eventType:
                self.fire_event("AD_HEATING", data={"program": "prog0", "event": event})

            if "HEATING_COMMAND_ON" in eventType:
                self.fire_event("AD_HEATING", data={"program": "prog0", "event": event})

            if "ASSISTANCE_COMMAND_ON" in eventType:
                self.fire_event("HA_ASSSISTANCE_ON")

            if "ASSISTANCE_COMMAND_OFF" in eventType:
                self.fire_event("HA_ASSSISTANCE_OFF")

            if "ROLLERS_ATHOME_POSITION" in eventType:
                self.fire_event("HA_ROLLERS_ATHOME_POSITION")

            if "ROLLERS_NOTATHOME_POSITION" in eventType:
                self.fire_event("HA_ROLLERS_NOTATHOME_POSITION")

            if "SYSTEM_KEY_PUSH" in eventType:
                self.fire_event("AD_SETTING_SYSTEM_KEY_PUSH")

        except Exception as e:
            self.log(e, level="ERROR")
        finally:
            self.log("Event name: %s, event data: %s", eventType, data)
