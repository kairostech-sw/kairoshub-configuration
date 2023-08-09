import os
import time
import paho.mqtt.client as paho
import logging
import json
import socket
import re
from subprocess import check_output
from subprocess import CalledProcessError
from urllib.request import urlopen as url
from threading import Thread
import requests
from flask import Flask

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

TOPIC_NET_GUEST_LINK = "kairostech/network/guestlink"
TOPIC_NET_GUEST_SSID = "kairostech/network/guestlink/ssid"
TOPIC_NET_GUEST_SIGNAL = "kairostech/network/guestlink/signal"
TOPIC_NET_GUEST_IP = "kairostech/network/guestlink/ip"
TOPIC_NET_GUEST_INTERNET_CONNECTION = "kairostech/network/guestlink/checkinternet"
TOPIC_NET_KAIROSHUB = "kairostech/network/kt"
TOPIC_NET_KAIROSHUB_SSID = "kairostech/network/kt/ssid"

ASSISTANCE_START_COMMAND = "ASSISTANCE_START"
ASSISTANCE_STOP_COMMAND = "ASSISTANCE_STOP"
KAIROSHUB_RELEASE_COMMAND = "KAIROSHUB_RELEASE_CHECK"

TOPIC_EXCHANGE_SERVICE_STATE = "kairostech/system/exchange_service"
TOPIC_EXCHANGE_SERVICE_CHECK = "kairostech/system/exchange_service/lastcheck"

KAIROSHUB_ES_LOG_FILE = "/home/pi/workspace/logs/exchange-services.log"
KAIROSHUB_INIT_FILE = "/boot/kairoshub.json"

logging.basicConfig(filename=KAIROSHUB_ES_LOG_FILE,
                    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

flaskAPP = Flask(__name__)

global vpn_pid
global hubWifiSSID
global hubWifiPwd
global guestWifiSSID
global osVersion

hubState = "NORMAL"
kairoshubConfigurationSwBranchRef = ""
kairoshubSwBranchRef = ""


def on_message(client, userdata, msg):
    logging.info("Incoming message on topic %s, with payload %s",
                 msg.topic, str(msg.payload))

    payload = msg.payload.decode("utf-8")
    if msg.topic == TOPIC_COMMAND:
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
            if not re.search("(202[3-9].[0-1][0-9])", osVersion):
                logging.warning(
                    "Function not allowed for this os version. Skipping..")
                return

            logging.info("Entering into WIFI AP mode")
            client.publish(TOPIC_NET_KAIROSHUB, "----", qos=1, retain=True)
            client.publish(TOPIC_NET_GUEST_INTERNET_CONNECTION,
                           "----", qos=1, retain=True)
            client.publish(TOPIC_NET_GUEST_LINK, "----", qos=1, retain=True)

            hostapd_setup("KAIROSHUB_AP", "kairostech!")

        # AP MODE EXIT
        if "AP_MODE_EXIT" == payload:
            if not re.search("(202[3-9].[0-1][0-9])", osVersion):
                logging.warning(
                    "Function not allowed for this os version. Skipping..")
                return

            logging.info("Exiting AP mode, Entering into Router mode..")
            hostapd_setup(hubWifiSSID, hubWifiPwd)

        # WIFIAUTH
        if "WIFIAUTH" in payload:
            if not re.search("(202[3-9].[0-1][0-9])", osVersion):
                logging.warning(
                    "Function not allowed for this os version. Skipping..")
                return

            logging.info("Getting wifi auth parameters")
            params = payload.removeprefix("WIFIAUTH_").split("_")
            global guestWifiSSID
            guestWifiSSID = params[0]

            logging.info(
                "Building new WIFI supplicant config file with given params")
            with open("/home/pi/workspace/hakairos-configuration/scripts/os/kairoshub-wpa-supplicant.conf", 'r') as file:
                wpaSupplicant = file.read()
                wpaSupplicant = wpaSupplicant.replace("{SSID}", guestWifiSSID)
                wpaSupplicant = wpaSupplicant.replace("{PWD}", params[1])

            # give access and writing. may have to do this manually beforehand
            os.popen("sudo chmod a+w /etc/wpa_supplicant/wpa_supplicant-wlan0.conf")

            # writing to file
            with open("/etc/wpa_supplicant/wpa_supplicant-wlan0.conf", "w") as wifi:
                wifi.write(wpaSupplicant)

            logging.info("Wifi config updated. Trying to connect..")
            # refresh configs
            os.popen("sudo wpa_cli -i wlan0 reconfigure")

            time.sleep(10)
            connected = utilCheckInterfaceConnection("wlan0", params[0])

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
            if not re.search("(202[3-9].[0-1][0-9])", osVersion):
                logging.warning(
                    "Function not allowed for this os version. Skipping..")
                return
            checkInternetConnection()

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


def checkGuestSSIDSignal():
    signal = check_output(
        "iwconfig wlan0 | grep 'Signal' | awk '{print $4}' | awk -F\\= '{print $2}'", shell=True).decode("utf-8").strip("\n")
    logging.info("Connection Signal to Guest network: [%s]", signal)
    client.publish(TOPIC_NET_GUEST_SIGNAL, signal, qos=1, retain=True)


def checkGuestIpAddress():
    ip = check_output(
        "ifconfig wlan0 | grep 'inet' | awk '/inet / {print $2}'", shell=True)
    logging.info("IP Address on Guest network: [%s]", ip.decode(
        "utf-8").strip("\n"))
    client.publish(TOPIC_NET_GUEST_IP, ip, qos=1, retain=True)


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
            global hubWifiSSID, hubWifiPwd, osVersion
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

                hubWifiSSID = data["wifi_ssid"]
                hubWifiPwd = data["wifi_pwd"]

            except Exception as e:
                logging.warning("Setting hostname failed. [%s]", (e))

            logging.info("Setting OS Version [%s]", data["osVersion"])
            client.publish(TOPIC_HUB_OSVERSION,
                           data["osVersion"], qos=1, retain=True)
            osVersion = data["osVersion"]

            logging.info("Setting Owner [%s]", data["owner"])
            client.publish(TOPIC_HUB_OWNER, data["owner"], qos=1, retain=True)

            logging.info("Setting System Code [%s]", data["systemCode"])
            client.publish(TOPIC_HUB_SYSTEM_CODE,
                           data["systemCode"], qos=1, retain=True)

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

    logging.info("Starting network checks")
    if not re.search("(202[3-9].[0-1][0-9])", osVersion):
        ssid = check_output(
            "iwconfig wlan0 | grep 'ESSID' | awk '{print $4}' | awk -F\\\" '{print $2}'", shell=True).decode("utf-8").strip("\n")
        logging.info("Connected SSID [%s]", ssid)
        client.publish(TOPIC_NET_GUEST_SSID, ssid, qos=1, retain=True)

        if ssid != "" or ssid != None:
            client.publish(TOPIC_NET_GUEST_LINK, "OK", qos=1, retain=True)

        checkGuestSSIDSignal()
        checkGuestIpAddress()

    else:
        logging.info("Starting network check thread")
        if not checkKairosNetworkThread.is_alive():
            checkKairosNetworkThread.start()

    logging.info("Starting internet check thread")
    if not checkInternetConnectionThread.is_alive():
        checkInternetConnectionThread.start()


def on_disconnect(client, userdata, rc):
    if rc != 0:
        logging.warning(
            "Unexpected MQTT disconnection. Will restart the service")
        os.system("sudo service kairoshub-assistance restart")

    logging.info("Opening kairoshub wifi configuation file")


def hostapd_setup(ssid, pwd):
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
            time.sleep(2)

            hubState = "NORMAL"
            if "KAIROSHUB_AP" == ssid:
                hubState = "AP_MODE"

            maxAttempts = 3
            connected = False
            while (maxAttempts > 0):
                logging.info(
                    "Checking interface network. Attempts remaining: [%s]", maxAttempts)
                connected = utilCheckInterfaceConnection("wlan1", ssid)

                if connected:
                    logging.info(
                        "Interface network setup properly to the target network [%s]", ssid)
                    client.publish(TOPIC_STATE, hubState, qos=1, retain=True)
                    if "AP_MODE" != hubState:
                        client.publish(TOPIC_NET_KAIROSHUB_SSID,
                                       ssid, qos=1, retain=True)
                        utilCheckKairosNetworkDevices()

                    return

                maxAttempts -= 1
                time.sleep(5)

            logging.critical(
                "Impossibile to setup the interface to the target network [%s]", ssid)
            client.publish(TOPIC_NET_KAIROSHUB, "FAIL", qos=1, retain=True)

    except Exception as e:
        logging.error("Error occourred [%s]", (e))


def utilCheckInterfaceConnection(interface, ssid):
    logging.info(
        "checking if the interface [%s] it is connected to the target wifi [%s]", interface, ssid)
    connected = True
    try:
        if ssid != check_output(["iwgetid", interface, "-r"]).decode("utf-8").strip():
            connected = False
    except CalledProcessError as e:
        connected = False

    return connected


def utilCheckKairosNetworkDevices():
    logging.info("Checking devices connected to the network")
    try:
        clientCount = clientCount = os.popen(
            "sudo iw dev wlan1 station dump | grep 'Station' | wc -l").read().strip()
        client.publish(TOPIC_NET_KAIROSHUB,
                       "OK ("+clientCount+")", qos=1, retain=True)
    except Exception as e:
        logging.error(
            "error occourred on cheking kairos network devices [%s]", e)
        client.publish(TOPIC_NET_KAIROSHUB, "FAIL", qos=1, retain=True)


def checkInternetConnection():
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'}

    try:
        response = requests.get(
            'https://www.google.com/search?q=kairos+tech+domotica+risparmio+energetico', headers=HEADERS)
        logging.info(
            "Internet connection OK. Status code: [%d]", response.status_code)
        client.publish(TOPIC_NET_GUEST_INTERNET_CONNECTION,
                       "OK", qos=1, retain=True)
    except ConnectionError as e:
        logging.warning(
            "Absent internet connection")
        client.publish(TOPIC_NET_GUEST_INTERNET_CONNECTION,
                       "FAIL", qos=1, retain=True)


def runCheckInternetConnection():
    while (True):
        checkInternetConnection()
        time.sleep(60*33)


def runNetworkChecks():
    while (True):
        logging.info("Running network checks..")
        # checking guest network connection
        guestConnected = utilCheckInterfaceConnection("wlan0", guestWifiSSID)
        if guestConnected:
            logging.info("interface wlan0 connected")
            client.publish(TOPIC_NET_GUEST_LINK, "OK", qos=1, retain=True)

            checkGuestSSIDSignal()
            checkGuestIpAddress()
        else:
            client.publish(TOPIC_NET_GUEST_LINK, "FAIL", qos=1, retain=True)
            logging.warning(
                "interface wlan0 not connected. Trying to reconnect..")

            os.popen("sudo wpa_cli -i wlan0 reconfigure")
            time.sleep(5)
            guestConnected = utilCheckInterfaceConnection(
                "wlan0", guestWifiSSID)
            if guestConnected:
                logging.info("Interface wlan0 reconnected to the network")
                client.publish(TOPIC_NET_GUEST_LINK, "OK", qos=1, retain=True)

                checkGuestSSIDSignal()
                checkGuestIpAddress()
            else:
                logging.critical(
                    "Impossible to enstabilish a new connection to the network.  interface: wlan0, SSID: [%s]", guestWifiSSID)

        # checking KT network
        ktnetConnected = utilCheckInterfaceConnection("wlan1", hubWifiSSID)
        if ktnetConnected:
            logging.info("interface wlan1 connected")
            # checking KT network devices
            utilCheckKairosNetworkDevices()

        else:
            client.publish(TOPIC_NET_KAIROSHUB, "FAIL", qos=1, retain=True)
            logging.info(
                "interface wlan1 not connected. Trying to reconnect..")
            hostapd_setup(hubWifiSSID, hubWifiPwd)

        time.sleep(60*10)


################################################################################################################################
####################################################### FLASK ZONE #############################################################


@flaskAPP.route('/')
def hello():
    logging.info("Requesting / web resource")
    return 'Hello, World!'


@flaskAPP.route('/network/wifi/auth/<ssid>/<pwd>')
def networkAuth(ssid, pwd):
    logging.info("Requesting /network/wifi/auth web resource")
    client.publish(TOPIC_COMMAND, "WIFIAUTH_" +
                   ssid+"_"+pwd, qos=1)
    return "OK"


def startFlaskWS():
    logging.info("Starting FLASK ws")
    flaskAPP.run(debug=False, use_reloader=False, host='0.0.0.0', port=5000)


logging.info("#################################################")
logging.info("Starting Kairoshub assistance service utility")

logging.info("Configuring MQTT client...")
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

checkInternetConnectionThread = Thread(
    target=runCheckInternetConnection, daemon=True, name="checkInternetConnectionThread")

checkKairosNetworkThread = Thread(
    target=runNetworkChecks, daemon=True, name="CheckKairosNetworkThread")

logging.info("Configuring Flask WS")
thread = Thread(target=startFlaskWS, daemon=True, name="FlaskWsThread").start()

client.loop_forever()
