"use strict";const app=require("../server"),readReadOnlyProperties={};module.exports=function(e){readReadOnlyProperties[e.modelName]||(readReadOnlyProperties[e.modelName]=[]),e.forEachProperty(function(i){e.definition.properties[i].readOnly&&readReadOnlyProperties[e.modelName].push(i)}),e._importableProperties=function e(i,t){let r=[];return i.forEachProperty(function(o){if((!Array.isArray(i.definition.settings.hidden)||!i.definition.settings.hidden.includes(o))&&(i.definition.properties[o].readOnly&&i.definition.properties[o].safeForImport||!i.definition.properties[o].readOnly))if(i.definition.properties[o].type&&i.definition.properties[o].type.definition){if(t||i.definition.properties[o].importTopLevelOnly)return i.definition.properties[o].importTopLevelOnly||"customGeoPoint"!==i.definition.properties[o].type.name?(t&&(o=`${t}.${o}`),r.push(o)):(t&&(o=`${t}.${o}`),r.push(`${o}.lat`),r.push(`${o}.lng`)),r;r=r.concat(e(i.definition.properties[o].type,o))}else if(i.definition.properties[o].type&&"GeoPoint"===i.definition.properties[o].type.name)t&&(o=`${t}.${o}`),r.push(`${o}.lat`),r.push(`${o}.lng`);else if(Array.isArray(i.definition.properties[o].type))if(i.definition.properties[o].type[0].definition){if(t||i.definition.properties[o].importTopLevelOnly)return t&&(o=`${t}.${o}`),r.push(o),r;r=r.concat(e(i.definition.properties[o].type[0],`${o}[]`))}else{const e=o;t&&(o=`${t}.${o}`),i.definition.properties[e].importTopLevelOnly||(o=`${o}[]`),r.push(o)}else t&&(o=`${t}.${o}`),r.push(o)}),r}(e),e._importableTopLevelProperties=[],e._importableProperties.forEach(function(i){const t=i.replace(/(?:\[]).*/,"");e._importableTopLevelProperties.includes(t)||e._importableTopLevelProperties.push(t)}),e.removeReadOnlyProperties=function(i){Object.keys(i).forEach(function(t){-1!==readReadOnlyProperties[e.modelName].indexOf(t)&&delete i[t]})},e.beforeRemote("create",function(i,t,r){e.removeReadOnlyProperties(i.args.data),r()}),e.beforeRemote("prototype.patchAttributes",function(i,t,r){e.removeReadOnlyProperties(i.args.data),r()}),Object.keys(e.definition.settings.relations).forEach(function(i){const t=e.definition.settings.relations[i];if(t.type.startsWith("has")){const r=t.model;e.beforeRemote(`prototype.__create__${i}`,function(e,i,t){return"function"==typeof app.models[r].removeReadOnlyProperties&&app.models[r].removeReadOnlyProperties(e.args.data),t()}),e.beforeRemote(`prototype.__updateById__${i}`,function(e,i,t){return"function"==typeof app.models[r].removeReadOnlyProperties&&app.models[r].removeReadOnlyProperties(e.args.data),t()})}})};