"use strict";const uuid=require("uuid");module.exports=function(e){e.remotes().phases.addBefore("auth","transaction-init").use(function(r,t){r.req.transactionId=r.req.headers["transaction-id"]||uuid.v4(),r.req.logger=e.logger.getTransactionLogger(r.req.transactionId),t()})};