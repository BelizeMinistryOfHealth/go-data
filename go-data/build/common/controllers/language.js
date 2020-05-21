"use strict";const app=require("../../server/server"),xlsx=require("xlsx"),fs=require("fs"),_=require("lodash"),moment=require("moment");module.exports=function(e){app.utils.remote.disableRemoteMethods(e,["prototype.__create__languageTokens","prototype.__delete__languageTokens","prototype.__findById__languageTokens","prototype.__updateById__languageTokens","prototype.__destroyById__languageTokens","prototype.__get__languageTokens"]),e.beforeRemote("prototype.patchAttributes",function(t,n,o){e.checkIfEditable(t.instance,o)}),e.beforeRemote("deleteById",function(t,n,o){e.checkIfEditable(t.args.id,o)}),e.prototype.importLanguageTokensFile=function(t,n,o,a){const r=this;app.utils.remote.helpers.parseMultipartRequest(t,[],["languageFile"],e,[],function(e,t,n){if(e)return a(e);fs.readFile(n.languageFile.path,function(e,t){if(e)return a(e);const s=xlsx.read(t);let l=s.SheetNames.shift();const i=[];let u=!1,p=2;for(;!u;){if(s.Sheets[l][`A${p}`]){let e=s.Sheets[l][`A${p}`].v;if(/^LNG_/.test(e)){let t="";s.Sheets[l][`B${p}`]&&(t=s.Sheets[l][`B${p}`].v),i.push({token:e,translation:t})}}else u=!0;p++}if(!i.length)return a(app.utils.apiError.getError("INVALID_TRANSLATIONS_FILE",{fileName:n.languageFile.name,details:"No valid language tokens were found in the file."}));r.updateLanguageTranslations(i,o,!0).then(function(e){a(null,e)}).catch(function(e){return e.errors.toString=function(){return this.length},e.success.toString=function(){return this.length},a(app.utils.apiError.getError("IMPORT_PARTIAL_SUCCESS",{model:app.models.languageToken.modelName,failed:e.errors,success:e.success}))})})})},e.prototype.exportLanguageTokensFile=function(e){const t=this,n={languageId:this.id},o={token:"Language Token",translation:"Translation"};return app.models.languageToken.rawFind(Object.assign({token:{$in:["LNG_TRANSLATION_FILE_LANGUAGE_TOKEN_HEADER","LNG_TRANSLATION_FILE_TRANSLATION_HEADER"]}},n),{projection:{token:1,translation:1}}).then(a=>{(a||[]).forEach(e=>{"LNG_TRANSLATION_FILE_LANGUAGE_TOKEN_HEADER"===e.token&&(o.token=e.translation),"LNG_TRANSLATION_FILE_TRANSLATION_HEADER"===e.token&&(o.translation=e.translation)});const r=[];return app.utils.helpers.handleActionsInBatches(()=>Promise.resolve().then(()=>app.models.languageToken.count(n)),(e,t)=>app.models.languageToken.rawFind(n,{order:{tokenSortKey:1},projection:{token:1,translation:1},skip:(e-1)*t,limit:t}),e=>(e.forEach(function(e){r.push({[o.token]:e.token,[o.translation]:e.translation})}),Promise.resolve()),null,1e4,10,console).then(()=>{app.utils.spreadSheetFile.createXlsxFile(null,r,function(n,o){if(n)return e(n);app.utils.remote.helpers.offerFileToDownload(o,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",`${t.name}.xlsx`,e)})})}).catch(e)},e.beforeRemote("prototype.getLanguageTokens",function(e,t,n){if(!_.get(e,"req.authData.user.id")){const t={modules:{$in:["unauthenticated"]}},n=_.get(e,"args.filter.where");_.set(e,"args.filter.where",n?{$and:[n,t]}:t)}n()}),e.prototype.getLanguageTokens=function(e,t){const n=(e=e||{}).fields||["token","translation"];let o=e.where||{};if(o.updatedSince){const e=moment(o.updatedSince).toISOString();delete o.updatedSince;const t={$or:[{createdAt:{$eq:null}},{createdAt:{$gte:e}},{updatedAt:{$eq:null}},{updatedAt:{$gte:e}}]};o=_.isEmpty(o)?t:{$and:[o,t]}}let a={$and:[{languageId:this.id},{$or:[{deleted:!1},{deleted:{$eq:null}}]}]};_.isEmpty(o)||(a={$and:[o,a]});const r=_.transform(n,(e,t)=>e[t]=1,{});r._id=0,app.dataSources.mongoDb.connector.collection("languageToken").find(app.utils.remote.convertLoopbackFilterToMongo(a),{projection:Object.assign(r,{createdAt:1,updatedAt:1})}).toArray().then(e=>{let n;(e||[]).forEach(function(e){const t=e.createdAt?moment(e.createdAt):null;delete e.createdAt;const o=e.updatedAt?moment(e.updatedAt):null;delete e.updatedAt,t&&(n=n?t.isAfter(n)?t:n:t),o&&(n=n?o.isAfter(n)?o:n:o)}),t(null,{languageId:this.id,lastUpdateDate:n?n.toISOString():null,tokens:e})}).catch(t)}};