"use strict";
const MongoClient=require("mongodb").MongoClient;
const async=require("async"),tmp=require("tmp"),archiver=require("archiver"),fs=require("fs");
const Moment=require("moment"),path=require("path"),AdmZip=require("adm-zip"),_=require("lodash"),logger=require("./../logger");
const dbSync=require("./../dbSync"),workerRunner=require("./../workerRunner");
const dbConfig=require("./../../server/datasources").mongoDb;
const convertLoopbackFilterToMongo=require("../../components/convertLoopbackFilterToMongo");
function createZipArchive(e,r,t){
  return new Promise(function(n,o){
    t.debug("Creating zip file");
    let i=fs.createWriteStream(r);
    s=archiver("zip");
    i.on("close",function(){
      t.debug(`Archive created at '${r}'. Size: ${s.pointer()} bytes'`),n(r)
    });
    s.on("warning",function(e){t.debug("Archive warning"+e)});
    s.on("error",function(e){
      t.debug("Archive error"+e),o(e)
    });
    s.pipe(i);
    fs.statSync(e).isDirectory()?s.directory(e,!1):s.file(e,{name:path.basename(e)}),s.finalize()
  })
};

function getMongoDBConnection(){
  let opts={};
  dbConfig.password&&(opts={
    auth:{
      user:dbConfig.user,
      password:dbConfig.password
    },
    authSource:dbConfig.authSource,
    useNewUrlParse:true,
    protocol: dbConfig.protocol
  });
  console.log(`Connecting via sync with user:${dbConfig.user} and password: ${dbConfig.password}`);
  return MongoClient.connect(`mongodb+srv://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/retryWrites=true&w=majority`, opts)
  .then(function(e, o){
    return o.db(dbConfig.database)
  });
};
  
function exportCollectionInBatches(e,r,t,n,o,i,s,c,a){!function l(E=0){let d=E?E/o:0;e.collection(r).find(n,{skip:E,limit:o}).toArray().then(function(e){if(!(c.exportEmptyCollections||e&&e.length))return logger.debug(`Collection '${t}' export success.`),a();dbSync.exportCollectionRelatedFiles(t,e,s,logger,c.password,r=>{if(r)return logger.debug(`Collection '${t}' related files export failed. Error: ${r}`),a(r);c.hasDataToExport=!0;let n=`${t}.${d}.json`,p=`${i}/${n}`;fs.writeFile(p,JSON.stringify(e,null,2),function(){let r=`${s}/${n}.zip`;createZipArchive(p,r,logger).then(function(){return c.password?(logger.debug(`Encrypting '${r}'.`),workerRunner.helpers.encryptFile(c.password,{},r)):Promise.resolve()}).then(function(){return e.length<o?(logger.debug(`Collection '${t}' export success.`),a()):(logger.debug(`Exported batch ${d} of collection '${t}'.`),l(E+o))}).catch(function(e){return logger.debug(`Failed to export batch ${d} of collection '${t}': ${e}`),a(e)})})})}).catch(function(e){return logger.debug(`Collection '${t}' export failed. Error: ${e}`),a(e)})}()}const worker={exportCollections:function(e,r){return getMongoDBConnection().then(function(t){return new Promise(function(n,o){let i,s,c;try{i=tmp.dirSync(),s=i.name,c=`${s}/archives`,fs.mkdirSync(c)}catch(e){return logger.debug(`Failed creating tmp directories; ${e}`),o(e)}let a=r.filter,l=null;a.where.hasOwnProperty("fromDate")&&(l={updatedAt:{$gte:new Date(a.where.fromDate)}}),r.hasDataToExport=!1;const E={deleted:{$ne:!0}};let d=Promise.resolve();(d=d.then(()=>{let e=E;const n=_.get(r,"filter.where.outbreakId");return _.isEmpty(n)||(e={$and:[{_id:convertLoopbackFilterToMongo(n)},e]}),t.collection(dbSync.collectionsMap.outbreak).find(e,{projection:{_id:1}}).toArray().then(e=>({outbreaks:_.transform(e,(e,r)=>{e[r._id]=r},{})}))}).then(e=>{let r=E;return r={$and:[{outbreakId:{$in:Object.keys(e.outbreaks)}},r]},a.where.locationsIds&&a.where.teamsIds&&(r={$and:[{$or:[{type:{$ne:"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT"}},{type:"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT","followUp.status":"LNG_REFERENCE_DATA_CONTACT_FINAL_FOLLOW_UP_STATUS_TYPE_UNDER_FOLLOW_UP"}]},{$or:[{type:{$in:["LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT","LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE"]},$or:[{addresses:{$elemMatch:{typeId:"LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE_USUAL_PLACE_OF_RESIDENCE",$or:[{locationId:null},{locationId:{$in:a.where.locationsIds}}]}}},{"addresses.typeId":{$ne:"LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE_USUAL_PLACE_OF_RESIDENCE"}}]},{type:"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT",$or:[{"address.typeId":{$ne:"LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE_USUAL_PLACE_OF_RESIDENCE"}},{"address.typeId":"LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE_USUAL_PLACE_OF_RESIDENCE",$or:[{"address.locationId":null},{"address.locationId":{$in:a.where.locationsIds}}]}]}]},r]}),t.collection(dbSync.collectionsMap.person).find(r,{projection:{_id:1,type:1}}).toArray().then(r=>(e.cases={},e.contacts={},e.events={},r.forEach(r=>{switch(r.type){case"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT":e.contacts[r._id]=!0;break;case"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE":e.cases[r._id]=!0;break;case"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT":e.events[r._id]=!0}}),e))}).then(e=>{if(e.retrievedRelationships=[],_.isEmpty(e.contacts))return e;const r={$and:[{"persons.id":{$in:Object.keys(e.contacts)}},E]};return t.collection(dbSync.collectionsMap.relationship).find(r,{projection:{_id:1,persons:1}}).toArray().then(r=>(e.retrievedRelationships=r,e))}).then(e=>(e.relationships={},e.retrievedRelationships.forEach(r=>{if(!r.persons||2!==r.persons.length)return;let t,n;switch("LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT"===r.persons[0].type&&e.contacts[r.persons[0].id]?(t=r.persons[1].id,n=r.persons[1].type):(t=r.persons[0].id,n=r.persons[0].type),n){case"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT":e.contacts[t]=!0,e.relationships[r._id]=!0;break;case"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE":e.cases[t]=!0,e.relationships[r._id]=!0;break;case"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT":e.events[t]=!0,e.relationships[r._id]=!0}}),e)).then(e=>{if(e.retrievedRelationships=[],_.isEmpty(e.cases)&&_.isEmpty(e.events))return e;const r=Object.keys(e.relationships),n=[...Object.keys(e.cases),...Object.keys(e.events)],o={$and:[{_id:{$nin:r},"persons.0.id":{$in:n},"persons.1.id":{$in:n}},E]};return t.collection(dbSync.collectionsMap.relationship).find(o,{projection:{_id:1}}).toArray().then(r=>(e.retrievedRelationships=r,e))}).then(e=>(e.retrievedRelationships.forEach(r=>{e.relationships[r._id]=!0}),e)).then(e=>{a.where=a.where||{},a.where.contactsIds=Object.keys(e.contacts),a.where.casesIds=Object.keys(e.cases),a.where.eventsIds=Object.keys(e.events),a.where.relationshipsIds=Object.keys(e.relationships),a.where.personsIds=[...a.where.casesIds,...a.where.contactsIds,...a.where.eventsIds]}).catch(o)).then(function(){async.series(Object.keys(e).map(n=>o=>{let i=dbSync.collectionsFilterMap[n]?dbSync.collectionsFilterMap[n](n,l,a):l;logger.debug(`Exporting collection: ${n}`),exportCollectionInBatches(t,e[n],n,i,r.chunkSize||1e4,s,c,r,o)}),e=>{const t=e=>{const r=e=>{fs.existsSync(e)&&(fs.readdirSync(e).forEach(function(t){const n=`${e}${path.sep}${t}`;fs.lstatSync(n).isDirectory()?r(n):fs.unlinkSync(n)}),fs.rmdirSync(e))};try{r(e)}catch(e){logger.error(`Failed removing tmp directories: ${e}`)}};if(e)return t(s),o(e);if(!r.hasDataToExport)return o({code:"NO-DATA"});let i=`${tmp.tmpdir}/snapshot_${Moment().format("YYYY-MM-DD_HH-mm-ss")}.zip`;createZipArchive(c,i,logger).then(e=>{t(s),n(e)}).catch(e=>{t(s),o(e)})})}).catch(o)})})},extractAndDecryptSnapshotArchive:function(e,r){return new Promise(function(t,n){let o,i,s,c,a;try{logger.debug("Creating tmp directories"),o=tmp.dirSync({unsafeCleanup:!0}),i=o.name,s=`${i}/collections`,fs.mkdirSync(s)}catch(e){return logger.error(`Failed creating tmp directories; ${e}`),n(e)}try{logger.debug(`Extracting zip archive: ${e}`),new AdmZip(e).extractAllTo(i)}catch(r){return logger.error(`Failed to extract zip archive: ${e}. ${r}`),n("string"==typeof r?{message:r}:r)}try{c=(c=fs.readdirSync(i)).filter(function(e){return!fs.statSync(`${i}/${e}`).isDirectory()&&".zip"===path.extname(e)})}catch(e){return logger.error(`Failed to read collection archive files at : ${i}. ${e}`),n(e)}if(r.password){let e=c.map(function(e){return function(t){workerRunner.helpers.decryptFile(r.password,{},`${i}/${e}`).then(function(){t()}).catch(t)}});a=new Promise(function(r,t){logger.debug(`Decripting archives from: ${i}`),async.parallelLimit(e,5,function(e){return e?(logger.error(`Failed to decrypt archive files from : ${i}. ${e}`),t(e)):r()})})}else a=Promise.resolve(c);a.then(function(){try{logger.debug(`Extracting archives from: ${i}`),c.forEach(function(e){new AdmZip(`${i}/${e}`).extractAllTo(s)})}catch(e){return logger.error(`Failed to extract collection archives at: ${i}. ${e}`),n("string"==typeof e?{message:e}:e)}return t({collectionFilesDirName:s,tmpDirName:i})}).catch(n)})}};process.on("message",function(e){worker[e.fn](...e.args).then(function(e){process.send([null,e])}).catch(function(e){process.send([e])})});