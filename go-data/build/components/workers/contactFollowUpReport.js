"use strict";
const MongoClient=require("mongodb").MongoClient;
const DbConfig=require("./../../server/datasources").mongoDb;
const MomentLibrary=require("moment")
const MomentRange=require("moment-range");
const _=require("lodash"),Helpers=require("../../components/helpers"),convertLoopbackFilterToMongo=require("../../components/convertLoopbackFilterToMongo");
const Moment=MomentRange.extendMoment(MomentLibrary);
const collectionName="followUp";
const batchSize=1e4;
const isFollowUpPerformed=function(e){
  return["LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_SEEN_OK","LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_SEEN_NOT_OK"].indexOf(e.statusId)>=0
};
const getMongoDBConnection=function(){
  let opts={};
  DbConfig.password&&(opts={
    auth:{
      user:DbConfig.user,
      password:DbConfig.password
    },
    authSource:DbConfig.authSource,
    useNewUrlParser:true,
    protocol: DbConfig.protocol
  });
  console.log(`Connecting via contactFollowUpReport with user:${dbConfig.user} and password: ${dbConfig.password}`);
  return MongoClient.connect(`mongodb+srv://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/retryWrites=true&w=majority`, opts)
  .then((e, r)=>r.db(DbConfig.database))
};
  const worker={get(e,o,t,n){o=Helpers.getDate(o).toDate(),t=Helpers.getDateEndOfDay(t).toDate();
    const r=_.get(n,"classification");r&&delete n.classification;const s={$and:[{outbreakId:e,date:{$gte:o,$lte:t}},{$or:[{deleted:!1},{deleted:{$eq:null}}]}]};_.isEmpty(n)||s.$and.push(n);const i=Moment.range(o,t),a=Array.from(i.by("days")).map(e=>e.toString()),d={days:{},totalContacts:0};a.forEach(e=>{d.days[e]={followedUp:0,notFollowedUp:0,percentage:0}});const l=new Map;return new Promise(o=>{getMongoDBConnection().then(o=>_.isEmpty(r)?o:o.collection("person").find({outbreakId:e,type:"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE",deleted:{$ne:!0},classification:convertLoopbackFilterToMongo(r)},{projection:{_id:1}}).toArray().then(t=>{if(_.isEmpty(t))return s.$and.push({personId:{$in:[]}}),o;{const n=t.map(e=>e._id);return o.collection("relationship").find({outbreakId:e,deleted:{$ne:!0},$or:[{"persons.0.source":!0,"persons.0.type":"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE","persons.1.type":"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT","persons.0.id":{$in:n}},{"persons.1.source":!0,"persons.1.type":"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE","persons.0.type":"LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT","persons.1.id":{$in:n}}]},{projection:{persons:1}}).toArray().then(e=>{let t={};return(e||[]).forEach(e=>{const o=e.persons[0].target?e.persons[0].id:e.persons[1].id;t[o]=!0}),t=Object.keys(t),s.$and.push({personId:{$in:t}}),o})}})).then(e=>{!function t(n=0){e.collection("followUp").find(s,{skip:n,limit:1e4,projection:{date:1,personId:1,statusId:1}}).toArray().then(e=>{if(!e.length){d.totalContacts=l.size;for(let e in d.days){const o=d.days[e],t=100*o.followedUp/(o.followedUp+o.notFollowedUp);o.percentage=t||0,d.days[Helpers.getDate(e).format()]=o,delete d.days[e]}return o(d)}const r=_.groupBy(e,function(e){return Helpers.getDate(e.date).toString()});for(let e=0;e<a.length;e++){const o=Helpers.getDate(a[e]),t=Object.keys(r).find(e=>Helpers.getDate(e).isSame(o),"day");if(t){const n=_.groupBy(r[t],"personId");for(let t in n){l.has(t)||l.set(t,[]);const r=l.get(t),s=r.findIndex(e=>e.date.isSame(o,"day")),i=!!n[t].filter(e=>isFollowUpPerformed(e)).length;if(-1!==s){if(r[s].isPerformed)continue;i&&(d.days[a[e]].notFollowedUp--,d.days[a[e]].followedUp++)}else i?d.days[a[e]].followedUp++:d.days[a[e]].notFollowedUp++;const p={date:o,isPerformed:i};-1!==s?r[s]=p:r.push(p),l.set(t,r)}}}t(n+1e4)})}()})})}};process.on("message",function(e){worker[e.fn](...e.args).then(e=>{process.send([null,e])}).catch(e=>{process.send([e])})});