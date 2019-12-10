# Alert Driven SLOs
 
As the heading above indicates, Alert driven SLOs are calculated using Alert violation window durations evaluated for a given time period. The Availability, Capacity, and Latency SLO types in SLO/R all use this Alert calculation mechanism.
 
A fair amount of thought was put into defining these three SLO types rather than allowing you to define your own types. It was done to help structure user thinking of SLO creation into these buckets. The way we recommend thinking about these SLOs is as follows:
 
- Availability: The simple up down status of a service, or service component. The underlying SLI here should be a test that determines if it is available or not. You can really get _wrapped around an axel_ thinking about what availability means for your service or component. Out advice is to keep it as simple as possible.
 
- Capacity: This really defines anything that is related to a fixed amount of resources. Capacity measurements can be defined for things like memory utilization (e.g. don't exceed 90% of total), or transaction throughput (don't exceed 1,000 transactions a minute). For this case you're tracking when an SLI deviates from it's expected range. It's good to get a sense of how often that happens, especially if it can be tied to changes in the underlying implementation of the service.
 
- Latency: This describes SLIs bounded by a duration. Total response time of a transaction, the response time for a given component (e.g. datastore call).
 
## How Alert Driven SLOs are calculated
 
As stated on the referring page, Alert Driven SLOs measure the total amount of time an Alert is in violation. Here is an example:
 
### Example: Availability SLO calculation over 7 days
 
- Assume for a given 7 day period the Alerts tied to your Availability SLO were triggered three times:
    - Event 1: Sunday morning 0005-0021 (16 minute duration)
    - Event 2: Monday afternoon 1515-1520 (5 minute duration)
    - Event 3: Friday night 2100-2107 (7 minutes duration)
 
SLO/R issues an Insights query to get the Alert Events for the defined SLO - it looks them up by the Alert names you specify for the SLO. Since these alert violations have happened discreetly (there is no overlap), it just aggregates the total amount of time spent in those three events. In this case, 29 minutes. We then take the total number of minutes in that 7 day week, 10,080 and derive the fraction of time this SLO was in abeyance 29/10080 or 0.0028769 - then we just subtract that from 1 and multiply by 100 to calculate the percentage of time the SLO was in compliance, in this case 99.71231% of the time you were available.
 
- If your SLO is dependent on more Alerts to define its state, there is a possibility of overlap. In that case we take the total exclusive duration of the Alert events eliminating the overlapping time to derive the SLO compliance percentage.
 