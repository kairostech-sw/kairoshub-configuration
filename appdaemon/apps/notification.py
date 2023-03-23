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
  "HEATING_TEMP_REACHED":{
   "label": "Riscaldamento non acceso",
   "message": "Il riscaldamento non è stato acceso perché la temperatura è già superiore a quella impostata."
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
  "ROLLERS_OPENED_ERROR": {
  "label": "Errore Tapparelle",
  "message":"Si è verificato un problema nell'apertura delle tapparelle."
  },
  "ROLLERS_CLOSED": {
    "label": "Tapparelle Chiuse",
    "message":"Le tapparelle sono state chiuse correttamente."
  },
  "ROLLERS_CLOSED_ERROR": {
    "label": "Errore Tapparelle",
    "message":"Si è verificato un problema nella chiusura delle tapparelle."
  },
  "LIGHTS_ON": {
    "label": "Luci Accese",
    "message": "Le luci sono state accese correttamente."
  },
  "LIGHTS_ON_ERROR": {
    "label": "Errore Luci",
    "message": "Si è verificato un problema nell'accensione delle luci."
  },
  "LIGHTS_OFF": {
    "label": "Luci Spente",
    "message": "Le luci sono state spente correttamente."
  },
  "LIGHTS_OFF_ERROR": {
    "label": "Errore Luci",
    "message": "Si è verificato un problema nello spegnimento delle luci."
  },
  "SCENE_NIGHT": {
    "label": "Scenario Notte",
    "message": "Lo scenario Notte è ora attivo."
  },
  "SCENE_DAY": {
    "label": "Scenario Giorno",
    "message": "Lo scenario Giorno è ora attivo"
  },
  "NO_SIGNAL": {
   "label": "Segnale Assente #ENTITY#",
   "message": "Il sensore #ENTITY# non riceve segnale."
  },
  "VERY_LOW_SIGNAL": {
   "label": "Segnale Molto Basso #ENTITY#",
   "message": "Il sensore #ENTITY# ha poco segnale."
  },
  "LOW_SIGNAL": {
   "label": "Segnale Basso #ENTITY#",
   "message": "Il sensore #ENTITY# ha poco segnale."
  },
  "NOT_CALIBRATED": {
   "label": "#ENTITY# Non Calibrato",
   "message": "Il sensore #ENTITY# si recalibrerà a breve."
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
        extra_data = data["kwargs"] if "kwargs" in data else {}
        extra_data["entity_id"] = entity_id

        notificationToSend = self.buildNotification(severity=severity, sender=sender, code=ncode, entityRef=entity_id)

        self.dispatchNotification(notificationToSend, extra_data)

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

    def dispatchNotification(self, notificationToSend, kwargs):

        self.sendHubNotification(notificationToSend, kwargs)
        if ( notificationToSend["sender"] == "*" or notificationToSend["sender"] != "" ) and notificationToSend["sender"] != "HUB":

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

    def sendHubNotification(self, notification, kwargs):
        self.log("Sending HUB notification")
        code = notification["eventType"]
        label = noty_message[code]["label"]
        extra_info = None
        more_info = None

        if "ERROR" in code or "VALVES" in code:
          return self.sendErrorNotification(code, label)
        if "BATTERY" in code:
          return self.sendBatteryNotification(code, label, kwargs["entity_id"])
        if "SIGNAL" in code:
          return self.sendSignalNotification(code, label, kwargs["entity_id"])
        if "NOT_CALIBRATED" in code:
          entity = self.get_state(kwargs["entity_id"], attribute="friendly_name")
          label = label.replace("#ENTITY#", entity)
          extra_info = noty_message[code]["message"].replace("#ENTITY#", entity)
        if "HEATING" in code:
          if "comfort_temp" in kwargs and kwargs["comfort_temp"] != None:
            if "TEMP_REACHED" in code:
              label +=" perché è già stata raggiunta la temperatura"
            else:
              label +=  " dopo aver raggiunto la temperatura impostata"
            extra_info = "Temperatura Impostata: {}°C".format(kwargs["comfort_temp"])
          elif kwargs["program"] > 0:
            label += " dal Programma {}".format(kwargs["program"])
        if "LIGHTS" in code:
          if kwargs["zone"] != "all":
            zone = self.get_state("input_text.zn{}".format(kwargs["zone"]))
            if zone.find("Zona") <0: zone = "Stanza "+ zone 
            label += " nella {}".format(zone)
            if "ON" in code and kwargs["mode"]: label += " secondo la modalità {}".format(kwargs["mode"])

        if "SCENE_NIGHT" in code:
          label += " {}".format(kwargs["mode"])
          zones = kwargs["zones"]
          if len(zones) > 0:
            vowel = ("a","e")[len(zones)>1]
            extra_info = "Luci Accese nell#?# Zon#?#: ".replace("#?#", vowel)
            for index in range(len(zones)):
              zone= self.get_state(f"input_text.zn{zones[index]}").removeprefix("Zona ")
              if index < len(zones)-1: extra_info += zone + ", "
              else:
                extra_info = extra_info[:-2] + " e "
                extra_info+=zone
          pos = 100.0-int(float(kwargs["rollers"]))
          more_info = f"Tapparelle sono state chiuse al {pos}%"

        if "SCENE_DAY" in code:
          label += " {}".format(kwargs["mode"])
          zones = kwargs["zones"]
          if len(zones) > 0:
            vowel = ("a","e")[len(zones)>1]
            extra_info = "Luci Spente nell#?# Zon#?#: ".replace("#?#", vowel)
            for index in range(len(zones)):
              zone= self.get_state(f"input_text.zn{zones[index]}").removeprefix("Zona ")
              if index < len(zones)-1: extra_info += zone + ", "
              else:
                extra_info = extra_info[:-2] + " e "
                extra_info+=zone
          pos = 100.0-int(float(kwargs["rollers"]))
          more_info = f"Tapparelle sono state aperte al {pos}%"

        if notification["sender"] != "HUB": label += " da Assistente Remoto"
        if label == noty_message[code]["label"]: label +=" Manualmente"
        self.set_state("input_text.notify", state=label, attributes={"extra_info":extra_info, "more_info": more_info})
        self.turn_on("input_boolean.notification_to_read")

    def sendErrorNotification(self, code, label):

      extra_info = None
      if "VALVES" in code:
         extra_info = "Le teste termostatiche non sono state raggiunte dal sistema. Verificare che siano cariche"
      elif "HEATING" in code:
         extra_info = "Si è verificato un problema nell{} della caldaia.".format(("o spegnimento","'accensione")["ON" in code])
      else: extra_info = noty_message[code]["message"]

      self.set_state("input_text.notify", state=label, attributes={"extra_info": extra_info})
      self.turn_on("input_boolean.notification_to_read")

    def sendBatteryNotification(self, code, label, entity):
      entity = self.get_state(entity, attribute = 'friendly_name').replace("_battery","")
      extra_info = None
      if "SENSOR" in code: label = label.replace("#ENTITY#", entity)
      self.set_state("input_text.notify", state=label, attributes={"extra_info": extra_info})
      self.turn_on("input_boolean.notification_to_read")

    def sendSignalNotification(self, code, label, entity):
      entity = self.get_state(entity, attribute = 'friendly_name')
      extra_info = None
      label = label.replace("#ENTITY#", entity)

      self.set_state("input_text.notify", state=label, attributes={"extra_info": extra_info})
      self.turn_on("input_boolean.notification_to_read")