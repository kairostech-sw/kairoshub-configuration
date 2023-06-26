import hassapi as hass

class KairoshubRollers(hass.Hass):

    def initialize(self):
        self.listen_event(self.rollersControl, "AD_ROLLERS_CONTROL")
        self.listen_event(self.setRollersPosition, "AD_SET_ROLLERS_POS")

    def rollersControl(self, event_name: str, data: dict, kwargs: dict) -> None:

      services = {
         "open": "cover/close_cover",
         "closed": "cover/open_cover",
         "moving": "cover/stop_cover"
      }
      groupState = self.get_state("group.rollershutters")
      groupAttributes = self.get_state("group.rollershutters", attribute="attributes")
      service = services[groupState]

      self.log("Sending Command %s", service, level="INFO")
      self.call_service(service, entity_id="group.rollershutters")
      state = "moving"

      if groupState != state:
        self.set_state("group.rollershutters", state=state, attributes=groupAttributes)
      else:
        state = ("closed","open")[float(self.get_state("sensor.tapparelle")) > 0.0]
        self.set_state("group.rollershutters", state=state, attributes=groupAttributes)

    def setRollersPosition(self, event_name: str, data: dict, kwargs: dict) -> None:

      mode = self.getKey(data, "mode")
      sender = self.getKey(data, "sender") or "HUB"
      trid = self.getKey(data, "trid")

      position = int(float(self.get_state(f"input_number.rollershutter_{mode}_position")))

      self.log(f"Setting Rollers position at {position}%")
      self.call_service("cover/set_cover_position", entity_id="group.rollershutters", position=position)

      state = ("CLOSED","OPEN")["athome" == mode]
      noty_info = {
         "ncode": f"ROLLERS_{state}",
         "sender": sender,
         "trid": trid,
         "severity": "NOTICE",
         "kwargs": {
            "pos": position
         }
      }
      self.fire_event("AD_KAIROSHUB_NOTIFICATION", **noty_info)
      self.fire_event("AD_ENTITY_METRICS")

    def getKey(self, data: dict, key: str) -> str:
      if "data" in data:
          data = data["data"]
      if key in data:
          return data[key]
      if "event" in data and key in data["event"]:
          return data["event"][key]

      return ""
