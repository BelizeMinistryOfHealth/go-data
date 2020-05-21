"use strict";
const MongoClient=require("mongodb").MongoClient,dbConfig=require("./../server/datasources").mongoDb;
function getMongoDBConnection(o={}){
  dbConfig.password&&(o=Object.assign(o,{auth:{user:dbConfig.user,password:dbConfig.password, useNewUrlParser: true}}));
  console.log(`Connecting via Mongo helper with user:${dbConfig.user} and password: ${dbConfig.password}`);
  console.dir(o);
  return MongoClient.connect(`mongodb+srv://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/retryWrites=true&w=majority`, o)
  .then(function(e, o){
    return o.db(dbConfig.database)
  });
}
  module.exports={getMongoDBConnection:getMongoDBConnection};