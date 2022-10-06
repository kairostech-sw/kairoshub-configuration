import hassapi as hass


class Notification(hass.Hass):

    def initialize(self):
        self.listen_event(self.notification, "AD_KAIROSHUB_NOTIFICATION")


    def notification(self, event_name, data, kwargs):

        entity=data["entity"]
        ncode=data["ncode"]
        notification_type=data["type"]
        self.log("Sending the notification", level="INFO")
        entity=entity.split(".")[1].split("_")[0].upper()
        self.notify("{} battery is low".format(entity), name="persistent_notification")