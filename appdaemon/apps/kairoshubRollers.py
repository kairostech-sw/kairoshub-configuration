import hassapi as hass

class KairoshubRollers(hass.Hass):

    def initialize(self):
        self.listen_event(self.rollersControl, "AD_ROLLERS_CONTROL")
        self.listen_event(self.setRollersPosition, "AD_SET_ROLLERS_POS")

    def rollersControl(self, event_name: str, data: dict, kwargs: dict) -> None:

      if "entity" in data:
        zone = f"rs{data['entity']}"
        pos = f"rz{data['entity']}"
        self.select_option(f"input_select.{zone}", "idle")
      else:
        zone = "rollershutters"
        pos = "tapparelle"

      entity = f"group.{zone}"
      coverState = self.get_state(entity)
      service = self.getService(coverState, zone, data)

      self.log("Sending Command %s", service, level="INFO")
      self.call_service(f"cover/{service}", entity_id=entity)
      moving = "moving"

      attributes = self.get_state(entity, attribute="attributes")
      if coverState != moving:
        self.set_state(entity, state=moving, attributes=attributes)
      else:
        state = ("closed", "open")[float(self.get_state(f"sensor.{pos}")) > 0.0]
        self.set_state(entity, state=state, attributes=attributes)

    def getService(self, state: str, entity: str, data: dict) -> str:
      services = {
          "open": "close_cover",
          "closed": "open_cover",
          "moving": "stop_cover",
          "stop": "stop_cover"
      }
      return services[state]

    def setRollersPosition(self, event_name: str, data: dict, kwargs: dict) -> None:

      mode = self.getKey(data, "mode")
      sender = self.getKey(data, "sender") or "HUB"
      trid = self.getKey(data, "trid")

      state = ("CLOSED","OPEN")["athome" == mode]
      position = int(float(self.get_state(f"input_number.rollershutter_{mode}_position")))

      self.log(f"Setting Rollers position at {position}%")
      self.call_service("cover/set_cover_position", entity_id="group.rollershutters", position=position)

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

    def getKey(self, data: dict, key: str) -> str:
      if "data" in data:
          data = data["data"]
      if key in data:
          return data[key]
      if "event" in data and key in data["event"]:
          return data["event"][key]

      return ""
