"use strict";function mergeIncludeFilters(e){const o={};let n=[];return e.forEach(function(i){"string"!=typeof i||o[i]?i.relation&&!o[i.relation]?o[i.relation]={position:n.push(i)-1,complex:!0}:i.relation&&o[i.relation]&&!o[i.relation].complex?(n[o[i.relation].position]=i,o[o.relation].complex=!0):i.relation&&i.scope&&o[i.relation]&&o[i.relation].complex&&!n[o[i.relation].position].scope?n[o[i.relation].position].scope=i.scope:i.relation&&i.scope&&o[i.relation]&&o[i.relation].complex&&n[o[i.relation].position].scope&&(n[o[i.relation].position].scope=merge(e[o[i.relation].position].scope,i.scope)):o[i]={position:n.push(i)-1,complex:!1}}),n}function merge(e,o={}){function n(n){return void 0!==o[n]||void 0!==e[n]}const i={};return n("where")&&(i.where={and:[o.where||{},e.where||{}]}),n("include")&&(i.include=[],[e,o].forEach(function(e){Array.isArray(e.include)&&e.include.length?i.include=i.include.concat(e.include):"string"!=typeof e.include&&"object"!=typeof e.include||i.include.push(e.include)}),i.include=mergeIncludeFilters(i.include)),["fields","limit","order","skip","deleted","filterParent","_deep"].forEach(function(t){n(t)&&(i[t]=o[t]||e[t])}),e.fn&&(i.fn=e.fn),i}module.exports=merge;