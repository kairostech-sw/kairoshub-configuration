import hassapi as hass

#
# Hello World App
#
# Args:
#


class HelloWorld(hass.Hass):
    def initialize(self):
        self.listen_event(self.ha_event, "HA_STARTUP_COMPLETE")

    def ha_event(self, event_name, data, kwargs):    
        self.log("Hello from AppDaemon")
        self.log("You are now ready to run Apps!")
        