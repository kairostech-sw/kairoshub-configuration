import hassapi as hass


class KairoshubEvent(hass.Hass):

    def initialize(self):
        self.listen_event(self.ha_event, "INBOUND_EVENT")

    def ha_event(self, event_name, data, kwargs):

        eventType = None
        try:
            eventType, event = self.getEventData(data)

            if "SETTINGS" in eventType:
                self.fire_event("AD_" + eventType, data=data)

            if "HEATING_COMMAND_ON" in eventType:
                self.fire_event("AD_HEATING_ON", data={
                                "program": 0, **event})

            if "HEATING_COMMAND_OFF" in eventType:
                self.fire_event("AD_HEATING_OFF", data={
                                "program": 0, **event})

            if "HEATING_PROGRAM_COMMAND_ON" in eventType:
                self.turn_on(f"input_boolean.heater_program{event['eventValue'][-1]}")

            if "HEATING_PROGRAM_COMMAND_OFF" in eventType:
                self.turn_off(f"input_boolean.heater_program{event['eventValue'][-1]}")

            if "LIGHTS_COMMAND_ON" in eventType:
                self.fire_event("AD_LIGHTS_ON", data={**event})

            if "LIGHTS_COMMAND_OFF" in eventType:
                self.fire_event("AD_LIGHTS_OFF", data={**event})

            if "ATHOME_COMMAND_ON" in eventType:
                self.turn_on("input_boolean.at_home")

            if "ATHOME_COMMAND_OFF" in eventType:
                self.turn_off("input_boolean.at_home")

            if "SCENE_COMMAND_ACTIVATE" in eventType:
                eventData = {
                    "mode": "Manuale",
                    **event
                }
                self.fire_event("AD_SCENES_DAY_NIGHT", data=eventData)

            if "ASSISTANCE_COMMAND_ON" in eventType:
                self.fire_event("HA_ASSSISTANCE_ON")

            if "ASSISTANCE_COMMAND_OFF" in eventType:
                self.fire_event("HA_ASSSISTANCE_OFF")

            if "ROLLERS_ATHOME_POSITION" in eventType:
                self.fire_event("AD_SET_ROLLERS_POS", data={
                                "mode": "athome", **event})

            if "ROLLERS_NOTATHOME_POSITION" in eventType:
                self.fire_event("AD_SET_ROLLERS_POS",  data={
                                "mode": "notathome", **event})

            if "SYSTEM_KEY_PUSH" in eventType:
                self.fire_event("AD_SETTING_SYSTEM_KEY_PUSH", data=data)

            if "DEVICE_INSTALLED" in eventType:
                self.fire_event("AD_DEVICE_INSTALLED", data=data)

            if "RECALIBRATE" in eventType:
                self.fire_event("AD_"+eventType)

            if "ALEXA" in eventType:
                self.fire_event("AD_"+eventType,
                                data=data["technicalMessage"])
        except Exception as e:
            self.log(e, level="ERROR")
        finally:
            self.log("Event name: %s, event data: %s", eventType, data)

    def getEventData(self, data):
        eventType = data["eventType"]
        sender = data["sender"] if "sender" in data else ""
        eventValue = data["eventValue"] if "eventValue" in data else ""
        trid = data["trid"] if "trid" in data else ""

        event = {
            "eventType": eventType,
            "sender": sender,
            "trid": trid,
            "eventValue": eventValue
        }

        return eventType, event
