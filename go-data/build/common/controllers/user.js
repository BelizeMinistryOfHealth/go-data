"use strict";const app=require("../../server/server"),config=require("../../server/config.json"),bcrypt=require("bcrypt"),async=require("async"),_=require("lodash"),uuid=require("uuid"),Moment=require("moment");module.exports=function(e){const t=e.helpers;app.utils.remote.disableStandardRelationRemoteMethods(e,"accessTokens"),app.utils.remote.disableStandardRelationRemoteMethods(e,"role"),app.utils.remote.disableStandardRelationRemoteMethods(e,"activeOutbreak"),app.utils.remote.disableRemoteMethods(e,["prototype.verify","confirm"]),e.afterRemote("login",(t,r,s)=>{e.findOne({where:{id:r.userId}}).then(e=>e?e.updateAttributes({loginRetriesCount:0,lastLoginDate:null}).then(()=>s()):s())}),e.afterRemote("setPassword",(t,r,s)=>{e.findById(t.args.id).then(e=>e?e.updateAttributes({loginRetriesCount:0,lastLoginDate:null}).then(()=>s()):s())}),e.beforeRemote("login",(e,t,r)=>{const s=app.utils.helpers.getCaptchaConfig(),o=e.req;if(s.login&&o.session&&o.session.loginCaptcha&&o.body&&o.session.loginCaptcha!==o.body.captcha)return o.session.loginCaptcha=uuid(),r(app.utils.apiError.getError("INVALID_CAPTCHA"));r()}),e.beforeRemote("resetPassword",(e,t,r)=>{const s=app.utils.helpers.getCaptchaConfig(),o=e.req;if(s.forgotPassword&&o.session&&o.session.forgotPasswordCaptcha&&o.body&&o.session.forgotPasswordCaptcha!==o.body.captcha)return o.session.forgotPasswordCaptcha=uuid(),r(app.utils.apiError.getError("INVALID_CAPTCHA"));r()}),e.beforeRemote("resetPassWithSecurityQuestion",(e,t,r)=>{const s=app.utils.helpers.getCaptchaConfig(),o=e.req;if(s.resetPasswordQuestions&&o.session&&o.session.resetPasswordQuestionsCaptcha&&o.body&&o.session.resetPasswordQuestionsCaptcha!==o.body.captcha)return o.session.resetPasswordQuestionsCaptcha=uuid(),r(app.utils.apiError.getError("INVALID_CAPTCHA"));r()}),e.beforeRemote("login",(t,r,s)=>{e.findOne({where:{email:t.args.credentials.email}}).then(e=>{if(!e)return s();if(e.loginRetriesCount>=0&&e.lastLoginDate){const t=Moment(e.lastLoginDate),r=Moment(),o=t.add(config.login.resetTime,config.login.resetTimeUnit).isBefore(r),i=e.loginRetriesCount>=config.login.maxRetries;if(o)return e.updateAttributes({loginRetriesCount:0,lastLoginDate:null}).then(()=>s());if(i&&!o)return s(app.utils.apiError.getError("ACTION_TEMPORARILY_BLOCKED"))}return s()})}),e.afterRemoteError("login",(t,r)=>{if(!t.args.credentials.email)return r();e.findOne({where:{email:t.args.credentials.email}}).then(e=>{if(!e)return r();const t=Moment().toDate(),s={};if(e.loginRetriesCount>=0&&e.lastLoginDate){if(e.loginRetriesCount>=config.login.maxRetries)return r();s.loginRetriesCount=++e.loginRetriesCount,s.lastLoginDate=t}else s.loginRetriesCount=1,s.lastLoginDate=t;return e.updateAttributes(s).then(()=>r())})}),e.observe("before save",(e,t)=>{if(e.options&&e.options._sync)return t();let r=null;if(e.data&&(r=e.data.oldPassword,delete e.data.oldPassword),e.isNewInstance||!e.data.password)return t();Promise.resolve().then(()=>{if(!(e.options.setPassword||e.options.skipOldPasswordCheck||e.options.remotingContext&&e.options.remotingContext.options&&e.options.remotingContext.options.skipOldPasswordCheck)){if(!r)throw app.utils.apiError.getError("MISSING_REQUIRED_OLD_PASSWORD");return new Promise((t,s)=>{e.currentInstance.hasPassword(r,(e,r)=>e?s(e):r?t():s(app.utils.apiError.getError("INVALID_OLD_PASSWORD")))})}}).then(()=>{if(!(e.options.skipSamePasswordCheck||e.options.remotingContext&&e.options.remotingContext.options&&e.options.remotingContext.options.skipSamePasswordCheck))return new Promise((t,r)=>{e.currentInstance.hasPassword(e.data.password,(e,s)=>e?r(e):s?r(app.utils.apiError.getError("REUSING_PASSWORDS_ERROR")):t())})}).then(()=>t()).catch(e=>t(e))}),e.beforeRemote("deleteById",function(t,r,s){if(t.args.id===t.req.authData.user.id)return s(app.utils.apiError.getError("DELETE_OWN_RECORD",{model:"Role",id:t.args.id},403));e.count().then(function(e){e<2?s(app.utils.apiError.getError("DELETE_LAST_USER",{},422)):s()}).catch(s)}),e.beforeRemote("**",function(e,t,r){_.get(e,"args.data.email")&&(e.args.data.email=e.args.data.email.toLowerCase()),_.get(e,"args.credentials.email")&&(e.args.credentials.email=e.args.credentials.email.toLowerCase()),_.get(e,"args.options.email")&&(e.args.options.email=e.args.options.email.toLowerCase()),r()}),e.beforeRemote("prototype.patchAttributes",function(e,r,s){let o=e.args.data;e.options.skipOldPasswordCheck=config.skipOldPasswordForUserModify,e.instance.id===e.req.authData.user.id&&delete o.roleIds,async.series([e=>t.validatePassword(o.password,r=>t.collectErrorMessage(r,e)),e=>t.validateSecurityQuestions(o.securityQuestions,r=>t.collectErrorMessage(r,e))],(r,i)=>{if(r)return s(app.utils.apiError.getError("INTERNAL_ERROR",{error:"Validation failed "}));if(i&&(i=i.filter(e=>e)).length)return s(app.utils.apiError.getError("REQUEST_VALIDATION_ERROR",{errorMessages:i.join()}));if(o.securityQuestions&&(o.securityQuestions=t.encryptSecurityQuestions(o.securityQuestions)),o.activeOutbreakId){if(Array.isArray(o.outbreakIds)&&o.outbreakIds.length&&!o.outbreakIds.includes(o.activeOutbreakId))return s(app.utils.apiError.getError("ACTIVE_OUTBREAK_NOT_ALLOWED"));if(Array.isArray(e.instance.outbreakIds)&&e.instance.outbreakIds.length&&!e.instance.outbreakIds.includes(o.activeOutbreakId))return s(app.utils.apiError.getError("ACTIVE_OUTBREAK_NOT_ALLOWED"))}return s()})}),e.beforeRemote("create",function(e,r,s){let o=e.args.data;async.series([e=>t.validatePassword(o.password,r=>t.collectErrorMessage(r,e)),e=>t.validateSecurityQuestions(o.securityQuestions,r=>t.collectErrorMessage(r,e))],(e,r)=>e?s(app.utils.apiError.getError("INTERNAL_ERROR",{error:"Validation failed "})):r&&(r=r.filter(e=>e)).length?s(app.utils.apiError.getError("REQUEST_VALIDATION_ERROR",{errorMessages:r.join()})):(o.securityQuestions&&(o.securityQuestions=t.encryptSecurityQuestions(o.securityQuestions)),o.activeOutbreakId&&Array.isArray(o.outbreakIds)&&o.outbreakIds.length&&!o.outbreakIds.includes(o.activeOutbreakId)?s(app.utils.apiError.getError("ACTIVE_OUTBREAK_NOT_ALLOWED")):s()))}),e.beforeRemote("changePassword",function(e,r,s){t.validatePassword(e.args.newPassword,s)}),e.resetPassWithSecurityQuestion=function(t,r){let s=app.utils.apiError.getError,o=[];return t.hasOwnProperty("questions")||o.push("Security questions are mandatory"),t.hasOwnProperty("email")||o.push("Email is mandatory"),o.length?r(s("REQUEST_VALIDATION_ERROR",{errorMessages:o.join()})):e.findOne({where:{email:t.email}}).then(e=>{if(!e)throw app.logger.error("User not found"),s("PASSWORD_RECOVERY_FAILED");if(e.securityQuestions&&e.securityQuestions.length){let r=!1;for(let s=0;s<e.securityQuestions.length;s++){let o=e.securityQuestions[s],i=t.questions.findIndex(e=>e.question===o.question);if(-1===i){r=!1;break}if(!(r=bcrypt.compareSync(t.questions[i].answer.toLowerCase(),o.answer)||bcrypt.compareSync(t.questions[i].answer,o.answer)))break}if(r)return e.createAccessToken({email:e.email,password:e.password},{ttl:config.passwordReset.ttl,scopes:["reset-password"]}).then(e=>({token:e.id,ttl:e.ttl})).catch(e=>(app.logger.warn("Failed to generate reset password token",e),s("PASSWORD_RECOVERY_FAILED")));throw app.logger.warn("Invalid security questions"),s("PASSWORD_RECOVERY_FAILED")}throw app.logger.warn("Security questions recovery is disabled"),s("PASSWORD_RECOVERY_FAILED")})},e.afterRemote("findById",function(t,r,s){e.helpers.attachCustomProperties(r,s)}),e.afterRemote("prototype.patchAttributes",function(t,r,s){e.helpers.attachCustomProperties(r,s)})};