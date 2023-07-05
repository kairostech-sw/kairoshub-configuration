import hassapi as hass
import re, json
import http.client
from base64 import b64encode


class KairoshubDevices(hass.Hass):

    def initialize(self):
        self.listen_event(self.installedDevices, "AD_DEVICE_INSTALLED")
        self.listen_event(self.triggerAttributesUpdate, "AD_SHELLY_UPDATE")
        self.listen_event(self.setShellyAsleep, "AD_SHELLY_ASLEEP")
        self.listen_event(self.signalNotification, "AD_SHELLY_SIGNAL_CHECK")
        self.listen_event(self.rollersCalibrate, "AD_ROLLERS_RECALIBRATE")
        self.listen_event(self.rollersCalibrate, "AD_ROLLERS_RECALIBRATE_ALL")
        self.listen_event(self.trvsCalibrate, "AD_TRVS_RECALIBRATE")
        self.listen_event(self.trvsCalibrate, "AD_TRVS_RECALIBRATE_ALL")

    def installedDevices(self, event_name: str, data: dict, kwargs: dict) -> None:

        self.log("Setting installed devices status", level="INFO")
        devices = data["data"]["technicalMessage"]["devices"]

        for device in devices:
            if not device["deviceId"].isdigit():
                self.set_state("sensor."+device["deviceId"].lower(), state="idle", attributes={
                               "friendly_name": device["deviceId"].upper()})
                self.activateZone(device["deviceId"])

        self.fire_event("AD_MQTT_PUBLISH",
                        topic="shellies/command", payload="announce")
        self.fire_event("AD_MQTT_PUBLISH",
                        topic="shellies/command", payload="update")

    def signalNotification(self, event_name: str, data: dict, kwargs: dict) -> None:
        devices = self.get_state("sensor", copy=False)
        self.log("Checking devices signal", level="INFO")

        for device in devices:
            if re.search("^sensor.*(RS|TV|TH|LZ)\d{3,4}$", device, re.IGNORECASE) and self.get_state(device) != "unknown" and self.get_state(device) != "unavailable":
                signal = self.get_state(device, attribute="rssi")
                deviceName = self.get_state(device, attribute="friendly_name")
                notyInfo = {
                    "sender": "HUB",
                    "ncode": "",
                    "severity": "ALERT",
                    "entity": device,
                    "kwargs": {
                        "signal": -1,
                        "entity_id": deviceName,
                    }
                }

                if signal == None:
                    self.log("The device %s has no signal",
                             deviceName, level="WARNING")
                    notyInfo["ncode"] = "NO_SIGNAL"
                    self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

                elif signal < -80:
                    self.log("The device %s has very low signal",
                             deviceName, level="WARNING")
                    notyInfo["ncode"] = "VERY_LOW_SIGNAL"
                    notyInfo["kwargs"]["signal"] = signal
                    self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

                elif signal >= -80 and signal < -65:
                    self.log("The device %s has low signal",
                             deviceName, level="INFO")
                    notyInfo["ncode"] = "LOW_SIGNAL"
                    notyInfo["severity"] = "NOTICE"
                    notyInfo["kwargs"]["signal"] = signal
                    self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

                else:
                    self.log("The device %s has good signal",
                             deviceName, level="DEBUG")

    def triggerAttributesUpdate(self, event_name: str, data: dict, kwargs: dict) -> None:

        entity = data["entity"].split(".")[1].upper()
        if "TH" in entity:
            payload = json.dumps(
                {"id": 1, "src": "shellies/{}/status/info".format(entity), "method": "Shelly.GetStatus"})
            topic = "shellies/{}/rpc".format(entity)

            self.log("Updating %s values", entity, level="INFO")
            self.fire_event("AD_MQTT_PUBLISH", topic=topic, payload=payload)

    def setShellyAsleep(self, event_name: str, data: dict, kwargs: dict) -> None:
        if "TH" in data["entity"].upper():
            attributes = self.get_state(data["entity"], attribute="attributes")
            attributes["has_update"] = False if attributes["has_update"] == {
            } else attributes["has_update"]

            self.log("Setting %s to sleep", data["entity"], level="INFO")
            self.set_state(data["entity"], state="asleep",
                           attributes=attributes)

    def rollersCalibrate(self, event_name: str, data: dict, kwargs: dict) -> None:
        devices = self.get_state("sensor", copy=False)
        calibrateAll = "ALL" in event_name
        self.log("Checking Rollers to calibrate", level="INFO")

        for device in devices:
            if re.search("^sensor\.rs.*\d{2,4}$", device) and self.get_state(device) != "unknown" and self.get_state(device) != "unavailable":
                if calibrateAll or not self.get_state(device, attribute="calibrated"):
                    self.fire_event("AD_KAIROSHUB_NOTIFICATION", ncode="NOT_CALIBRATED",
                                    sender="HUB", severity="NOTICE", entity=device)
                    deviceName = device.split(".")[1].upper()
                    self.log("Calibrating Shelly %s", deviceName, level="INFO")
                    self.fire_event(
                        "AD_MQTT_PUBLISH", topic=f"shellies/{deviceName}/roller/0/command", payload="rc")

    def trvsCalibrate(self, event_name: str, data: dict, kwargs: dict) -> None:
        devices = self.get_state("sensor", copy=False)
        calibrateAll = "ALL" in event_name
        self.log("Checking TRVs to calibrate", level="INFO")

        for device in devices:
            if re.search("^sensor\.tv.*\d{4}$", device) and self.get_state(device) != "unknown" and self.get_state(device) != "unavailable":
                if calibrateAll or not self.get_state(device, attribute="calibrated"):
                    ip = self.get_state(device, attribute="ip")
                    self.fire_event("AD_KAIROSHUB_NOTIFICATION", ncode="NOT_CALIBRATED",
                                    sender="HUB", severity="NOTICE", entity=device)
                    self.log("Calibrating Shelly %s", device.split(
                        ".")[1].upper(), level="INFO")
                    self.HTTPCommand(ip, url="/calibrate")

    def HTTPCommand(self, ip, url):
        connection = http.client.HTTPConnection(ip)
        username = "kairostech"
        password = "kairostech!"
        connection.request("GET", url)
        response = connection.getresponse()
        if response.getcode() == 401:
            headers = {'Authorization': "Basic " +
                       b64encode(f"{username}:{password}".encode('utf-8')).decode("ascii")}
            connection.request("GET", url, headers=headers)
        connection.close()

    def activateZone(self, deviceId: str) -> None:
        zoneId = re.search("\d", deviceId).group()
        self.turn_on(f"input_boolean.zn{zoneId}00_active")
