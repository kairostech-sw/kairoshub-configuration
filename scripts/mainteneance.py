import sys
import paho.mqtt.publish as publish

from datetime import datetime, timezone, tzinfo

TOPIC_COMMAND               = "kairostech/command"
TOPIC_STATE_DETAIL          = "kairostech/state/detail"
ASSISTANCE_START_COMMAND    = "ASSISTANCE_START"
ASSISTANCE_STOP_COMMAND     = "ASSISTANCE_STOP"

auth_data               = {}
auth_data["username"]   = "mqtt_kairos"
auth_data["password"]   = "kairos!"

now     = datetime.now()
state   = sys.argv[1]
detail  = sys.argv[2]

if state == "ON":
    publish.single(TOPIC_COMMAND, ASSISTANCE_START_COMMAND, hostname="localhost", port=1884, auth=auth_data, retain=False)
else:
    publish.single(TOPIC_COMMAND, ASSISTANCE_STOP_COMMAND, hostname="localhost", port=1884, auth=auth_data, retain=False)

if detail:
    publish.single(TOPIC_STATE_DETAIL, detail, hostname="localhost", port=1884, auth=auth_data, retain=True)