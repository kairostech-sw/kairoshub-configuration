import hassapi as hass

class KairoshubRollers(hass.Hass):

    def initialize(self):
        self.listen_event(self.rollersControl, "AD_ROLLERS_CONTROL")
        self.listen_event(self.setRollersPosition, "AD_SET_ROLLERS_POS")

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
