# Steps to enable the recording of Alert Events for use with SLO/R
The following must be followed if you wish to use Alert violations as the basis for Availability, Capacity, or Latency SLOs.

## 1. Generate an Insights insert token

Insights inser tokens can be generated from the _Manage data_ option in your New Relic Insights account (e.g. https://insights.newrelic.com/accounts/{your-account-id}/manage/summary 

![Screenshot #9](screenshots/screenshot_09.png)
> Appears on the left hand navigation panel on the Insights landing page.

![Screenshot #11](screenshots/screenshot_11.png)
> Select the _Add data_ option from the top navigation menu.

![Screenshot #12](screenshots/screenshot_12.png)
> We will want to create a new _Insert Key_ click the "+" sign to enter the create dialog.

![Screenshot #13](screenshots/screenshot_13.png)
> You just need to enter a note to configure the key, I recommend SLOR_ALERTS (that will be the name of the Insights event table created)

![Screenshot #14](screenshots/screenshot_14.png)
> Once your key is created keep it handy, you will need it to configure the Webhook.


## 2. Create a Webhook notification channel

In your New Relic Alerts dialog (e.g. https://...alerts-thingy) 


## 3. Create an Alert and add the SLOR_ALERT notification Webhook

