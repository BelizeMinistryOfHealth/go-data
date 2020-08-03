# GO DATA Containerization

This repository is an attempt by the Ministry of Health(MOH) to deploy _Go.Data_
in an affordable manner during the COVID19 Pandemic.

## Background
Belize's economy was devastated by the COVID19 Pandemic. A side effect of this was
that the Government had limited resources to invest in information systems. Although
foreign governments and international organizations were making donations to 
confront the pandemic, there was little to no funding towards improving the
information systems for managing the outbreaks. In light of this, the Epidemiology Unit (EPI) was 
exploring creative avenues for deploying tools like Go.Data at an affordable cost. 

## Concept
This repository was born of an attempt to deploy _Go.Data_ to a server without needing
to buy a server. We believed that using a `serverless` approach would get us close to that end.
A `serverless` approach essential is one where most infrastructure operations and cost are outsourced
to the platform, and where we pay only for the compute time that we use. 

To achieve this we needed to separate the database from the application. _Go.Data_ embeds a `MongoDb`
server in its distribution. When starting up the server in the official way, a `MongoDb` server that 
comes with the distribution is also booted up. In a `serverless` environment this would not be possible
because the servers are turned off when they are idle. Starting up the `Mongodb` server with the application 
also adds to the boot up time. This in turn would make the requests made to `Go.Data` initially very slow.


In order to address this issue, we removed the database component from the distribution, and modified the startup 
shell script so that it only booted up the nodejs application. The database was then offloaded to a hosted
solution from [Mongodb](https://www.mongodb.com/cloud/atlas) itself. We subscribed to the `$9/mo` instance. If we 
do the math, and assume that we will be dealing with this pandemic for the next 24 months, the total cost for
hosting a database would be $216 USD. This is less than what it would cost to acquire a new server, and install it,
an pay for the power that it consumes.

The challenge we faced extracting the database was that the connection protocol was embedded in the code. Connecting
to a Mongodb server over the network requires that we use the `mongodb+srv` protocol instead of the `mongodb` protocol
that the code was configured with. Since the distributed code is minified, it was very difficult to chase down all the relevant
instances in the code where we needed to make this change. 

The next step we tried was to deploy `Go.Data` to `Google App Engine` (GAE). This service is a `pay per use` service, so it
means we would only be charged for every request we made. An `F1` instance would cost us $0 for 730 hours of uptime. And $0.12
for Outoing Network Traffic of 2GiB and 1GiB of Cloud Storage. This approach failed primarily because the `nodejs` app 
depends on `pm2`, which needs to be up all the time.

We then tried packaging the `nodejs` applicaiton in a `docker containers`. We were able to successuflly do so. This repository
includes a `Dockerfile` which can be used to build an image. The docker container was deployed to `Cloud Run`. We hoped
that using `Cloud Run` would still help us run _Go.Data_ as a `serverless` application. However, the boot times for
the _Go.Data_ were too slow. This made us realize that _Go.Data_ does not do well in an environment where it will be
shutdown for long periods of time, and where it needs to bootup in a matter of milliseconds. 

At this point we decided to collapse our efforts and deploy _Go.Data_ as described in the official documentation.
We chose `Google Compute Engine`. The server is running on a `n1-standard-1` machine type, which costs `$0.04749975` per hour.
This comes up to `$34.20` per month. If we assume that we will need the server for the next `24` months, the total cost
is `$820.8` USD. This is an amortized cost that is cheaper than acquiring a physical server in this climate, and powering that
server in our own infrastructure. 




