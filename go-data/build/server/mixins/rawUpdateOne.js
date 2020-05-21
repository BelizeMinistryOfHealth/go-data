"use strict";const _=require("lodash"),app=require("../server"),Timer=require("../../components/Timer"),uuid=require("uuid");module.exports=function(e){let t=_.get(e,"definition.settings.mongodb.collection");t||(t=e.modelName);const n=_.get(e,"definition.settings.scope.where");e.rawUpdateOne=function(e,o,r={},i={}){e=e||{};const d=uuid.v4(),u=new Timer;return u.start(),o.updatedAt=new Date,o.updatedBy=_.get(r,"accessToken.userId","unavailable"),n&&(e={$and:[n,e]}),e=app.utils.remote.convertLoopbackFilterToMongo({$and:[{$or:[{deleted:!1},{deleted:{$eq:null}}]},e]}),app.logger.debug(`[QueryId: ${d}] Performing MongoDB request on collection '${t}': updateOne query: ${JSON.stringify(e)} update: ${JSON.stringify(o)}`),app.dataSources.mongoDb.connector.collection(t).findOneAndUpdate(e,{$set:o},i).then(function(e){app.logger.debug(`[QueryId: ${d}] MongoDB request completed after ${u.getElapsedMilliseconds()} msec`);const t=e.value;return t.id=t._id,delete t._id,t})}};