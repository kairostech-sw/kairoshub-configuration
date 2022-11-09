import os, time
import paho.mqtt.client as paho
import logging
import json
import socket
from subprocess import check_output
from subprocess import CalledProcessError


TOPIC_COMMAND               = "kairostech/command"
TOPIC_STATE                 = "kairostech/state"
TOPIC_STATE_DETAIL          = "kairostech/state/detail"
TOPIC_VPN_PROCESS           = "kairostech/state/vpn_process"

TOPIC_HUB_OSVERSION             = "kairostech/os_version"
TOPIC_HUB_HOSTNAME              = "kairostech/hostname"
TOPIC_HUB_OWNER                 = "kairostech/owner"
TOPIC_HUB_SYSTEM_CODE           = "kairostech/system_code"

ASSISTANCE_START_COMMAND    = "ASSISTANCE_START"
ASSISTANCE_STOP_COMMAND     = "ASSISTANCE_STOP"
KAIROSHUB_RELEASE_COMMAND   = "KAIROSHUB_RELEASE_CHECK"

TOPIC_EXCHANGE_SERVICE_STATE= "kairostech/system/exchange_service"
TOPIC_EXCHANGE_SERVICE_CHECK= "kairostech/system/exchange_service/lastcheck" 
KAIROSHUB_ES_LOG_FILE       = "/home/pi/workspace/logs/exchange-services.log"
KAIROSHUB_INIT_FILE         = "/boot/kairoshub.json"

logging.basicConfig(filename=KAIROSHUB_ES_LOG_FILE, level=logging.INFO, format="%(asctime)s %(message)s")

global vpn_pid

def on_message(client, userdata, msg):
    logging.info("Incoming message on topic %s, with payload %s", msg.topic, str(msg.payload))

    payload = msg.payload.decode("utf-8")
    if msg.topic == TOPIC_COMMAND :
        logging.info("Incoming command: %s on topic: %s", payload, msg.topic )
        #ASSISTANCE_START_COMMAND
        if payload == ASSISTANCE_START_COMMAND:
            #check if already exists a vpn process
            try:
                vpn_pid = check_output(["pidof","openvpn"])
                logging.warning("VPN process is already up. Restoring state message to MAINTENEANCE.")
                #proced already up. Nothing to do. 
                client.publish(TOPIC_STATE, "MAINTENEANCE", qos=1, retain=True)
            except CalledProcessError:
                logging.info("Running VPN command..")
                os.system("sudo openvpn --daemon --config /home/pi/kairoshome.ovpn")
                vpn_pid = check_output(["pidof","openvpn"])
                logging.info("VPN PID: %s. Publishing state MAINTENEANCE and PID", vpn_pid.decode("utf-8"))
                client.publish(TOPIC_VPN_PROCESS, vpn_pid.decode("utf-8"), qos=1, retain=True)
                client.publish(TOPIC_STATE, "MAINTENEANCE", qos=1, retain=True)
           
            return

        #ASSISTANCE_STOP_COMMAND    
        if payload == ASSISTANCE_STOP_COMMAND:
            try:
                vpn_pid = check_output(["pidof","openvpn"])
                os.system("sudo kill "+vpn_pid.decode("utf-8"))
                client.publish(TOPIC_STATE, "NORMAL", qos=1, retain=True)
                client.publish(TOPIC_VPN_PROCESS, "", qos=1, retain=True)
            except CalledProcessError:
                logging.error("Error on killing VPN service. No process found.")

            return 
        
        #RELEASE CHECK COMMAND
        if payload == KAIROSHUB_RELEASE_COMMAND:
            try:
                msg = "CHECKING FOR A NEW RELEASE OF HAKAIROS CONFIGURATION"
                logging.info(msg)
                client.publish(TOPIC_STATE_DETAIL, msg, qos=1, retain=True)
                os.system("sh /home/pi/workspace/scripts/release_hakairos-configuration.sh")
                time.sleep(30)
                os.system("sudo chown -R pi:pi /home/pi/workspace/hakairos-configuration")
                msg = "CHECKING FOR A NEW RELEASE OF KAIROSHUB"
                logging.info(msg)
                client.publish(TOPIC_STATE_DETAIL, msg, qos=1, retain=True)
                os.system("sh /home/pi/workspace/scripts/release_kairoshub.sh")
                time.sleep(30)
                os.system("sudo chown -R pi:pi /home/pi/workspace/kairoshub")
                msg = "CHECKING FOR A NEW SOFTWARE RELEASE COMPLETE"
                logging.info(msg)
                client.publish(TOPIC_STATE_DETAIL, msg , qos=1, retain=True)
            except Exception as e:
                logging.error(e)

            return

        if "SET_CONSUMER_TOPIC_" in payload: 
            systemCode : str = payload[-6:]
            if "00" in systemCode:
                newFileData = None
                isFileDataChanged = False
                with open("/home/pi/workspace/hakairos-configuration/hakafka/hakafka-configuration.yaml", 'r') as file: 
                    filedata = file.read()
                    newFileData = filedata.replace("KAIROS_XXXXX", systemCode.upper())
                    if filedata in newFileData:
                        logging.info("consumer topic already set.")
                    else:
                        logging.info("setting up the consumer topic")
                        isFileDataChanged = True

                if isFileDataChanged:
                    with open("/home/pi/workspace/hakairos-configuration/hakafka/hakafka-configuration.yaml", 'w') as file:
                        file.write(newFileData)
                        os.system("docker restart kairoshub")

        if "KAIROSHUB_SYSTEM_EXCHANGE_CHECK" in payload: 
            client.publish(TOPIC_EXCHANGE_SERVICE_STATE, "ONLINE" , qos=1, retain=True)

def on_publish(client, userdata, mid):
    logging.debug("message id: %s",str(mid))

def on_connect(client, userdata, flags, rc):
    logging.info("Connected on broker. Received CONNACK code %d.", (rc))

    logging.info("Trying to read kairoshub init file")
    data = None
    try:
        f = open(KAIROSHUB_INIT_FILE)

        data = json.load(f)
        logging.info("Kairoshub init file loaded. content:  %s.", (data))

    except FileNotFoundError as e:
        logging.warning("kairoshub init file not found. Maybe due a old version of kairoshub OS. Skipping autoconfiguration..")

    if data:
        try:
            logging.info("Kairoshub autoconfiguration started.")

            try:
                logging.info("checking hostaname name.. ")
                currentHostname = socket.gethostname()
                logging.info("current hostname: %s, provided hostname: %s", currentHostname, data["hostname"])
                if currentHostname != data["hostname"]:
                    logging.info("Trying to change the hostname value into [%s]", data['hostname'])
                    os.system("sudo hostnamectl set-hostname "+data['hostname'])
                    currentHostname = socket.gethostname()
                    logging.info("new hostname value: %s. Attempt to HUB reboot..", currentHostname)
                    client.publish(TOPIC_HUB_HOSTNAME, currentHostname, qos=1, retain=True)
                    os.system("sudo reboot")
                else: 
                    logging.info("Hostname already set. Skipping..")

            except Exception as e: 
                logging.warning("Setting hostname failed. [%s]", (e))

            logging.info("Setting OS Version [%s]", data["osVersion"])
            client.publish(TOPIC_HUB_OSVERSION, data["osVersion"], qos=1, retain=True)
            
            logging.info("Setting Owner [%s]", data["owner"])
            client.publish(TOPIC_HUB_OWNER, data["owner"], qos=1, retain=True)

            logging.info("Setting System Code [%s]", data["systemCode"])
            client.publish(TOPIC_HUB_SYSTEM_CODE, data["systemCode"], qos=1, retain=True)

            logging.info("Kairoshub autoconfiguration endend.")
        except Exception as e: 
            logging.warning("kairoshub autoconfiguration failed. [%s]", (e))

    logging.info("Setting state service in ONLINE.")
    client.publish(TOPIC_HUB_SYSTEM_CODE, data["systemCode"], qos=1, retain=True)

    
        


def on_disconnect(client, userdata, rc):
    if rc != 0:
        logging.warning("Unexpected MQTT disconnection. Will auto-reconnect")

client = paho.Client()
client.username_pw_set("mqtt_kairos", "kairos!")
client.on_message = on_message
client.on_connect = on_connect
client.on_publish = on_publish
client.on_disconnect = on_disconnect
client.connect("localhost",1884)

client.subscribe(TOPIC_COMMAND)

client.loop_forever()
