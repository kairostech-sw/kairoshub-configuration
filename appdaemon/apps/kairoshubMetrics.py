import hassapi as hass

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

        self.log("Retrieving Entity Metrics", level="INFO")

        entityMessage = {}

        systemCode                  = self.get_state("input_text.system_code")
        entityMessage["thermostat"] = self.get_state("sensor.temperatura")
        entityMessage["rollers"]    = self.get_state("group.rolershutters")
        entityMessage["heating"]    = self.get_state("switch.sw_thermostat")
        entityMessage["power"]      = self.get_state("sensor.em_assorbimento")

        self.log("Entity Metrics: %s", entityMessage, level="INFO")

        eventData = {
            "eventType" : "ENTITY_PUSH",
            "systemCode": systemCode,
            "message" : "ENTITY_PUSH",
            "technicalMessage": entityMessage
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=eventData)
