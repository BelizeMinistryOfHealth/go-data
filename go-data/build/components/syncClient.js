"use strict";const request=require("request"),fs=require("fs"),app=require("../server/server");function normalizeURL(e){return"string"==typeof e&&e.lastIndexOf("/")===e.length-1&&(e=e.substring(0,e.length-1)),e}const SyncClient=function(e,r){this.options={baseUrl:normalizeURL(e.url),auth:{user:e.credentials.clientId,pass:e.credentials.clientSecret},timeout:e.timeout},this.upstreamServerName=e.name,this.upstreamServerURL=e.url,this.syncLogEntry=r,this.sendRequest=function(e,r){return app.logger.debug(`Sync ${this.syncLogEntry.id}: Sent request to upstream server: ${e.method} /${e.uri}${e.qs?"?"+JSON.stringify(e.qs):""}`),request(e,r)},this.getErrorResponse=function(e,r,t){let s=t||200;return e?(app.logger.debug(`Sync ${this.syncLogEntry.id}: Error connecting to upstream server`),app.utils.apiError.getError("EXTERNAL_API_CONNECTION_ERROR",{serviceName:"Upstream server",error:e})):(app.logger.debug(`Sync ${this.syncLogEntry.id}: Received response from upstream server. Status code: ${r.statusCode}`),r.body&&app.logger.debug(`Sync ${this.syncLogEntry.id}: Body: ${"object"==typeof r.body?JSON.stringify(r.body,null,2):r.body}`),r.statusCode!==s?app.utils.apiError.getError("UNEXPECTED_EXTERNAL_API_RESPONSE",{serviceName:"Upstream server",error:`Expected status code: ${s}. Received: ${r.statusCode}`}):void 0)},this.getAvailableOutbreaks=function(){let e=Object.assign({},this.options,{method:"GET",uri:"sync/available-outbreaks",json:!0}),r=this;return new Promise(function(t,s){r.sendRequest(e,function(e,n,o){if(e=r.getErrorResponse(e,n))return s(e);t(Array.isArray(o.outbreakIDs)?o.outbreakIDs:[])})})},this.sendDBSnapshotForImport=function(e,r,t){let s=Object.assign({},this.options,{method:"POST",uri:"sync/import-database-snapshot",formData:{snapshot:fs.createReadStream(e),asynchronous:r,autoEncrypt:t}}),n=this;return new Promise(function(e,r){n.sendRequest(s,function(t,s,o){if(t=n.getErrorResponse(t,s))return r(t);try{o=JSON.parse(o),e(o.syncLogId)}catch(e){r(app.utils.apiError.getError("UNEXPECTED_EXTERNAL_API_RESPONSE",{serviceName:"Upstream server",error:`Response parse error: ${e}`}))}})})},this.getSyncLogEntry=function(e){let r=Object.assign({},this.options,{method:"GET",uri:"sync-logs/"+e,json:!0}),t=this;return new Promise(function(e,s){t.sendRequest(r,function(r,n,o){if(r=t.getErrorResponse(r,n))return s(r);e(o)})})},this.getServerVersion=function(){let e=Object.assign({},this.options,{method:"GET",uri:"system-settings/version",json:!0}),r=this;return new Promise(function(t,s){r.sendRequest(e,function(e,n,o){if(e=r.getErrorResponse(e,n))return s(e);t(o)})})}};module.exports=SyncClient;