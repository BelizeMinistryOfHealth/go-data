"use strict";module.exports=function(e){e.forEachProperty(function(i){e.definition.properties[i].enum&&e.validatesInclusionOf(i,{in:e.definition.properties[i].enum,message:" value is not allowed. Allowed values: "+e.definition.properties[i].enum.join(", "),allowNull:e.definition.properties[i].enum.indexOf(null)>=0})})};