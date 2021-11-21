import mqttapi as mqtt

class AsyncMQTTHelper(mqtt.Mqtt):

    def initialize(self):
        self.listen_event(self.publishOnTopic, "APPDAEMON_MQTT_PUBLISH")

    def publishOnTopic(self, event_name, data, kwargs):
        self.log("event name: %s data: %s", event_name, data)
        self.mqtt_publish(data['topic'], data['command'])