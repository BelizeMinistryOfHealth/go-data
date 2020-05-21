"use strict";const app=require("../server"),async=require("async"),_=require("lodash"),availableOperationsMap={delete:function(e,o,n,t){app.models[e].find({where:o}).then(function(e){let o=[];e.forEach(function(e){o.push(function(o){e.destroy(n,o)})}),async.series(o,function(o){t(o,e.length)})}).catch(t)},restore:function(e,o,n,t){app.models[e].find({where:o,deleted:!0}).then(function(e){let o=[];e.forEach(function(e){o.push(function(o){e.undoDelete(n,o)})}),async.series(o,function(o){t(o,e.length)})}).catch(t)}};module.exports=function(e,o){function n(n,t,a){let i,r=Object.assign({},e.definition.settings.relations||{},e.customRelations||{});t.instance&&t.instance.id?i=t.instance.id:t.where&&t.where.id&&(i=t.where.id);let s=[];if(i){const a=e=>JSON.parse(JSON.stringify(e).replace(/":FK_UUID"/g,`"${i}"`)),c=e=>{return{name:_.isString(e)?e:e.relation,operations:_.isObject(e)&&!_.isEmpty(e.operations)?a(e.operations):{}}};o.relations.forEach(function(o){const a=c(o);let l=r[a.name];if(l)switch(l.type){case"hasManyEmbedded":case"hasOne":case"hasMany":s.push(function(o){availableOperationsMap[n](l.model,Object.assign({[l.foreignKey]:i},a.operations[n]&&!_.isEmpty(a.operations[n].where)?a.operations[n].where:{}),Object.assign({},t.options,a.operations[n]&&!_.isEmpty(a.operations[n].set)?{extraProps:a.operations[n].set}:{}),function(t,i){t?app.logger.error(`Cascade ${n} failed for ${e.modelName}. Relation ${a.name} ${n} failed to be cascaded: ${JSON.stringify(t)}`):app.logger.debug(`Cascade ${n} ${e.modelName} relation ${a.name} completed successfully. Affected ${i} records`),o(t,i)})});break;default:app.logger.error(`Cascade ${n} aborted for ${e.modelName}. Could not handle relation type ${l.type} for ${a.name}.`)}else app.logger.error(`Cascade ${n} aborted for ${e.modelName}. Could not find relation definition for ${a.name}.`)})}else app.logger.error(`Cascade ${n} aborted for ${e.modelName}. No instance ID found.`);async.series(s,function(){o.awaitCompletion&&a()}),o.awaitCompletion||a()}void 0===o.awaitCompletion&&(o.awaitCompletion=!0),o&&o.relations&&o.relations.length&&(e.observe("after delete",function(e,o){n("delete",e,o)}),e.observe("after restore",function(e,o){n("restore",e,o)}))};