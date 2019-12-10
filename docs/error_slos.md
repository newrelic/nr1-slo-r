# Error Driven SLOs
 
Full disclosure here, there was a lot of debate on how best to represent these calculations. The whole SLO/R project was originally conceived to keep track or _Error Budgets_, but then we kind of got sidetracked looking generally at SLOs. At a certain time and based on feedback from practitioners, we decided to stop talking specifically about Error Budgets with this SLO type and just named them _error type_. The _error type_ was also a little fraught, in reality this type measures defects, but sooner or later you have to come up with a name and Error Type stuck (so here we are).
 
Error Driven SLOs are based on transactions. Transactions from New Relic APM agents measure the roundtrip time of a given execution context and its descendants. The best way to think about this is a web request. I make a web request of _https://my-awesome-service/foo_. When that _foo_ web request hits the application code that is going to execute it the New Relic Agent creates a new instance of a Transaction (in this case named "foo").
 
Forgive my excitement but I am a big fan of Transactions and the technology within the New Relic Agent to keep track of them. When I think about a transaction I think of something similar to a basket. For this foo transaction basket we add a bunch of name value pairs starting with its name. You can expect to find things like the service name, apdex tier, and http response code.
 
So, in the case of Error Driven SLOs, we are looking at transaction names and a variety of defects --> HTTP response codes, and [Apdex Frustrated](./docs/apdex.md) tier. 
 
## How Error Driven SLOs are calculated
 
As you have probably already guessed, Error SLOs are calculating the percentage of specific transactions your service executes without a defect being reported. Here is an example: 
 
### Example: Error SLO calculation over 7 days
 
- Assume the execution behaviour for a transaction "Foo" over a 7 day period:
    - Total Transactions: 399,992
    - 500 Errors: 56
    - Apdex Frustrated: 157
 
There are a lot of other things that could have been happening to Foo over the 7 day period, but for the sake of argument let's just say we want to calculate the Error SLO based on 500 and Apdex F observations. So, (56 + 957) / 399,992 = 0.0025325. Turning that into a percentage of attainment we get 99.74675%
 