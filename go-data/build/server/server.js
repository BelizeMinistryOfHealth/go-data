"use strict"; 
const ip = require("ip"); 
const _ = require("lodash"), request = require("request"), config = require("./config"), path = require("path"), fs = require("fs"), url = require("url"); 
let app; 
process.on("uncaughtException", function (e) { 
  void 0 !== app ? (app.logger.log("error", e), app.logger.exitProcessAfterFlush(1)) : (console.error(e), process.exit(1)) }), process.on("unhandledRejection", function (e) { throw e }); 
  const beforeBoot = require("./beforeBoot/beforeBoot"), logger = require("../components/logger"), loopback = require("loopback"), boot = require("loopback-boot"); 
  (app = module.exports = loopback()).logger = logger; 
  app.start = function () { 
    const e = app.listen(function () { 
      if (app.emit("started"), config.enableConfigRewrite) { 
        let e = `http://${ip.address()}:${config.port}`; 
        app.logger.debug(`Trying to find server address. Testing: ${e}`), request({ uri: `${e}/status`, json: !0, timeout: 3e3 }, function (o, r, t) { 
          if (o && (app.logger.error(o), e = app.get("url").replace(/\/$/, "")), t && t.started || (app.logger.debug("Unexpected response from /status endpoint. Falling back to default address"), e = app.get("url").replace(/\/$/, "")), app.logger.info("Web server listening at: %s", e), app.get("loopback-component-explorer")) { 
            const o = app.get("loopback-component-explorer").mountPath; app.logger.info("Browse your REST API at %s%s", e, o) 
          } 
          const p = url.parse(e); 
          _.set(config, "public.protocol", p.protocol.replace(":", "")), _.set(config, "public.host", p.hostname), _.set(config, "public.port", p.port); 
          const i = path.resolve(__dirname + "/config.json"); 
          fs.writeFileSync(i, JSON.stringify(config, null, 2));
          app.logger.info("Config file ( %s ) public data updated to: %s", i, JSON.stringify(config.public)) }) 
        } 
      }); 
    return e.timeout = 432e5, e }; 
    
  beforeBoot(app, function (e) { 
    if (e) throw e; 
    boot(app, __dirname, function (e) { if (e) throw e; require.main === module && app.start() }) 
  });