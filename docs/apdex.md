# Apdex
 
In much the same way I am enthusiastic about Transactions I also have a soft spot for Apdex. [New Relic Docs](http://apdex) do a great job describing Apdex as does the [Apdex Alliance](http://foo-bah.com), here is how I think about it and why I think it is awesome.
 
My plain explanation goes something like this. Think of your transaction's execution being classified into 3 buckets with the end user in mind:
- Satisfied
- Tolerated
- Frustrated 
 
Now create some rules, it's easy enough to set an expectation of total duration for a transaction, say 500 milliseconds. That 500 milliseconds becomes our Apdex Target (or T) value. Anything under that T threshold will be considered _satisfied_. You get a 1/1 score for any satisfied transaction.
 
Now consider the tier based on that threshold from 500 milliseconds to 4 times that amount - in this case 2000 milliseconds. That is the tier we call _tolerated_. You get a .5/1 score for any tolerated transaction.
 
Anything above 2 seconds we group into the _frustrated_ tier. We also add any transactions that result in an Error observed by the New Relic APM Agent. You get a 0/1 score for any frustrated transaction.
 
For a given period of time, say a minute we just add up those attainments and divide by the total possible to get your Apdex calculation.
 
So, 10,000 transaction, 1,000 tolerated, and 100 frustrated gives you an Apdex attainment of:
(10,000 - (1,000 * .5) - (100 * 1)) / 10,000 = 0.94
 
If you set your Apdex T value to something that is representative of your transaction duration and reliability expectations you should get back a pretty useful number that helps you to understand the conditional variations of application performance over time.
 
## Apdex musings
I have found that some people feel pretty strongly about Apdex, maybe some of these feelings are a result of the marketing efforts of some APM tools over the years. I (clearly) think it is useful but like any measurement it is important to understand what it is measuring and value it accordingly.
 
In the case of highly complex monolith type service I have to admit the Apdex value you get back was highly dependent on a lot of factors. Typically monoliths pack in a bunch of different functionality into one runtime. This tended to mean you had a lot of diversity in duration of different transaction. I mean, it's kind of hard to compare a read event to a write event using the same expectation. Even within a single transaction, you might have parameters that yield highly different results (try querying an hour's worth of data and a year's - you get the idea).
 
Another aspect of monolith runtime behaviour was the net resource effect of transaction volumes on the service. If between 9am and 10am your service handles a disproportionate number of logins and those login transactions are really computationally expensive, then the performance of a search transaction at that time might be different than when the transaction mix is itself different.
 
One of the funny side effects of micro transaction architectures in more recent service implementations is that they tend to lend themselves to a uniformity of Apdex measurement, through limited functional implementation.
 
The net/net is that when using Apdex as a defect be sure to have a good sense of the way those tiers are being calculated and what that means for your application.
 
## Apdex as it relates to SLO/R
So if you select the _Apdex Frustrated_ measurement this is going to depend directly on what is configured for your service. SLO/R will dutifully report an Apdex Frustrated event because that is the attainment tier of the transaction as it was recorded by the APM agent and resides in Insights.
 
We might provide the option to override this, or configure a specific Apdex T for SLO/R - but for the moment whatever is in the service configuration is what will be used.
 