"use strict";const app=require("../../server/server"),path=require("path"),_=require("lodash"),fs=require("fs"),config=require("../../server/config"),uuid=require("uuid");module.exports=function(e){e.cache,e.observe("before save",function(e,t){let r=e.instance?e.instance.clientApplications:e.data.clientApplications;if(Array.isArray(r)){let e={};r.forEach(function(t){let r=t.credentials.clientId;e[r]||(e[r]=0),e[r]++});let a=Object.keys(e).filter(t=>e[t]>1);if(a.length)return t(app.utils.apiError.getError("REQUEST_VALIDATION_ERROR_DUPLICATE_CLIENT_IDS",{errorMessages:`Client IDs must be unique. Duplicate client IDs: ${a.join(", ")}. `,duplicateClientIDs:a}))}let a=e.instance?e.instance.upstreamServers:e.data.upstreamServers;if(Array.isArray(a)){let e={};a.forEach(function(t){let r=t.url;e[r]||(e[r]=0),e[r]++});let r=Object.keys(e).filter(t=>e[t]>1);if(r.length)return t(app.utils.apiError.getError("REQUEST_VALIDATION_ERROR_DUPLICATE_SERVER_IDS",{errorMessages:`Server URLs must be unique. Duplicate server URLs: ${r.join(", ")}.`,duplicateServerURLs:r}))}if(!(e.instance&&e.instance.dataBackup||e.data.dataBackup))return t();{const r=app.utils.helpers.getSourceAndTargetFromModelHookContext(e),a=_.get(r,"source.all.dataBackup.location"),s=path.resolve(a);fs.access(s,fs.constants.R_OK|fs.constants.W_OK,function(e){return e?t(app.utils.apiError.getError("REQUEST_VALIDATION_ERROR_INVALID_BACKUP_LOCATION",{errorMessages:`Configured backup location ${a} is not accessible for read/write`,backupLocation:{path:a,resolvedPath:s,error:e}})):(_.set(r,"target.dataBackup",Object.assign(_.get(r,"source.all.dataBackup",{}),_.get(r,"target.dataBackup",{}))),_.set(r,"target.dataBackup.location",s),t())})}}),e.getCache=function(){return e.cache?Promise.resolve(e.cache):new Promise(function(t,r){e.getSystemSettings(function(a,s){a?(app.logger.debug(`Failed to cache the system settings: ${a}`),r(a)):(e.cache=s,app.logger.debug("Successfully cached the system settings"),t(s))})})},app.on("started",function(){e.getCache().catch(function(e){app.logger.debug(`Failed to cache the system settings at startup: ${e}`)})}),e.observe("after save",function(t,r){e.cache=t.instance,app.logger.debug("Successfully cached the system settings"),r()}),e.getDefaultArcGisServers=function(){const e=[],t=_.get(config,"defaultArcGisServers",[]);return Array.isArray(t)&&t.length&&t.forEach(function(t){t.url&&e.push({name:t.name,url:t.url})}),e},e.migrate=function(e,t){const r=app.dataSources.mongoDb.connector;return r.connect(()=>{const e=r.collection("systemSettings");return e.findOne().then(r=>{if(r){let a=!1;if(r.clientApplications=(r.clientApplications||[]).map(e=>{const t=e.id||uuid.v4();return e.id!==t&&(e.id=t,a=!0),e}),a)return e.updateOne({_id:r.id},{$set:{clientApplications:r.clientApplications}}).then(()=>{t()}).catch(t);t()}else t()})})}};