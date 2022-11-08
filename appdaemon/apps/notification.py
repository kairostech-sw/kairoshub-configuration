import hassapi as hass


KAIROSHUB_SYSTEM_CODE               = "input_text.system_code"


class Notification(hass.Hass):

    systemCode = None
    cloudTopic = "HASSIO"

    def initialize(self):
        self.listen_event(self.notification, "AD_KAIROSHUB_NOTIFICATION")

    def notification(self, event_name, data, kwargs):

        self.log(data)
        # entity=data["entity"]
        ncode=data["ncode"]
        sender = data["sender"] if "sender" in data and "" != data["sender"] else "HUB"
        notification_type=data["type"]

        notificationToSend = self.buildNotification(type=notification_type, sender=sender, code=ncode)

        self.dispatchNotification(notificationToSend)

        # self.log("Sending the notification", level="INFO")
        # entity=entity.split(".")[1].split("_")[0].upper()
        # self.notify("{} battery is low".format(entity), name="persistent_notification")



    def buildNotification(self, type, sender, code):
        if None == self.systemCode:
            self.systemCode	= self.get_state(KAIROSHUB_SYSTEM_CODE)
        
        noty = {
            "eventType" : type,
            "systemCode": self.systemCode,
            "sender": sender,
            "message"   : code, #TOOD: DA MODIFICARE CON ETICHETTA
        }

        return noty

    def dispatchNotification(self, notificationToSend):

        if notificationToSend["sender"] == "HUB":
            self.log("hub notification placeholer")
        elif notificationToSend["sender"] == "*" or notificationToSend["sender"] != "":
            self.log("hub notification placeholer") 

            self.log("Producing notification message on topic: %s message: %s", self.systemCode, notificationToSend)
            self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic=self.cloudTopic, message=notificationToSend)