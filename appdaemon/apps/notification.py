import json
import hassapi as hass

KAIROSHUB_SYSTEM_CODE               = "input_text.system_code"
file="./kairoshubNotification.json"
noty_message={
    "HEATING_ON":"Impianto di riscaldamento acceso correttamente.",
    "HEATING_ON_ERROR":"Si è verificato un problema nell'accensione dell'impianto di riscaldamento. Verifica l'accensione della caldaia, se il problema persiste contattare l'assistenza.",
    "HEATING_VALVES_CLOSED":"Sembra che le teste termostatiche dei termosifoni non siano raggiungibili dall'impianto. Verificare la carica delle teste, se cariche e il problema persiste contattare l'assistenza.",
    "HEATING_OFF":"Impianto di riscaldamento spento correttamente.",
    "HEATING_OFF_ERROR":"Si è verificato un problema nello spegnimento dell'impianto di riscaldamento. Verifica l'accensione della caldaia, se il problema persiste contattare l'assistenza.",
    "HEATING_SENSOR_BATTERY_LOW": "La testa termostatica #ENTITY# si sta scaricando. Collegala ad un carica batterie oppure ad una Powerbank. \n\nPuoi ricoscere la testa termostatica dal nome applicato nella parte sottostante.",
    "TH_SENSOR_BATTERY_LOW": "Il sensore della temperatura e umidità #ENTITY# si sta scaricando. Sostituire le pile nel retro del sensore. \n\nPuoi ricoscere il sensore dal nome applicato nella parte retrostante.",
    "ROLLERS_OPENED": "Le tapparelle sono state aperte correttamente.",
    "ROLLERS_CLOSED": "Le tapparelle sono state chiuse correttamente."
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
        severity=data["severity"]
        entity_id = data["entity"] if "entity" in data else None

        notificationToSend = self.buildNotification(severity=severity, sender=sender, code=ncode, entityRef=entity_id)

        self.dispatchNotification(notificationToSend)


    def buildNotification(self, severity, sender, code, entityRef):
        if None == self.systemCode:
            self.systemCode	= self.get_state(KAIROSHUB_SYSTEM_CODE)
        message = self.getMessage(code, entityRef)
        noty = {
            "eventType" : code.upper(),
            "severity"  : severity.upper(),
            "systemCode": self.systemCode,
            "sender": sender,
            "message"   : message,
        }
        self.log("Notification : %s", noty, level="DEBUG")
        return noty

    def dispatchNotification(self, notificationToSend):

        if notificationToSend["sender"] == "HUB":
            self.log("hub notification placeholer")
        elif notificationToSend["sender"] == "*" or notificationToSend["sender"] != "":
            self.log("hub notification placeholer")

            #removing attributes
            notificationToSend.pop("severity", None)
            self.log("Producing notification message on topic: %s message: %s", self.cloudTopic, notificationToSend)
            self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic=self.cloudTopic, message=notificationToSend)

            #TODO: valutare se spostare nella funzione principale al fine di inviare sempre un aggiornamento
            self.fire_event("AD_ENTITY_METRICS")

    def getMessage(self, code, entityRef):
        message = noty_message[code]

        if not message == "":
            if "#ENTITY#" in message and entityRef != "":
                entityName = self.get_state(entityRef, attribute = 'friendly_name')
                if "_battery" in entityName:
                    entityName= entityName.replace("_battery", "")

                return message.replace("#ENTITY#", entityName)
            else:
                return message
        else:
            raise Exception("message not found")

        # try:
        #     with open(file) as f:
        #         jsonData=json.load(f)
        #     return jsonData[code]
        # except FileNotFoundError:
        #     self.log("File not found", level="WARNING")
        #     self.log("Requesting notification message file to the cloud", level="INFO")
        #     # eventData = {
        #     #     "eventType" : "NOTIFICATION_MESSAGE_REQ",
        #     #     "sender" : self.systemCode,
        #     #     "message" : "NOTIFICATION MESSAGE REQUEST"
        #     # }

        #     # self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)
        #     with open(file, "w+") as f:
        #         json.dump(noty_message, f)
        #     self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=sender, ncode=code, type=type)
        # except Exception:
        #     raise

    def pushMessage(self, event_name, data, kwargs):
        self.log("Pushing message file", level="INFO")
        jsonData=data["data"]["technicalMessage"]

        try:
            with open(file, "w+") as f:
                json.dump(jsonData, f)
        except Exception:
            raise

        self.log("File pushed", level="INFO")