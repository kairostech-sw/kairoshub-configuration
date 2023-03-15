import hassapi as hass
import heatingManager

class KairoshubMetrics(hass.Hass):

    def initialize(self):
        self.listen_event(self.systemMetrics,"AD_SYSTEM_METRICS")
        self.listen_event(self.entityMetrics, "AD_ENTITY_METRICS")

    def systemMetrics(self, event_name, data, kwargs):
        self.log("Retrieving System Metrics", level="INFO")

        statMessage = {}

        systemCode                           = self.get_state("input_text.system_code")
        statMessage["disk_use"]              = self.get_state("sensor.stat_disk_use", default=-1.0)
        statMessage["memory_use"]            = self.get_state("sensor.stat_memory_use", default=-1.0)
        statMessage["processor_use"]         = self.get_state("sensor.stat_processor_use", default=-1.0)
        statMessage["processor_temperature"] = self.get_state("sensor.stat_processor_temperature", default=-1.0)
        statMessage["last_boot"]             = self.get_state("sensor.last_boot", default="")
        statMessage["processor_max_use"]     = self.get_state("sensor.stat_processor_use",attribute="max_value", default=-1.0)

        self.log("System Metrics: %s", statMessage, level="INFO")

        eventData = {
            "eventType" : "STATISTICS_PUSH",
            "systemCode": systemCode,
            "message" : "STATISTICS PUSH",
            "technicalMessage": statMessage
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)

    def entityMetrics(self, event_name, data, kwargs):

        entityMessage = {}

        systemCode                  = self.get_state("input_text.system_code")
        entityMessage["thermostat"] = self.get_state("sensor.temperatura")
        entityMessage["roller"]    = self.get_state("sensor.tapparelle")
        entityMessage["humidity"] = self.get_state("sensor.umidita")
        entityMessage["power"]      = self.get_state("sensor.em_assorbimento")
        entityMessage["hub"] = {}
        entityMessage["hub"]["state"] = self.get_state("sensor.system_state")

        thermostats=[]
        rollers=[]
        humidity=[]
        for group in self.get_state("group.zones", attribute="entity_id"):
            zone = self.get_state(group, attribute="entity_id")
            for room in zone:
                thermostats_state = {}
                rollers_state = {}
                humidity_state = {}
                room_name = room.split(".")[1]
                room_id = room_name.split("zn")[1]

                entity_state = self.get_state("sensor.tz"+room_id)
                if entity_state != "unknown":
                    thermostats_state["zone"] = room_name
                    thermostats_state["state"] = entity_state
                    thermostats_state["last_update"] = self.get_state("sensor.tz"+room_id, attribute="last_updated")
                    thermostats.append(thermostats_state)

                entity_state = self.get_state("sensor.rz"+room_id)
                if entity_state != "unknown":
                    rollers_state["zone"] = room_name
                    rollers_state["state"] = entity_state
                    rollers_state["last_update"] = self.get_state("sensor.rz"+room_id, attribute="last_updated")
                    rollers.append(rollers_state)

                entity_state = self.get_state("sensor.hz"+room_id)
                if entity_state != "unknown":
                    humidity_state["zone"] = room_name
                    humidity_state["state"] = entity_state
                    humidity_state["last_update"] = self.get_state("sensor.hz"+room_id, attribute="last_updated")
                    humidity.append(humidity_state)

        entityMessage["thermostats"]= thermostats
        entityMessage["rollers"]= rollers
        entityMessage["humidities"]= humidity

        entityMessage["heating"] = {}
        entityMessage["heating"]["state"] = 1 if self.get_state("switch.sw_thermostat") == "on" else 0

        active_program = heatingManager.HeatingManager.isHeatingProgramOn(self)
        if active_program > 0:
            entityMessage["heating"]["program"] = "program {}".format(active_program)
            entityMessage["heating"]["target"] = self.get_state("input_number.temperature_period{}".format(active_program))
        else :
            entityMessage["heating"]["program"] = "manual"
            entityMessage["heating"]["target"] = self.get_state("input_number.manual_heating_temp")

        self.log("Entity Metrics: %s", entityMessage, level="INFO")

        timestamp = self.get_state("sensor.date_time_iso")
        eventData = {
            "eventType" : "ENTITY_PUSH",
            "systemCode": systemCode,
            "message" : "ENTITY_PUSH",
            "technicalMessage": entityMessage,
            "timestamp": timestamp
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)
