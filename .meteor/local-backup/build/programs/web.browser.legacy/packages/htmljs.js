//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("htmljs",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var HTML;

var require = meteorInstall({"node_modules":{"meteor":{"htmljs":{"preamble.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/htmljs/preamble.js                                                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
module.export({
  HTML: function () {
    return HTML;
  }
});
var HTMLTags, Tag, Attrs, getTag, ensureTag, isTagEnsured, getSymbolName, knownHTMLElementNames, knownSVGElementNames, knownElementNames, voidElementNames, isKnownElement, isKnownSVGElement, isVoidElement, CharRef, Comment, Raw, isArray, isConstructedObject, isNully, isValidAttributeName, flattenAttributes;
module.link("./html", {
  HTMLTags: function (v) {
    HTMLTags = v;
  },
  Tag: function (v) {
    Tag = v;
  },
  Attrs: function (v) {
    Attrs = v;
  },
  getTag: function (v) {
    getTag = v;
  },
  ensureTag: function (v) {
    ensureTag = v;
  },
  isTagEnsured: function (v) {
    isTagEnsured = v;
  },
  getSymbolName: function (v) {
    getSymbolName = v;
  },
  knownHTMLElementNames: function (v) {
    knownHTMLElementNames = v;
  },
  knownSVGElementNames: function (v) {
    knownSVGElementNames = v;
  },
  knownElementNames: function (v) {
    knownElementNames = v;
  },
  voidElementNames: function (v) {
    voidElementNames = v;
  },
  isKnownElement: function (v) {
    isKnownElement = v;
  },
  isKnownSVGElement: function (v) {
    isKnownSVGElement = v;
  },
  isVoidElement: function (v) {
    isVoidElement = v;
  },
  CharRef: function (v) {
    CharRef = v;
  },
  Comment: function (v) {
    Comment = v;
  },
  Raw: function (v) {
    Raw = v;
  },
  isArray: function (v) {
    isArray = v;
  },
  isConstructedObject: function (v) {
    isConstructedObject = v;
  },
  isNully: function (v) {
    isNully = v;
  },
  isValidAttributeName: function (v) {
    isValidAttributeName = v;
  },
  flattenAttributes: function (v) {
    flattenAttributes = v;
  }
}, 0);
var Visitor, TransformingVisitor, ToHTMLVisitor, ToTextVisitor, toHTML, TEXTMODE, toText;
module.link("./visitors", {
  Visitor: function (v) {
    Visitor = v;
  },
  TransformingVisitor: function (v) {
    TransformingVisitor = v;
  },
  ToHTMLVisitor: function (v) {
    ToHTMLVisitor = v;
  },
  ToTextVisitor: function (v) {
    ToTextVisitor = v;
  },
  toHTML: function (v) {
    toHTML = v;
  },
  TEXTMODE: function (v) {
    TEXTMODE = v;
  },
  toText: function (v) {
    toText = v;
  }
}, 1);
var HTML = Object.assign(HTMLTags, {
  Tag: Tag,
  Attrs: Attrs,
  getTag: getTag,
  ensureTag: ensureTag,
  isTagEnsured: isTagEnsured,
  getSymbolName: getSymbolName,
  knownHTMLElementNames: knownHTMLElementNames,
  knownSVGElementNames: knownSVGElementNames,
  knownElementNames: knownElementNames,
  voidElementNames: voidElementNames,
  isKnownElement: isKnownElement,
  isKnownSVGElement: isKnownSVGElement,
  isVoidElement: isVoidElement,
  CharRef: CharRef,
  Comment: Comment,
  Raw: Raw,
  isArray: isArray,
  isConstructedObject: isConstructedObject,
  isNully: isNully,
  isValidAttributeName: isValidAttributeName,
  flattenAttributes: flattenAttributes,
  toHTML: toHTML,
  TEXTMODE: TEXTMODE,
  toText: toText,
  Visitor: Visitor,
  TransformingVisitor: TransformingVisitor,
  ToHTMLVisitor: ToHTMLVisitor,
  ToTextVisitor: ToTextVisitor
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"html.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/htmljs/html.js                                                                                        //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _typeof;
module.link("@babel/runtime/helpers/typeof", {
  default: function (v) {
    _typeof = v;
  }
}, 0);
module.export({
  Tag: function () {
    return Tag;
  },
  Attrs: function () {
    return Attrs;
  },
  HTMLTags: function () {
    return HTMLTags;
  },
  getTag: function () {
    return getTag;
  },
  ensureTag: function () {
    return ensureTag;
  },
  isTagEnsured: function () {
    return isTagEnsured;
  },
  getSymbolName: function () {
    return getSymbolName;
  },
  knownHTMLElementNames: function () {
    return knownHTMLElementNames;
  },
  knownSVGElementNames: function () {
    return knownSVGElementNames;
  },
  knownElementNames: function () {
    return knownElementNames;
  },
  voidElementNames: function () {
    return voidElementNames;
  },
  isKnownElement: function () {
    return isKnownElement;
  },
  isKnownSVGElement: function () {
    return isKnownSVGElement;
  },
  isVoidElement: function () {
    return isVoidElement;
  },
  CharRef: function () {
    return CharRef;
  },
  Comment: function () {
    return Comment;
  },
  Raw: function () {
    return Raw;
  },
  isArray: function () {
    return isArray;
  },
  isConstructedObject: function () {
    return isConstructedObject;
  },
  isNully: function () {
    return isNully;
  },
  isValidAttributeName: function () {
    return isValidAttributeName;
  },
  flattenAttributes: function () {
    return flattenAttributes;
  }
});
var Tag = function () {};
Tag.prototype.tagName = ''; // this will be set per Tag subclass
Tag.prototype.attrs = null;
Tag.prototype.children = Object.freeze ? Object.freeze([]) : [];
Tag.prototype.htmljsType = Tag.htmljsType = ['Tag'];

// Given "p" create the function `HTML.P`.
var makeTagConstructor = function (tagName) {
  // Tag is the per-tagName constructor of a HTML.Tag subclass
  var HTMLTag = function () {
    // Work with or without `new`.  If not called with `new`,
    // perform instantiation by recursively calling this constructor.
    // We can't pass varargs, so pass no args.
    var instance = this instanceof Tag ? this : new HTMLTag();
    var i = 0;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var attrs = args.length && args[0];
    if (attrs && _typeof(attrs) === 'object') {
      // Treat vanilla JS object as an attributes dictionary.
      if (!isConstructedObject(attrs)) {
        instance.attrs = attrs;
        i++;
      } else if (attrs instanceof Attrs) {
        var array = attrs.value;
        if (array.length === 1) {
          instance.attrs = array[0];
        } else if (array.length > 1) {
          instance.attrs = array;
        }
        i++;
      }
    }

    // If no children, don't create an array at all, use the prototype's
    // (frozen, empty) array.  This way we don't create an empty array
    // every time someone creates a tag without `new` and this constructor
    // calls itself with no arguments (above).
    if (i < args.length) instance.children = args.slice(i);
    return instance;
  };
  HTMLTag.prototype = new Tag();
  HTMLTag.prototype.constructor = HTMLTag;
  HTMLTag.prototype.tagName = tagName;
  return HTMLTag;
};

// Not an HTMLjs node, but a wrapper to pass multiple attrs dictionaries
// to a tag (for the purpose of implementing dynamic attributes).
function Attrs() {
  // Work with or without `new`.  If not called with `new`,
  // perform instantiation by recursively calling this constructor.
  // We can't pass varargs, so pass no args.
  var instance = this instanceof Attrs ? this : new Attrs();
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  instance.value = args;
  return instance;
}
var HTMLTags = {};
function getTag(tagName) {
  var symbolName = getSymbolName(tagName);
  if (symbolName === tagName)
    // all-caps tagName
    throw new Error("Use the lowercase or camelCase form of '" + tagName + "' here");
  if (!HTMLTags[symbolName]) HTMLTags[symbolName] = makeTagConstructor(tagName);
  return HTMLTags[symbolName];
}
function ensureTag(tagName) {
  getTag(tagName); // don't return it
}
function isTagEnsured(tagName) {
  return isKnownElement(tagName);
}
function getSymbolName(tagName) {
  // "foo-bar" -> "FOO_BAR"
  return tagName.toUpperCase().replace(/-/g, '_');
}
var knownHTMLElementNames = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');
var knownSVGElementNames = 'altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph path pattern polygon polyline radialGradient rect set stop style svg switch symbol text textPath title tref tspan use view vkern'.split(' ');
var knownElementNames = knownHTMLElementNames.concat(knownSVGElementNames);
var voidElementNames = 'area base br col command embed hr img input keygen link meta param source track wbr'.split(' ');
var voidElementSet = new Set(voidElementNames);
var knownElementSet = new Set(knownElementNames);
var knownSVGElementSet = new Set(knownSVGElementNames);
function isKnownElement(tagName) {
  return knownElementSet.has(tagName);
}
function isKnownSVGElement(tagName) {
  return knownSVGElementSet.has(tagName);
}
function isVoidElement(tagName) {
  return voidElementSet.has(tagName);
}
// Ensure tags for all known elements
knownElementNames.forEach(ensureTag);
function CharRef(attrs) {
  if (!(this instanceof CharRef))
    // called without `new`
    return new CharRef(attrs);
  if (!(attrs && attrs.html && attrs.str)) throw new Error("HTML.CharRef must be constructed with ({html:..., str:...})");
  this.html = attrs.html;
  this.str = attrs.str;
}
CharRef.prototype.htmljsType = CharRef.htmljsType = ['CharRef'];
function Comment(value) {
  if (!(this instanceof Comment))
    // called without `new`
    return new Comment(value);
  if (typeof value !== 'string') throw new Error('HTML.Comment must be constructed with a string');
  this.value = value;
  // Kill illegal hyphens in comment value (no way to escape them in HTML)
  this.sanitizedValue = value.replace(/^-|--+|-$/g, '');
}
Comment.prototype.htmljsType = Comment.htmljsType = ['Comment'];
function Raw(value) {
  if (!(this instanceof Raw))
    // called without `new`
    return new Raw(value);
  if (typeof value !== 'string') throw new Error('HTML.Raw must be constructed with a string');
  this.value = value;
}
Raw.prototype.htmljsType = Raw.htmljsType = ['Raw'];
function isArray(x) {
  return x instanceof Array || Array.isArray(x);
}
function isConstructedObject(x) {
  // Figure out if `x` is "an instance of some class" or just a plain
  // object literal.  It correctly treats an object literal like
  // `{ constructor: ... }` as an object literal.  It won't detect
  // instances of classes that lack a `constructor` property (e.g.
  // if you assign to a prototype when setting up the class as in:
  // `Foo = function () { ... }; Foo.prototype = { ... }`, then
  // `(new Foo).constructor` is `Object`, not `Foo`).
  if (!x || _typeof(x) !== 'object') return false;
  // Is this a plain object?
  var plain = false;
  if (Object.getPrototypeOf(x) === null) {
    plain = true;
  } else {
    var proto = x;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }
    plain = Object.getPrototypeOf(x) === proto;
  }
  return !plain && typeof x.constructor === 'function' && x instanceof x.constructor;
}
function isNully(node) {
  if (node == null)
    // null or undefined
    return true;
  if (isArray(node)) {
    // is it an empty array or an array of all nully items?
    for (var i = 0; i < node.length; i++) if (!isNully(node[i])) return false;
    return true;
  }
  return false;
}
function isValidAttributeName(name) {
  return /^[:_A-Za-z][:_A-Za-z0-9.\-]*/.test(name);
}
function flattenAttributes(attrs) {
  if (!attrs) return attrs;
  var isList = isArray(attrs);
  if (isList && attrs.length === 0) return null;
  var result = {};
  for (var i = 0, N = isList ? attrs.length : 1; i < N; i++) {
    var oneAttrs = isList ? attrs[i] : attrs;
    if (_typeof(oneAttrs) !== 'object' || isConstructedObject(oneAttrs)) throw new Error("Expected plain JS object as attrs, found: " + oneAttrs);
    for (var name in meteorBabelHelpers.sanitizeForInObject(oneAttrs)) {
      if (!isValidAttributeName(name)) throw new Error("Illegal HTML attribute name: " + name);
      var value = oneAttrs[name];
      if (!isNully(value)) result[name] = value;
    }
  }
  return result;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"visitors.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/htmljs/visitors.js                                                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _typeof;
module.link("@babel/runtime/helpers/typeof", {
  default: function (v) {
    _typeof = v;
  }
}, 0);
module.export({
  Visitor: function () {
    return Visitor;
  },
  TransformingVisitor: function () {
    return TransformingVisitor;
  },
  ToTextVisitor: function () {
    return ToTextVisitor;
  },
  ToHTMLVisitor: function () {
    return ToHTMLVisitor;
  },
  toHTML: function () {
    return toHTML;
  },
  TEXTMODE: function () {
    return TEXTMODE;
  },
  toText: function () {
    return toText;
  }
});
var Tag, CharRef, Comment, Raw, isArray, getTag, isConstructedObject, flattenAttributes, isVoidElement;
module.link("./html", {
  Tag: function (v) {
    Tag = v;
  },
  CharRef: function (v) {
    CharRef = v;
  },
  Comment: function (v) {
    Comment = v;
  },
  Raw: function (v) {
    Raw = v;
  },
  isArray: function (v) {
    isArray = v;
  },
  getTag: function (v) {
    getTag = v;
  },
  isConstructedObject: function (v) {
    isConstructedObject = v;
  },
  flattenAttributes: function (v) {
    flattenAttributes = v;
  },
  isVoidElement: function (v) {
    isVoidElement = v;
  }
}, 0);
var isPromiseLike = function (x) {
  return !!x && typeof x.then === 'function';
};
var IDENTITY = function (x) {
  return x;
};

// _assign is like _.extend or the upcoming Object.assign.
// Copy src's own, enumerable properties onto tgt and return
// tgt.
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _assign = function (tgt, src) {
  for (var k in meteorBabelHelpers.sanitizeForInObject(src)) {
    if (_hasOwnProperty.call(src, k)) tgt[k] = src[k];
  }
  return tgt;
};
var Visitor = function (props) {
  _assign(this, props);
};
Visitor.def = function (options) {
  _assign(this.prototype, options);
};
Visitor.extend = function (options) {
  var curType = this;
  var subType = function () {
    function HTMLVisitorSubtype() {
      Visitor.apply(this, arguments);
    }
    return HTMLVisitorSubtype;
  }(
    /*arguments*/
  );
  subType.prototype = new curType();
  subType.extend = curType.extend;
  subType.def = curType.def;
  if (options) _assign(subType.prototype, options);
  return subType;
};
Visitor.def({
  visit: function (content /*, ...*/) {
    if (content == null)
      // null or undefined.
      return this.visitNull.apply(this, arguments);
    if (_typeof(content) === 'object') {
      if (content.htmljsType) {
        switch (content.htmljsType) {
          case Tag.htmljsType:
            return this.visitTag.apply(this, arguments);
          case CharRef.htmljsType:
            return this.visitCharRef.apply(this, arguments);
          case Comment.htmljsType:
            return this.visitComment.apply(this, arguments);
          case Raw.htmljsType:
            return this.visitRaw.apply(this, arguments);
          default:
            throw new Error("Unknown htmljs type: " + content.htmljsType);
        }
      }
      if (isArray(content)) return this.visitArray.apply(this, arguments);
      return this.visitObject.apply(this, arguments);
    } else if (typeof content === 'string' || typeof content === 'boolean' || typeof content === 'number') {
      return this.visitPrimitive.apply(this, arguments);
    } else if (typeof content === 'function') {
      return this.visitFunction.apply(this, arguments);
    }
    throw new Error("Unexpected object in htmljs: " + content);
  },
  visitNull: function (nullOrUndefined /*, ...*/) {},
  visitPrimitive: function (stringBooleanOrNumber /*, ...*/) {},
  visitArray: function (array /*, ...*/) {},
  visitComment: function (comment /*, ...*/) {},
  visitCharRef: function (charRef /*, ...*/) {},
  visitRaw: function (raw /*, ...*/) {},
  visitTag: function (tag /*, ...*/) {},
  visitObject: function (obj /*, ...*/) {
    throw new Error("Unexpected object in htmljs: " + obj);
  },
  visitFunction: function (fn /*, ...*/) {
    throw new Error("Unexpected function in htmljs: " + fn);
  }
});
var TransformingVisitor = Visitor.extend();
TransformingVisitor.def({
  visitNull: IDENTITY,
  visitPrimitive: IDENTITY,
  visitArray: function (array) {
    var result = array;
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    for (var i = 0; i < array.length; i++) {
      var oldItem = array[i];
      var newItem = this.visit.apply(this, [oldItem].concat(args));
      if (newItem !== oldItem) {
        // copy `array` on write
        if (result === array) result = array.slice();
        result[i] = newItem;
      }
    }
    return result;
  },
  visitComment: IDENTITY,
  visitCharRef: IDENTITY,
  visitRaw: IDENTITY,
  visitObject: function (obj) {
    // Don't parse Markdown & RCData as HTML
    if (obj.textMode != null) {
      return obj;
    }
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    if ('content' in obj) {
      obj.content = this.visit.apply(this, [obj.content].concat(args));
    }
    if ('elseContent' in obj) {
      obj.elseContent = this.visit.apply(this, [obj.elseContent].concat(args));
    }
    return obj;
  },
  visitFunction: IDENTITY,
  visitTag: function (tag) {
    var oldChildren = tag.children;
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    var newChildren = this.visitChildren.apply(this, [oldChildren].concat(args));
    var oldAttrs = tag.attrs;
    var newAttrs = this.visitAttributes.apply(this, [oldAttrs].concat(args));
    if (newAttrs === oldAttrs && newChildren === oldChildren) return tag;
    var newTag = getTag(tag.tagName).apply(null, newChildren);
    newTag.attrs = newAttrs;
    return newTag;
  },
  visitChildren: function (children) {
    for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }
    return this.visitArray.apply(this, [children].concat(args));
  },
  // Transform the `.attrs` property of a tag, which may be a dictionary,
  // an array, or in some uses, a foreign object (such as
  // a template tag).
  visitAttributes: function (attrs) {
    for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      args[_key5 - 1] = arguments[_key5];
    }
    // Allow Promise-like values here; these will be handled in materializer.
    if (isPromiseLike(attrs)) {
      return attrs;
    }
    if (isArray(attrs)) {
      var result = attrs;
      for (var i = 0; i < attrs.length; i++) {
        var oldItem = attrs[i];
        var newItem = this.visitAttributes.apply(this, [oldItem].concat(args));
        if (newItem !== oldItem) {
          // copy on write
          if (result === attrs) result = attrs.slice();
          result[i] = newItem;
        }
      }
      return result;
    }
    if (attrs && isConstructedObject(attrs)) {
      throw new Error("The basic TransformingVisitor does not support " + "foreign objects in attributes.  Define a custom " + "visitAttributes for this case.");
    }
    var oldAttrs = attrs;
    var newAttrs = oldAttrs;
    if (oldAttrs) {
      var attrArgs = [null, null];
      attrArgs.push.apply(attrArgs, arguments);
      for (var k in meteorBabelHelpers.sanitizeForInObject(oldAttrs)) {
        var oldValue = oldAttrs[k];
        attrArgs[0] = k;
        attrArgs[1] = oldValue;
        var newValue = this.visitAttribute.apply(this, attrArgs);
        if (newValue !== oldValue) {
          // copy on write
          if (newAttrs === oldAttrs) newAttrs = _assign({}, oldAttrs);
          newAttrs[k] = newValue;
        }
      }
    }
    return newAttrs;
  },
  // Transform the value of one attribute name/value in an
  // attributes dictionary.
  visitAttribute: function (name, value, tag) {
    for (var _len6 = arguments.length, args = new Array(_len6 > 3 ? _len6 - 3 : 0), _key6 = 3; _key6 < _len6; _key6++) {
      args[_key6 - 3] = arguments[_key6];
    }
    return this.visit.apply(this, [value].concat(args));
  }
});
var ToTextVisitor = Visitor.extend();
ToTextVisitor.def({
  visitNull: function (nullOrUndefined) {
    return '';
  },
  visitPrimitive: function (stringBooleanOrNumber) {
    var str = String(stringBooleanOrNumber);
    if (this.textMode === TEXTMODE.RCDATA) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    } else if (this.textMode === TEXTMODE.ATTRIBUTE) {
      // escape `&` and `"` this time, not `&` and `<`
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    } else {
      return str;
    }
  },
  visitArray: function (array) {
    var parts = [];
    for (var i = 0; i < array.length; i++) parts.push(this.visit(array[i]));
    return parts.join('');
  },
  visitComment: function (comment) {
    throw new Error("Can't have a comment here");
  },
  visitCharRef: function (charRef) {
    if (this.textMode === TEXTMODE.RCDATA || this.textMode === TEXTMODE.ATTRIBUTE) {
      return charRef.html;
    } else {
      return charRef.str;
    }
  },
  visitRaw: function (raw) {
    return raw.value;
  },
  visitTag: function (tag) {
    // Really we should just disallow Tags here.  However, at the
    // moment it's useful to stringify any HTML we find.  In
    // particular, when you include a template within `{{#markdown}}`,
    // we render the template as text, and since there's currently
    // no way to make the template be *parsed* as text (e.g. `<template
    // type="text">`), we hackishly support HTML tags in markdown
    // in templates by parsing them and stringifying them.
    return this.visit(this.toHTML(tag));
  },
  visitObject: function (x) {
    throw new Error("Unexpected object in htmljs in toText: " + x);
  },
  toHTML: function (node) {
    return toHTML(node);
  }
});
var ToHTMLVisitor = Visitor.extend();
ToHTMLVisitor.def({
  visitNull: function (nullOrUndefined) {
    return '';
  },
  visitPrimitive: function (stringBooleanOrNumber) {
    var str = String(stringBooleanOrNumber);
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  },
  visitArray: function (array) {
    var parts = [];
    for (var i = 0; i < array.length; i++) parts.push(this.visit(array[i]));
    return parts.join('');
  },
  visitComment: function (comment) {
    return '<!--' + comment.sanitizedValue + '-->';
  },
  visitCharRef: function (charRef) {
    return charRef.html;
  },
  visitRaw: function (raw) {
    return raw.value;
  },
  visitTag: function (tag) {
    var attrStrs = [];
    var tagName = tag.tagName;
    var children = tag.children;
    var attrs = tag.attrs;
    if (attrs) {
      attrs = flattenAttributes(attrs);
      for (var k in meteorBabelHelpers.sanitizeForInObject(attrs)) {
        if (k === 'value' && tagName === 'textarea') {
          children = [attrs[k], children];
        } else {
          var v = this.toText(attrs[k], TEXTMODE.ATTRIBUTE);
          attrStrs.push(' ' + k + '="' + v + '"');
        }
      }
    }
    var startTag = '<' + tagName + attrStrs.join('') + '>';
    var childStrs = [];
    var content;
    if (tagName === 'textarea') {
      for (var i = 0; i < children.length; i++) childStrs.push(this.toText(children[i], TEXTMODE.RCDATA));
      content = childStrs.join('');
      if (content.slice(0, 1) === '\n')
        // TEXTAREA will absorb a newline, so if we see one, add
        // another one.
        content = '\n' + content;
    } else {
      for (var i = 0; i < children.length; i++) childStrs.push(this.visit(children[i]));
      content = childStrs.join('');
    }
    var result = startTag + content;
    if (children.length || !isVoidElement(tagName)) {
      // "Void" elements like BR are the only ones that don't get a close
      // tag in HTML5.  They shouldn't have contents, either, so we could
      // throw an error upon seeing contents here.
      result += '</' + tagName + '>';
    }
    return result;
  },
  visitObject: function (x) {
    throw new Error("Unexpected object in htmljs in toHTML: " + x);
  },
  toText: function (node, textMode) {
    return toText(node, textMode);
  }
});

////////////////////////////// TOHTML

function toHTML(content) {
  return new ToHTMLVisitor().visit(content);
}
var TEXTMODE = {
  STRING: 1,
  RCDATA: 2,
  ATTRIBUTE: 3
};
function toText(content, textMode) {
  if (!textMode) throw new Error("textMode required for HTML.toText");
  if (!(textMode === TEXTMODE.STRING || textMode === TEXTMODE.RCDATA || textMode === TEXTMODE.ATTRIBUTE)) throw new Error("Unknown textMode: " + textMode);
  var visitor = new ToTextVisitor({
    textMode: textMode
  });
  return visitor.visit(content);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      HTML: HTML
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/htmljs/preamble.js"
  ],
  mainModulePath: "/node_modules/meteor/htmljs/preamble.js"
}});
