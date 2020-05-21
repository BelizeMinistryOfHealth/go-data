"use strict";const app=require("../server/server"),fs=require("fs"),path=require("path"),async=require("async"),dbSync=require("./dbSync"),helpers=require("../components/helpers"),_=require("lodash"),moment=require("moment"),config=require("../server/config"),syncWorker=require("./workerRunner").sync,getBackupPassword=function(){let e=_.get(config,"backUp.password");return e&&(e=app.utils.helpers.sha256(e)),e},createBackup=function(e,r,o){const t=app.models,a=t.backup;let n=[];e.forEach(e=>{a.modules.hasOwnProperty(e)&&n.push(...a.modules[e])});try{helpers.isPathOK(r),t.sync.exportDatabase(null,n,{password:getBackupPassword(),chunkSize:1e4,exportEmptyCollections:!0},(e,t)=>{if(e)return app.logger.error(`Backup process failed. ${e}`),o(e);let a=path.parse(t),n=a.name+a.ext,p=path.join(r,n);fs.copyFile(t,p,e=>e?(app.logger.error(`Failed to copy backup file from ${t} to ${p}. ${e}`),o(e)):o(null,p))})}catch(e){let t=`Backup location: '${r}' is not OK. ${e}`;return app.logger.error(t),o(t)}},restoreBackup=function(e,r){app.models.backup.findOne({where:{id:e}}).then(o=>{if(!o)return r(app.utils.apiError.getError("MODEL_NOT_FOUND",{model:app.models.backup.modelName,id:e}));restoreBackupFromFile(o.location,e=>r(e))}).catch(e=>r(e))},restoreBackupFromFile=function(e,r){let o=app.dataSources.mongoDb.connector;o.connect(t=>{if(t)return app.logger.error("Failed to establish database connection"),r(t);let a={password:getBackupPassword()};return syncWorker.extractAndDecryptSnapshotArchive(e,a).then(function(e){let t=e.collectionFilesDirName,n=e.tmpDirName;return fs.readdir(t,(e,p)=>{if(e)return r(e);let l=p.filter(e=>(e=e.split("."))[0]&&dbSync.collectionsMap.hasOwnProperty(e[0]));l.sort(function(e,r){let o=e.split("."),t=r.split(".");return o[0]!==t[0]?o[0]<t[0]?-1:1:parseInt(o[1])<parseInt(t[1])?-1:1});let i={};return async.series(l.map(e=>r=>{let p=`${t}/${e}`;return fs.readFile(p,{encoding:"utf8"},(t,l)=>{if(t)return app.logger.error(`Failed to read collection file ${p}`),r(t);let c=e.split("."),s=c[0];app.logger.debug(`Restoring Collection '${s}' batch ${c[1]}...`);let u=null;try{u=o.collection(dbSync.collectionsMap[s])}catch(e){return app.logger.error(`Failed to establish connection to ${s} collection`),r(e)}let d=app.models[s]._parsedDateProperties;try{let e=JSON.parse(l);e.forEach(e=>{e.questionnaireAnswers&&helpers.convertPropsToDate(e.questionnaireAnswers);let r=null;e.hasOwnProperty("type")&&["LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE","LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT","LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT"].indexOf(e.type)>=0&&(r=app.models[app.models.person.typeToModelMap[e.type]]._parsedDateProperties),function e(r,o){for(let t in o)if(o.hasOwnProperty(t))if("object"==typeof o[t])Array.isArray(r[t])&&r[t].forEach(r=>e(r,o[t]));else{let e=_.get(r,t);if(e){let o=moment(e);o.isValid()&&_.set(r,t,o.toDate())}}}(e,r||d)});const o=function(){const o=function(){if(!e.length)return app.logger.debug(`Collection ${s} has no records in the file. Skipping it`),r();const o=u.initializeOrderedBulkOp();e.forEach(e=>{o.insert(e)}),o.execute(e=>e?(app.logger.error(`Failed to insert records for collection ${s}`),r(e)):(app.logger.debug(`Restoring Collection ${s} complete.`),r()))};i[s]?o():(i[s]=!0,u.deleteMany({},e=>{if(e)return app.logger.error(`Failed to delete database records of collection: ${s}`),r(e);o()}))};if(!dbSync.collectionsWithFiles.hasOwnProperty(s))return o();dbSync.importCollectionRelatedFiles(s,n,app.logger,a.password,e=>e?r():o())}catch(e){return app.logger.error(`Failed to parse collection file ${p}`),r(e)}})}),e=>r(e))})}).catch(r)})},removeBackup=function(e,r){return async.series([r=>{app.models.backup.deleteById(e.id,o=>o?(app.logger.warn(`Failed to remove backup record: ${e.id} from database. ${o}`),r(o)):r())},r=>e.location?fs.unlink(e.location,o=>o?(app.logger.warn(`Failed to remove ${e.location} for ${e.id}. ${o}`),r(o)):r()):r()],e=>r(e))},removeBackups=function(e={}){app.models.backup.find(e).then(e=>e.forEach(e=>removeBackup(e,()=>{})))},preRoutine=function(e){app.models.systemSettings.getCache().then(r=>{if(!r.dataBackup)return app.logger.warn("Backup settings not available."),e(!0);let o=r.dataBackup;fs.access(o.location,fs.F_OK,r=>r?(app.logger.error(`Configured backup location: ${o.location} is not OK. ${r}`),e(r)):e(null,o))})};module.exports={create:createBackup,restore:restoreBackup,remove:removeBackup,restoreFromFile:restoreBackupFromFile,removeBackups:removeBackups,preRoutine:preRoutine};