# Steps to enable the recording of Alert Events for use with SLO/R
The following must be followed if you wish to use Alert violations as the basis for Availability, Capacity, or Latency SLOs.

## 1. Generate an Insights insert token

Insights insert tokens can be generated from the _Manage data_ option in your New Relic Insights account (e.g. https://insights.newrelic.com/accounts/{your-account-id}/manage/summary 

![Screenshot #9](../screenshots/screenshot_09.png)
> Appears on the left hand navigation panel on the Insights landing page.

![Screenshot #11](../screenshots/screenshot_11.png)
> Select the _Add data_ option from the top navigation menu.

![Screenshot #12](../screenshots/screenshot_12.png)
> We will want to create a new _Insert Key_ click the "+" sign to enter the create dialog.

![Screenshot #13](../screenshots/screenshot_13.png)
> You just need to enter a note to configure the key, I recommend SLOR_ALERTS (that will be the name of the Insights event table created)

![Screenshot #14](../screenshots/screenshot_14.png)
> Once your key is created keep it handy, you will need it to configure the Webhook.


## 2. Create a Webhook notification channel

![Screenshot #20](../screenshots/screenshot_20.png)
> In New Relic Alerts click on "Notification Channel" and then "New notification channel"


![Screenshot #17](../screenshots/screenshot_17.png)
> Select the "Webhook" channel type

> Set the "Channel name" as SLOR_ALERTS


```https://insights-collector.newrelic.com/v1/accounts/{your account id}/events```
> The "Base Url" should be the Insights collector events Url - be sure to specify your Account ID


![Screenshot #21](../screenshots/screenshot_21.png)
![Screenshot #22](../screenshots/screenshot_22.png)
> You will need to add a custom header and specify the X-Insert-Key you generated in step 1 above


![Screenshot #23](../screenshots/screenshot_23.png)
> Add a Custom Payload

> Replace the default payload with the one below ...
```
{
  "eventType": "SLOR_ALERTS",
  "account_id": "$ACCOUNT_ID",
  "account_name": "$ACCOUNT_NAME",
  "closed_violations_count_critical": "$CLOSED_VIOLATIONS_COUNT_CRITICAL",
  "closed_violations_count_warning": "$CLOSED_VIOLATIONS_COUNT_WARNING",
  "condition_family_id": "$CONDITION_FAMILY_ID",
  "condition_name": "$CONDITION_NAME",
  "current_state": "$EVENT_STATE",
  "details": "$EVENT_DETAILS",
  "duration": "$DURATION",
  "event_type": "$EVENT_TYPE",
  "incident_acknowledge_url": "$INCIDENT_ACKNOWLEDGE_URL",
  "incident_id": "$INCIDENT_ID",
  "incident_url": "$INCIDENT_URL",
  "metadata": "$METADATA",
  "open_violations_count_critical": "$OPEN_VIOLATIONS_COUNT_CRITICAL",
  "open_violations_count_warning": "$OPEN_VIOLATIONS_COUNT_WARNING",
  "owner": "$EVENT_OWNER",
  "policy_name": "$POLICY_NAME",
  "policy_url": "$POLICY_URL",
  "runbook_url": "$RUNBOOK_URL",
  "severity": "$SEVERITY",
  "targets": "$TARGETS",
  "timestamp": "$TIMESTAMP",
  "violation_callback_url": "$VIOLATION_CALLBACK_URL",
  "violation_chart_url": "$VIOLATION_CHART_URL"
}
```

![Screenshot #24](../screenshots/screenshot_24.png)
> Save your changes 


 ![Screenshot #19](../screenshots/screenshot_19.png)
> You should have defined a notification channel that looks like the following

## 3. Create an Alert and add the SLOR_ALERT notification Webhook



