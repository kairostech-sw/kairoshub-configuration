import hassapi as hass


class KairoshubAlexaIntegration(hass.Hass):

    def initialize(self):
        self.listen_event(self.sendIntegrationRequest,
                          "AD_INTEGRATION_ALEXA_REGISTRATION_REQ")
        self.listen_event(self.updateIntegrationState,
                          "AD_INTEGRATION_ALEXA_REGISTRATION_ON")
        self.listen_event(self.updateIntegrationState,
                          "AD_INTEGRATION_ALEXA_REGISTRATION_OFF")

        self.listen_event(self.sendIntegrationRequest,
                          "INTEGRATION_ALEXA_SUBSCRIPTION_RENEW_TOGGLE_REQ")
        self.listen_event(self.updateIntegrationState,
                          "INTEGRATION_ALEXA_SUBSCRIPTION_RENEW_TOGGLE_TO_ON")
        self.listen_event(self.updateIntegrationState,
                          "INTEGRATION_ALEXA_SUBSCRIPTION_RENEW_TOGGLE_TO_OFF")

    def sendIntegrationRequest(self, event_name, data, kwargs):
        self.log("Sending request to integration event: "+event_name)

        event_data = {
            "eventType": event_name.replace("AD_"),
            "systemCode": self.get_state("input_text.system_code"),
            "message": event_name.replace("_", " ")
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE",
                        topic="TECHNICAL", message=event_data)

        self.fire_event("AD_KAIROSHUB_NOTIFICATION",
                        sender="*", ncode=event_name, severity="NOTICE")

    def updateIntegrationState(self, event_name, data, kwargs):
        integrations = data["data"]["integrations"]
        try:
            for i in integrations:
                # persisting integration state
                self.persistIntegrationState(i)

            self.fire_event("AD_KAIROSHUB_NOTIFICATION",
                            sender="*", ncode=event_name, severity="NOTICE")
        except Exception as e:
            self.log("Error occourred on updating integration state "+e)

    def persistIntegrationState(self, i):

        # ALEXA
        if "alexa" in integration["subscription_ref"]:
            self.log("Setting Alexa Integration status")

            integration = {
                "alexa_subscription_state": ("DISATTIVA", "ATTIVA")[i["active"] == True],
                "alexa_subscription_activation_date": i["activation_date"],
                "alexa_subscription_renew_date": i["renew_date"],
                "alexa_auto_renew": ("NO", "SI")[i["renew"] == True]
            }

            for k, v in integration.items():
                self.log("Setting %s with state: %s", k, v)
                attributes = self.get_state(
                    "input_text."+k, attribute="attributes")
                self.set_state("input_text."+k, state=v,
                               attributes=attributes)

            self.call_service("homeassistant/save_persistent_states")

            return integration
