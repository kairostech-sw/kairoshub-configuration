import hassapi as hass
from datetime import datetime, timedelta

class KairoshubLights(hass.Hass):

    def initialize(self):
        self.listen_event(self.lightControl, "AD_LIGHT_ZONE_CONTROL")
        self.listen_event(self.copyLights, "AD_COPY_LIGHTS")
        self.listen_event(self.lightProgram, "AD_LIGHTS_PROGRAM")
        self.listen_event(self.lightToggle, "AD_LIGHTS_ON")
        self.listen_event(self.lightToggle, "AD_LIGHTS_OFF")
        self.listen_event(self.lightSceneAutomation, "AD_AUTOMATIC_LIGHTS")

    def turnOn(self, sender):
        self.log("Turning Lights on", level="INFO")
        self.turn_on("group.lights")
        self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=sender, ncode="LIGHTS_ON", severity="NOTICE", kwargs={"zone":"all"})

    def turnOff(self, sender):
        self.log("Turning Lights off", level="INFO")
        self.turn_off("group.lights")
        self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=sender, ncode="LIGHTS_OFF", severity="NOTICE", kwargs={"zone":"all"})

    def lightToggle(self, event_name, data, kwargs):
        sender = data["data"]["sender"] if "data" in data else data["sender"]

        if "ON" in event_name:
            self.turnOn(sender)
        elif "OFF" in event_name:
            self.turnOff(sender)

    def lightProgram(self, event_name, data, kwargs):
        now = datetime.strptime(self.get_state("sensor.date_time_iso"),"%Y-%m-%dT%H:%M:%S")
        day = int(datetime.strftime(now,"%w"))
        date = now.strftime("%Y-%m-%dT")
        on_time = datetime.strptime(date+data['on_time'],"%Y-%m-%dT%H:%M:%S")
        off_time = datetime.strptime(date+data["off_time"],"%Y-%m-%dT%H:%M:%S")

        if on_time > off_time:
            off_time = now+timedelta(days=1)

        zone_id = data["zone"]
        mode = data["mode"]
        lights = self.get_state("light.group_lz{}".format(zone_id), attribute="entity_id")

        if mode == "Feriali" and day%6 == 0: return
        elif mode == "Festivi" and day%6 > 0: return
        if on_time<=now<off_time:
            self.log("Turning on lights in zone %s",zone_id)
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=data["sender"], ncode="LIGHTS_ON", severity="NOTICE", kwargs={"zone": zone_id, "mode": "Programmato"})
            for light in lights:
                self.call_service("light/turn_on", entity_id=light)
        elif off_time<=now and self.get_state("light.group_lz{}".format(zone_id)) == "on":
            self.log("Turning off lights in zone %s",zone_id)
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=data["sender"], ncode="LIGHTS_OFF", severity="NOTICE", kwargs={"zone": zone_id, "mode": "Programmato"})
            for light in lights:
                self.call_service("light/turn_off", entity_id=light)
        else:
            self.log("The program is not active right now")

    def lightControl(self, event_name, data, kwargs):

        light = data["data"]["light"]
        light_id = light[light.find("z")+1:]
        action = self.get_state(light)

        self.log("Turning %s lights in zone %s", action, light_id, level="INFO")

        switch_light_topic = "shellies/LZ{}/relay/0/command".format(light_id)
        white_light_topic = "shellies/LZ{}/white/0/command".format(light_id)
        color_light_topic = "shellies/LZ{}/color/0/command".format(light_id)

        if action != "unavailable" or action != "unknown":
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", sender=data["data"]["sender"], ncode="LIGHTS_{}".format(action.upper()), severity="NOTICE", kwargs={"zone":light_id, "mode": None})

            self.fire_event("AD_MQTT_PUBLISH",topic=switch_light_topic,payload=action)
            self.fire_event("AD_MQTT_PUBLISH",topic=white_light_topic,payload=action)
            self.fire_event("AD_MQTT_PUBLISH",topic=color_light_topic,payload=action)

    def copyLights(self, event_name, data, kwargs):

        zone = data["zone"]
        self.turn_off(zone)
        zone_id = zone.split("zn")[1]
        self.log("Copying light from Zone %s to all lights in the same zone")

        light_groups = self.get_state("light.group_lz{}00".format(zone_id[0]), attribute="entity_id")
        color_rgbw = self.get_state("light.lcz{}".format(zone_id), attribute="rgbw_color")
        color_brightness = self.get_state("light.lcz{}".format(zone_id), attribute="brightness")

        white_brightness = self.get_state("light.lwz{}".format(zone_id), attribute="brightness")
        self.log("color: %s", color_rgbw, level="DEBUG")
        self.log("white: %s", white_brightness, level="DEBUG")

        if "rgbw_color" in color_rgbw:
            color_payload = {"turn": "on", "red": color_rgbw[0], "green": color_rgbw[1], "blue": color_rgbw[2], "white": color_rgbw[3], "gain": color_brightness}
        else:
            color_payload = {"turn": "off"}
        if white_brightness:
            white_payload = {"turn": "on", "brightness": round(white_brightness/2.55)}
        else:
            white_payload = {"turn": "off"}

        for light_group in light_groups:
            light_group_id = light_group.split("z")[1]
            white_light_topic = "shellies/LZ{}/white/0/set".format(light_group_id)
            color_light_topic = "shellies/LZ{}/color/0/set".format(light_group_id)

            self.fire_event("AD_MQTT_PUBLISH",topic=color_light_topic,payload=str(color_payload))
            self.fire_event("AD_MQTT_PUBLISH",topic=white_light_topic,payload=str(white_payload))

    def lightSceneAutomation(self, event_name, data, kwargs):
      action = data["action"]
      service = f"light/turn_{action}"
      lights = self.get_state("group.lights", attribute="entity_id")
      for zone in lights:
        zoneSetting = self.get_state(f"input_select.zn{zone[-3:]}")
        if zoneSetting == "Automatico":
            self.call_service(service, entity_id="group.lights")