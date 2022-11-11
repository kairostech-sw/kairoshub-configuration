import json
import hassapi as hass

KAIROSHUB_SYSTEM_CODE               = "input_text.system_code"
file="./kairoshubNotification.json"
noty_message={
    "HEATING_ON":"Riscaldamento acceso.",
    "HEATING_VALVES_CLOSED":"Non si sono aperte correttamente le valvolve dei termosifoni.",
    "HEATING_OFF":"Riscaldamento spento.",
    "HEATING_OFF_ERROR":"La caldaia non si è spenta correttamente."   
}

class Notification(hass.Hass):

    systemCode = None
    cloudTopic = "HASSIO"

    def initialize(self):
        self.listen_event(self.notification, "AD_KAIROSHUB_NOTIFICATION")
        self.listen_event(self.pushMessage, "AD_NOTIFICATION_SYNC")

    def notification(self, event_name, data, kwargs):

        ncode=data["ncode"]
        sender = data["sender"] if "sender" in data and "" != data["sender"] else "HUB"
        notification_type=data["type"]

        notificationToSend = self.buildNotification(type=notification_type, sender=sender, code=ncode)

        self.dispatchNotification(notificationToSend)


    def buildNotification(self, type, sender, code):
        if None == self.systemCode:
            self.systemCode	= self.get_state(KAIROSHUB_SYSTEM_CODE)
        message = self.getMessage(type, sender, code)
        self.log("Notification message: %s", message, level="INFO")
        noty = {
            "eventType" : type,
            "systemCode": self.systemCode,
            "sender": sender,
            "message"   : message,
        }

        return noty

    def dispatchNotification(self, notificationToSend):

        if notificationToSend["sender"] == "HUB":
            self.log("hub notification placeholer")
        elif notificationToSend["sender"] == "*" or notificationToSend["sender"] != "":
            self.log("hub notification placeholer") 

            self.log("Producing notification message on topic: %s message: %s", self.systemCode, notificationToSend)
            self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic=self.cloudTopic, message=notificationToSend)

    def getMessage(self, type, sender, code):
        
        try:
            with open(file) as f:
                jsonData=json.load(f)
            return jsonData[code]
        except FileNotFoundError:
            self.log("File not found", level="WARNING")
            self.log("Requesting notification message file to the cloud", level="INFO")
            # eventData = {
            #     "eventType" : "NOTIFICATION_MESSAGE_REQ",
            #     "sender" : self.systemCode,
            #     "message" : "NOTIFICATION MESSAGE REQUEST"
            # } 
            
            # self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)
            with open(file, "w+") as f:
                json.dump(noty_message, f)
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=sender, ncode=code, type=type)
        except Exception:
            raise

    def pushMessage(self, event_name, data, kwargs):
        
        self.log("Pushing message file", level="INFO")
        jsonData=data["data"]["technicalMessage"]

        try:
            with open(file, "w+") as f:
                json.dump(jsonData, f)
        except Exception:
            raise

        self.log("File pushed", level="INFO")