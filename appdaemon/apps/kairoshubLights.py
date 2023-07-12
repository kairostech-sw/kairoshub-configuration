import hassapi as hass
from datetime import datetime, timedelta
import json, re

class KairoshubLights(hass.Hass):

    datetimeFormat = "%Y-%m-%dT%H:%M:%S"

    def initialize(self):
        self.listen_event(self.lightControl, "AD_LIGHT_ZONE_CONTROL")
        self.listen_event(self.copyLights, "AD_COPY_LIGHTS")
        self.listen_event(self.lightProgram, "AD_LIGHTS_PROGRAM")
        self.listen_event(self.lightToggle, "AD_LIGHTS_ON")
        self.listen_event(self.lightToggle, "AD_LIGHTS_OFF")
        self.listen_event(self.lightScene, "AD_AUTOMATIC_LIGHTS")
        self.listen_event(self.lightSceneChange, "AD_SCENE_CHANGE")
        self.listen_event(self.saveManualColor, "AD_MANUAL_LIGHT_CHANGE")

    def lightToggle(self, event_name: str, data: dict, kwargs: dict) -> None:

        notyInfo = {
            "sender": self.getKey(data, "sender") or "HUB",
            "ncode": "",
            "severity": "NOTICE",
            "kwargs": {
                "zone": "all"
            }
        }
        trid = self.getKey(data, "trid"),
        if trid:
            notyInfo["trid"] = trid

        if "ON" in event_name:
            notyInfo["ncode"] = "LIGHTS_ON"
            self.manualTurnOn(notyInfo)
        elif "OFF" in event_name:
            notyInfo["ncode"] = "LIGHTS_OFF"
            self.turnOff("group.lights", notyInfo)

    def lightProgram(self, event_name: str, data: dict, kwargs: dict) -> None:
        now = datetime.strptime(self.get_state("sensor.date_time_iso"), self.datetimeFormat)
        day = int(datetime.strftime(now,"%w"))
        date = now.strftime("%Y-%m-%dT")
        onTime = datetime.strptime(date + data['on_time'], self.datetimeFormat)
        offTime = datetime.strptime(date + data["off_time"], self.datetimeFormat)
        zoneId = data["zone"]
        mode = data["mode"]

        if mode == "Feriali" and day % 6 == 0: return None
        elif mode == "Festivi" and day % 6 > 0: return None

        if onTime > offTime:
            offTime = now + timedelta(days=1)

        lights = f"light.group_lz{zoneId}"

        notyInfo = {
            "sender": self.getKey(data, "sender"),
            "ncode": "",
            "severity": "NOTICE",
            "kwargs": {
                "zone": zoneId,
                "mode": "Programmato"
            }
        }
        trid = self.getKey(data, "trid"),
        if trid:
            notyInfo["trid"] = trid

        if onTime <= now < offTime:
            self.log("Turning on lights in zone %s",zoneId)
            notyInfo["ncode"] = "LIGHTS_ON"
            self.turn_on("input_boolean.light_program1_on")
            self.turnOn(lights, notyInfo)
        elif offTime <= now:
            self.log("Turning off lights in zone %s",zoneId)
            notyInfo["ncode"] = "LIGHTS_OFF"
            self.turn_off("input_boolean.light_program1_on")
            self.turnOff(lights, notyInfo)
        else:
            self.log("The program is not active right now")

    def lightControl(self, event_name: str, data: dict, kwargs: dict) -> None:

        light = self.getKey(data, "light")
        lightId = light[light.find("z")+1:]
        action = self.get_state(light)

        self.log("Turning %s lights in zone %s", action, lightId, level="INFO")

        switchLightTopic = f"shellies/LZ{lightId}/relay/0/command"
        whiteLightTopic = f"shellies/LZ{lightId}/white/0/command"
        colorLightTopic = f"shellies/LZ{lightId}/color/0/command"

        if action != "unavailable" or action != "unknown":
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=self.getKey(data, "sender"), ncode=f"LIGHTS_{action.upper()}", severity="NOTICE", kwargs={ "zone": lightId, "mode": None})

            self.fire_event("AD_MQTT_PUBLISH", topic=switchLightTopic, payload=action)
            self.fire_event("AD_MQTT_PUBLISH", topic=whiteLightTopic, payload=action)
            self.fire_event("AD_MQTT_PUBLISH", topic=colorLightTopic, payload=action)

    def copyLights(self, event_name: str, data: dict, kwargs: dict) -> None:
        zone = data["zone"]
        self.turn_off(zone)
        zoneId = zone.split("zn")[1]

        self.log("Copying light from Zone %s to all lights in the same zone", zoneId, level="INFO")

        lightGroups = self.get_state(f"light.group_lz{zoneId[0]}00", attribute="entity_id")

        colorRGBW = self.get_state(f"light.lcz{zoneId}", attribute="rgbw_color")
        colorBrightness = self.get_state(f"light.lcz{zoneId}", attribute="brightness")

        whiteBrightness = self.get_state(f"light.lwz{zoneId}", attribute="brightness")

        self.log("color: %s", colorRGBW, level="DEBUG")
        self.log("white: %s", whiteBrightness, level="DEBUG")

        if "rgbw_color" in colorRGBW:
            colorPayload = {"turn": "on", "red": colorRGBW[0], "green": colorRGBW[1], "blue": colorRGBW[2], "white": colorRGBW[3], "gain": colorBrightness}
        else:
            colorPayload = {"turn": "off"}
        if whiteBrightness:
            whitePayload = {"turn": "on", "brightness": round(whiteBrightness/2.55)}
        else:
            whitePayload = {"turn": "off"}

        for lightGroup in lightGroups:
            lightGroupId = lightGroup.split("z")[1]
            whiteLightTopic = f"shellies/LZ{lightGroupId}/white/0/set"
            colorLightTopic = f"shellies/LZ{lightGroupId}/color/0/set"

            self.fire_event("AD_MQTT_PUBLISH", topic=colorLightTopic, payload=str(colorPayload))
            self.fire_event("AD_MQTT_PUBLISH", topic=whiteLightTopic, payload=str(whitePayload))

    def lightScene(self, event_name: str, data: dict, kwargs: dict) -> None:
        action = self.getKey(data, "action") == "on"
        scene = self.getKey(data, "scene") or "day"

        if action:
            self.turn_on(f"input_boolean.scene_{scene}_active")
            zones = self.get_state("group.lights", attribute="entity_id")
            for zone in zones:
                rooms = self.get_state(zone, attribute="entity_id")
                for room in rooms:
                    roomId = self.getEntityId(room)
                    self.updateScene(scene, roomId)

        else:
            self.turn_off("group.lights")
            self.turn_off(f"input_boolean.scene_{scene}_active")

    def lightSceneChange(self, event_name: str, data: dict, kwargs: dict) -> None:
        scene = self.getKey(data, "scene")
        triggerEntity = self.getKey(data, "entity")
        entityId = self.getEntityId(triggerEntity)

        if self.get_state(f"input_boolean.scene_{scene}_active") == "on":
            if entityId.endswith("00"):
                for entityLight in self.get_state(f"light.group_lz{entityId}"):
                    self.updateScene(scene, self.getEntityId(entityLight))
            else:
                self.updateScene(scene, entityId)

    def updateScene(self, scene: str, entityId: str) -> None:
        colorEntity = f"input_text.lcz{entityId}_{scene}"
        whiteEntity = f"input_text.lwz{entityId}_{scene}"

        colorState = self.get_state(colorEntity, attribute="all")
        whiteState = self.get_state(whiteEntity, attribute="all")

        if colorState["state"] == whiteState["state"] == "off":
            self.turnOn(f"light.group_lz{entityId}", {}, False)
            return None

        attributes = self.getAttributes(colorState, whiteState)

        self.turn_on(entity_id=f"light.group_lz{entityId}", **attributes)

    def getEntityId(self, entity) -> str:
        return re.search("(\d+)", entity).group()

    def getAttributes(self, color: dict, white: dict) -> dict:
        colorState = self.getKey(color, "state") or "unknown"

        data = color
        if colorState == "unknown":
            data = white

        rgbw = self.getKey(data["attributes"], "rgbw_color") or [255, 255, 255, 255]
        brightness = self.getKey(data["attributes"], "brightness") or 255
        if type(rgbw) == str:
            rgbw = rgbw.split(",")
        attributes = {
            "rgbw_color": [int(i) for i in rgbw],
            "brightness": brightness
        }

        supported_color_modes = self.getKey(data["attributes"], "supported_color_modes")
        if supported_color_modes != "brightness":
            attributes["brightness"] = round(float(brightness)/2.55)

        return attributes

    def saveManualColor(self, event_name: str, data: dict, kwargs: dict) -> None:
        zones = self.get_state("group.lights", attribute="entity_id")

        for zone in zones:
            rooms = self.get_state(zone, attribute="entity_id")
            for room in rooms:
                roomId = room[room.find("z")+1:]
                colorEntity = self.get_state(f"light.lcz{roomId}", attribute="all")
                whiteEntity = self.get_state(f"light.lwz{roomId}", attribute="all")

                colorAttr = self.getAttributes(colorEntity, colorEntity)
                whiteAttr = self.getAttributes(whiteEntity, whiteEntity)

                colorState = self.getKey(colorEntity, "state")
                whiteState = self.getKey(whiteEntity, "state")

                if colorState != "off":
                    self.set_state(f"input_text.lcz{roomId}_manual", state=colorState, attributes=colorAttr)
                if whiteState != "off":
                    self.set_state(f"input_text.lwz{roomId}_manual", state=whiteState, attributes=whiteAttr)

    def manualTurnOn(self, notyInfo: dict) -> None:
        zones = self.get_state("group.lights", attribute="entity_id")

        for zone in zones:
            rooms = self.get_state(zone, attribute="entity_id")
            for room in rooms:
                roomId = room[room.find("z")+1:]
                colorAttr = self.get_state(f"input_text.lcz{roomId}_manual", attribute="attributes")
                whiteAttr = self.get_state(f"input_text.lwz{roomId}_manual", attribute="attributes")

                rgbw = self.getKey(colorAttr, "rgbw_color") or [255, 255, 255, 255]
                colorBrightness = self.getKey(colorAttr, "brightness")
                colorPayload = json.dumps({"turn": "on", "red": rgbw[0], "green": rgbw[1], "blue": rgbw[2], "white": rgbw[3], "gain": colorBrightness})

                whiteBrightness = float(self.getKey(whiteAttr, "brightness") or 50)//2.55

                whitePayload = json.dumps({"turn": "on", "brightness": whiteBrightness})

                whiteLightTopic = f"shellies/LZ{roomId}/white/0/set"
                colorLightTopic = f"shellies/LZ{roomId}/color/0/set"

                self.fire_event("AD_MQTT_PUBLISH", topic=colorLightTopic, payload=colorPayload)
                self.fire_event("AD_MQTT_PUBLISH", topic=whiteLightTopic, payload=whitePayload)

        self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

    def turnOn(self, target: str, notyInfo: dict, sendNotification=True) -> None:
        self.log("Turning Lights on", level="INFO")
        self.turn_on(target)
        if sendNotification:
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

    def turnOff(self, target: str, notyInfo: dict) -> None:
        self.log("Turning Lights off", level="INFO")
        self.turn_off(target)
        self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

    def getKey(self, data: dict, key: str) -> str:
        if "data" in data:
            data = data["data"]
        if key in data:
            return data[key]
        if "event" in data and key in data["event"]:
            return data["event"][key]

        return ""
