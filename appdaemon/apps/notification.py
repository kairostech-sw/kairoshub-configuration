import json
import hassapi as hass

KAIROSHUB_SYSTEM_CODE               = "input_text.system_code"
file="./kairoshubNotification.json"
noty_message={
  "HEATING_ON":{
    "label": "Riscaldamento Acceso",
    "message":"Impianto di riscaldamento acceso correttamente."
  },
  "HEATING_ON_ERROR":{
    "label": "Errore Riscaldamento",
    "message":"Si è verificato un problema nell'accensione dell'impianto di riscaldamento. Verifica l'accensione della caldaia, se il problema persiste contattare l'assistenza."
  },
  "HEATING_VALVES_CLOSED":{
    "label": "Errore Valvole",
    "message":"Sembra che le teste termostatiche dei termosifoni non siano raggiungibili dall'impianto. Verificare la carica delle teste, se cariche e il problema persiste contattare l'assistenza."
    },
  "HEATING_OFF":{
    "label": "Riscaldamento Spento",
    "message":"Impianto di riscaldamento spento correttamente."
    },
  "HEATING_OFF_ERROR":{
    "label": "Errore Riscaldamento",
    "message":"Si è verificato un problema nello spegnimento dell'impianto di riscaldamento. Verifica l'accensione della caldaia, se il problema persiste contattare l'assistenza."
    },
  "HEATING_SENSOR_BATTERY_LOW": {
    "label": "Batteria Quasi Scarica Testa Termostatica #ENTITY#",
    "message":"La testa termostatica #ENTITY# si sta scaricando. Collegala ad un carica batterie oppure ad una Powerbank. \n\nPuoi ricoscere la testa termostatica dal nome applicato nella parte sottostante."
    },
  "TH_SENSOR_BATTERY_LOW": {
    "label": "Batteria Quasi Scarica Sensore Umidità #ENTITY#",
    "message":"Il sensore della temperatura e umidità #ENTITY# si sta scaricando. Sostituire le pile nel retro del sensore. \n\nPuoi ricoscere il sensore dal nome applicato nella parte retrostante."
    },
  "ROLLERS_OPENED": {
    "label": "Tapparelle Aperte",
    "message":"Le tapparelle sono state aperte correttamente."
    },
  "ROLLERS_CLOSED": {
    "label": "Tapparelle Chiuse",
    "message":"Le tapparelle sono state chiuse correttamente."
    },
  "LIGHTS_ON": {
    "label": "Luci Accese",
    "message": "Le luci sono state accese correttamente."
  },
  "LIGHTS_OFF": {
    "label": "Luci Spente",
    "message": "Le luci sono state spente correttamente."
  },
  "SCENE_NIGHT_ON": {
    "label": "Scenario Notte",
    "message": "Lo scenario Notte è ora attivo."
  },
  "SCENE_NIGHT_OFF": {
    "label": "Scenario Notte",
    "message": "Lo scenario Notte non è più attivo."
  },
  "SCENE_DAY_ON": {
    "label": "Scenario Giorno",
    "message": "Lo scenario Giorno è ora attivo"
  },
  "SCENE_DAY_OFF": {
    "label": "Scenario Giorno",
    "message": "Lo scenario Giorno non è più attivo"
  }
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

        self.sendHubNotification(notificationToSend)
        if notificationToSend["sender"] == "*" or notificationToSend["sender"] != "" or notificationToSend["sender"] != "HUB":

            #removing attributes
            notificationToSend.pop("severity", None)
            self.log("Producing notification message on topic: %s message: %s", self.cloudTopic, notificationToSend)
            self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic=self.cloudTopic, message=notificationToSend)

            #TODO: valutare se spostare nella funzione principale al fine di inviare sempre un aggiornamento
            self.fire_event("AD_ENTITY_METRICS")

    def getMessage(self, code, entityRef):

        message = noty_message[code]["message"]

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

        try:
            jsonData=data["data"]["technicalMessage"]
            with open(file, "w+") as f:
                json.dump(jsonData, f)
        except FileNotFoundError:
            self.log("File not found", level="WARNING")
        #     self.log("Requesting notification message file to the cloud", level="INFO")
        #     # eventData = {
        #     #     "eventType" : "NOTIFICATION_MESSAGE_REQ",
        #     #     "sender" : self.systemCode,
        #     #     "message" : "NOTIFICATION MESSAGE REQUEST"
        #     # }

        #     # self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)
        except Exception:
            raise

        self.log("File pushed", level="INFO")

    def sendHubNotification(self, notification):
        self.log("Sending HUB notification")
        self.log(notification)
        code = notification["eventType"]
        label = noty_message[code]["label"]

        self.set_state("input_text.notify", state=label)
        self.turn_on("input_boolean.notification_to_read")