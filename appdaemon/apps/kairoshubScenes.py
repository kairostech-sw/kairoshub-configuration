import hassapi as hass
from datetime import datetime

class KairoshubScenes(hass.Hass):

    dateFormat = "%Y-%m-%dT"
    timeFormat = "%H:%M:%S"
    datetime_format = dateFormat + timeFormat

    def initialize(self):
      self.listen_event(self.manageScenes,"AD_SCENES_DAY_NIGHT")
      self.listen_event(self.manageScenes,"AD_MANAGE_HOME_ON_OFF")

    def manageScenes(self, event_name: str, data: dict, kwargs: dict) -> None:

      mode = self.getKey(data, "mode")

      eventData = {
        "action": "off",
        "roller": "day",
        "ncode": "SCENE_DAY",
        "sender": self.getKey(data, "sender", "HUB"),
        "severity": "NOTICE",
        "kwargs": {
          "mode": mode,
          "rollers": "",
          "zones": ""
        }
      }
      trid = self.getKey(data, "trid"),
      if trid:
          eventData["trid"] = trid
      state = self.getKey(data, "eventValue") or self.getKey(data, "state")

      if state in ["on", "night"]:
        eventData["ncode"] = "SCENE_NIGHT"
        eventData["action"] = "on"
        eventData["roller"] = "night"
        self.manageDayNightScene(eventData)
        return None

      if mode == "athome":
         eventData["ncode"] = "SCENE_ATHOME"
         eventData["action"] = "on"
         eventData["roller"] = "athome"
      if mode == "notathome":
         eventData["ncode"] = "SCENE_NOTATHOME"
         eventData["action"] = "off"
         eventData["roller"] = "notathome"

      self.manageScene("athome", eventData)

    def manageDayNightScene(self, data: dict) -> None:
      self.log("Managing Day/Night Scene", level="INFO")
      now = datetime.strptime(self.get_state("sensor.date_time_iso"), self.datetime_format)
      today = now.strftime("%A").lower()

      if self.get_state(f"input_boolean.scene_{today}_day") == "off":
          self.log("The Program is not active for today", level="INFO")
          return None

      self.manageScene("day", data)

    def manageScene(self, scene: str, data: dict) -> None:
      if self.isIntegrationActive("lights", scene):
        self.fire_event(f"AD_AUTOMATIC_LIGHTS", action=data["action"], scene=scene)
        data["kwargs"]["zones"] = ""

      if self.isIntegrationActive("rollers", scene):
        dayzone = self.get_state(f"input_number.position_rs100_{data['roller']}")
        nightzone = self.get_state(f"input_number.position_rs200_{data['roller']}")
        self.fire_event("AD_AUTOMATIC_ROLLERS", dayzone=dayzone, nightzone=nightzone)
        data["kwargs"]["rollers"] = {"nightzone": nightzone, "dayzone": dayzone}

      self.toggle(f"input_boolean.scene_{scene}_active")
      self.fire_event("AD_KAIROSHUB_NOTIFICATION", **data)

    def isIntegrationActive(self, integration: str, scene: str) -> bool:
      entity = f"input_boolean.{integration}_scene_{scene}"
      return self.get_state(entity) == "on"

    def getKey(self, data: dict, key: str, default="") -> str:
        if "data" in data:
            data = data["data"]
        if key in data:
            return data[key]
        if "event" in data and key in data["event"]:
            return data["event"][key]

        return default
