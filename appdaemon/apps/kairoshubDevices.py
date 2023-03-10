import hassapi as hass

class KairoshubDevices(hass.Hass):

  def initialize(self):
    self.listen_event(self.installedDevices, "AD_INSTALLED_DEVICES")
    self.listen_event(self.triggerAttributesUpdate, "AD_SHELLY_UPDATE")
    self.listen_event(self.setShellyAsleep, "AD_SHELLY_ASLEEP")

  def installedDevices(self, event_name, data, kwargs):

    self.log("Setting installed devices status", level="INFO")
    devices = data["data"]["technicalMessage"]["devices"]

    for device in devices:
      self.set_state("sensor."+device.upper(), state="idle")
    self.fire_event("AD_MQTT_PUBLISH", topic="shellies/command", payload="announce")
    self.fire_event("AD_MQTT_PUBLISH", topic="shellies/command", payload="update")

  def triggerAttributesUpdate(self, event_name, data, kwargs):

    entity = data["entity"].split(".")[1].upper()
    if "TH" in entity:
      payload = str({'id':1, 'src': 'shellies/{}/status/info'.format(entity), 'method': 'Shelly.GetStatus'})
      topic = "shellies/{}/rpc".format(entity)

      self.log("Updating %s values", entity, level="INFO")
      self.fire_event("AD_MQTT_PUBLISH", topic=topic, payload=payload)

  def setShellyAsleep(self, event_name, data , kwargs):

    if "TH" in data["entity"]:
      attr = self.get_state(data["entity"], attribute="attributes")
      attr["has_update"] = False if attr["has_update"] == {} else attr["has_update"]

      self.log("Setting %s to sleep", data["entity"], level="INFO")
      self.set_state(data["entity"], state="asleep", attributes=attr)