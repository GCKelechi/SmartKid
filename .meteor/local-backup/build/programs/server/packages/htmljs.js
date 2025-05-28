Package["core-runtime"].queue("htmljs",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var HTML;

var require = meteorInstall({"node_modules":{"meteor":{"htmljs":{"preamble.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/htmljs/preamble.js                                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      HTML: () => HTML
    });
    let HTMLTags, Tag, Attrs, getTag, ensureTag, isTagEnsured, getSymbolName, knownHTMLElementNames, knownSVGElementNames, knownElementNames, voidElementNames, isKnownElement, isKnownSVGElement, isVoidElement, CharRef, Comment, Raw, isArray, isConstructedObject, isNully, isValidAttributeName, flattenAttributes;
    module.link("./html", {
      HTMLTags(v) {
        HTMLTags = v;
      },
      Tag(v) {
        Tag = v;
      },
      Attrs(v) {
        Attrs = v;
      },
      getTag(v) {
        getTag = v;
      },
      ensureTag(v) {
        ensureTag = v;
      },
      isTagEnsured(v) {
        isTagEnsured = v;
      },
      getSymbolName(v) {
        getSymbolName = v;
      },
      knownHTMLElementNames(v) {
        knownHTMLElementNames = v;
      },
      knownSVGElementNames(v) {
        knownSVGElementNames = v;
      },
      knownElementNames(v) {
        knownElementNames = v;
      },
      voidElementNames(v) {
        voidElementNames = v;
      },
      isKnownElement(v) {
        isKnownElement = v;
      },
      isKnownSVGElement(v) {
        isKnownSVGElement = v;
      },
      isVoidElement(v) {
        isVoidElement = v;
      },
      CharRef(v) {
        CharRef = v;
      },
      Comment(v) {
        Comment = v;
      },
      Raw(v) {
        Raw = v;
      },
      isArray(v) {
        isArray = v;
      },
      isConstructedObject(v) {
        isConstructedObject = v;
      },
      isNully(v) {
        isNully = v;
      },
      isValidAttributeName(v) {
        isValidAttributeName = v;
      },
      flattenAttributes(v) {
        flattenAttributes = v;
      }
    }, 0);
    let Visitor, TransformingVisitor, ToHTMLVisitor, ToTextVisitor, toHTML, TEXTMODE, toText;
    module.link("./visitors", {
      Visitor(v) {
        Visitor = v;
      },
      TransformingVisitor(v) {
        TransformingVisitor = v;
      },
      ToHTMLVisitor(v) {
        ToHTMLVisitor = v;
      },
      ToTextVisitor(v) {
        ToTextVisitor = v;
      },
      toHTML(v) {
        toHTML = v;
      },
      TEXTMODE(v) {
        TEXTMODE = v;
      },
      toText(v) {
        toText = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const HTML = Object.assign(HTMLTags, {
      Tag,
      Attrs,
      getTag,
      ensureTag,
      isTagEnsured,
      getSymbolName,
      knownHTMLElementNames,
      knownSVGElementNames,
      knownElementNames,
      voidElementNames,
      isKnownElement,
      isKnownSVGElement,
      isVoidElement,
      CharRef,
      Comment,
      Raw,
      isArray,
      isConstructedObject,
      isNully,
      isValidAttributeName,
      flattenAttributes,
      toHTML,
      TEXTMODE,
      toText,
      Visitor,
      TransformingVisitor,
      ToHTMLVisitor,
      ToTextVisitor
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"html.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/htmljs/html.js                                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  Tag: () => Tag,
  Attrs: () => Attrs,
  HTMLTags: () => HTMLTags,
  getTag: () => getTag,
  ensureTag: () => ensureTag,
  isTagEnsured: () => isTagEnsured,
  getSymbolName: () => getSymbolName,
  knownHTMLElementNames: () => knownHTMLElementNames,
  knownSVGElementNames: () => knownSVGElementNames,
  knownElementNames: () => knownElementNames,
  voidElementNames: () => voidElementNames,
  isKnownElement: () => isKnownElement,
  isKnownSVGElement: () => isKnownSVGElement,
  isVoidElement: () => isVoidElement,
  CharRef: () => CharRef,
  Comment: () => Comment,
  Raw: () => Raw,
  isArray: () => isArray,
  isConstructedObject: () => isConstructedObject,
  isNully: () => isNully,
  isValidAttributeName: () => isValidAttributeName,
  flattenAttributes: () => flattenAttributes
});
const Tag = function () {};
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
    if (attrs && typeof attrs === 'object') {
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
const HTMLTags = {};
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
const knownHTMLElementNames = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');
const knownSVGElementNames = 'altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph path pattern polygon polyline radialGradient rect set stop style svg switch symbol text textPath title tref tspan use view vkern'.split(' ');
const knownElementNames = knownHTMLElementNames.concat(knownSVGElementNames);
const voidElementNames = 'area base br col command embed hr img input keygen link meta param source track wbr'.split(' ');
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
  if (!x || typeof x !== 'object') return false;
  // Is this a plain object?
  let plain = false;
  if (Object.getPrototypeOf(x) === null) {
    plain = true;
  } else {
    let proto = x;
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
    if (typeof oneAttrs !== 'object' || isConstructedObject(oneAttrs)) throw new Error("Expected plain JS object as attrs, found: " + oneAttrs);
    for (var name in oneAttrs) {
      if (!isValidAttributeName(name)) throw new Error("Illegal HTML attribute name: " + name);
      var value = oneAttrs[name];
      if (!isNully(value)) result[name] = value;
    }
  }
  return result;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"visitors.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/htmljs/visitors.js                                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      Visitor: () => Visitor,
      TransformingVisitor: () => TransformingVisitor,
      ToTextVisitor: () => ToTextVisitor,
      ToHTMLVisitor: () => ToHTMLVisitor,
      toHTML: () => toHTML,
      TEXTMODE: () => TEXTMODE,
      toText: () => toText
    });
    let Tag, CharRef, Comment, Raw, isArray, getTag, isConstructedObject, flattenAttributes, isVoidElement;
    module.link("./html", {
      Tag(v) {
        Tag = v;
      },
      CharRef(v) {
        CharRef = v;
      },
      Comment(v) {
        Comment = v;
      },
      Raw(v) {
        Raw = v;
      },
      isArray(v) {
        isArray = v;
      },
      getTag(v) {
        getTag = v;
      },
      isConstructedObject(v) {
        isConstructedObject = v;
      },
      flattenAttributes(v) {
        flattenAttributes = v;
      },
      isVoidElement(v) {
        isVoidElement = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const isPromiseLike = x => !!x && typeof x.then === 'function';
    var IDENTITY = function (x) {
      return x;
    };

    // _assign is like _.extend or the upcoming Object.assign.
    // Copy src's own, enumerable properties onto tgt and return
    // tgt.
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var _assign = function (tgt, src) {
      for (var k in src) {
        if (_hasOwnProperty.call(src, k)) tgt[k] = src[k];
      }
      return tgt;
    };
    const Visitor = function (props) {
      _assign(this, props);
    };
    Visitor.def = function (options) {
      _assign(this.prototype, options);
    };
    Visitor.extend = function (options) {
      var curType = this;
      var subType = function HTMLVisitorSubtype(/*arguments*/
      ) {
        Visitor.apply(this, arguments);
      };
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
        if (typeof content === 'object') {
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
    const TransformingVisitor = Visitor.extend();
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
          var newItem = this.visit(oldItem, ...args);
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
          obj.content = this.visit(obj.content, ...args);
        }
        if ('elseContent' in obj) {
          obj.elseContent = this.visit(obj.elseContent, ...args);
        }
        return obj;
      },
      visitFunction: IDENTITY,
      visitTag: function (tag) {
        var oldChildren = tag.children;
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }
        var newChildren = this.visitChildren(oldChildren, ...args);
        var oldAttrs = tag.attrs;
        var newAttrs = this.visitAttributes(oldAttrs, ...args);
        if (newAttrs === oldAttrs && newChildren === oldChildren) return tag;
        var newTag = getTag(tag.tagName).apply(null, newChildren);
        newTag.attrs = newAttrs;
        return newTag;
      },
      visitChildren: function (children) {
        for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          args[_key4 - 1] = arguments[_key4];
        }
        return this.visitArray(children, ...args);
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
            var newItem = this.visitAttributes(oldItem, ...args);
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
          for (var k in oldAttrs) {
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
        return this.visit(value, ...args);
      }
    });
    const ToTextVisitor = Visitor.extend();
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
    const ToHTMLVisitor = Visitor.extend();
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
          for (var k in attrs) {
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
    const TEXTMODE = {
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
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

//# sourceURL=meteor://💻app/packages/htmljs.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvaHRtbGpzL3ByZWFtYmxlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9odG1sanMvaHRtbC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvaHRtbGpzL3Zpc2l0b3JzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIkhUTUwiLCJIVE1MVGFncyIsIlRhZyIsIkF0dHJzIiwiZ2V0VGFnIiwiZW5zdXJlVGFnIiwiaXNUYWdFbnN1cmVkIiwiZ2V0U3ltYm9sTmFtZSIsImtub3duSFRNTEVsZW1lbnROYW1lcyIsImtub3duU1ZHRWxlbWVudE5hbWVzIiwia25vd25FbGVtZW50TmFtZXMiLCJ2b2lkRWxlbWVudE5hbWVzIiwiaXNLbm93bkVsZW1lbnQiLCJpc0tub3duU1ZHRWxlbWVudCIsImlzVm9pZEVsZW1lbnQiLCJDaGFyUmVmIiwiQ29tbWVudCIsIlJhdyIsImlzQXJyYXkiLCJpc0NvbnN0cnVjdGVkT2JqZWN0IiwiaXNOdWxseSIsImlzVmFsaWRBdHRyaWJ1dGVOYW1lIiwiZmxhdHRlbkF0dHJpYnV0ZXMiLCJsaW5rIiwidiIsIlZpc2l0b3IiLCJUcmFuc2Zvcm1pbmdWaXNpdG9yIiwiVG9IVE1MVmlzaXRvciIsIlRvVGV4dFZpc2l0b3IiLCJ0b0hUTUwiLCJURVhUTU9ERSIsInRvVGV4dCIsIl9fcmVpZnlXYWl0Rm9yRGVwc19fIiwiT2JqZWN0IiwiYXNzaWduIiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwicHJvdG90eXBlIiwidGFnTmFtZSIsImF0dHJzIiwiY2hpbGRyZW4iLCJmcmVlemUiLCJodG1sanNUeXBlIiwibWFrZVRhZ0NvbnN0cnVjdG9yIiwiSFRNTFRhZyIsImluc3RhbmNlIiwiaSIsIl9sZW4iLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJhcmdzIiwiQXJyYXkiLCJfa2V5IiwiYXJyYXkiLCJ2YWx1ZSIsInNsaWNlIiwiY29uc3RydWN0b3IiLCJfbGVuMiIsIl9rZXkyIiwic3ltYm9sTmFtZSIsIkVycm9yIiwidG9VcHBlckNhc2UiLCJyZXBsYWNlIiwic3BsaXQiLCJjb25jYXQiLCJ2b2lkRWxlbWVudFNldCIsIlNldCIsImtub3duRWxlbWVudFNldCIsImtub3duU1ZHRWxlbWVudFNldCIsImhhcyIsImZvckVhY2giLCJodG1sIiwic3RyIiwic2FuaXRpemVkVmFsdWUiLCJ4IiwicGxhaW4iLCJnZXRQcm90b3R5cGVPZiIsInByb3RvIiwibm9kZSIsIm5hbWUiLCJ0ZXN0IiwiaXNMaXN0IiwicmVzdWx0IiwiTiIsIm9uZUF0dHJzIiwiaXNQcm9taXNlTGlrZSIsInRoZW4iLCJJREVOVElUWSIsIl9oYXNPd25Qcm9wZXJ0eSIsImhhc093blByb3BlcnR5IiwiX2Fzc2lnbiIsInRndCIsInNyYyIsImsiLCJjYWxsIiwicHJvcHMiLCJkZWYiLCJvcHRpb25zIiwiZXh0ZW5kIiwiY3VyVHlwZSIsInN1YlR5cGUiLCJIVE1MVmlzaXRvclN1YnR5cGUiLCJhcHBseSIsInZpc2l0IiwiY29udGVudCIsInZpc2l0TnVsbCIsInZpc2l0VGFnIiwidmlzaXRDaGFyUmVmIiwidmlzaXRDb21tZW50IiwidmlzaXRSYXciLCJ2aXNpdEFycmF5IiwidmlzaXRPYmplY3QiLCJ2aXNpdFByaW1pdGl2ZSIsInZpc2l0RnVuY3Rpb24iLCJudWxsT3JVbmRlZmluZWQiLCJzdHJpbmdCb29sZWFuT3JOdW1iZXIiLCJjb21tZW50IiwiY2hhclJlZiIsInJhdyIsInRhZyIsIm9iaiIsImZuIiwib2xkSXRlbSIsIm5ld0l0ZW0iLCJ0ZXh0TW9kZSIsImVsc2VDb250ZW50Iiwib2xkQ2hpbGRyZW4iLCJfbGVuMyIsIl9rZXkzIiwibmV3Q2hpbGRyZW4iLCJ2aXNpdENoaWxkcmVuIiwib2xkQXR0cnMiLCJuZXdBdHRycyIsInZpc2l0QXR0cmlidXRlcyIsIm5ld1RhZyIsIl9sZW40IiwiX2tleTQiLCJfbGVuNSIsIl9rZXk1IiwiYXR0ckFyZ3MiLCJwdXNoIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsInZpc2l0QXR0cmlidXRlIiwiX2xlbjYiLCJfa2V5NiIsIlN0cmluZyIsIlJDREFUQSIsIkFUVFJJQlVURSIsInBhcnRzIiwiam9pbiIsImF0dHJTdHJzIiwic3RhcnRUYWciLCJjaGlsZFN0cnMiLCJTVFJJTkciLCJ2aXNpdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBQSxNQUFNLENBQUNDLE1BQU0sQ0FBQztNQUFDQyxJQUFJLEVBQUNBLENBQUEsS0FBSUE7SUFBSSxDQUFDLENBQUM7SUFBQyxJQUFJQyxRQUFRLEVBQUNDLEdBQUcsRUFBQ0MsS0FBSyxFQUFDQyxNQUFNLEVBQUNDLFNBQVMsRUFBQ0MsWUFBWSxFQUFDQyxhQUFhLEVBQUNDLHFCQUFxQixFQUFDQyxvQkFBb0IsRUFBQ0MsaUJBQWlCLEVBQUNDLGdCQUFnQixFQUFDQyxjQUFjLEVBQUNDLGlCQUFpQixFQUFDQyxhQUFhLEVBQUNDLE9BQU8sRUFBQ0MsT0FBTyxFQUFDQyxHQUFHLEVBQUNDLE9BQU8sRUFBQ0MsbUJBQW1CLEVBQUNDLE9BQU8sRUFBQ0Msb0JBQW9CLEVBQUNDLGlCQUFpQjtJQUFDeEIsTUFBTSxDQUFDeUIsSUFBSSxDQUFDLFFBQVEsRUFBQztNQUFDdEIsUUFBUUEsQ0FBQ3VCLENBQUMsRUFBQztRQUFDdkIsUUFBUSxHQUFDdUIsQ0FBQztNQUFBLENBQUM7TUFBQ3RCLEdBQUdBLENBQUNzQixDQUFDLEVBQUM7UUFBQ3RCLEdBQUcsR0FBQ3NCLENBQUM7TUFBQSxDQUFDO01BQUNyQixLQUFLQSxDQUFDcUIsQ0FBQyxFQUFDO1FBQUNyQixLQUFLLEdBQUNxQixDQUFDO01BQUEsQ0FBQztNQUFDcEIsTUFBTUEsQ0FBQ29CLENBQUMsRUFBQztRQUFDcEIsTUFBTSxHQUFDb0IsQ0FBQztNQUFBLENBQUM7TUFBQ25CLFNBQVNBLENBQUNtQixDQUFDLEVBQUM7UUFBQ25CLFNBQVMsR0FBQ21CLENBQUM7TUFBQSxDQUFDO01BQUNsQixZ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QyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRyIsImZpbGUiOiIvcGFja2FnZXMvaHRtbGpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSFRNTFRhZ3MsXG4gIFRhZyxcbiAgQXR0cnMsXG4gIGdldFRhZyxcbiAgZW5zdXJlVGFnLFxuICBpc1RhZ0Vuc3VyZWQsXG4gIGdldFN5bWJvbE5hbWUsXG4gIGtub3duSFRNTEVsZW1lbnROYW1lcyxcbiAga25vd25TVkdFbGVtZW50TmFtZXMsXG4gIGtub3duRWxlbWVudE5hbWVzLFxuICB2b2lkRWxlbWVudE5hbWVzLFxuICBpc0tub3duRWxlbWVudCxcbiAgaXNLbm93blNWR0VsZW1lbnQsXG4gIGlzVm9pZEVsZW1lbnQsXG4gIENoYXJSZWYsXG4gIENvbW1lbnQsXG4gIFJhdyxcbiAgaXNBcnJheSxcbiAgaXNDb25zdHJ1Y3RlZE9iamVjdCxcbiAgaXNOdWxseSxcbiAgaXNWYWxpZEF0dHJpYnV0ZU5hbWUsXG4gIGZsYXR0ZW5BdHRyaWJ1dGVzLFxufSBmcm9tICcuL2h0bWwnO1xuXG5pbXBvcnQge1xuICBWaXNpdG9yLFxuICBUcmFuc2Zvcm1pbmdWaXNpdG9yLFxuICBUb0hUTUxWaXNpdG9yLFxuICBUb1RleHRWaXNpdG9yLFxuICB0b0hUTUwsXG4gIFRFWFRNT0RFLFxuICB0b1RleHRcbn0gZnJvbSAnLi92aXNpdG9ycyc7XG5cblxuLy8gd2UncmUgYWN0dWFsbHkgZXhwb3J0aW5nIHRoZSBIVE1MVGFncyBvYmplY3QuXG4vLyAgYmVjYXVzZSBpdCBpcyBkeW5hbWljYWxseSBhbHRlcmVkIGJ5IGdldFRhZy9lbnN1cmVUYWdcbmV4cG9ydCBjb25zdCBIVE1MID0gT2JqZWN0LmFzc2lnbihIVE1MVGFncywge1xuICBUYWcsXG4gIEF0dHJzLFxuICBnZXRUYWcsXG4gIGVuc3VyZVRhZyxcbiAgaXNUYWdFbnN1cmVkLFxuICBnZXRTeW1ib2xOYW1lLFxuICBrbm93bkhUTUxFbGVtZW50TmFtZXMsXG4gIGtub3duU1ZHRWxlbWVudE5hbWVzLFxuICBrbm93bkVsZW1lbnROYW1lcyxcbiAgdm9pZEVsZW1lbnROYW1lcyxcbiAgaXNLbm93bkVsZW1lbnQsXG4gIGlzS25vd25TVkdFbGVtZW50LFxuICBpc1ZvaWRFbGVtZW50LFxuICBDaGFyUmVmLFxuICBDb21tZW50LFxuICBSYXcsXG4gIGlzQXJyYXksXG4gIGlzQ29uc3RydWN0ZWRPYmplY3QsXG4gIGlzTnVsbHksXG4gIGlzVmFsaWRBdHRyaWJ1dGVOYW1lLFxuICBmbGF0dGVuQXR0cmlidXRlcyxcbiAgdG9IVE1MLFxuICBURVhUTU9ERSxcbiAgdG9UZXh0LFxuICBWaXNpdG9yLFxuICBUcmFuc2Zvcm1pbmdWaXNpdG9yLFxuICBUb0hUTUxWaXNpdG9yLFxuICBUb1RleHRWaXNpdG9yLFxufSk7XG4iLCJcbmV4cG9ydCBjb25zdCBUYWcgPSBmdW5jdGlvbiAoKSB7fTtcblRhZy5wcm90b3R5cGUudGFnTmFtZSA9ICcnOyAvLyB0aGlzIHdpbGwgYmUgc2V0IHBlciBUYWcgc3ViY2xhc3NcblRhZy5wcm90b3R5cGUuYXR0cnMgPSBudWxsO1xuVGFnLnByb3RvdHlwZS5jaGlsZHJlbiA9IE9iamVjdC5mcmVlemUgPyBPYmplY3QuZnJlZXplKFtdKSA6IFtdO1xuVGFnLnByb3RvdHlwZS5odG1sanNUeXBlID0gVGFnLmh0bWxqc1R5cGUgPSBbJ1RhZyddO1xuXG4vLyBHaXZlbiBcInBcIiBjcmVhdGUgdGhlIGZ1bmN0aW9uIGBIVE1MLlBgLlxudmFyIG1ha2VUYWdDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uICh0YWdOYW1lKSB7XG4gIC8vIFRhZyBpcyB0aGUgcGVyLXRhZ05hbWUgY29uc3RydWN0b3Igb2YgYSBIVE1MLlRhZyBzdWJjbGFzc1xuICB2YXIgSFRNTFRhZyA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgLy8gV29yayB3aXRoIG9yIHdpdGhvdXQgYG5ld2AuICBJZiBub3QgY2FsbGVkIHdpdGggYG5ld2AsXG4gICAgLy8gcGVyZm9ybSBpbnN0YW50aWF0aW9uIGJ5IHJlY3Vyc2l2ZWx5IGNhbGxpbmcgdGhpcyBjb25zdHJ1Y3Rvci5cbiAgICAvLyBXZSBjYW4ndCBwYXNzIHZhcmFyZ3MsIHNvIHBhc3Mgbm8gYXJncy5cbiAgICB2YXIgaW5zdGFuY2UgPSAodGhpcyBpbnN0YW5jZW9mIFRhZykgPyB0aGlzIDogbmV3IEhUTUxUYWc7XG5cbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGF0dHJzID0gYXJncy5sZW5ndGggJiYgYXJnc1swXTtcbiAgICBpZiAoYXR0cnMgJiYgKHR5cGVvZiBhdHRycyA9PT0gJ29iamVjdCcpKSB7XG4gICAgICAvLyBUcmVhdCB2YW5pbGxhIEpTIG9iamVjdCBhcyBhbiBhdHRyaWJ1dGVzIGRpY3Rpb25hcnkuXG4gICAgICBpZiAoISBpc0NvbnN0cnVjdGVkT2JqZWN0KGF0dHJzKSkge1xuICAgICAgICBpbnN0YW5jZS5hdHRycyA9IGF0dHJzO1xuICAgICAgICBpKys7XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzIGluc3RhbmNlb2YgQXR0cnMpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gYXR0cnMudmFsdWU7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBpbnN0YW5jZS5hdHRycyA9IGFycmF5WzBdO1xuICAgICAgICB9IGVsc2UgaWYgKGFycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBpbnN0YW5jZS5hdHRycyA9IGFycmF5O1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIC8vIElmIG5vIGNoaWxkcmVuLCBkb24ndCBjcmVhdGUgYW4gYXJyYXkgYXQgYWxsLCB1c2UgdGhlIHByb3RvdHlwZSdzXG4gICAgLy8gKGZyb3plbiwgZW1wdHkpIGFycmF5LiAgVGhpcyB3YXkgd2UgZG9uJ3QgY3JlYXRlIGFuIGVtcHR5IGFycmF5XG4gICAgLy8gZXZlcnkgdGltZSBzb21lb25lIGNyZWF0ZXMgYSB0YWcgd2l0aG91dCBgbmV3YCBhbmQgdGhpcyBjb25zdHJ1Y3RvclxuICAgIC8vIGNhbGxzIGl0c2VsZiB3aXRoIG5vIGFyZ3VtZW50cyAoYWJvdmUpLlxuICAgIGlmIChpIDwgYXJncy5sZW5ndGgpXG4gICAgICBpbnN0YW5jZS5jaGlsZHJlbiA9IGFyZ3Muc2xpY2UoaSk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG4gIEhUTUxUYWcucHJvdG90eXBlID0gbmV3IFRhZztcbiAgSFRNTFRhZy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIVE1MVGFnO1xuICBIVE1MVGFnLnByb3RvdHlwZS50YWdOYW1lID0gdGFnTmFtZTtcblxuICByZXR1cm4gSFRNTFRhZztcbn07XG5cbi8vIE5vdCBhbiBIVE1ManMgbm9kZSwgYnV0IGEgd3JhcHBlciB0byBwYXNzIG11bHRpcGxlIGF0dHJzIGRpY3Rpb25hcmllc1xuLy8gdG8gYSB0YWcgKGZvciB0aGUgcHVycG9zZSBvZiBpbXBsZW1lbnRpbmcgZHluYW1pYyBhdHRyaWJ1dGVzKS5cbmV4cG9ydCBmdW5jdGlvbiBBdHRycyguLi5hcmdzKSB7XG4gIC8vIFdvcmsgd2l0aCBvciB3aXRob3V0IGBuZXdgLiAgSWYgbm90IGNhbGxlZCB3aXRoIGBuZXdgLFxuICAvLyBwZXJmb3JtIGluc3RhbnRpYXRpb24gYnkgcmVjdXJzaXZlbHkgY2FsbGluZyB0aGlzIGNvbnN0cnVjdG9yLlxuICAvLyBXZSBjYW4ndCBwYXNzIHZhcmFyZ3MsIHNvIHBhc3Mgbm8gYXJncy5cbiAgdmFyIGluc3RhbmNlID0gKHRoaXMgaW5zdGFuY2VvZiBBdHRycykgPyB0aGlzIDogbmV3IEF0dHJzO1xuXG4gIGluc3RhbmNlLnZhbHVlID0gYXJncztcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBLTk9XTiBFTEVNRU5UU1xuZXhwb3J0IGNvbnN0IEhUTUxUYWdzID0ge307XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWcgKHRhZ05hbWUpIHtcbiAgdmFyIHN5bWJvbE5hbWUgPSBnZXRTeW1ib2xOYW1lKHRhZ05hbWUpO1xuICBpZiAoc3ltYm9sTmFtZSA9PT0gdGFnTmFtZSkgLy8gYWxsLWNhcHMgdGFnTmFtZVxuICAgIHRocm93IG5ldyBFcnJvcihcIlVzZSB0aGUgbG93ZXJjYXNlIG9yIGNhbWVsQ2FzZSBmb3JtIG9mICdcIiArIHRhZ05hbWUgKyBcIicgaGVyZVwiKTtcblxuICBpZiAoISBIVE1MVGFnc1tzeW1ib2xOYW1lXSlcbiAgICBIVE1MVGFnc1tzeW1ib2xOYW1lXSA9IG1ha2VUYWdDb25zdHJ1Y3Rvcih0YWdOYW1lKTtcblxuICByZXR1cm4gSFRNTFRhZ3Nbc3ltYm9sTmFtZV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVUYWcodGFnTmFtZSkge1xuICBnZXRUYWcodGFnTmFtZSk7IC8vIGRvbid0IHJldHVybiBpdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUYWdFbnN1cmVkICh0YWdOYW1lKSB7XG4gIHJldHVybiBpc0tub3duRWxlbWVudCh0YWdOYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN5bWJvbE5hbWUgKHRhZ05hbWUpIHtcbiAgLy8gXCJmb28tYmFyXCIgLT4gXCJGT09fQkFSXCJcbiAgcmV0dXJuIHRhZ05hbWUudG9VcHBlckNhc2UoKS5yZXBsYWNlKC8tL2csICdfJyk7XG59XG5cbmV4cG9ydCBjb25zdCBrbm93bkhUTUxFbGVtZW50TmFtZXMgPSAnYSBhYmJyIGFjcm9ueW0gYWRkcmVzcyBhcHBsZXQgYXJlYSBhcnRpY2xlIGFzaWRlIGF1ZGlvIGIgYmFzZSBiYXNlZm9udCBiZGkgYmRvIGJpZyBibG9ja3F1b3RlIGJvZHkgYnIgYnV0dG9uIGNhbnZhcyBjYXB0aW9uIGNlbnRlciBjaXRlIGNvZGUgY29sIGNvbGdyb3VwIGNvbW1hbmQgZGF0YSBkYXRhZ3JpZCBkYXRhbGlzdCBkZCBkZWwgZGV0YWlscyBkZm4gZGlyIGRpdiBkbCBkdCBlbSBlbWJlZCBldmVudHNvdXJjZSBmaWVsZHNldCBmaWdjYXB0aW9uIGZpZ3VyZSBmb250IGZvb3RlciBmb3JtIGZyYW1lIGZyYW1lc2V0IGgxIGgyIGgzIGg0IGg1IGg2IGhlYWQgaGVhZGVyIGhncm91cCBociBodG1sIGkgaWZyYW1lIGltZyBpbnB1dCBpbnMgaXNpbmRleCBrYmQga2V5Z2VuIGxhYmVsIGxlZ2VuZCBsaSBsaW5rIG1haW4gbWFwIG1hcmsgbWVudSBtZXRhIG1ldGVyIG5hdiBub2ZyYW1lcyBub3NjcmlwdCBvYmplY3Qgb2wgb3B0Z3JvdXAgb3B0aW9uIG91dHB1dCBwIHBhcmFtIHByZSBwcm9ncmVzcyBxIHJwIHJ0IHJ1YnkgcyBzYW1wIHNjcmlwdCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzb3VyY2Ugc3BhbiBzdHJpa2Ugc3Ryb25nIHN0eWxlIHN1YiBzdW1tYXJ5IHN1cCB0YWJsZSB0Ym9keSB0ZCB0ZXh0YXJlYSB0Zm9vdCB0aCB0aGVhZCB0aW1lIHRpdGxlIHRyIHRyYWNrIHR0IHUgdWwgdmFyIHZpZGVvIHdicicuc3BsaXQoJyAnKTtcbi8vICh3ZSBhZGQgdGhlIFNWRyBvbmVzIGJlbG93KVxuXG5leHBvcnQgY29uc3Qga25vd25TVkdFbGVtZW50TmFtZXMgPSAnYWx0R2x5cGggYWx0R2x5cGhEZWYgYWx0R2x5cGhJdGVtIGFuaW1hdGUgYW5pbWF0ZUNvbG9yIGFuaW1hdGVNb3Rpb24gYW5pbWF0ZVRyYW5zZm9ybSBjaXJjbGUgY2xpcFBhdGggY29sb3ItcHJvZmlsZSBjdXJzb3IgZGVmcyBkZXNjIGVsbGlwc2UgZmVCbGVuZCBmZUNvbG9yTWF0cml4IGZlQ29tcG9uZW50VHJhbnNmZXIgZmVDb21wb3NpdGUgZmVDb252b2x2ZU1hdHJpeCBmZURpZmZ1c2VMaWdodGluZyBmZURpc3BsYWNlbWVudE1hcCBmZURpc3RhbnRMaWdodCBmZUZsb29kIGZlRnVuY0EgZmVGdW5jQiBmZUZ1bmNHIGZlRnVuY1IgZmVHYXVzc2lhbkJsdXIgZmVJbWFnZSBmZU1lcmdlIGZlTWVyZ2VOb2RlIGZlTW9ycGhvbG9neSBmZU9mZnNldCBmZVBvaW50TGlnaHQgZmVTcGVjdWxhckxpZ2h0aW5nIGZlU3BvdExpZ2h0IGZlVGlsZSBmZVR1cmJ1bGVuY2UgZmlsdGVyIGZvbnQgZm9udC1mYWNlIGZvbnQtZmFjZS1mb3JtYXQgZm9udC1mYWNlLW5hbWUgZm9udC1mYWNlLXNyYyBmb250LWZhY2UtdXJpIGZvcmVpZ25PYmplY3QgZyBnbHlwaCBnbHlwaFJlZiBoa2VybiBpbWFnZSBsaW5lIGxpbmVhckdyYWRpZW50IG1hcmtlciBtYXNrIG1ldGFkYXRhIG1pc3NpbmctZ2x5cGggcGF0aCBwYXR0ZXJuIHBvbHlnb24gcG9seWxpbmUgcmFkaWFsR3JhZGllbnQgcmVjdCBzZXQgc3RvcCBzdHlsZSBzdmcgc3dpdGNoIHN5bWJvbCB0ZXh0IHRleHRQYXRoIHRpdGxlIHRyZWYgdHNwYW4gdXNlIHZpZXcgdmtlcm4nLnNwbGl0KCcgJyk7XG4vLyBBcHBlbmQgU1ZHIGVsZW1lbnQgbmFtZXMgdG8gbGlzdCBvZiBrbm93biBlbGVtZW50IG5hbWVzXG5leHBvcnQgY29uc3Qga25vd25FbGVtZW50TmFtZXMgPSBrbm93bkhUTUxFbGVtZW50TmFtZXMuY29uY2F0KGtub3duU1ZHRWxlbWVudE5hbWVzKTtcblxuZXhwb3J0IGNvbnN0IHZvaWRFbGVtZW50TmFtZXMgPSAnYXJlYSBiYXNlIGJyIGNvbCBjb21tYW5kIGVtYmVkIGhyIGltZyBpbnB1dCBrZXlnZW4gbGluayBtZXRhIHBhcmFtIHNvdXJjZSB0cmFjayB3YnInLnNwbGl0KCcgJyk7XG5cblxudmFyIHZvaWRFbGVtZW50U2V0ID0gbmV3IFNldCh2b2lkRWxlbWVudE5hbWVzKTtcbnZhciBrbm93bkVsZW1lbnRTZXQgPSBuZXcgU2V0KGtub3duRWxlbWVudE5hbWVzKTtcbnZhciBrbm93blNWR0VsZW1lbnRTZXQgPSBuZXcgU2V0KGtub3duU1ZHRWxlbWVudE5hbWVzKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzS25vd25FbGVtZW50KHRhZ05hbWUpIHtcbiAgcmV0dXJuIGtub3duRWxlbWVudFNldC5oYXModGFnTmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0tub3duU1ZHRWxlbWVudCh0YWdOYW1lKSB7XG4gIHJldHVybiBrbm93blNWR0VsZW1lbnRTZXQuaGFzKHRhZ05hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWb2lkRWxlbWVudCh0YWdOYW1lKSB7XG4gIHJldHVybiB2b2lkRWxlbWVudFNldC5oYXModGFnTmFtZSk7XG59XG5cblxuLy8gRW5zdXJlIHRhZ3MgZm9yIGFsbCBrbm93biBlbGVtZW50c1xua25vd25FbGVtZW50TmFtZXMuZm9yRWFjaChlbnN1cmVUYWcpO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBDaGFyUmVmKGF0dHJzKSB7XG4gIGlmICghICh0aGlzIGluc3RhbmNlb2YgQ2hhclJlZikpXG4gICAgLy8gY2FsbGVkIHdpdGhvdXQgYG5ld2BcbiAgICByZXR1cm4gbmV3IENoYXJSZWYoYXR0cnMpO1xuXG4gIGlmICghIChhdHRycyAmJiBhdHRycy5odG1sICYmIGF0dHJzLnN0cikpXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJIVE1MLkNoYXJSZWYgbXVzdCBiZSBjb25zdHJ1Y3RlZCB3aXRoICh7aHRtbDouLi4sIHN0cjouLi59KVwiKTtcblxuICB0aGlzLmh0bWwgPSBhdHRycy5odG1sO1xuICB0aGlzLnN0ciA9IGF0dHJzLnN0cjtcbn1cbkNoYXJSZWYucHJvdG90eXBlLmh0bWxqc1R5cGUgPSBDaGFyUmVmLmh0bWxqc1R5cGUgPSBbJ0NoYXJSZWYnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIENvbW1lbnQodmFsdWUpIHtcbiAgaWYgKCEgKHRoaXMgaW5zdGFuY2VvZiBDb21tZW50KSlcbiAgICAvLyBjYWxsZWQgd2l0aG91dCBgbmV3YFxuICAgIHJldHVybiBuZXcgQ29tbWVudCh2YWx1ZSk7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdIVE1MLkNvbW1lbnQgbXVzdCBiZSBjb25zdHJ1Y3RlZCB3aXRoIGEgc3RyaW5nJyk7XG5cbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAvLyBLaWxsIGlsbGVnYWwgaHlwaGVucyBpbiBjb21tZW50IHZhbHVlIChubyB3YXkgdG8gZXNjYXBlIHRoZW0gaW4gSFRNTClcbiAgdGhpcy5zYW5pdGl6ZWRWYWx1ZSA9IHZhbHVlLnJlcGxhY2UoL14tfC0tK3wtJC9nLCAnJyk7XG59XG5Db21tZW50LnByb3RvdHlwZS5odG1sanNUeXBlID0gQ29tbWVudC5odG1sanNUeXBlID0gWydDb21tZW50J107XG5cbmV4cG9ydCBmdW5jdGlvbiBSYXcodmFsdWUpIHtcbiAgaWYgKCEgKHRoaXMgaW5zdGFuY2VvZiBSYXcpKVxuICAgIC8vIGNhbGxlZCB3aXRob3V0IGBuZXdgXG4gICAgcmV0dXJuIG5ldyBSYXcodmFsdWUpO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKVxuICAgIHRocm93IG5ldyBFcnJvcignSFRNTC5SYXcgbXVzdCBiZSBjb25zdHJ1Y3RlZCB3aXRoIGEgc3RyaW5nJyk7XG5cbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuUmF3LnByb3RvdHlwZS5odG1sanNUeXBlID0gUmF3Lmh0bWxqc1R5cGUgPSBbJ1JhdyddO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5ICh4KSB7XG4gIHJldHVybiB4IGluc3RhbmNlb2YgQXJyYXkgfHwgQXJyYXkuaXNBcnJheSh4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29uc3RydWN0ZWRPYmplY3QgKHgpIHtcbiAgLy8gRmlndXJlIG91dCBpZiBgeGAgaXMgXCJhbiBpbnN0YW5jZSBvZiBzb21lIGNsYXNzXCIgb3IganVzdCBhIHBsYWluXG4gIC8vIG9iamVjdCBsaXRlcmFsLiAgSXQgY29ycmVjdGx5IHRyZWF0cyBhbiBvYmplY3QgbGl0ZXJhbCBsaWtlXG4gIC8vIGB7IGNvbnN0cnVjdG9yOiAuLi4gfWAgYXMgYW4gb2JqZWN0IGxpdGVyYWwuICBJdCB3b24ndCBkZXRlY3RcbiAgLy8gaW5zdGFuY2VzIG9mIGNsYXNzZXMgdGhhdCBsYWNrIGEgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSAoZS5nLlxuICAvLyBpZiB5b3UgYXNzaWduIHRvIGEgcHJvdG90eXBlIHdoZW4gc2V0dGluZyB1cCB0aGUgY2xhc3MgYXMgaW46XG4gIC8vIGBGb28gPSBmdW5jdGlvbiAoKSB7IC4uLiB9OyBGb28ucHJvdG90eXBlID0geyAuLi4gfWAsIHRoZW5cbiAgLy8gYChuZXcgRm9vKS5jb25zdHJ1Y3RvcmAgaXMgYE9iamVjdGAsIG5vdCBgRm9vYCkuXG4gIGlmKCF4IHx8ICh0eXBlb2YgeCAhPT0gJ29iamVjdCcpKSByZXR1cm4gZmFsc2U7XG4gIC8vIElzIHRoaXMgYSBwbGFpbiBvYmplY3Q/XG4gIGxldCBwbGFpbiA9IGZhbHNlO1xuICBpZihPYmplY3QuZ2V0UHJvdG90eXBlT2YoeCkgPT09IG51bGwpIHtcbiAgICBwbGFpbiA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHByb3RvID0geDtcbiAgICB3aGlsZShPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG8pICE9PSBudWxsKSB7XG4gICAgICBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG4gICAgfVxuICAgIHBsYWluID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHgpID09PSBwcm90bztcbiAgfVxuXG4gIHJldHVybiAhcGxhaW4gJiZcbiAgICAodHlwZW9mIHguY29uc3RydWN0b3IgPT09ICdmdW5jdGlvbicpICYmXG4gICAgKHggaW5zdGFuY2VvZiB4LmNvbnN0cnVjdG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVsbHkgKG5vZGUpIHtcbiAgaWYgKG5vZGUgPT0gbnVsbClcbiAgICAvLyBudWxsIG9yIHVuZGVmaW5lZFxuICAgIHJldHVybiB0cnVlO1xuXG4gIGlmIChpc0FycmF5KG5vZGUpKSB7XG4gICAgLy8gaXMgaXQgYW4gZW1wdHkgYXJyYXkgb3IgYW4gYXJyYXkgb2YgYWxsIG51bGx5IGl0ZW1zP1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5sZW5ndGg7IGkrKylcbiAgICAgIGlmICghIGlzTnVsbHkobm9kZVtpXSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRBdHRyaWJ1dGVOYW1lIChuYW1lKSB7XG4gIHJldHVybiAvXls6X0EtWmEtel1bOl9BLVphLXowLTkuXFwtXSovLnRlc3QobmFtZSk7XG59XG5cbi8vIElmIGBhdHRyc2AgaXMgYW4gYXJyYXkgb2YgYXR0cmlidXRlcyBkaWN0aW9uYXJpZXMsIGNvbWJpbmVzIHRoZW1cbi8vIGludG8gb25lLiAgUmVtb3ZlcyBhdHRyaWJ1dGVzIHRoYXQgYXJlIFwibnVsbHkuXCJcbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuQXR0cmlidXRlcyAoYXR0cnMpIHtcbiAgaWYgKCEgYXR0cnMpXG4gICAgcmV0dXJuIGF0dHJzO1xuXG4gIHZhciBpc0xpc3QgPSBpc0FycmF5KGF0dHJzKTtcbiAgaWYgKGlzTGlzdCAmJiBhdHRycy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmb3IgKHZhciBpID0gMCwgTiA9IChpc0xpc3QgPyBhdHRycy5sZW5ndGggOiAxKTsgaSA8IE47IGkrKykge1xuICAgIHZhciBvbmVBdHRycyA9IChpc0xpc3QgPyBhdHRyc1tpXSA6IGF0dHJzKTtcbiAgICBpZiAoKHR5cGVvZiBvbmVBdHRycyAhPT0gJ29iamVjdCcpIHx8XG4gICAgICAgIGlzQ29uc3RydWN0ZWRPYmplY3Qob25lQXR0cnMpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgcGxhaW4gSlMgb2JqZWN0IGFzIGF0dHJzLCBmb3VuZDogXCIgKyBvbmVBdHRycyk7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBvbmVBdHRycykge1xuICAgICAgaWYgKCEgaXNWYWxpZEF0dHJpYnV0ZU5hbWUobmFtZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIklsbGVnYWwgSFRNTCBhdHRyaWJ1dGUgbmFtZTogXCIgKyBuYW1lKTtcbiAgICAgIHZhciB2YWx1ZSA9IG9uZUF0dHJzW25hbWVdO1xuICAgICAgaWYgKCEgaXNOdWxseSh2YWx1ZSkpXG4gICAgICAgIHJlc3VsdFtuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCJpbXBvcnQge1xuICBUYWcsXG4gIENoYXJSZWYsXG4gIENvbW1lbnQsXG4gIFJhdyxcbiAgaXNBcnJheSxcbiAgZ2V0VGFnLFxuICBpc0NvbnN0cnVjdGVkT2JqZWN0LFxuICBmbGF0dGVuQXR0cmlidXRlcyxcbiAgaXNWb2lkRWxlbWVudCxcbn0gZnJvbSAnLi9odG1sJztcblxuY29uc3QgaXNQcm9taXNlTGlrZSA9IHggPT4gISF4ICYmIHR5cGVvZiB4LnRoZW4gPT09ICdmdW5jdGlvbic7XG5cbnZhciBJREVOVElUWSA9IGZ1bmN0aW9uICh4KSB7IHJldHVybiB4OyB9O1xuXG4vLyBfYXNzaWduIGlzIGxpa2UgXy5leHRlbmQgb3IgdGhlIHVwY29taW5nIE9iamVjdC5hc3NpZ24uXG4vLyBDb3B5IHNyYydzIG93biwgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9udG8gdGd0IGFuZCByZXR1cm5cbi8vIHRndC5cbnZhciBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF9hc3NpZ24gPSBmdW5jdGlvbiAodGd0LCBzcmMpIHtcbiAgZm9yICh2YXIgayBpbiBzcmMpIHtcbiAgICBpZiAoX2hhc093blByb3BlcnR5LmNhbGwoc3JjLCBrKSlcbiAgICAgIHRndFtrXSA9IHNyY1trXTtcbiAgfVxuICByZXR1cm4gdGd0O1xufTtcblxuZXhwb3J0IGNvbnN0IFZpc2l0b3IgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgX2Fzc2lnbih0aGlzLCBwcm9wcyk7XG59O1xuXG5WaXNpdG9yLmRlZiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIF9hc3NpZ24odGhpcy5wcm90b3R5cGUsIG9wdGlvbnMpO1xufTtcblxuVmlzaXRvci5leHRlbmQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB2YXIgY3VyVHlwZSA9IHRoaXM7XG4gIHZhciBzdWJUeXBlID0gZnVuY3Rpb24gSFRNTFZpc2l0b3JTdWJ0eXBlKC8qYXJndW1lbnRzKi8pIHtcbiAgICBWaXNpdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG4gIHN1YlR5cGUucHJvdG90eXBlID0gbmV3IGN1clR5cGU7XG4gIHN1YlR5cGUuZXh0ZW5kID0gY3VyVHlwZS5leHRlbmQ7XG4gIHN1YlR5cGUuZGVmID0gY3VyVHlwZS5kZWY7XG4gIGlmIChvcHRpb25zKVxuICAgIF9hc3NpZ24oc3ViVHlwZS5wcm90b3R5cGUsIG9wdGlvbnMpO1xuICByZXR1cm4gc3ViVHlwZTtcbn07XG5cblZpc2l0b3IuZGVmKHtcbiAgdmlzaXQ6IGZ1bmN0aW9uIChjb250ZW50LyosIC4uLiovKSB7XG4gICAgaWYgKGNvbnRlbnQgPT0gbnVsbClcbiAgICAgIC8vIG51bGwgb3IgdW5kZWZpbmVkLlxuICAgICAgcmV0dXJuIHRoaXMudmlzaXROdWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRlbnQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoY29udGVudC5odG1sanNUeXBlKSB7XG4gICAgICAgIHN3aXRjaCAoY29udGVudC5odG1sanNUeXBlKSB7XG4gICAgICAgIGNhc2UgVGFnLmh0bWxqc1R5cGU6XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUYWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgY2FzZSBDaGFyUmVmLmh0bWxqc1R5cGU6XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDaGFyUmVmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNhc2UgQ29tbWVudC5odG1sanNUeXBlOlxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q29tbWVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBjYXNlIFJhdy5odG1sanNUeXBlOlxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0UmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBodG1sanMgdHlwZTogXCIgKyBjb250ZW50Lmh0bWxqc1R5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0FycmF5KGNvbnRlbnQpKVxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEFycmF5LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgIHJldHVybiB0aGlzLnZpc2l0T2JqZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB9IGVsc2UgaWYgKCh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHx8XG4gICAgICAgICAgICAgICAodHlwZW9mIGNvbnRlbnQgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAgICAgICh0eXBlb2YgY29udGVudCA9PT0gJ251bWJlcicpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdFByaW1pdGl2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRGdW5jdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgb2JqZWN0IGluIGh0bWxqczogXCIgKyBjb250ZW50KTtcblxuICB9LFxuICB2aXNpdE51bGw6IGZ1bmN0aW9uIChudWxsT3JVbmRlZmluZWQvKiwgLi4uKi8pIHt9LFxuICB2aXNpdFByaW1pdGl2ZTogZnVuY3Rpb24gKHN0cmluZ0Jvb2xlYW5Pck51bWJlci8qLCAuLi4qLykge30sXG4gIHZpc2l0QXJyYXk6IGZ1bmN0aW9uIChhcnJheS8qLCAuLi4qLykge30sXG4gIHZpc2l0Q29tbWVudDogZnVuY3Rpb24gKGNvbW1lbnQvKiwgLi4uKi8pIHt9LFxuICB2aXNpdENoYXJSZWY6IGZ1bmN0aW9uIChjaGFyUmVmLyosIC4uLiovKSB7fSxcbiAgdmlzaXRSYXc6IGZ1bmN0aW9uIChyYXcvKiwgLi4uKi8pIHt9LFxuICB2aXNpdFRhZzogZnVuY3Rpb24gKHRhZy8qLCAuLi4qLykge30sXG4gIHZpc2l0T2JqZWN0OiBmdW5jdGlvbiAob2JqLyosIC4uLiovKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBvYmplY3QgaW4gaHRtbGpzOiBcIiArIG9iaik7XG4gIH0sXG4gIHZpc2l0RnVuY3Rpb246IGZ1bmN0aW9uIChmbi8qLCAuLi4qLykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgZnVuY3Rpb24gaW4gaHRtbGpzOiBcIiArIGZuKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBjb25zdCBUcmFuc2Zvcm1pbmdWaXNpdG9yID0gVmlzaXRvci5leHRlbmQoKTtcblRyYW5zZm9ybWluZ1Zpc2l0b3IuZGVmKHtcbiAgdmlzaXROdWxsOiBJREVOVElUWSxcbiAgdmlzaXRQcmltaXRpdmU6IElERU5USVRZLFxuICB2aXNpdEFycmF5OiBmdW5jdGlvbiAoYXJyYXksIC4uLmFyZ3MpIHtcbiAgICB2YXIgcmVzdWx0ID0gYXJyYXk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG9sZEl0ZW0gPSBhcnJheVtpXTtcbiAgICAgIHZhciBuZXdJdGVtID0gdGhpcy52aXNpdChvbGRJdGVtLCAuLi5hcmdzKTtcbiAgICAgIGlmIChuZXdJdGVtICE9PSBvbGRJdGVtKSB7XG4gICAgICAgIC8vIGNvcHkgYGFycmF5YCBvbiB3cml0ZVxuICAgICAgICBpZiAocmVzdWx0ID09PSBhcnJheSlcbiAgICAgICAgICByZXN1bHQgPSBhcnJheS5zbGljZSgpO1xuICAgICAgICByZXN1bHRbaV0gPSBuZXdJdGVtO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuICB2aXNpdENvbW1lbnQ6IElERU5USVRZLFxuICB2aXNpdENoYXJSZWY6IElERU5USVRZLFxuICB2aXNpdFJhdzogSURFTlRJVFksXG4gIHZpc2l0T2JqZWN0OiBmdW5jdGlvbihvYmosIC4uLmFyZ3Mpe1xuICAgIC8vIERvbid0IHBhcnNlIE1hcmtkb3duICYgUkNEYXRhIGFzIEhUTUxcbiAgICBpZiAob2JqLnRleHRNb2RlICE9IG51bGwpe1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYgKCdjb250ZW50JyBpbiBvYmopIHtcbiAgICAgIG9iai5jb250ZW50ID0gdGhpcy52aXNpdChvYmouY29udGVudCwgLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICgnZWxzZUNvbnRlbnQnIGluIG9iail7XG4gICAgICBvYmouZWxzZUNvbnRlbnQgPSB0aGlzLnZpc2l0KG9iai5lbHNlQ29udGVudCwgLi4uYXJncyk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sXG4gIHZpc2l0RnVuY3Rpb246IElERU5USVRZLFxuICB2aXNpdFRhZzogZnVuY3Rpb24gKHRhZywgLi4uYXJncykge1xuICAgIHZhciBvbGRDaGlsZHJlbiA9IHRhZy5jaGlsZHJlbjtcbiAgICB2YXIgbmV3Q2hpbGRyZW4gPSB0aGlzLnZpc2l0Q2hpbGRyZW4ob2xkQ2hpbGRyZW4sIC4uLmFyZ3MpO1xuXG4gICAgdmFyIG9sZEF0dHJzID0gdGFnLmF0dHJzO1xuICAgIHZhciBuZXdBdHRycyA9IHRoaXMudmlzaXRBdHRyaWJ1dGVzKG9sZEF0dHJzLCAuLi5hcmdzKTtcblxuICAgIGlmIChuZXdBdHRycyA9PT0gb2xkQXR0cnMgJiYgbmV3Q2hpbGRyZW4gPT09IG9sZENoaWxkcmVuKVxuICAgICAgcmV0dXJuIHRhZztcblxuICAgIHZhciBuZXdUYWcgPSBnZXRUYWcodGFnLnRhZ05hbWUpLmFwcGx5KG51bGwsIG5ld0NoaWxkcmVuKTtcbiAgICBuZXdUYWcuYXR0cnMgPSBuZXdBdHRycztcbiAgICByZXR1cm4gbmV3VGFnO1xuICB9LFxuICB2aXNpdENoaWxkcmVuOiBmdW5jdGlvbiAoY2hpbGRyZW4sIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdEFycmF5KGNoaWxkcmVuLCAuLi5hcmdzKTtcbiAgfSxcbiAgLy8gVHJhbnNmb3JtIHRoZSBgLmF0dHJzYCBwcm9wZXJ0eSBvZiBhIHRhZywgd2hpY2ggbWF5IGJlIGEgZGljdGlvbmFyeSxcbiAgLy8gYW4gYXJyYXksIG9yIGluIHNvbWUgdXNlcywgYSBmb3JlaWduIG9iamVjdCAoc3VjaCBhc1xuICAvLyBhIHRlbXBsYXRlIHRhZykuXG4gIHZpc2l0QXR0cmlidXRlczogZnVuY3Rpb24gKGF0dHJzLCAuLi5hcmdzKSB7XG4gICAgLy8gQWxsb3cgUHJvbWlzZS1saWtlIHZhbHVlcyBoZXJlOyB0aGVzZSB3aWxsIGJlIGhhbmRsZWQgaW4gbWF0ZXJpYWxpemVyLlxuICAgIGlmIChpc1Byb21pc2VMaWtlKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzO1xuICAgIH1cblxuICAgIGlmIChpc0FycmF5KGF0dHJzKSkge1xuICAgICAgdmFyIHJlc3VsdCA9IGF0dHJzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb2xkSXRlbSA9IGF0dHJzW2ldO1xuICAgICAgICB2YXIgbmV3SXRlbSA9IHRoaXMudmlzaXRBdHRyaWJ1dGVzKG9sZEl0ZW0sIC4uLmFyZ3MpO1xuICAgICAgICBpZiAobmV3SXRlbSAhPT0gb2xkSXRlbSkge1xuICAgICAgICAgIC8vIGNvcHkgb24gd3JpdGVcbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBhdHRycylcbiAgICAgICAgICAgIHJlc3VsdCA9IGF0dHJzLnNsaWNlKCk7XG4gICAgICAgICAgcmVzdWx0W2ldID0gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBpZiAoYXR0cnMgJiYgaXNDb25zdHJ1Y3RlZE9iamVjdChhdHRycykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBiYXNpYyBUcmFuc2Zvcm1pbmdWaXNpdG9yIGRvZXMgbm90IHN1cHBvcnQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgIFwiZm9yZWlnbiBvYmplY3RzIGluIGF0dHJpYnV0ZXMuICBEZWZpbmUgYSBjdXN0b20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgIFwidmlzaXRBdHRyaWJ1dGVzIGZvciB0aGlzIGNhc2UuXCIpO1xuICAgIH1cblxuICAgIHZhciBvbGRBdHRycyA9IGF0dHJzO1xuICAgIHZhciBuZXdBdHRycyA9IG9sZEF0dHJzO1xuICAgIGlmIChvbGRBdHRycykge1xuICAgICAgdmFyIGF0dHJBcmdzID0gW251bGwsIG51bGxdO1xuICAgICAgYXR0ckFyZ3MucHVzaC5hcHBseShhdHRyQXJncywgYXJndW1lbnRzKTtcbiAgICAgIGZvciAodmFyIGsgaW4gb2xkQXR0cnMpIHtcbiAgICAgICAgdmFyIG9sZFZhbHVlID0gb2xkQXR0cnNba107XG4gICAgICAgIGF0dHJBcmdzWzBdID0gaztcbiAgICAgICAgYXR0ckFyZ3NbMV0gPSBvbGRWYWx1ZTtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy52aXNpdEF0dHJpYnV0ZS5hcHBseSh0aGlzLCBhdHRyQXJncyk7XG4gICAgICAgIGlmIChuZXdWYWx1ZSAhPT0gb2xkVmFsdWUpIHtcbiAgICAgICAgICAvLyBjb3B5IG9uIHdyaXRlXG4gICAgICAgICAgaWYgKG5ld0F0dHJzID09PSBvbGRBdHRycylcbiAgICAgICAgICAgIG5ld0F0dHJzID0gX2Fzc2lnbih7fSwgb2xkQXR0cnMpO1xuICAgICAgICAgIG5ld0F0dHJzW2tdID0gbmV3VmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3QXR0cnM7XG4gIH0sXG4gIC8vIFRyYW5zZm9ybSB0aGUgdmFsdWUgb2Ygb25lIGF0dHJpYnV0ZSBuYW1lL3ZhbHVlIGluIGFuXG4gIC8vIGF0dHJpYnV0ZXMgZGljdGlvbmFyeS5cbiAgdmlzaXRBdHRyaWJ1dGU6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgdGFnLCAuLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXQodmFsdWUsIC4uLmFyZ3MpO1xuICB9XG59KTtcblxuXG5leHBvcnQgY29uc3QgVG9UZXh0VmlzaXRvciA9IFZpc2l0b3IuZXh0ZW5kKCk7XG5Ub1RleHRWaXNpdG9yLmRlZih7XG4gIHZpc2l0TnVsbDogZnVuY3Rpb24gKG51bGxPclVuZGVmaW5lZCkge1xuICAgIHJldHVybiAnJztcbiAgfSxcbiAgdmlzaXRQcmltaXRpdmU6IGZ1bmN0aW9uIChzdHJpbmdCb29sZWFuT3JOdW1iZXIpIHtcbiAgICB2YXIgc3RyID0gU3RyaW5nKHN0cmluZ0Jvb2xlYW5Pck51bWJlcik7XG4gICAgaWYgKHRoaXMudGV4dE1vZGUgPT09IFRFWFRNT0RFLlJDREFUQSkge1xuICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudGV4dE1vZGUgPT09IFRFWFRNT0RFLkFUVFJJQlVURSkge1xuICAgICAgLy8gZXNjYXBlIGAmYCBhbmQgYFwiYCB0aGlzIHRpbWUsIG5vdCBgJmAgYW5kIGA8YFxuICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gIH0sXG4gIHZpc2l0QXJyYXk6IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspXG4gICAgICBwYXJ0cy5wdXNoKHRoaXMudmlzaXQoYXJyYXlbaV0pKTtcbiAgICByZXR1cm4gcGFydHMuam9pbignJyk7XG4gIH0sXG4gIHZpc2l0Q29tbWVudDogZnVuY3Rpb24gKGNvbW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBoYXZlIGEgY29tbWVudCBoZXJlXCIpO1xuICB9LFxuICB2aXNpdENoYXJSZWY6IGZ1bmN0aW9uIChjaGFyUmVmKSB7XG4gICAgaWYgKHRoaXMudGV4dE1vZGUgPT09IFRFWFRNT0RFLlJDREFUQSB8fFxuICAgICAgICB0aGlzLnRleHRNb2RlID09PSBURVhUTU9ERS5BVFRSSUJVVEUpIHtcbiAgICAgIHJldHVybiBjaGFyUmVmLmh0bWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjaGFyUmVmLnN0cjtcbiAgICB9XG4gIH0sXG4gIHZpc2l0UmF3OiBmdW5jdGlvbiAocmF3KSB7XG4gICAgcmV0dXJuIHJhdy52YWx1ZTtcbiAgfSxcbiAgdmlzaXRUYWc6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICAvLyBSZWFsbHkgd2Ugc2hvdWxkIGp1c3QgZGlzYWxsb3cgVGFncyBoZXJlLiAgSG93ZXZlciwgYXQgdGhlXG4gICAgLy8gbW9tZW50IGl0J3MgdXNlZnVsIHRvIHN0cmluZ2lmeSBhbnkgSFRNTCB3ZSBmaW5kLiAgSW5cbiAgICAvLyBwYXJ0aWN1bGFyLCB3aGVuIHlvdSBpbmNsdWRlIGEgdGVtcGxhdGUgd2l0aGluIGB7eyNtYXJrZG93bn19YCxcbiAgICAvLyB3ZSByZW5kZXIgdGhlIHRlbXBsYXRlIGFzIHRleHQsIGFuZCBzaW5jZSB0aGVyZSdzIGN1cnJlbnRseVxuICAgIC8vIG5vIHdheSB0byBtYWtlIHRoZSB0ZW1wbGF0ZSBiZSAqcGFyc2VkKiBhcyB0ZXh0IChlLmcuIGA8dGVtcGxhdGVcbiAgICAvLyB0eXBlPVwidGV4dFwiPmApLCB3ZSBoYWNraXNobHkgc3VwcG9ydCBIVE1MIHRhZ3MgaW4gbWFya2Rvd25cbiAgICAvLyBpbiB0ZW1wbGF0ZXMgYnkgcGFyc2luZyB0aGVtIGFuZCBzdHJpbmdpZnlpbmcgdGhlbS5cbiAgICByZXR1cm4gdGhpcy52aXNpdCh0aGlzLnRvSFRNTCh0YWcpKTtcbiAgfSxcbiAgdmlzaXRPYmplY3Q6IGZ1bmN0aW9uICh4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBvYmplY3QgaW4gaHRtbGpzIGluIHRvVGV4dDogXCIgKyB4KTtcbiAgfSxcbiAgdG9IVE1MOiBmdW5jdGlvbiAobm9kZSkge1xuICAgIHJldHVybiB0b0hUTUwobm9kZSk7XG4gIH1cbn0pO1xuXG5cblxuZXhwb3J0IGNvbnN0IFRvSFRNTFZpc2l0b3IgPSBWaXNpdG9yLmV4dGVuZCgpO1xuVG9IVE1MVmlzaXRvci5kZWYoe1xuICB2aXNpdE51bGw6IGZ1bmN0aW9uIChudWxsT3JVbmRlZmluZWQpIHtcbiAgICByZXR1cm4gJyc7XG4gIH0sXG4gIHZpc2l0UHJpbWl0aXZlOiBmdW5jdGlvbiAoc3RyaW5nQm9vbGVhbk9yTnVtYmVyKSB7XG4gICAgdmFyIHN0ciA9IFN0cmluZyhzdHJpbmdCb29sZWFuT3JOdW1iZXIpO1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7Jyk7XG4gIH0sXG4gIHZpc2l0QXJyYXk6IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspXG4gICAgICBwYXJ0cy5wdXNoKHRoaXMudmlzaXQoYXJyYXlbaV0pKTtcbiAgICByZXR1cm4gcGFydHMuam9pbignJyk7XG4gIH0sXG4gIHZpc2l0Q29tbWVudDogZnVuY3Rpb24gKGNvbW1lbnQpIHtcbiAgICByZXR1cm4gJzwhLS0nICsgY29tbWVudC5zYW5pdGl6ZWRWYWx1ZSArICctLT4nO1xuICB9LFxuICB2aXNpdENoYXJSZWY6IGZ1bmN0aW9uIChjaGFyUmVmKSB7XG4gICAgcmV0dXJuIGNoYXJSZWYuaHRtbDtcbiAgfSxcbiAgdmlzaXRSYXc6IGZ1bmN0aW9uIChyYXcpIHtcbiAgICByZXR1cm4gcmF3LnZhbHVlO1xuICB9LFxuICB2aXNpdFRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgIHZhciBhdHRyU3RycyA9IFtdO1xuXG4gICAgdmFyIHRhZ05hbWUgPSB0YWcudGFnTmFtZTtcbiAgICB2YXIgY2hpbGRyZW4gPSB0YWcuY2hpbGRyZW47XG5cbiAgICB2YXIgYXR0cnMgPSB0YWcuYXR0cnM7XG4gICAgaWYgKGF0dHJzKSB7XG4gICAgICBhdHRycyA9IGZsYXR0ZW5BdHRyaWJ1dGVzKGF0dHJzKTtcbiAgICAgIGZvciAodmFyIGsgaW4gYXR0cnMpIHtcbiAgICAgICAgaWYgKGsgPT09ICd2YWx1ZScgJiYgdGFnTmFtZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgICAgIGNoaWxkcmVuID0gW2F0dHJzW2tdLCBjaGlsZHJlbl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHYgPSB0aGlzLnRvVGV4dChhdHRyc1trXSwgVEVYVE1PREUuQVRUUklCVVRFKTtcbiAgICAgICAgICBhdHRyU3Rycy5wdXNoKCcgJyArIGsgKyAnPVwiJyArIHYgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdGFydFRhZyA9ICc8JyArIHRhZ05hbWUgKyBhdHRyU3Rycy5qb2luKCcnKSArICc+JztcblxuICAgIHZhciBjaGlsZFN0cnMgPSBbXTtcbiAgICB2YXIgY29udGVudDtcbiAgICBpZiAodGFnTmFtZSA9PT0gJ3RleHRhcmVhJykge1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxuICAgICAgICBjaGlsZFN0cnMucHVzaCh0aGlzLnRvVGV4dChjaGlsZHJlbltpXSwgVEVYVE1PREUuUkNEQVRBKSk7XG5cbiAgICAgIGNvbnRlbnQgPSBjaGlsZFN0cnMuam9pbignJyk7XG4gICAgICBpZiAoY29udGVudC5zbGljZSgwLCAxKSA9PT0gJ1xcbicpXG4gICAgICAgIC8vIFRFWFRBUkVBIHdpbGwgYWJzb3JiIGEgbmV3bGluZSwgc28gaWYgd2Ugc2VlIG9uZSwgYWRkXG4gICAgICAgIC8vIGFub3RoZXIgb25lLlxuICAgICAgICBjb250ZW50ID0gJ1xcbicgKyBjb250ZW50O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG4gICAgICAgIGNoaWxkU3Rycy5wdXNoKHRoaXMudmlzaXQoY2hpbGRyZW5baV0pKTtcblxuICAgICAgY29udGVudCA9IGNoaWxkU3Rycy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gc3RhcnRUYWcgKyBjb250ZW50O1xuXG4gICAgaWYgKGNoaWxkcmVuLmxlbmd0aCB8fCAhIGlzVm9pZEVsZW1lbnQodGFnTmFtZSkpIHtcbiAgICAgIC8vIFwiVm9pZFwiIGVsZW1lbnRzIGxpa2UgQlIgYXJlIHRoZSBvbmx5IG9uZXMgdGhhdCBkb24ndCBnZXQgYSBjbG9zZVxuICAgICAgLy8gdGFnIGluIEhUTUw1LiAgVGhleSBzaG91bGRuJ3QgaGF2ZSBjb250ZW50cywgZWl0aGVyLCBzbyB3ZSBjb3VsZFxuICAgICAgLy8gdGhyb3cgYW4gZXJyb3IgdXBvbiBzZWVpbmcgY29udGVudHMgaGVyZS5cbiAgICAgIHJlc3VsdCArPSAnPC8nICsgdGFnTmFtZSArICc+JztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuICB2aXNpdE9iamVjdDogZnVuY3Rpb24gKHgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIG9iamVjdCBpbiBodG1sanMgaW4gdG9IVE1MOiBcIiArIHgpO1xuICB9LFxuICB0b1RleHQ6IGZ1bmN0aW9uIChub2RlLCB0ZXh0TW9kZSkge1xuICAgIHJldHVybiB0b1RleHQobm9kZSwgdGV4dE1vZGUpO1xuICB9XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBUT0hUTUxcblxuZXhwb3J0IGZ1bmN0aW9uIHRvSFRNTChjb250ZW50KSB7XG4gIHJldHVybiAobmV3IFRvSFRNTFZpc2l0b3IpLnZpc2l0KGNvbnRlbnQpO1xufVxuXG4vLyBFc2NhcGluZyBtb2RlcyBmb3Igb3V0cHV0dGluZyB0ZXh0IHdoZW4gZ2VuZXJhdGluZyBIVE1MLlxuZXhwb3J0IGNvbnN0IFRFWFRNT0RFID0ge1xuICBTVFJJTkc6IDEsXG4gIFJDREFUQTogMixcbiAgQVRUUklCVVRFOiAzXG59O1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB0b1RleHQoY29udGVudCwgdGV4dE1vZGUpIHtcbiAgaWYgKCEgdGV4dE1vZGUpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwidGV4dE1vZGUgcmVxdWlyZWQgZm9yIEhUTUwudG9UZXh0XCIpO1xuICBpZiAoISAodGV4dE1vZGUgPT09IFRFWFRNT0RFLlNUUklORyB8fFxuICAgICAgICAgdGV4dE1vZGUgPT09IFRFWFRNT0RFLlJDREFUQSB8fFxuICAgICAgICAgdGV4dE1vZGUgPT09IFRFWFRNT0RFLkFUVFJJQlVURSkpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0ZXh0TW9kZTogXCIgKyB0ZXh0TW9kZSk7XG5cbiAgdmFyIHZpc2l0b3IgPSBuZXcgVG9UZXh0VmlzaXRvcih7dGV4dE1vZGU6IHRleHRNb2RlfSk7XG4gIHJldHVybiB2aXNpdG9yLnZpc2l0KGNvbnRlbnQpO1xufVxuIl19
