import hassapi as hass
from datetime import datetime, timedelta

class KairoshubRollers(hass.Hass):

    datetimeFormat = "%Y-%m-%dT%H:%M:%S"

    def initialize(self):
        self.listen_event(self.rollersControl, "AD_ROLLERS_CONTROL")
        self.listen_event(self.setRollersPosition, "AD_SET_ROLLERS_POS")
        self.listen_event(self.rollersProgram, "AD_ROLLERS_PROGRAM")
        self.listen_event(self.rollersSceneAutomation, "AD_AUTOMATIC_ROLLERS")


    def rollersControl(self, event_name: str, data: dict, kwargs: dict) -> None:

      if "entity" in data:
        zone = f"rs{data['entity']}"
        pos = f"rz{data['entity']}"
        action = data["action"]
        reverse = False
        self.select_option(f"input_select.{zone}", "idle")
      else:
        zone = "rollershutters"
        pos = "tapparelle"
        action = self.get_state(f"group.{zone}")
        reverse = True

      entity = f"group.{zone}"
      service = self.getService(action, reverse)

      pos = float(self.get_state(f"sensor.{pos}"))
      if (pos == 0.0 and service == "close_cover") or (pos == 100.0 and service == "open_cover"):
        self.log(f"The roller {zone} is already at the maximum position")
        return None

      self.log("Sending Command %s", service, level="INFO")
      self.call_service(f"cover/{service}", entity_id=entity)
      moving = "stop"

      attributes = self.get_state(entity, attribute="attributes")
      if action != moving:
        self.set_state(entity, state=moving, attributes=attributes)
      else:
        state = ("closed", "open")[pos > 0.0]
        self.set_state(entity, state=state, attributes=attributes)

    def getService(self, state: str, reverse: bool) -> str:
      services = ["open", "stop", "close"]
      if state == "closed": state = state[:-1]
      index = services.index(state)
      if reverse: index = -index - 1

      return f"{services[index]}_cover"

    def setRollersPosition(self, event_name: str, data: dict, kwargs: dict) -> None:

      mode = self.getKey(data, "mode")
      sender = self.getKey(data, "sender") or "HUB"
      trid = self.getKey(data, "trid")
      target = self.getKey(data, "target") or "group.rollershutters"

      state = ("CLOSED","OPEN")["athome" == mode]
      position = int(float(self.get_state(f"input_number.rollershutter_{mode}_position")))

      self.log(f"Setting Rollers position at {position}%")
      self.call_service("cover/set_cover_position", entity_id=target, position=position)

      notyInfo = {
         "ncode": f"ROLLERS_{state}",
         "sender": sender,
         "severity": "NOTICE",
         "kwargs": {
            "pos": position
         }
      }
      if trid:
          notyInfo["trid"] = trid

      self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)
      self.fire_event("AD_ENTITY_METRICS")

    def rollersProgram(self, event_name: str, data: dict, kwargs: dict) -> None:
        now = datetime.strptime(self.get_state("sensor.date_time_iso"), self.datetimeFormat)
        day = int(datetime.strftime(now,"%w"))
        date = now.strftime("%Y-%m-%dT")
        onTime = datetime.strptime(date + data['on_time'], self.datetimeFormat)
        offTime = datetime.strptime(date + data["off_time"], self.datetimeFormat)
        zoneId = data["zone"]
        mode = data["mode"]

        if mode == "Feriali" and day % 6 == 0: return None
        elif mode == "Festivi" and day % 6 > 0: return None

        if onTime > offTime:
            offTime = now + timedelta(days=1)

        rollers = f"group.rs{zoneId}"

        notyInfo = {
            "sender": self.getKey(data, "sender"),
            "ncode": "",
            "severity": "NOTICE",
            "kwargs": {
                "zone": zoneId,
                "mode": "Programmato"
            }
        }
        trid = self.getKey(data, "trid"),
        if trid:
            notyInfo["trid"] = trid

        if onTime <= now < offTime:
            self.log("Opening Rollers in zone %s",zoneId)
            notyInfo["ncode"] = "ROLLERS_OPEN"
            self.turn_on("input_boolean.rollers_program1_on")
            self.setRollersPosition(event_name ,data={"mode":"athome", "target": rollers}, kwargs=kwargs)
        elif offTime <= now:
            self.log("Closing Rollers in zone %s",zoneId)
            notyInfo["ncode"] = "ROLLERS_CLOSED"
            self.turn_off("input_boolean.rollers_program1_on")
            self.setRollersPosition(event_name ,data={"mode":"notathome", "target": rollers}, kwargs=kwargs)
        else:
            self.log("The program is not active right now")

    def rollersSceneAutomation(self, event_name: str, data: dict, kwargs: dict):
      dayzone = int(float(self.getKey(data, "dayzone")))
      nightzone = int(float(self.getKey(data, "nightzone")))
      self.call_service("cover/set_cover_position", entity_id="group.rs100", position=nightzone)
      self.call_service("cover/set_cover_position", entity_id="group.rs200", position=dayzone)

    def getKey(self, data: dict, key: str) -> str:
      if "data" in data:
          data = data["data"]
      if key in data:
          return data[key]
      if "event" in data and key in data["event"]:
          return data["event"][key]

      return ""
