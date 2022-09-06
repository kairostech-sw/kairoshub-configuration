from email import message
import hassapi as hass


class KairoshubEvent(hass.Hass):

    def initialize(self):
        self.listen_event(self.ha_event, "INBOUND_EVENT")

    def ha_event(self, event_name, data, kwargs):    

        event = data["data"]["eventType"]
        
        if "SETTINGS" in event: 
            self.fire_event("AD_"+ event, data=data)
        else: 
            self.log(event)