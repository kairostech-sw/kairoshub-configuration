import hassapi as hass


class KairoshubAlexaIntegration(hass.Hass):

    def initialize(self):
        self.listen_event(self.sendRegistration,
                          "AD_ALEXA_INTEGRATION_REQUEST")
        self.listen_event(self.deleteAccount,
                          "AD_INTEGRATION_ALEXA_ACCOUNT_REMOVE")
        self.listen_event(self.toggleSubscriptionRenew,
                          "AD_ALEXA_RENEW_TOGGLE")
        self.listen_event(self.setIntegrationStatus,
                          "AD_ALEXA_INTEGRATION_DETAIL")

    def setIntegrationStatus(self, event_name, data, kwargs):
        integrations = data["data"]["integrations"]

        for i in integrations:
            if "alexa" in i["subscription_ref"]:
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
                break

    def sendRegistration(self, event_name, data, kwargs):
        self.log("Sending request for Alexa integration")
        self.sendEventToCloud("INTEGRATION_ALEXA_REGISTRATION_REQ")

    def deleteAccount(self, event_name, data, kwargs):
        self.log("Deleting Alexa Account")
        self.sendEventToCloud("INTEGRATION_ALEXA_SUBSCRIPTION_REMOVE")

    def toggleSubscriptionRenew(self, event_name, data, kwargs):
        self.log("Toggling Alexa Subscription renew")
        self.sendEventToCloud("INTEGRATION_ALEXA_SUBSCRIPTION_REMOVE")

    def sendEventToCloud(self, event_type):
        system_code = self.get_state("input_text.system_code")
        event_data = {
            "eventType": event_type,
            "systemCode": system_code,
            "message": event_type.replace("_", " ")
        }

        self.fire_event("HAKAFKA_PRODUCER_PRODUCE",
                        topic="TECHNICAL", message=event_data)
