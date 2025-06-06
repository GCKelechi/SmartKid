//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("id-map",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EJSON = Package.ejson.EJSON;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var IdMap;

var require = meteorInstall({"node_modules":{"meteor":{"id-map":{"id-map.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/id-map/id-map.js                                                     //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
module.export({
  IdMap: () => IdMap
});
class IdMap {
  constructor(idStringify, idParse) {
    this._map = new Map();
    this._idStringify = idStringify || JSON.stringify;
    this._idParse = idParse || JSON.parse;
  }

  // Some of these methods are designed to match methods on OrderedDict, since
  // (eg) ObserveMultiplex and _CachingChangeObserver use them interchangeably.
  // (Conceivably, this should be replaced with "UnorderedDict" with a specific
  // set of methods that overlap between the two.)

  get(id) {
    const key = this._idStringify(id);
    return this._map.get(key);
  }
  set(id, value) {
    const key = this._idStringify(id);
    this._map.set(key, value);
  }
  remove(id) {
    const key = this._idStringify(id);
    this._map.delete(key);
  }
  has(id) {
    const key = this._idStringify(id);
    return this._map.has(key);
  }
  empty() {
    return this._map.size === 0;
  }
  clear() {
    this._map.clear();
  }

  // Iterates over the items in the map. Return `false` to break the loop.
  forEach(iterator) {
    // don't use _.each, because we can't break out of it.
    for (let [key, value] of this._map) {
      const breakIfFalse = iterator.call(null, value, this._idParse(key));
      if (breakIfFalse === false) {
        return;
      }
    }
  }
  async forEachAsync(iterator) {
    for (let [key, value] of this._map) {
      const breakIfFalse = await iterator.call(null, value, this._idParse(key));
      if (breakIfFalse === false) {
        return;
      }
    }
  }
  size() {
    return this._map.size;
  }
  setDefault(id, def) {
    const key = this._idStringify(id);
    if (this._map.has(key)) {
      return this._map.get(key);
    }
    this._map.set(key, def);
    return def;
  }

  // Assumes that values are EJSON-cloneable, and that we don't need to clone
  // IDs (ie, that nobody is going to mutate an ObjectId).
  clone() {
    const clone = new IdMap(this._idStringify, this._idParse);
    // copy directly to avoid stringify/parse overhead
    this._map.forEach(function (value, key) {
      clone._map.set(key, EJSON.clone(value));
    });
    return clone;
  }
}
///////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      IdMap: IdMap
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/id-map/id-map.js"
  ],
  mainModulePath: "/node_modules/meteor/id-map/id-map.js"
}});
