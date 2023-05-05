import hassapi as hass

class KairoshubEvent(hass.Hass):

    def initialize(self):
        self.listen_event(self.ha_event, "INBOUND_EVENT")

    def ha_event(self, event_name, data, kwargs):

        eventType = None
        try:
            eventType = data["eventType"]
            sender = data["sender"] if "sender" in data else ""
            eventValue = data["eventValue"] if "eventValue" in data else ""

            event = {
                "eventType": eventType,
                "sender": sender
            }

            if "SETTINGS" in eventType:
                self.fire_event("AD_"+ eventType, data=data)

            if "HEATING_COMMAND_ON" in eventType:
                self.fire_event("AD_HEATING_ON", data={"program": "prog0", "event": event})

            if "HEATING_COMMAND_OFF" in eventType:
                self.fire_event("AD_HEATING_OFF", data={"program": "prog0", "event": event})

            # controlla stato di attivazione o avvia il programma?
            if "HEATING_PROGRAM_COMMAND_ON" in eventType:
                self.turn_on(f"input_boolean.heater_program{eventValue}")

            if "HEATING_PROGRAM_COMMAND_OFF" in eventType:
                self.turn_off(f"input_boolean.heater_program{eventValue}")

            if "LIGHTS_COMMAND_ON" in eventType:
                self.fire_event("AD_LIGHTS_ON", data=event)

            if "LIGHTS_COMMAND_OFF" in eventType:
                self.fire_event("AD_LIGHTS_OFF", data=event)

            if "ATHOME_COMMAND_ON" in eventType:
                self.turn_on("input_boolean.at_home")

            if "ATHOME_COMMAND_OFF" in eventType:
                self.turn_off("input_boolean.at_home")

            if "SCENE_COMMAND_ACTIVATE" in eventType:
                self.fire_event("AD_SCENES_DAY_NIGHT", data={"state":eventValue, "sender": event["sender"], "mode": "Manuale"})

            if "ASSISTANCE_COMMAND_ON" in eventType:
                self.fire_event("HA_ASSSISTANCE_ON")

            if "ASSISTANCE_COMMAND_OFF" in eventType:
                self.fire_event("HA_ASSSISTANCE_OFF")

            if "ROLLERS_ATHOME_POSITION" in eventType:
                self.fire_event("AD_SET_ROLLERS_POS", data={"mode": "athome", "event": event })

            if "ROLLERS_NOTATHOME_POSITION" in eventType:
                self.fire_event("AD_SET_ROLLERS_POS",  data={"mode": "notathome", "event": event })

            if "SYSTEM_KEY_PUSH" in eventType:
                self.fire_event("AD_SETTING_SYSTEM_KEY_PUSH", data=data)

            if "DEVICE_INSTALLED" in eventType:
                self.fire_event("AD_DEVICE_INSTALLED", data=data)

            if "RECALIBRATE" in eventType:
                self.fire_event("AD_"+eventType)

        except Exception as e:
            self.log(e, level="ERROR")
        finally:
            self.log("Event name: %s, event data: %s", eventType, data)
