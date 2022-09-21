from email import message
import hassapi as hass


class KairoshubEvent(hass.Hass):

    def initialize(self):
        self.listen_event(self.ha_event, "INBOUND_EVENT")

    def ha_event(self, event_name, data, kwargs):    

        event = None
        try:
            event = data["eventType"]

            if "SETTINGS" in event: 
                self.fire_event("AD_"+ event, data=data)
           
        except Exception as e:
            self.log(e, level="ERROR")
        finally:
            self.log("Event name: %s, event data: %s", event, data)
        