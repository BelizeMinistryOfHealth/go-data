"use strict";const app=require("../../server/server"),casesWorker=require("../../components/workerRunner").cases,_=require("lodash"),moment=require("moment"),helpers=require("../../components/helpers"),async=require("async");module.exports=function(e){e.getIsolatedContacts=function(e,E){return app.models.relationship.rawFind({$or:[{"persons.0.id":e,"persons.1.type":"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT"},{"persons.1.id":e,"persons.0.type":"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT"}]}).then(t=>{async.parallelLimit(t.map(E=>{const t=E.persons.find(e=>"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT"===e.type);return E=>{app.models.contact.find({where:{id:t.id}}).then(t=>{if(_.isEmpty(t))return void E(null,{isValid:!1});const L=t[0];app.models.relationship.rawFind({$or:[{"persons.0.id":L.id,"persons.1.id":{$ne:e}},{"persons.0.id":{$ne:e},"persons.1.id":L.id}]}).then(e=>E(null,{contact:L,isValid:!e.length}))}).catch(e=>E(e))}}),10,(e,_)=>e?E(e):E(null,_.filter(e=>e.isValid)))})},e.observe("after delete",(_,E)=>{const t=_.instance.id;e.getIsolatedContacts(t,(e,_)=>{if(e)return E(e);const L=[];_.forEach(e=>{e.isValid&&L.push(function(e){return _=>{e.destroy({extraProps:{deletedByParent:t}},_)}}(e.contact))}),async.parallelLimit(L,10,function(e){E(e)})})}),e.hasController=!1,e.discardedCaseClassifications=["LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION_NOT_A_CASE_DISCARDED"],e.sectionsFieldLabels={personalInformation:{title:"LNG_FORM_CASE_QUICK_LABEL_PERSONAL",labels:["LNG_CASE_FIELD_LABEL_FIRST_NAME","LNG_CASE_FIELD_LABEL_MIDDLE_NAME","LNG_CASE_FIELD_LABEL_LAST_NAME","LNG_CASE_FIELD_LABEL_GENDER","LNG_CASE_FIELD_LABEL_OCCUPATION","LNG_CASE_FIELD_LABEL_AGE","LNG_CASE_FIELD_LABEL_DOB","LNG_CASE_FIELD_LABEL_RISK_LEVEL","LNG_CASE_FIELD_LABEL_RISK_REASON","LNG_CASE_FIELD_LABEL_DATE_OF_REPORTING","LNG_CASE_FIELD_LABEL_IS_DATE_OF_REPORTING_APPROXIMATE","LNG_CASE_FIELD_LABEL_TRANSFER_REFUSED"]},addresses:{title:"LNG_CASE_FIELD_LABEL_ADDRESSES",labels:["LNG_ADDRESS_FIELD_LABEL_ADDRESS_TYPEID","LNG_ADDRESS_FIELD_LABEL_ADDRESS_COUNTRY","LNG_ADDRESS_FIELD_LABEL_ADDRESS_CITY","LNG_ADDRESS_FIELD_LABEL_ADDRESS_ADDRESS_LINE_1","LNG_ADDRESS_FIELD_LABEL_ADDRESS_ADDRESS_LINE_2","LNG_ADDRESS_FIELD_LABEL_ADDRESS_POSTAL_CODE","LNG_ADDRESS_FIELD_LABEL_ADDRESS_LOCATION_ID","LNG_ADDRESS_FIELD_LABEL_ADDRESS_GEO_LOCATION","LNG_LOCATION_FIELD_LABEL_GEO_LOCATION_LAT","LNG_LOCATION_FIELD_LABEL_GEO_LOCATION_LNG","LNG_ADDRESS_FIELD_LABEL_ADDRESS_GEO_LOCATION_ACCURATE","LNG_ADDRESS_FIELD_LABEL_ADDRESS_DATE","LNG_ADDRESS_FIELD_LABEL_PHONE_NUMBER"]},documents:{title:"LNG_CASE_FIELD_LABEL_DOCUMENTS",labels:["LNG_CASE_FIELD_LABEL_DOCUMENT_TYPE","LNG_CASE_FIELD_LABEL_DOCUMENT_NUMBER"]},epidemiology:{title:"LNG_PAGE_CREATE_CASE_TAB_INFECTION_TITLE",labels:["LNG_CASE_FIELD_LABEL_CLASSIFICATION","LNG_CASE_FIELD_LABEL_DATE_OF_ONSET","LNG_CASE_FIELD_LABEL_DATE_OF_ONSET_APPROXIMATE","LNG_CASE_FIELD_LABEL_DATE_BECOME_CASE","LNG_CASE_FIELD_LABEL_DATE_OF_INFECTION","LNG_CASE_FIELD_LABEL_OUTCOME_ID","LNG_CASE_FIELD_LABEL_DATE_OF_OUTCOME"]}},e.fieldLabelsMap=Object.assign({},e.fieldLabelsMap,{firstName:"LNG_CASE_FIELD_LABEL_FIRST_NAME",middleName:"LNG_CASE_FIELD_LABEL_MIDDLE_NAME",lastName:"LNG_CASE_FIELD_LABEL_LAST_NAME",gender:"LNG_CASE_FIELD_LABEL_GENDER",occupation:"LNG_CASE_FIELD_LABEL_OCCUPATION",age:"LNG_CASE_FIELD_LABEL_AGE","age.years":"LNG_CASE_FIELD_LABEL_AGE_YEARS","age.months":"LNG_CASE_FIELD_LABEL_AGE_MONTHS",dob:"LNG_CASE_FIELD_LABEL_DOB",classification:"LNG_CASE_FIELD_LABEL_CLASSIFICATION",dateBecomeCase:"LNG_CASE_FIELD_LABEL_DATE_BECOME_CASE",wasContact:"LNG_CASE_FIELD_LABEL_WAS_CONTACT",dateOfInfection:"LNG_CASE_FIELD_LABEL_DATE_OF_INFECTION",dateOfOnset:"LNG_CASE_FIELD_LABEL_DATE_OF_ONSET",isDateOfOnsetApproximate:"LNG_CASE_FIELD_LABEL_DATE_OF_ONSET_APPROXIMATE",dateOfReporting:"LNG_CASE_FIELD_LABEL_DATE_OF_REPORTING",riskLevel:"LNG_CASE_FIELD_LABEL_RISK_LEVEL",riskReason:"LNG_CASE_FIELD_LABEL_RISK_REASON",outcomeId:"LNG_CASE_FIELD_LABEL_OUTCOME_ID",dateOfOutcome:"LNG_CASE_FIELD_LABEL_DATE_OF_OUTCOME",type:"LNG_CASE_FIELD_LABEL_TYPE",dateRanges:"LNG_CASE_FIELD_LABEL_DATE_RANGES","dateRanges[].typeId":"LNG_CASE_FIELD_LABEL_DATE_RANGE_TYPE_ID","dateRanges[].startDate":"LNG_CASE_FIELD_LABEL_DATE_RANGE_START_DATE","dateRanges[].endDate":"LNG_CASE_FIELD_LABEL_DATE_RANGE_END_DATE","dateRanges[].centerName":"LNG_CASE_FIELD_LABEL_DATE_RANGE_CENTER_NAME","dateRanges[].locationId":"LNG_CASE_FIELD_LABEL_DATE_RANGE_LOCATION","dateRanges[].comments":"LNG_CASE_FIELD_LABEL_DATE_RANGE_COMMENTS",documents:"LNG_CASE_FIELD_LABEL_DOCUMENTS","documents[].type":"LNG_CASE_FIELD_LABEL_DOCUMENT_TYPE","documents[].number":"LNG_CASE_FIELD_LABEL_DOCUMENT_NUMBER",transferRefused:"LNG_CASE_FIELD_LABEL_TRANSFER_REFUSED",addresses:"LNG_CASE_FIELD_LABEL_ADDRESSES","addresses[].typeId":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_TYPEID","addresses[].country":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_COUNTRY","addresses[].city":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_CITY","addresses[].addressLine1":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_ADDRESS_LINE_1","addresses[].addressLine2":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_ADDRESS_LINE_2","addresses[].postalCode":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_POSTAL_CODE","addresses[].locationId":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_LOCATION_ID","addresses[].geoLocation":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_GEO_LOCATION","addresses[].geoLocation.lat":"LNG_LOCATION_FIELD_LABEL_GEO_LOCATION_LAT","addresses[].geoLocation.lng":"LNG_LOCATION_FIELD_LABEL_GEO_LOCATION_LNG","addresses[].geoLocationAccurate":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_GEO_LOCATION_ACCURATE","addresses[].date":"LNG_ADDRESS_FIELD_LABEL_ADDRESS_DATE","addresses[].phoneNumber":"LNG_ADDRESS_FIELD_LABEL_PHONE_NUMBER",visualId:"LNG_CASE_FIELD_LABEL_VISUAL_ID",isDateOfReportingApproximate:"LNG_CASE_FIELD_LABEL_IS_DATE_OF_REPORTING_APPROXIMATE",safeBurial:"LNG_CASE_FIELD_LABEL_SAFE_BURIAL",dateOfBurial:"LNG_CASE_FIELD_LABEL_DATE_OF_BURIAL",burialLocationId:"LNG_CASE_FIELD_LABEL_BURIAL_LOCATION_ID",burialPlaceName:"LNG_CASE_FIELD_LABEL_BURIAL_PLACE_NAME",vaccinesReceived:"LNG_CASE_FIELD_LABEL_VACCINES_RECEIVED","vaccinesReceived[].vaccine":"LNG_CASE_FIELD_LABEL_VACCINE","vaccinesReceived[].date":"LNG_CASE_FIELD_LABEL_VACCINE_DATE","vaccinesReceived[].status":"LNG_CASE_FIELD_LABEL_VACCINE_STATUS",pregnancyStatus:"LNG_CASE_FIELD_LABEL_PREGNANCY_STATUS",questionnaireAnswers:"LNG_CASE_FIELD_LABEL_QUESTIONNAIRE_ANSWERS"}),e.exportFieldsOrder=["id","visualId","dateOfReporting","isDateOfReportingApproximate"],e.arrayProps={dateRanges:{typeId:"LNG_CASE_FIELD_LABEL_DATE_RANGE_TYPE_ID",startDate:"LNG_CASE_FIELD_LABEL_DATE_RANGE_START_DATE",endDate:"LNG_CASE_FIELD_LABEL_DATE_RANGE_END_DATE",centerName:"LNG_CASE_FIELD_LABEL_DATE_RANGE_CENTER_NAME",locationId:"LNG_CASE_FIELD_LABEL_DATE_RANGE_LOCATION",comments:"LNG_CASE_FIELD_LABEL_DATE_RANGE_COMMENTS"},addresses:{typeId:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_TYPEID",country:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_COUNTRY",city:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_CITY",addressLine1:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_ADDRESS_LINE_1",addressLine2:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_ADDRESS_LINE_2",postalCode:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_POSTAL_CODE",locationId:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_LOCATION_ID",geoLocation:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_GEO_LOCATION","geoLocation.lat":"LNG_LOCATION_FIELD_LABEL_GEO_LOCATION_LAT","geoLocation.lng":"LNG_LOCATION_FIELD_LABEL_GEO_LOCATION_LNG",geoLocationAccurate:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_GEO_LOCATION_ACCURATE",date:"LNG_ADDRESS_FIELD_LABEL_ADDRESS_DATE",phoneNumber:"LNG_ADDRESS_FIELD_LABEL_PHONE_NUMBER"},documents:{type:"LNG_CASE_FIELD_LABEL_DOCUMENT_TYPE",number:"LNG_CASE_FIELD_LABEL_DOCUMENT_NUMBER"},vaccinesReceived:{vaccine:"LNG_CASE_FIELD_LABEL_VACCINE",date:"LNG_CASE_FIELD_LABEL_VACCINE_DATE",status:"LNG_CASE_FIELD_LABEL_VACCINE_STATUS"}},e.referenceDataFieldsToCategoryMap={type:"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE",classification:"LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION",riskLevel:"LNG_REFERENCE_DATA_CATEGORY_RISK_LEVEL",gender:"LNG_REFERENCE_DATA_CATEGORY_GENDER",occupation:"LNG_REFERENCE_DATA_CATEGORY_OCCUPATION",outcomeId:"LNG_REFERENCE_DATA_CATEGORY_OUTCOME","documents[].type":"LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE","addresses[].typeId":"LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE","dateRanges[].typeId":"LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE","dateRanges[].centerName":"LNG_REFERENCE_DATA_CATEGORY_CENTRE_NAME","vaccinesReceived[].vaccine":"LNG_REFERENCE_DATA_CATEGORY_VACCINE","vaccinesReceived[].status":"LNG_REFERENCE_DATA_CATEGORY_VACCINE_STATUS",pregnancyStatus:"LNG_REFERENCE_DATA_CATEGORY_PREGNANCY_STATUS"},e.referenceDataFields=Object.keys(e.referenceDataFieldsToCategoryMap),e.extendedForm={template:"caseInvestigationTemplate",containerProperty:"questionnaireAnswers",isBasicArray:e=>"LNG_REFERENCE_DATA_CATEGORY_QUESTION_ANSWER_TYPE_MULTIPLE_ANSWERS"===e.answerType},e.printFieldsinOrder=["visualId","firstName","middleName","lastName","gender","dob","age","occupation","addresses","documents","type","classification","riskLevel","riskReason","wasContact","dateOfReporting","isDateOfReportingApproximate","dateBecomeCase","dateOfInfection","dateOfOnset","outcomeId","dateOfOutcome","dateRanges","transferRefused","safeBurial","dateOfBurial","burialLocationId","burialPlaceName","vaccinesReceived","pregnancyStatus"],e.locationFields=["addresses[].locationId","dateRanges[].locationId","burialLocationId"],e.foreignKeyResolverMap={burialLocationId:{modelName:"location",useProperty:"name"},"addresses[].locationId":{modelName:"location",useProperty:"name"},"dateRanges[].locationId":{modelName:"location",useProperty:"name"},"relationships[].clusterId":{modelName:"cluster",useProperty:"name"},"relationships[].people[].addresses[].locationId":{modelName:"location",useProperty:"name"},"relationships[].people[].address.locationId":{modelName:"location",useProperty:"name"},"relationships[].people[].burialLocationId":{modelName:"location",useProperty:"name"},"relationships[].people[].dateRanges[].locationId":{modelName:"location",useProperty:"name"}},e.nestedGeoPoints=["addresses[].geoLocation"],e.invalidCaseClassificationsForReports=["LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION_NOT_A_CASE_DISCARDED"],e.locationsFieldsMap={burialLocationId:"LNG_CASE_FIELD_LABEL_BURIAL_LOCATION_ID"},e.observe("before save",function(e,E){!function(e){const _=app.utils.helpers.getSourceAndTargetFromModelHookContext(e),E=_.source.all;let t;Array.isArray(E.classificationHistory)&&E.classificationHistory.length&&(t=E.classificationHistory.find(e=>null==e.endDate)),t?(E.classification!==t.classification&&(t.endDate=new Date,E.classificationHistory.push({classification:E.classification,startDate:t.endDate})),_.target.classificationHistory=E.classificationHistory):(_.target.classificationHistory=E.classificationHistory,Array.isArray(_.target.classificationHistory)||(_.target.classificationHistory=[]),_.target.classificationHistory.push({classification:E.classification,startDate:new Date}))}(e);const t=e.isNewInstance?e.instance:e.data;helpers.sortMultiAnswerQuestions(t);let L=_.get(e,"options.remotingContext.instance");L&&(L instanceof app.models.outbreak||(L=void 0)),helpers.convertQuestionStringDatesToDates(t,L?L.caseInvestigationTemplate:null).then(()=>{E()}).catch(E)}),e.countStratifiedByCategoryOverTime=function(e,E,t,L,a,A){let n,s,o={day:"day",week:"week",month:"month"};void 0!==(n=_.get(A,"where.periodType"))&&delete A.where.periodType,-1===Object.values(o).indexOf(n)&&(n=o.day),void 0!==(s=_.get(A,"where.endDate"))&&delete A.where.endDate,s=s?app.utils.helpers.getDateEndOfDay(s):app.utils.helpers.getDateEndOfDay();const i=app.utils.helpers.getDate(e.startDate);s.isBefore(i)&&(s=app.utils.helpers.getDateEndOfDay(i));const r=[i,s],D=app.utils.helpers.getChunksForInterval(r,n),N={};return app.models.referenceData.find({where:{categoryId:E}}).then(function(e){e.forEach(function(e){N[e.id]=0}),Object.keys(D).forEach(function(e){Object.assign(D[e],{[L]:N,total:0})})}).then(function(){return app.models.case.rawFind(app.utils.remote.convertLoopbackFilterToMongo(app.utils.remote.mergeFilters({where:{outbreakId:e.id,[t]:{gte:new Date(r[0]),lte:new Date(r[1])}}},A||{}).where)).then(function(e){return new Promise(function(_,E){a(e,r,n,D,N,function(e,t){return e?E(e):_(t)})})})})},e.countStratifiedByClassificationOverTime=function(_,E){return e.countStratifiedByCategoryOverTime(_,"LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION","dateOfOnset","classification",casesWorker.countStratifiedByClassificationOverTime,E)},e.countStratifiedByOutcomeOverTime=function(_,E){return e.countStratifiedByCategoryOverTime(_,"LNG_REFERENCE_DATA_CATEGORY_OUTCOME","dateOfOutcome","outcome",casesWorker.countStratifiedByOutcomeOverTime,E)},e.countStratifiedByClassificationOverReportingTime=function(_,E){return e.countStratifiedByCategoryOverTime(_,"LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION","dateOfReporting","classification",casesWorker.countStratifiedByClassificationOverReportingTime,E)},e.delayBetweenOnsetAndLabTesting=function(_,E){return e.rawFind(app.utils.remote.convertLoopbackFilterToMongo(app.utils.remote.mergeFilters({where:{outbreakId:_,dateOfOnset:{ne:null}}},E||{})).where,{order:{dateOfOnset:1}}).then(function(e){const _=e.map(e=>e.id);return app.models.labResult.rawFind({personId:{inq:_}},{order:{dateSampleTaken:1},projection:{personId:1,dateSampleTaken:1}}).then(function(_){const E={};_.forEach(function(e){E[e.personId]||(E[e.personId]=[]),E[e.personId].push(e)});const t=[];return e.forEach(function(e){const _=E[e.id]?E[e.id]:[];let L=0;do{const E=_[L]?_[L].dateSampleTaken:null,a={dateOfOnset:e.dateOfOnset,dateSampleTaken:E,delay:null,case:e};if(E){const e=moment(a.dateOfOnset),_=moment(a.dateSampleTaken);a.delay=_.diff(e,"days")}t.push(a),L++}while(L<_.length)}),t})})},e.delayBetweenOnsetAndHospitalisationIsolation=function(_,E){return e.rawFind(app.utils.remote.convertLoopbackFilterToMongo(app.utils.remote.mergeFilters({where:{outbreakId:_,dateOfOnset:{ne:null}}},E||{})).where,{order:{dateOfOnset:1}}).then(function(e){const _=[];return e.forEach(function(e){let E;Array.isArray(e.dateRanges)&&e.dateRanges.length&&(E=e.dateRanges.sort(function(e,_){return e.startDate-_.startDate}).find(function(e){return["LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE_HOSPITALIZATION","LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE_ISOLATION"].includes(e.typeId)}));const t={dateOfOnset:e.dateOfOnset,hospitalizationIsolationDate:E?E.startDate:void 0,delay:null,case:e};if(E){const e=moment(t.dateOfOnset),_=moment(E.startDate);t.delay=_.diff(e,"days")}_.push(t)}),_})},e.preFilterForOutbreak=function(e,E){E=E||{};let t=_.get(E,"where.relationship");t&&delete E.where.relationship;let L=_.get(E,"where.labResult");L&&delete E.where.labResult;let a=_.get(E,"where",{}),A=Promise.resolve();return t&&(t={$and:[t,{outbreakId:e.id}]},A=A.then(function(){return app.models.relationship.rawFind(t,{projection:{persons:1}}).then(function(e){let _=[];return e.forEach(function(e){e.persons.forEach(function(e){"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE"===e.type&&_.push(e.id)})}),Array.from(new Set(_))})})),L&&(A=A.then(function(_){return L={and:[L,{outbreakId:e.id}]},_&&L.and.push({personId:{inq:_}}),app.models.labResult.rawFind(L,{projection:{personId:1}}).then(function(e){return Array.from(new Set(e.map(e=>e.personId)))})})),A.then(function(_){return _&&(a={and:[a,{id:{inq:_}}]}),a={and:[a,{outbreakId:e.id}]},Object.assign(E,{where:a})})},e.migrate=((E,t)=>{app.models.outbreak.find({},{projection:{_id:1,caseInvestigationTemplate:1}}).then(L=>{const a=_.transform(L,(e,_)=>{e[_.id]=_.caseInvestigationTemplate},{});helpers.migrateModelDataInBatches(e,(e,t)=>{if(_.isEmpty(e.questionnaireAnswers))t();else{const L=_.cloneDeep(e.questionnaireAnswers);helpers.convertQuestionStringDatesToDates(e,a[e.outbreakId]).then(()=>{_.isEqual(e.questionnaireAnswers,L)?t():e.updateAttributes({questionnaireAnswers:e.questionnaireAnswers},E).then(()=>t()).catch(t)}).catch(t)}}).then(()=>t()).catch(t)}).catch(t)})};