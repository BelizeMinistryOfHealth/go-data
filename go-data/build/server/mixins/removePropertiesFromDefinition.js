"use strict";const app=require("../server"),propertiesMap={};app.on("started",function(){Object.keys(propertiesMap).forEach(function(e){propertiesMap[e].forEach(function(o){delete app.models[e].definition.properties[o],delete app.models[e].definition.rawProperties[o],["","get ","set ","$","get $","set $"].forEach(function(r){delete app.models[e].prototype[`${r}${o}`]})})})}),module.exports=function(e){e.removePropertiesFromDefinion&&(propertiesMap[e.modelName]=e.removePropertiesFromDefinion)};