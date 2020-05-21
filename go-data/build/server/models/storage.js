"use strict";const fs=require("fs"),path=require("path"),relativePath="/../../server/storage",containers={icons:"icons",files:"files"};module.exports=function(e){e.containers=containers,e.save=function(e,n,r){return new Promise(function(t,i){if(-1===Object.values(containers).indexOf(e))return i(new Error(`Invalid storage container: ${e}`));const o=`${relativePath}/${e}/${n}`,s=path.resolve(`${__dirname}/${o}`);fs.writeFile(s,r,function(e){if(e)return i(e);t(o)})})},e.read=function(e){return new Promise(function(n,r){const t=path.resolve(`${__dirname}/${e}`);fs.readFile(t,function(e,t){if(e)return r(e);n(t)})})},e.remove=function(e){return new Promise(function(n,r){const t=path.resolve(`${__dirname}/${e}`);fs.unlink(t,function(e){if(e)return r(e);n()})})},e.resolvePath=function(e){return path.resolve(`${__dirname}/${e}`)}};