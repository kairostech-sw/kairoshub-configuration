import hassapi as hass


class Notification(hass.Hass):

    def initialize(self):
        self.listen_event(self.notification, "AD_KAIROSHUB_NOTIFICATION")


    def notification(self, event_name, data, kwargs):
        ncode=data["ncode"]
        notification_type=data["type"]
        if ncode =="HEATING_SENSOR_BATTERY_LOW":
            self.heatingSensorLowBattery(data)
        self.log("Sending the notification", level="INFO")

    def heatingSensorLowBattery(self, data):
        entity= data["entity"].split(".")[1].split("_")[0].upper()
        self.notify("{} battery is low".format(entity), name="persistent_notification")