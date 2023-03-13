import hassapi as hass
import re
import json

class KairoshubDevices(hass.Hass):

  def initialize(self):
    self.listen_event(self.installedDevices, "AD_INSTALLED_DEVICES")
    self.listen_event(self.triggerAttributesUpdate, "AD_SHELLY_UPDATE")
    self.listen_event(self.setShellyAsleep, "AD_SHELLY_ASLEEP")
    self.listen_event(self.signalNotification, "AD_SHELLY_SIGNAL_CHECK")

  def installedDevices(self, event_name, data, kwargs):

    self.log("Setting installed devices status", level="INFO")
    devices = data["data"]["technicalMessage"]["devices"]

    for device in devices:
      self.set_state("sensor."+device.lower(), state="idle", attributes={"friendly_name": device.lower()})
    self.fire_event("AD_MQTT_PUBLISH", topic="shellies/command", payload="announce")
    self.fire_event("AD_MQTT_PUBLISH", topic="shellies/command", payload="update")

  def signalNotification(self, event_name, data, kwargs):
    devices = self.get_state("sensor", copy=False)
    self.log("Checking devices signal", level="INFO")

    for device in devices:
      if re.search("^sensor.*\d{4}$",device) and self.get_state(device) != "unknown":
        signal = self.get_state(device, attribute="rssi")
        if signal == None:
          self.log("The device %s has no signal", device.split(".")[1], level="INFO")
          self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender="HUB", ncode="NO_SIGNAL", severity="ALERT", entity=device, kwargs={"signal": -1, "entity_id": device})

        elif signal < -80:
          self.log("The device %s has very low signal", device.split(".")[1], level="INFO")
          self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender="HUB", ncode="VERY_LOW_SIGNAL", severity="ALERT", entity=device, kwargs={"signal":signal, "entity_id": device})

        elif signal >= -80 and signal < -65:
          self.log("The device %s has low signal", device.split(".")[1], level="INFO")
          self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender="HUB", ncode="LOW_SIGNAL", severity="NOTICE", entity=device, kwargs={"signal":signal, "entity_id": device})

        else:
          self.log("The device %s has good signal", device.split(".")[1], level="INFO")

  def triggerAttributesUpdate(self, event_name, data, kwargs):

    entity = data["entity"].split(".")[1].upper()
    if "TH" in entity:
      payload = json.dumps({"id":1, "src": "shellies/{}/status/info".format(entity), "method": "Shelly.GetStatus"})
      topic = "shellies/{}/rpc".format(entity)

      self.log("Updating %s values", entity, level="INFO")
      self.fire_event("AD_MQTT_PUBLISH", topic=topic, payload=payload)

  def setShellyAsleep(self, event_name, data , kwargs):

    if "TH" in data["entity"].upper():
      attr = self.get_state(data["entity"], attribute="attributes")
      attr["has_update"] = False if attr["has_update"] == {} else attr["has_update"]

      self.log("Setting %s to sleep", data["entity"], level="INFO")
      self.set_state(data["entity"], state="asleep", attributes=attr)