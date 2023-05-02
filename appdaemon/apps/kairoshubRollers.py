import time
import hassapi as hass

class KairoshubRollers(hass.Hass):

    def initialize(self):
        self.listen_event(self.rollersControl, "AD_ROLLERS_CONTROL")
        self.listen_event(self.setRollersPosition, "AD_SET_ROLLERS_POS")

    def rollersControl(self, event_name, data, kwargs):

      services = {
         "open": "cover/close_cover",
         "closed": "cover/open_cover",
         "moving": "cover/stop_cover"
      }
      group_state = self.get_state("group.rollershutters")
      group_attributes = self.get_state("group.rollershutters", attribute="attributes")
      service = services[group_state]

      self.log("Sending Command %s", service, level="INFO")
      self.call_service(service, entity_id="group.rollershutters")
      state = "moving"

      if group_state != state:
        self.set_state("group.rollershutters", state=state, attributes=group_attributes)
      else:
        state = ("closed","open")[float(self.get_state("sensor.tapparelle")) > 0.0]
        self.set_state("group.rollershutters", state=state, attributes=group_attributes)

    def setRollersPosition(self, event_name, data, kwargs):

      if "data" in data:
        mode= data["data"]["mode"]
        sender = data["data"]["event"]["sender"]
      else:
        mode = data["mode"]
        sender = "HUB"

      position = int(float(self.get_state(f"input_number.rollershutter_{mode}_position")))

      self.log("Setting Rollers position at %s\%", position)
      self.call_service("cover/set_cover_position",entity_id="group.rollershutters", position=position)

      state = ("CLOSED","OPEN")["athome" == mode]
      time.sleep(30)
      self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=sender, severity="NOTICE", ncode=f"ROLLERS_{state}", kwargs={"pos": position})