"use strict";const app=require("../server");function internalError(r,e,t,o){r.statusCode?o(r):(e.logger?e.logger.error(r,r.stack):app.logger.error(r,r.stack),o(app.utils.apiError.getError("INTERNAL_ERROR",{error:{code:r.code,message:r.message,name:r.name,toString:function(){return JSON.stringify(this)}}})))}module.exports=function(){return internalError};