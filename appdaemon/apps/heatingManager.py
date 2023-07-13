import hassapi as hass
from datetime import datetime, timedelta
from os import path
import json, time, re


class HeatingManager(hass.Hass):

    file = "./kairoshubHeating.json"
    maxRetry = 5
    lifetimeOffset = 7
    dateFormat = "%Y-%m-%dT"
    timeFormat = "%H:%M:%S"
    datetime_format = dateFormat + timeFormat

    def initialize(self):
        self.listen_event(self.handleHeatingProgram,"HA_MANAGE_HEATER")
        self.listen_event(self.handleManualHeating, "AD_HEATING_ON")
        self.listen_event(self.handleManualHeating, "AD_HEATING_OFF")
        self.listen_event(self.turnProgramOff,"AD_PROGRAM_OFF")
        self.listen_event(self.comfortTempReached, "AD_MANUAL_TEMP_REACHED")

    def handleManualHeating(self, event_name: str, data: dict, kwargs: dict) -> None:
        '''
            Checks first if the comfort temp was already reached.
            Otherwise, turns ON or OFF the thermostat based on the event received
        '''
        sender = self.getKey(data, "sender")
        trid = self.getKey(data, "trid")
        if self.isComfortTempReached(self.get_state("sensor.temperatura")) and self.get_state("switch.sw_thermostat") == "off":
            comfort_temp = self.get_state("input_number.temperature_tv100_manual")
            notyInfo = {
                "sender": sender,
                "ncode": "HEATING_TEMP_REACHED",
                "severity": "NOTICE",
                "kwargs" : {
                    "program": 0,
                    "comfort_temp": comfort_temp
                }
            }
            if trid:
                notyInfo["trid"] = trid
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)
            return None
        if "ON" in event_name:
            self.turnHeatingOn(0, sender, trid)
        elif "OFF" in event_name:
            self.turnHeatingOff(0, sender, trid)

    def handleHeatingProgram(self, event_name: str, data: dict, kwargs: dict) -> None:
        '''
            Checks if the program is active and should start/end during its time range if no other program
            is already active
        '''
        progId = self.getKey(data, "program")
        sender = self.getKey(data, "sender")
        trid = self.getKey(data, "trid")
        now = datetime.strptime(self.get_state("sensor.date_time_iso"), self.datetime_format)
        today = now.strftime("%A").lower()

        self.checkFile(now)
        now = now.strftime(self.timeFormat)


        activeProgram = self.isProgramOn(progId)
        if activeProgram > 0:
            self.log("Another program is already active", level="INFO")
            return None

        if self.get_state(f"input_boolean.thermostat_{today}_program{progId}") == "off":
            self.log("The Program is not active for today", level="INFO")
            return None

        if not self.checkTemperature(progId):
            self.log("Comfort Temperature was reached", level="INFO")
            if self.get_state(f"input_boolean.heater_program{progId}_on") == "on":
                self.log("Program %s will now end", progId, level="INFO")
                self.turnHeatingOff(progId, sender, trid, True)
            return None

        program_schedule = self.getProgramSchedule(progId)
        start_time = program_schedule["start"]
        end_time = program_schedule["end"]
        status = program_schedule["status"]
        validTime = self.isValidTime(now, end_time)

        if status == "manual off":
            self.log("The program was manually interrupted", level="INFO")
            if not validTime:
                self.updateProgramStatus(progId, "not running")
            return None

        if start_time > now:
            self.log("The program %s is not active now", progId, level="INFO")
            return None

        if validTime:
            if self.get_state(f"input_boolean.heater_program{progId}_on") == "off":
                self.log("The heating program %s is now starting", progId, level="INFO")
                self.turn_on(f"input_boolean.heater_program{progId}_on")
                self.turnHeatingOn(progId, sender, trid)
                return None
            self.log("This program is already active", level="INFO")

        else:
            self.log("The heating program {} is now ending".format(progId), level="INFO")
            self.turnProgramOff(event_name, data, kwargs)
            return None

    def turnProgramOff(self, event_name: str, data: dict, kwargs: dict) -> None:
        sender = self.getKey(data, "sender")
        trid = self.getKey(data, "trid")
        progId = self.getKey(data, "program")

        self.turnHeatingOff(progId, sender, trid)

    def comfortTempReached(self, event_name: str, data: dict, kwargs: dict) -> None:
        zone = self.getKey(data, "zone")
        comfort_temp = self.get_state(f"input_number.temperature_tv{zone}_manual")
        sender = self.getKey(data, "sender") or "HUB"
        trid = self.getKey(data, "trid")
        self.turnZoneOff(zone, sender, trid, comfort_temp)

    def turnHeatingOn(self, progId: int, sender: str, trid: str) -> None:
        '''
            Turns the heating ON. Checks if TRVs valves are open otherwise sends an error notification.
            If the heating fails to start, sends an error notification
        '''

        notyInfo = {
            "sender": sender,
            "ncode": "",
            "severity": "NOTICE",
            "kwargs" : {
                "program": progId,
            }
        }
        if trid:
            notyInfo["trid"] = trid
        if progId == 0 and self.isProgramOn(progId):
            self.log("A program is already active", level="INFO")
            return None

        self.log("Retrieving TRV list", level="INFO")
        trvList=self.getTRVList()

        if progId > 0:
            programTemperature = self.getProgramZoneTemperature(progId)
            if programTemperature["noActiveZone"]:
                self.log("No Zone is active for this program. Ending", level="WARNING")
                notyInfo["ncode"] = "HEATING_NO_ZONE_ERROR"
                self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)
                self.turn_off(f"group.heater_program{progId}_on")
                return None
        else:
            temperatureNight = self.get_state("input_number.temperature_tv100_manual")
            temperatureDay = self.get_state("input_number.temperature_tv100_manual")

        self.log("Starting heating", level="INFO")
        self.turn_on("switch.sw_thermostat")

        self.log("Setting temperature", level="INFO")
        for trv in trvList:
            if progId > 0:
                self.setTargetTemp(trv["topic"], programTemperature[trv["zone"]])
            else:
                zoneId = self.getEntityId(trv["name"])[0]
                if zoneId == "1":
                    self.setTargetTemp(trv["topic"], temperatureNight)
                if zoneId == "2":
                    self.setTargetTemp(trv["topic"], temperatureDay)

        if progId > 0: self.updateProgramStatus(progId, "running")

        if self.checkHeaterState(1, "on", 5):
            self.log("Thermostat turned on", level="INFO")
            notyInfo["ncode"] = "HEATING_ON"
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

            if not self.isValveOpen(trvList, 1, 10):
                notyInfo["ncode"] = "HEATING_VALVES_CLOSED"
                self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

        else:
            self.log("Thermostat didn't turn on", level="INFO")
            notyInfo["ncode"] = "HEATING_ON_ERROR"
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

        self.fire_event("HA_ENTITY_METRICS")

    def turnHeatingOff(self, progId: int, sender: str, trid: str, comfort_temp=False) -> None:
        '''
            Turns the heating OFF.
            If the heating fails to stop, sends an error notification
        '''

        notyInfo = {
            "sender": sender,
            "trid": trid,
            "ncode": "",
            "severity": "NOTICE",
            "kwargs" : {
                "program": progId,
            }
        }
        self.log("Turning off heating", level="INFO")
        if progId > 0:
            activeBoolean = f"input_boolean.heater_program{progId}_on"
            if self.get_state(activeBoolean) == "on":
                self.turn_off(activeBoolean)
                self.turn_off(f"group.heater_program{progId}_on")
                self.log("Program %s was turned off", progId)
                self.updateProgramStatus(progId, "not running")
        else:
            activeProgram = self.isProgramOn(progId)
            if activeProgram:
                self.turn_off(f"input_boolean.heater_program{activeProgram}_on")
                self.turn_off(f"group.heater_program{activeProgram}_on")
                self.updateProgramStatus(activeProgram, "manual off")

        self.turn_off("switch.sw_thermostat")

        if self.checkHeaterState(1, "off", 5):
            self.log("Thermostat turned off", level="INFO")
            notyInfo["ncode"] = "HEATING_OFF"
            notyInfo["kwargs"]["comfort_temp"] = comfort_temp
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

        else:
            self.log("Thermostat didn't turn off", level="INFO")
            notyInfo["ncode"] = "HEATING_OFF_ERROR"
            notyInfo["severity"] = "ALERT"
            self.fire_event("AD_KAIROSHUB_NOTIFICATION", **notyInfo)

        self.fire_event("HA_ENTITY_METRICS")

    def turnZoneOff(self, zone: str, sender: str, trid: str, comfort_temp: str) -> None:
        self.turn_off(f"input_boolean.heater_zn{zone}_manual_on")

        if self.get_state("group.heater_manual_on") == "off":
            self.turnHeatingOff(0, sender, trid, comfort_temp)

    def isComfortTempReached(self, temperature: float, progId=0, zone="") -> bool:
        if progId == 0:
            return (
                temperature >= self.get_state("input_number.temperature_tv100_manual") and
                temperature >= self.get_state("input_number.temperature_tv200_manual"))

        return temperature >= self.get_state(f"input_number.temperature_{zone}_period{progId}")

    def checkTemperature(self, progId: int) -> bool:
        '''
            Checks if temperature was reached in every active zone
        '''
        zones = self.getProgramZone(progId)
        isActive = False
        for zone in zones:
            zoneName = zone["name"]
            zoneId = zone["id"]
            zoneState = f"input_boolean.heater_{zoneName}_program{progId}_on"
            temperature = self.get_state(f"sensor.tz{zoneId}").lower()
            isAtComfort = self.isComfortTempReached(temperature, progId, zoneName)
            isActive |= not isAtComfort
            if isAtComfort:
                self.turn_off(zoneState)

        return isActive

    def isProgramOn(self, progId: int) -> int:
        '''
            Checks if there is a different program already active
        '''
        for id in range(1,5):
            if id != progId and self.get_state(f"group.heater_program{id}_on") == "on":
                return id
        return 0

    def checkHeaterState(self, counter: int, state: str, timeout=30) -> bool:
        '''
            Checks if the heater changed its state
        '''
        self.log("Checking if the heater was turned %s. Try: %s of %s", state, counter, self.maxRetry, level="INFO")

        if self.get_state("switch.sw_thermostat") == state:
            self.log("Heater was turned %s correctly", state, level="INFO")
            return True
        if counter < self.maxRetry:
            time.sleep(timeout)
            return self.checkHeaterState(counter+1, state, timeout)

        self.log("Heater was not turned %s correctly", state, level="WARNING")
        return False

    def isValveOpen(self, trvList: list, counter: int, timeout=30) -> bool:
        '''
            Checks if at least one valve is open
        '''
        self.log("Checking if valves are open. Try: %s of %s", counter, self.maxRetry, level="INFO")

        for trv in trvList:
            name = trv["name"].lower()
            trvPos = self.get_state(f"sensor.{name}_pos")
            if trvPos not in ["unknown", "unavailable"] and float(trvPos) > 0.0 :
                self.log("Valve %s is open", name, level="INFO")
                return True

        if counter < self.maxRetry:
            time.sleep(timeout)
            return self.isValveOpen(trvList, counter+1 )

        self.log("No valves are open", level="WARNING")
        return False

    def checkFile(self, now: datetime) -> None:
        '''
            Checks if the schedule file exits and is valid.
            If not, it creates the file
        '''
        if not path.exists(self.file):
            self.createSchedule(now)

        with open(self.file, "r") as f:
            fileData = json.load(f)

        if "lifetime" not in fileData or datetime.strptime(fileData["lifetime"], self.dateFormat) < now:
            self.createSchedule(now)

    def createSchedule(self, now: datetime) -> None:
        '''
            Creates the schedule file for all programs.
            This is needed for time ranges that go over the next day
        '''
        self.log("Updating the heating schedule file", level="INFO")
        lifetime = (now + timedelta(days=self.lifetimeOffset)).strftime(self.dateFormat)
        schedule={ "lifetime": lifetime }

        for id in range(1,5):
            schedule[f"program{id}"] = {}
            startTime = datetime.strptime(self.get_state(f"input_datetime.thermostat_on_period{id}"), self.timeFormat)
            endTime = datetime.strptime(self.get_state(f"input_datetime.thermostat_off_period{id}"), self.timeFormat)

            schedule[f"program{id}"]["start"] = startTime.strftime(self.timeFormat)
            schedule[f"program{id}"]["end"] = endTime.strftime(self.timeFormat)
            schedule[f"program{id}"]["status"] = "not running"

        self.log("Programs Schedule: %s", schedule, level="DEBUG")

        with open(self.file, "w") as f:
            json.dump(schedule, f, indent=2)

    def updateProgramStatus(self, progId: int, status: str) -> None:
        '''
            Updates Program status on file
        '''
        with open(self.file, "r") as f:
            programSchedule = json.load(f)
            programSchedule[f"program{progId}"]["status"] = status

        with open(self.file, "w") as f:
            json.dump(programSchedule, f, indent=2)

    def getProgramSchedule(self, progId: int) -> dict:
        '''
            Gets program schedule and status from the file
        '''
        with open(self.file, "r") as f:
            data = json.load(f)
            data = data[f"program{progId}"]

        programSchedule = {
            "start": data["start"],
            "end": data["end"],
            "status": data["status"]
        }
        return programSchedule

    def getZoneFromId(self, zoneId: str) -> str:
        if zoneId == "01": return "zn101"
        if zoneId == "02": return "zn102"
        if zoneId == "03": return "zn103"
        if zoneId in ["04", "05"]: return "zn201"
        if zoneId == "06": return "zn202"
        if zoneId == "07": return "zn203"

        return f"zn{zoneId[:-1]}"

    def getTRVList(self) -> list:
        '''
            Gets the list of all available TRVs
        '''
        trvList=[]
        trvsGroup = self.get_state("group.heating_valves", attribute="entity_id")

        for group in trvsGroup:
            trvs = self.get_state(group, attribute="entity_id")

            for trv in trvs:
                if self.get_state(trv) != "unknown":
                    attributes = {}
                    sensor = trv[: trv.find("_")]
                    name = sensor.split(".")[1].upper()
                    attributes["name"] = name
                    attributes["zone"] = self.getZoneFromId(name[2:])
                    attributes["topic"] = f"shellies/{name}/thermostat/0/command/"
                    trvList.append(attributes)

        self.log("TRVs found: %s", trvList, level="DEBUG")
        return trvList

    def getProgramZoneTemperature(self, progId: int) -> dict:
        '''
            Gets temperature sets for every zone for this program.
            Any zone without a sensor or that is not active for the program
            will have a temperature set to 4.0°C
        '''
        self.log("Retrieving temperature for Program %s", progId, level="INFO")

        zones = self.getProgramZone(progId)
        zonesTemperatures = {"noActiveZone": True}

        for zone in zones:
            roomId = zone["id"]
            roomName = zone["name"]
            room = f"input_boolean.heater_{roomName}_program{progId}"
            if self.get_state(f"sensor.tz{roomId}") in ["unknown", "unavailable"]:
                self.turn_off(room)

            if self.get_state(room) == "on":
                self.turn_on(room+"_on")
                temperature = self.get_state(f"input_number.temperature_{roomName}_period{progId}")
                zonesTemperatures[roomName] = temperature
                zonesTemperatures["noActiveZone"] = False
            else:
                zonesTemperatures[roomName] = 4.0

        self.log("Temperatures per Zone of this program: %s", zonesTemperatures, level="INFO")
        return zonesTemperatures

    def getProgramZone(self, progId: int) -> list:
        '''
            Returns a list containing name and id of every zone in the program
        '''
        programZones = self.get_state(f"group.heater_program{progId}", attribute="entity_id")
        zones = []

        for zone in programZones:
            rooms = self.get_state(zone, attribute="entity_id")
            for room in rooms:
                roomName = room.split("_")[2]
                roomInfo = {
                    "name": roomName,
                    "id": roomName[2:]
                }
                zones.append(roomInfo)

        self.log("Zones of this program: %s", zones, level="DEBUG")
        return zones

    def getKey(self, data: dict, key: str) -> str:
        if "data" in data:
            data = data["data"]
        if key in data:
            return data[key]
        if "event" in data and key in data["event"]:
            return data["event"][key]

        return ""

    def isValidTime(self, now: datetime, end: datetime) -> int:
        return now < end

    def setTargetTemp(self, topic: str, value: float) -> None:
        '''
            Sends temperature to TRVs
        '''
        topic = topic + "target_t"
        value = float(value)
        if value > 31.0: value = 31.0
        if value < 4.0: value = 4.0

        self.fire_event("AD_MQTT_PUBLISH", topic=topic, payload=value)
        self.log("Target temperature for %s was set to: %s", topic.split("/")[1], value, level="INFO")

    def getEntityId(self, entity) -> str:
        return re.search("(\d+)", entity).group()
