"use strict";function passwordResetErrorHandler(r,e,s,o){r&&"EMAIL_NOT_FOUND"===r.code&&"post"===e.method.toLowerCase()&&"/api/users/reset"===e._parsedUrl.pathname&&(e.logger.error(`Cannot reset password, email not found: ${JSON.stringify(r)}`),r=null),r?o(r):s.send(204)}module.exports=function(){return passwordResetErrorHandler};