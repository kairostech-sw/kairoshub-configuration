import hassapi as hass

class KairoshubScenes(hass.Hass):

    def initialize(self):
      self.listen_event(self.manageScene,"AD_SCENES_DAY_NIGHT")

    def manageScene(self, event_name: str, data: dict, kwargs: dict) -> None:

      eventData = {
        "action": "off",
        "roller": "ATHOME",
        "ncode": "SCENE_DAY",
        "sender": self.getKey(data, "sender"),
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
        eventData["roller"] = "NOTATHOME"

      self.manageDayNightScene(eventData)

    def manageDayNightScene(self, data: dict) -> None:
      self.log("Managing Day/Night Scene", level="INFO")
      self.fire_event(f"AD_AUTOMATIC_LIGHTS", action=data["action"])

      lights = self.get_state("group.lights", attribute="entity_id")
      zones = []
      for light in lights:
        zoneId = light[-3:]
        if self.get_state(f"input_select.zn{zoneId}") == "Automatico":
          zones.append(zoneId)

      rollers = self.get_state(f"input_number.rollershutter_{data['roller'].lower()}_position")
      position = int(float(rollers))
      self.fire_event("AD_AUTOMATIC_ROLLERS", position=position)


      data["kwargs"]["rollers"] = rollers
      data["kwargs"]["zones"] = zones

      self.fire_event("AD_KAIROSHUB_NOTIFICATION", **data)

    def getKey(self, data: dict, key: str) -> str:
        if "data" in data:
            data = data["data"]
        if key in data:
            return data[key]
        if "event" in data and key in data["event"]:
            return data["event"][key]

        return ""
