import os, time
import paho.mqtt.client as paho
from subprocess import check_output

TOPIC_COMMAND               = "kairostech/command"
TOPIC_STATE                 = "kairostech/state"
TOPIC_STATE_DETAIL          = "kairostech/state/detail"
TOPIC_VPN_PROCESS           = "kairostech/state/vpn_process"

ASSISTANCE_START_COMMAND    = "ASSISTANCE_START"
ASSISTANCE_STOP_COMMAND     = "ASSISTANCE_STOP"
KAIROSHUB_RELEASE_COMMAND   = "KAIROSHUB_RELEASE_CHECK"

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
        
        #RELEASE CHECK COMMAND
        if payload == KAIROSHUB_RELEASE_COMMAND:
            client.publish(TOPIC_STATE, "MAINTENEANCE", qos=1, retain=True)
            client.publish(TOPIC_STATE_DETAIL, "CHECKING FOR A NEW RELEASE OF HAKAIROS CONFIGURATION", qos=1, retain=True)
            os.system("sh /home/pi/workspace/hakairos-configuration/scripts/os/release_hakairos-configuration.sh")
            time.sleep(30)
            client.publish(TOPIC_STATE_DETAIL, "CHECKING FOR A NEW RELEASE OF KAIROSHUB", qos=1, retain=True)
            os.system("sh /home/pi/workspace/hakairos-configuration/scripts/os/release_kairoshub.sh")
            time.sleep(30)
            client.publish(TOPIC_STATE, "NORMAL", qos=1, retain=True)
            client.publish(TOPIC_STATE_DETAIL, "CHECKING FOR A NEW SOFTWARE RELEASE COMPLETE", qos=1, retain=True)
            return

        if "SET_CONSUMER_TOPIC_" in payload: 
            systemCode : str = payload[-6:]
            if "00" in systemCode:
                systemCode = systemCode.upper()
                os.system("sed -i 's/KAIROS_XXXXXX/"+systemCode+"/' /home/pi/workspace/hakairos-configuration/hakafka/hakafka-configuration.yaml")
                os.system("docker restart kairoshub")


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
