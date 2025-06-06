//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("retry",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Random = Package.random.Random;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Retry;

var require = meteorInstall({"node_modules":{"meteor":{"retry":{"retry.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/retry/retry.js                                                      //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
module.export({
  Retry: () => Retry
});
class Retry {
  constructor() {
    let {
      baseTimeout = 1000,
      exponent = 2.2,
      // The default is high-ish to ensure a server can recover from a
      // failure caused by load.
      maxTimeout = 5 * 60 * 1000,
      minTimeout = 10,
      minCount = 2,
      fuzz = 0.5
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.baseTimeout = baseTimeout;
    this.exponent = exponent;
    this.maxTimeout = maxTimeout;
    this.minTimeout = minTimeout;
    this.minCount = minCount;
    this.fuzz = fuzz;
    this.retryTimer = null;
  }

  // Reset a pending retry, if any.
  clear() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.retryTimer = null;
  }

  // Calculate how long to wait in milliseconds to retry, based on the
  // `count` of which retry this is.
  _timeout(count) {
    if (count < this.minCount) {
      return this.minTimeout;
    }

    // fuzz the timeout randomly, to avoid reconnect storms when a
    // server goes down.
    var timeout = Math.min(this.maxTimeout, this.baseTimeout * Math.pow(this.exponent, count)) * (Random.fraction() * this.fuzz + (1 - this.fuzz / 2));
    return timeout;
  }

  // Call `fn` after a delay, based on the `count` of which retry this is.
  retryLater(count, fn) {
    var timeout = this._timeout(count);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = Meteor.setTimeout(fn, timeout);
    return timeout;
  }
}
//////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Retry: Retry
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/retry/retry.js"
  ],
  mainModulePath: "/node_modules/meteor/retry/retry.js"
}});
