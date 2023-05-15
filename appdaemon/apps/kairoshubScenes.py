import hassapi as hass

class KairoshubScenes(hass.Hass):

    def initialize(self):
      self.listen_event(self.manageScene,"AD_SCENES_DAY_NIGHT")

    def manageScene(self, event_name, data, kwargs):
      self.log("Managing Day/Night scene", level="INFO")
      if "data" in data: data = data["data"]
      if data["state"] == "on" or data["state"] == "night":
        self.activateNightScene(data)
      else:
        self.activateDayScene(data)

    def activateNightScene(self, data):
      self.log("Activating Night Scene", level="INFO")
      self.fire_event("HA_ROLLERS_NOTATHOME_POSITION")
      self.fire_event("AD_AUTOMATIC_LIGHTS", action="on")

      lights = self.get_state("group.lights", attribute="entity_id")
      zones = []
      for light in lights:
        zoneId = light[-3:]
        if self.get_state(f"input_select.zn{zoneId}") == "Automatico":
          zones.append(zoneId)

      rollers = self.get_state("input_number.rollershutter_notathome_position")

      noty_info = {
        "sender": data["sender"],
        "ncode": "SCENE_NIGHT",
        "severity": "NOTICE",
        "kwargs" : {
          "zones": zones,
          "rollers": rollers,
          "mode": data["mode"]
        }
      }

      self.fire_event("AD_KAIROSHUB_NOTIFICATION", **noty_info)


    def activateDayScene(self, data):
      self.log("Activating Day Scene", level="INFO")
      self.fire_event("HA_ROLLERS_ATHOME_POSITION")
      self.fire_event("AD_AUTOMATIC_LIGHTS", action="off")

      lights = self.get_state("group.lights", attribute="entity_id")
      zones = []
      for light in lights:
        zoneId = light[-3:]
        if self.get_state(f"input_select.zn{zoneId}") == "Automatico":
          zones.append(zoneId)

      rollers = self.get_state("input_number.rollershutter_athome_position")

      noty_info = {
        "sender": data["sender"],
        "ncode": "SCENE_DAY",
        "severity": "NOTICE",
        "kwargs" : {
          "zones": zones,
          "rollers": rollers,
          "mode": data["mode"]
        }
      }

      self.fire_event("AD_KAIROSHUB_NOTIFICATION", **noty_info)

