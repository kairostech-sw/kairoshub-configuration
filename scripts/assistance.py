import os
import paho.mqtt.client as paho
from subprocess import check_output

TOPIC_COMMAND               = "kairostech/command"
TOPIC_STATE                 = "kairostech/state"
TOPIC_VPN_PROCESS           = "kairostech/state/vpn_process"

ASSISTANCE_START_COMMAND    = "ASSISTANCE_START"
ASSISTANCE_STOP_COMMAND     = "ASSISTANCE_STOP"

global vpn_pid

def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))

    payload = msg.payload.decode("utf-8")
    if msg.topic == TOPIC_COMMAND :
        #ASSISTANCE_START_COMMAND
        if payload == ASSISTANCE_START_COMMAND:
            os.system("sudo openvpn --daemon --config /home/pi/kairoshome.ovpn")
            vpn_pid = check_output(["pidof","openvpn"])
            client.publish(TOPIC_VPN_PROCESS, vpn_pid, qos=1, retain=True)
            client.publish(TOPIC_STATE, "MAINTENEANCE", qos=1, retain=True)

            return

        #ASSISTANCE_STOP_COMMAND    
        if payload == ASSISTANCE_STOP_COMMAND:
            vpn_pid = check_output(["pidof","openvpn"])
            os.system("sudo kill "+vpn_pid.decode("utf-8"))
            client.publish(TOPIC_STATE, "NORMAL", qos=1, retain=True)
            client.publish(TOPIC_VPN_PROCESS, "", qos=1, retain=True)

            return 


def on_publish(client, userdata, mid):
    print("mid: "+str(mid))

def on_connect(client, userdata, flags, rc):
    print("CONNACK received with code %d." % (rc))

client = paho.Client()
client.username_pw_set("mqtt_kairos", "kairos!")
client.on_message = on_message
client.on_connect = on_connect
client.on_publish = on_publish
client.connect("localhost",1884)

client.subscribe(TOPIC_COMMAND)

client.loop_forever()
