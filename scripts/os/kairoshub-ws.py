from flask import Flask
import paho.mqtt.client as paho

client = paho.Client()
client.username_pw_set("mqtt_kairos", "kairos!")
client.connect("localhost", 1884)

app = Flask(__name__)


@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/network/wifi/auth/<ssid>/<pwd>')
def networkAuth(ssid, pwd):
    app.logger.info("Wifi auth params detected")
    client.publish("kairostech/command", "WIFIAUTH_"+ssid+"_"+pwd, qos=1, retain=True)
    return "OK"




def on_connect(client, userdata, flags, rc):
    app.logger.info("Connected to the broker")

def on_disconnect(client, userdata, rc):
    if rc != 0:
        app.logger.warning("Disconnected from the broker, trying to reconnect..")
        client.reconnect()


client.on_disconnect = on_disconnect
client.on_connect = on_connect

client.loop_start()