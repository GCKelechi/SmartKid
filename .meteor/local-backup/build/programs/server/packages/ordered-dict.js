Package["core-runtime"].queue("ordered-dict",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var OrderedDict;

var require = meteorInstall({"node_modules":{"meteor":{"ordered-dict":{"ordered_dict.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ordered-dict/ordered_dict.js                                                                //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
module.export({
  OrderedDict: () => OrderedDict
});
// This file defines an ordered dictionary abstraction that is useful for
// maintaining a dataset backed by observeChanges.  It supports ordering items
// by specifying the item they now come before.

// The implementation is a dictionary that contains nodes of a doubly-linked
// list as its values.

// constructs a new element struct
// next and prev are whole elements, not keys.
function element(key, value, next, prev) {
  return {
    key: key,
    value: value,
    next: next,
    prev: prev
  };
}
class OrderedDict {
  constructor() {
    this._dict = Object.create(null);
    this._first = null;
    this._last = null;
    this._size = 0;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (typeof args[0] === 'function') {
      this._stringify = args.shift();
    } else {
      this._stringify = function (x) {
        return x;
      };
    }
    args.forEach(kv => this.putBefore(kv[0], kv[1], null));
  }

  // the "prefix keys with a space" thing comes from here
  // https://github.com/documentcloud/underscore/issues/376#issuecomment-2815649
  _k(key) {
    return " " + this._stringify(key);
  }
  empty() {
    return !this._first;
  }
  size() {
    return this._size;
  }
  _linkEltIn(elt) {
    if (!elt.next) {
      elt.prev = this._last;
      if (this._last) this._last.next = elt;
      this._last = elt;
    } else {
      elt.prev = elt.next.prev;
      elt.next.prev = elt;
      if (elt.prev) elt.prev.next = elt;
    }
    if (this._first === null || this._first === elt.next) this._first = elt;
  }
  _linkEltOut(elt) {
    if (elt.next) elt.next.prev = elt.prev;
    if (elt.prev) elt.prev.next = elt.next;
    if (elt === this._last) this._last = elt.prev;
    if (elt === this._first) this._first = elt.next;
  }
  putBefore(key, item, before) {
    if (this._dict[this._k(key)]) throw new Error("Item " + key + " already present in OrderedDict");
    var elt = before ? element(key, item, this._dict[this._k(before)]) : element(key, item, null);
    if (typeof elt.next === "undefined") throw new Error("could not find item to put this one before");
    this._linkEltIn(elt);
    this._dict[this._k(key)] = elt;
    this._size++;
  }
  append(key, item) {
    this.putBefore(key, item, null);
  }
  remove(key) {
    var elt = this._dict[this._k(key)];
    if (typeof elt === "undefined") throw new Error("Item " + key + " not present in OrderedDict");
    this._linkEltOut(elt);
    this._size--;
    delete this._dict[this._k(key)];
    return elt.value;
  }
  get(key) {
    if (this.has(key)) {
      return this._dict[this._k(key)].value;
    }
  }
  has(key) {
    return Object.prototype.hasOwnProperty.call(this._dict, this._k(key));
  }

  // Iterate through the items in this dictionary in order, calling
  // iter(value, key, index) on each one.

  // Stops whenever iter returns OrderedDict.BREAK, or after the last element.
  forEach(iter) {
    let context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var i = 0;
    var elt = this._first;
    while (elt !== null) {
      var b = iter.call(context, elt.value, elt.key, i);
      if (b === OrderedDict.BREAK) return;
      elt = elt.next;
      i++;
    }
  }
  async forEachAsync(asyncIter) {
    let context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let i = 0;
    let elt = this._first;
    while (elt !== null) {
      const b = await asyncIter.call(context, elt.value, elt.key, i);
      if (b === OrderedDict.BREAK) return;
      elt = elt.next;
      i++;
    }
  }
  first() {
    if (this.empty()) {
      return;
    }
    return this._first.key;
  }
  firstValue() {
    if (this.empty()) {
      return;
    }
    return this._first.value;
  }
  last() {
    if (this.empty()) {
      return;
    }
    return this._last.key;
  }
  lastValue() {
    if (this.empty()) {
      return;
    }
    return this._last.value;
  }
  prev(key) {
    if (this.has(key)) {
      var elt = this._dict[this._k(key)];
      if (elt.prev) return elt.prev.key;
    }
    return null;
  }
  next(key) {
    if (this.has(key)) {
      var elt = this._dict[this._k(key)];
      if (elt.next) return elt.next.key;
    }
    return null;
  }
  moveBefore(key, before) {
    var elt = this._dict[this._k(key)];
    var eltBefore = before ? this._dict[this._k(before)] : null;
    if (typeof elt === "undefined") {
      throw new Error("Item to move is not present");
    }
    if (typeof eltBefore === "undefined") {
      throw new Error("Could not find element to move this one before");
    }
    if (eltBefore === elt.next)
      // no moving necessary
      return;
    // remove from its old place
    this._linkEltOut(elt);
    // patch into its new place
    elt.next = eltBefore;
    this._linkEltIn(elt);
  }

  // Linear, sadly.
  indexOf(key) {
    var ret = null;
    this.forEach((v, k, i) => {
      if (this._k(k) === this._k(key)) {
        ret = i;
        return OrderedDict.BREAK;
      }
      return;
    });
    return ret;
  }
  _checkRep() {
    Object.keys(this._dict).forEach(k => {
      const v = this._dict[k];
      if (v.next === v) {
        throw new Error("Next is a loop");
      }
      if (v.prev === v) {
        throw new Error("Prev is a loop");
      }
    });
  }
}
OrderedDict.BREAK = {
  "break": true
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      OrderedDict: OrderedDict
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ordered-dict/ordered_dict.js"
  ],
  mainModulePath: "/node_modules/meteor/ordered-dict/ordered_dict.js"
}});

//# sourceURL=meteor://💻app/packages/ordered-dict.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3JkZXJlZC1kaWN0L29yZGVyZWRfZGljdC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJPcmRlcmVkRGljdCIsImVsZW1lbnQiLCJrZXkiLCJ2YWx1ZSIsIm5leHQiLCJwcmV2IiwiY29uc3RydWN0b3IiLCJfZGljdCIsIk9iamVjdCIsImNyZWF0ZSIsIl9maXJzdCIsIl9sYXN0IiwiX3NpemUiLCJfbGVuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiYXJncyIsIkFycmF5IiwiX2tleSIsIl9zdHJpbmdpZnkiLCJzaGlmdCIsIngiLCJmb3JFYWNoIiwia3YiLCJwdXRCZWZvcmUiLCJfayIsImVtcHR5Iiwic2l6ZSIsIl9saW5rRWx0SW4iLCJlbHQiLCJfbGlua0VsdE91dCIsIml0ZW0iLCJiZWZvcmUiLCJFcnJvciIsImFwcGVuZCIsInJlbW92ZSIsImdldCIsImhhcyIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsIml0ZXIiLCJjb250ZXh0IiwidW5kZWZpbmVkIiwiaSIsImIiLCJCUkVBSyIsImZvckVhY2hBc3luYyIsImFzeW5jSXRlciIsImZpcnN0IiwiZmlyc3RWYWx1ZSIsImxhc3QiLCJsYXN0VmFsdWUiLCJtb3ZlQmVmb3JlIiwiZWx0QmVmb3JlIiwiaW5kZXhPZiIsInJldCIsInYiLCJrIiwiX2NoZWNrUmVwIiwia2V5cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFNLENBQUM7RUFBQ0MsV0FBVyxFQUFDQSxDQUFBLEtBQUlBO0FBQVcsQ0FBQyxDQUFDO0FBQTVDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTQyxPQUFPQSxDQUFDQyxHQUFHLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUU7RUFDdkMsT0FBTztJQUNMSCxHQUFHLEVBQUVBLEdBQUc7SUFDUkMsS0FB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QUFDLEVBQUU7UUFDaEIsTUFBTSxJQUFJeEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDO01BQ25DO01BQ0EsSUFBSXdCLENBQUMsQ0FBQ3BELElBQUksS0FBS29ELENBQUMsRUFBRTtRQUNoQixNQUFNLElBQUl4QixLQUFLLENBQUMsZ0JBQWdCLENBQUM7TUFDbkM7SUFDRixDQUFDLENBQUM7RUFDSjtBQUNGO0FBRUFqQyxXQUFXLENBQUM4QyxLQUFLLEdBQUc7RUFBQyxPQUFPLEVBQUU7QUFBSSxDQUFDLEMiLCJmaWxlIjoiL3BhY2thZ2VzL29yZGVyZWQtZGljdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgZmlsZSBkZWZpbmVzIGFuIG9yZGVyZWQgZGljdGlvbmFyeSBhYnN0cmFjdGlvbiB0aGF0IGlzIHVzZWZ1bCBmb3Jcbi8vIG1haW50YWluaW5nIGEgZGF0YXNldCBiYWNrZWQgYnkgb2JzZXJ2ZUNoYW5nZXMuICBJdCBzdXBwb3J0cyBvcmRlcmluZyBpdGVtc1xuLy8gYnkgc3BlY2lmeWluZyB0aGUgaXRlbSB0aGV5IG5vdyBjb21lIGJlZm9yZS5cblxuLy8gVGhlIGltcGxlbWVudGF0aW9uIGlzIGEgZGljdGlvbmFyeSB0aGF0IGNvbnRhaW5zIG5vZGVzIG9mIGEgZG91Ymx5LWxpbmtlZFxuLy8gbGlzdCBhcyBpdHMgdmFsdWVzLlxuXG4vLyBjb25zdHJ1Y3RzIGEgbmV3IGVsZW1lbnQgc3RydWN0XG4vLyBuZXh0IGFuZCBwcmV2IGFyZSB3aG9sZSBlbGVtZW50cywgbm90IGtleXMuXG5mdW5jdGlvbiBlbGVtZW50KGtleSwgdmFsdWUsIG5leHQsIHByZXYpIHtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgbmV4dDogbmV4dCxcbiAgICBwcmV2OiBwcmV2XG4gIH07XG59XG5cbmV4cG9ydCBjbGFzcyBPcmRlcmVkRGljdCB7XG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9kaWN0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9maXJzdCA9IG51bGw7XG4gICAgdGhpcy5fbGFzdCA9IG51bGw7XG4gICAgdGhpcy5fc2l6ZSA9IDA7XG5cbiAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuX3N0cmluZ2lmeSA9IGFyZ3Muc2hpZnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHg7IH07XG4gICAgfVxuXG4gICAgYXJncy5mb3JFYWNoKGt2ID0+IHRoaXMucHV0QmVmb3JlKGt2WzBdLCBrdlsxXSwgbnVsbCkpO1xuICB9XG5cbiAgLy8gdGhlIFwicHJlZml4IGtleXMgd2l0aCBhIHNwYWNlXCIgdGhpbmcgY29tZXMgZnJvbSBoZXJlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb2N1bWVudGNsb3VkL3VuZGVyc2NvcmUvaXNzdWVzLzM3NiNpc3N1ZWNvbW1lbnQtMjgxNTY0OVxuICBfayhrZXkpIHtcbiAgICByZXR1cm4gXCIgXCIgKyB0aGlzLl9zdHJpbmdpZnkoa2V5KTtcbiAgfVxuXG4gIGVtcHR5KCkge1xuICAgIHJldHVybiAhdGhpcy5fZmlyc3Q7XG4gIH1cblxuICBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLl9zaXplO1xuICB9XG5cbiAgX2xpbmtFbHRJbihlbHQpIHtcbiAgICBpZiAoIWVsdC5uZXh0KSB7XG4gICAgICBlbHQucHJldiA9IHRoaXMuX2xhc3Q7XG4gICAgICBpZiAodGhpcy5fbGFzdClcbiAgICAgICAgdGhpcy5fbGFzdC5uZXh0ID0gZWx0O1xuICAgICAgdGhpcy5fbGFzdCA9IGVsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgZWx0LnByZXYgPSBlbHQubmV4dC5wcmV2O1xuICAgICAgZWx0Lm5leHQucHJldiA9IGVsdDtcbiAgICAgIGlmIChlbHQucHJldilcbiAgICAgICAgZWx0LnByZXYubmV4dCA9IGVsdDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2ZpcnN0ID09PSBudWxsIHx8IHRoaXMuX2ZpcnN0ID09PSBlbHQubmV4dClcbiAgICAgIHRoaXMuX2ZpcnN0ID0gZWx0O1xuICB9XG5cbiAgX2xpbmtFbHRPdXQoZWx0KSB7XG4gICAgaWYgKGVsdC5uZXh0KVxuICAgICAgZWx0Lm5leHQucHJldiA9IGVsdC5wcmV2O1xuICAgIGlmIChlbHQucHJldilcbiAgICAgIGVsdC5wcmV2Lm5leHQgPSBlbHQubmV4dDtcbiAgICBpZiAoZWx0ID09PSB0aGlzLl9sYXN0KVxuICAgICAgdGhpcy5fbGFzdCA9IGVsdC5wcmV2O1xuICAgIGlmIChlbHQgPT09IHRoaXMuX2ZpcnN0KVxuICAgICAgdGhpcy5fZmlyc3QgPSBlbHQubmV4dDtcbiAgfVxuXG4gIHB1dEJlZm9yZShrZXksIGl0ZW0sIGJlZm9yZSkge1xuICAgIGlmICh0aGlzLl9kaWN0W3RoaXMuX2soa2V5KV0pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJdGVtIFwiICsga2V5ICsgXCIgYWxyZWFkeSBwcmVzZW50IGluIE9yZGVyZWREaWN0XCIpO1xuICAgIHZhciBlbHQgPSBiZWZvcmUgP1xuICAgICAgZWxlbWVudChrZXksIGl0ZW0sIHRoaXMuX2RpY3RbdGhpcy5fayhiZWZvcmUpXSkgOlxuICAgICAgZWxlbWVudChrZXksIGl0ZW0sIG51bGwpO1xuICAgIGlmICh0eXBlb2YgZWx0Lm5leHQgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb3VsZCBub3QgZmluZCBpdGVtIHRvIHB1dCB0aGlzIG9uZSBiZWZvcmVcIik7XG4gICAgdGhpcy5fbGlua0VsdEluKGVsdCk7XG4gICAgdGhpcy5fZGljdFt0aGlzLl9rKGtleSldID0gZWx0O1xuICAgIHRoaXMuX3NpemUrKztcbiAgfVxuXG4gIGFwcGVuZChrZXksIGl0ZW0pIHtcbiAgICB0aGlzLnB1dEJlZm9yZShrZXksIGl0ZW0sIG51bGwpO1xuICB9XG5cbiAgcmVtb3ZlKGtleSkge1xuICAgIHZhciBlbHQgPSB0aGlzLl9kaWN0W3RoaXMuX2soa2V5KV07XG4gICAgaWYgKHR5cGVvZiBlbHQgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJdGVtIFwiICsga2V5ICsgXCIgbm90IHByZXNlbnQgaW4gT3JkZXJlZERpY3RcIik7XG4gICAgdGhpcy5fbGlua0VsdE91dChlbHQpO1xuICAgIHRoaXMuX3NpemUtLTtcbiAgICBkZWxldGUgdGhpcy5fZGljdFt0aGlzLl9rKGtleSldO1xuICAgIHJldHVybiBlbHQudmFsdWU7XG4gIH1cblxuICBnZXQoa2V5KSB7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaWN0W3RoaXMuX2soa2V5KV0udmFsdWU7XG4gICAgfVxuICB9XG5cbiAgaGFzKGtleSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICB0aGlzLl9kaWN0LFxuICAgICAgdGhpcy5fayhrZXkpXG4gICAgKTtcbiAgfVxuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgaXRlbXMgaW4gdGhpcyBkaWN0aW9uYXJ5IGluIG9yZGVyLCBjYWxsaW5nXG4gIC8vIGl0ZXIodmFsdWUsIGtleSwgaW5kZXgpIG9uIGVhY2ggb25lLlxuXG4gIC8vIFN0b3BzIHdoZW5ldmVyIGl0ZXIgcmV0dXJucyBPcmRlcmVkRGljdC5CUkVBSywgb3IgYWZ0ZXIgdGhlIGxhc3QgZWxlbWVudC5cbiAgZm9yRWFjaChpdGVyLCBjb250ZXh0ID0gbnVsbCkge1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgZWx0ID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKGVsdCAhPT0gbnVsbCkge1xuICAgICAgdmFyIGIgPSBpdGVyLmNhbGwoY29udGV4dCwgZWx0LnZhbHVlLCBlbHQua2V5LCBpKTtcbiAgICAgIGlmIChiID09PSBPcmRlcmVkRGljdC5CUkVBSykgcmV0dXJuO1xuICAgICAgZWx0ID0gZWx0Lm5leHQ7XG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZm9yRWFjaEFzeW5jKGFzeW5jSXRlciwgY29udGV4dCA9IG51bGwpIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGVsdCA9IHRoaXMuX2ZpcnN0O1xuICAgIHdoaWxlIChlbHQgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGIgPSBhd2FpdCBhc3luY0l0ZXIuY2FsbChjb250ZXh0LCBlbHQudmFsdWUsIGVsdC5rZXksIGkpO1xuICAgICAgaWYgKGIgPT09IE9yZGVyZWREaWN0LkJSRUFLKSByZXR1cm47XG4gICAgICBlbHQgPSBlbHQubmV4dDtcbiAgICAgIGkrKztcbiAgICB9XG4gIH1cblxuICBmaXJzdCgpIHtcbiAgICBpZiAodGhpcy5lbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9maXJzdC5rZXk7XG4gIH1cblxuICBmaXJzdFZhbHVlKCkge1xuICAgIGlmICh0aGlzLmVtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2ZpcnN0LnZhbHVlO1xuICB9XG5cbiAgbGFzdCgpIHtcbiAgICBpZiAodGhpcy5lbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9sYXN0LmtleTtcbiAgfVxuXG4gIGxhc3RWYWx1ZSgpIHtcbiAgICBpZiAodGhpcy5lbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9sYXN0LnZhbHVlO1xuICB9XG5cbiAgcHJldihrZXkpIHtcbiAgICBpZiAodGhpcy5oYXMoa2V5KSkge1xuICAgICAgdmFyIGVsdCA9IHRoaXMuX2RpY3RbdGhpcy5fayhrZXkpXTtcbiAgICAgIGlmIChlbHQucHJldilcbiAgICAgICAgcmV0dXJuIGVsdC5wcmV2LmtleTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBuZXh0KGtleSkge1xuICAgIGlmICh0aGlzLmhhcyhrZXkpKSB7XG4gICAgICB2YXIgZWx0ID0gdGhpcy5fZGljdFt0aGlzLl9rKGtleSldO1xuICAgICAgaWYgKGVsdC5uZXh0KVxuICAgICAgICByZXR1cm4gZWx0Lm5leHQua2V5O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIG1vdmVCZWZvcmUoa2V5LCBiZWZvcmUpIHtcbiAgICB2YXIgZWx0ID0gdGhpcy5fZGljdFt0aGlzLl9rKGtleSldO1xuICAgIHZhciBlbHRCZWZvcmUgPSBiZWZvcmUgPyB0aGlzLl9kaWN0W3RoaXMuX2soYmVmb3JlKV0gOiBudWxsO1xuICAgIGlmICh0eXBlb2YgZWx0ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJdGVtIHRvIG1vdmUgaXMgbm90IHByZXNlbnRcIik7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZWx0QmVmb3JlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCBlbGVtZW50IHRvIG1vdmUgdGhpcyBvbmUgYmVmb3JlXCIpO1xuICAgIH1cbiAgICBpZiAoZWx0QmVmb3JlID09PSBlbHQubmV4dCkgLy8gbm8gbW92aW5nIG5lY2Vzc2FyeVxuICAgICAgcmV0dXJuO1xuICAgIC8vIHJlbW92ZSBmcm9tIGl0cyBvbGQgcGxhY2VcbiAgICB0aGlzLl9saW5rRWx0T3V0KGVsdCk7XG4gICAgLy8gcGF0Y2ggaW50byBpdHMgbmV3IHBsYWNlXG4gICAgZWx0Lm5leHQgPSBlbHRCZWZvcmU7XG4gICAgdGhpcy5fbGlua0VsdEluKGVsdCk7XG4gIH1cblxuICAvLyBMaW5lYXIsIHNhZGx5LlxuICBpbmRleE9mKGtleSkge1xuICAgIHZhciByZXQgPSBudWxsO1xuICAgIHRoaXMuZm9yRWFjaCgodiwgaywgaSkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2soaykgPT09IHRoaXMuX2soa2V5KSkge1xuICAgICAgICByZXQgPSBpO1xuICAgICAgICByZXR1cm4gT3JkZXJlZERpY3QuQlJFQUs7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIF9jaGVja1JlcCgpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9kaWN0KS5mb3JFYWNoKGsgPT4ge1xuICAgICAgY29uc3QgdiA9IHRoaXMuX2RpY3Rba107XG4gICAgICBpZiAodi5uZXh0ID09PSB2KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5leHQgaXMgYSBsb29wXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHYucHJldiA9PT0gdikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcmV2IGlzIGEgbG9vcFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5PcmRlcmVkRGljdC5CUkVBSyA9IHtcImJyZWFrXCI6IHRydWV9O1xuIl19
