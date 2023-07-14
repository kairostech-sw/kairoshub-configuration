import hassapi as hass
import json

class KairoshubScenes(hass.Hass):


    def initialize(self):
      self.listen_event(self.manageScene,"AD_SCENES_DAY_NIGHT")

    def manageScene(self, event_name: str, data: dict, kwargs: dict) -> None:

      eventData = {
        "action": "off",
        "roller": "day",
        "ncode": "SCENE_DAY",
        "sender": self.getKey(data, "sender", "HUB"),
        "severity": "NOTICE",
        "kwargs": {
          "mode": self.getKey(data, "mode"),
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

    def manageDayNightScene(self, data: dict) -> None:
      self.log("Managing Day/Night Scene", level="INFO")

      if self.isIntegrationActive("lights", "day"):
        self.fire_event(f"AD_AUTOMATIC_LIGHTS", action=data["action"], scene="day")
        data["kwargs"]["zones"] = ""

      if self.isIntegrationActive("rollers", "day"):
        dayzone = self.get_state(f"input_number.position_rs100_{data['roller']}")
        nightzone = self.get_state(f"input_number.position_rs200_{data['roller']}")
        self.fire_event("AD_AUTOMATIC_ROLLERS", dayzone=dayzone, nightzone=nightzone)
        data["kwargs"]["rollers"] = {"nightzone": nightzone, "dayzone": dayzone}

      self.toggle("input_boolean.scene_day_active")
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
