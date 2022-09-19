import asyncio
import hassapi as hass
from datetime import datetime

class HeatingManager(hass.Hass):

    def initialize(self):
        self.listen_event(self.manageHeating, "HA_MANAGE_HEATER")
        self.listen_event(self.handleHeatingOnEvent,"AD_HEATING_ON")
        self.listen_event(self.heatingOff,"AD_HEATING_OFF")
        self.listen_event(self.handleHeating, "AD_HEATING")

    def manageHeating(self, event_name, data, kwargs):
        
        event = data.get('event')
        self.log("Event name: %s", event)

        self.handleProgOnEvent(event_name, data, kwargs)

    def handleHeating(self, event_name, data, kwargs):
        if self.get_state("switch.sw_thermostat") =="off":
            self.handleHeatingOnEvent(event_name, data, kwargs)
        else: self.heatingOff(event_name, data, kwargs)

    def handleProgOnEvent(self, event_name, data, kwargs):
        today=datetime.now().strftime("%A").lower()
        progNumber=data["program"][-1]
        now="{}:00".format(self.get_state("sensor.time"))
        on_time=data["on_off_time_{}".format(today)]["on_time"]
        off_time=data["on_off_time_{}".format(today)]["off_time"]
        self.log("Checking if another program is on", level="INFO")

        if self.isHeatingProgramOn()==int(progNumber): 
            if off_time<=now:
                self.log("The heating program {} is now ending".format(progNumber), level="INFO")
                self.turn_off("input_boolean.heater_program{}_on".format(progNumber))
                self.heatingOff(event_name, data, kwargs)
                return

        self.log("Checking the heating program state", level="INFO")

        if self.get_state("input_boolean.thermostat_{}_program{}".format(today,progNumber))=="off": 
            self.log("The Program is not active for today", level="INFO")
            return

       
        if on_time<=now<off_time:
            self.log("The heating program {} is now starting".format(progNumber), level="INFO")
            self.turn_on("input_boolean.heater_program{}_on".format(progNumber))
            self.handleHeatingOnEvent(event_name, data, kwargs)
        else:
            self.log("The Program is not active right now", level="INFO")
        
    def handleHeatingOnEvent(self, event_name, data, kwargs):
        
        program=data["program"]
        trvList=[]
        temperatureSensor=[]
        temperatureSensorGroup     = self.get_state("group.sensor_temperatures", attribute="entity_id")

        trvNum=self.get_state("sensor.temperatura",attribute="count_sensors")-len(temperatureSensorGroup)
        sensor_temperatura=self.get_state("sensor.temperatura")

        if program=="manual":
            self.log("Checking if another program is on", level="INFO")
            if self.isHeatingProgramOn()!=0: return

        self.log("Retrieving Temperature sensors", level="INFO")
        for entity in temperatureSensorGroup:
            attributes={}
            attributes[entity.split(".")[1]]=self.get_state(entity)
            temperatureSensor.append(attributes)
        
        self.log("Retrieving TRV list", level="INFO")

        trvList=self.getTRVList(trvNum)
        
        self.log("Starting heating", level="INFO")
        self.heatingOn(program,trvList)
 
    def heatingOn(self, program:str, trvList:list):

        self.log("Setting temperature", level="INFO")
        self.setTargetTempFromProgram(trvList, program)
        
        if asyncio.run(self.isValveOpen({"trvList":trvList,"counter":1})):
            self.turn_on("switch.sw_thermostat")
            self.log("Thermostat turned on", level="INFO")
        
        #self.notify()  
              
    def heatingOff(self, event_name, data, kwargs):
        program=data["program"]
        self.log("Turning off heating", level="INFO")
        
        if program!="manual":
            input_bool="input_boolean.heater_program{}_on".format(program[-1])
            if self.get_state(input_bool)=="on":
                self.turn_off(input_bool)
                self.log("Program%s was turned off",program[-1])
        
        self.turn_off("switch.sw_thermostat")
        asyncio.run(self.isHeaterOff({"counter":1}))

    def isHeatingProgramOn(self):
        for index in range(1,5):
            if self.get_state("input_boolean.heater_program{}_on".format(index))=="on":
                self.log("Program {} is already active".format(index), level="INFO")
                return index
        return 0
 
    async def isHeaterOff(self, kwargs):
        self.log("Checking if the heater was turned off. Try: %s", kwargs["counter"], level="INFO")

        counter=kwargs["counter"]
        if await self.get_state("switch.sw_thermostat")=="off":
            self.log("The heater turned off", level="INFO")
            #self.notify("Heater turned off")
            return True
        if counter <3:
            await asyncio.sleep(30)
            counter=counter+1
            kwargs={"counter":counter}
            return await self.isHeaterOff( kwargs)
                
        else:
            self.log("The heater didn't turn off", level="INFO")
            #self.notify("ERROR: The heater didn't turn off")
    
    async def isValveOpen(self, kwargs):

            self.log("Checking if valves are open. Try: %s", kwargs["counter"], level="INFO")
            trvList=kwargs["trvList"]
            counter=kwargs["counter"]
            trvList=await  self.getTRVListAwait(len(trvList))
            for trv in trvList:
                sensor=trv["sensorName"]
                if trv[sensor+"pos"]!="unknown" and float(trv[sensor+"pos"])>0 :
                    self.log("Valve %s is open", sensor, level="INFO")
                    return True

            if counter <3:
                await asyncio.sleep(30)
                counter=counter+1
                kwargs={"trvList":trvList,"counter":counter}
                return await self.isValveOpen( kwargs)
                
            else:
                self.log("No valves are open", level="INFO")
                #self.notify()
                return
            
    def setTargetTempFromProgram(self, trvList, program):
        for trv in trvList:
            if program=="manual":
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
        if value <4: value=4
        if value >31: value=31

        #mqtt publish on topic with value
        self.setMQTTTopicTemp(topic, value)

        self.log("Target temperature for %s was set to: %s",topic, value, level="INFO")

    def setMQTTTopicTemp(self,topic,value):
        self.fire_event("AD_MQTT_PUBLISH",topic=topic,payload=value)

    def getTRVList(self,trvNum):
        trvList=[]
        tv="sensor.tv"

        for index in range(1,trvNum+1):
            attributes={}
            if index<10:
                sensor="{}0{}_".format(tv,index)
                name="TV0{}".format(index)
            else:
                sensor="{}{}_".format(tv,index)
                name="TV{}".format(index)
            attributes["sensorName"]=sensor
            attributes[sensor+"temp"]= self.get_state(sensor+"temp")
            attributes[sensor+"target_temp"]= self.get_state(sensor+"target_temp")
            attributes[sensor+"pos"]= self.get_state(sensor+"pos")            
            attributes["state_topic"]="shellies/{}/info".format(name)
            attributes["command_topic"]="shellies/{}/thermostat/0/command/".format(name)
            trvList.append(attributes)

        return trvList

    async def getTRVListAwait(self,trvNum):
        trvList=[]
        tv="sensor.tv"

        for index in range(1,trvNum+1):
            attributes={}
            if index<10:
                sensor="{}0{}_".format(tv,index)
                name="TV0{}".format(index)
            else:
                sensor="{}{}_".format(tv,index)
                name="TV{}".format(index)
            attributes["sensorName"]=sensor
            
            attributes[sensor+"temp"]= await self.get_state(sensor+"temp")
            attributes[sensor+"target_temp"]= await self.get_state(sensor+"target_temp")
            attributes[sensor+"pos"]= await self.get_state(sensor+"pos")            
            attributes["state_topic"]="shellies/{}/info".format(name)
            attributes["command_topic"]="shellies/{}/thermostat/0/command/".format(name)
            trvList.append(attributes)

        return trvList


