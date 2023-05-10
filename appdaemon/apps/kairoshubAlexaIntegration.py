import hassapi as hass

class KairoshubAlexaIntegration(hass.Hass):


  def initialize(self):
    self.listen_event(self.sendRegistration, "AD_ALEXA_INTEGRATION_REQUEST")
    self.listen_event(self.deleteAccount, "AD_INTEGRATION_ALEXA_ACCOUNT_REMOVE")
    self.listen_event(self.deleteSubscription, "AD_ALEXA_SUB_REMOVE")
    self.listen_event(self.setIntegrationStatus, "AD_ALEXA_INTEGRATION_DETAIL")

  def setIntegrationStatus(self, event_name, data, kwargs):
    data = data["data"]
    self.log("Setting Alexa Integration status")

    integration = {
      "alexa_subscription_state": data["subscription_state"],
      "alexa_subscription_activation_date": data["activation_date"],
      "alexa_subscription_renew_date": data["renew_date"],
      "alexa_linked_account": data["linked_account"],
      "alexa_linked_device": data["linked_device"],
      "alexa_auto_renew": ("NO","SI")[data["renew"]]
    }

    for k,v in integration.items():
      self.log("Setting %s with state: %s",k,v)
      attributes=self.get_state("input_text."+k, attribute="attributes")
      self.set_state("input_text."+k, state=v, attributes=attributes)

    self.call_service("homeassistant/save_persistent_states")

  def sendRegistration(self, event_name, data, kwargs):
    self.log("Sending request for Alexa integration")
    self.sendEventToCloud("INTEGRATION_ALEXA_REGISTRATION_REQ")

  def deleteAccount(self, event_name, data, kwargs):
    self.log("Deleting Alexa Account")
    self.sendEventToCloud("INTEGRATION_ALEXA_SUBSCRIPTION_REMOVE")

  def deleteSubscription(self, event_name, data, kwargs):
    self.log("Deleting Alexa Subscription")
    self.sendEventToCloud("INTEGRATION_ALEXA_SUBSCRIPTION_REMOVE")

  def sendEventToCloud(self, event_type):
    system_code = self.get_state("input_text.system_code")
    event_data = {
      "eventType": event_type,
      "systemCode": system_code,
      "message": event_type.replace("_", " ")
    }

    self.fire_event("HAKAFKA_PRODUCER_PRODUCE", topic="TECHNICAL", message=event_data)