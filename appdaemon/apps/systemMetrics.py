import hassapi as hass

class systemMetrics(hass.Hass):

    def initialize(self):
        self.listen_event(self.ha_event,"AD_SYSTEM_METRICS")

    def ha_event(self, event_name, data, kwargs):
        
        self.log("Retrieving System Metrics")

        statMessage = {}

        systemCode                           = self.get_state("input_text.system_code")
        statMessage["disk_use"]              = self.get_state("sensor.disk_use_percent")
        statMessage["memory_use"]            = self.get_state("sensor.memory_use_percent")
        statMessage["processor_use"]         = self.get_state("sensor.processor_use")
        statMessage["processor_temperature"] = self.get_state("sensor.processor_temperature")
        statMessage["last_boot"]             = self.get_state("sensor.last_boot")
        statMessage["processor_max_use"]     = self.get_state("sensor.processor_use",attribute="max_value")

        self.log("System Metrics: %s", statMessage, level="INFO")

        eventData = {
            "eventType" : "TECHNICAL",
            "systemCode": systemCode,
            "platform" : "HASSIO_EVENT",
            "message" : "STATISTICS PUSH",
            "technicalMessage": statMessage
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="HASSIO_SYSTEM_METRICS", message=eventData)

