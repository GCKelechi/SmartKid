//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("check",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EJSON = Package.ejson.EJSON;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var check, Match;

var require = meteorInstall({"node_modules":{"meteor":{"check":{"match.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/check/match.js                                                                                      //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
var _toConsumableArray;
module.link("@babel/runtime/helpers/toConsumableArray", {
  default: function (v) {
    _toConsumableArray = v;
  }
}, 0);
var _createForOfIteratorHelperLoose;
module.link("@babel/runtime/helpers/createForOfIteratorHelperLoose", {
  default: function (v) {
    _createForOfIteratorHelperLoose = v;
  }
}, 1);
var _typeof;
module.link("@babel/runtime/helpers/typeof", {
  default: function (v) {
    _typeof = v;
  }
}, 2);
module.export({
  check: function () {
    return check;
  },
  Match: function () {
    return Match;
  }
});
var isPlainObject;
module.link("./isPlainObject", {
  isPlainObject: function (v) {
    isPlainObject = v;
  }
}, 0);
// Things we explicitly do NOT support:
//    - heterogenous arrays

var currentArgumentChecker = new Meteor.EnvironmentVariable();
var hasOwn = Object.prototype.hasOwnProperty;
var format = function (result) {
  var err = new Match.Error(result.message);
  if (result.path) {
    err.message += " in field " + result.path;
    err.path = result.path;
  }
  return err;
};

/**
 * @summary Check that a value matches a [pattern](#matchpatterns).
 * If the value does not match the pattern, throw a `Match.Error`.
 * By default, it will throw immediately at the first error encountered. Pass in { throwAllErrors: true } to throw all errors.
 *
 * Particularly useful to assert that arguments to a function have the right
 * types and structure.
 * @locus Anywhere
 * @param {Any} value The value to check
 * @param {MatchPattern} pattern The pattern to match `value` against
 * @param {Object} [options={}] Additional options for check
 * @param {Boolean} [options.throwAllErrors=false] If true, throw all errors
 */
function check(value, pattern) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    throwAllErrors: false
  };
  // Record that check got called, if somebody cared.
  //
  // We use getOrNullIfOutsideFiber so that it's OK to call check()
  // from non-Fiber server contexts; the downside is that if you forget to
  // bindEnvironment on some random callback in your method/publisher,
  // it might not find the argumentChecker and you'll get an error about
  // not checking an argument that it looks like you're checking (instead
  // of just getting a "Node code must run in a Fiber" error).
  var argChecker = currentArgumentChecker.getOrNullIfOutsideFiber();
  if (argChecker) {
    argChecker.checking(value);
  }
  var result = testSubtree(value, pattern, options.throwAllErrors);
  if (result) {
    if (options.throwAllErrors) {
      throw Array.isArray(result) ? result.map(function (r) {
        return format(r);
      }) : [format(result)];
    } else {
      throw format(result);
    }
  }
}
;

/**
 * @namespace Match
 * @summary The namespace for all Match types and methods.
 */
var Match = {
  Optional: function (pattern) {
    return new Optional(pattern);
  },
  Maybe: function (pattern) {
    return new Maybe(pattern);
  },
  OneOf: function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return new OneOf(args);
  },
  Any: ['__any__'],
  Where: function (condition) {
    return new Where(condition);
  },
  ObjectIncluding: function (pattern) {
    return new ObjectIncluding(pattern);
  },
  ObjectWithValues: function (pattern) {
    return new ObjectWithValues(pattern);
  },
  // Matches only signed 32-bit integers
  Integer: ['__integer__'],
  // XXX matchers should know how to describe themselves for errors
  Error: Meteor.makeErrorType('Match.Error', function (msg) {
    this.message = "Match error: " + msg;

    // The path of the value that failed to match. Initially empty, this gets
    // populated by catching and rethrowing the exception as it goes back up the
    // stack.
    // E.g.: "vals[3].entity.created"
    this.path = '';

    // If this gets sent over DDP, don't give full internal details but at least
    // provide something better than 500 Internal server error.
    this.sanitizedError = new Meteor.Error(400, 'Match failed');
  }),
  // Tests to see if value matches pattern. Unlike check, it merely returns true
  // or false (unless an error other than Match.Error was thrown). It does not
  // interact with _failIfArgumentsAreNotAllChecked.
  // XXX maybe also implement a Match.match which returns more information about
  //     failures but without using exception handling or doing what check()
  //     does with _failIfArgumentsAreNotAllChecked and Meteor.Error conversion
  /**
   * @summary Returns true if the value matches the pattern.
   * @locus Anywhere
   * @param {Any} value The value to check
   * @param {MatchPattern} pattern The pattern to match `value` against
   */
  test: function (value, pattern) {
    return !testSubtree(value, pattern);
  },
  // Runs `f.apply(context, args)`. If check() is not called on every element of
  // `args` (either directly or in the first level of an array), throws an error
  // (using `description` in the message).
  _failIfArgumentsAreNotAllChecked: function (f, context, args, description) {
    var argChecker = new ArgumentChecker(args, description);
    var result = currentArgumentChecker.withValue(argChecker, function () {
      return f.apply(context, args);
    });

    // If f didn't itself throw, make sure it checked all of its arguments.
    argChecker.throwUnlessAllArgumentsHaveBeenChecked();
    return result;
  }
};
var Optional = function () {
  function Optional(pattern) {
    this.pattern = pattern;
  }
  return Optional;
}();
var Maybe = function () {
  function Maybe(pattern) {
    this.pattern = pattern;
  }
  return Maybe;
}();
var OneOf = function () {
  function OneOf(choices) {
    if (!choices || choices.length === 0) {
      throw new Error('Must provide at least one choice to Match.OneOf');
    }
    this.choices = choices;
  }
  return OneOf;
}();
var Where = function () {
  function Where(condition) {
    this.condition = condition;
  }
  return Where;
}();
var ObjectIncluding = function () {
  function ObjectIncluding(pattern) {
    this.pattern = pattern;
  }
  return ObjectIncluding;
}();
var ObjectWithValues = function () {
  function ObjectWithValues(pattern) {
    this.pattern = pattern;
  }
  return ObjectWithValues;
}();
var stringForErrorMessage = function (value) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (value === null) {
    return 'null';
  }
  if (options.onlyShowType) {
    return _typeof(value);
  }

  // Your average non-object things.  Saves from doing the try/catch below for.
  if (_typeof(value) !== 'object') {
    return EJSON.stringify(value);
  }
  try {
    // Find objects with circular references since EJSON doesn't support them yet (Issue #4778 + Unaccepted PR)
    // If the native stringify is going to choke, EJSON.stringify is going to choke too.
    JSON.stringify(value);
  } catch (stringifyError) {
    if (stringifyError.name === 'TypeError') {
      return _typeof(value);
    }
  }
  return EJSON.stringify(value);
};
var typeofChecks = [[String, 'string'], [Number, 'number'], [Boolean, 'boolean'],
// While we don't allow undefined/function in EJSON, this is good for optional
// arguments with OneOf.
[Function, 'function'], [undefined, 'undefined']];

// Return `false` if it matches. Otherwise, returns an object with a `message` and a `path` field or an array of objects each with a `message` and a `path` field when collecting errors.
var testSubtree = function (value, pattern) {
  var collectErrors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var errors = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var path = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
  // Match anything!
  if (pattern === Match.Any) {
    return false;
  }

  // Basic atomic types.
  // Do not match boxed objects (e.g. String, Boolean)
  for (var i = 0; i < typeofChecks.length; ++i) {
    if (pattern === typeofChecks[i][0]) {
      if (_typeof(value) === typeofChecks[i][1]) {
        return false;
      }
      return {
        message: "Expected " + typeofChecks[i][1] + ", got " + stringForErrorMessage(value, {
          onlyShowType: true
        }),
        path: ''
      };
    }
  }
  if (pattern === null) {
    if (value === null) {
      return false;
    }
    return {
      message: "Expected null, got " + stringForErrorMessage(value),
      path: ''
    };
  }

  // Strings, numbers, and booleans match literally. Goes well with Match.OneOf.
  if (typeof pattern === 'string' || typeof pattern === 'number' || typeof pattern === 'boolean') {
    if (value === pattern) {
      return false;
    }
    return {
      message: "Expected " + pattern + ", got " + stringForErrorMessage(value),
      path: ''
    };
  }

  // Match.Integer is special type encoded with array
  if (pattern === Match.Integer) {
    // There is no consistent and reliable way to check if variable is a 64-bit
    // integer. One of the popular solutions is to get reminder of division by 1
    // but this method fails on really large floats with big precision.
    // E.g.: 1.348192308491824e+23 % 1 === 0 in V8
    // Bitwise operators work consistantly but always cast variable to 32-bit
    // signed integer according to JavaScript specs.
    if (typeof value === 'number' && (value | 0) === value) {
      return false;
    }
    return {
      message: "Expected Integer, got " + stringForErrorMessage(value),
      path: ''
    };
  }

  // 'Object' is shorthand for Match.ObjectIncluding({});
  if (pattern === Object) {
    pattern = Match.ObjectIncluding({});
  }

  // Array (checked AFTER Any, which is implemented as an Array).
  if (pattern instanceof Array) {
    if (pattern.length !== 1) {
      return {
        message: "Bad pattern: arrays must have one type element " + stringForErrorMessage(pattern),
        path: ''
      };
    }
    if (!Array.isArray(value) && !isArguments(value)) {
      return {
        message: "Expected array, got " + stringForErrorMessage(value),
        path: ''
      };
    }
    for (var _i = 0, length = value.length; _i < length; _i++) {
      var arrPath = path + "[" + _i + "]";
      var result = testSubtree(value[_i], pattern[0], collectErrors, errors, arrPath);
      if (result) {
        result.path = _prependPath(collectErrors ? arrPath : _i, result.path);
        if (!collectErrors) return result;
        if (_typeof(value[_i]) !== 'object' || result.message) errors.push(result);
      }
    }
    if (!collectErrors) return false;
    return errors.length === 0 ? false : errors;
  }

  // Arbitrary validation checks. The condition can return false or throw a
  // Match.Error (ie, it can internally use check()) to fail.
  if (pattern instanceof Where) {
    var _result;
    try {
      _result = pattern.condition(value);
    } catch (err) {
      if (!(err instanceof Match.Error)) {
        throw err;
      }
      return {
        message: err.message,
        path: err.path
      };
    }
    if (_result) {
      return false;
    }

    // XXX this error is terrible

    return {
      message: 'Failed Match.Where validation',
      path: ''
    };
  }
  if (pattern instanceof Maybe) {
    pattern = Match.OneOf(undefined, null, pattern.pattern);
  } else if (pattern instanceof Optional) {
    pattern = Match.OneOf(undefined, pattern.pattern);
  }
  if (pattern instanceof OneOf) {
    for (var _i2 = 0; _i2 < pattern.choices.length; ++_i2) {
      var _result2 = testSubtree(value, pattern.choices[_i2]);
      if (!_result2) {
        // No error? Yay, return.
        return false;
      }

      // Match errors just mean try another choice.
    }

    // XXX this error is terrible
    return {
      message: 'Failed Match.OneOf, Match.Maybe or Match.Optional validation',
      path: ''
    };
  }

  // A function that isn't something we special-case is assumed to be a
  // constructor.
  if (pattern instanceof Function) {
    if (value instanceof pattern) {
      return false;
    }
    return {
      message: "Expected " + (pattern.name || 'particular constructor'),
      path: ''
    };
  }
  var unknownKeysAllowed = false;
  var unknownKeyPattern;
  if (pattern instanceof ObjectIncluding) {
    unknownKeysAllowed = true;
    pattern = pattern.pattern;
  }
  if (pattern instanceof ObjectWithValues) {
    unknownKeysAllowed = true;
    unknownKeyPattern = [pattern.pattern];
    pattern = {}; // no required keys
  }
  if (_typeof(pattern) !== 'object') {
    return {
      message: 'Bad pattern: unknown pattern type',
      path: ''
    };
  }

  // An object, with required and optional keys. Note that this does NOT do
  // structural matches against objects of special types that happen to match
  // the pattern: this really needs to be a plain old {Object}!
  if (_typeof(value) !== 'object') {
    return {
      message: "Expected object, got " + _typeof(value),
      path: ''
    };
  }
  if (value === null) {
    return {
      message: "Expected object, got null",
      path: ''
    };
  }
  if (!isPlainObject(value)) {
    return {
      message: "Expected plain object",
      path: ''
    };
  }
  var requiredPatterns = Object.create(null);
  var optionalPatterns = Object.create(null);
  Object.keys(pattern).forEach(function (key) {
    var subPattern = pattern[key];
    if (subPattern instanceof Optional || subPattern instanceof Maybe) {
      optionalPatterns[key] = subPattern.pattern;
    } else {
      requiredPatterns[key] = subPattern;
    }
  });
  for (var key in meteorBabelHelpers.sanitizeForInObject(Object(value))) {
    var subValue = value[key];
    var objPath = path ? path + "." + key : key;
    if (hasOwn.call(requiredPatterns, key)) {
      var _result3 = testSubtree(subValue, requiredPatterns[key], collectErrors, errors, objPath);
      if (_result3) {
        _result3.path = _prependPath(collectErrors ? objPath : key, _result3.path);
        if (!collectErrors) return _result3;
        if (_typeof(subValue) !== 'object' || _result3.message) errors.push(_result3);
      }
      delete requiredPatterns[key];
    } else if (hasOwn.call(optionalPatterns, key)) {
      var _result4 = testSubtree(subValue, optionalPatterns[key], collectErrors, errors, objPath);
      if (_result4) {
        _result4.path = _prependPath(collectErrors ? objPath : key, _result4.path);
        if (!collectErrors) return _result4;
        if (_typeof(subValue) !== 'object' || _result4.message) errors.push(_result4);
      }
    } else {
      if (!unknownKeysAllowed) {
        var _result5 = {
          message: 'Unknown key',
          path: key
        };
        if (!collectErrors) return _result5;
        errors.push(_result5);
      }
      if (unknownKeyPattern) {
        var _result6 = testSubtree(subValue, unknownKeyPattern[0], collectErrors, errors, objPath);
        if (_result6) {
          _result6.path = _prependPath(collectErrors ? objPath : key, _result6.path);
          if (!collectErrors) return _result6;
          if (_typeof(subValue) !== 'object' || _result6.message) errors.push(_result6);
        }
      }
    }
  }
  var keys = Object.keys(requiredPatterns);
  if (keys.length) {
    var createMissingError = function (key) {
      return {
        message: "Missing key '" + key + "'",
        path: collectErrors ? path : ''
      };
    };
    if (!collectErrors) {
      return createMissingError(keys[0]);
    }
    for (var _iterator = _createForOfIteratorHelperLoose(keys), _step; !(_step = _iterator()).done;) {
      var _key2 = _step.value;
      errors.push(createMissingError(_key2));
    }
  }
  if (!collectErrors) return false;
  return errors.length === 0 ? false : errors;
};
var ArgumentChecker = /*#__PURE__*/function () {
  function ArgumentChecker(args, description) {
    // Make a SHALLOW copy of the arguments. (We'll be doing identity checks
    // against its contents.)
    this.args = _toConsumableArray(args);

    // Since the common case will be to check arguments in order, and we splice
    // out arguments when we check them, make it so we splice out from the end
    // rather than the beginning.
    this.args.reverse();
    this.description = description;
  }
  var _proto = ArgumentChecker.prototype;
  _proto.checking = function () {
    function checking(value) {
      if (this._checkingOneValue(value)) {
        return;
      }

      // Allow check(arguments, [String]) or check(arguments.slice(1), [String])
      // or check([foo, bar], [String]) to count... but only if value wasn't
      // itself an argument.
      if (Array.isArray(value) || isArguments(value)) {
        Array.prototype.forEach.call(value, this._checkingOneValue.bind(this));
      }
    }
    return checking;
  }();
  _proto._checkingOneValue = function () {
    function _checkingOneValue(value) {
      for (var i = 0; i < this.args.length; ++i) {
        // Is this value one of the arguments? (This can have a false positive if
        // the argument is an interned primitive, but it's still a good enough
        // check.)
        // (NaN is not === to itself, so we have to check specially.)
        if (value === this.args[i] || Number.isNaN(value) && Number.isNaN(this.args[i])) {
          this.args.splice(i, 1);
          return true;
        }
      }
      return false;
    }
    return _checkingOneValue;
  }();
  _proto.throwUnlessAllArgumentsHaveBeenChecked = function () {
    function throwUnlessAllArgumentsHaveBeenChecked() {
      if (this.args.length > 0) throw new Error("Did not check() all arguments during " + this.description);
    }
    return throwUnlessAllArgumentsHaveBeenChecked;
  }();
  return ArgumentChecker;
}();
var _jsKeywords = ['do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'false', 'null', 'this', 'true', 'void', 'with', 'break', 'catch', 'class', 'const', 'super', 'throw', 'while', 'yield', 'delete', 'export', 'import', 'public', 'return', 'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private', 'continue', 'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof'];

// Assumes the base of path is already escaped properly
// returns key + base
var _prependPath = function (key, base) {
  if (typeof key === 'number' || key.match(/^[0-9]+$/)) {
    key = "[" + key + "]";
  } else if (!key.match(/^[a-z_$][0-9a-z_$.[\]]*$/i) || _jsKeywords.indexOf(key) >= 0) {
    key = JSON.stringify([key]);
  }
  if (base && base[0] !== '[') {
    return key + "." + base;
  }
  return key + base;
};
var isObject = function (value) {
  return _typeof(value) === 'object' && value !== null;
};
var baseIsArguments = function (item) {
  return isObject(item) && Object.prototype.toString.call(item) === '[object Arguments]';
};
var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObject(value) && typeof value.callee === 'function';
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"isPlainObject.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/check/isPlainObject.js                                                                              //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  isPlainObject: function () {
    return isPlainObject;
  }
});
// Copy of jQuery.isPlainObject for the server side from jQuery v3.1.1.

var class2type = {};
var toString = class2type.toString;
var hasOwn = Object.prototype.hasOwnProperty;
var fnToString = hasOwn.toString;
var ObjectFunctionString = fnToString.call(Object);
var getProto = Object.getPrototypeOf;
var isPlainObject = function (obj) {
  var proto;
  var Ctor;

  // Detect obvious negatives
  // Use toString instead of jQuery.type to catch host objects
  if (!obj || toString.call(obj) !== '[object Object]') {
    return false;
  }
  proto = getProto(obj);

  // Objects with no prototype (e.g., `Object.create( null )`) are plain
  if (!proto) {
    return true;
  }

  // Objects with prototype are plain iff they were constructed by a global Object function
  Ctor = hasOwn.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor === 'function' && fnToString.call(Ctor) === ObjectFunctionString;
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      check: check,
      Match: Match
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/check/match.js"
  ],
  mainModulePath: "/node_modules/meteor/check/match.js"
}});
