import asyncio
import json
import hassapi as hass
from datetime import datetime, timedelta
from os import path

file="./kairoshubHeating.json"

class HeatingManager(hass.Hass):

    maxRetry = 5

    def initialize(self):
        self.listen_event(self.handleHeatingProgram,"HA_MANAGE_HEATER")
        self.listen_event(self.handleManualHeating, "AD_HEATING")
        self.listen_event(self.turnProgramOff,"AD_PROGRAM_OFF")
        self.listen_event(self.getTRVList, "AD_TRVS")


    def handleManualHeating(self, event_name, data, kwargs):
        if self.get_state("switch.sw_thermostat") =="off":
            self.turnHeatingOn(data['data'])
        else:
            self.turnProgramOff(event_name, data['data'], kwargs)

    def handleHeatingProgram(self, event_name, data, kwargs):
        data=data['data']
        progID = data["program"][-1]
        activeProgram= self.isHeatingProgramOn()
        now=datetime.strptime(self.get_state("sensor.date_time_iso"),"%Y-%m-%dT%H:%M:%S")
        today=now.strftime("%A").lower()
        self.log("Starting Program %s",progID, level="INFO")
        self.log("Checking if another program is on", level="INFO")

        #Creates file and initializes it if it doesn't exist
        if not path.exists(file):
            self.log("Creating the heating schedule file", level="INFO")
            self.programSchedule(data)

        if activeProgram!=int(progID) and activeProgram!=0:
            self.log("Program {} is already active".format(activeProgram), level="INFO")
            return

        comfort_temp = self.get_state("input_number.temperature_period{}".format(progID))

        if activeProgram==0:
            self.log("Checking the heating program state", level="INFO")

            if self.get_state("input_boolean.thermostat_{}_program{}".format(today,progID))=="off":
                self.log("The Program is not active for today", level="INFO")
                return

            on_time,off_time,status=self.getProgramSchedule(progID, data, "running")
            if status=="manual_off":
                if off_time<now:
                    self.__setProgramSchedule__(progID, data, status="not running")
                else:
                    self.log("The program was manually interrupted", level="INFO")
                return
            if on_time<=now<off_time:
                if float(comfort_temp)<=float(data["temperature"]):
                    self.log("The comfort temperature was reached", level="INFO")
                    if self.get_state("input_boolean.heater_program{}_on".format(progID))=="on":
                        self.log("The program is now ending", level="INFO")
                        self.turnProgramOff(event_name, data, kwargs={**kwargs, "comfort_temp": comfort_temp})
                    return
                if self.get_state("input_boolean.heater_program{}_on".format(progID))=="off":
                    self.log("The heating program {} is now starting".format(progID), level="INFO")
                    self.turn_on("input_boolean.heater_program{}_on".format(progID))
                    self.turnHeatingOn(data)
                else:
                    self.log("This program is already active", level="INFO")
            else:
                self.log("Program {} is not active right now".format(progID), level="INFO")

        else:
            off_time=self.getProgramSchedule(progID,data, "running")[1]
            if float(comfort_temp)<=float(data["temperature"]):
                        self.log("The comfort temperature was reached", level="INFO")
                        self.log("The program is now ending", level="INFO")
                        self.turnProgramOff(event_name, data, kwargs={**kwargs, "comfort_temp": comfort_temp})
                        return
            if off_time<=now:
                self.log("The heating program {} is now ending".format(progID), level="INFO")
                self.turnProgramOff(event_name, data, kwargs)
                return
            else:
                self.log("This program is already active", level="INFO")

    def turnHeatingOn(self,data):
        program=data["program"]
        eventData = self.extractEventData(data)

        trvList=[]

        if program=="prog0":
            self.log("Checking if another program is on", level="INFO")
            if self.isHeatingProgramOn()!=0: return

        self.log("Retrieving TRV list", level="INFO")

        trvList=self.getTRVList()

        self.log("Starting heating", level="INFO")
        self.log("Setting temperature", level="INFO")
        self.setTargetTempFromProgram(trvList, program)
        self.turn_on("switch.sw_thermostat")
        if program!="prog0":
            self.__setProgramSchedule__(program[-1], data, status="running")

        if asyncio.run(self.checkHeaterState({"counter": 1}, "on", time=5)):
            self.log("Thermostat turned on", level="INFO")
            self.fire_event("AD_KAIROSHUB_NOTIFICATION",sender=eventData["sender"], ncode="HEATING_ON", severity="NOTICE", kwargs={"program": int(program[-1])})
            self.fire_event("HA_ENTITY_METRICS") #entity metrics request update

            if not asyncio.run(self.isValveOpen({"trvList":trvList,"counter":1})):
                self.fire_event("AD_KAIROSHUB_NOTIFICATION",sender=eventData["sender"], ncode="HEATING_VALVES_CLOSED", severity="NOTICE")
                self.fire_event("HA_ENTITY_METRICS") #entity metrics request update
        else:
            self.log("Thermostat didn't turn on", level="INFO")
            self.fire_event("AD_KAIROSHUB_NOTIFICATION",sender=eventData["sender"], ncode="HEATING_ON_ERROR", severity="NOTICE")
            self.fire_event("HA_ENTITY_METRICS") #entity metrics request update

    def turnHeatingOff(self, data):
        program=data["program"]
        self.log("Turning off heating", level="INFO")
        if program!="prog0":
            input_bool="input_boolean.heater_program{}_on".format(program[-1])
            if self.get_state(input_bool)=="on":
                self.turn_off(input_bool)
                self.log("Program %s was turned off",program[-1])
                self.__setProgramSchedule__(program[-1], data, status="not running")
        else:
            activeProgram= self.isHeatingProgramOn()
            if activeProgram !=0:
                self.__setProgramSchedule__(activeProgram, data, status="manual_off")
                self.turn_off("input_boolean.heater_program{}_on".format(activeProgram))

        self.turn_off("switch.sw_thermostat")

        if asyncio.run(self.checkHeaterState({"counter":1}, "off", time=5)):
            self.fire_event("AD_KAIROSHUB_NOTIFICATION",sender=data["sender"], ncode="HEATING_OFF", severity="NOTICE", kwargs = {"program": int(program[-1]), "comfort_temp": data["comfort_temp"]})
            self.log("Thermostat turned off", level="INFO")
        else:
            self.fire_event("AD_KAIROSHUB_NOTIFICATION",sender=data["sender"], ncode="HEATING_OFF_ERROR", severity="ALERT")
            self.log("Thermostat didn't turn off", level="INFO")

        self.fire_event("HA_ENTITY_METRICS") #entity metrics request update

    def turnProgramOff(self, event_name, data, kwargs):

        self.log("turningProgram OFF")
        self.log(data, level="DEBUG")
        eventData = self.extractEventData(data)
        programData = {"program": data["program"], "comfort_temp": kwargs["comfort_temp"] if "comfort_temp" in kwargs else None}
        programOffData = {**programData, **eventData}

        self.log(programOffData, level="DEBUG")
        self.turnHeatingOff(data=programOffData)

    def programSchedule(self, data):
        now=datetime.strptime(self.get_state("sensor.date_time_iso"),"%Y-%m-%dT%H:%M:%S")
        today=now.strftime("%A").lower()
        date=now.strftime("%Y-%m-%dT")
        nextdate=(now+timedelta(days=1)).strftime("%Y-%m-%dT")
        schedule={}

        for id in range(1,5):
            schedule["prog{}".format(id)]={}
            on_time=datetime.strptime(date+self.get_state("input_datetime.thermostat_{}_on_period{}".format(today, id)),"%Y-%m-%dT%H:%M:%S")
            off_time=datetime.strptime(date+self.get_state("input_datetime.thermostat_{}_off_period{}".format(today, id)),"%Y-%m-%dT%H:%M:%S")
            delta=on_time-off_time
            if delta>timedelta(0):
                off_time=datetime.strptime(nextdate+self.get_state("input_datetime.thermostat_{}_off_period{}".format(today, id)),"%Y-%m-%dT%H:%M:%S")
            schedule["prog{}".format(id)]["on_time"]=on_time.strftime("%Y-%m-%dT%H:%M:%S")
            schedule["prog{}".format(id)]["off_time"]=off_time.strftime("%Y-%m-%dT%H:%M:%S")
            schedule["prog{}".format(id)]["status"]="not running"

        with open(file,"w") as f:
            json.dump(schedule,f)

    def getProgramSchedule(self,progID, kwargs, status):
        self.__setProgramSchedule__(progID, kwargs, status)
        with open(file, "r") as f:
            data=json.load(f)
            data=data["prog{}".format(progID)]

        return datetime.strptime(data['on_time'],"%Y-%m-%dT%H:%M:%S"), datetime.strptime(data["off_time"],"%Y-%m-%dT%H:%M:%S"),data["status"]

    def __setProgramSchedule__(self, progID, kwargs, status):
        with open(file, "r") as f:
            program_data=json.load(f)
        now=datetime.strptime(self.get_state("sensor.date_time_iso"),"%Y-%m-%dT%H:%M:%S")
        today=now.strftime("%A").lower()
        nextdate=(now+timedelta(days=1)).strftime("%Y-%m-%dT")
        date=now.strftime("%Y-%m-%dT")
        schedule={}
        f_on_time=datetime.strptime(program_data["prog{}".format(progID)]["on_time"],"%Y-%m-%dT%H:%M:%S")
        f_off_time=datetime.strptime(program_data["prog{}".format(progID)]["off_time"],"%Y-%m-%dT%H:%M:%S")

        if program_data["prog{}".format(progID)]["status"]=="manual_off" or status=="manual_off":
            if f_off_time<=now:
                status="not running"
            else:
                status="manual_off"
            on_time=f_on_time
            off_time=f_off_time
        elif f_off_time>now and program_data["prog{}".format(progID)]["status"]=="running" and status !="not running":
            self.log("This program schedule should not change")
            return f_on_time, f_off_time, "running"
        else:
            on_time=datetime.strptime(date+self.get_state("input_datetime.thermostat_{}_on_period{}".format(today,progID)),"%Y-%m-%dT%H:%M:%S")
            off_time=datetime.strptime(date+self.get_state("input_datetime.thermostat_{}_off_period{}".format(today,progID)),"%Y-%m-%dT%H:%M:%S")
            delta=on_time-off_time
            if delta>timedelta(0):
                off_time=datetime.strptime(nextdate+self.get_state("input_datetime.thermostat_{}_off_period{}".format(today,progID)),"%Y-%m-%dT%H:%M:%S")
        f_on_time=on_time
        f_off_time=off_time
        schedule["on_time"]=f_on_time.strftime("%Y-%m-%dT%H:%M:%S")
        schedule["off_time"]=f_off_time.strftime("%Y-%m-%dT%H:%M:%S")
        schedule["status"]=status
        program_data["prog{}".format(progID)]=schedule

        with open(file, "w") as f:
            json.dump(program_data,f)

    def isHeatingProgramOn(self):
        for index in range(1,5):
            if self.get_state("input_boolean.heater_program{}_on".format(index))=="on":
                return index
        return 0

    async def checkHeaterState(self, kwargs, state, time=30):
        self.log("Checking if the heater was turned %s. Try: %s of %s", state, kwargs["counter"], self.maxRetry, level="INFO")

        if await self.get_state("switch.sw_thermostat")==state:
            return True
        if kwargs["counter"] < self.maxRetry:
            await asyncio.sleep(time)
            return await self.checkHeaterState( {"counter": kwargs["counter"]+1}, state, time=time)

        else:
            return False

    async def isValveOpen(self, kwargs):

            self.log("Checking if valves are open. Try: %s of %s", kwargs["counter"], self.maxRetry, level="INFO")
            trvList=kwargs["trvList"]
            counter=kwargs["counter"]
            trvList= await self.getTRVListAwait()
            for trv in trvList:
                sensor=trv["sensorName"]
                trv_pos=trv[sensor+"_pos"]
                if trv_pos!="unknown" and trv_pos!="unavailable" and float(trv_pos)>0 :
                    self.log("Valve %s is open", sensor, level="INFO")
                    return True

            if counter < self.maxRetry:
                await asyncio.sleep(30)
                counter=counter+1
                kwargs={"trvList":trvList,"counter":counter}
                return await self.isValveOpen( kwargs)

            else:
                self.log("No valves are open", level="ERROR")
                return False

    def setTargetTempFromProgram(self, trvList, program):
        for trv in trvList:
            if program=="prog0":
                self.setTargetTemp(trv["command_topic"], float(self.get_state("input_number.manual_heating_temp")))
            elif program=="prog1":
                self.setTargetTemp(trv["command_topic"], float(self.get_state("input_number.temperature_period1")))
            elif program=="prog2":
                self.setTargetTemp(trv["command_topic"], float(self.get_state("input_number.temperature_period2")))
            elif program=="prog3":
                self.setTargetTemp(trv["command_topic"], float(self.get_state("input_number.temperature_period3")))
            elif program=="prog4":
                self.setTargetTemp(trv["command_topic"], float(self.get_state("input_number.temperature_period4")))

    def setTargetTemp(self, topic, value):
        topic=topic+"target_t"
        if value <18: value=18
        if value >31: value=31

        #mqtt publish on topic with value
        self.fire_event("AD_MQTT_PUBLISH",topic=topic,payload=value)

        self.log("Target temperature for %s was set to: %s",topic, value, level="INFO")

    def getTRVList(self):
        trvList=[]
        trvs_group = self.get_state("group.heating_valves", attribute="entity_id")

        for group in trvs_group:
            trvs= self.get_state(group, attribute="entity_id")

            for trv in trvs:
                attributes={}
                sensor= trv[: trv.find("_")]
                name = sensor.split(".")[1].upper()

                attributes["sensorName"]=sensor
                attributes[sensor+"_temp"]= self.get_state(sensor+"_temp")
                attributes[sensor+"_target_temp"]= self.get_state(sensor+"_target_temp")
                attributes[sensor+"_pos"]= self.get_state(sensor+"_pos")
                attributes["state_topic"]="shellies/{}/info".format(name)
                attributes["command_topic"]="shellies/{}/thermostat/0/command/".format(name)
                trvList.append(attributes)

        return trvList

    async def getTRVListAwait(self):
        trvList=[]
        trvs_group = await self.get_state("group.heating_valves", attribute="entity_id")

        for group in trvs_group:
            trvs= await self.get_state(group, attribute="entity_id")
            for trv in trvs:
                attributes={}
                sensor= trv[: trv.find("_")]
                name = sensor.split(".")[1].upper()

                attributes["sensorName"]=sensor
                attributes[sensor+"_temp"]= await self.get_state(sensor+"_temp")
                attributes[sensor+"_target_temp"]= await self.get_state(sensor+"_target_temp")
                attributes[sensor+"_pos"]= await self.get_state(sensor+"_pos")
                attributes["state_topic"]="shellies/{}/info".format(name)
                attributes["command_topic"]="shellies/{}/thermostat/0/command/".format(name)
                trvList.append(attributes)

        return trvList

    def extractEventData(self, eventData):

        if "event" in eventData:
            event = eventData["event"]
            sender=  event["sender"] if "sender" in event else None
            eventType= event["eventType"] if "eventType" in event else None

            return {
                "sender": sender,
                "eventType": eventType
            }
        else:
            return {
                "sender": "",
                "eventType": ""
            }
