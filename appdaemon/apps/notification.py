import json
import hassapi as hass

KAIROSHUB_SYSTEM_CODE = "input_text.system_code"
file = "./kairoshubNotification.json"
noty_message = {
    "HEATING_ON": {
        "label": "Riscaldamento Acceso",
        "message": "Impianto di riscaldamento acceso correttamente."
    },
    "HEATING_COMMAND_ON_ERROR": {
        "label": "Errore Riscaldamento",
        "message": "Si è verificato un problema nell'accensione dell'impianto di riscaldamento. Verifica l'accensione della caldaia, se il problema persiste contattare l'assistenza."
    },
    "HEATING_VALVES_CLOSED": {
        "label": "Errore Valvole",
        "message": "Sembra che le teste termostatiche dei termosifoni non siano raggiungibili dall'impianto. Verificare la carica delle teste, se cariche e il problema persiste contattare l'assistenza."
    },
    "HEATING_OFF": {
        "label": "Riscaldamento Spento",
        "message": "Impianto di riscaldamento spento correttamente."
    },
    "HEATING_COMMAND_OFF_ERROR": {
        "label": "Errore Riscaldamento",
        "message": "Si è verificato un problema nello spegnimento dell'impianto di riscaldamento. Verifica l'accensione della caldaia, se il problema persiste contattare l'assistenza."
    },
    "HEATING_TEMP_REACHED": {
        "label": "Riscaldamento non acceso",
        "message": "Il riscaldamento non è stato acceso perché la temperatura è già superiore a quella impostata."
    },
    "HEATING_NO_ZONE_ERROR": {
        "label": "Errore Programma Riscaldamento",
        "message": "Il programma di riscaldamento #id# non è stato acceso perché non sono state impostate zone."
    },
    "TV_SENSOR_BATTERY_LOW": {
        "label": "Batteria Quasi Scarica Testa Termostatica #ENTITY#",
        "message": "La testa termostatica #ENTITY# si sta scaricando. Collegala ad un carica batterie oppure ad una Powerbank. \n\nPuoi ricoscere la testa termostatica dal nome applicato nella parte sottostante."
    },
    "TH_SENSOR_BATTERY_LOW": {
        "label": "Batteria Quasi Scarica Sensore Umidità #ENTITY#",
        "message": "Il sensore della temperatura e umidità #ENTITY# si sta scaricando. Sostituire le pile nel retro del sensore. \n\nPuoi ricoscere il sensore dal nome applicato nella parte retrostante."
    },
    "ROLLERS_OPEN": {
        "label": "Tapparelle Aperte",
        "message": "Le tapparelle sono state aperte correttamente."
    },
    "ROLLERS_OPENED": {
        "label": "Tapparelle Aperte",
        "message": "Le tapparelle sono state aperte correttamente."
    },
    "ROLLERS_COMMAND_OPEN_ERROR": {
        "label": "Errore Tapparelle",
        "message": "Si è verificato un problema nell'apertura delle tapparelle."
    },
    "ROLLERS_CLOSED": {
        "label": "Tapparelle Chiuse",
        "message": "Le tapparelle sono state chiuse correttamente."
    },
    "ROLLERS_COMMAND_CLOSE_ERROR": {
        "label": "Errore Tapparelle",
        "message": "Si è verificato un problema nella chiusura delle tapparelle."
    },
    "ROLLERS_SCENE": {
        "label": "TAPPARELLE TEST",
        "message": "Si è verificato un problema nella chiusura delle tapparelle."
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
    },
    "INTEGRATION_ALEXA_REGISTRATION_REQ": {
        "label": "E' stato avviato il processo di connessione ad Alexa.",
        "message": "E' stato avviato il processo di connessione ad Alexa."
    },
    "INTEGRATION_ALEXA_REGISTRATION_ON": {
        "label": "Alexa è stata attivata con successo.",
        "message": "Alexa è stata attivata con successo."
    },
    "INTEGRATION_ALEXA_REGISTRATION_OFF": {
        "label": " Alexa è stata disattivata con successo.",
        "message": "Alexa è stata disattivata con successo."
    },
    "INTEGRATION_ALEXA_REGISTRATION_ERROR": {
        "label": "Si è verificato un errore durante il processo di integrazione con Alexa.",
        "message": "Si è verificato un errore durante il processo di integrazione con Alexa."
    },
    "INTEGRATION_ALEXA_SUBSCRIPTION_RENEW_TOGGLE_TO_ON": {
        "label": "La sottoscrizione ad Alexa si rinnoverà automaticamente.",
        "message": "La sottoscrizione ad Alexa si rinnoverà automaticamente."
    },
    "INTEGRATION_ALEXA_SUBSCRIPTION_RENEW_TOGGLE_TO_OFF": {
        "label": "Il rinnovo automatico per Alexa è stato disattivato.",
        "message": "Il rinnovo automatico per Alexa è stato disattivato."
    },
    "INTEGRATION_ALEXA_SUBSCRIPTION_REMOVE_ERROR": {
        "label": "Si è verificato un errore durante la cancellazione della sottoiscrizione ad Alexa.",
        "message": "Si è verificato un errore durante la cancellazione della sottoiscrizione ad Alexa."
    },
    "SCENE_ATHOME": {
        "label": "Scenario In Casa",
        "message": "Lo scenario In Casa è stato attivato"
    },
    "SCENE_NOTATHOME": {
        "label": "Scenario Fuori Casa",
        "message": "Lo scenario Fuori è stato attivato"
    }
}


class Notification(hass.Hass):

    systemCode = None
    cloudTopic = "HASSIO"

    def initialize(self):
        self.listen_event(self.notification, "AD_KAIROSHUB_NOTIFICATION")
        self.listen_event(self.pushMessage, "AD_NOTIFICATION_SYNC")

    def notification(self, event_name: str, data: dict, kwargs: dict) -> None:

        noty_info, extra_data = self.getNotificationData(data)

        notificationToSend = self.buildNotification(**noty_info)

        self.dispatchNotification(notificationToSend, extra_data)

    def buildNotification(self, severity: str, sender: str,
                          code: str, trid: str, entityRef: str) -> dict:
        if None == self.systemCode:
            self.systemCode = self.get_state(KAIROSHUB_SYSTEM_CODE)
        message = self.getMessage(code, entityRef)
        noty = {
            "eventType": code.upper(),
            "severity": severity.upper(),
            "systemCode": self.systemCode,
            "sender": sender,
            "message": message,
        }
        if trid:
            noty["trid"] = trid
        self.log("Notification : %s", noty, level="DEBUG")
        return noty

    def dispatchNotification(self, notificationToSend: str, kwargs: dict) -> None:

        self.sendHubNotification(notificationToSend, kwargs)
        if (notificationToSend["sender"] == "*" or notificationToSend["sender"] != "") and notificationToSend["sender"] != "HUB":

            # removing attributes
            notificationToSend.pop("severity", None)
            self.log("Producing notification message on topic: %s message: %s",
                     self.cloudTopic, notificationToSend)
            self.fire_event("HAKAFKA_PRODUCER_PRODUCE",
                            topic=self.cloudTopic, message=notificationToSend)

            # TODO: valutare se spostare nella funzione principale al fine di inviare sempre un aggiornamento
            self.fire_event("AD_ENTITY_METRICS")

    def getMessage(self, code: str, entityRef: str) -> str:
        message = noty_message[code]["message"]

        if not message == "":
            if "#ENTITY#" in message and entityRef != "":
                entityName = self.get_state(
                    entityRef, attribute='friendly_name')
                if "_battery" in entityName:
                    entityName = entityName.replace("_battery", "")

                return message.replace("#ENTITY#", entityName)
            else:
                return message
        else:
            raise Exception("message not found")

    def pushMessage(self, event_name: str, data: dict, kwargs: dict) -> None:
        self.log("Pushing message file", level="INFO")

        try:
            jsonData = data["data"]["technicalMessage"]
            with open(file, "w+") as f:
                json.dump(jsonData, f)
        except FileNotFoundError:
            self.log("File not found", level="WARNING")
        except Exception:
            raise

        self.log("File pushed", level="INFO")

    def getNotificationData(self, data: dict) -> tuple:
        if "data" in data:
            data = data["data"]
        entity_id = data["entity"] if "entity" in data else None

        noty_info = {
            "code": data["ncode"],
            "severity": data["severity"],
            "sender": data["sender"] if "sender" in data and data["sender"] != "" else "HUB",
            "trid": data["trid"] if "trid" in data else "",
            "entityRef": entity_id,
        }
        extra_data = {"entity_id": entity_id}
        if "kwargs" in data:
            extra_data = {**extra_data, **data["kwargs"]}

        return noty_info, extra_data

    def sendHubNotification(self, notification, kwargs):
        self.log("Sending HUB notification")
        code = notification["eventType"]
        label = noty_message[code]["label"]
        program = kwargs["program"] if "program" in kwargs else ""
        extra_info = None
        more_info = None

        if "ERROR" in code or "VALVES" in code:
            self.sendErrorNotification(code, label, program)
            return
        if "BATTERY" in code:
            self.sendBatteryNotification(code, label, kwargs["entity_id"])
            return
        if "SIGNAL" in code:
            self.sendSignalNotification(label, kwargs["entity_id"])
            return
        if "ALEXA" in code:
            self.send(label)
            return
        if "NOT_CALIBRATED" in code:
            entity = self.get_state(
                kwargs["entity_id"], attribute="friendly_name")
            label = label.replace("#ENTITY#", entity)
            extra_info = noty_message[code]["message"].replace(
                "#ENTITY#", entity)
        if "HEATING" in code:
            if "comfort_temp" in kwargs and kwargs["comfort_temp"]:
                if "TEMP_REACHED" in code:
                    label += " perché è già stata raggiunta la temperatura"
                    extra_info = "Temperatura Impostata: {}°C".format(
                        kwargs["comfort_temp"])
                else:
                    label += " dopo aver raggiunto la temperatura impostata"
            elif kwargs["program"] > 0:
                label += " dal Programma {}".format(kwargs["program"])
        if "LIGHTS" in code:
            if kwargs["zone"] != "all":
                zone = self.get_state("input_text.zn{}".format(kwargs["zone"]))
                if zone.find("Zona") < 0:
                    zone = "Stanza " + zone
                label += " nella {}".format(zone)
                if "ON" in code and kwargs["mode"]:
                    label += " secondo la modalità {}".format(kwargs["mode"])
        if "ROLLERS" in code:
            if "pos" in kwargs:
                pos = int(float(kwargs["pos"]))
                state, pos = (("chiuse", 100-pos),
                              ("aperte", pos))["OPEN" in code]
                more_info = f"Tapparelle sono state {state} al {pos}%"

        if "SCENE_NIGHT" in code:
            label += " {}".format(kwargs["mode"])
            zones = kwargs["zones"]
            if len(zones) > 0:
                vowel = ("a", "e")[len(zones) > 1]
                extra_info = "Luci Accese nell#?# Zon#?#: ".replace(
                    "#?#", vowel)
                for index in range(len(zones)):
                    zone = self.get_state(
                        f"input_text.zn{zones[index]}").replace("Zona ", "")
                    if index < len(zones)-1:
                        extra_info += zone + ", "
                    else:
                        extra_info = extra_info[:-2] + " e "
                        extra_info += zone
            # pos = 100-int(float(kwargs["rollers"]))
            # more_info = f"Tapparelle sono state chiuse al {pos}%"

        if "SCENE_DAY" in code:
            label += " {}".format(kwargs["mode"])
            zones = kwargs["zones"]
            if len(zones) > 0:
                vowel = ("a", "e")[len(zones) > 1]
                extra_info = "Luci Spente nell#?# Zon#?#: ".replace(
                    "#?#", vowel)
                for index in range(len(zones)):
                    zone = self.get_state(
                        f"input_text.zn{zones[index]}").replace("Zona ", "")
                    if index < len(zones)-1:
                        extra_info += zone + ", "
                    else:
                        extra_info = extra_info[:-2] + " e "
                        extra_info += zone
            # pos = int(float(kwargs["rollers"]))
            # more_info = f"Tapparelle sono state aperte al {pos}%"

        if notification["sender"] != "HUB":
            label += " da Assistente Remoto"
        if label == noty_message[code]["label"]:
            label += " Manualmente"

        self.send(label, extra_info, more_info)

    def sendErrorNotification(self, code, label, program):

        extra_info = None
        if "VALVES" in code:
            extra_info = "Le teste termostatiche non sono state raggiunte dal sistema. Verificare che siano cariche"
        elif "NO_ZONE" in code:
            extra_info = noty_message[code]["message"].replace(
                "#id#", str(program))
        elif "HEATING" in code:
            extra_info = "Si è verificato un problema nell{} della caldaia.".format(
                ("o spegnimento", "'accensione")["ON" in code])
        else:
            extra_info = noty_message[code]["message"]

        self.send(label, extra_info)

    def sendBatteryNotification(self, code, label, entity):
        if "SENSOR" in code:
            label = label.replace("#ENTITY#", entity)

        self.send(label)

    def sendSignalNotification(self, label, entity):
        label = label.replace("#ENTITY#", entity)
        self.send(label)

    def send(self, label, extra_info=None, more_info=None):

        self.set_state("input_text.notify", state=label, attributes={
                       "extra_info": extra_info, "more_info": more_info})
        self.turn_on("input_boolean.notification_to_read")
