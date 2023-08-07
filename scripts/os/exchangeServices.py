import os
import time
import paho.mqtt.client as paho
import logging
import json
import socket
from subprocess import check_output
from subprocess import CalledProcessError
from urllib.request import urlopen as url
from threading import Thread


TOPIC_COMMAND = "kairostech/command"
TOPIC_KAIROSHUB_SW_BRANCH = "kairostech/kairoshub/branch"
TOPIC_KAIROSHUB_CONF_SW_BRANCH = "kairostech/hakairos-configuration/branch"

TOPIC_STATE = "kairostech/state"
TOPIC_STATE_DETAIL = "kairostech/state/detail"
TOPIC_VPN_PROCESS = "kairostech/state/vpn_process"

TOPIC_HUB_OSVERSION = "kairostech/os_version"
TOPIC_HUB_HOSTNAME = "kairostech/hostname"
TOPIC_HUB_OWNER = "kairostech/owner"
TOPIC_HUB_SYSTEM_CODE = "kairostech/system_code"
TOPIC_HUB_SSID = "kairostech/ssid"
TOPIC_HUB_SIGNAL = "kairostech/signal"
TOPIC_HUB_IP = "kairostech/ip_address"

TOPIC_NET_GUEST_LINK = "kairostech/net/guestlink"
TOPIC_NET_GUEST_SSID = "kairostech/net/guestlink/ssid"
TOPIC_NET_GUEST_INTERNET_CONNECTION = "kairostech/net/guestlink/checkinternet"
TOPIC_NET_KAIROSHUB = "kairostech/net"

ASSISTANCE_START_COMMAND = "ASSISTANCE_START"
ASSISTANCE_STOP_COMMAND = "ASSISTANCE_STOP"
KAIROSHUB_RELEASE_COMMAND = "KAIROSHUB_RELEASE_CHECK"

TOPIC_EXCHANGE_SERVICE_STATE = "kairostech/system/exchange_service"
TOPIC_EXCHANGE_SERVICE_CHECK = "kairostech/system/exchange_service/lastcheck"

KAIROSHUB_ES_LOG_FILE = "/home/pi/workspace/logs/exchange-services.log"
KAIROSHUB_INIT_FILE = "/boot/kairoshub.json"

logging.basicConfig(filename=KAIROSHUB_ES_LOG_FILE,
                    level=logging.INFO, format="%(asctime)s %(message)s")

global vpn_pid
global hubWifiSSID
global hubWifiPwd

hubState = "NORMAL"
kairoshubConfigurationSwBranchRef = ""
kairoshubSwBranchRef = ""


def on_message(client, userdata, msg):
    logging.info("Incoming message on topic %s, with payload %s",
                 msg.topic, str(msg.payload))

    payload = msg.payload.decode("utf-8")
    if msg.topic == TOPIC_COMMAND:
        logging.info("Incoming command: %s on topic: %s", payload, msg.topic)
        # ASSISTANCE_START_COMMAND
        if payload == ASSISTANCE_START_COMMAND:
            # check if already exists a vpn process
            try:
                vpn_pid = check_output(["pidof", "openvpn"])
                logging.warning(
                    "VPN process is already up. Restoring state message to MAINTENEANCE.")
                # proced already up. Nothing to do.
                client.publish(TOPIC_STATE, "MAINTENEANCE", qos=1, retain=True)
            except CalledProcessError:
                logging.info("Running VPN command..")
                os.system(
                    "sudo openvpn --daemon --config /home/pi/kairoshome.ovpn")
                vpn_pid = check_output(["pidof", "openvpn"])
                logging.info(
                    "VPN PID: %s. Publishing state MAINTENEANCE and PID", vpn_pid.decode("utf-8"))
                client.publish(TOPIC_VPN_PROCESS, vpn_pid.decode(
                    "utf-8"), qos=1, retain=True)
                client.publish(TOPIC_STATE, "MAINTENEANCE", qos=1, retain=True)

            return

        # ASSISTANCE_STOP_COMMAND
        if payload == ASSISTANCE_STOP_COMMAND:
            try:
                vpn_pid = check_output(["pidof", "openvpn"])
                os.system("sudo kill "+vpn_pid.decode("utf-8"))
                client.publish(TOPIC_STATE, "NORMAL", qos=1, retain=True)
                client.publish(TOPIC_VPN_PROCESS, "", qos=1, retain=True)
            except CalledProcessError:
                logging.error(
                    "Error on killing VPN service. No process found, maybe killed yet.")
                client.publish(TOPIC_STATE, "NORMAL", qos=1, retain=True)
                client.publish(TOPIC_VPN_PROCESS, "", qos=1, retain=True)
            return

        # RELEASE CHECK COMMAND
        if payload == KAIROSHUB_RELEASE_COMMAND:
            try:
                msg = "CHECKING FOR A NEW RELEASE OF HAKAIROS CONFIGURATION"
                logging.info(msg)
                client.publish(TOPIC_STATE_DETAIL, msg, qos=1, retain=True)
                global kairoshubConfigurationSwBranchRef
                if None != kairoshubConfigurationSwBranchRef and "" != kairoshubConfigurationSwBranchRef:
                    shcommand = "sh /home/pi/workspace/scripts/release_hakairos-configuration.sh " + \
                        kairoshubConfigurationSwBranchRef
                    logging.info("running command: "+shcommand)
                    os.system(shcommand)
                    time.sleep(30)
                    os.system(
                        "sudo chown -R pi:pi /home/pi/workspace/hakairos-configuration")
                else:
                    logging.error(
                        "Software branch ref, for kairoshub-configuration not found. Skipping..")

                msg = "CHECKING FOR A NEW RELEASE OF KAIROSHUB"
                logging.info(msg)
                client.publish(TOPIC_STATE_DETAIL, msg, qos=1, retain=True)
                global kairoshubSwBranchRef
                if None != kairoshubSwBranchRef and "" != kairoshubSwBranchRef:
                    shcommand = "sh /home/pi/workspace/scripts/release_kairoshub.sh "+kairoshubSwBranchRef
                    logging.info("running command: "+shcommand)
                    os.system(shcommand)
                    time.sleep(30)
                    os.system(
                        "sudo chown -R pi:pi /home/pi/workspace/kairoshub")
                else:
                    logging.error(
                        "Software branch ref, for kairoshub not found. Skipping..")

                msg = "CHECKING FOR A NEW SOFTWARE RELEASE COMPLETE"
                logging.info(msg)
                client.publish(TOPIC_STATE_DETAIL, msg, qos=1, retain=True)
            except Exception as e:
                logging.error(e)

            return

        # SET CONSUMER TOPIC
        if "SET_CONSUMER_TOPIC_" in payload:
            systemCode: str = payload[-6:]
            if "00" in systemCode:
                newFileData = None
                isFileDataChanged = False
                with open("/home/pi/workspace/hakairos-configuration/hakafka/hakafka-configuration.yaml", 'r') as file:
                    filedata = file.read()
                    newFileData = filedata.replace(
                        "KAIROS_XXXXX", systemCode.upper())
                    if filedata in newFileData:
                        logging.info("consumer topic already set.")
                    else:
                        logging.info("setting up the consumer topic")
                        isFileDataChanged = True

                if isFileDataChanged:
                    with open("/home/pi/workspace/hakairos-configuration/hakafka/hakafka-configuration.yaml", 'w') as file:
                        file.write(newFileData)
                        os.system("docker restart kairoshub")

        # SERVICE EXCHANGE
        if payload == "KAIROSHUB_SYSTEM_EXCHANGE_CHECK":
            client.publish(TOPIC_EXCHANGE_SERVICE_CHECK,
                           time.time(), qos=1, retain=True)

        # AP MODE
        if "AP_MODE" == payload:
            logging.info("Entering into WIFI AP mode")
            hostapd_setup("KAIROSHUB_AP", "kairostech!")

        # AP MODE EXIT
        if "AP_MODE_EXIT" == payload:
            logging.info("Exiting AP mode, Entering into Router mode..")
            hostapd_setup(hubWifiSSID, hubWifiPwd)

        # WIFIAUTH
        if "WIFIAUTH" in payload:
            logging.info("Getting wifi auth parameters")
            params = payload.removeprefix("WIFIAUTH_").split("_")

            logging.info(
                "Building new WIFI supplicant config file with given params")
            with open("/home/pi/workspace/hakairos-configuration/scripts/os/kairoshub-wpa-supplicant.conf", 'r') as file:
                wpaSupplicant = file.read()
                wpaSupplicant = wpaSupplicant.replace("{SSID}", params[0])
                wpaSupplicant = wpaSupplicant.replace("{PWD}", params[1])

            # give access and writing. may have to do this manually beforehand
            os.popen("sudo chmod a+w /etc/wpa_supplicant/wpa_supplicant.conf")

            # writing to file
            with open("/etc/wpa_supplicant/wpa_supplicant.conf", "w") as wifi:
                wifi.write(wpaSupplicant)

            logging.info("Wifi config updated. Trying to connect..")
            # refresh configs
            os.popen("sudo wpa_cli -i wlan1 reconfigure")

            time.sleep(10)
            logging.info(
                "checking if the interface it is connected to the target wifi")
            connected = True
            try:
                if params[0] != check_output(["iwgetid", "wlan1", "-r"]).decode("utf-8").strip():
                    connected = False
            except CalledProcessError as e:
                connected = False

            if connected:
                logging.info("Interface connected to the target wifi")
                client.publish(TOPIC_NET_GUEST_LINK, "OK", qos=1, retain=True)
                client.publish(TOPIC_NET_GUEST_SSID,
                               params[0], qos=1, retain=True)

                logging.info("Exiting AP mode, Entering into Router mode..")
                hostapd_setup(hubWifiSSID, hubWifiPwd)

            else:
                logging.warning("interface not connected...retry")
                client.publish(TOPIC_NET_GUEST_LINK,
                               "FAIL", qos=1, retain=True)
                client.publish(TOPIC_NET_GUEST_SSID, "", qos=1, retain=True)

        if "CHECK_INTERNET_CONNECTION" in payload:
            logging.info("Starting internet connection coroutine")
            thread = Thread(target=checkInternetConnection)
            thread.start()

    else:
        if msg.topic == TOPIC_KAIROSHUB_CONF_SW_BRANCH:
            logging.info("Getting kairoshub configuration sw branch info")
            kairoshubConfigurationSwBranchRef = payload

        elif msg.topic == TOPIC_KAIROSHUB_SW_BRANCH:
            logging.info("Getting kairoshub sw branch info")
            kairoshubSwBranchRef = payload

        elif msg.topic == TOPIC_STATE:
            logging.info("Getting hub state")
            hubState = payload


def on_publish(client, userdata, mid):
    logging.debug("message id: %s", str(mid))


def on_connect(client, userdata, flags, rc):
    logging.info("Connected on broker. Received CONNACK code %d.", (rc))

    logging.info("Trying to read kairoshub init file")
    data = None
    try:
        f = open(KAIROSHUB_INIT_FILE)

        data = json.load(f)
        logging.info("Kairoshub init file loaded. content:  %s.", (data))

    except FileNotFoundError as e:
        logging.warning(
            "kairoshub init file not found. Maybe due a old version of kairoshub OS. Skipping autoconfiguration..")

    try:
        logging.info("Kairoshub autoconfiguration started.")
        if data:
            try:
                logging.info("checking hostaname name.. ")
                currentHostname = socket.gethostname()
                logging.info("current hostname: %s, provided hostname: %s",
                             currentHostname, data["hostname"])
                if currentHostname != data["hostname"]:
                    logging.info(
                        "Trying to change the hostname value into [%s]", data['hostname'])
                    os.system("sudo hostnamectl set-hostname " +
                              data['hostname'])
                    currentHostname = socket.gethostname()
                    logging.info(
                        "new hostname value: %s. Attempt to HUB reboot..", currentHostname)
                    client.publish(TOPIC_HUB_HOSTNAME,
                                   currentHostname, qos=1, retain=True)
                    os.system("sudo reboot")
                else:
                    logging.info("Hostname already set. Skipping..")

                global hubWifiSSID, hubWifiPwd
                hubWifiSSID = data["wifi_ssid"]
                hubWifiPwd = data["wifi_pwd"]

            except Exception as e:
                logging.warning("Setting hostname failed. [%s]", (e))

            logging.info("Setting OS Version [%s]", data["osVersion"])
            client.publish(TOPIC_HUB_OSVERSION,
                           data["osVersion"], qos=1, retain=True)

            logging.info("Setting Owner [%s]", data["owner"])
            client.publish(TOPIC_HUB_OWNER, data["owner"], qos=1, retain=True)

            logging.info("Setting System Code [%s]", data["systemCode"])
            client.publish(TOPIC_HUB_SYSTEM_CODE,
                           data["systemCode"], qos=1, retain=True)

        ssid = check_output(
            "iwconfig wlan0 | grep 'ESSID' | awk '{print $4}' | awk -F\\\" '{print $2}'", shell=True).decode("utf-8").strip("\n")
        logging.info("Connected SSID [%s]", ssid)
        client.publish(TOPIC_HUB_SSID, ssid, qos=1, retain=True)

        signal = check_output(
            "iwconfig wlan0 | grep 'Signal' | awk '{print $4}' | awk -F\\= '{print $2}'", shell=True).decode("utf-8").strip("\n")
        logging.info("Connection Signal [%s]", signal)
        client.publish(TOPIC_HUB_SIGNAL, signal, qos=1, retain=True)

        ip = check_output(
            "ifconfig wlan0 | grep 'inet' | awk '/inet / {print $2}'", shell=True)
        logging.info("Current IP Address [%s]", ip.decode("utf-8").strip("\n"))
        client.publish(TOPIC_HUB_IP, ip, qos=1, retain=True)

        logging.info("Copying custom configuration files")
        try:
            os.system(
                "sudo cp /home/pi/workspace/hakairos-configuration/scripts/os/splash.png /usr/share/plymouth/themes/pix")
            logging.info("Splash file copied")
        except Exception as e:
            logging.warning("Error on copying splash file. [%s]", (e))

        try:
            os.system(
                "cp /home/pi/workspace/hakairos-configuration/scripts/os/kairoshub-startup.sh /home/pi")
            logging.info("Startup file copied")
        except Exception as e:
            logging.warning("Error on copying splash file. [%s]", (e))

        logging.info("Kairoshub autoconfiguration endend.")
    except Exception as e:
        logging.warning("kairoshub autoconfiguration failed. [%s]", (e))

    logging.info("Setting state service in ONLINE.")
    client.publish(TOPIC_EXCHANGE_SERVICE_STATE, "ONLINE", qos=1, retain=True)


def on_disconnect(client, userdata, rc):
    if rc != 0:
        logging.warning(
            "Unexpected MQTT disconnection. Will restart the service")
        os.system("sudo service kairoshub-assistance restart")


def hostapd_setup(ssid, pwd):
    logging.info("Opening kairoshub wifi configuation file")
    try:
        with open("/home/pi/workspace/hakairos-configuration/scripts/os/kairoshub-ap-mode.conf", 'r') as file:
            configuration = file.read()
            configuration = configuration.replace("{SSID}", ssid)
            configuration = configuration.replace("{PWD}", pwd)

            logging.debug("Writing hostapd file")
            with open("/etc/hostapd/hostapd.conf", "w") as apFile:
                apFile.write(configuration)

            logging.info("Wifi config refreshed. Restarting wlan interface")
            os.popen("sudo systemctl restart hostapd.service")
            time.sleep(5)

            hubState = "NORMAL"
            if "KAIROSHUB_AP" == ssid:
                hubState = "AP_MODE"

            try:
                if ssid == check_output(["iwgetid", "wlan2", "-r"]).decode("utf-8").strip():
                    client.publish(TOPIC_NET_KAIROSHUB,
                                   "OK (0)", qos=1, retain=True)

                    client.publish(TOPIC_STATE, hubState, qos=1, retain=True)
                else:
                    raise CalledProcessError(-1)
            except CalledProcessError as e:
                client.publish(TOPIC_NET_KAIROSHUB, "FAIL", qos=1, retain=True)

    except Exception as e:
        logging.error("Error occourred [%s]", (e))


def checkInternetConnection():
    while (True):
        try:
            url('https://www.google.com/search?q=kairos+tech+domotica+risparmio+energetico', timeout=3)
            logging.info(
                "Internet connection present")
            client.publish(TOPIC_NET_GUEST_INTERNET_CONNECTION,
                           "OK", qos=1, retain=True)

            clientCount = check_output(
                ["sudo iw dev wlan2 station dump", "| grep 'Station'", "| wc -l"]).decode("utf-8").strip()
            client.publish(TOPIC_NET_KAIROSHUB,
                           "OK ("+clientCount+")", qos=1, retain=True)

        except ConnectionError as e:
            logging.warning(
                "Absent internet connection")
            client.publish(TOPIC_NET_GUEST_INTERNET_CONNECTION,
                           "FAIL", qos=1, retain=True)
        time.sleep(33)


client = paho.Client()
client.username_pw_set("mqtt_kairos", "kairos!")
client.on_message = on_message
client.on_connect = on_connect
client.on_publish = on_publish
client.on_disconnect = on_disconnect
client.connect("localhost", 1884)

client.subscribe(TOPIC_COMMAND)
client.subscribe(TOPIC_KAIROSHUB_SW_BRANCH)
client.subscribe(TOPIC_KAIROSHUB_CONF_SW_BRANCH)

client.loop_forever()
