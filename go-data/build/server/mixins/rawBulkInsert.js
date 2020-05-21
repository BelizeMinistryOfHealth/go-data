"use strict";const _=require("lodash"),App=require("../server"),Timer=require("../../components/Timer"),Uuid=require("uuid").v4;module.exports=function(e){let t=_.get(e,"definition.settings.mongodb.collection");t||(t=e.modelName),e.rawBulkInsert=function(e=[],n={},r={}){if(!e.length)return null;let o=_.get(r,"accessToken.userId","unavailable"),i=new Date;e=e.map(e=>(e._id=e.id||Uuid(),e.deleted=!1,e.createdAt=i,e.updatedAt=i,e.createdBy=o,e.updatedBy=o,e));const d=Uuid.v4(),u=new Timer;return u.start(),App.logger.debug(`[QueryId: ${d}] Performing MongoDB insert on collection '${t}'}`),App.dataSources.mongoDb.connector.collection(t).insertMany(e,n).then(e=>(App.logger.debug(`[QueryId: ${d}] MongoDB bulk insert completed after ${u.getElapsedMilliseconds()} msec`),e))}};