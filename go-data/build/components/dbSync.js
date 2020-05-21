"use strict";const _=require("lodash"),helpers=require("./helpers"),mkdirp=require("mkdirp"),fs=require("fs"),path=require("path"),async=require("async"),fsExtra=require("fs-extra"),workerRunner=require("./workerRunner"),collectionsWithFiles={icon:{prop:"path",srcDir:"server/storage/icons",targetDir:"icons"},fileAttachment:{prop:"path",srcDir:"server/storage/files",targetDir:"files"}},collectionsMap={systemSettings:"systemSettings",template:"template",icon:"icon",helpCategory:"helpCategory",helpItem:"helpItem",language:"language",languageToken:"languageToken",outbreak:"outbreak",person:"person",labResult:"labResult",followUp:"followUp",referenceData:"referenceData",relationship:"relationship",location:"location",team:"team",user:"user",role:"role",cluster:"cluster",auditLog:"auditLog",fileAttachment:"fileAttachment",device:"device",deviceHistory:"deviceHistory",importMapping:"importMapping"},userCollections=["team","user","role"],collectionsForExportTypeMap={system:["template","icon","helpCategory","helpItem","language","languageToken","referenceData","location"]};collectionsForExportTypeMap.outbreak=collectionsForExportTypeMap.system.concat(["outbreak"]),collectionsForExportTypeMap.full=collectionsForExportTypeMap.outbreak.concat(["person","labResult","followUp","relationship","cluster","fileAttachment"]),collectionsForExportTypeMap.mobile=collectionsForExportTypeMap.full.concat(userCollections),["template","icon","fileAttachment"].forEach(function(e){collectionsForExportTypeMap.mobile.splice(collectionsForExportTypeMap.mobile.indexOf(e),1)});let syncExcludeList=["systemSettings","team","user","role","auditLog","helpCategory","helpItem","device","deviceHistory"],syncCollections=Object.keys(collectionsMap).filter(e=>-1===syncExcludeList.indexOf(e)),syncModels=syncCollections.concat(["case","contact","event"]);const collectionsToSyncInSeries=["person"];function addOutbreakIdMongoFilter(e,t,o){let r=_.get(o,"where.outbreakId"),n=Object.assign({},t||{});if(r){let t="outbreakId";"outbreak"===e&&(t="_id"),"object"==typeof r?r.inq&&(n[t]={$in:r.inq}):n[t]=r}return n}function addPersonMongoFilter(e,t,o){let r=addOutbreakIdMongoFilter(e,t,o),n=_.get(o,"where.personsIds");return n&&(r._id={$in:n}),r}function addLabResultMongoFilter(e,t,o){let r=addOutbreakIdMongoFilter(e,t,o),n=_.get(o,"where.casesIds");return n&&(r.personId={$in:n}),r}function addFollowupMongoFilter(e,t,o){let r=addOutbreakIdMongoFilter(e,t,o),n=_.get(o,"where.contactsIds"),l=_.get(o,"where.teamsIds");return n&&l&&(r.personId={$in:n},r.$or=[{teamId:{$in:l}},{teamId:null}]),r}function addRelationshipMongoFilter(e,t,o){let r=addOutbreakIdMongoFilter(e,t,o),n=_.get(o,"where.relationshipsIds");return n&&(r._id={$in:n}),r}function addLanguageTokenMongoFilter(e,t,o){let r=Object.assign({},t||{}),n=_.get(o,"where.languageTokens");if(Array.isArray(n)){let e={$or:[{token:{$in:n}},{token:{$regex:`${["caseInvestigationTemplate","contactFollowUpTemplate","labResultsTemplate"].reduce(function(e,t){return e+="|"+t.toUpperCase()},"LNG_REFERENCE_DATA")}`}}]};r={$and:[r,e]}}return r}function isImportableRecord(e,t,o){let r=!0;if(o.length){let n="outbreak"===e?t._id:t.outbreakId;r=-1!==o.indexOf(n)}return r}const collectionsFilterMap={outbreak:addOutbreakIdMongoFilter,person:addPersonMongoFilter,labResult:addLabResultMongoFilter,followUp:addFollowupMongoFilter,relationship:addRelationshipMongoFilter,cluster:addOutbreakIdMongoFilter,fileAttachment:addOutbreakIdMongoFilter,languageToken:addLanguageTokenMongoFilter},collectionsImportFilterMap={outbreak:isImportableRecord,person:isImportableRecord,labResult:isImportableRecord,followUp:isImportableRecord,relationship:isImportableRecord,cluster:isImportableRecord,fileAttachment:isImportableRecord},syncRecordFlags={UNTOUCHED:"UNTOUCHED",CREATED:"CREATED",UPDATED:"UPDATED",REMOVED:"REMOVED"},syncRecord=function(e,t,o,r,n){function l(o,r){e[o](`dbSync::syncRecord ${t.modelName}: ${r}`)}function i(e,t){let o=t.definition.rawProperties,r=Object.keys(o).filter(e=>"geopoint"===o[e].type);r.length&&r.forEach(function(t){let o=helpers.getReferencedValue(e,t);Array.isArray(o)||(o=[o]),o.forEach(function(t){t.value&&t.value.coordinates&&void 0===t.value.lng&&void 0===t.value.lat&&_.set(e,t.exactPath,{lat:t.value.coordinates[1],lng:t.value.coordinates[0]})})})}let a;"function"==typeof r&&(n=r,r={}),r._sync=void 0===r._sync||r._sync,_.isEmpty(t._parsedDateProperties)||function e(t,o){for(let r in o)if(-1===["createdAt","updatedAt","deletedAt"].indexOf(r)){if(o.hasOwnProperty(r))if("object"==typeof o[r])Array.isArray(t[r])&&t[r].forEach(t=>e(t,o[r]));else{let e=_.get(t,r);if(""===e&&(e=null,_.set(t,r,e)),e){let o=helpers.getDate(e);o.isValid()&&_.set(t,r,o.toDate())}}}else{let e=_.get(t,r);if(""===e&&(e=null,_.set(t,r,e)),e){helpers.getDate(e).isValid()||_.set(t,r,null)}}}(o,t._parsedDateProperties),void 0!==o.id?(l("debug",`Trying to find record with id ${o.id}.`),a=t.findOne({where:{id:o.id},deleted:!0})):(l("debug","Record id not present"),a=Promise.resolve());const c=a.then(function(e){return e?o.updatedAt?new Date(e.updatedAt).getTime()<new Date(o.updatedAt).getTime()?(i(o,t),l("debug",`Record found (id: ${o.id}), updating record`),e.deleted||void 0===o.deleted||!0!==o.deleted&&("string"!=typeof o.deleted||"true"!==o.deleted.toLowerCase())&&1!==o.deleted?e.updateAttributes(o,r).then(function(e){return{record:e,flag:syncRecordFlags.UPDATED}}):(delete o.deleted,e.updateAttributes(o,r).then(function(e){return e.destroy(r).then(function(){return t.findOne({where:{id:o.id},deleted:!0}).then(function(e){return{record:e,flag:syncRecordFlags.REMOVED}})})}))):(l("debug",`Record found (id: ${o.id}) but data received is older than server data, record ignored.`),{record:e,flag:syncRecordFlags.UNTOUCHED}):(i(o,t),l("debug",`Record found (id: ${o.id}) but data received is missing updatedAt property, probably comes from external system, creating new record (with new id).`),delete o.id,t.create(o,r).then(function(e){return{record:e,flag:syncRecordFlags.CREATED}})):(i(o,t),l("debug",`Record not found (id: ${o.id}), creating record.`),t.create(o,r).then(function(e){return{record:e,flag:syncRecordFlags.CREATED}}))});if("function"!=typeof n)return c;c.then(function(e){n(null,e)}).catch(n)},exportCollectionRelatedFiles=function(e,t,o,r,n,l){let i={};if(require("./../server/models/storage")(i),!t.length)return l();if(!collectionsWithFiles.hasOwnProperty(e))return l();const a=collectionsWithFiles[e];return mkdirp(path.join(o,a.targetDir),e=>e?l(e):async.parallelLimit(t.map(e=>(function(t){let l=i.resolvePath(e[a.prop]);return fs.lstat(l,function(i){if(i)return r.warn(`Failed to export file: ${l}. Related record: ${e.id}.`,i),t();let c=path.join(o,a.targetDir,path.basename(e[a.prop]));return fs.copyFile(l,c,function(){return n?workerRunner.helpers.encryptFile(n,{},c).then(function(){r.debug(`Encrypted file: ${c}. Related record: ${e.id}.`),t()}).catch(function(o){r.warn(`Failed to encrypt file: ${c}. Related record: ${e.id}.`,o),t()}):t()})})})),10,l))},importCollectionRelatedFiles=function(e,t,o,r,n){if(!collectionsWithFiles.hasOwnProperty(e))return n();const l=collectionsWithFiles[e];let i=path.join(t,l.targetDir),a=path.join(__dirname,"..",l.srcDir);function c(){fsExtra.copy(i,a,function(e){return e?(o.warn(`Failed to copy files from tmp dir '${i}' to '${a}'`),n(e)):n()})}return o.debug(`Importing related files for collection '${e}'`),r?fs.readdir(i,(e,t)=>e?(o.warn(`Failed to read files from tmp dir '${i}'.`),n(e)):(o.debug(`Decrypting files at '${i}'`),async.parallelLimit(t.map(e=>t=>{let n=`${i}/${e}`;workerRunner.helpers.decryptFile(r,{},n).then(function(){t()}).catch(function(e){o.warn(`Failed to decrypt file '${n}'. Error: ${e}. Removing file.`),fs.unlink(n,function(e){o.warn(`Failed to remove file '${n}'. Error: ${e}.`),t()})})}),5,function(){return c()}))):c()};module.exports={collectionsMap:collectionsMap,collectionsFilterMap:collectionsFilterMap,collectionsImportFilterMap:collectionsImportFilterMap,collectionsToSyncInSeries:collectionsToSyncInSeries,syncRecord:syncRecord,syncRecordFlags:syncRecordFlags,syncCollections:syncCollections,collectionsForExportTypeMap:collectionsForExportTypeMap,userCollections:userCollections,syncModels:syncModels,collectionsWithFiles:collectionsWithFiles,exportCollectionRelatedFiles:exportCollectionRelatedFiles,importCollectionRelatedFiles:importCollectionRelatedFiles};