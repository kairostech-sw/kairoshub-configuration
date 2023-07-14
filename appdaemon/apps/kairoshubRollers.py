import hassapi as hass
import re
from datetime import datetime

class KairoshubRollers(hass.Hass):

    dateFormat = "%Y-%m-%dT"
    timeFormat = "%H:%M:%S"
    datetimeFormat = dateFormat + timeFormat

    def initialize(self):
        self.listen_event(self.rollersControl, "AD_ROLLERS_CONTROL")
        self.listen_event(self.setRollersPosition, "AD_SET_ROLLERS_POS")
        self.listen_event(self.rollersProgram, "AD_ROLLERS_PROGRAM")
        self.listen_event(self.rollersSceneAutomation, "AD_AUTOMATIC_ROLLERS")


    def rollersControl(self, event_name: str, data: dict, kwargs: dict) -> None:
      '''
        Checks if the rollers are already are their maximum position
        based on the action received.

        Otherwise, they will perform the action received
      '''
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
      '''
        Returns the service based on the state.

        If `reverse` is passed, it returns the opposite service
      '''
      services = ["open", "stop", "close"]
      if state == "closed": state = state[:-1]
      index = services.index(state)
      if reverse: index = -index - 1

      return f"{services[index]}_cover"

    def setRollersPosition(self, event_name: str, data: dict, kwargs: dict) -> None:
      '''
        Sets rollers at the position of the params mode.
      '''
      mode = self.getKey(data, "mode")
      sender = self.getKey(data, "sender", "HUB")
      trid = self.getKey(data, "trid")
      zones = self.get_state("group.rollershutters", attribute="entity_id")
      positionNightzone = int(float(self.get_state(f"input_number.position_rs100_{mode}")))
      positionDayzone = int(float(self.get_state(f"input_number.position_rs200_{mode}")))

      for zone in zones:
         if self.getEntityId(zone)[0] == "1":
          self.setPosition(zone, positionNightzone, sendNotification=False)
         if self.getEntityId(zone)[0] == "2":
          self.setPosition(zone, positionDayzone, sendNotification=False)

      #TODO noty
      notyInfo = {
         "ncode": f"ROLLERS_SCENE",
         "sender": sender,
         "severity": "NOTICE",
         "kwargs": {
            "mode": mode,
            "position": {
               "nightzone": positionNightzone,
               "dayzone": positionDayzone,
            }
         }
      }
      if trid:
          notyInfo["trid"] = trid

      self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)
      self.fire_event("AD_ENTITY_METRICS")

    def rollersProgram(self, event_name: str, data: dict, kwargs: dict) -> None:
        progId = self.getKey(data, "progId", "1")
        sender = self.getKey(data, "sender", "HUB")
        trid = self.getKey(data, "trid")

        now = datetime.strptime(self.get_state("sensor.date_time_iso"), self.datetimeFormat)
        date = now.strftime(self.dateFormat)
        today = now.strftime("%A").lower()
        onTime = self.get_state(f"input_datetime.rollers_on_program{progId}")
        offTime = self.get_state(f"input_datetime.rollers_off_program{progId}")
        onTime = datetime.strptime(date + onTime, self.datetimeFormat)
        offTime = datetime.strptime(date + offTime, self.datetimeFormat)

        if self.get_state(f"input_boolean.rollers_{today}_program{progId}") == "off":
            self.log("The Program is not active for today", level="INFO")
            return None

        #TODO
        notyInfo = {
            "sender": sender,
            "ncode": "",
            "severity": "NOTICE",
            "kwargs": {
                "zone": "all",
                "mode": "Programmato"
            }
        }

        programData = {
            "mode": "",
            "sender": sender
        }

        trid = self.getKey(data, "trid")
        if trid:
            notyInfo["trid"] = trid
            programData["trid"] = trid

        validTime = self.isValidTime(now, offTime)

        if onTime > now:
            self.log("The program %s is not active now", progId, level="INFO")
            return None

        if validTime:
          if self.get_state(f"input_boolean.rollers_program{progId}_on") == "off":
            self.log("Opening Rollers")
            notyInfo["ncode"] = "ROLLERS_OPEN"
            self.turn_on(f"input_boolean.rollers_program{progId}_on")
            programData["mode"] = f"open_program{progId}"
            self.setRollersPosition(event_name, data=programData, kwargs=kwargs)
            return None
          self.log("This program is already active", level="INFO")

        else:
            self.log("Closing Rollers")
            notyInfo["ncode"] = "ROLLERS_CLOSED"
            self.turn_off(f"input_boolean.rollers_program{progId}_on")
            programData["mode"] = f"close_program{progId}"
            self.setRollersPosition(event_name, data=programData, kwargs=kwargs)
            return None

    def rollersSceneAutomation(self, event_name: str, data: dict, kwargs: dict):
      '''
        Sets the rollers at the position of scene
      '''
      dayzone = int(float(self.getKey(data, "dayzone")))
      nightzone = int(float(self.getKey(data, "nightzone")))
      self.setPosition("group.rs100", nightzone, sendNotification=False)
      self.setPosition("group.rs200", dayzone, sendNotification=False)
      #TODO NOTY

    def setPosition(self, target: str, position: int, notyInfo = {}, sendNotification = True) -> None:
      '''
        Sets the target roller at the specified position
      '''
      self.log(f"Setting {target.split('.')[1].upper()} at {position}%")
      self.call_service("cover/set_cover_position", entity_id=target, position=position)
      if sendNotification:
        self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

    def getKey(self, data: dict, key: str, default="") -> str:
      if "data" in data:
          data = data["data"]
      if key in data:
          return data[key]
      if "event" in data and key in data["event"]:
          return data["event"][key]

      return default

    def getEntityId(self, entity) -> str:
        return re.search("(\d+)", entity).group()

    def isValidTime(self, now: datetime, end: datetime) -> int:
        return now < end
