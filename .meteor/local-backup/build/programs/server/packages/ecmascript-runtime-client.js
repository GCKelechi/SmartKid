Package["core-runtime"].queue("ecmascript-runtime-client",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"ecmascript-runtime-client":{"versions.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/ecmascript-runtime-client/versions.js                                //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
const {
  setMinimumBrowserVersions,
} = require("meteor/modern-browsers");

setMinimumBrowserVersions({
  chrome: 49,
  edge: 12,
  // Since there is no IE12, this effectively excludes Internet Explorer
  // (pre-Edge) from the modern classification. #9818 #9839
  ie: 12,
  firefox: 45,
  firefoxIOS: 100,
  mobileSafari: 10,
  opera: 38,
  safari: 10,
  // Electron 1.6.0+ matches Chromium 55, per
  // https://github.com/Kilian/electron-to-chromium/blob/master/full-versions.js
  electron: [1, 6],
}, module.id);

///////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ecmascript-runtime-client/versions.js"
  ],
  mainModulePath: "/node_modules/meteor/ecmascript-runtime-client/versions.js"
}});
