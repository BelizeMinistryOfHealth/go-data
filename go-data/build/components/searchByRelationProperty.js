"use strict";const _=require("lodash");function deepSearchByRelationPropertyOnModel(e,t){if(e&&"function"==typeof e.toJSON&&(e=e.toJSON()),!e||!t)return e;let r=_.get(t,"include",[]),i=_.get(t,"includeCustom",[]);Array.isArray(r)||(r=[r]),r=r.concat(i);const o=[];return r=r.filter(function(e){let t;return t="string"==typeof e?e:e.relation,-1===o.indexOf(t)&&(o.push(t),!0)}),t.include=r,t.include.forEach(function(t){e&&t.relation&&t.scope&&(e[t.relation]=deepSearchByRelationProperty(e[t.relation],t.scope),t.scope.filterParent&&(!e[t.relation]||Array.isArray(e[t.relation])&&!e[t.relation].length)&&(e=null))}),e}function deepSearchByRelationProperty(e,t){let r;return Array.isArray(e)?(r=[],e.forEach(function(e){let i=deepSearchByRelationPropertyOnModel(e,t);i&&r.push(i)})):r=deepSearchByRelationPropertyOnModel(e,t),r}function shouldUseDeepSearch(e={}){let t=!1,r=_.get(e,"args.filter.include",[]),i=_.get(e,"args.filter.includeCustom",[]);return Array.isArray(r)||(r=[r]),(r=r.concat(i)).forEach(function(e){"object"==typeof e&&_.get(e,"scope.filterParent")&&(t=!0)}),t}function attachOnRemote(e,t){e.beforeRemote(t,function(e,t,r){if(shouldUseDeepSearch(e)){const t=_.get(e,"args.filter.skip"),r=_.get(e,"args.filter.limit");void 0!==t&&(delete e.args.filter.skip,_.set(e,"args.filter._deep.skip",t)),void 0!==r&&(delete e.args.filter.limit,_.set(e,"args.filter._deep.limit",r))}r()}),e.afterRemote(t,function(e,t,r){if(shouldUseDeepSearch(e)){e.result=deepSearchByRelationProperty(e.result,_.get(e,"args.filter",{}));const t=_.get(e,"args.filter._deep.skip",0);let r=_.get(e,"args.filter._deep.limit");void 0!==r&&(r+=t),e.result=e.result.slice(t,r)}r()})}const deletePaginationFilterFromContext=function(e){const t=_.get(e,"args.filter.skip"),r=_.get(e,"args.filter.limit");void 0!==t&&(delete e.args.filter.skip,_.set(e,"args.filter._deep.skip",t)),void 0!==r&&(delete e.args.filter.limit,_.set(e,"args.filter._deep.limit",r))};function convertIncludeQueryToFilterQuery(e,t={},r=!0){let i={};return e.include&&(Array.isArray(e.include)||(e.include=[e.include]),e.include.forEach(function(o,n){if(o&&"object"==typeof o&&o.relation&&o.scope&&(r&&o.scope.filterParent||!r)){let r=o.relation;t[o.relation]&&(r=t[o.relation]),i[r]=o.scope.where||{},Object.assign(i,convertIncludeQueryToFilterQuery(o.scope,t)),o.scope.justFilter&&e.include.splice(n,1)}}),e.include.length||delete e.include),i}module.exports={attachOnRemotes:function(e,t){Array.isArray(t)||(t=[t]),t.forEach(function(t){attachOnRemote(e,t)})},deepSearchByRelationProperty:deepSearchByRelationProperty,deletePaginationFilterFromContext:deletePaginationFilterFromContext,shouldUseDeepCount:function(e){return shouldUseDeepSearch({args:{filter:e}})},convertIncludeQueryToFilterQuery:convertIncludeQueryToFilterQuery};