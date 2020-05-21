"use strict";
const path=require("path");
const disableRemoteMethods=require("../../components/disableRemoteMethods");
const disableStandardRelationRemoteMethods=require("../../components/disableStandardRelationRemoteMethods");
const disableCommonExtraRoutes=require("../../components/disableCommonExtraRoutes");
const searchByRelationProperty=require("../../components/searchByRelationProperty");
const mergeFilters=require("../../components/mergeFilters");
const convertLoopbackFilterToMongo=require("../../components/convertLoopbackFilterToMongo");
const convertNestedGeoPointsFilterToMongo=require("../../components/convertNestedGeoPointsFilterToMongo");
const apiError=require("../../components/apiError");
const anonymizeDatasetFields=require("../../components/anonymizeDatasetFields");
const maskField=require("../../components/maskField");
const qrCode=require("../../components/qrCode");
const helpers=require("../../components/helpers");
const remoteHelpers=require("../../components/remoteHelpers"),pdfDoc=require("../../components/pdfDoc"),spreadSheetFile=require("../../components/spreadSheetFile");
const dbSync=require("../../components/dbSync"),pushNotificationsApi=require("../../components/services/pushNotificationsApi"),fileCryptoSync=require("../../components/fileCrypto");
const worker=require("../../components/workerRunner");

function init(e,o){
  e.utils={
    remote:{
      disableRemoteMethods:disableRemoteMethods,
      searchByRelationProperty:searchByRelationProperty,
      disableStandardRelationRemoteMethods:disableStandardRelationRemoteMethods,
      disableCommonExtraRoutes:disableCommonExtraRoutes,
      mergeFilters:mergeFilters,
      convertLoopbackFilterToMongo:convertLoopbackFilterToMongo,
      convertNestedGeoPointsFilterToMongo:convertNestedGeoPointsFilterToMongo,
      helpers:remoteHelpers,
      getUserFromOptions:function(e){
          let o;return e&&e.remotingContext&&e.remotingContext.req&&e.remotingContext.req.authData&&(o=e.remotingContext.req.authData.user),o
        }
      },
    apiError:apiError,
    aesCrypto:{
      encrypt:worker.helpers.encrypt,
      decrypt:worker.helpers.decrypt
    },
    anonymizeDatasetFields:anonymizeDatasetFields,maskField:maskField,qrCode:qrCode,helpers:helpers,pdfDoc:pdfDoc,spreadSheetFile:spreadSheetFile,dbSync:dbSync,services:{pushNotificationsApi:pushNotificationsApi},fileCrypto:{encrypt:worker.helpers.encryptFile,encryptSync:fileCryptoSync.encryptSync,decrypt:worker.helpers.decryptFile,decryptSync:fileCryptoSync.decryptSync}},e.ROOT_PATH=path.resolve(__dirname,"../.."),RegExp.prototype.toJSON||(RegExp.prototype.toJSON=RegExp.prototype.toString),o()};
    
    module.exports=init;