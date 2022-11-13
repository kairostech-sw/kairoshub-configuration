import sys
import paho.mqtt.publish as publish

from datetime import datetime

TOPIC_STATE_DETAIL      = "kairostech/state/detail"

auth_data               = {}
auth_data["username"]   = "mqtt_kairos"
auth_data["password"]   = "kairos!"

now     = datetime.now()
sw      = sys.argv[1]
version = sys.argv[2]
repobranch = sys.argv[3]

softwareCheck = now.isoformat("T", "seconds")

if version == "UP_TO_DATE":
    publish.single("kairostech/"+sw+"/release", " UP TO DATE", hostname="localhost", port=1884, auth=auth_data, retain=True)
else:
    publish.single("kairostech/"+sw+"/version", version, hostname="localhost", port=1884, auth=auth_data, retain=True)
    publish.single("kairostech/"+sw+"/release", "RELEASED", hostname="localhost", port=1884, auth=auth_data, retain=True)
    publish.single("kairostech/"+sw+"/branch", repobranch, hostname="localhost", port=1884, auth=auth_data, retain=True)

publish.single("kairostech/"+sw+"/last_software_check", softwareCheck, hostname="localhost", port=1884, auth=auth_data, retain=True)