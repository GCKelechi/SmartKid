Package["core-runtime"].queue("blaze",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var check = Package.check.check;
var Match = Package.check.Match;
var ObserveSequence = Package['observe-sequence'].ObserveSequence;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var OrderedDict = Package['ordered-dict'].OrderedDict;
var ECMAScript = Package.ecmascript.ECMAScript;
var HTML = Package.htmljs.HTML;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Blaze, UI, Handlebars;

var require = meteorInstall({"node_modules":{"meteor":{"blaze":{"preamble.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/preamble.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**
 * @namespace Blaze
 * @summary The namespace for all Blaze-related methods and classes.
 */
Blaze = {};

// Utility to HTML-escape a string.  Included for legacy reasons.
// TODO: Should be replaced with _.escape once underscore is upgraded to a newer
//       version which escapes ` (backtick) as well. Underscore 1.5.2 does not.
Blaze._escape = function () {
  const escape_map = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    /* IE allows backtick-delimited attributes?? */
    "&": "&amp;"
  };
  const escape_one = function (c) {
    return escape_map[c];
  };
  return function (x) {
    return x.replace(/[&<>"'`]/g, escape_one);
  };
}();
Blaze._warn = function (msg) {
  msg = 'Warning: ' + msg;
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(msg);
  }
};
const nativeBind = Function.prototype.bind;

// An implementation of _.bind which allows better optimization.
// See: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
if (nativeBind) {
  Blaze._bind = function (func, obj) {
    for (var _len = arguments.length, rest = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      rest[_key - 2] = arguments[_key];
    }
    if (arguments.length === 2) {
      return nativeBind.call(func, obj);
    }
    const args = [obj, ...rest];
    return nativeBind.apply(func, args);
  };
} else {
  // A slower but backwards compatible version.
  Blaze._bind = function (objA, objB) {
    objA.bind(objB);
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"exceptions.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/exceptions.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let debugFunc;

// We call into user code in many places, and it's nice to catch exceptions
// propagated from user code immediately so that the whole system doesn't just
// break.  Catching exceptions is easy; reporting them is hard.  This helper
// reports exceptions.
//
// Usage:
//
// ```
// try {
//   // ... someStuff ...
// } catch (e) {
//   reportUIException(e);
// }
// ```
//
// An optional second argument overrides the default message.

// Set this to `true` to cause `reportException` to throw
// the next exception rather than reporting it.  This is
// useful in unit tests that test error messages.
Blaze._throwNextException = false;
Blaze._reportException = function (e, msg) {
  if (Blaze._throwNextException) {
    Blaze._throwNextException = false;
    throw e;
  }
  if (!debugFunc)
    // adapted from Tracker
    debugFunc = function () {
      return typeof Meteor !== "undefined" ? Meteor._debug : typeof console !== "undefined" && console.log ? console.log : function () {};
    };

  // In Chrome, `e.stack` is a multiline string that starts with the message
  // and contains a stack trace.  Furthermore, `console.log` makes it clickable.
  // `console.log` supplies the space between the two arguments.
  debugFunc()(msg || 'Exception caught in template:', e.stack || e.message || e);
};

// It's meant to be used in `Promise` chains to report the error while not
// "swallowing" it (i.e., the chain will still reject).
Blaze._reportExceptionAndThrow = function (error) {
  Blaze._reportException(error);
  throw error;
};
Blaze._wrapCatchingExceptions = function (f, where) {
  if (typeof f !== 'function') return f;
  return function () {
    try {
      for (var _len = arguments.length, _arguments = new Array(_len), _key = 0; _key < _len; _key++) {
        _arguments[_key] = arguments[_key];
      }
      return f.apply(this, _arguments);
    } catch (e) {
      Blaze._reportException(e, 'Exception in ' + where + ':');
    }
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"view.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/view.js                                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let HTML;
    module.link("meteor/htmljs", {
      HTML(v) {
        HTML = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    /**
     * A binding is either `undefined` (pending), `{ error }` (rejected), or
     * `{ value }` (resolved). Synchronous values are immediately resolved (i.e.,
     * `{ value }` is used). The other states are reserved for asynchronous bindings
     * (i.e., values wrapped with `Promise`s).
     * @typedef {{ error: unknown } | { value: unknown } | undefined} Binding
     */

    /**
     * @class
     * @summary Constructor for a View, which represents a reactive region of DOM.
     * @locus Client
     * @param {String} [name] Optional.  A name for this type of View.  See [`view.name`](#view_name).
     * @param {Function} renderFunction A function that returns [*renderable content*](#Renderable-Content).  In this function, `this` is bound to the View.
     */
    Blaze.View = function (name, render) {
      if (!(this instanceof Blaze.View))
        // called without `new`
        return new Blaze.View(name, render);
      if (typeof name === 'function') {
        // omitted "name" argument
        render = name;
        name = '';
      }
      this.name = name;
      this._render = render;
      this._callbacks = {
        created: null,
        rendered: null,
        destroyed: null
      };

      // Setting all properties here is good for readability,
      // and also may help Chrome optimize the code by keeping
      // the View object from changing shape too much.
      this.isCreated = false;
      this._isCreatedForExpansion = false;
      this.isRendered = false;
      this._isAttached = false;
      this.isDestroyed = false;
      this._isInRender = false;
      this.parentView = null;
      this._domrange = null;
      // This flag is normally set to false except for the cases when view's parent
      // was generated as part of expanding some syntactic sugar expressions or
      // methods.
      // Ex.: Blaze.renderWithData is an equivalent to creating a view with regular
      // Blaze.render and wrapping it into {{#with data}}{{/with}} view. Since the
      // users don't know anything about these generated parent views, Blaze needs
      // this information to be available on views to make smarter decisions. For
      // example: removing the generated parent view with the view on Blaze.remove.
      this._hasGeneratedParent = false;
      // Bindings accessible to children views (via view.lookup('name')) within the
      // closest template view.
      /** @type {Record<string, ReactiveVar<Binding>>} */
      this._scopeBindings = {};
      this.renderCount = 0;
    };
    Blaze.View.prototype._render = function () {
      return null;
    };
    Blaze.View.prototype.onViewCreated = function (cb) {
      this._callbacks.created = this._callbacks.created || [];
      this._callbacks.created.push(cb);
    };
    Blaze.View.prototype._onViewRendered = function (cb) {
      this._callbacks.rendered = this._callbacks.rendered || [];
      this._callbacks.rendered.push(cb);
    };
    Blaze.View.prototype.onViewReady = function (cb) {
      const self = this;
      const fire = function () {
        Tracker.afterFlush(function () {
          if (!self.isDestroyed) {
            Blaze._withCurrentView(self, function () {
              cb.call(self);
            });
          }
        });
      };
      self._onViewRendered(function onViewRendered() {
        if (self.isDestroyed) return;
        if (!self._domrange.attached) self._domrange.onAttached(fire);else fire();
      });
    };
    Blaze.View.prototype.onViewDestroyed = function (cb) {
      this._callbacks.destroyed = this._callbacks.destroyed || [];
      this._callbacks.destroyed.push(cb);
    };
    Blaze.View.prototype.removeViewDestroyedListener = function (cb) {
      const destroyed = this._callbacks.destroyed;
      if (!destroyed) return;
      const index = destroyed.lastIndexOf(cb);
      if (index !== -1) {
        // XXX You'd think the right thing to do would be splice, but _fireCallbacks
        // gets sad if you remove callbacks while iterating over the list.  Should
        // change this to use callback-hook or EventEmitter or something else that
        // properly supports removal.
        destroyed[index] = null;
      }
    };

    /// View#autorun(func)
    ///
    /// Sets up a Tracker autorun that is "scoped" to this View in two
    /// important ways: 1) Blaze.currentView is automatically set
    /// on every re-run, and 2) the autorun is stopped when the
    /// View is destroyed.  As with Tracker.autorun, the first run of
    /// the function is immediate, and a Computation object that can
    /// be used to stop the autorun is returned.
    ///
    /// View#autorun is meant to be called from View callbacks like
    /// onViewCreated, or from outside the rendering process.  It may not
    /// be called before the onViewCreated callbacks are fired (too early),
    /// or from a render() method (too confusing).
    ///
    /// Typically, autoruns that update the state
    /// of the View (as in Blaze.With) should be started from an onViewCreated
    /// callback.  Autoruns that update the DOM should be started
    /// from either onViewCreated (guarded against the absence of
    /// view._domrange), or onViewReady.
    Blaze.View.prototype.autorun = function (f, _inViewScope, displayName) {
      const self = this;

      // The restrictions on when View#autorun can be called are in order
      // to avoid bad patterns, like creating a Blaze.View and immediately
      // calling autorun on it.  A freshly created View is not ready to
      // have logic run on it; it doesn't have a parentView, for example.
      // It's when the View is materialized or expanded that the onViewCreated
      // handlers are fired and the View starts up.
      //
      // Letting the render() method call `this.autorun()` is problematic
      // because of re-render.  The best we can do is to stop the old
      // autorun and start a new one for each render, but that's a pattern
      // we try to avoid internally because it leads to helpers being
      // called extra times, in the case where the autorun causes the
      // view to re-render (and thus the autorun to be torn down and a
      // new one established).
      //
      // We could lift these restrictions in various ways.  One interesting
      // idea is to allow you to call `view.autorun` after instantiating
      // `view`, and automatically wrap it in `view.onViewCreated`, deferring
      // the autorun so that it starts at an appropriate time.  However,
      // then we can't return the Computation object to the caller, because
      // it doesn't exist yet.
      if (!self.isCreated) {
        throw new Error("View#autorun must be called from the created callback at the earliest");
      }
      if (this._isInRender) {
        throw new Error("Can't call View#autorun from inside render(); try calling it from the created or rendered callback");
      }
      const templateInstanceFunc = Blaze.Template._currentTemplateInstanceFunc;
      const func = function viewAutorun(c) {
        return Blaze._withCurrentView(_inViewScope || self, function () {
          return Blaze.Template._withTemplateInstanceFunc(templateInstanceFunc, function () {
            return f.call(self, c);
          });
        });
      };

      // Give the autorun function a better name for debugging and profiling.
      // The `displayName` property is not part of the spec but browsers like Chrome
      // and Firefox prefer it in debuggers over the name function was declared by.
      func.displayName = (self.name || 'anonymous') + ':' + (displayName || 'anonymous');
      const comp = Tracker.autorun(func);
      const stopComputation = function () {
        comp.stop();
      };
      self.onViewDestroyed(stopComputation);
      comp.onStop(function () {
        self.removeViewDestroyedListener(stopComputation);
      });
      return comp;
    };
    Blaze.View.prototype._errorIfShouldntCallSubscribe = function () {
      const self = this;
      if (!self.isCreated) {
        throw new Error("View#subscribe must be called from the created callback at the earliest");
      }
      if (self._isInRender) {
        throw new Error("Can't call View#subscribe from inside render(); try calling it from the created or rendered callback");
      }
      if (self.isDestroyed) {
        throw new Error("Can't call View#subscribe from inside the destroyed callback, try calling it inside created or rendered.");
      }
    };

    /**
     * Just like Blaze.View#autorun, but with Meteor.subscribe instead of
     * Tracker.autorun. Stop the subscription when the view is destroyed.
     * @return {SubscriptionHandle} A handle to the subscription so that you can
     * see if it is ready, or stop it manually
     */
    Blaze.View.prototype.subscribe = function (args, options) {
      const self = this;
      options = options || {};
      self._errorIfShouldntCallSubscribe();
      let subHandle;
      if (options.connection) {
        subHandle = options.connection.subscribe.apply(options.connection, args);
      } else {
        subHandle = Meteor.subscribe.apply(Meteor, args);
      }
      self.onViewDestroyed(function () {
        subHandle.stop();
      });
      return subHandle;
    };
    Blaze.View.prototype.firstNode = function () {
      if (!this._isAttached) throw new Error("View must be attached before accessing its DOM");
      return this._domrange.firstNode();
    };
    Blaze.View.prototype.lastNode = function () {
      if (!this._isAttached) throw new Error("View must be attached before accessing its DOM");
      return this._domrange.lastNode();
    };
    Blaze._fireCallbacks = function (view, which) {
      Blaze._withCurrentView(view, function () {
        Tracker.nonreactive(function fireCallbacks() {
          const cbs = view._callbacks[which];
          for (let i = 0, N = cbs && cbs.length; i < N; i++) cbs[i] && cbs[i].call(view);
        });
      });
    };
    Blaze._createView = function (view, parentView, forExpansion) {
      if (view.isCreated) throw new Error("Can't render the same View twice");
      view.parentView = parentView || null;
      view.isCreated = true;
      if (forExpansion) view._isCreatedForExpansion = true;
      Blaze._fireCallbacks(view, 'created');
    };
    const doFirstRender = function (view, initialContent) {
      const domrange = new Blaze._DOMRange(initialContent);
      view._domrange = domrange;
      domrange.view = view;
      view.isRendered = true;
      Blaze._fireCallbacks(view, 'rendered');
      let teardownHook = null;
      domrange.onAttached(function attached(range, element) {
        view._isAttached = true;
        teardownHook = Blaze._DOMBackend.Teardown.onElementTeardown(element, function teardown() {
          Blaze._destroyView(view, true /* _skipNodes */);
        });
      });

      // tear down the teardown hook
      view.onViewDestroyed(function () {
        if (teardownHook) teardownHook.stop();
        teardownHook = null;
      });
      return domrange;
    };

    // Take an uncreated View `view` and create and render it to DOM,
    // setting up the autorun that updates the View.  Returns a new
    // DOMRange, which has been associated with the View.
    //
    // The private arguments `_workStack` and `_intoArray` are passed in
    // by Blaze._materializeDOM and are only present for recursive calls
    // (when there is some other _materializeView on the stack).  If
    // provided, then we avoid the mutual recursion of calling back into
    // Blaze._materializeDOM so that deep View hierarchies don't blow the
    // stack.  Instead, we push tasks onto workStack for the initial
    // rendering and subsequent setup of the View, and they are done after
    // we return.  When there is a _workStack, we do not return the new
    // DOMRange, but instead push it into _intoArray from a _workStack
    // task.
    Blaze._materializeView = function (view, parentView, _workStack, _intoArray) {
      Blaze._createView(view, parentView);
      let domrange;
      let lastHtmljs;
      // We don't expect to be called in a Computation, but just in case,
      // wrap in Tracker.nonreactive.
      Tracker.nonreactive(function () {
        view.autorun(function doRender(c) {
          // `view.autorun` sets the current view.
          view.renderCount = view.renderCount + 1;
          view._isInRender = true;
          // Any dependencies that should invalidate this Computation come
          // from this line:
          const htmljs = view._render();
          view._isInRender = false;
          if (!c.firstRun && !Blaze._isContentEqual(lastHtmljs, htmljs)) {
            Tracker.nonreactive(function doMaterialize() {
              // re-render
              const rangesAndNodes = Blaze._materializeDOM(htmljs, [], view);
              domrange.setMembers(rangesAndNodes);
              Blaze._fireCallbacks(view, 'rendered');
            });
          }
          lastHtmljs = htmljs;

          // Causes any nested views to stop immediately, not when we call
          // `setMembers` the next time around the autorun.  Otherwise,
          // helpers in the DOM tree to be replaced might be scheduled
          // to re-run before we have a chance to stop them.
          Tracker.onInvalidate(function () {
            if (domrange) {
              domrange.destroyMembers();
            }
          });
        }, undefined, 'materialize');

        // first render.  lastHtmljs is the first htmljs.
        let initialContents;
        if (!_workStack) {
          initialContents = Blaze._materializeDOM(lastHtmljs, [], view);
          domrange = doFirstRender(view, initialContents);
          initialContents = null; // help GC because we close over this scope a lot
        } else {
          // We're being called from Blaze._materializeDOM, so to avoid
          // recursion and save stack space, provide a description of the
          // work to be done instead of doing it.  Tasks pushed onto
          // _workStack will be done in LIFO order after we return.
          // The work will still be done within a Tracker.nonreactive,
          // because it will be done by some call to Blaze._materializeDOM
          // (which is always called in a Tracker.nonreactive).
          initialContents = [];
          // push this function first so that it happens last
          _workStack.push(function () {
            domrange = doFirstRender(view, initialContents);
            initialContents = null; // help GC because of all the closures here
            _intoArray.push(domrange);
          });
          // now push the task that calculates initialContents
          _workStack.push(Blaze._bind(Blaze._materializeDOM, null, lastHtmljs, initialContents, view, _workStack));
        }
      });
      if (!_workStack) {
        return domrange;
      } else {
        return null;
      }
    };

    // Expands a View to HTMLjs, calling `render` recursively on all
    // Views and evaluating any dynamic attributes.  Calls the `created`
    // callback, but not the `materialized` or `rendered` callbacks.
    // Destroys the view immediately, unless called in a Tracker Computation,
    // in which case the view will be destroyed when the Computation is
    // invalidated.  If called in a Tracker Computation, the result is a
    // reactive string; that is, the Computation will be invalidated
    // if any changes are made to the view or subviews that might affect
    // the HTML.
    Blaze._expandView = function (view, parentView) {
      Blaze._createView(view, parentView, true /*forExpansion*/);
      view._isInRender = true;
      const htmljs = Blaze._withCurrentView(view, function () {
        return view._render();
      });
      view._isInRender = false;
      const result = Blaze._expand(htmljs, view);
      if (Tracker.active) {
        Tracker.onInvalidate(function () {
          Blaze._destroyView(view);
        });
      } else {
        Blaze._destroyView(view);
      }
      return result;
    };

    // Options: `parentView`
    Blaze._HTMLJSExpander = HTML.TransformingVisitor.extend();
    Blaze._HTMLJSExpander.def({
      visitObject: function (x) {
        if (x instanceof Blaze.Template) x = x.constructView();
        if (x instanceof Blaze.View) return Blaze._expandView(x, this.parentView);

        // this will throw an error; other objects are not allowed!
        return HTML.TransformingVisitor.prototype.visitObject.call(this, x);
      },
      visitAttributes: function (attrs) {
        // expand dynamic attributes
        if (typeof attrs === 'function') attrs = Blaze._withCurrentView(this.parentView, attrs);

        // call super (e.g. for case where `attrs` is an array)
        return HTML.TransformingVisitor.prototype.visitAttributes.call(this, attrs);
      },
      visitAttribute: function (name, value, tag) {
        // expand attribute values that are functions.  Any attribute value
        // that contains Views must be wrapped in a function.
        if (typeof value === 'function') value = Blaze._withCurrentView(this.parentView, value);
        return HTML.TransformingVisitor.prototype.visitAttribute.call(this, name, value, tag);
      }
    });

    // Return Blaze.currentView, but only if it is being rendered
    // (i.e. we are in its render() method).
    const currentViewIfRendering = function () {
      const view = Blaze.currentView;
      return view && view._isInRender ? view : null;
    };
    Blaze._expand = function (htmljs, parentView) {
      parentView = parentView || currentViewIfRendering();
      return new Blaze._HTMLJSExpander({
        parentView: parentView
      }).visit(htmljs);
    };
    Blaze._expandAttributes = function (attrs, parentView) {
      parentView = parentView || currentViewIfRendering();
      const expanded = new Blaze._HTMLJSExpander({
        parentView: parentView
      }).visitAttributes(attrs);
      return expanded || {};
    };
    Blaze._destroyView = function (view, _skipNodes) {
      if (view.isDestroyed) return;
      view.isDestroyed = true;

      // Destroy views and elements recursively.  If _skipNodes,
      // only recurse up to views, not elements, for the case where
      // the backend (jQuery) is recursing over the elements already.

      if (view._domrange) view._domrange.destroyMembers(_skipNodes);

      // XXX: fire callbacks after potential members are destroyed
      // otherwise it's tracker.flush will cause the above line will
      // not be called and their views won't be destroyed
      // Involved issues: DOMRange "Must be attached" error, mem leak

      Blaze._fireCallbacks(view, 'destroyed');
    };
    Blaze._destroyNode = function (node) {
      if (node.nodeType === 1) Blaze._DOMBackend.Teardown.tearDownElement(node);
    };

    // Are the HTMLjs entities `a` and `b` the same?  We could be
    // more elaborate here but the point is to catch the most basic
    // cases.
    Blaze._isContentEqual = function (a, b) {
      if (a instanceof HTML.Raw) {
        return b instanceof HTML.Raw && a.value === b.value;
      } else if (a == null) {
        return b == null;
      } else {
        return a === b && (typeof a === 'number' || typeof a === 'boolean' || typeof a === 'string');
      }
    };

    /**
     * @summary The View corresponding to the current template helper, event handler, callback, or autorun.  If there isn't one, `null`.
     * @locus Client
     * @type {Blaze.View}
     */
    Blaze.currentView = null;

    /**
     * @template T
     * @param {Blaze.View} view
     * @param {function(): T} func
     * @returns {T}
     */
    Blaze._withCurrentView = function (view, func) {
      const oldView = Blaze.currentView;
      try {
        Blaze.currentView = view;
        return func();
      } finally {
        Blaze.currentView = oldView;
      }
    };

    // Blaze.render publicly takes a View or a Template.
    // Privately, it takes any HTMLJS (extended with Views and Templates)
    // except null or undefined, or a function that returns any extended
    // HTMLJS.
    const checkRenderContent = function (content) {
      if (content === null) throw new Error("Can't render null");
      if (typeof content === 'undefined') throw new Error("Can't render undefined");
      if (content instanceof Blaze.View || content instanceof Blaze.Template || typeof content === 'function') return;
      try {
        // Throw if content doesn't look like HTMLJS at the top level
        // (i.e. verify that this is an HTML.Tag, or an array,
        // or a primitive, etc.)
        new HTML.Visitor().visit(content);
      } catch (e) {
        // Make error message suitable for public API
        throw new Error("Expected Template or View");
      }
    };

    // For Blaze.render and Blaze.toHTML, take content and
    // wrap it in a View, unless it's a single View or
    // Template already.
    const contentAsView = function (content) {
      checkRenderContent(content);
      if (content instanceof Blaze.Template) {
        return content.constructView();
      } else if (content instanceof Blaze.View) {
        return content;
      } else {
        let func = content;
        if (typeof func !== 'function') {
          func = function () {
            return content;
          };
        }
        return Blaze.View('render', func);
      }
    };

    // For Blaze.renderWithData and Blaze.toHTMLWithData, wrap content
    // in a function, if necessary, so it can be a content arg to
    // a Blaze.With.
    const contentAsFunc = function (content) {
      checkRenderContent(content);
      if (typeof content !== 'function') {
        return function () {
          return content;
        };
      } else {
        return content;
      }
    };
    Blaze.__rootViews = [];

    /**
     * @summary Renders a template or View to DOM nodes and inserts it into the DOM, returning a rendered [View](#Blaze-View) which can be passed to [`Blaze.remove`](#Blaze-remove).
     * @locus Client
     * @param {Template|Blaze.View} templateOrView The template (e.g. `Template.myTemplate`) or View object to render.  If a template, a View object is [constructed](#template_constructview).  If a View, it must be an unrendered View, which becomes a rendered View and is returned.
     * @param {DOMNode} parentNode The node that will be the parent of the rendered template.  It must be an Element node.
     * @param {DOMNode} [nextNode] Optional. If provided, must be a child of <em>parentNode</em>; the template will be inserted before this node. If not provided, the template will be inserted as the last child of parentNode.
     * @param {Blaze.View} [parentView] Optional. If provided, it will be set as the rendered View's [`parentView`](#view_parentview).
     */
    Blaze.render = function (content, parentElement, nextNode, parentView) {
      if (!parentElement) {
        Blaze._warn("Blaze.render without a parent element is deprecated. " + "You must specify where to insert the rendered content.");
      }
      if (nextNode instanceof Blaze.View) {
        // handle omitted nextNode
        parentView = nextNode;
        nextNode = null;
      }

      // parentElement must be a DOM node. in particular, can't be the
      // result of a call to `$`. Can't check if `parentElement instanceof
      // Node` since 'Node' is undefined in IE8.
      if (parentElement && typeof parentElement.nodeType !== 'number') throw new Error("'parentElement' must be a DOM node");
      if (nextNode && typeof nextNode.nodeType !== 'number')
        // 'nextNode' is optional
        throw new Error("'nextNode' must be a DOM node");
      parentView = parentView || currentViewIfRendering();
      const view = contentAsView(content);

      // TODO: this is only needed in development
      if (!parentView) {
        view.onViewCreated(function () {
          Blaze.__rootViews.push(view);
        });
        view.onViewDestroyed(function () {
          let index = Blaze.__rootViews.indexOf(view);
          if (index > -1) {
            Blaze.__rootViews.splice(index, 1);
          }
        });
      }
      Blaze._materializeView(view, parentView);
      if (parentElement) {
        view._domrange.attach(parentElement, nextNode);
      }
      return view;
    };
    Blaze.insert = function (view, parentElement, nextNode) {
      Blaze._warn("Blaze.insert has been deprecated.  Specify where to insert the " + "rendered content in the call to Blaze.render.");
      if (!(view && view._domrange instanceof Blaze._DOMRange)) throw new Error("Expected template rendered with Blaze.render");
      view._domrange.attach(parentElement, nextNode);
    };

    /**
     * @summary Renders a template or View to DOM nodes with a data context.  Otherwise identical to `Blaze.render`.
     * @locus Client
     * @param {Template|Blaze.View} templateOrView The template (e.g. `Template.myTemplate`) or View object to render.
     * @param {Object|Function} data The data context to use, or a function returning a data context.  If a function is provided, it will be reactively re-run.
     * @param {DOMNode} parentNode The node that will be the parent of the rendered template.  It must be an Element node.
     * @param {DOMNode} [nextNode] Optional. If provided, must be a child of <em>parentNode</em>; the template will be inserted before this node. If not provided, the template will be inserted as the last child of parentNode.
     * @param {Blaze.View} [parentView] Optional. If provided, it will be set as the rendered View's [`parentView`](#view_parentview).
     */
    Blaze.renderWithData = function (content, data, parentElement, nextNode, parentView) {
      // We defer the handling of optional arguments to Blaze.render.  At this point,
      // `nextNode` may actually be `parentView`.
      return Blaze.render(Blaze._TemplateWith(data, contentAsFunc(content)), parentElement, nextNode, parentView);
    };

    /**
     * @summary Removes a rendered View from the DOM, stopping all reactive updates and event listeners on it. Also destroys the Blaze.Template instance associated with the view.
     * @locus Client
     * @param {Blaze.View} renderedView The return value from `Blaze.render` or `Blaze.renderWithData`, or the `view` property of a Blaze.Template instance. Calling `Blaze.remove(Template.instance().view)` from within a template event handler will destroy the view as well as that template and trigger the template's `onDestroyed` handlers.
     */
    Blaze.remove = function (view) {
      if (!(view && view._domrange instanceof Blaze._DOMRange)) throw new Error("Expected template rendered with Blaze.render");
      while (view) {
        if (!view.isDestroyed) {
          const range = view._domrange;
          range.destroy();
          if (range.attached && !range.parentRange) {
            range.detach();
          }
        }
        view = view._hasGeneratedParent && view.parentView;
      }
    };

    /**
     * @summary Renders a template or View to a string of HTML.
     * @locus Client
     * @param {Template|Blaze.View} templateOrView The template (e.g. `Template.myTemplate`) or View object from which to generate HTML.
     */
    Blaze.toHTML = function (content, parentView) {
      parentView = parentView || currentViewIfRendering();
      return HTML.toHTML(Blaze._expandView(contentAsView(content), parentView));
    };

    /**
     * @summary Renders a template or View to HTML with a data context.  Otherwise identical to `Blaze.toHTML`.
     * @locus Client
     * @param {Template|Blaze.View} templateOrView The template (e.g. `Template.myTemplate`) or View object from which to generate HTML.
     * @param {Object|Function} data The data context to use, or a function returning a data context.
     */
    Blaze.toHTMLWithData = function (content, data, parentView) {
      parentView = parentView || currentViewIfRendering();
      return HTML.toHTML(Blaze._expandView(Blaze._TemplateWith(data, contentAsFunc(content)), parentView));
    };
    Blaze._toText = function (htmljs, parentView, textMode) {
      if (typeof htmljs === 'function') throw new Error("Blaze._toText doesn't take a function, just HTMLjs");
      if (parentView != null && !(parentView instanceof Blaze.View)) {
        // omitted parentView argument
        textMode = parentView;
        parentView = null;
      }
      parentView = parentView || currentViewIfRendering();
      if (!textMode) throw new Error("textMode required");
      if (!(textMode === HTML.TEXTMODE.STRING || textMode === HTML.TEXTMODE.RCDATA || textMode === HTML.TEXTMODE.ATTRIBUTE)) throw new Error("Unknown textMode: " + textMode);
      return HTML.toText(Blaze._expand(htmljs, parentView), textMode);
    };

    /**
     * @summary Returns the current data context, or the data context that was used when rendering a particular DOM element or View from a Meteor template.
     * @locus Client
     * @param {DOMElement|Blaze.View} [elementOrView] Optional.  An element that was rendered by a Meteor, or a View.
     */
    Blaze.getData = function (elementOrView) {
      var _theWith$dataVar$get;
      let theWith;
      if (!elementOrView) {
        theWith = Blaze.getView('with');
      } else if (elementOrView instanceof Blaze.View) {
        const view = elementOrView;
        theWith = view.name === 'with' ? view : Blaze.getView(view, 'with');
      } else if (typeof elementOrView.nodeType === 'number') {
        if (elementOrView.nodeType !== 1) throw new Error("Expected DOM element");
        theWith = Blaze.getView(elementOrView, 'with');
      } else {
        throw new Error("Expected DOM element or View");
      }
      return theWith ? (_theWith$dataVar$get = theWith.dataVar.get()) === null || _theWith$dataVar$get === void 0 ? void 0 : _theWith$dataVar$get.value : null;
    };

    // For back-compat
    Blaze.getElementData = function (element) {
      Blaze._warn("Blaze.getElementData has been deprecated.  Use " + "Blaze.getData(element) instead.");
      if (element.nodeType !== 1) throw new Error("Expected DOM element");
      return Blaze.getData(element);
    };

    // Both arguments are optional.

    /**
     * @summary Gets either the current View, or the View enclosing the given DOM element.
     * @locus Client
     * @param {DOMElement} [element] Optional.  If specified, the View enclosing `element` is returned.
     */
    Blaze.getView = function (elementOrView, _viewName) {
      let viewName = _viewName;
      if (typeof elementOrView === 'string') {
        // omitted elementOrView; viewName present
        viewName = elementOrView;
        elementOrView = null;
      }

      // We could eventually shorten the code by folding the logic
      // from the other methods into this method.
      if (!elementOrView) {
        return Blaze._getCurrentView(viewName);
      } else if (elementOrView instanceof Blaze.View) {
        return Blaze._getParentView(elementOrView, viewName);
      } else if (typeof elementOrView.nodeType === 'number') {
        return Blaze._getElementView(elementOrView, viewName);
      } else {
        throw new Error("Expected DOM element or View");
      }
    };

    // Gets the current view or its nearest ancestor of name
    // `name`.
    Blaze._getCurrentView = function (name) {
      let view = Blaze.currentView;
      // Better to fail in cases where it doesn't make sense
      // to use Blaze._getCurrentView().  There will be a current
      // view anywhere it does.  You can check Blaze.currentView
      // if you want to know whether there is one or not.
      if (!view) throw new Error("There is no current view");
      if (name) {
        while (view && view.name !== name) view = view.parentView;
        return view || null;
      } else {
        // Blaze._getCurrentView() with no arguments just returns
        // Blaze.currentView.
        return view;
      }
    };
    Blaze._getParentView = function (view, name) {
      let v = view.parentView;
      if (name) {
        while (v && v.name !== name) v = v.parentView;
      }
      return v || null;
    };
    Blaze._getElementView = function (elem, name) {
      let range = Blaze._DOMRange.forElement(elem);
      let view = null;
      while (range && !view) {
        view = range.view || null;
        if (!view) {
          if (range.parentRange) range = range.parentRange;else range = Blaze._DOMRange.forElement(range.parentElement);
        }
      }
      if (name) {
        while (view && view.name !== name) view = view.parentView;
        return view || null;
      } else {
        return view;
      }
    };
    Blaze._addEventMap = function (view, eventMap, thisInHandler) {
      thisInHandler = thisInHandler || null;
      const handles = [];
      if (!view._domrange) throw new Error("View must have a DOMRange");
      view._domrange.onAttached(function attached_eventMaps(range, element) {
        Object.keys(eventMap).forEach(function (spec) {
          let handler = eventMap[spec];
          const clauses = spec.split(/,\s+/);
          // iterate over clauses of spec, e.g. ['click .foo', 'click .bar']
          clauses.forEach(function (clause) {
            const parts = clause.split(/\s+/);
            if (parts.length === 0) return;
            const newEvents = parts.shift();
            const selector = parts.join(' ');
            handles.push(Blaze._EventSupport.listen(element, newEvents, selector, function (evt) {
              if (!range.containsElement(evt.currentTarget, selector, newEvents)) return null;
              const handlerThis = thisInHandler || this;
              const handlerArgs = arguments;
              return Blaze._withCurrentView(view, function () {
                return handler.apply(handlerThis, handlerArgs);
              });
            }, range, function (r) {
              return r.parentRange;
            }));
          });
        });
      });
      view.onViewDestroyed(function () {
        handles.forEach(function (h) {
          h.stop();
        });
        handles.length = 0;
      });
    };
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"builtins.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/builtins.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let has;
    module.link("lodash.has", {
      default(v) {
        has = v;
      }
    }, 0);
    let isObject;
    module.link("lodash.isobject", {
      default(v) {
        isObject = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    Blaze._calculateCondition = function (cond) {
      if (HTML.isArray(cond) && cond.length === 0) return false;
      return !!cond;
    };

    /**
     * @summary Constructs a View that renders content with a data context.
     * @locus Client
     * @param {Object|Function} data An object to use as the data context, or a function returning such an object.  If a
     *   function is provided, it will be reactively re-run.
     * @param {Function} contentFunc A Function that returns [*renderable content*](#Renderable-Content).
     */
    Blaze.With = function (data, contentFunc) {
      const view = Blaze.View('with', contentFunc);
      view.dataVar = null;
      view.onViewCreated(() => {
        view.dataVar = _createBinding(view, data, 'setData');
      });
      return view;
    };

    /**
     * @summary Shallow compare of two bindings.
     * @param {Binding} x
     * @param {Binding} y
     */
    function _isEqualBinding(x, y) {
      if (typeof x === 'object' && typeof y === 'object') {
        return x.error === y.error && ReactiveVar._isEqual(x.value, y.value);
      } else {
        return ReactiveVar._isEqual(x, y);
      }
    }

    /**
     * @template T
     * @param {T} x
     * @returns {T}
     */
    function _identity(x) {
      return x;
    }

    /**
     * Attaches a single binding to the instantiated view.
     * @template T, U
     * @param {ReactiveVar<U>} reactiveVar Target view.
     * @param {Promise<T> | T} value Bound value.
     * @param {function(T): U} [mapper] Maps the computed value before store.
     */
    function _setBindingValue(reactiveVar, value) {
      let mapper = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _identity;
      if (value && typeof value.then === 'function') {
        value.then(value => reactiveVar.set({
          value: mapper(value)
        }), error => reactiveVar.set({
          error
        }));
      } else {
        reactiveVar.set({
          value: mapper(value)
        });
      }
    }

    /**
     * @template T, U
     * @param {Blaze.View} view Target view.
     * @param {Promise<T> | T | function(): (Promise<T> | T)} binding Binding value or its getter.
     * @param {string} [displayName] Autorun's display name.
     * @param {function(T): U} [mapper] Maps the computed value before store.
     * @returns {ReactiveVar<U>}
     */
    function _createBinding(view, binding, displayName, mapper) {
      const reactiveVar = new ReactiveVar(undefined, _isEqualBinding);
      if (typeof binding === 'function') {
        view.autorun(() => _setBindingValue(reactiveVar, binding(), mapper), view.parentView, displayName);
      } else {
        _setBindingValue(reactiveVar, binding, mapper);
      }
      return reactiveVar;
    }

    /**
     * Attaches bindings to the instantiated view.
     * @param {Object} bindings A dictionary of bindings, each binding name
     * corresponds to a value or a function that will be reactively re-run.
     * @param {Blaze.View} view The target.
     */
    Blaze._attachBindingsToView = function (bindings, view) {
      view.onViewCreated(function () {
        Object.entries(bindings).forEach(function (_ref) {
          let [name, binding] = _ref;
          view._scopeBindings[name] = _createBinding(view, binding);
        });
      });
    };

    /**
     * @summary Constructs a View setting the local lexical scope in the block.
     * @param {Function} bindings Dictionary mapping names of bindings to
     * values or computations to reactively re-run.
     * @param {Function} contentFunc A Function that returns [*renderable content*](#Renderable-Content).
     */
    Blaze.Let = function (bindings, contentFunc) {
      var view = Blaze.View('let', contentFunc);
      Blaze._attachBindingsToView(bindings, view);
      return view;
    };

    /**
     * @summary Constructs a View that renders content conditionally.
     * @locus Client
     * @param {Function} conditionFunc A function to reactively re-run.  Whether the result is truthy or falsy determines
     *   whether `contentFunc` or `elseFunc` is shown.  An empty array is considered falsy.
     * @param {Function} contentFunc A Function that returns [*renderable content*](#Renderable-Content).
     * @param {Function} [elseFunc] Optional.  A Function that returns [*renderable content*](#Renderable-Content).  If no
     *   `elseFunc` is supplied, no content is shown in the "else" case.
     */
    Blaze.If = function (conditionFunc, contentFunc, elseFunc, _not) {
      const view = Blaze.View(_not ? 'unless' : 'if', function () {
        // Render only if the binding has a value, i.e., it's either synchronous or
        // has resolved. Rejected `Promise`s are NOT rendered.
        const condition = view.__conditionVar.get();
        if (condition && 'value' in condition) {
          return condition.value ? contentFunc() : elseFunc ? elseFunc() : null;
        }
        return null;
      });
      view.__conditionVar = null;
      view.onViewCreated(() => {
        view.__conditionVar = _createBinding(view, conditionFunc, 'condition',
        // Store only the actual condition.
        value => !Blaze._calculateCondition(value) !== !_not);
      });
      return view;
    };

    /**
     * @summary An inverted [`Blaze.If`](#Blaze-If).
     * @locus Client
     * @param {Function} conditionFunc A function to reactively re-run.  If the result is falsy, `contentFunc` is shown,
     *   otherwise `elseFunc` is shown.  An empty array is considered falsy.
     * @param {Function} contentFunc A Function that returns [*renderable content*](#Renderable-Content).
     * @param {Function} [elseFunc] Optional.  A Function that returns [*renderable content*](#Renderable-Content).  If no
     *   `elseFunc` is supplied, no content is shown in the "else" case.
     */
    Blaze.Unless = function (conditionFunc, contentFunc, elseFunc) {
      return Blaze.If(conditionFunc, contentFunc, elseFunc, true /*_not*/);
    };

    /**
     * @summary Constructs a View that renders `contentFunc` for each item in a sequence.
     * @locus Client
     * @param {Function} argFunc A function to reactively re-run. The function can
     * return one of two options:
     *
     * 1. An object with two fields: '_variable' and '_sequence'. Each iterates over
     *   '_sequence', it may be a Cursor, an array, null, or undefined. Inside the
     *   Each body you will be able to get the current item from the sequence using
     *   the name specified in the '_variable' field.
     *
     * 2. Just a sequence (Cursor, array, null, or undefined) not wrapped into an
     *   object. Inside the Each body, the current item will be set as the data
     *   context.
     * @param {Function} contentFunc A Function that returns  [*renderable
     * content*](#Renderable-Content).
     * @param {Function} [elseFunc] A Function that returns [*renderable
     * content*](#Renderable-Content) to display in the case when there are no items
     * in the sequence.
     */
    Blaze.Each = function (argFunc, contentFunc, elseFunc) {
      const eachView = Blaze.View('each', function () {
        const subviews = this.initialSubviews;
        this.initialSubviews = null;
        if (this._isCreatedForExpansion) {
          this.expandedValueDep = new Tracker.Dependency();
          this.expandedValueDep.depend();
        }
        return subviews;
      });
      eachView.initialSubviews = [];
      eachView.numItems = 0;
      eachView.inElseMode = false;
      eachView.stopHandle = null;
      eachView.contentFunc = contentFunc;
      eachView.elseFunc = elseFunc;
      eachView.argVar = undefined;
      eachView.variableName = null;

      // update the @index value in the scope of all subviews in the range
      const updateIndices = function (from, to) {
        if (to === undefined) {
          to = eachView.numItems - 1;
        }
        for (let i = from; i <= to; i++) {
          const view = eachView._domrange.members[i].view;
          view._scopeBindings['@index'].set({
            value: i
          });
        }
      };
      eachView.onViewCreated(function () {
        // We evaluate `argFunc` in `Tracker.autorun` to ensure `Blaze.currentView`
        // is always set when it runs.
        eachView.argVar = _createBinding(eachView,
        // Unwrap a sequence reactively (`{{#each x in xs}}`).
        () => {
          let maybeSequence = argFunc();
          if (isObject(maybeSequence) && has(maybeSequence, '_sequence')) {
            eachView.variableName = maybeSequence._variable || null;
            maybeSequence = maybeSequence._sequence;
          }
          return maybeSequence;
        }, 'collection');
        eachView.stopHandle = ObserveSequence.observe(function () {
          var _eachView$argVar$get;
          return (_eachView$argVar$get = eachView.argVar.get()) === null || _eachView$argVar$get === void 0 ? void 0 : _eachView$argVar$get.value;
        }, {
          addedAt: function (id, item, index) {
            Tracker.nonreactive(function () {
              let newItemView;
              if (eachView.variableName) {
                // new-style #each (as in {{#each item in items}})
                // doesn't create a new data context
                newItemView = Blaze.View('item', eachView.contentFunc);
              } else {
                newItemView = Blaze.With(item, eachView.contentFunc);
              }
              eachView.numItems++;
              const bindings = {};
              bindings['@index'] = index;
              if (eachView.variableName) {
                bindings[eachView.variableName] = item;
              }
              Blaze._attachBindingsToView(bindings, newItemView);
              if (eachView.expandedValueDep) {
                eachView.expandedValueDep.changed();
              } else if (eachView._domrange) {
                if (eachView.inElseMode) {
                  eachView._domrange.removeMember(0);
                  eachView.inElseMode = false;
                }
                const range = Blaze._materializeView(newItemView, eachView);
                eachView._domrange.addMember(range, index);
                updateIndices(index);
              } else {
                eachView.initialSubviews.splice(index, 0, newItemView);
              }
            });
          },
          removedAt: function (id, item, index) {
            Tracker.nonreactive(function () {
              eachView.numItems--;
              if (eachView.expandedValueDep) {
                eachView.expandedValueDep.changed();
              } else if (eachView._domrange) {
                eachView._domrange.removeMember(index);
                updateIndices(index);
                if (eachView.elseFunc && eachView.numItems === 0) {
                  eachView.inElseMode = true;
                  eachView._domrange.addMember(Blaze._materializeView(Blaze.View('each_else', eachView.elseFunc), eachView), 0);
                }
              } else {
                eachView.initialSubviews.splice(index, 1);
              }
            });
          },
          changedAt: function (id, newItem, oldItem, index) {
            Tracker.nonreactive(function () {
              if (eachView.expandedValueDep) {
                eachView.expandedValueDep.changed();
              } else {
                let itemView;
                if (eachView._domrange) {
                  itemView = eachView._domrange.getMember(index).view;
                } else {
                  itemView = eachView.initialSubviews[index];
                }
                if (eachView.variableName) {
                  itemView._scopeBindings[eachView.variableName].set({
                    value: newItem
                  });
                } else {
                  itemView.dataVar.set({
                    value: newItem
                  });
                }
              }
            });
          },
          movedTo: function (id, item, fromIndex, toIndex) {
            Tracker.nonreactive(function () {
              if (eachView.expandedValueDep) {
                eachView.expandedValueDep.changed();
              } else if (eachView._domrange) {
                eachView._domrange.moveMember(fromIndex, toIndex);
                updateIndices(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex));
              } else {
                const subviews = eachView.initialSubviews;
                const itemView = subviews[fromIndex];
                subviews.splice(fromIndex, 1);
                subviews.splice(toIndex, 0, itemView);
              }
            });
          }
        });
        if (eachView.elseFunc && eachView.numItems === 0) {
          eachView.inElseMode = true;
          eachView.initialSubviews[0] = Blaze.View('each_else', eachView.elseFunc);
        }
      });
      eachView.onViewDestroyed(function () {
        if (eachView.stopHandle) eachView.stopHandle.stop();
      });
      return eachView;
    };

    /**
     * Create a new `Blaze.Let` view that unwraps the given value.
     * @param {unknown} value
     * @returns {Blaze.View}
     */
    Blaze._Await = function (value) {
      return Blaze.Let({
        value
      }, Blaze._AwaitContent);
    };
    Blaze._AwaitContent = function () {
      var _Blaze$currentView$_s;
      return (_Blaze$currentView$_s = Blaze.currentView._scopeBindings.value.get()) === null || _Blaze$currentView$_s === void 0 ? void 0 : _Blaze$currentView$_s.value;
    };
    Blaze._TemplateWith = function (arg, contentFunc) {
      let w;
      let argFunc = arg;
      if (typeof arg !== 'function') {
        argFunc = function () {
          return arg;
        };
      }

      // This is a little messy.  When we compile `{{> Template.contentBlock}}`, we
      // wrap it in Blaze._InOuterTemplateScope in order to skip the intermediate
      // parent Views in the current template.  However, when there's an argument
      // (`{{> Template.contentBlock arg}}`), the argument needs to be evaluated
      // in the original scope.  There's no good order to nest
      // Blaze._InOuterTemplateScope and Blaze._TemplateWith to achieve this,
      // so we wrap argFunc to run it in the "original parentView" of the
      // Blaze._InOuterTemplateScope.
      //
      // To make this better, reconsider _InOuterTemplateScope as a primitive.
      // Longer term, evaluate expressions in the proper lexical scope.
      const wrappedArgFunc = function () {
        let viewToEvaluateArg = null;
        if (w.parentView && w.parentView.name === 'InOuterTemplateScope') {
          viewToEvaluateArg = w.parentView.originalParentView;
        }
        if (viewToEvaluateArg) {
          return Blaze._withCurrentView(viewToEvaluateArg, argFunc);
        } else {
          return argFunc();
        }
      };
      const wrappedContentFunc = function () {
        let content = contentFunc.call(this);

        // Since we are generating the Blaze._TemplateWith view for the
        // user, set the flag on the child view.  If `content` is a template,
        // construct the View so that we can set the flag.
        if (content instanceof Blaze.Template) {
          content = content.constructView();
        }
        if (content instanceof Blaze.View) {
          content._hasGeneratedParent = true;
        }
        return content;
      };
      w = Blaze.With(wrappedArgFunc, wrappedContentFunc);
      w.__isTemplateWith = true;
      return w;
    };
    Blaze._InOuterTemplateScope = function (templateView, contentFunc) {
      const view = Blaze.View('InOuterTemplateScope', contentFunc);
      let parentView = templateView.parentView;

      // Hack so that if you call `{{> foo bar}}` and it expands into
      // `{{#with bar}}{{> foo}}{{/with}}`, and then `foo` is a template
      // that inserts `{{> Template.contentBlock}}`, the data context for
      // `Template.contentBlock` is not `bar` but the one enclosing that.
      if (parentView.__isTemplateWith) parentView = parentView.parentView;
      view.onViewCreated(function () {
        this.originalParentView = this.parentView;
        this.parentView = parentView;
        this.__childDoesntStartNewLexicalScope = true;
      });
      return view;
    };
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lookup.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/lookup.js                                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let has;
    module.link("lodash.has", {
      default(v) {
        has = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    /** @param {function(Binding): boolean} fn */
    function _createBindingsHelper(fn) {
      /** @param {string[]} names */
      return function () {
        for (var _len = arguments.length, names = new Array(_len), _key = 0; _key < _len; _key++) {
          names[_key] = arguments[_key];
        }
        const view = Blaze.currentView;

        // There's either zero arguments (i.e., check all bindings) or an additional
        // "hash" argument that we have to ignore.
        names = names.length === 0
        // TODO: Should we walk up the bindings here?
        ? Object.keys(view._scopeBindings) : names.slice(0, -1);
        return names.some(name => {
          const binding = _lexicalBindingLookup(view, name);
          if (!binding) {
            throw new Error("Binding for \"".concat(name, "\" was not found."));
          }
          return fn(binding.get());
        });
      };
    }
    Blaze._globalHelpers = {
      /** @summary Check whether any of the given bindings (or all if none given) is still pending. */
      '@pending': _createBindingsHelper(binding => binding === undefined),
      /** @summary Check whether any of the given bindings (or all if none given) has rejected. */
      '@rejected': _createBindingsHelper(binding => !!binding && 'error' in binding),
      /** @summary Check whether any of the given bindings (or all if none given) has resolved. */
      '@resolved': _createBindingsHelper(binding => !!binding && 'value' in binding)
    };

    // Documented as Template.registerHelper.
    // This definition also provides back-compat for `UI.registerHelper`.
    Blaze.registerHelper = function (name, func) {
      Blaze._globalHelpers[name] = func;
    };

    // Also documented as Template.deregisterHelper
    Blaze.deregisterHelper = function (name) {
      delete Blaze._globalHelpers[name];
    };
    const bindIfIsFunction = function (x, target) {
      if (typeof x !== 'function') return x;
      return Blaze._bind(x, target);
    };

    // If `x` is a function, binds the value of `this` for that function
    // to the current data context.
    const bindDataContext = function (x) {
      if (typeof x === 'function') {
        return function () {
          let data = Blaze.getData();
          if (data == null) data = {};
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          return x.apply(data, args);
        };
      }
      return x;
    };
    Blaze._OLDSTYLE_HELPER = {};
    Blaze._getTemplateHelper = function (template, name, tmplInstanceFunc) {
      // XXX COMPAT WITH 0.9.3
      let isKnownOldStyleHelper = false;
      if (template.__helpers.has(name)) {
        const helper = template.__helpers.get(name);
        if (helper === Blaze._OLDSTYLE_HELPER) {
          isKnownOldStyleHelper = true;
        } else if (helper != null) {
          const printName = "".concat(template.viewName, " ").concat(name);
          return wrapHelper(bindDataContext(helper), tmplInstanceFunc, printName);
        } else {
          return null;
        }
      }

      // old-style helper
      if (name in template) {
        // Only warn once per helper
        if (!isKnownOldStyleHelper) {
          template.__helpers.set(name, Blaze._OLDSTYLE_HELPER);
          if (!template._NOWARN_OLDSTYLE_HELPERS) {
            Blaze._warn('Assigning helper with `' + template.viewName + '.' + name + ' = ...` is deprecated.  Use `' + template.viewName + '.helpers(...)` instead.');
          }
        }
        if (template[name] != null) {
          return wrapHelper(bindDataContext(template[name]), tmplInstanceFunc);
        }
      }
      return null;
    };
    const wrapHelper = function (f, templateFunc) {
      let name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'template helper';
      if (typeof f !== "function") {
        return f;
      }
      return function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        const self = this;
        return Blaze.Template._withTemplateInstanceFunc(templateFunc, function () {
          return Blaze._wrapCatchingExceptions(f, name).apply(self, args);
        });
      };
    };
    function _lexicalKeepGoing(currentView) {
      if (!currentView.parentView) {
        return undefined;
      }
      if (!currentView.__startsNewLexicalScope) {
        return currentView.parentView;
      }
      if (currentView.parentView.__childDoesntStartNewLexicalScope) {
        return currentView.parentView;
      }

      // in the case of {{> Template.contentBlock data}} the contentBlock loses the lexical scope of it's parent, wheras {{> Template.contentBlock}} it does not
      // this is because a #with sits between the include InOuterTemplateScope
      if (currentView.parentView.name === "with" && currentView.parentView.parentView && currentView.parentView.parentView.__childDoesntStartNewLexicalScope) {
        return currentView.parentView;
      }
      return undefined;
    }
    function _lexicalBindingLookup(view, name) {
      let currentView = view;

      // walk up the views stopping at a Spacebars.include or Template view that
      // doesn't have an InOuterTemplateScope view as a parent
      do {
        // skip block helpers views
        // if we found the binding on the scope, return it
        if (has(currentView._scopeBindings, name)) {
          return currentView._scopeBindings[name];
        }
      } while (currentView = _lexicalKeepGoing(currentView));
      return null;
    }
    Blaze._lexicalBindingLookup = function (view, name) {
      const binding = _lexicalBindingLookup(view, name);
      return binding && (() => {
        var _binding$get;
        return (_binding$get = binding.get()) === null || _binding$get === void 0 ? void 0 : _binding$get.value;
      });
    };

    // templateInstance argument is provided to be available for possible
    // alternative implementations of this function by 3rd party packages.
    Blaze._getTemplate = function (name, templateInstance) {
      if (name in Blaze.Template && Blaze.Template[name] instanceof Blaze.Template) {
        return Blaze.Template[name];
      }
      return null;
    };
    Blaze._getGlobalHelper = function (name, templateInstance) {
      if (Blaze._globalHelpers[name] != null) {
        const printName = "global helper ".concat(name);
        return wrapHelper(bindDataContext(Blaze._globalHelpers[name]), templateInstance, printName);
      }
      return null;
    };

    // Looks up a name, like "foo" or "..", as a helper of the
    // current template; the name of a template; a global helper;
    // or a property of the data context.  Called on the View of
    // a template (i.e. a View with a `.template` property,
    // where the helpers are).  Used for the first name in a
    // "path" in a template tag, like "foo" in `{{foo.bar}}` or
    // ".." in `{{frobulate ../blah}}`.
    //
    // Returns a function, a non-function value, or null.  If
    // a function is found, it is bound appropriately.
    //
    // NOTE: This function must not establish any reactive
    // dependencies itself.  If there is any reactivity in the
    // value, lookup should return a function.
    Blaze.View.prototype.lookup = function (name, _options) {
      const template = this.template;
      const lookupTemplate = _options && _options.template;
      let helper;
      let binding;
      let boundTmplInstance;
      let foundTemplate;
      if (this.templateInstance) {
        boundTmplInstance = Blaze._bind(this.templateInstance, this);
      }

      // 0. looking up the parent data context with the special "../" syntax
      if (/^\./.test(name)) {
        // starts with a dot. must be a series of dots which maps to an
        // ancestor of the appropriate height.
        if (!/^(\.)+$/.test(name)) throw new Error("id starting with dot must be a series of dots");
        return Blaze._parentData(name.length - 1, true /*_functionWrapped*/);
      }

      // 1. look up a helper on the current template
      if (template && (helper = Blaze._getTemplateHelper(template, name, boundTmplInstance)) != null) {
        return helper;
      }

      // 2. look up a binding by traversing the lexical view hierarchy inside the
      // current template
      if (template && (binding = Blaze._lexicalBindingLookup(Blaze.currentView, name)) != null) {
        return binding;
      }

      // 3. look up a template by name
      if (lookupTemplate && (foundTemplate = Blaze._getTemplate(name, boundTmplInstance)) != null) {
        return foundTemplate;
      }

      // 4. look up a global helper
      helper = Blaze._getGlobalHelper(name, boundTmplInstance);
      if (helper != null) {
        return helper;
      }

      // 5. look up in a data context
      return function () {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }
        const isCalledAsFunction = args.length > 0;
        const data = Blaze.getData();
        const x = data && data[name];
        if (!x) {
          if (lookupTemplate) {
            throw new Error("No such template: " + name);
          } else if (isCalledAsFunction) {
            throw new Error("No such function: " + name);
          } else if (name.charAt(0) === '@' && (x === null || x === undefined)) {
            // Throw an error if the user tries to use a `@directive`
            // that doesn't exist.  We don't implement all directives
            // from Handlebars, so there's a potential for confusion
            // if we fail silently.  On the other hand, we want to
            // throw late in case some app or package wants to provide
            // a missing directive.
            throw new Error("Unsupported directive: " + name);
          }
        }
        if (!data) {
          return null;
        }
        if (typeof x !== 'function') {
          if (isCalledAsFunction) {
            throw new Error("Can't call non-function: " + x);
          }
          return x;
        }
        return x.apply(data, args);
      };
    };

    // Implement Spacebars' {{../..}}.
    // @param height {Number} The number of '..'s
    Blaze._parentData = function (height, _functionWrapped) {
      var _theWith$dataVar$get2;
      // If height is null or undefined, we default to 1, the first parent.
      if (height == null) {
        height = 1;
      }
      let theWith = Blaze.getView('with');
      for (let i = 0; i < height && theWith; i++) {
        theWith = Blaze.getView(theWith, 'with');
      }
      if (!theWith) return null;
      if (_functionWrapped) return function () {
        var _theWith$dataVar$get;
        return (_theWith$dataVar$get = theWith.dataVar.get()) === null || _theWith$dataVar$get === void 0 ? void 0 : _theWith$dataVar$get.value;
      };
      return (_theWith$dataVar$get2 = theWith.dataVar.get()) === null || _theWith$dataVar$get2 === void 0 ? void 0 : _theWith$dataVar$get2.value;
    };
    Blaze.View.prototype.lookupTemplate = function (name) {
      return this.lookup(name, {
        template: true
      });
    };
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/template.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let isObject;
    module.link("lodash.isobject", {
      default(v) {
        isObject = v;
      }
    }, 0);
    let isFunction;
    module.link("lodash.isfunction", {
      default(v) {
        isFunction = v;
      }
    }, 1);
    let has;
    module.link("lodash.has", {
      default(v) {
        has = v;
      }
    }, 2);
    let isEmpty;
    module.link("lodash.isempty", {
      default(v) {
        isEmpty = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // [new] Blaze.Template([viewName], renderFunction)
    //
    // `Blaze.Template` is the class of templates, like `Template.foo` in
    // Meteor, which is `instanceof Template`.
    //
    // `viewKind` is a string that looks like "Template.foo" for templates
    // defined by the compiler.

    /**
     * @class
     * @summary Constructor for a Template, which is used to construct Views with particular name and content.
     * @locus Client
     * @param {String} [viewName] Optional.  A name for Views constructed by this Template.  See [`view.name`](#view_name).
     * @param {Function} renderFunction A function that returns [*renderable content*](#Renderable-Content).  This function is used as the `renderFunction` for Views constructed by this Template.
     */
    Blaze.Template = function (viewName, renderFunction) {
      if (!(this instanceof Blaze.Template))
        // called without `new`
        return new Blaze.Template(viewName, renderFunction);
      if (typeof viewName === 'function') {
        // omitted "viewName" argument
        renderFunction = viewName;
        viewName = '';
      }
      if (typeof viewName !== 'string') throw new Error("viewName must be a String (or omitted)");
      if (typeof renderFunction !== 'function') throw new Error("renderFunction must be a function");
      this.viewName = viewName;
      this.renderFunction = renderFunction;
      this.__helpers = new HelperMap();
      this.__eventMaps = [];
      this._callbacks = {
        created: [],
        rendered: [],
        destroyed: []
      };
    };
    const Template = Blaze.Template;
    const HelperMap = function () {};
    HelperMap.prototype.get = function (name) {
      return this[' ' + name];
    };
    HelperMap.prototype.set = function (name, helper) {
      this[' ' + name] = helper;
    };
    HelperMap.prototype.has = function (name) {
      return typeof this[' ' + name] !== 'undefined';
    };

    /**
     * @summary Returns true if `value` is a template object like `Template.myTemplate`.
     * @locus Client
     * @param {Any} value The value to test.
     */
    Blaze.isTemplate = function (t) {
      return t instanceof Blaze.Template;
    };

    /**
     * @name  onCreated
     * @instance
     * @memberOf Template
     * @summary Register a function to be called when an instance of this template is created.
     * @param {Function} callback A function to be added as a callback.
     * @locus Client
     * @importFromPackage templating
     */
    Template.prototype.onCreated = function (cb) {
      this._callbacks.created.push(cb);
    };

    /**
     * @name  onRendered
     * @instance
     * @memberOf Template
     * @summary Register a function to be called when an instance of this template is inserted into the DOM.
     * @param {Function} callback A function to be added as a callback.
     * @locus Client
     * @importFromPackage templating
     */
    Template.prototype.onRendered = function (cb) {
      this._callbacks.rendered.push(cb);
    };

    /**
     * @name  onDestroyed
     * @instance
     * @memberOf Template
     * @summary Register a function to be called when an instance of this template is removed from the DOM and destroyed.
     * @param {Function} callback A function to be added as a callback.
     * @locus Client
     * @importFromPackage templating
     */
    Template.prototype.onDestroyed = function (cb) {
      this._callbacks.destroyed.push(cb);
    };
    Template.prototype._getCallbacks = function (which) {
      const self = this;
      let callbacks = self[which] ? [self[which]] : [];
      // Fire all callbacks added with the new API (Template.onRendered())
      // as well as the old-style callback (e.g. Template.rendered) for
      // backwards-compatibility.
      callbacks = callbacks.concat(self._callbacks[which]);
      return callbacks;
    };
    const fireCallbacks = function (callbacks, template) {
      Template._withTemplateInstanceFunc(function () {
        return template;
      }, function () {
        for (let i = 0, N = callbacks.length; i < N; i++) {
          callbacks[i].call(template);
        }
      });
    };
    Template.prototype.constructView = function (contentFunc, elseFunc) {
      const self = this;
      const view = Blaze.View(self.viewName, self.renderFunction);
      view.template = self;
      view.templateContentBlock = contentFunc ? new Template('(contentBlock)', contentFunc) : null;
      view.templateElseBlock = elseFunc ? new Template('(elseBlock)', elseFunc) : null;
      if (self.__eventMaps || typeof self.events === 'object') {
        view._onViewRendered(function () {
          if (view.renderCount !== 1) return;
          if (!self.__eventMaps.length && typeof self.events === "object") {
            // Provide limited back-compat support for `.events = {...}`
            // syntax.  Pass `template.events` to the original `.events(...)`
            // function.  This code must run only once per template, in
            // order to not bind the handlers more than once, which is
            // ensured by the fact that we only do this when `__eventMaps`
            // is falsy, and we cause it to be set now.
            Template.prototype.events.call(self, self.events);
          }
          self.__eventMaps.forEach(function (m) {
            Blaze._addEventMap(view, m, view);
          });
        });
      }
      view._templateInstance = new Blaze.TemplateInstance(view);
      view.templateInstance = function () {
        // Update data, firstNode, and lastNode, and return the TemplateInstance
        // object.
        const inst = view._templateInstance;

        /**
         * @instance
         * @memberOf Blaze.TemplateInstance
         * @name  data
         * @summary The data context of this instance's latest invocation.
         * @locus Client
         */
        inst.data = Blaze.getData(view);
        if (view._domrange && !view.isDestroyed) {
          inst.firstNode = view._domrange.firstNode();
          inst.lastNode = view._domrange.lastNode();
        } else {
          // on 'created' or 'destroyed' callbacks we don't have a DomRange
          inst.firstNode = null;
          inst.lastNode = null;
        }
        return inst;
      };

      /**
       * @name  created
       * @instance
       * @memberOf Template
       * @summary Provide a callback when an instance of a template is created.
       * @locus Client
       * @deprecated in 1.1
       */
      // To avoid situations when new callbacks are added in between view
      // instantiation and event being fired, decide on all callbacks to fire
      // immediately and then fire them on the event.
      const createdCallbacks = self._getCallbacks('created');
      view.onViewCreated(function () {
        fireCallbacks(createdCallbacks, view.templateInstance());
      });

      /**
       * @name  rendered
       * @instance
       * @memberOf Template
       * @summary Provide a callback when an instance of a template is rendered.
       * @locus Client
       * @deprecated in 1.1
       */
      const renderedCallbacks = self._getCallbacks('rendered');
      view.onViewReady(function () {
        fireCallbacks(renderedCallbacks, view.templateInstance());
      });

      /**
       * @name  destroyed
       * @instance
       * @memberOf Template
       * @summary Provide a callback when an instance of a template is destroyed.
       * @locus Client
       * @deprecated in 1.1
       */
      const destroyedCallbacks = self._getCallbacks('destroyed');
      view.onViewDestroyed(function () {
        fireCallbacks(destroyedCallbacks, view.templateInstance());
      });
      return view;
    };

    /**
     * @class
     * @summary The class for template instances
     * @param {Blaze.View} view
     * @instanceName template
     */
    Blaze.TemplateInstance = function (view) {
      if (!(this instanceof Blaze.TemplateInstance))
        // called without `new`
        return new Blaze.TemplateInstance(view);
      if (!(view instanceof Blaze.View)) throw new Error("View required");
      view._templateInstance = this;

      /**
       * @name view
       * @memberOf Blaze.TemplateInstance
       * @instance
       * @summary The [View](../api/blaze.html#Blaze-View) object for this invocation of the template.
       * @locus Client
       * @type {Blaze.View}
       */
      this.view = view;
      this.data = null;

      /**
       * @name firstNode
       * @memberOf Blaze.TemplateInstance
       * @instance
       * @summary The first top-level DOM node in this template instance.
       * @locus Client
       * @type {DOMNode}
       */
      this.firstNode = null;

      /**
       * @name lastNode
       * @memberOf Blaze.TemplateInstance
       * @instance
       * @summary The last top-level DOM node in this template instance.
       * @locus Client
       * @type {DOMNode}
       */
      this.lastNode = null;

      // This dependency is used to identify state transitions in
      // _subscriptionHandles which could cause the result of
      // TemplateInstance#subscriptionsReady to change. Basically this is triggered
      // whenever a new subscription handle is added or when a subscription handle
      // is removed and they are not ready.
      this._allSubsReadyDep = new Tracker.Dependency();
      this._allSubsReady = false;
      this._subscriptionHandles = {};
    };

    /**
     * @summary Find all elements matching `selector` in this template instance, and return them as a JQuery object.
     * @locus Client
     * @param {String} selector The CSS selector to match, scoped to the template contents.
     * @returns {DOMNode[]}
     */
    Blaze.TemplateInstance.prototype.$ = function (selector) {
      const view = this.view;
      if (!view._domrange) throw new Error("Can't use $ on template instance with no DOM");
      return view._domrange.$(selector);
    };

    /**
     * @summary Find all elements matching `selector` in this template instance.
     * @locus Client
     * @param {String} selector The CSS selector to match, scoped to the template contents.
     * @returns {DOMElement[]}
     */
    Blaze.TemplateInstance.prototype.findAll = function (selector) {
      return Array.prototype.slice.call(this.$(selector));
    };

    /**
     * @summary Find one element matching `selector` in this template instance.
     * @locus Client
     * @param {String} selector The CSS selector to match, scoped to the template contents.
     * @returns {DOMElement}
     */
    Blaze.TemplateInstance.prototype.find = function (selector) {
      const result = this.$(selector);
      return result[0] || null;
    };

    /**
     * @summary A version of [Tracker.autorun](https://docs.meteor.com/api/tracker.html#Tracker-autorun) that is stopped when the template is destroyed.
     * @locus Client
     * @param {Function} runFunc The function to run. It receives one argument: a Tracker.Computation object.
     */
    Blaze.TemplateInstance.prototype.autorun = function (f) {
      return this.view.autorun(f);
    };

    /**
     * @summary A version of [Meteor.subscribe](https://docs.meteor.com/api/pubsub.html#Meteor-subscribe) that is stopped
     * when the template is destroyed.
     * @return {SubscriptionHandle} The subscription handle to the newly made
     * subscription. Call `handle.stop()` to manually stop the subscription, or
     * `handle.ready()` to find out if this particular subscription has loaded all
     * of its inital data.
     * @locus Client
     * @param {String} name Name of the subscription.  Matches the name of the
     * server's `publish()` call.
     * @param {Any} [arg1,arg2...] Optional arguments passed to publisher function
     * on server.
     * @param {Function|Object} [options] If a function is passed instead of an
     * object, it is interpreted as an `onReady` callback.
     * @param {Function} [options.onReady] Passed to [`Meteor.subscribe`](https://docs.meteor.com/api/pubsub.html#Meteor-subscribe).
     * @param {Function} [options.onStop] Passed to [`Meteor.subscribe`](https://docs.meteor.com/api/pubsub.html#Meteor-subscribe).
     * @param {DDP.Connection} [options.connection] The connection on which to make the
     * subscription.
     */
    Blaze.TemplateInstance.prototype.subscribe = function () {
      const self = this;
      const subHandles = self._subscriptionHandles;

      // Duplicate logic from Meteor.subscribe
      let options = {};
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (args.length) {
        const lastParam = args[args.length - 1];

        // Match pattern to check if the last arg is an options argument
        const lastParamOptionsPattern = {
          onReady: Match.Optional(Function),
          // XXX COMPAT WITH 1.0.3.1 onError used to exist, but now we use
          // onStop with an error callback instead.
          onError: Match.Optional(Function),
          onStop: Match.Optional(Function),
          connection: Match.Optional(Match.Any)
        };
        if (isFunction(lastParam)) {
          options.onReady = args.pop();
        } else if (lastParam && !isEmpty(lastParam) && Match.test(lastParam, lastParamOptionsPattern)) {
          options = args.pop();
        }
      }
      let subHandle;
      const oldStopped = options.onStop;
      options.onStop = function (error) {
        // When the subscription is stopped, remove it from the set of tracked
        // subscriptions to avoid this list growing without bound
        delete subHandles[subHandle.subscriptionId];

        // Removing a subscription can only change the result of subscriptionsReady
        // if we are not ready (that subscription could be the one blocking us being
        // ready).
        if (!self._allSubsReady) {
          self._allSubsReadyDep.changed();
        }
        if (oldStopped) {
          oldStopped(error);
        }
      };
      const {
        onReady,
        onError,
        onStop,
        connection
      } = options;
      const callbacks = {
        onReady,
        onError,
        onStop
      };

      // The callbacks are passed as the last item in the arguments array passed to
      // View#subscribe
      args.push(callbacks);

      // View#subscribe takes the connection as one of the options in the last
      // argument
      subHandle = self.view.subscribe.call(self.view, args, {
        connection: connection
      });
      if (!has(subHandles, subHandle.subscriptionId)) {
        subHandles[subHandle.subscriptionId] = subHandle;

        // Adding a new subscription will always cause us to transition from ready
        // to not ready, but if we are already not ready then this can't make us
        // ready.
        if (self._allSubsReady) {
          self._allSubsReadyDep.changed();
        }
      }
      return subHandle;
    };

    /**
     * @summary A reactive function that returns true when all of the subscriptions
     * called with [this.subscribe](#TemplateInstance-subscribe) are ready.
     * @return {Boolean} True if all subscriptions on this template instance are
     * ready.
     */
    Blaze.TemplateInstance.prototype.subscriptionsReady = function () {
      this._allSubsReadyDep.depend();
      this._allSubsReady = Object.values(this._subscriptionHandles).every(handle => {
        return handle.ready();
      });
      return this._allSubsReady;
    };

    /**
     * @summary Specify template helpers available to this template.
     * @locus Client
     * @param {Object} helpers Dictionary of helper functions by name.
     * @importFromPackage templating
     */
    Template.prototype.helpers = function (dict) {
      if (!isObject(dict)) {
        throw new Error("Helpers dictionary has to be an object");
      }
      for (let k in dict) this.__helpers.set(k, dict[k]);
    };
    const canUseGetters = function () {
      if (Object.defineProperty) {
        let obj = {};
        try {
          Object.defineProperty(obj, "self", {
            get: function () {
              return obj;
            }
          });
        } catch (e) {
          return false;
        }
        return obj.self === obj;
      }
      return false;
    }();
    if (canUseGetters) {
      // Like Blaze.currentView but for the template instance. A function
      // rather than a value so that not all helpers are implicitly dependent
      // on the current template instance's `data` property, which would make
      // them dependent on the data context of the template inclusion.
      let currentTemplateInstanceFunc = null;

      // If getters are supported, define this property with a getter function
      // to make it effectively read-only, and to work around this bizarre JSC
      // bug: https://github.com/meteor/meteor/issues/9926
      Object.defineProperty(Template, "_currentTemplateInstanceFunc", {
        get: function () {
          return currentTemplateInstanceFunc;
        }
      });
      Template._withTemplateInstanceFunc = function (templateInstanceFunc, func) {
        if (typeof func !== 'function') {
          throw new Error("Expected function, got: " + func);
        }
        const oldTmplInstanceFunc = currentTemplateInstanceFunc;
        try {
          currentTemplateInstanceFunc = templateInstanceFunc;
          return func();
        } finally {
          currentTemplateInstanceFunc = oldTmplInstanceFunc;
        }
      };
    } else {
      // If getters are not supported, just use a normal property.
      Template._currentTemplateInstanceFunc = null;
      Template._withTemplateInstanceFunc = function (templateInstanceFunc, func) {
        if (typeof func !== 'function') {
          throw new Error("Expected function, got: " + func);
        }
        const oldTmplInstanceFunc = Template._currentTemplateInstanceFunc;
        try {
          Template._currentTemplateInstanceFunc = templateInstanceFunc;
          return func();
        } finally {
          Template._currentTemplateInstanceFunc = oldTmplInstanceFunc;
        }
      };
    }

    /**
     * @summary Specify event handlers for this template.
     * @locus Client
     * @param {EventMap} eventMap Event handlers to associate with this template.
     * @importFromPackage templating
     */
    Template.prototype.events = function (eventMap) {
      if (!isObject(eventMap)) {
        throw new Error("Event map has to be an object");
      }
      const template = this;
      let eventMap2 = {};
      for (let k in eventMap) {
        eventMap2[k] = function (k, v) {
          return function (event /*, ...*/) {
            const view = this; // passed by EventAugmenter
            const args = Array.prototype.slice.call(arguments);
            // Exiting the current computation to avoid creating unnecessary
            // and unexpected reactive dependencies with Templates data
            // or any other reactive dependencies defined in event handlers
            return Tracker.nonreactive(function () {
              let data = Blaze.getData(event.currentTarget);
              if (data == null) data = {};
              const tmplInstanceFunc = Blaze._bind(view.templateInstance, view);
              args.splice(1, 0, tmplInstanceFunc());
              return Template._withTemplateInstanceFunc(tmplInstanceFunc, function () {
                return v.apply(data, args);
              });
            });
          };
        }(k, eventMap[k]);
      }
      template.__eventMaps.push(eventMap2);
    };

    /**
     * @function
     * @name instance
     * @memberOf Template
     * @summary The [template instance](#Template-instances) corresponding to the current template helper, event handler, callback, or autorun.  If there isn't one, `null`.
     * @locus Client
     * @returns {Blaze.TemplateInstance}
     * @importFromPackage templating
     */
    Template.instance = function () {
      return Template._currentTemplateInstanceFunc && Template._currentTemplateInstanceFunc();
    };

    // Note: Template.currentData() is documented to take zero arguments,
    // while Blaze.getData takes up to one.

    /**
     * @summary
     *
     * - Inside an `onCreated`, `onRendered`, or `onDestroyed` callback, returns
     * the data context of the template.
     * - Inside an event handler, returns the data context of the template on which
     * this event handler was defined.
     * - Inside a helper, returns the data context of the DOM node where the helper
     * was used.
     *
     * Establishes a reactive dependency on the result.
     * @locus Client
     * @function
     * @importFromPackage templating
     */
    Template.currentData = Blaze.getData;

    /**
     * @summary Accesses other data contexts that enclose the current data context.
     * @locus Client
     * @function
     * @param {Integer} [numLevels] The number of levels beyond the current data context to look. Defaults to 1.
     * @importFromPackage templating
     */
    Template.parentData = Blaze._parentData;

    /**
     * @summary Defines a [helper function](#Template-helpers) which can be used from all templates.
     * @locus Client
     * @function
     * @param {String} name The name of the helper function you are defining.
     * @param {Function} function The helper function itself.
     * @importFromPackage templating
     */
    Template.registerHelper = Blaze.registerHelper;

    /**
     * @summary Removes a global [helper function](#Template-helpers).
     * @locus Client
     * @function
     * @param {String} name The name of the helper function you are defining.
     * @importFromPackage templating
     */
    Template.deregisterHelper = Blaze.deregisterHelper;
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"backcompat.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/backcompat.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
UI = Blaze;
Blaze.ReactiveVar = ReactiveVar;
UI._templateInstance = Blaze.Template.instance;
Handlebars = {};
Handlebars.registerHelper = Blaze.registerHelper;
Handlebars._escape = Blaze._escape;

// Return these from {{...}} helpers to achieve the same as returning
// strings from {{{...}}} helpers
Handlebars.SafeString = function (string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function () {
  return this.string.toString();
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.has":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.has/package.json                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.has",
  "version": "4.5.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.has/index.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isobject":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isobject/package.json                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isobject",
  "version": "3.0.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isobject/index.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isfunction":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isfunction/package.json                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isfunction",
  "version": "3.0.9"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isfunction/index.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isempty":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isempty/package.json                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isempty/index.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Blaze: Blaze,
      UI: UI,
      Handlebars: Handlebars
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/blaze/preamble.js",
    "/node_modules/meteor/blaze/exceptions.js",
    "/node_modules/meteor/blaze/view.js",
    "/node_modules/meteor/blaze/builtins.js",
    "/node_modules/meteor/blaze/lookup.js",
    "/node_modules/meteor/blaze/template.js",
    "/node_modules/meteor/blaze/backcompat.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/blaze.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYmxhemUvcHJlYW1ibGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JsYXplL2V4Y2VwdGlvbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JsYXplL3ZpZXcuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JsYXplL2J1aWx0aW5zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9ibGF6ZS9sb29rdXAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JsYXplL3RlbXBsYXRlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9ibGF6ZS9iYWNrY29tcGF0LmpzIl0sIm5hbWVzIjpbIkJsYXplIiwiX2VzY2FwZSIsImVzY2FwZV9tYXAiLCJlc2NhcGVfb25lIiwiYyIsIngiLCJyZXBsYWNlIiwiX3dhcm4iLCJtc2ciLCJjb25zb2xlIiwid2FybiIsIm5hdGl2ZUJpbmQiLCJGdW5jdGlvbiIsInByb3RvdHlwZSIsImJpbmQiLCJfYmluZCIsImZ1bmMiLCJvYmoiLCJfbGVuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwicmVzdCIsIkFycmF5IiwiX2tleSIsImNhbGwiLCJhcmdzIiwiYXBwbHkiLCJvYmpBIiwib2JqQiIsImRlYnVnRnVuYyIsIl90aHJvd05leHRFeGNlcHRpb24iLCJfcmVwb3J0RXhjZXB0aW9uIiwiZSIsIk1ldGVvciIsIl9kZWJ1ZyIsImxvZyIsInN0YWNrIiwibWVzc2FnZSIsIl9yZXBvcnRFeGNlcHRpb25BbmRUaHJvdyIsImVycm9yIiwiX3dyYXBDYXRjaGluZ0V4Y2VwdGlvbnMiLCJmIiwid2hlcmUiLCJIVE1MIiwibW9kdWxlIiwibGluayIsInYiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIlZpZXciLCJuYW1lIiwicmVuZGVyIiwiX3JlbmRlciIsIl9jYWxsYmFja3MiLCJjcmVhdGVkIiwicmVuZGVyZWQiLCJkZXN0cm95ZWQiLCJpc0NyZWF0ZWQiLCJfaXNDcmVhdGVkRm9yRXhwYW5zaW9uIiwiaXNSZW5kZXJlZCIsIl9pc0F0dGFjaGVkIiwiaXNEZXN0cm95ZWQiLCJfaXNJblJlbmRlciIsInBhcmVudFZpZXciLCJfZG9tcmFuZ2UiLCJfaGFzR2VuZXJhdGVkUGFyZW50IiwiX3Njb3BlQmluZGluZ3MiLCJyZW5kZXJDb3VudCIsIm9uVmlld0NyZWF0ZWQiLCJjYiIsInB1c2giLCJfb25WaWV3UmVuZGVyZWQiLCJvblZpZXdSZWFkeSIsInNlbGYiLCJmaXJlIiwiVHJhY2tlciIsImFmdGVyRmx1c2giLCJfd2l0aEN1cnJlbnRWaWV3Iiwib25WaWV3UmVuZGVyZWQiLCJhdHRhY2hlZCIsIm9uQXR0YWNoZWQiLCJvblZpZXdEZXN0cm95ZWQiLCJyZW1vdmVWaWV3RGVzdHJveWVkTGlzdGVuZXIiLCJpbmRleCIsImxhc3RJbmRleE9mIiwiYXV0b3J1biIsIl9pblZpZXdTY29wZSIsImRpc3BsYXlOYW1lIiwiRXJyb3IiLCJ0ZW1wbGF0ZUluc3RhbmNlRnVuYyIsIlRlbXBsYXRlIiwiX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYyIsInZpZXdBdXRvcnVuIiwiX3dpdGhUZW1wbGF0ZUluc3RhbmNlRnVuYyIsImNvbXAiLCJzdG9wQ29tcHV0YXRpb24iLCJzdG9wIiwib25TdG9wIiwiX2Vycm9ySWZTaG91bGRudENhbGxTdWJzY3JpYmUiLCJzdWJzY3JpYmUiLCJvcHRpb25zIiwic3ViSGFuZGxlIiwiY29ubmVjdGlvbiIsImZpcnN0Tm9kZSIsImxhc3ROb2RlIiwiX2ZpcmVDYWxsYmFja3MiLCJ2aWV3Iiwid2hpY2giLCJub25yZWFjdGl2ZSIsImZpcmVDYWxsYmFja3MiLCJjYnMiLCJpIiwiTiIsIl9jcmVhdGVWaWV3IiwiZm9yRXhwYW5zaW9uIiwiZG9GaXJzdFJlbmRlciIsImluaXRpYWxDb250ZW50IiwiZG9tcmFuZ2UiLCJfRE9NUmFuZ2UiLCJ0ZWFyZG93bkhvb2siLCJyYW5nZSIsImVsZW1lbnQiLCJfRE9NQmFja2VuZCIsIlRlYXJkb3duIiwib25FbGVtZW50VGVhcmRvd24iLCJ0ZWFyZG93biIsIl9kZXN0cm95VmlldyIsIl9tYXRlcmlhbGl6ZVZpZXciLCJfd29ya1N0YWNrIiwiX2ludG9BcnJheSIsImxhc3RIdG1sanMiLCJkb1JlbmRlciIsImh0bWxqcyIsImZpcnN0UnVuIiwiX2lzQ29udGVudEVxdWFsIiwiZG9NYXRlcmlhbGl6ZSIsInJhbmdlc0FuZE5vZGVzIiwiX21hdGVyaWFsaXplRE9NIiwic2V0TWVtYmVycyIsIm9uSW52YWxpZGF0ZSIsImRlc3Ryb3lNZW1iZXJzIiwidW5kZWZpbmVkIiwiaW5pdGlhbENvbnRlbnRzIiwiX2V4cGFuZFZpZXciLCJyZXN1bHQiLCJfZXhwYW5kIiwiYWN0aXZlIiwiX0hUTUxKU0V4cGFuZGVyIiwiVHJhbnNmb3JtaW5nVmlzaXRvciIsImV4dGVuZCIsImRlZiIsInZpc2l0T2JqZWN0IiwiY29uc3RydWN0VmlldyIsInZpc2l0QXR0cmlidXRlcyIsImF0dHJzIiwidmlzaXRBdHRyaWJ1dGUiLCJ2YWx1ZSIsInRhZyIsImN1cnJlbnRWaWV3SWZSZW5kZXJpbmciLCJjdXJyZW50VmlldyIsInZpc2l0IiwiX2V4cGFuZEF0dHJpYnV0ZXMiLCJleHBhbmRlZCIsIl9za2lwTm9kZXMiLCJfZGVzdHJveU5vZGUiLCJub2RlIiwibm9kZVR5cGUiLCJ0ZWFyRG93bkVsZW1lbnQiLCJhIiwiYiIsIlJhdyIsIm9sZFZpZXciLCJjaGVja1JlbmRlckNvbnRlbnQiLCJjb250ZW50IiwiVmlzaXRvciIsImNvbnRlbnRBc1ZpZXciLCJjb250ZW50QXNGdW5jIiwiX19yb290Vmlld3MiLCJwYXJlbnRFbGVtZW50IiwibmV4dE5vZGUiLCJpbmRleE9mIiwic3BsaWNlIiwiYXR0YWNoIiwiaW5zZXJ0IiwicmVuZGVyV2l0aERhdGEiLCJkYXRhIiwiX1RlbXBsYXRlV2l0aCIsInJlbW92ZSIsImRlc3Ryb3kiLCJwYXJlbnRSYW5nZSIsImRldGFjaCIsInRvSFRNTCIsInRvSFRNTFdpdGhEYXRhIiwiX3RvVGV4dCIsInRleHRNb2RlIiwiVEVYVE1PREUiLCJTVFJJTkciLCJSQ0RBVEEiLCJBVFRSSUJVVEUiLCJ0b1RleHQiLCJnZXREYXRhIiwiZWxlbWVudE9yVmlldyIsIl90aGVXaXRoJGRhdGFWYXIkZ2V0IiwidGhlV2l0aCIsImdldFZpZXciLCJkYXRhVmFyIiwiZ2V0IiwiZ2V0RWxlbWVudERhdGEiLCJfdmlld05hbWUiLCJ2aWV3TmFtZSIsIl9nZXRDdXJyZW50VmlldyIsIl9nZXRQYXJlbnRWaWV3IiwiX2dldEVsZW1lbnRWaWV3IiwiZWxlbSIsImZvckVsZW1lbnQiLCJfYWRkRXZlbnRNYXAiLCJldmVudE1hcCIsInRoaXNJbkhhbmRsZXIiLCJoYW5kbGVzIiwiYXR0YWNoZWRfZXZlbnRNYXBzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzcGVjIiwiaGFuZGxlciIsImNsYXVzZXMiLCJzcGxpdCIsImNsYXVzZSIsInBhcnRzIiwibmV3RXZlbnRzIiwic2hpZnQiLCJzZWxlY3RvciIsImpvaW4iLCJfRXZlbnRTdXBwb3J0IiwibGlzdGVuIiwiZXZ0IiwiY29udGFpbnNFbGVtZW50IiwiY3VycmVudFRhcmdldCIsImhhbmRsZXJUaGlzIiwiaGFuZGxlckFyZ3MiLCJyIiwiaCIsIl9fcmVpZnlfYXN5bmNfcmVzdWx0X18iLCJfcmVpZnlFcnJvciIsImFzeW5jIiwiaGFzIiwiZGVmYXVsdCIsImlzT2JqZWN0IiwiX2NhbGN1bGF0ZUNvbmRpdGlvbiIsImNvbmQiLCJpc0FycmF5IiwiV2l0aCIsImNvbnRlbnRGdW5jIiwiX2NyZWF0ZUJpbmRpbmciLCJfaXNFcXVhbEJpbmRpbmciLCJ5IiwiUmVhY3RpdmVWYXIiLCJfaXNFcXVhbCIsIl9pZGVudGl0eSIsIl9zZXRCaW5kaW5nVmFsdWUiLCJyZWFjdGl2ZVZhciIsIm1hcHBlciIsInRoZW4iLCJzZXQiLCJiaW5kaW5nIiwiX2F0dGFjaEJpbmRpbmdzVG9WaWV3IiwiYmluZGluZ3MiLCJlbnRyaWVzIiwiX3JlZiIsIkxldCIsIklmIiwiY29uZGl0aW9uRnVuYyIsImVsc2VGdW5jIiwiX25vdCIsImNvbmRpdGlvbiIsIl9fY29uZGl0aW9uVmFyIiwiVW5sZXNzIiwiRWFjaCIsImFyZ0Z1bmMiLCJlYWNoVmlldyIsInN1YnZpZXdzIiwiaW5pdGlhbFN1YnZpZXdzIiwiZXhwYW5kZWRWYWx1ZURlcCIsIkRlcGVuZGVuY3kiLCJkZXBlbmQiLCJudW1JdGVtcyIsImluRWxzZU1vZGUiLCJzdG9wSGFuZGxlIiwiYXJnVmFyIiwidmFyaWFibGVOYW1lIiwidXBkYXRlSW5kaWNlcyIsImZyb20iLCJ0byIsIm1lbWJlcnMiLCJtYXliZVNlcXVlbmNlIiwiX3ZhcmlhYmxlIiwiX3NlcXVlbmNlIiwiT2JzZXJ2ZVNlcXVlbmNlIiwib2JzZXJ2ZSIsIl9lYWNoVmlldyRhcmdWYXIkZ2V0IiwiYWRkZWRBdCIsImlkIiwiaXRlbSIsIm5ld0l0ZW1WaWV3IiwiY2hhbmdlZCIsInJlbW92ZU1lbWJlciIsImFkZE1lbWJlciIsInJlbW92ZWRBdCIsImNoYW5nZWRBdCIsIm5ld0l0ZW0iLCJvbGRJdGVtIiwiaXRlbVZpZXciLCJnZXRNZW1iZXIiLCJtb3ZlZFRvIiwiZnJvbUluZGV4IiwidG9JbmRleCIsIm1vdmVNZW1iZXIiLCJNYXRoIiwibWluIiwibWF4IiwiX0F3YWl0IiwiX0F3YWl0Q29udGVudCIsIl9CbGF6ZSRjdXJyZW50VmlldyRfcyIsImFyZyIsInciLCJ3cmFwcGVkQXJnRnVuYyIsInZpZXdUb0V2YWx1YXRlQXJnIiwib3JpZ2luYWxQYXJlbnRWaWV3Iiwid3JhcHBlZENvbnRlbnRGdW5jIiwiX19pc1RlbXBsYXRlV2l0aCIsIl9Jbk91dGVyVGVtcGxhdGVTY29wZSIsInRlbXBsYXRlVmlldyIsIl9fY2hpbGREb2VzbnRTdGFydE5ld0xleGljYWxTY29wZSIsIl9jcmVhdGVCaW5kaW5nc0hlbHBlciIsImZuIiwibmFtZXMiLCJzbGljZSIsInNvbWUiLCJfbGV4aWNhbEJpbmRpbmdMb29rdXAiLCJjb25jYXQiLCJfZ2xvYmFsSGVscGVycyIsInJlZ2lzdGVySGVscGVyIiwiZGVyZWdpc3RlckhlbHBlciIsImJpbmRJZklzRnVuY3Rpb24iLCJ0YXJnZXQiLCJiaW5kRGF0YUNvbnRleHQiLCJfbGVuMiIsIl9rZXkyIiwiX09MRFNUWUxFX0hFTFBFUiIsIl9nZXRUZW1wbGF0ZUhlbHBlciIsInRlbXBsYXRlIiwidG1wbEluc3RhbmNlRnVuYyIsImlzS25vd25PbGRTdHlsZUhlbHBlciIsIl9faGVscGVycyIsImhlbHBlciIsInByaW50TmFtZSIsIndyYXBIZWxwZXIiLCJfTk9XQVJOX09MRFNUWUxFX0hFTFBFUlMiLCJ0ZW1wbGF0ZUZ1bmMiLCJfbGVuMyIsIl9rZXkzIiwiX2xleGljYWxLZWVwR29pbmciLCJfX3N0YXJ0c05ld0xleGljYWxTY29wZSIsIl9iaW5kaW5nJGdldCIsIl9nZXRUZW1wbGF0ZSIsInRlbXBsYXRlSW5zdGFuY2UiLCJfZ2V0R2xvYmFsSGVscGVyIiwibG9va3VwIiwiX29wdGlvbnMiLCJsb29rdXBUZW1wbGF0ZSIsImJvdW5kVG1wbEluc3RhbmNlIiwiZm91bmRUZW1wbGF0ZSIsInRlc3QiLCJfcGFyZW50RGF0YSIsIl9sZW40IiwiX2tleTQiLCJpc0NhbGxlZEFzRnVuY3Rpb24iLCJjaGFyQXQiLCJoZWlnaHQiLCJfZnVuY3Rpb25XcmFwcGVkIiwiX3RoZVdpdGgkZGF0YVZhciRnZXQyIiwiaXNGdW5jdGlvbiIsImlzRW1wdHkiLCJyZW5kZXJGdW5jdGlvbiIsIkhlbHBlck1hcCIsIl9fZXZlbnRNYXBzIiwiaXNUZW1wbGF0ZSIsInQiLCJvbkNyZWF0ZWQiLCJvblJlbmRlcmVkIiwib25EZXN0cm95ZWQiLCJfZ2V0Q2FsbGJhY2tzIiwiY2FsbGJhY2tzIiwidGVtcGxhdGVDb250ZW50QmxvY2siLCJ0ZW1wbGF0ZUVsc2VCbG9jayIsImV2ZW50cyIsIm0iLCJfdGVtcGxhdGVJbnN0YW5jZSIsIlRlbXBsYXRlSW5zdGFuY2UiLCJpbnN0IiwiY3JlYXRlZENhbGxiYWNrcyIsInJlbmRlcmVkQ2FsbGJhY2tzIiwiZGVzdHJveWVkQ2FsbGJhY2tzIiwiX2FsbFN1YnNSZWFkeURlcCIsIl9hbGxTdWJzUmVhZHkiLCJfc3Vic2NyaXB0aW9uSGFuZGxlcyIsIiQiLCJmaW5kQWxsIiwiZmluZCIsInN1YkhhbmRsZXMiLCJsYXN0UGFyYW0iLCJsYXN0UGFyYW1PcHRpb25zUGF0dGVybiIsIm9uUmVhZHkiLCJNYXRjaCIsIk9wdGlvbmFsIiwib25FcnJvciIsIkFueSIsInBvcCIsIm9sZFN0b3BwZWQiLCJzdWJzY3JpcHRpb25JZCIsInN1YnNjcmlwdGlvbnNSZWFkeSIsInZhbHVlcyIsImV2ZXJ5IiwiaGFuZGxlIiwicmVhZHkiLCJoZWxwZXJzIiwiZGljdCIsImsiLCJjYW5Vc2VHZXR0ZXJzIiwiZGVmaW5lUHJvcGVydHkiLCJjdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmMiLCJvbGRUbXBsSW5zdGFuY2VGdW5jIiwiZXZlbnRNYXAyIiwiZXZlbnQiLCJpbnN0YW5jZSIsImN1cnJlbnREYXRhIiwicGFyZW50RGF0YSIsIlVJIiwiSGFuZGxlYmFycyIsIlNhZmVTdHJpbmciLCJzdHJpbmciLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FBLEtBQUssR0FBRyxDQUFDLENBQUM7O0FBRVY7QUFDQTtBQUNBO0FBQ0FBLEtBQUssQ0FBQ0MsT0FBTyxHQUFJLFlBQVc7RUFDMUIsTUFBTUMsVUFBVSxHQUFHO0lBQ2pCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsR0FBRyxFQUFFLE1BQU07SUFDWCxHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxRQUFRO0lBQ2IsR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsUUFBUTtJQUFFO0lBQ2YsR0FBRyxFQUFFO0VBQ1AsQ0FBQztFQUNELE1BQU1DLFVBQVUsR0FBRyxTQUFBQSxDQUFTQyxDQUFDLEVBQUU7SUFDN0IsT0FBT0YsVUFBVSxDQUFDRSxDQUFDLENBQUM7RUFDdEIsQ0FBQztFQUVELE9BQU8sVUFBVUMs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R25iLEtBQUssQ0FBQ29YLFdBQVc7O0lBRXZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQTNSLFFBQVEsQ0FBQzJQLGNBQWMsR0FBR3BWLEtBQUssQ0FBQ29WLGNBQWM7O0lBRTlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0EzUCxRQUFRLENBQUM0UCxnQkFBZ0IsR0FBR3JWLEtBQUssQ0FBQ3FWLGdCQUFnQjtJQUFDcEcsc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQXpLLElBQUE7RUFBQTJLLEtBQUE7QUFBQSxHOzs7Ozs7Ozs7OztBQ25tQm5EaU0sRUFBRSxHQUFHcGIsS0FBSztBQUVWQSxLQUFLLENBQUMrUCxXQUFXLEdBQUdBLFdBQVc7QUFDL0JxTCxFQUFFLENBQUN4QyxpQkFBaUIsR0FBRzVZLEtBQUssQ0FBQ3lGLFFBQVEsQ0FBQ3dWLFFBQVE7QUFFOUNJLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDZkEsVUFBVSxDQUFDakcsY0FBYyxHQUFHcFYsS0FBSyxDQUFDb1YsY0FBYztBQUVoRGlHLFVBQVUsQ0FBQ3BiLE9BQU8sR0FBR0QsS0FBSyxDQUFDQyxPQUFPOztBQUVsQztBQUNBO0FBQ0FvYixVQUFVLENBQUNDLFVBQVUsR0FBRyxVQUFTQyxNQUFNLEVBQUU7RUFDdkMsSUFBSSxDQUFDQSxNQUFNLEdBQUdBLE1BQU07QUFDdEIsQ0FBQztBQUNERixVQUFVLENBQUNDLFVBQVUsQ0FBQ3phLFNBQVMsQ0FBQzJhLFFBQVEsR0FBRyxZQUFXO0VBQ3BELE9BQU8sSUFBSSxDQUFDRCxNQUFNLENBQUNDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQyIsImZpbGUiOiIvcGFja2FnZXMvYmxhemUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBuYW1lc3BhY2UgQmxhemVcbiAqIEBzdW1tYXJ5IFRoZSBuYW1lc3BhY2UgZm9yIGFsbCBCbGF6ZS1yZWxhdGVkIG1ldGhvZHMgYW5kIGNsYXNzZXMuXG4gKi9cbkJsYXplID0ge307XG5cbi8vIFV0aWxpdHkgdG8gSFRNTC1lc2NhcGUgYSBzdHJpbmcuICBJbmNsdWRlZCBmb3IgbGVnYWN5IHJlYXNvbnMuXG4vLyBUT0RPOiBTaG91bGQgYmUgcmVwbGFjZWQgd2l0aCBfLmVzY2FwZSBvbmNlIHVuZGVyc2NvcmUgaXMgdXBncmFkZWQgdG8gYSBuZXdlclxuLy8gICAgICAgdmVyc2lvbiB3aGljaCBlc2NhcGVzIGAgKGJhY2t0aWNrKSBhcyB3ZWxsLiBVbmRlcnNjb3JlIDEuNS4yIGRvZXMgbm90LlxuQmxhemUuX2VzY2FwZSA9IChmdW5jdGlvbigpIHtcbiAgY29uc3QgZXNjYXBlX21hcCA9IHtcbiAgICBcIjxcIjogXCImbHQ7XCIsXG4gICAgXCI+XCI6IFwiJmd0O1wiLFxuICAgICdcIic6IFwiJnF1b3Q7XCIsXG4gICAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gICAgXCIvXCI6IFwiJiN4MkY7XCIsXG4gICAgXCJgXCI6IFwiJiN4NjA7XCIsIC8qIElFIGFsbG93cyBiYWNrdGljay1kZWxpbWl0ZWQgYXR0cmlidXRlcz8/ICovXG4gICAgXCImXCI6IFwiJmFtcDtcIlxuICB9O1xuICBjb25zdCBlc2NhcGVfb25lID0gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBlc2NhcGVfbWFwW2NdO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiB4LnJlcGxhY2UoL1smPD5cIidgXS9nLCBlc2NhcGVfb25lKTtcbiAgfTtcbn0pKCk7XG5cbkJsYXplLl93YXJuID0gZnVuY3Rpb24gKG1zZykge1xuICBtc2cgPSAnV2FybmluZzogJyArIG1zZztcblxuICBpZiAoKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJykgJiYgY29uc29sZS53YXJuKSB7XG4gICAgY29uc29sZS53YXJuKG1zZyk7XG4gIH1cbn07XG5cbmNvbnN0IG5hdGl2ZUJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZDtcblxuLy8gQW4gaW1wbGVtZW50YXRpb24gb2YgXy5iaW5kIHdoaWNoIGFsbG93cyBiZXR0ZXIgb3B0aW1pemF0aW9uLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vcGV0a2FhbnRvbm92L2JsdWViaXJkL3dpa2kvT3B0aW1pemF0aW9uLWtpbGxlcnMjMy1tYW5hZ2luZy1hcmd1bWVudHNcbmlmIChuYXRpdmVCaW5kKSB7XG4gIEJsYXplLl9iaW5kID0gZnVuY3Rpb24gKGZ1bmMsIG9iaiwgLi4ucmVzdCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICByZXR1cm4gbmF0aXZlQmluZC5jYWxsKGZ1bmMsIG9iaik7XG4gICAgfVxuXG4gICAgY29uc3QgYXJncyA9IFtvYmosIC4uLnJlc3RdO1xuXG4gICAgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgYXJncyk7XG4gIH07XG59XG5lbHNlIHtcbiAgLy8gQSBzbG93ZXIgYnV0IGJhY2t3YXJkcyBjb21wYXRpYmxlIHZlcnNpb24uXG4gIEJsYXplLl9iaW5kID0gZnVuY3Rpb24ob2JqQSwgb2JqQikge1xuICAgIG9iakEuYmluZChvYmpCKTtcbiAgfTtcbn1cbiIsImxldCBkZWJ1Z0Z1bmM7XG5cbi8vIFdlIGNhbGwgaW50byB1c2VyIGNvZGUgaW4gbWFueSBwbGFjZXMsIGFuZCBpdCdzIG5pY2UgdG8gY2F0Y2ggZXhjZXB0aW9uc1xuLy8gcHJvcGFnYXRlZCBmcm9tIHVzZXIgY29kZSBpbW1lZGlhdGVseSBzbyB0aGF0IHRoZSB3aG9sZSBzeXN0ZW0gZG9lc24ndCBqdXN0XG4vLyBicmVhay4gIENhdGNoaW5nIGV4Y2VwdGlvbnMgaXMgZWFzeTsgcmVwb3J0aW5nIHRoZW0gaXMgaGFyZC4gIFRoaXMgaGVscGVyXG4vLyByZXBvcnRzIGV4Y2VwdGlvbnMuXG4vL1xuLy8gVXNhZ2U6XG4vL1xuLy8gYGBgXG4vLyB0cnkge1xuLy8gICAvLyAuLi4gc29tZVN0dWZmIC4uLlxuLy8gfSBjYXRjaCAoZSkge1xuLy8gICByZXBvcnRVSUV4Y2VwdGlvbihlKTtcbi8vIH1cbi8vIGBgYFxuLy9cbi8vIEFuIG9wdGlvbmFsIHNlY29uZCBhcmd1bWVudCBvdmVycmlkZXMgdGhlIGRlZmF1bHQgbWVzc2FnZS5cblxuLy8gU2V0IHRoaXMgdG8gYHRydWVgIHRvIGNhdXNlIGByZXBvcnRFeGNlcHRpb25gIHRvIHRocm93XG4vLyB0aGUgbmV4dCBleGNlcHRpb24gcmF0aGVyIHRoYW4gcmVwb3J0aW5nIGl0LiAgVGhpcyBpc1xuLy8gdXNlZnVsIGluIHVuaXQgdGVzdHMgdGhhdCB0ZXN0IGVycm9yIG1lc3NhZ2VzLlxuQmxhemUuX3Rocm93TmV4dEV4Y2VwdGlvbiA9IGZhbHNlO1xuXG5CbGF6ZS5fcmVwb3J0RXhjZXB0aW9uID0gZnVuY3Rpb24gKGUsIG1zZykge1xuICBpZiAoQmxhemUuX3Rocm93TmV4dEV4Y2VwdGlvbikge1xuICAgIEJsYXplLl90aHJvd05leHRFeGNlcHRpb24gPSBmYWxzZTtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgaWYgKCEgZGVidWdGdW5jKVxuICAgIC8vIGFkYXB0ZWQgZnJvbSBUcmFja2VyXG4gICAgZGVidWdGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICh0eXBlb2YgTWV0ZW9yICE9PSBcInVuZGVmaW5lZFwiID8gTWV0ZW9yLl9kZWJ1ZyA6XG4gICAgICAgICAgICAgICgodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIpICYmIGNvbnNvbGUubG9nID8gY29uc29sZS5sb2cgOlxuICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge30pKTtcbiAgICB9O1xuXG4gIC8vIEluIENocm9tZSwgYGUuc3RhY2tgIGlzIGEgbXVsdGlsaW5lIHN0cmluZyB0aGF0IHN0YXJ0cyB3aXRoIHRoZSBtZXNzYWdlXG4gIC8vIGFuZCBjb250YWlucyBhIHN0YWNrIHRyYWNlLiAgRnVydGhlcm1vcmUsIGBjb25zb2xlLmxvZ2AgbWFrZXMgaXQgY2xpY2thYmxlLlxuICAvLyBgY29uc29sZS5sb2dgIHN1cHBsaWVzIHRoZSBzcGFjZSBiZXR3ZWVuIHRoZSB0d28gYXJndW1lbnRzLlxuICBkZWJ1Z0Z1bmMoKShtc2cgfHwgJ0V4Y2VwdGlvbiBjYXVnaHQgaW4gdGVtcGxhdGU6JywgZS5zdGFjayB8fCBlLm1lc3NhZ2UgfHwgZSk7XG59O1xuXG4vLyBJdCdzIG1lYW50IHRvIGJlIHVzZWQgaW4gYFByb21pc2VgIGNoYWlucyB0byByZXBvcnQgdGhlIGVycm9yIHdoaWxlIG5vdFxuLy8gXCJzd2FsbG93aW5nXCIgaXQgKGkuZS4sIHRoZSBjaGFpbiB3aWxsIHN0aWxsIHJlamVjdCkuXG5CbGF6ZS5fcmVwb3J0RXhjZXB0aW9uQW5kVGhyb3cgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgQmxhemUuX3JlcG9ydEV4Y2VwdGlvbihlcnJvcik7XG4gIHRocm93IGVycm9yO1xufTtcblxuQmxhemUuX3dyYXBDYXRjaGluZ0V4Y2VwdGlvbnMgPSBmdW5jdGlvbiAoZiwgd2hlcmUpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiBmO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJndW1lbnRzKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgQmxhemUuX3JlcG9ydEV4Y2VwdGlvbihlLCAnRXhjZXB0aW9uIGluICcgKyB3aGVyZSArICc6Jyk7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vLyBbbmV3XSBCbGF6ZS5WaWV3KFtuYW1lXSwgcmVuZGVyTWV0aG9kKVxuLy8vXG4vLy8gQmxhemUuVmlldyBpcyB0aGUgYnVpbGRpbmcgYmxvY2sgb2YgcmVhY3RpdmUgRE9NLiAgVmlld3MgaGF2ZVxuLy8vIHRoZSBmb2xsb3dpbmcgZmVhdHVyZXM6XG4vLy9cbi8vLyAqIGxpZmVjeWNsZSBjYWxsYmFja3MgLSBWaWV3cyBhcmUgY3JlYXRlZCwgcmVuZGVyZWQsIGFuZCBkZXN0cm95ZWQsXG4vLy8gICBhbmQgY2FsbGJhY2tzIGNhbiBiZSByZWdpc3RlcmVkIHRvIGZpcmUgd2hlbiB0aGVzZSB0aGluZ3MgaGFwcGVuLlxuLy8vXG4vLy8gKiBwYXJlbnQgcG9pbnRlciAtIEEgVmlldyBwb2ludHMgdG8gaXRzIHBhcmVudFZpZXcsIHdoaWNoIGlzIHRoZVxuLy8vICAgVmlldyB0aGF0IGNhdXNlZCBpdCB0byBiZSByZW5kZXJlZC4gIFRoZXNlIHBvaW50ZXJzIGZvcm0gYVxuLy8vICAgaGllcmFyY2h5IG9yIHRyZWUgb2YgVmlld3MuXG4vLy9cbi8vLyAqIHJlbmRlcigpIG1ldGhvZCAtIEEgVmlldydzIHJlbmRlcigpIG1ldGhvZCBzcGVjaWZpZXMgdGhlIERPTVxuLy8vICAgKG9yIEhUTUwpIGNvbnRlbnQgb2YgdGhlIFZpZXcuICBJZiB0aGUgbWV0aG9kIGVzdGFibGlzaGVzXG4vLy8gICByZWFjdGl2ZSBkZXBlbmRlbmNpZXMsIGl0IG1heSBiZSByZS1ydW4uXG4vLy9cbi8vLyAqIGEgRE9NUmFuZ2UgLSBJZiBhIFZpZXcgaXMgcmVuZGVyZWQgdG8gRE9NLCBpdHMgcG9zaXRpb24gYW5kXG4vLy8gICBleHRlbnQgaW4gdGhlIERPTSBhcmUgdHJhY2tlZCB1c2luZyBhIERPTVJhbmdlIG9iamVjdC5cbi8vL1xuLy8vIFdoZW4gYSBWaWV3IGlzIGNvbnN0cnVjdGVkIGJ5IGNhbGxpbmcgQmxhemUuVmlldywgdGhlIFZpZXcgaXNcbi8vLyBub3QgeWV0IGNvbnNpZGVyZWQgXCJjcmVhdGVkLlwiICBJdCBkb2Vzbid0IGhhdmUgYSBwYXJlbnRWaWV3IHlldCxcbi8vLyBhbmQgbm8gbG9naWMgaGFzIGJlZW4gcnVuIHRvIGluaXRpYWxpemUgdGhlIFZpZXcuICBBbGwgcmVhbFxuLy8vIHdvcmsgaXMgZGVmZXJyZWQgdW50aWwgYXQgbGVhc3QgY3JlYXRpb24gdGltZSwgd2hlbiB0aGUgb25WaWV3Q3JlYXRlZFxuLy8vIGNhbGxiYWNrcyBhcmUgZmlyZWQsIHdoaWNoIGhhcHBlbnMgd2hlbiB0aGUgVmlldyBpcyBcInVzZWRcIiBpblxuLy8vIHNvbWUgd2F5IHRoYXQgcmVxdWlyZXMgaXQgdG8gYmUgcmVuZGVyZWQuXG4vLy9cbi8vLyAuLi5tb3JlIGxpZmVjeWNsZSBzdHVmZlxuLy8vXG4vLy8gYG5hbWVgIGlzIGFuIG9wdGlvbmFsIHN0cmluZyB0YWcgaWRlbnRpZnlpbmcgdGhlIFZpZXcuICBUaGUgb25seVxuLy8vIHRpbWUgaXQncyB1c2VkIGlzIHdoZW4gbG9va2luZyBpbiB0aGUgVmlldyB0cmVlIGZvciBhIFZpZXcgb2YgYVxuLy8vIHBhcnRpY3VsYXIgbmFtZTsgZm9yIGV4YW1wbGUsIGRhdGEgY29udGV4dHMgYXJlIHN0b3JlZCBvbiBWaWV3c1xuLy8vIG9mIG5hbWUgXCJ3aXRoXCIuICBOYW1lcyBhcmUgYWxzbyB1c2VmdWwgd2hlbiBkZWJ1Z2dpbmcsIHNvIGluXG4vLy8gZ2VuZXJhbCBpdCdzIGdvb2QgZm9yIGZ1bmN0aW9ucyB0aGF0IGNyZWF0ZSBWaWV3cyB0byBzZXQgdGhlIG5hbWUuXG4vLy8gVmlld3MgYXNzb2NpYXRlZCB3aXRoIHRlbXBsYXRlcyBoYXZlIG5hbWVzIG9mIHRoZSBmb3JtIFwiVGVtcGxhdGUuZm9vXCIuXG5pbXBvcnQgeyBIVE1MIH0gZnJvbSAnbWV0ZW9yL2h0bWxqcyc7XG5cbi8qKlxuICogQSBiaW5kaW5nIGlzIGVpdGhlciBgdW5kZWZpbmVkYCAocGVuZGluZyksIGB7IGVycm9yIH1gIChyZWplY3RlZCksIG9yXG4gKiBgeyB2YWx1ZSB9YCAocmVzb2x2ZWQpLiBTeW5jaHJvbm91cyB2YWx1ZXMgYXJlIGltbWVkaWF0ZWx5IHJlc29sdmVkIChpLmUuLFxuICogYHsgdmFsdWUgfWAgaXMgdXNlZCkuIFRoZSBvdGhlciBzdGF0ZXMgYXJlIHJlc2VydmVkIGZvciBhc3luY2hyb25vdXMgYmluZGluZ3NcbiAqIChpLmUuLCB2YWx1ZXMgd3JhcHBlZCB3aXRoIGBQcm9taXNlYHMpLlxuICogQHR5cGVkZWYge3sgZXJyb3I6IHVua25vd24gfSB8IHsgdmFsdWU6IHVua25vd24gfSB8IHVuZGVmaW5lZH0gQmluZGluZ1xuICovXG5cbi8qKlxuICogQGNsYXNzXG4gKiBAc3VtbWFyeSBDb25zdHJ1Y3RvciBmb3IgYSBWaWV3LCB3aGljaCByZXByZXNlbnRzIGEgcmVhY3RpdmUgcmVnaW9uIG9mIERPTS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbbmFtZV0gT3B0aW9uYWwuICBBIG5hbWUgZm9yIHRoaXMgdHlwZSBvZiBWaWV3LiAgU2VlIFtgdmlldy5uYW1lYF0oI3ZpZXdfbmFtZSkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZW5kZXJGdW5jdGlvbiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBbKnJlbmRlcmFibGUgY29udGVudCpdKCNSZW5kZXJhYmxlLUNvbnRlbnQpLiAgSW4gdGhpcyBmdW5jdGlvbiwgYHRoaXNgIGlzIGJvdW5kIHRvIHRoZSBWaWV3LlxuICovXG5CbGF6ZS5WaWV3ID0gZnVuY3Rpb24gKG5hbWUsIHJlbmRlcikge1xuICBpZiAoISAodGhpcyBpbnN0YW5jZW9mIEJsYXplLlZpZXcpKVxuICAgIC8vIGNhbGxlZCB3aXRob3V0IGBuZXdgXG4gICAgcmV0dXJuIG5ldyBCbGF6ZS5WaWV3KG5hbWUsIHJlbmRlcik7XG5cbiAgaWYgKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gb21pdHRlZCBcIm5hbWVcIiBhcmd1bWVudFxuICAgIHJlbmRlciA9IG5hbWU7XG4gICAgbmFtZSA9ICcnO1xuICB9XG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIHRoaXMuX3JlbmRlciA9IHJlbmRlcjtcblxuICB0aGlzLl9jYWxsYmFja3MgPSB7XG4gICAgY3JlYXRlZDogbnVsbCxcbiAgICByZW5kZXJlZDogbnVsbCxcbiAgICBkZXN0cm95ZWQ6IG51bGxcbiAgfTtcblxuICAvLyBTZXR0aW5nIGFsbCBwcm9wZXJ0aWVzIGhlcmUgaXMgZ29vZCBmb3IgcmVhZGFiaWxpdHksXG4gIC8vIGFuZCBhbHNvIG1heSBoZWxwIENocm9tZSBvcHRpbWl6ZSB0aGUgY29kZSBieSBrZWVwaW5nXG4gIC8vIHRoZSBWaWV3IG9iamVjdCBmcm9tIGNoYW5naW5nIHNoYXBlIHRvbyBtdWNoLlxuICB0aGlzLmlzQ3JlYXRlZCA9IGZhbHNlO1xuICB0aGlzLl9pc0NyZWF0ZWRGb3JFeHBhbnNpb24gPSBmYWxzZTtcbiAgdGhpcy5pc1JlbmRlcmVkID0gZmFsc2U7XG4gIHRoaXMuX2lzQXR0YWNoZWQgPSBmYWxzZTtcbiAgdGhpcy5pc0Rlc3Ryb3llZCA9IGZhbHNlO1xuICB0aGlzLl9pc0luUmVuZGVyID0gZmFsc2U7XG4gIHRoaXMucGFyZW50VmlldyA9IG51bGw7XG4gIHRoaXMuX2RvbXJhbmdlID0gbnVsbDtcbiAgLy8gVGhpcyBmbGFnIGlzIG5vcm1hbGx5IHNldCB0byBmYWxzZSBleGNlcHQgZm9yIHRoZSBjYXNlcyB3aGVuIHZpZXcncyBwYXJlbnRcbiAgLy8gd2FzIGdlbmVyYXRlZCBhcyBwYXJ0IG9mIGV4cGFuZGluZyBzb21lIHN5bnRhY3RpYyBzdWdhciBleHByZXNzaW9ucyBvclxuICAvLyBtZXRob2RzLlxuICAvLyBFeC46IEJsYXplLnJlbmRlcldpdGhEYXRhIGlzIGFuIGVxdWl2YWxlbnQgdG8gY3JlYXRpbmcgYSB2aWV3IHdpdGggcmVndWxhclxuICAvLyBCbGF6ZS5yZW5kZXIgYW5kIHdyYXBwaW5nIGl0IGludG8ge3sjd2l0aCBkYXRhfX17ey93aXRofX0gdmlldy4gU2luY2UgdGhlXG4gIC8vIHVzZXJzIGRvbid0IGtub3cgYW55dGhpbmcgYWJvdXQgdGhlc2UgZ2VuZXJhdGVkIHBhcmVudCB2aWV3cywgQmxhemUgbmVlZHNcbiAgLy8gdGhpcyBpbmZvcm1hdGlvbiB0byBiZSBhdmFpbGFibGUgb24gdmlld3MgdG8gbWFrZSBzbWFydGVyIGRlY2lzaW9ucy4gRm9yXG4gIC8vIGV4YW1wbGU6IHJlbW92aW5nIHRoZSBnZW5lcmF0ZWQgcGFyZW50IHZpZXcgd2l0aCB0aGUgdmlldyBvbiBCbGF6ZS5yZW1vdmUuXG4gIHRoaXMuX2hhc0dlbmVyYXRlZFBhcmVudCA9IGZhbHNlO1xuICAvLyBCaW5kaW5ncyBhY2Nlc3NpYmxlIHRvIGNoaWxkcmVuIHZpZXdzICh2aWEgdmlldy5sb29rdXAoJ25hbWUnKSkgd2l0aGluIHRoZVxuICAvLyBjbG9zZXN0IHRlbXBsYXRlIHZpZXcuXG4gIC8qKiBAdHlwZSB7UmVjb3JkPHN0cmluZywgUmVhY3RpdmVWYXI8QmluZGluZz4+fSAqL1xuICB0aGlzLl9zY29wZUJpbmRpbmdzID0ge307XG5cbiAgdGhpcy5yZW5kZXJDb3VudCA9IDA7XG59O1xuXG5CbGF6ZS5WaWV3LnByb3RvdHlwZS5fcmVuZGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbnVsbDsgfTtcblxuQmxhemUuVmlldy5wcm90b3R5cGUub25WaWV3Q3JlYXRlZCA9IGZ1bmN0aW9uIChjYikge1xuICB0aGlzLl9jYWxsYmFja3MuY3JlYXRlZCA9IHRoaXMuX2NhbGxiYWNrcy5jcmVhdGVkIHx8IFtdO1xuICB0aGlzLl9jYWxsYmFja3MuY3JlYXRlZC5wdXNoKGNiKTtcbn07XG5cbkJsYXplLlZpZXcucHJvdG90eXBlLl9vblZpZXdSZW5kZXJlZCA9IGZ1bmN0aW9uIChjYikge1xuICB0aGlzLl9jYWxsYmFja3MucmVuZGVyZWQgPSB0aGlzLl9jYWxsYmFja3MucmVuZGVyZWQgfHwgW107XG4gIHRoaXMuX2NhbGxiYWNrcy5yZW5kZXJlZC5wdXNoKGNiKTtcbn07XG5cbkJsYXplLlZpZXcucHJvdG90eXBlLm9uVmlld1JlYWR5ID0gZnVuY3Rpb24gKGNiKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICBjb25zdCBmaXJlID0gZnVuY3Rpb24gKCkge1xuICAgIFRyYWNrZXIuYWZ0ZXJGbHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoISBzZWxmLmlzRGVzdHJveWVkKSB7XG4gICAgICAgIEJsYXplLl93aXRoQ3VycmVudFZpZXcoc2VsZiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNiLmNhbGwoc2VsZik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICBzZWxmLl9vblZpZXdSZW5kZXJlZChmdW5jdGlvbiBvblZpZXdSZW5kZXJlZCgpIHtcbiAgICBpZiAoc2VsZi5pc0Rlc3Ryb3llZClcbiAgICAgIHJldHVybjtcbiAgICBpZiAoISBzZWxmLl9kb21yYW5nZS5hdHRhY2hlZClcbiAgICAgIHNlbGYuX2RvbXJhbmdlLm9uQXR0YWNoZWQoZmlyZSk7XG4gICAgZWxzZVxuICAgICAgZmlyZSgpO1xuICB9KTtcbn07XG5cbkJsYXplLlZpZXcucHJvdG90eXBlLm9uVmlld0Rlc3Ryb3llZCA9IGZ1bmN0aW9uIChjYikge1xuICB0aGlzLl9jYWxsYmFja3MuZGVzdHJveWVkID0gdGhpcy5fY2FsbGJhY2tzLmRlc3Ryb3llZCB8fCBbXTtcbiAgdGhpcy5fY2FsbGJhY2tzLmRlc3Ryb3llZC5wdXNoKGNiKTtcbn07XG5CbGF6ZS5WaWV3LnByb3RvdHlwZS5yZW1vdmVWaWV3RGVzdHJveWVkTGlzdGVuZXIgPSBmdW5jdGlvbiAoY2IpIHtcbiAgY29uc3QgZGVzdHJveWVkID0gdGhpcy5fY2FsbGJhY2tzLmRlc3Ryb3llZDtcbiAgaWYgKCEgZGVzdHJveWVkKVxuICAgIHJldHVybjtcbiAgY29uc3QgaW5kZXggPSBkZXN0cm95ZWQubGFzdEluZGV4T2YoY2IpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgLy8gWFhYIFlvdSdkIHRoaW5rIHRoZSByaWdodCB0aGluZyB0byBkbyB3b3VsZCBiZSBzcGxpY2UsIGJ1dCBfZmlyZUNhbGxiYWNrc1xuICAgIC8vIGdldHMgc2FkIGlmIHlvdSByZW1vdmUgY2FsbGJhY2tzIHdoaWxlIGl0ZXJhdGluZyBvdmVyIHRoZSBsaXN0LiAgU2hvdWxkXG4gICAgLy8gY2hhbmdlIHRoaXMgdG8gdXNlIGNhbGxiYWNrLWhvb2sgb3IgRXZlbnRFbWl0dGVyIG9yIHNvbWV0aGluZyBlbHNlIHRoYXRcbiAgICAvLyBwcm9wZXJseSBzdXBwb3J0cyByZW1vdmFsLlxuICAgIGRlc3Ryb3llZFtpbmRleF0gPSBudWxsO1xuICB9XG59O1xuXG4vLy8gVmlldyNhdXRvcnVuKGZ1bmMpXG4vLy9cbi8vLyBTZXRzIHVwIGEgVHJhY2tlciBhdXRvcnVuIHRoYXQgaXMgXCJzY29wZWRcIiB0byB0aGlzIFZpZXcgaW4gdHdvXG4vLy8gaW1wb3J0YW50IHdheXM6IDEpIEJsYXplLmN1cnJlbnRWaWV3IGlzIGF1dG9tYXRpY2FsbHkgc2V0XG4vLy8gb24gZXZlcnkgcmUtcnVuLCBhbmQgMikgdGhlIGF1dG9ydW4gaXMgc3RvcHBlZCB3aGVuIHRoZVxuLy8vIFZpZXcgaXMgZGVzdHJveWVkLiAgQXMgd2l0aCBUcmFja2VyLmF1dG9ydW4sIHRoZSBmaXJzdCBydW4gb2Zcbi8vLyB0aGUgZnVuY3Rpb24gaXMgaW1tZWRpYXRlLCBhbmQgYSBDb21wdXRhdGlvbiBvYmplY3QgdGhhdCBjYW5cbi8vLyBiZSB1c2VkIHRvIHN0b3AgdGhlIGF1dG9ydW4gaXMgcmV0dXJuZWQuXG4vLy9cbi8vLyBWaWV3I2F1dG9ydW4gaXMgbWVhbnQgdG8gYmUgY2FsbGVkIGZyb20gVmlldyBjYWxsYmFja3MgbGlrZVxuLy8vIG9uVmlld0NyZWF0ZWQsIG9yIGZyb20gb3V0c2lkZSB0aGUgcmVuZGVyaW5nIHByb2Nlc3MuICBJdCBtYXkgbm90XG4vLy8gYmUgY2FsbGVkIGJlZm9yZSB0aGUgb25WaWV3Q3JlYXRlZCBjYWxsYmFja3MgYXJlIGZpcmVkICh0b28gZWFybHkpLFxuLy8vIG9yIGZyb20gYSByZW5kZXIoKSBtZXRob2QgKHRvbyBjb25mdXNpbmcpLlxuLy8vXG4vLy8gVHlwaWNhbGx5LCBhdXRvcnVucyB0aGF0IHVwZGF0ZSB0aGUgc3RhdGVcbi8vLyBvZiB0aGUgVmlldyAoYXMgaW4gQmxhemUuV2l0aCkgc2hvdWxkIGJlIHN0YXJ0ZWQgZnJvbSBhbiBvblZpZXdDcmVhdGVkXG4vLy8gY2FsbGJhY2suICBBdXRvcnVucyB0aGF0IHVwZGF0ZSB0aGUgRE9NIHNob3VsZCBiZSBzdGFydGVkXG4vLy8gZnJvbSBlaXRoZXIgb25WaWV3Q3JlYXRlZCAoZ3VhcmRlZCBhZ2FpbnN0IHRoZSBhYnNlbmNlIG9mXG4vLy8gdmlldy5fZG9tcmFuZ2UpLCBvciBvblZpZXdSZWFkeS5cbkJsYXplLlZpZXcucHJvdG90eXBlLmF1dG9ydW4gPSBmdW5jdGlvbiAoZiwgX2luVmlld1Njb3BlLCBkaXNwbGF5TmFtZSkge1xuICBjb25zdCBzZWxmID0gdGhpcztcblxuICAvLyBUaGUgcmVzdHJpY3Rpb25zIG9uIHdoZW4gVmlldyNhdXRvcnVuIGNhbiBiZSBjYWxsZWQgYXJlIGluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGJhZCBwYXR0ZXJucywgbGlrZSBjcmVhdGluZyBhIEJsYXplLlZpZXcgYW5kIGltbWVkaWF0ZWx5XG4gIC8vIGNhbGxpbmcgYXV0b3J1biBvbiBpdC4gIEEgZnJlc2hseSBjcmVhdGVkIFZpZXcgaXMgbm90IHJlYWR5IHRvXG4gIC8vIGhhdmUgbG9naWMgcnVuIG9uIGl0OyBpdCBkb2Vzbid0IGhhdmUgYSBwYXJlbnRWaWV3LCBmb3IgZXhhbXBsZS5cbiAgLy8gSXQncyB3aGVuIHRoZSBWaWV3IGlzIG1hdGVyaWFsaXplZCBvciBleHBhbmRlZCB0aGF0IHRoZSBvblZpZXdDcmVhdGVkXG4gIC8vIGhhbmRsZXJzIGFyZSBmaXJlZCBhbmQgdGhlIFZpZXcgc3RhcnRzIHVwLlxuICAvL1xuICAvLyBMZXR0aW5nIHRoZSByZW5kZXIoKSBtZXRob2QgY2FsbCBgdGhpcy5hdXRvcnVuKClgIGlzIHByb2JsZW1hdGljXG4gIC8vIGJlY2F1c2Ugb2YgcmUtcmVuZGVyLiAgVGhlIGJlc3Qgd2UgY2FuIGRvIGlzIHRvIHN0b3AgdGhlIG9sZFxuICAvLyBhdXRvcnVuIGFuZCBzdGFydCBhIG5ldyBvbmUgZm9yIGVhY2ggcmVuZGVyLCBidXQgdGhhdCdzIGEgcGF0dGVyblxuICAvLyB3ZSB0cnkgdG8gYXZvaWQgaW50ZXJuYWxseSBiZWNhdXNlIGl0IGxlYWRzIHRvIGhlbHBlcnMgYmVpbmdcbiAgLy8gY2FsbGVkIGV4dHJhIHRpbWVzLCBpbiB0aGUgY2FzZSB3aGVyZSB0aGUgYXV0b3J1biBjYXVzZXMgdGhlXG4gIC8vIHZpZXcgdG8gcmUtcmVuZGVyIChhbmQgdGh1cyB0aGUgYXV0b3J1biB0byBiZSB0b3JuIGRvd24gYW5kIGFcbiAgLy8gbmV3IG9uZSBlc3RhYmxpc2hlZCkuXG4gIC8vXG4gIC8vIFdlIGNvdWxkIGxpZnQgdGhlc2UgcmVzdHJpY3Rpb25zIGluIHZhcmlvdXMgd2F5cy4gIE9uZSBpbnRlcmVzdGluZ1xuICAvLyBpZGVhIGlzIHRvIGFsbG93IHlvdSB0byBjYWxsIGB2aWV3LmF1dG9ydW5gIGFmdGVyIGluc3RhbnRpYXRpbmdcbiAgLy8gYHZpZXdgLCBhbmQgYXV0b21hdGljYWxseSB3cmFwIGl0IGluIGB2aWV3Lm9uVmlld0NyZWF0ZWRgLCBkZWZlcnJpbmdcbiAgLy8gdGhlIGF1dG9ydW4gc28gdGhhdCBpdCBzdGFydHMgYXQgYW4gYXBwcm9wcmlhdGUgdGltZS4gIEhvd2V2ZXIsXG4gIC8vIHRoZW4gd2UgY2FuJ3QgcmV0dXJuIHRoZSBDb21wdXRhdGlvbiBvYmplY3QgdG8gdGhlIGNhbGxlciwgYmVjYXVzZVxuICAvLyBpdCBkb2Vzbid0IGV4aXN0IHlldC5cbiAgaWYgKCEgc2VsZi5pc0NyZWF0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJWaWV3I2F1dG9ydW4gbXVzdCBiZSBjYWxsZWQgZnJvbSB0aGUgY3JlYXRlZCBjYWxsYmFjayBhdCB0aGUgZWFybGllc3RcIik7XG4gIH1cbiAgaWYgKHRoaXMuX2lzSW5SZW5kZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjYWxsIFZpZXcjYXV0b3J1biBmcm9tIGluc2lkZSByZW5kZXIoKTsgdHJ5IGNhbGxpbmcgaXQgZnJvbSB0aGUgY3JlYXRlZCBvciByZW5kZXJlZCBjYWxsYmFja1wiKTtcbiAgfVxuXG4gIGNvbnN0IHRlbXBsYXRlSW5zdGFuY2VGdW5jID0gQmxhemUuVGVtcGxhdGUuX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYztcblxuICBjb25zdCBmdW5jID0gZnVuY3Rpb24gdmlld0F1dG9ydW4oYykge1xuICAgIHJldHVybiBCbGF6ZS5fd2l0aEN1cnJlbnRWaWV3KF9pblZpZXdTY29wZSB8fCBzZWxmLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gQmxhemUuVGVtcGxhdGUuX3dpdGhUZW1wbGF0ZUluc3RhbmNlRnVuYyhcbiAgICAgICAgdGVtcGxhdGVJbnN0YW5jZUZ1bmMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gZi5jYWxsKHNlbGYsIGMpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBHaXZlIHRoZSBhdXRvcnVuIGZ1bmN0aW9uIGEgYmV0dGVyIG5hbWUgZm9yIGRlYnVnZ2luZyBhbmQgcHJvZmlsaW5nLlxuICAvLyBUaGUgYGRpc3BsYXlOYW1lYCBwcm9wZXJ0eSBpcyBub3QgcGFydCBvZiB0aGUgc3BlYyBidXQgYnJvd3NlcnMgbGlrZSBDaHJvbWVcbiAgLy8gYW5kIEZpcmVmb3ggcHJlZmVyIGl0IGluIGRlYnVnZ2VycyBvdmVyIHRoZSBuYW1lIGZ1bmN0aW9uIHdhcyBkZWNsYXJlZCBieS5cbiAgZnVuYy5kaXNwbGF5TmFtZSA9XG4gICAgKHNlbGYubmFtZSB8fCAnYW5vbnltb3VzJykgKyAnOicgKyAoZGlzcGxheU5hbWUgfHwgJ2Fub255bW91cycpO1xuICBjb25zdCBjb21wID0gVHJhY2tlci5hdXRvcnVuKGZ1bmMpO1xuXG4gIGNvbnN0IHN0b3BDb21wdXRhdGlvbiA9IGZ1bmN0aW9uICgpIHsgY29tcC5zdG9wKCk7IH07XG4gIHNlbGYub25WaWV3RGVzdHJveWVkKHN0b3BDb21wdXRhdGlvbik7XG4gIGNvbXAub25TdG9wKGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLnJlbW92ZVZpZXdEZXN0cm95ZWRMaXN0ZW5lcihzdG9wQ29tcHV0YXRpb24pO1xuICB9KTtcblxuICByZXR1cm4gY29tcDtcbn07XG5cbkJsYXplLlZpZXcucHJvdG90eXBlLl9lcnJvcklmU2hvdWxkbnRDYWxsU3Vic2NyaWJlID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcblxuICBpZiAoISBzZWxmLmlzQ3JlYXRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlZpZXcjc3Vic2NyaWJlIG11c3QgYmUgY2FsbGVkIGZyb20gdGhlIGNyZWF0ZWQgY2FsbGJhY2sgYXQgdGhlIGVhcmxpZXN0XCIpO1xuICB9XG4gIGlmIChzZWxmLl9pc0luUmVuZGVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY2FsbCBWaWV3I3N1YnNjcmliZSBmcm9tIGluc2lkZSByZW5kZXIoKTsgdHJ5IGNhbGxpbmcgaXQgZnJvbSB0aGUgY3JlYXRlZCBvciByZW5kZXJlZCBjYWxsYmFja1wiKTtcbiAgfVxuICBpZiAoc2VsZi5pc0Rlc3Ryb3llZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNhbGwgVmlldyNzdWJzY3JpYmUgZnJvbSBpbnNpZGUgdGhlIGRlc3Ryb3llZCBjYWxsYmFjaywgdHJ5IGNhbGxpbmcgaXQgaW5zaWRlIGNyZWF0ZWQgb3IgcmVuZGVyZWQuXCIpO1xuICB9XG59O1xuXG4vKipcbiAqIEp1c3QgbGlrZSBCbGF6ZS5WaWV3I2F1dG9ydW4sIGJ1dCB3aXRoIE1ldGVvci5zdWJzY3JpYmUgaW5zdGVhZCBvZlxuICogVHJhY2tlci5hdXRvcnVuLiBTdG9wIHRoZSBzdWJzY3JpcHRpb24gd2hlbiB0aGUgdmlldyBpcyBkZXN0cm95ZWQuXG4gKiBAcmV0dXJuIHtTdWJzY3JpcHRpb25IYW5kbGV9IEEgaGFuZGxlIHRvIHRoZSBzdWJzY3JpcHRpb24gc28gdGhhdCB5b3UgY2FuXG4gKiBzZWUgaWYgaXQgaXMgcmVhZHksIG9yIHN0b3AgaXQgbWFudWFsbHlcbiAqL1xuQmxhemUuVmlldy5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKGFyZ3MsIG9wdGlvbnMpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHNlbGYuX2Vycm9ySWZTaG91bGRudENhbGxTdWJzY3JpYmUoKTtcblxuICBsZXQgc3ViSGFuZGxlO1xuICBpZiAob3B0aW9ucy5jb25uZWN0aW9uKSB7XG4gICAgc3ViSGFuZGxlID0gb3B0aW9ucy5jb25uZWN0aW9uLnN1YnNjcmliZS5hcHBseShvcHRpb25zLmNvbm5lY3Rpb24sIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHN1YkhhbmRsZSA9IE1ldGVvci5zdWJzY3JpYmUuYXBwbHkoTWV0ZW9yLCBhcmdzKTtcbiAgfVxuXG4gIHNlbGYub25WaWV3RGVzdHJveWVkKGZ1bmN0aW9uICgpIHtcbiAgICBzdWJIYW5kbGUuc3RvcCgpO1xuICB9KTtcblxuICByZXR1cm4gc3ViSGFuZGxlO1xufTtcblxuQmxhemUuVmlldy5wcm90b3R5cGUuZmlyc3ROb2RlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoISB0aGlzLl9pc0F0dGFjaGVkKVxuICAgIHRocm93IG5ldyBFcnJvcihcIlZpZXcgbXVzdCBiZSBhdHRhY2hlZCBiZWZvcmUgYWNjZXNzaW5nIGl0cyBET01cIik7XG5cbiAgcmV0dXJuIHRoaXMuX2RvbXJhbmdlLmZpcnN0Tm9kZSgpO1xufTtcblxuQmxhemUuVmlldy5wcm90b3R5cGUubGFzdE5vZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghIHRoaXMuX2lzQXR0YWNoZWQpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVmlldyBtdXN0IGJlIGF0dGFjaGVkIGJlZm9yZSBhY2Nlc3NpbmcgaXRzIERPTVwiKTtcblxuICByZXR1cm4gdGhpcy5fZG9tcmFuZ2UubGFzdE5vZGUoKTtcbn07XG5cbkJsYXplLl9maXJlQ2FsbGJhY2tzID0gZnVuY3Rpb24gKHZpZXcsIHdoaWNoKSB7XG4gIEJsYXplLl93aXRoQ3VycmVudFZpZXcodmlldywgZnVuY3Rpb24gKCkge1xuICAgIFRyYWNrZXIubm9ucmVhY3RpdmUoZnVuY3Rpb24gZmlyZUNhbGxiYWNrcygpIHtcbiAgICAgIGNvbnN0IGNicyA9IHZpZXcuX2NhbGxiYWNrc1t3aGljaF07XG4gICAgICBmb3IgKGxldCBpID0gMCwgTiA9IChjYnMgJiYgY2JzLmxlbmd0aCk7IGkgPCBOOyBpKyspXG4gICAgICAgIGNic1tpXSAmJiBjYnNbaV0uY2FsbCh2aWV3KTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5CbGF6ZS5fY3JlYXRlVmlldyA9IGZ1bmN0aW9uICh2aWV3LCBwYXJlbnRWaWV3LCBmb3JFeHBhbnNpb24pIHtcbiAgaWYgKHZpZXcuaXNDcmVhdGVkKVxuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJlbmRlciB0aGUgc2FtZSBWaWV3IHR3aWNlXCIpO1xuXG4gIHZpZXcucGFyZW50VmlldyA9IChwYXJlbnRWaWV3IHx8IG51bGwpO1xuICB2aWV3LmlzQ3JlYXRlZCA9IHRydWU7XG4gIGlmIChmb3JFeHBhbnNpb24pXG4gICAgdmlldy5faXNDcmVhdGVkRm9yRXhwYW5zaW9uID0gdHJ1ZTtcblxuICBCbGF6ZS5fZmlyZUNhbGxiYWNrcyh2aWV3LCAnY3JlYXRlZCcpO1xufTtcblxuY29uc3QgZG9GaXJzdFJlbmRlciA9IGZ1bmN0aW9uICh2aWV3LCBpbml0aWFsQ29udGVudCkge1xuICBjb25zdCBkb21yYW5nZSA9IG5ldyBCbGF6ZS5fRE9NUmFuZ2UoaW5pdGlhbENvbnRlbnQpO1xuICB2aWV3Ll9kb21yYW5nZSA9IGRvbXJhbmdlO1xuICBkb21yYW5nZS52aWV3ID0gdmlldztcbiAgdmlldy5pc1JlbmRlcmVkID0gdHJ1ZTtcbiAgQmxhemUuX2ZpcmVDYWxsYmFja3ModmlldywgJ3JlbmRlcmVkJyk7XG5cbiAgbGV0IHRlYXJkb3duSG9vayA9IG51bGw7XG5cbiAgZG9tcmFuZ2Uub25BdHRhY2hlZChmdW5jdGlvbiBhdHRhY2hlZChyYW5nZSwgZWxlbWVudCkge1xuICAgIHZpZXcuX2lzQXR0YWNoZWQgPSB0cnVlO1xuXG4gICAgdGVhcmRvd25Ib29rID0gQmxhemUuX0RPTUJhY2tlbmQuVGVhcmRvd24ub25FbGVtZW50VGVhcmRvd24oXG4gICAgICBlbGVtZW50LCBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICAgICAgQmxhemUuX2Rlc3Ryb3lWaWV3KHZpZXcsIHRydWUgLyogX3NraXBOb2RlcyAqLyk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy8gdGVhciBkb3duIHRoZSB0ZWFyZG93biBob29rXG4gIHZpZXcub25WaWV3RGVzdHJveWVkKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGVhcmRvd25Ib29rKSB0ZWFyZG93bkhvb2suc3RvcCgpO1xuICAgIHRlYXJkb3duSG9vayA9IG51bGw7XG4gIH0pO1xuXG4gIHJldHVybiBkb21yYW5nZTtcbn07XG5cbi8vIFRha2UgYW4gdW5jcmVhdGVkIFZpZXcgYHZpZXdgIGFuZCBjcmVhdGUgYW5kIHJlbmRlciBpdCB0byBET00sXG4vLyBzZXR0aW5nIHVwIHRoZSBhdXRvcnVuIHRoYXQgdXBkYXRlcyB0aGUgVmlldy4gIFJldHVybnMgYSBuZXdcbi8vIERPTVJhbmdlLCB3aGljaCBoYXMgYmVlbiBhc3NvY2lhdGVkIHdpdGggdGhlIFZpZXcuXG4vL1xuLy8gVGhlIHByaXZhdGUgYXJndW1lbnRzIGBfd29ya1N0YWNrYCBhbmQgYF9pbnRvQXJyYXlgIGFyZSBwYXNzZWQgaW5cbi8vIGJ5IEJsYXplLl9tYXRlcmlhbGl6ZURPTSBhbmQgYXJlIG9ubHkgcHJlc2VudCBmb3IgcmVjdXJzaXZlIGNhbGxzXG4vLyAod2hlbiB0aGVyZSBpcyBzb21lIG90aGVyIF9tYXRlcmlhbGl6ZVZpZXcgb24gdGhlIHN0YWNrKS4gIElmXG4vLyBwcm92aWRlZCwgdGhlbiB3ZSBhdm9pZCB0aGUgbXV0dWFsIHJlY3Vyc2lvbiBvZiBjYWxsaW5nIGJhY2sgaW50b1xuLy8gQmxhemUuX21hdGVyaWFsaXplRE9NIHNvIHRoYXQgZGVlcCBWaWV3IGhpZXJhcmNoaWVzIGRvbid0IGJsb3cgdGhlXG4vLyBzdGFjay4gIEluc3RlYWQsIHdlIHB1c2ggdGFza3Mgb250byB3b3JrU3RhY2sgZm9yIHRoZSBpbml0aWFsXG4vLyByZW5kZXJpbmcgYW5kIHN1YnNlcXVlbnQgc2V0dXAgb2YgdGhlIFZpZXcsIGFuZCB0aGV5IGFyZSBkb25lIGFmdGVyXG4vLyB3ZSByZXR1cm4uICBXaGVuIHRoZXJlIGlzIGEgX3dvcmtTdGFjaywgd2UgZG8gbm90IHJldHVybiB0aGUgbmV3XG4vLyBET01SYW5nZSwgYnV0IGluc3RlYWQgcHVzaCBpdCBpbnRvIF9pbnRvQXJyYXkgZnJvbSBhIF93b3JrU3RhY2tcbi8vIHRhc2suXG5CbGF6ZS5fbWF0ZXJpYWxpemVWaWV3ID0gZnVuY3Rpb24gKHZpZXcsIHBhcmVudFZpZXcsIF93b3JrU3RhY2ssIF9pbnRvQXJyYXkpIHtcbiAgQmxhemUuX2NyZWF0ZVZpZXcodmlldywgcGFyZW50Vmlldyk7XG5cbiAgbGV0IGRvbXJhbmdlO1xuICBsZXQgbGFzdEh0bWxqcztcbiAgLy8gV2UgZG9uJ3QgZXhwZWN0IHRvIGJlIGNhbGxlZCBpbiBhIENvbXB1dGF0aW9uLCBidXQganVzdCBpbiBjYXNlLFxuICAvLyB3cmFwIGluIFRyYWNrZXIubm9ucmVhY3RpdmUuXG4gIFRyYWNrZXIubm9ucmVhY3RpdmUoZnVuY3Rpb24gKCkge1xuICAgIHZpZXcuYXV0b3J1bihmdW5jdGlvbiBkb1JlbmRlcihjKSB7XG4gICAgICAvLyBgdmlldy5hdXRvcnVuYCBzZXRzIHRoZSBjdXJyZW50IHZpZXcuXG4gICAgICB2aWV3LnJlbmRlckNvdW50ID0gdmlldy5yZW5kZXJDb3VudCArIDE7XG4gICAgICB2aWV3Ll9pc0luUmVuZGVyID0gdHJ1ZTtcbiAgICAgIC8vIEFueSBkZXBlbmRlbmNpZXMgdGhhdCBzaG91bGQgaW52YWxpZGF0ZSB0aGlzIENvbXB1dGF0aW9uIGNvbWVcbiAgICAgIC8vIGZyb20gdGhpcyBsaW5lOlxuICAgICAgY29uc3QgaHRtbGpzID0gdmlldy5fcmVuZGVyKCk7XG4gICAgICB2aWV3Ll9pc0luUmVuZGVyID0gZmFsc2U7XG5cbiAgICAgIGlmICghIGMuZmlyc3RSdW4gJiYgISBCbGF6ZS5faXNDb250ZW50RXF1YWwobGFzdEh0bWxqcywgaHRtbGpzKSkge1xuICAgICAgICBUcmFja2VyLm5vbnJlYWN0aXZlKGZ1bmN0aW9uIGRvTWF0ZXJpYWxpemUoKSB7XG4gICAgICAgICAgLy8gcmUtcmVuZGVyXG4gICAgICAgICAgY29uc3QgcmFuZ2VzQW5kTm9kZXMgPSBCbGF6ZS5fbWF0ZXJpYWxpemVET00oaHRtbGpzLCBbXSwgdmlldyk7XG4gICAgICAgICAgZG9tcmFuZ2Uuc2V0TWVtYmVycyhyYW5nZXNBbmROb2Rlcyk7XG4gICAgICAgICAgQmxhemUuX2ZpcmVDYWxsYmFja3ModmlldywgJ3JlbmRlcmVkJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgbGFzdEh0bWxqcyA9IGh0bWxqcztcblxuICAgICAgLy8gQ2F1c2VzIGFueSBuZXN0ZWQgdmlld3MgdG8gc3RvcCBpbW1lZGlhdGVseSwgbm90IHdoZW4gd2UgY2FsbFxuICAgICAgLy8gYHNldE1lbWJlcnNgIHRoZSBuZXh0IHRpbWUgYXJvdW5kIHRoZSBhdXRvcnVuLiAgT3RoZXJ3aXNlLFxuICAgICAgLy8gaGVscGVycyBpbiB0aGUgRE9NIHRyZWUgdG8gYmUgcmVwbGFjZWQgbWlnaHQgYmUgc2NoZWR1bGVkXG4gICAgICAvLyB0byByZS1ydW4gYmVmb3JlIHdlIGhhdmUgYSBjaGFuY2UgdG8gc3RvcCB0aGVtLlxuICAgICAgVHJhY2tlci5vbkludmFsaWRhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZG9tcmFuZ2UpIHtcbiAgICAgICAgICBkb21yYW5nZS5kZXN0cm95TWVtYmVycygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCB1bmRlZmluZWQsICdtYXRlcmlhbGl6ZScpO1xuXG4gICAgLy8gZmlyc3QgcmVuZGVyLiAgbGFzdEh0bWxqcyBpcyB0aGUgZmlyc3QgaHRtbGpzLlxuICAgIGxldCBpbml0aWFsQ29udGVudHM7XG4gICAgaWYgKCEgX3dvcmtTdGFjaykge1xuICAgICAgaW5pdGlhbENvbnRlbnRzID0gQmxhemUuX21hdGVyaWFsaXplRE9NKGxhc3RIdG1sanMsIFtdLCB2aWV3KTtcbiAgICAgIGRvbXJhbmdlID0gZG9GaXJzdFJlbmRlcih2aWV3LCBpbml0aWFsQ29udGVudHMpO1xuICAgICAgaW5pdGlhbENvbnRlbnRzID0gbnVsbDsgLy8gaGVscCBHQyBiZWNhdXNlIHdlIGNsb3NlIG92ZXIgdGhpcyBzY29wZSBhIGxvdFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXZSdyZSBiZWluZyBjYWxsZWQgZnJvbSBCbGF6ZS5fbWF0ZXJpYWxpemVET00sIHNvIHRvIGF2b2lkXG4gICAgICAvLyByZWN1cnNpb24gYW5kIHNhdmUgc3RhY2sgc3BhY2UsIHByb3ZpZGUgYSBkZXNjcmlwdGlvbiBvZiB0aGVcbiAgICAgIC8vIHdvcmsgdG8gYmUgZG9uZSBpbnN0ZWFkIG9mIGRvaW5nIGl0LiAgVGFza3MgcHVzaGVkIG9udG9cbiAgICAgIC8vIF93b3JrU3RhY2sgd2lsbCBiZSBkb25lIGluIExJRk8gb3JkZXIgYWZ0ZXIgd2UgcmV0dXJuLlxuICAgICAgLy8gVGhlIHdvcmsgd2lsbCBzdGlsbCBiZSBkb25lIHdpdGhpbiBhIFRyYWNrZXIubm9ucmVhY3RpdmUsXG4gICAgICAvLyBiZWNhdXNlIGl0IHdpbGwgYmUgZG9uZSBieSBzb21lIGNhbGwgdG8gQmxhemUuX21hdGVyaWFsaXplRE9NXG4gICAgICAvLyAod2hpY2ggaXMgYWx3YXlzIGNhbGxlZCBpbiBhIFRyYWNrZXIubm9ucmVhY3RpdmUpLlxuICAgICAgaW5pdGlhbENvbnRlbnRzID0gW107XG4gICAgICAvLyBwdXNoIHRoaXMgZnVuY3Rpb24gZmlyc3Qgc28gdGhhdCBpdCBoYXBwZW5zIGxhc3RcbiAgICAgIF93b3JrU3RhY2sucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvbXJhbmdlID0gZG9GaXJzdFJlbmRlcih2aWV3LCBpbml0aWFsQ29udGVudHMpO1xuICAgICAgICBpbml0aWFsQ29udGVudHMgPSBudWxsOyAvLyBoZWxwIEdDIGJlY2F1c2Ugb2YgYWxsIHRoZSBjbG9zdXJlcyBoZXJlXG4gICAgICAgIF9pbnRvQXJyYXkucHVzaChkb21yYW5nZSk7XG4gICAgICB9KTtcbiAgICAgIC8vIG5vdyBwdXNoIHRoZSB0YXNrIHRoYXQgY2FsY3VsYXRlcyBpbml0aWFsQ29udGVudHNcbiAgICAgIF93b3JrU3RhY2sucHVzaChCbGF6ZS5fYmluZChCbGF6ZS5fbWF0ZXJpYWxpemVET00sIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RIdG1sanMsIGluaXRpYWxDb250ZW50cywgdmlldywgX3dvcmtTdGFjaykpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKCEgX3dvcmtTdGFjaykge1xuICAgIHJldHVybiBkb21yYW5nZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuLy8gRXhwYW5kcyBhIFZpZXcgdG8gSFRNTGpzLCBjYWxsaW5nIGByZW5kZXJgIHJlY3Vyc2l2ZWx5IG9uIGFsbFxuLy8gVmlld3MgYW5kIGV2YWx1YXRpbmcgYW55IGR5bmFtaWMgYXR0cmlidXRlcy4gIENhbGxzIHRoZSBgY3JlYXRlZGBcbi8vIGNhbGxiYWNrLCBidXQgbm90IHRoZSBgbWF0ZXJpYWxpemVkYCBvciBgcmVuZGVyZWRgIGNhbGxiYWNrcy5cbi8vIERlc3Ryb3lzIHRoZSB2aWV3IGltbWVkaWF0ZWx5LCB1bmxlc3MgY2FsbGVkIGluIGEgVHJhY2tlciBDb21wdXRhdGlvbixcbi8vIGluIHdoaWNoIGNhc2UgdGhlIHZpZXcgd2lsbCBiZSBkZXN0cm95ZWQgd2hlbiB0aGUgQ29tcHV0YXRpb24gaXNcbi8vIGludmFsaWRhdGVkLiAgSWYgY2FsbGVkIGluIGEgVHJhY2tlciBDb21wdXRhdGlvbiwgdGhlIHJlc3VsdCBpcyBhXG4vLyByZWFjdGl2ZSBzdHJpbmc7IHRoYXQgaXMsIHRoZSBDb21wdXRhdGlvbiB3aWxsIGJlIGludmFsaWRhdGVkXG4vLyBpZiBhbnkgY2hhbmdlcyBhcmUgbWFkZSB0byB0aGUgdmlldyBvciBzdWJ2aWV3cyB0aGF0IG1pZ2h0IGFmZmVjdFxuLy8gdGhlIEhUTUwuXG5CbGF6ZS5fZXhwYW5kVmlldyA9IGZ1bmN0aW9uICh2aWV3LCBwYXJlbnRWaWV3KSB7XG4gIEJsYXplLl9jcmVhdGVWaWV3KHZpZXcsIHBhcmVudFZpZXcsIHRydWUgLypmb3JFeHBhbnNpb24qLyk7XG5cbiAgdmlldy5faXNJblJlbmRlciA9IHRydWU7XG4gIGNvbnN0IGh0bWxqcyA9IEJsYXplLl93aXRoQ3VycmVudFZpZXcodmlldywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2aWV3Ll9yZW5kZXIoKTtcbiAgfSk7XG4gIHZpZXcuX2lzSW5SZW5kZXIgPSBmYWxzZTtcblxuICBjb25zdCByZXN1bHQgPSBCbGF6ZS5fZXhwYW5kKGh0bWxqcywgdmlldyk7XG5cbiAgaWYgKFRyYWNrZXIuYWN0aXZlKSB7XG4gICAgVHJhY2tlci5vbkludmFsaWRhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgQmxhemUuX2Rlc3Ryb3lWaWV3KHZpZXcpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIEJsYXplLl9kZXN0cm95Vmlldyh2aWV3KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyBPcHRpb25zOiBgcGFyZW50Vmlld2BcbkJsYXplLl9IVE1MSlNFeHBhbmRlciA9IEhUTUwuVHJhbnNmb3JtaW5nVmlzaXRvci5leHRlbmQoKTtcbkJsYXplLl9IVE1MSlNFeHBhbmRlci5kZWYoe1xuICB2aXNpdE9iamVjdDogZnVuY3Rpb24gKHgpIHtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIEJsYXplLlRlbXBsYXRlKVxuICAgICAgeCA9IHguY29uc3RydWN0VmlldygpO1xuICAgIGlmICh4IGluc3RhbmNlb2YgQmxhemUuVmlldylcbiAgICAgIHJldHVybiBCbGF6ZS5fZXhwYW5kVmlldyh4LCB0aGlzLnBhcmVudFZpZXcpO1xuXG4gICAgLy8gdGhpcyB3aWxsIHRocm93IGFuIGVycm9yOyBvdGhlciBvYmplY3RzIGFyZSBub3QgYWxsb3dlZCFcbiAgICByZXR1cm4gSFRNTC5UcmFuc2Zvcm1pbmdWaXNpdG9yLnByb3RvdHlwZS52aXNpdE9iamVjdC5jYWxsKHRoaXMsIHgpO1xuICB9LFxuICB2aXNpdEF0dHJpYnV0ZXM6IGZ1bmN0aW9uIChhdHRycykge1xuICAgIC8vIGV4cGFuZCBkeW5hbWljIGF0dHJpYnV0ZXNcbiAgICBpZiAodHlwZW9mIGF0dHJzID09PSAnZnVuY3Rpb24nKVxuICAgICAgYXR0cnMgPSBCbGF6ZS5fd2l0aEN1cnJlbnRWaWV3KHRoaXMucGFyZW50VmlldywgYXR0cnMpO1xuXG4gICAgLy8gY2FsbCBzdXBlciAoZS5nLiBmb3IgY2FzZSB3aGVyZSBgYXR0cnNgIGlzIGFuIGFycmF5KVxuICAgIHJldHVybiBIVE1MLlRyYW5zZm9ybWluZ1Zpc2l0b3IucHJvdG90eXBlLnZpc2l0QXR0cmlidXRlcy5jYWxsKHRoaXMsIGF0dHJzKTtcbiAgfSxcbiAgdmlzaXRBdHRyaWJ1dGU6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgdGFnKSB7XG4gICAgLy8gZXhwYW5kIGF0dHJpYnV0ZSB2YWx1ZXMgdGhhdCBhcmUgZnVuY3Rpb25zLiAgQW55IGF0dHJpYnV0ZSB2YWx1ZVxuICAgIC8vIHRoYXQgY29udGFpbnMgVmlld3MgbXVzdCBiZSB3cmFwcGVkIGluIGEgZnVuY3Rpb24uXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgIHZhbHVlID0gQmxhemUuX3dpdGhDdXJyZW50Vmlldyh0aGlzLnBhcmVudFZpZXcsIHZhbHVlKTtcblxuICAgIHJldHVybiBIVE1MLlRyYW5zZm9ybWluZ1Zpc2l0b3IucHJvdG90eXBlLnZpc2l0QXR0cmlidXRlLmNhbGwoXG4gICAgICB0aGlzLCBuYW1lLCB2YWx1ZSwgdGFnKTtcbiAgfVxufSk7XG5cbi8vIFJldHVybiBCbGF6ZS5jdXJyZW50VmlldywgYnV0IG9ubHkgaWYgaXQgaXMgYmVpbmcgcmVuZGVyZWRcbi8vIChpLmUuIHdlIGFyZSBpbiBpdHMgcmVuZGVyKCkgbWV0aG9kKS5cbmNvbnN0IGN1cnJlbnRWaWV3SWZSZW5kZXJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHZpZXcgPSBCbGF6ZS5jdXJyZW50VmlldztcbiAgcmV0dXJuICh2aWV3ICYmIHZpZXcuX2lzSW5SZW5kZXIpID8gdmlldyA6IG51bGw7XG59O1xuXG5CbGF6ZS5fZXhwYW5kID0gZnVuY3Rpb24gKGh0bWxqcywgcGFyZW50Vmlldykge1xuICBwYXJlbnRWaWV3ID0gcGFyZW50VmlldyB8fCBjdXJyZW50Vmlld0lmUmVuZGVyaW5nKCk7XG4gIHJldHVybiAobmV3IEJsYXplLl9IVE1MSlNFeHBhbmRlcihcbiAgICB7cGFyZW50VmlldzogcGFyZW50Vmlld30pKS52aXNpdChodG1sanMpO1xufTtcblxuQmxhemUuX2V4cGFuZEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoYXR0cnMsIHBhcmVudFZpZXcpIHtcbiAgcGFyZW50VmlldyA9IHBhcmVudFZpZXcgfHwgY3VycmVudFZpZXdJZlJlbmRlcmluZygpO1xuICBjb25zdCBleHBhbmRlZCA9IChuZXcgQmxhemUuX0hUTUxKU0V4cGFuZGVyKFxuICAgIHtwYXJlbnRWaWV3OiBwYXJlbnRWaWV3fSkpLnZpc2l0QXR0cmlidXRlcyhhdHRycyk7XG4gIHJldHVybiBleHBhbmRlZCB8fCB7fTtcbn07XG5cbkJsYXplLl9kZXN0cm95VmlldyA9IGZ1bmN0aW9uICh2aWV3LCBfc2tpcE5vZGVzKSB7XG4gIGlmICh2aWV3LmlzRGVzdHJveWVkKVxuICAgIHJldHVybjtcbiAgdmlldy5pc0Rlc3Ryb3llZCA9IHRydWU7XG5cblxuICAvLyBEZXN0cm95IHZpZXdzIGFuZCBlbGVtZW50cyByZWN1cnNpdmVseS4gIElmIF9za2lwTm9kZXMsXG4gIC8vIG9ubHkgcmVjdXJzZSB1cCB0byB2aWV3cywgbm90IGVsZW1lbnRzLCBmb3IgdGhlIGNhc2Ugd2hlcmVcbiAgLy8gdGhlIGJhY2tlbmQgKGpRdWVyeSkgaXMgcmVjdXJzaW5nIG92ZXIgdGhlIGVsZW1lbnRzIGFscmVhZHkuXG5cbiAgaWYgKHZpZXcuX2RvbXJhbmdlKSB2aWV3Ll9kb21yYW5nZS5kZXN0cm95TWVtYmVycyhfc2tpcE5vZGVzKTtcblxuICAvLyBYWFg6IGZpcmUgY2FsbGJhY2tzIGFmdGVyIHBvdGVudGlhbCBtZW1iZXJzIGFyZSBkZXN0cm95ZWRcbiAgLy8gb3RoZXJ3aXNlIGl0J3MgdHJhY2tlci5mbHVzaCB3aWxsIGNhdXNlIHRoZSBhYm92ZSBsaW5lIHdpbGxcbiAgLy8gbm90IGJlIGNhbGxlZCBhbmQgdGhlaXIgdmlld3Mgd29uJ3QgYmUgZGVzdHJveWVkXG4gIC8vIEludm9sdmVkIGlzc3VlczogRE9NUmFuZ2UgXCJNdXN0IGJlIGF0dGFjaGVkXCIgZXJyb3IsIG1lbSBsZWFrXG5cbiAgQmxhemUuX2ZpcmVDYWxsYmFja3ModmlldywgJ2Rlc3Ryb3llZCcpO1xufTtcblxuQmxhemUuX2Rlc3Ryb3lOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpXG4gICAgQmxhemUuX0RPTUJhY2tlbmQuVGVhcmRvd24udGVhckRvd25FbGVtZW50KG5vZGUpO1xufTtcblxuLy8gQXJlIHRoZSBIVE1ManMgZW50aXRpZXMgYGFgIGFuZCBgYmAgdGhlIHNhbWU/ICBXZSBjb3VsZCBiZVxuLy8gbW9yZSBlbGFib3JhdGUgaGVyZSBidXQgdGhlIHBvaW50IGlzIHRvIGNhdGNoIHRoZSBtb3N0IGJhc2ljXG4vLyBjYXNlcy5cbkJsYXplLl9pc0NvbnRlbnRFcXVhbCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIGlmIChhIGluc3RhbmNlb2YgSFRNTC5SYXcpIHtcbiAgICByZXR1cm4gKGIgaW5zdGFuY2VvZiBIVE1MLlJhdykgJiYgKGEudmFsdWUgPT09IGIudmFsdWUpO1xuICB9IGVsc2UgaWYgKGEgPT0gbnVsbCkge1xuICAgIHJldHVybiAoYiA9PSBudWxsKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKGEgPT09IGIpICYmXG4gICAgICAoKHR5cGVvZiBhID09PSAnbnVtYmVyJykgfHwgKHR5cGVvZiBhID09PSAnYm9vbGVhbicpIHx8XG4gICAgICAgKHR5cGVvZiBhID09PSAnc3RyaW5nJykpO1xuICB9XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IFRoZSBWaWV3IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGN1cnJlbnQgdGVtcGxhdGUgaGVscGVyLCBldmVudCBoYW5kbGVyLCBjYWxsYmFjaywgb3IgYXV0b3J1bi4gIElmIHRoZXJlIGlzbid0IG9uZSwgYG51bGxgLlxuICogQGxvY3VzIENsaWVudFxuICogQHR5cGUge0JsYXplLlZpZXd9XG4gKi9cbkJsYXplLmN1cnJlbnRWaWV3ID0gbnVsbDtcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtCbGF6ZS5WaWV3fSB2aWV3XG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCk6IFR9IGZ1bmNcbiAqIEByZXR1cm5zIHtUfVxuICovXG5CbGF6ZS5fd2l0aEN1cnJlbnRWaWV3ID0gZnVuY3Rpb24gKHZpZXcsIGZ1bmMpIHtcbiAgY29uc3Qgb2xkVmlldyA9IEJsYXplLmN1cnJlbnRWaWV3O1xuICB0cnkge1xuICAgIEJsYXplLmN1cnJlbnRWaWV3ID0gdmlldztcbiAgICByZXR1cm4gZnVuYygpO1xuICB9IGZpbmFsbHkge1xuICAgIEJsYXplLmN1cnJlbnRWaWV3ID0gb2xkVmlldztcbiAgfVxufTtcblxuLy8gQmxhemUucmVuZGVyIHB1YmxpY2x5IHRha2VzIGEgVmlldyBvciBhIFRlbXBsYXRlLlxuLy8gUHJpdmF0ZWx5LCBpdCB0YWtlcyBhbnkgSFRNTEpTIChleHRlbmRlZCB3aXRoIFZpZXdzIGFuZCBUZW1wbGF0ZXMpXG4vLyBleGNlcHQgbnVsbCBvciB1bmRlZmluZWQsIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFueSBleHRlbmRlZFxuLy8gSFRNTEpTLlxuY29uc3QgY2hlY2tSZW5kZXJDb250ZW50ID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQgPT09IG51bGwpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcmVuZGVyIG51bGxcIik7XG4gIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcmVuZGVyIHVuZGVmaW5lZFwiKTtcblxuICBpZiAoKGNvbnRlbnQgaW5zdGFuY2VvZiBCbGF6ZS5WaWV3KSB8fFxuICAgICAgKGNvbnRlbnQgaW5zdGFuY2VvZiBCbGF6ZS5UZW1wbGF0ZSkgfHxcbiAgICAgICh0eXBlb2YgY29udGVudCA9PT0gJ2Z1bmN0aW9uJykpXG4gICAgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgLy8gVGhyb3cgaWYgY29udGVudCBkb2Vzbid0IGxvb2sgbGlrZSBIVE1MSlMgYXQgdGhlIHRvcCBsZXZlbFxuICAgIC8vIChpLmUuIHZlcmlmeSB0aGF0IHRoaXMgaXMgYW4gSFRNTC5UYWcsIG9yIGFuIGFycmF5LFxuICAgIC8vIG9yIGEgcHJpbWl0aXZlLCBldGMuKVxuICAgIChuZXcgSFRNTC5WaXNpdG9yKS52aXNpdChjb250ZW50KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIE1ha2UgZXJyb3IgbWVzc2FnZSBzdWl0YWJsZSBmb3IgcHVibGljIEFQSVxuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIFRlbXBsYXRlIG9yIFZpZXdcIik7XG4gIH1cbn07XG5cbi8vIEZvciBCbGF6ZS5yZW5kZXIgYW5kIEJsYXplLnRvSFRNTCwgdGFrZSBjb250ZW50IGFuZFxuLy8gd3JhcCBpdCBpbiBhIFZpZXcsIHVubGVzcyBpdCdzIGEgc2luZ2xlIFZpZXcgb3Jcbi8vIFRlbXBsYXRlIGFscmVhZHkuXG5jb25zdCBjb250ZW50QXNWaWV3ID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgY2hlY2tSZW5kZXJDb250ZW50KGNvbnRlbnQpO1xuXG4gIGlmIChjb250ZW50IGluc3RhbmNlb2YgQmxhemUuVGVtcGxhdGUpIHtcbiAgICByZXR1cm4gY29udGVudC5jb25zdHJ1Y3RWaWV3KCk7XG4gIH0gZWxzZSBpZiAoY29udGVudCBpbnN0YW5jZW9mIEJsYXplLlZpZXcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfSBlbHNlIHtcbiAgICBsZXQgZnVuYyA9IGNvbnRlbnQ7XG4gICAgaWYgKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBCbGF6ZS5WaWV3KCdyZW5kZXInLCBmdW5jKTtcbiAgfVxufTtcblxuLy8gRm9yIEJsYXplLnJlbmRlcldpdGhEYXRhIGFuZCBCbGF6ZS50b0hUTUxXaXRoRGF0YSwgd3JhcCBjb250ZW50XG4vLyBpbiBhIGZ1bmN0aW9uLCBpZiBuZWNlc3NhcnksIHNvIGl0IGNhbiBiZSBhIGNvbnRlbnQgYXJnIHRvXG4vLyBhIEJsYXplLldpdGguXG5jb25zdCBjb250ZW50QXNGdW5jID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgY2hlY2tSZW5kZXJDb250ZW50KGNvbnRlbnQpO1xuXG4gIGlmICh0eXBlb2YgY29udGVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG59O1xuXG5CbGF6ZS5fX3Jvb3RWaWV3cyA9IFtdO1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJlbmRlcnMgYSB0ZW1wbGF0ZSBvciBWaWV3IHRvIERPTSBub2RlcyBhbmQgaW5zZXJ0cyBpdCBpbnRvIHRoZSBET00sIHJldHVybmluZyBhIHJlbmRlcmVkIFtWaWV3XSgjQmxhemUtVmlldykgd2hpY2ggY2FuIGJlIHBhc3NlZCB0byBbYEJsYXplLnJlbW92ZWBdKCNCbGF6ZS1yZW1vdmUpLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtUZW1wbGF0ZXxCbGF6ZS5WaWV3fSB0ZW1wbGF0ZU9yVmlldyBUaGUgdGVtcGxhdGUgKGUuZy4gYFRlbXBsYXRlLm15VGVtcGxhdGVgKSBvciBWaWV3IG9iamVjdCB0byByZW5kZXIuICBJZiBhIHRlbXBsYXRlLCBhIFZpZXcgb2JqZWN0IGlzIFtjb25zdHJ1Y3RlZF0oI3RlbXBsYXRlX2NvbnN0cnVjdHZpZXcpLiAgSWYgYSBWaWV3LCBpdCBtdXN0IGJlIGFuIHVucmVuZGVyZWQgVmlldywgd2hpY2ggYmVjb21lcyBhIHJlbmRlcmVkIFZpZXcgYW5kIGlzIHJldHVybmVkLlxuICogQHBhcmFtIHtET01Ob2RlfSBwYXJlbnROb2RlIFRoZSBub2RlIHRoYXQgd2lsbCBiZSB0aGUgcGFyZW50IG9mIHRoZSByZW5kZXJlZCB0ZW1wbGF0ZS4gIEl0IG11c3QgYmUgYW4gRWxlbWVudCBub2RlLlxuICogQHBhcmFtIHtET01Ob2RlfSBbbmV4dE5vZGVdIE9wdGlvbmFsLiBJZiBwcm92aWRlZCwgbXVzdCBiZSBhIGNoaWxkIG9mIDxlbT5wYXJlbnROb2RlPC9lbT47IHRoZSB0ZW1wbGF0ZSB3aWxsIGJlIGluc2VydGVkIGJlZm9yZSB0aGlzIG5vZGUuIElmIG5vdCBwcm92aWRlZCwgdGhlIHRlbXBsYXRlIHdpbGwgYmUgaW5zZXJ0ZWQgYXMgdGhlIGxhc3QgY2hpbGQgb2YgcGFyZW50Tm9kZS5cbiAqIEBwYXJhbSB7QmxhemUuVmlld30gW3BhcmVudFZpZXddIE9wdGlvbmFsLiBJZiBwcm92aWRlZCwgaXQgd2lsbCBiZSBzZXQgYXMgdGhlIHJlbmRlcmVkIFZpZXcncyBbYHBhcmVudFZpZXdgXSgjdmlld19wYXJlbnR2aWV3KS5cbiAqL1xuQmxhemUucmVuZGVyID0gZnVuY3Rpb24gKGNvbnRlbnQsIHBhcmVudEVsZW1lbnQsIG5leHROb2RlLCBwYXJlbnRWaWV3KSB7XG4gIGlmICghIHBhcmVudEVsZW1lbnQpIHtcbiAgICBCbGF6ZS5fd2FybihcIkJsYXplLnJlbmRlciB3aXRob3V0IGEgcGFyZW50IGVsZW1lbnQgaXMgZGVwcmVjYXRlZC4gXCIgK1xuICAgICAgICAgICAgICAgIFwiWW91IG11c3Qgc3BlY2lmeSB3aGVyZSB0byBpbnNlcnQgdGhlIHJlbmRlcmVkIGNvbnRlbnQuXCIpO1xuICB9XG5cbiAgaWYgKG5leHROb2RlIGluc3RhbmNlb2YgQmxhemUuVmlldykge1xuICAgIC8vIGhhbmRsZSBvbWl0dGVkIG5leHROb2RlXG4gICAgcGFyZW50VmlldyA9IG5leHROb2RlO1xuICAgIG5leHROb2RlID0gbnVsbDtcbiAgfVxuXG4gIC8vIHBhcmVudEVsZW1lbnQgbXVzdCBiZSBhIERPTSBub2RlLiBpbiBwYXJ0aWN1bGFyLCBjYW4ndCBiZSB0aGVcbiAgLy8gcmVzdWx0IG9mIGEgY2FsbCB0byBgJGAuIENhbid0IGNoZWNrIGlmIGBwYXJlbnRFbGVtZW50IGluc3RhbmNlb2ZcbiAgLy8gTm9kZWAgc2luY2UgJ05vZGUnIGlzIHVuZGVmaW5lZCBpbiBJRTguXG4gIGlmIChwYXJlbnRFbGVtZW50ICYmIHR5cGVvZiBwYXJlbnRFbGVtZW50Lm5vZGVUeXBlICE9PSAnbnVtYmVyJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCIncGFyZW50RWxlbWVudCcgbXVzdCBiZSBhIERPTSBub2RlXCIpO1xuICBpZiAobmV4dE5vZGUgJiYgdHlwZW9mIG5leHROb2RlLm5vZGVUeXBlICE9PSAnbnVtYmVyJykgLy8gJ25leHROb2RlJyBpcyBvcHRpb25hbFxuICAgIHRocm93IG5ldyBFcnJvcihcIiduZXh0Tm9kZScgbXVzdCBiZSBhIERPTSBub2RlXCIpO1xuXG4gIHBhcmVudFZpZXcgPSBwYXJlbnRWaWV3IHx8IGN1cnJlbnRWaWV3SWZSZW5kZXJpbmcoKTtcblxuICBjb25zdCB2aWV3ID0gY29udGVudEFzVmlldyhjb250ZW50KTtcblxuICAvLyBUT0RPOiB0aGlzIGlzIG9ubHkgbmVlZGVkIGluIGRldmVsb3BtZW50XG4gIGlmICghcGFyZW50Vmlldykge1xuICAgIHZpZXcub25WaWV3Q3JlYXRlZChmdW5jdGlvbiAoKSB7XG4gICAgICBCbGF6ZS5fX3Jvb3RWaWV3cy5wdXNoKHZpZXcpO1xuICAgIH0pO1xuXG4gICAgdmlldy5vblZpZXdEZXN0cm95ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGluZGV4ID0gQmxhemUuX19yb290Vmlld3MuaW5kZXhPZih2aWV3KTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIEJsYXplLl9fcm9vdFZpZXdzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBCbGF6ZS5fbWF0ZXJpYWxpemVWaWV3KHZpZXcsIHBhcmVudFZpZXcpO1xuICBpZiAocGFyZW50RWxlbWVudCkge1xuICAgIHZpZXcuX2RvbXJhbmdlLmF0dGFjaChwYXJlbnRFbGVtZW50LCBuZXh0Tm9kZSk7XG4gIH1cblxuICByZXR1cm4gdmlldztcbn07XG5cbkJsYXplLmluc2VydCA9IGZ1bmN0aW9uICh2aWV3LCBwYXJlbnRFbGVtZW50LCBuZXh0Tm9kZSkge1xuICBCbGF6ZS5fd2FybihcIkJsYXplLmluc2VydCBoYXMgYmVlbiBkZXByZWNhdGVkLiAgU3BlY2lmeSB3aGVyZSB0byBpbnNlcnQgdGhlIFwiICtcbiAgICAgICAgICAgICAgXCJyZW5kZXJlZCBjb250ZW50IGluIHRoZSBjYWxsIHRvIEJsYXplLnJlbmRlci5cIik7XG5cbiAgaWYgKCEgKHZpZXcgJiYgKHZpZXcuX2RvbXJhbmdlIGluc3RhbmNlb2YgQmxhemUuX0RPTVJhbmdlKSkpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgdGVtcGxhdGUgcmVuZGVyZWQgd2l0aCBCbGF6ZS5yZW5kZXJcIik7XG5cbiAgdmlldy5fZG9tcmFuZ2UuYXR0YWNoKHBhcmVudEVsZW1lbnQsIG5leHROb2RlKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgUmVuZGVycyBhIHRlbXBsYXRlIG9yIFZpZXcgdG8gRE9NIG5vZGVzIHdpdGggYSBkYXRhIGNvbnRleHQuICBPdGhlcndpc2UgaWRlbnRpY2FsIHRvIGBCbGF6ZS5yZW5kZXJgLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtUZW1wbGF0ZXxCbGF6ZS5WaWV3fSB0ZW1wbGF0ZU9yVmlldyBUaGUgdGVtcGxhdGUgKGUuZy4gYFRlbXBsYXRlLm15VGVtcGxhdGVgKSBvciBWaWV3IG9iamVjdCB0byByZW5kZXIuXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gZGF0YSBUaGUgZGF0YSBjb250ZXh0IHRvIHVzZSwgb3IgYSBmdW5jdGlvbiByZXR1cm5pbmcgYSBkYXRhIGNvbnRleHQuICBJZiBhIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBpdCB3aWxsIGJlIHJlYWN0aXZlbHkgcmUtcnVuLlxuICogQHBhcmFtIHtET01Ob2RlfSBwYXJlbnROb2RlIFRoZSBub2RlIHRoYXQgd2lsbCBiZSB0aGUgcGFyZW50IG9mIHRoZSByZW5kZXJlZCB0ZW1wbGF0ZS4gIEl0IG11c3QgYmUgYW4gRWxlbWVudCBub2RlLlxuICogQHBhcmFtIHtET01Ob2RlfSBbbmV4dE5vZGVdIE9wdGlvbmFsLiBJZiBwcm92aWRlZCwgbXVzdCBiZSBhIGNoaWxkIG9mIDxlbT5wYXJlbnROb2RlPC9lbT47IHRoZSB0ZW1wbGF0ZSB3aWxsIGJlIGluc2VydGVkIGJlZm9yZSB0aGlzIG5vZGUuIElmIG5vdCBwcm92aWRlZCwgdGhlIHRlbXBsYXRlIHdpbGwgYmUgaW5zZXJ0ZWQgYXMgdGhlIGxhc3QgY2hpbGQgb2YgcGFyZW50Tm9kZS5cbiAqIEBwYXJhbSB7QmxhemUuVmlld30gW3BhcmVudFZpZXddIE9wdGlvbmFsLiBJZiBwcm92aWRlZCwgaXQgd2lsbCBiZSBzZXQgYXMgdGhlIHJlbmRlcmVkIFZpZXcncyBbYHBhcmVudFZpZXdgXSgjdmlld19wYXJlbnR2aWV3KS5cbiAqL1xuQmxhemUucmVuZGVyV2l0aERhdGEgPSBmdW5jdGlvbiAoY29udGVudCwgZGF0YSwgcGFyZW50RWxlbWVudCwgbmV4dE5vZGUsIHBhcmVudFZpZXcpIHtcbiAgLy8gV2UgZGVmZXIgdGhlIGhhbmRsaW5nIG9mIG9wdGlvbmFsIGFyZ3VtZW50cyB0byBCbGF6ZS5yZW5kZXIuICBBdCB0aGlzIHBvaW50LFxuICAvLyBgbmV4dE5vZGVgIG1heSBhY3R1YWxseSBiZSBgcGFyZW50Vmlld2AuXG4gIHJldHVybiBCbGF6ZS5yZW5kZXIoQmxhemUuX1RlbXBsYXRlV2l0aChkYXRhLCBjb250ZW50QXNGdW5jKGNvbnRlbnQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCwgbmV4dE5vZGUsIHBhcmVudFZpZXcpO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBSZW1vdmVzIGEgcmVuZGVyZWQgVmlldyBmcm9tIHRoZSBET00sIHN0b3BwaW5nIGFsbCByZWFjdGl2ZSB1cGRhdGVzIGFuZCBldmVudCBsaXN0ZW5lcnMgb24gaXQuIEFsc28gZGVzdHJveXMgdGhlIEJsYXplLlRlbXBsYXRlIGluc3RhbmNlIGFzc29jaWF0ZWQgd2l0aCB0aGUgdmlldy5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7QmxhemUuVmlld30gcmVuZGVyZWRWaWV3IFRoZSByZXR1cm4gdmFsdWUgZnJvbSBgQmxhemUucmVuZGVyYCBvciBgQmxhemUucmVuZGVyV2l0aERhdGFgLCBvciB0aGUgYHZpZXdgIHByb3BlcnR5IG9mIGEgQmxhemUuVGVtcGxhdGUgaW5zdGFuY2UuIENhbGxpbmcgYEJsYXplLnJlbW92ZShUZW1wbGF0ZS5pbnN0YW5jZSgpLnZpZXcpYCBmcm9tIHdpdGhpbiBhIHRlbXBsYXRlIGV2ZW50IGhhbmRsZXIgd2lsbCBkZXN0cm95IHRoZSB2aWV3IGFzIHdlbGwgYXMgdGhhdCB0ZW1wbGF0ZSBhbmQgdHJpZ2dlciB0aGUgdGVtcGxhdGUncyBgb25EZXN0cm95ZWRgIGhhbmRsZXJzLlxuICovXG5CbGF6ZS5yZW1vdmUgPSBmdW5jdGlvbiAodmlldykge1xuICBpZiAoISAodmlldyAmJiAodmlldy5fZG9tcmFuZ2UgaW5zdGFuY2VvZiBCbGF6ZS5fRE9NUmFuZ2UpKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCB0ZW1wbGF0ZSByZW5kZXJlZCB3aXRoIEJsYXplLnJlbmRlclwiKTtcblxuICB3aGlsZSAodmlldykge1xuICAgIGlmICghIHZpZXcuaXNEZXN0cm95ZWQpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdmlldy5fZG9tcmFuZ2U7XG4gICAgICByYW5nZS5kZXN0cm95KCk7XG5cbiAgICAgIGlmIChyYW5nZS5hdHRhY2hlZCAmJiAhIHJhbmdlLnBhcmVudFJhbmdlKSB7XG4gICAgICAgIHJhbmdlLmRldGFjaCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZpZXcgPSB2aWV3Ll9oYXNHZW5lcmF0ZWRQYXJlbnQgJiYgdmlldy5wYXJlbnRWaWV3O1xuICB9XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJlbmRlcnMgYSB0ZW1wbGF0ZSBvciBWaWV3IHRvIGEgc3RyaW5nIG9mIEhUTUwuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge1RlbXBsYXRlfEJsYXplLlZpZXd9IHRlbXBsYXRlT3JWaWV3IFRoZSB0ZW1wbGF0ZSAoZS5nLiBgVGVtcGxhdGUubXlUZW1wbGF0ZWApIG9yIFZpZXcgb2JqZWN0IGZyb20gd2hpY2ggdG8gZ2VuZXJhdGUgSFRNTC5cbiAqL1xuQmxhemUudG9IVE1MID0gZnVuY3Rpb24gKGNvbnRlbnQsIHBhcmVudFZpZXcpIHtcbiAgcGFyZW50VmlldyA9IHBhcmVudFZpZXcgfHwgY3VycmVudFZpZXdJZlJlbmRlcmluZygpO1xuXG4gIHJldHVybiBIVE1MLnRvSFRNTChCbGF6ZS5fZXhwYW5kVmlldyhjb250ZW50QXNWaWV3KGNvbnRlbnQpLCBwYXJlbnRWaWV3KSk7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJlbmRlcnMgYSB0ZW1wbGF0ZSBvciBWaWV3IHRvIEhUTUwgd2l0aCBhIGRhdGEgY29udGV4dC4gIE90aGVyd2lzZSBpZGVudGljYWwgdG8gYEJsYXplLnRvSFRNTGAuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge1RlbXBsYXRlfEJsYXplLlZpZXd9IHRlbXBsYXRlT3JWaWV3IFRoZSB0ZW1wbGF0ZSAoZS5nLiBgVGVtcGxhdGUubXlUZW1wbGF0ZWApIG9yIFZpZXcgb2JqZWN0IGZyb20gd2hpY2ggdG8gZ2VuZXJhdGUgSFRNTC5cbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBkYXRhIFRoZSBkYXRhIGNvbnRleHQgdG8gdXNlLCBvciBhIGZ1bmN0aW9uIHJldHVybmluZyBhIGRhdGEgY29udGV4dC5cbiAqL1xuQmxhemUudG9IVE1MV2l0aERhdGEgPSBmdW5jdGlvbiAoY29udGVudCwgZGF0YSwgcGFyZW50Vmlldykge1xuICBwYXJlbnRWaWV3ID0gcGFyZW50VmlldyB8fCBjdXJyZW50Vmlld0lmUmVuZGVyaW5nKCk7XG5cbiAgcmV0dXJuIEhUTUwudG9IVE1MKEJsYXplLl9leHBhbmRWaWV3KEJsYXplLl9UZW1wbGF0ZVdpdGgoXG4gICAgZGF0YSwgY29udGVudEFzRnVuYyhjb250ZW50KSksIHBhcmVudFZpZXcpKTtcbn07XG5cbkJsYXplLl90b1RleHQgPSBmdW5jdGlvbiAoaHRtbGpzLCBwYXJlbnRWaWV3LCB0ZXh0TW9kZSkge1xuICBpZiAodHlwZW9mIGh0bWxqcyA9PT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJCbGF6ZS5fdG9UZXh0IGRvZXNuJ3QgdGFrZSBhIGZ1bmN0aW9uLCBqdXN0IEhUTUxqc1wiKTtcblxuICBpZiAoKHBhcmVudFZpZXcgIT0gbnVsbCkgJiYgISAocGFyZW50VmlldyBpbnN0YW5jZW9mIEJsYXplLlZpZXcpKSB7XG4gICAgLy8gb21pdHRlZCBwYXJlbnRWaWV3IGFyZ3VtZW50XG4gICAgdGV4dE1vZGUgPSBwYXJlbnRWaWV3O1xuICAgIHBhcmVudFZpZXcgPSBudWxsO1xuICB9XG4gIHBhcmVudFZpZXcgPSBwYXJlbnRWaWV3IHx8IGN1cnJlbnRWaWV3SWZSZW5kZXJpbmcoKTtcblxuICBpZiAoISB0ZXh0TW9kZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0ZXh0TW9kZSByZXF1aXJlZFwiKTtcbiAgaWYgKCEgKHRleHRNb2RlID09PSBIVE1MLlRFWFRNT0RFLlNUUklORyB8fFxuICAgICAgICAgdGV4dE1vZGUgPT09IEhUTUwuVEVYVE1PREUuUkNEQVRBIHx8XG4gICAgICAgICB0ZXh0TW9kZSA9PT0gSFRNTC5URVhUTU9ERS5BVFRSSUJVVEUpKVxuICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGV4dE1vZGU6IFwiICsgdGV4dE1vZGUpO1xuXG4gIHJldHVybiBIVE1MLnRvVGV4dChCbGF6ZS5fZXhwYW5kKGh0bWxqcywgcGFyZW50VmlldyksIHRleHRNb2RlKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgUmV0dXJucyB0aGUgY3VycmVudCBkYXRhIGNvbnRleHQsIG9yIHRoZSBkYXRhIGNvbnRleHQgdGhhdCB3YXMgdXNlZCB3aGVuIHJlbmRlcmluZyBhIHBhcnRpY3VsYXIgRE9NIGVsZW1lbnQgb3IgVmlldyBmcm9tIGEgTWV0ZW9yIHRlbXBsYXRlLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtET01FbGVtZW50fEJsYXplLlZpZXd9IFtlbGVtZW50T3JWaWV3XSBPcHRpb25hbC4gIEFuIGVsZW1lbnQgdGhhdCB3YXMgcmVuZGVyZWQgYnkgYSBNZXRlb3IsIG9yIGEgVmlldy5cbiAqL1xuQmxhemUuZ2V0RGF0YSA9IGZ1bmN0aW9uIChlbGVtZW50T3JWaWV3KSB7XG4gIGxldCB0aGVXaXRoO1xuXG4gIGlmICghIGVsZW1lbnRPclZpZXcpIHtcbiAgICB0aGVXaXRoID0gQmxhemUuZ2V0Vmlldygnd2l0aCcpO1xuICB9IGVsc2UgaWYgKGVsZW1lbnRPclZpZXcgaW5zdGFuY2VvZiBCbGF6ZS5WaWV3KSB7XG4gICAgY29uc3QgdmlldyA9IGVsZW1lbnRPclZpZXc7XG4gICAgdGhlV2l0aCA9ICh2aWV3Lm5hbWUgPT09ICd3aXRoJyA/IHZpZXcgOlxuICAgICAgICAgICAgICAgQmxhemUuZ2V0Vmlldyh2aWV3LCAnd2l0aCcpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZWxlbWVudE9yVmlldy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoZWxlbWVudE9yVmlldy5ub2RlVHlwZSAhPT0gMSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIERPTSBlbGVtZW50XCIpO1xuICAgIHRoZVdpdGggPSBCbGF6ZS5nZXRWaWV3KGVsZW1lbnRPclZpZXcsICd3aXRoJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgRE9NIGVsZW1lbnQgb3IgVmlld1wiKTtcbiAgfVxuXG4gIHJldHVybiB0aGVXaXRoID8gdGhlV2l0aC5kYXRhVmFyLmdldCgpPy52YWx1ZSA6IG51bGw7XG59O1xuXG4vLyBGb3IgYmFjay1jb21wYXRcbkJsYXplLmdldEVsZW1lbnREYXRhID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgQmxhemUuX3dhcm4oXCJCbGF6ZS5nZXRFbGVtZW50RGF0YSBoYXMgYmVlbiBkZXByZWNhdGVkLiAgVXNlIFwiICtcbiAgICAgICAgICAgICAgXCJCbGF6ZS5nZXREYXRhKGVsZW1lbnQpIGluc3RlYWQuXCIpO1xuXG4gIGlmIChlbGVtZW50Lm5vZGVUeXBlICE9PSAxKVxuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIERPTSBlbGVtZW50XCIpO1xuXG4gIHJldHVybiBCbGF6ZS5nZXREYXRhKGVsZW1lbnQpO1xufTtcblxuLy8gQm90aCBhcmd1bWVudHMgYXJlIG9wdGlvbmFsLlxuXG4vKipcbiAqIEBzdW1tYXJ5IEdldHMgZWl0aGVyIHRoZSBjdXJyZW50IFZpZXcsIG9yIHRoZSBWaWV3IGVuY2xvc2luZyB0aGUgZ2l2ZW4gRE9NIGVsZW1lbnQuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IFtlbGVtZW50XSBPcHRpb25hbC4gIElmIHNwZWNpZmllZCwgdGhlIFZpZXcgZW5jbG9zaW5nIGBlbGVtZW50YCBpcyByZXR1cm5lZC5cbiAqL1xuQmxhemUuZ2V0VmlldyA9IGZ1bmN0aW9uIChlbGVtZW50T3JWaWV3LCBfdmlld05hbWUpIHtcbiAgbGV0IHZpZXdOYW1lID0gX3ZpZXdOYW1lO1xuXG4gIGlmICgodHlwZW9mIGVsZW1lbnRPclZpZXcpID09PSAnc3RyaW5nJykge1xuICAgIC8vIG9taXR0ZWQgZWxlbWVudE9yVmlldzsgdmlld05hbWUgcHJlc2VudFxuICAgIHZpZXdOYW1lID0gZWxlbWVudE9yVmlldztcbiAgICBlbGVtZW50T3JWaWV3ID0gbnVsbDtcbiAgfVxuXG4gIC8vIFdlIGNvdWxkIGV2ZW50dWFsbHkgc2hvcnRlbiB0aGUgY29kZSBieSBmb2xkaW5nIHRoZSBsb2dpY1xuICAvLyBmcm9tIHRoZSBvdGhlciBtZXRob2RzIGludG8gdGhpcyBtZXRob2QuXG4gIGlmICghIGVsZW1lbnRPclZpZXcpIHtcbiAgICByZXR1cm4gQmxhemUuX2dldEN1cnJlbnRWaWV3KHZpZXdOYW1lKTtcbiAgfSBlbHNlIGlmIChlbGVtZW50T3JWaWV3IGluc3RhbmNlb2YgQmxhemUuVmlldykge1xuICAgIHJldHVybiBCbGF6ZS5fZ2V0UGFyZW50VmlldyhlbGVtZW50T3JWaWV3LCB2aWV3TmFtZSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVsZW1lbnRPclZpZXcubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIEJsYXplLl9nZXRFbGVtZW50VmlldyhlbGVtZW50T3JWaWV3LCB2aWV3TmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgRE9NIGVsZW1lbnQgb3IgVmlld1wiKTtcbiAgfVxufTtcblxuLy8gR2V0cyB0aGUgY3VycmVudCB2aWV3IG9yIGl0cyBuZWFyZXN0IGFuY2VzdG9yIG9mIG5hbWVcbi8vIGBuYW1lYC5cbkJsYXplLl9nZXRDdXJyZW50VmlldyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIGxldCB2aWV3ID0gQmxhemUuY3VycmVudFZpZXc7XG4gIC8vIEJldHRlciB0byBmYWlsIGluIGNhc2VzIHdoZXJlIGl0IGRvZXNuJ3QgbWFrZSBzZW5zZVxuICAvLyB0byB1c2UgQmxhemUuX2dldEN1cnJlbnRWaWV3KCkuICBUaGVyZSB3aWxsIGJlIGEgY3VycmVudFxuICAvLyB2aWV3IGFueXdoZXJlIGl0IGRvZXMuICBZb3UgY2FuIGNoZWNrIEJsYXplLmN1cnJlbnRWaWV3XG4gIC8vIGlmIHlvdSB3YW50IHRvIGtub3cgd2hldGhlciB0aGVyZSBpcyBvbmUgb3Igbm90LlxuICBpZiAoISB2aWV3KVxuICAgIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGlzIG5vIGN1cnJlbnQgdmlld1wiKTtcblxuICBpZiAobmFtZSkge1xuICAgIHdoaWxlICh2aWV3ICYmIHZpZXcubmFtZSAhPT0gbmFtZSlcbiAgICAgIHZpZXcgPSB2aWV3LnBhcmVudFZpZXc7XG4gICAgcmV0dXJuIHZpZXcgfHwgbnVsbDtcbiAgfSBlbHNlIHtcbiAgICAvLyBCbGF6ZS5fZ2V0Q3VycmVudFZpZXcoKSB3aXRoIG5vIGFyZ3VtZW50cyBqdXN0IHJldHVybnNcbiAgICAvLyBCbGF6ZS5jdXJyZW50Vmlldy5cbiAgICByZXR1cm4gdmlldztcbiAgfVxufTtcblxuQmxhemUuX2dldFBhcmVudFZpZXcgPSBmdW5jdGlvbiAodmlldywgbmFtZSkge1xuICBsZXQgdiA9IHZpZXcucGFyZW50VmlldztcblxuICBpZiAobmFtZSkge1xuICAgIHdoaWxlICh2ICYmIHYubmFtZSAhPT0gbmFtZSlcbiAgICAgIHYgPSB2LnBhcmVudFZpZXc7XG4gIH1cblxuICByZXR1cm4gdiB8fCBudWxsO1xufTtcblxuQmxhemUuX2dldEVsZW1lbnRWaWV3ID0gZnVuY3Rpb24gKGVsZW0sIG5hbWUpIHtcbiAgbGV0IHJhbmdlID0gQmxhemUuX0RPTVJhbmdlLmZvckVsZW1lbnQoZWxlbSk7XG4gIGxldCB2aWV3ID0gbnVsbDtcbiAgd2hpbGUgKHJhbmdlICYmICEgdmlldykge1xuICAgIHZpZXcgPSAocmFuZ2UudmlldyB8fCBudWxsKTtcbiAgICBpZiAoISB2aWV3KSB7XG4gICAgICBpZiAocmFuZ2UucGFyZW50UmFuZ2UpXG4gICAgICAgIHJhbmdlID0gcmFuZ2UucGFyZW50UmFuZ2U7XG4gICAgICBlbHNlXG4gICAgICAgIHJhbmdlID0gQmxhemUuX0RPTVJhbmdlLmZvckVsZW1lbnQocmFuZ2UucGFyZW50RWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG5hbWUpIHtcbiAgICB3aGlsZSAodmlldyAmJiB2aWV3Lm5hbWUgIT09IG5hbWUpXG4gICAgICB2aWV3ID0gdmlldy5wYXJlbnRWaWV3O1xuICAgIHJldHVybiB2aWV3IHx8IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZpZXc7XG4gIH1cbn07XG5cbkJsYXplLl9hZGRFdmVudE1hcCA9IGZ1bmN0aW9uICh2aWV3LCBldmVudE1hcCwgdGhpc0luSGFuZGxlcikge1xuICB0aGlzSW5IYW5kbGVyID0gKHRoaXNJbkhhbmRsZXIgfHwgbnVsbCk7XG4gIGNvbnN0IGhhbmRsZXMgPSBbXTtcblxuICBpZiAoISB2aWV3Ll9kb21yYW5nZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJWaWV3IG11c3QgaGF2ZSBhIERPTVJhbmdlXCIpO1xuXG4gIHZpZXcuX2RvbXJhbmdlLm9uQXR0YWNoZWQoZnVuY3Rpb24gYXR0YWNoZWRfZXZlbnRNYXBzKHJhbmdlLCBlbGVtZW50KSB7XG4gICAgT2JqZWN0LmtleXMoZXZlbnRNYXApLmZvckVhY2goZnVuY3Rpb24gKHNwZWMpIHtcbiAgICAgIGxldCBoYW5kbGVyID0gZXZlbnRNYXBbc3BlY107XG4gICAgICBjb25zdCBjbGF1c2VzID0gc3BlYy5zcGxpdCgvLFxccysvKTtcbiAgICAgIC8vIGl0ZXJhdGUgb3ZlciBjbGF1c2VzIG9mIHNwZWMsIGUuZy4gWydjbGljayAuZm9vJywgJ2NsaWNrIC5iYXInXVxuICAgICAgY2xhdXNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjbGF1c2UpIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBjbGF1c2Uuc3BsaXQoL1xccysvKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbmV3RXZlbnRzID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBwYXJ0cy5qb2luKCcgJyk7XG4gICAgICAgIGhhbmRsZXMucHVzaChCbGF6ZS5fRXZlbnRTdXBwb3J0Lmxpc3RlbihcbiAgICAgICAgICBlbGVtZW50LCBuZXdFdmVudHMsIHNlbGVjdG9yLFxuICAgICAgICAgIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgIGlmICghIHJhbmdlLmNvbnRhaW5zRWxlbWVudChldnQuY3VycmVudFRhcmdldCwgc2VsZWN0b3IsIG5ld0V2ZW50cykpXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlclRoaXMgPSB0aGlzSW5IYW5kbGVyIHx8IHRoaXM7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHJldHVybiBCbGF6ZS5fd2l0aEN1cnJlbnRWaWV3KHZpZXcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIuYXBwbHkoaGFuZGxlclRoaXMsIGhhbmRsZXJBcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcmFuZ2UsIGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICByZXR1cm4gci5wYXJlbnRSYW5nZTtcbiAgICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgdmlldy5vblZpZXdEZXN0cm95ZWQoZnVuY3Rpb24gKCkge1xuICAgIGhhbmRsZXMuZm9yRWFjaChmdW5jdGlvbiAoaCkge1xuICAgICAgaC5zdG9wKCk7XG4gICAgfSk7XG4gICAgaGFuZGxlcy5sZW5ndGggPSAwO1xuICB9KTtcbn07XG4iLCJpbXBvcnQgaGFzIGZyb20gJ2xvZGFzaC5oYXMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJ2xvZGFzaC5pc29iamVjdCc7XG5cbkJsYXplLl9jYWxjdWxhdGVDb25kaXRpb24gPSBmdW5jdGlvbiAoY29uZCkge1xuICBpZiAoSFRNTC5pc0FycmF5KGNvbmQpICYmIGNvbmQubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiAhIWNvbmQ7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IENvbnN0cnVjdHMgYSBWaWV3IHRoYXQgcmVuZGVycyBjb250ZW50IHdpdGggYSBkYXRhIGNvbnRleHQuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gZGF0YSBBbiBvYmplY3QgdG8gdXNlIGFzIHRoZSBkYXRhIGNvbnRleHQsIG9yIGEgZnVuY3Rpb24gcmV0dXJuaW5nIHN1Y2ggYW4gb2JqZWN0LiAgSWYgYVxuICogICBmdW5jdGlvbiBpcyBwcm92aWRlZCwgaXQgd2lsbCBiZSByZWFjdGl2ZWx5IHJlLXJ1bi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbnRlbnRGdW5jIEEgRnVuY3Rpb24gdGhhdCByZXR1cm5zIFsqcmVuZGVyYWJsZSBjb250ZW50Kl0oI1JlbmRlcmFibGUtQ29udGVudCkuXG4gKi9cbkJsYXplLldpdGggPSBmdW5jdGlvbiAoZGF0YSwgY29udGVudEZ1bmMpIHtcbiAgY29uc3QgdmlldyA9IEJsYXplLlZpZXcoJ3dpdGgnLCBjb250ZW50RnVuYyk7XG5cbiAgdmlldy5kYXRhVmFyID0gbnVsbDtcbiAgdmlldy5vblZpZXdDcmVhdGVkKCgpID0+IHtcbiAgICB2aWV3LmRhdGFWYXIgPSBfY3JlYXRlQmluZGluZyh2aWV3LCBkYXRhLCAnc2V0RGF0YScpO1xuICB9KTtcblxuICByZXR1cm4gdmlldztcbn07XG5cblxuLyoqXG4gKiBAc3VtbWFyeSBTaGFsbG93IGNvbXBhcmUgb2YgdHdvIGJpbmRpbmdzLlxuICogQHBhcmFtIHtCaW5kaW5nfSB4XG4gKiBAcGFyYW0ge0JpbmRpbmd9IHlcbiAqL1xuZnVuY3Rpb24gX2lzRXF1YWxCaW5kaW5nKHgsIHkpIHtcbiAgaWYgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgeSA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4geC5lcnJvciA9PT0geS5lcnJvciAmJiBSZWFjdGl2ZVZhci5faXNFcXVhbCh4LnZhbHVlLCB5LnZhbHVlKTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gUmVhY3RpdmVWYXIuX2lzRXF1YWwoeCwgeSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSB4XG4gKiBAcmV0dXJucyB7VH1cbiAqL1xuZnVuY3Rpb24gX2lkZW50aXR5KHgpIHtcbiAgcmV0dXJuIHg7XG59XG5cbi8qKlxuICogQXR0YWNoZXMgYSBzaW5nbGUgYmluZGluZyB0byB0aGUgaW5zdGFudGlhdGVkIHZpZXcuXG4gKiBAdGVtcGxhdGUgVCwgVVxuICogQHBhcmFtIHtSZWFjdGl2ZVZhcjxVPn0gcmVhY3RpdmVWYXIgVGFyZ2V0IHZpZXcuXG4gKiBAcGFyYW0ge1Byb21pc2U8VD4gfCBUfSB2YWx1ZSBCb3VuZCB2YWx1ZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oVCk6IFV9IFttYXBwZXJdIE1hcHMgdGhlIGNvbXB1dGVkIHZhbHVlIGJlZm9yZSBzdG9yZS5cbiAqL1xuZnVuY3Rpb24gX3NldEJpbmRpbmdWYWx1ZShyZWFjdGl2ZVZhciwgdmFsdWUsIG1hcHBlciA9IF9pZGVudGl0eSkge1xuICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YWx1ZS50aGVuKFxuICAgICAgdmFsdWUgPT4gcmVhY3RpdmVWYXIuc2V0KHsgdmFsdWU6IG1hcHBlcih2YWx1ZSkgfSksXG4gICAgICBlcnJvciA9PiByZWFjdGl2ZVZhci5zZXQoeyBlcnJvciB9KSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIHJlYWN0aXZlVmFyLnNldCh7IHZhbHVlOiBtYXBwZXIodmFsdWUpIH0pO1xuICB9XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFQsIFVcbiAqIEBwYXJhbSB7QmxhemUuVmlld30gdmlldyBUYXJnZXQgdmlldy5cbiAqIEBwYXJhbSB7UHJvbWlzZTxUPiB8IFQgfCBmdW5jdGlvbigpOiAoUHJvbWlzZTxUPiB8IFQpfSBiaW5kaW5nIEJpbmRpbmcgdmFsdWUgb3IgaXRzIGdldHRlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbZGlzcGxheU5hbWVdIEF1dG9ydW4ncyBkaXNwbGF5IG5hbWUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKFQpOiBVfSBbbWFwcGVyXSBNYXBzIHRoZSBjb21wdXRlZCB2YWx1ZSBiZWZvcmUgc3RvcmUuXG4gKiBAcmV0dXJucyB7UmVhY3RpdmVWYXI8VT59XG4gKi9cbmZ1bmN0aW9uIF9jcmVhdGVCaW5kaW5nKHZpZXcsIGJpbmRpbmcsIGRpc3BsYXlOYW1lLCBtYXBwZXIpIHtcbiAgY29uc3QgcmVhY3RpdmVWYXIgPSBuZXcgUmVhY3RpdmVWYXIodW5kZWZpbmVkLCBfaXNFcXVhbEJpbmRpbmcpO1xuICBpZiAodHlwZW9mIGJpbmRpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2aWV3LmF1dG9ydW4oXG4gICAgICAoKSA9PiBfc2V0QmluZGluZ1ZhbHVlKHJlYWN0aXZlVmFyLCBiaW5kaW5nKCksIG1hcHBlciksXG4gICAgICB2aWV3LnBhcmVudFZpZXcsXG4gICAgICBkaXNwbGF5TmFtZSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIF9zZXRCaW5kaW5nVmFsdWUocmVhY3RpdmVWYXIsIGJpbmRpbmcsIG1hcHBlcik7XG4gIH1cblxuICByZXR1cm4gcmVhY3RpdmVWYXI7XG59XG5cbi8qKlxuICogQXR0YWNoZXMgYmluZGluZ3MgdG8gdGhlIGluc3RhbnRpYXRlZCB2aWV3LlxuICogQHBhcmFtIHtPYmplY3R9IGJpbmRpbmdzIEEgZGljdGlvbmFyeSBvZiBiaW5kaW5ncywgZWFjaCBiaW5kaW5nIG5hbWVcbiAqIGNvcnJlc3BvbmRzIHRvIGEgdmFsdWUgb3IgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgcmVhY3RpdmVseSByZS1ydW4uXG4gKiBAcGFyYW0ge0JsYXplLlZpZXd9IHZpZXcgVGhlIHRhcmdldC5cbiAqL1xuQmxhemUuX2F0dGFjaEJpbmRpbmdzVG9WaWV3ID0gZnVuY3Rpb24gKGJpbmRpbmdzLCB2aWV3KSB7XG4gIHZpZXcub25WaWV3Q3JlYXRlZChmdW5jdGlvbiAoKSB7XG4gICAgT2JqZWN0LmVudHJpZXMoYmluZGluZ3MpLmZvckVhY2goZnVuY3Rpb24gKFtuYW1lLCBiaW5kaW5nXSkge1xuICAgICAgdmlldy5fc2NvcGVCaW5kaW5nc1tuYW1lXSA9IF9jcmVhdGVCaW5kaW5nKHZpZXcsIGJpbmRpbmcpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgQ29uc3RydWN0cyBhIFZpZXcgc2V0dGluZyB0aGUgbG9jYWwgbGV4aWNhbCBzY29wZSBpbiB0aGUgYmxvY2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBiaW5kaW5ncyBEaWN0aW9uYXJ5IG1hcHBpbmcgbmFtZXMgb2YgYmluZGluZ3MgdG9cbiAqIHZhbHVlcyBvciBjb21wdXRhdGlvbnMgdG8gcmVhY3RpdmVseSByZS1ydW4uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjb250ZW50RnVuYyBBIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBbKnJlbmRlcmFibGUgY29udGVudCpdKCNSZW5kZXJhYmxlLUNvbnRlbnQpLlxuICovXG5CbGF6ZS5MZXQgPSBmdW5jdGlvbiAoYmluZGluZ3MsIGNvbnRlbnRGdW5jKSB7XG4gIHZhciB2aWV3ID0gQmxhemUuVmlldygnbGV0JywgY29udGVudEZ1bmMpO1xuICBCbGF6ZS5fYXR0YWNoQmluZGluZ3NUb1ZpZXcoYmluZGluZ3MsIHZpZXcpO1xuXG4gIHJldHVybiB2aWV3O1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBDb25zdHJ1Y3RzIGEgVmlldyB0aGF0IHJlbmRlcnMgY29udGVudCBjb25kaXRpb25hbGx5LlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29uZGl0aW9uRnVuYyBBIGZ1bmN0aW9uIHRvIHJlYWN0aXZlbHkgcmUtcnVuLiAgV2hldGhlciB0aGUgcmVzdWx0IGlzIHRydXRoeSBvciBmYWxzeSBkZXRlcm1pbmVzXG4gKiAgIHdoZXRoZXIgYGNvbnRlbnRGdW5jYCBvciBgZWxzZUZ1bmNgIGlzIHNob3duLiAgQW4gZW1wdHkgYXJyYXkgaXMgY29uc2lkZXJlZCBmYWxzeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbnRlbnRGdW5jIEEgRnVuY3Rpb24gdGhhdCByZXR1cm5zIFsqcmVuZGVyYWJsZSBjb250ZW50Kl0oI1JlbmRlcmFibGUtQ29udGVudCkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZWxzZUZ1bmNdIE9wdGlvbmFsLiAgQSBGdW5jdGlvbiB0aGF0IHJldHVybnMgWypyZW5kZXJhYmxlIGNvbnRlbnQqXSgjUmVuZGVyYWJsZS1Db250ZW50KS4gIElmIG5vXG4gKiAgIGBlbHNlRnVuY2AgaXMgc3VwcGxpZWQsIG5vIGNvbnRlbnQgaXMgc2hvd24gaW4gdGhlIFwiZWxzZVwiIGNhc2UuXG4gKi9cbkJsYXplLklmID0gZnVuY3Rpb24gKGNvbmRpdGlvbkZ1bmMsIGNvbnRlbnRGdW5jLCBlbHNlRnVuYywgX25vdCkge1xuICBjb25zdCB2aWV3ID0gQmxhemUuVmlldyhfbm90ID8gJ3VubGVzcycgOiAnaWYnLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gUmVuZGVyIG9ubHkgaWYgdGhlIGJpbmRpbmcgaGFzIGEgdmFsdWUsIGkuZS4sIGl0J3MgZWl0aGVyIHN5bmNocm9ub3VzIG9yXG4gICAgLy8gaGFzIHJlc29sdmVkLiBSZWplY3RlZCBgUHJvbWlzZWBzIGFyZSBOT1QgcmVuZGVyZWQuXG4gICAgY29uc3QgY29uZGl0aW9uID0gdmlldy5fX2NvbmRpdGlvblZhci5nZXQoKTtcbiAgICBpZiAoY29uZGl0aW9uICYmICd2YWx1ZScgaW4gY29uZGl0aW9uKSB7XG4gICAgICByZXR1cm4gY29uZGl0aW9uLnZhbHVlID8gY29udGVudEZ1bmMoKSA6IChlbHNlRnVuYyA/IGVsc2VGdW5jKCkgOiBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSk7XG5cbiAgdmlldy5fX2NvbmRpdGlvblZhciA9IG51bGw7XG4gIHZpZXcub25WaWV3Q3JlYXRlZCgoKSA9PiB7XG4gICAgdmlldy5fX2NvbmRpdGlvblZhciA9IF9jcmVhdGVCaW5kaW5nKFxuICAgICAgdmlldyxcbiAgICAgIGNvbmRpdGlvbkZ1bmMsXG4gICAgICAnY29uZGl0aW9uJyxcbiAgICAgIC8vIFN0b3JlIG9ubHkgdGhlIGFjdHVhbCBjb25kaXRpb24uXG4gICAgICB2YWx1ZSA9PiAhQmxhemUuX2NhbGN1bGF0ZUNvbmRpdGlvbih2YWx1ZSkgIT09ICFfbm90LFxuICAgICk7XG4gIH0pO1xuXG4gIHJldHVybiB2aWV3O1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBBbiBpbnZlcnRlZCBbYEJsYXplLklmYF0oI0JsYXplLUlmKS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbmRpdGlvbkZ1bmMgQSBmdW5jdGlvbiB0byByZWFjdGl2ZWx5IHJlLXJ1bi4gIElmIHRoZSByZXN1bHQgaXMgZmFsc3ksIGBjb250ZW50RnVuY2AgaXMgc2hvd24sXG4gKiAgIG90aGVyd2lzZSBgZWxzZUZ1bmNgIGlzIHNob3duLiAgQW4gZW1wdHkgYXJyYXkgaXMgY29uc2lkZXJlZCBmYWxzeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbnRlbnRGdW5jIEEgRnVuY3Rpb24gdGhhdCByZXR1cm5zIFsqcmVuZGVyYWJsZSBjb250ZW50Kl0oI1JlbmRlcmFibGUtQ29udGVudCkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZWxzZUZ1bmNdIE9wdGlvbmFsLiAgQSBGdW5jdGlvbiB0aGF0IHJldHVybnMgWypyZW5kZXJhYmxlIGNvbnRlbnQqXSgjUmVuZGVyYWJsZS1Db250ZW50KS4gIElmIG5vXG4gKiAgIGBlbHNlRnVuY2AgaXMgc3VwcGxpZWQsIG5vIGNvbnRlbnQgaXMgc2hvd24gaW4gdGhlIFwiZWxzZVwiIGNhc2UuXG4gKi9cbkJsYXplLlVubGVzcyA9IGZ1bmN0aW9uIChjb25kaXRpb25GdW5jLCBjb250ZW50RnVuYywgZWxzZUZ1bmMpIHtcbiAgcmV0dXJuIEJsYXplLklmKGNvbmRpdGlvbkZ1bmMsIGNvbnRlbnRGdW5jLCBlbHNlRnVuYywgdHJ1ZSAvKl9ub3QqLyk7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IENvbnN0cnVjdHMgYSBWaWV3IHRoYXQgcmVuZGVycyBgY29udGVudEZ1bmNgIGZvciBlYWNoIGl0ZW0gaW4gYSBzZXF1ZW5jZS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGFyZ0Z1bmMgQSBmdW5jdGlvbiB0byByZWFjdGl2ZWx5IHJlLXJ1bi4gVGhlIGZ1bmN0aW9uIGNhblxuICogcmV0dXJuIG9uZSBvZiB0d28gb3B0aW9uczpcbiAqXG4gKiAxLiBBbiBvYmplY3Qgd2l0aCB0d28gZmllbGRzOiAnX3ZhcmlhYmxlJyBhbmQgJ19zZXF1ZW5jZScuIEVhY2ggaXRlcmF0ZXMgb3ZlclxuICogICAnX3NlcXVlbmNlJywgaXQgbWF5IGJlIGEgQ3Vyc29yLCBhbiBhcnJheSwgbnVsbCwgb3IgdW5kZWZpbmVkLiBJbnNpZGUgdGhlXG4gKiAgIEVhY2ggYm9keSB5b3Ugd2lsbCBiZSBhYmxlIHRvIGdldCB0aGUgY3VycmVudCBpdGVtIGZyb20gdGhlIHNlcXVlbmNlIHVzaW5nXG4gKiAgIHRoZSBuYW1lIHNwZWNpZmllZCBpbiB0aGUgJ192YXJpYWJsZScgZmllbGQuXG4gKlxuICogMi4gSnVzdCBhIHNlcXVlbmNlIChDdXJzb3IsIGFycmF5LCBudWxsLCBvciB1bmRlZmluZWQpIG5vdCB3cmFwcGVkIGludG8gYW5cbiAqICAgb2JqZWN0LiBJbnNpZGUgdGhlIEVhY2ggYm9keSwgdGhlIGN1cnJlbnQgaXRlbSB3aWxsIGJlIHNldCBhcyB0aGUgZGF0YVxuICogICBjb250ZXh0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29udGVudEZ1bmMgQSBGdW5jdGlvbiB0aGF0IHJldHVybnMgIFsqcmVuZGVyYWJsZVxuICogY29udGVudCpdKCNSZW5kZXJhYmxlLUNvbnRlbnQpLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2Vsc2VGdW5jXSBBIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBbKnJlbmRlcmFibGVcbiAqIGNvbnRlbnQqXSgjUmVuZGVyYWJsZS1Db250ZW50KSB0byBkaXNwbGF5IGluIHRoZSBjYXNlIHdoZW4gdGhlcmUgYXJlIG5vIGl0ZW1zXG4gKiBpbiB0aGUgc2VxdWVuY2UuXG4gKi9cbkJsYXplLkVhY2ggPSBmdW5jdGlvbiAoYXJnRnVuYywgY29udGVudEZ1bmMsIGVsc2VGdW5jKSB7XG4gIGNvbnN0IGVhY2hWaWV3ID0gQmxhemUuVmlldygnZWFjaCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzdWJ2aWV3cyA9IHRoaXMuaW5pdGlhbFN1YnZpZXdzO1xuICAgIHRoaXMuaW5pdGlhbFN1YnZpZXdzID0gbnVsbDtcbiAgICBpZiAodGhpcy5faXNDcmVhdGVkRm9yRXhwYW5zaW9uKSB7XG4gICAgICB0aGlzLmV4cGFuZGVkVmFsdWVEZXAgPSBuZXcgVHJhY2tlci5EZXBlbmRlbmN5O1xuICAgICAgdGhpcy5leHBhbmRlZFZhbHVlRGVwLmRlcGVuZCgpO1xuICAgIH1cbiAgICByZXR1cm4gc3Vidmlld3M7XG4gIH0pO1xuICBlYWNoVmlldy5pbml0aWFsU3Vidmlld3MgPSBbXTtcbiAgZWFjaFZpZXcubnVtSXRlbXMgPSAwO1xuICBlYWNoVmlldy5pbkVsc2VNb2RlID0gZmFsc2U7XG4gIGVhY2hWaWV3LnN0b3BIYW5kbGUgPSBudWxsO1xuICBlYWNoVmlldy5jb250ZW50RnVuYyA9IGNvbnRlbnRGdW5jO1xuICBlYWNoVmlldy5lbHNlRnVuYyA9IGVsc2VGdW5jO1xuICBlYWNoVmlldy5hcmdWYXIgPSB1bmRlZmluZWQ7XG4gIGVhY2hWaWV3LnZhcmlhYmxlTmFtZSA9IG51bGw7XG5cbiAgLy8gdXBkYXRlIHRoZSBAaW5kZXggdmFsdWUgaW4gdGhlIHNjb3BlIG9mIGFsbCBzdWJ2aWV3cyBpbiB0aGUgcmFuZ2VcbiAgY29uc3QgdXBkYXRlSW5kaWNlcyA9IGZ1bmN0aW9uIChmcm9tLCB0bykge1xuICAgIGlmICh0byA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0byA9IGVhY2hWaWV3Lm51bUl0ZW1zIC0gMTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gZnJvbTsgaSA8PSB0bzsgaSsrKSB7XG4gICAgICBjb25zdCB2aWV3ID0gZWFjaFZpZXcuX2RvbXJhbmdlLm1lbWJlcnNbaV0udmlldztcbiAgICAgIHZpZXcuX3Njb3BlQmluZGluZ3NbJ0BpbmRleCddLnNldCh7IHZhbHVlOiBpIH0pO1xuICAgIH1cbiAgfTtcblxuICBlYWNoVmlldy5vblZpZXdDcmVhdGVkKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBXZSBldmFsdWF0ZSBgYXJnRnVuY2AgaW4gYFRyYWNrZXIuYXV0b3J1bmAgdG8gZW5zdXJlIGBCbGF6ZS5jdXJyZW50Vmlld2BcbiAgICAvLyBpcyBhbHdheXMgc2V0IHdoZW4gaXQgcnVucy5cbiAgICBlYWNoVmlldy5hcmdWYXIgPSBfY3JlYXRlQmluZGluZyhcbiAgICAgIGVhY2hWaWV3LFxuICAgICAgLy8gVW53cmFwIGEgc2VxdWVuY2UgcmVhY3RpdmVseSAoYHt7I2VhY2ggeCBpbiB4c319YCkuXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGxldCBtYXliZVNlcXVlbmNlID0gYXJnRnVuYygpO1xuICAgICAgICBpZiAoaXNPYmplY3QobWF5YmVTZXF1ZW5jZSkgJiYgaGFzKG1heWJlU2VxdWVuY2UsICdfc2VxdWVuY2UnKSkge1xuICAgICAgICAgIGVhY2hWaWV3LnZhcmlhYmxlTmFtZSA9IG1heWJlU2VxdWVuY2UuX3ZhcmlhYmxlIHx8IG51bGw7XG4gICAgICAgICAgbWF5YmVTZXF1ZW5jZSA9IG1heWJlU2VxdWVuY2UuX3NlcXVlbmNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXliZVNlcXVlbmNlO1xuICAgICAgfSxcbiAgICAgICdjb2xsZWN0aW9uJyxcbiAgICApO1xuXG4gICAgZWFjaFZpZXcuc3RvcEhhbmRsZSA9IE9ic2VydmVTZXF1ZW5jZS5vYnNlcnZlKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBlYWNoVmlldy5hcmdWYXIuZ2V0KCk/LnZhbHVlO1xuICAgIH0sIHtcbiAgICAgIGFkZGVkQXQ6IGZ1bmN0aW9uIChpZCwgaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgVHJhY2tlci5ub25yZWFjdGl2ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbGV0IG5ld0l0ZW1WaWV3O1xuICAgICAgICAgIGlmIChlYWNoVmlldy52YXJpYWJsZU5hbWUpIHtcbiAgICAgICAgICAgIC8vIG5ldy1zdHlsZSAjZWFjaCAoYXMgaW4ge3sjZWFjaCBpdGVtIGluIGl0ZW1zfX0pXG4gICAgICAgICAgICAvLyBkb2Vzbid0IGNyZWF0ZSBhIG5ldyBkYXRhIGNvbnRleHRcbiAgICAgICAgICAgIG5ld0l0ZW1WaWV3ID0gQmxhemUuVmlldygnaXRlbScsIGVhY2hWaWV3LmNvbnRlbnRGdW5jKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3SXRlbVZpZXcgPSBCbGF6ZS5XaXRoKGl0ZW0sIGVhY2hWaWV3LmNvbnRlbnRGdW5jKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlYWNoVmlldy5udW1JdGVtcysrO1xuXG4gICAgICAgICAgY29uc3QgYmluZGluZ3MgPSB7fTtcbiAgICAgICAgICBiaW5kaW5nc1snQGluZGV4J10gPSBpbmRleDtcbiAgICAgICAgICBpZiAoZWFjaFZpZXcudmFyaWFibGVOYW1lKSB7XG4gICAgICAgICAgICBiaW5kaW5nc1tlYWNoVmlldy52YXJpYWJsZU5hbWVdID0gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgICAgQmxhemUuX2F0dGFjaEJpbmRpbmdzVG9WaWV3KGJpbmRpbmdzLCBuZXdJdGVtVmlldyk7XG5cbiAgICAgICAgICBpZiAoZWFjaFZpZXcuZXhwYW5kZWRWYWx1ZURlcCkge1xuICAgICAgICAgICAgZWFjaFZpZXcuZXhwYW5kZWRWYWx1ZURlcC5jaGFuZ2VkKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlYWNoVmlldy5fZG9tcmFuZ2UpIHtcbiAgICAgICAgICAgIGlmIChlYWNoVmlldy5pbkVsc2VNb2RlKSB7XG4gICAgICAgICAgICAgIGVhY2hWaWV3Ll9kb21yYW5nZS5yZW1vdmVNZW1iZXIoMCk7XG4gICAgICAgICAgICAgIGVhY2hWaWV3LmluRWxzZU1vZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBCbGF6ZS5fbWF0ZXJpYWxpemVWaWV3KG5ld0l0ZW1WaWV3LCBlYWNoVmlldyk7XG4gICAgICAgICAgICBlYWNoVmlldy5fZG9tcmFuZ2UuYWRkTWVtYmVyKHJhbmdlLCBpbmRleCk7XG4gICAgICAgICAgICB1cGRhdGVJbmRpY2VzKGluZGV4KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWFjaFZpZXcuaW5pdGlhbFN1YnZpZXdzLnNwbGljZShpbmRleCwgMCwgbmV3SXRlbVZpZXcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVtb3ZlZEF0OiBmdW5jdGlvbiAoaWQsIGl0ZW0sIGluZGV4KSB7XG4gICAgICAgIFRyYWNrZXIubm9ucmVhY3RpdmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGVhY2hWaWV3Lm51bUl0ZW1zLS07XG4gICAgICAgICAgaWYgKGVhY2hWaWV3LmV4cGFuZGVkVmFsdWVEZXApIHtcbiAgICAgICAgICAgIGVhY2hWaWV3LmV4cGFuZGVkVmFsdWVEZXAuY2hhbmdlZCgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZWFjaFZpZXcuX2RvbXJhbmdlKSB7XG4gICAgICAgICAgICBlYWNoVmlldy5fZG9tcmFuZ2UucmVtb3ZlTWVtYmVyKGluZGV4KTtcbiAgICAgICAgICAgIHVwZGF0ZUluZGljZXMoaW5kZXgpO1xuICAgICAgICAgICAgaWYgKGVhY2hWaWV3LmVsc2VGdW5jICYmIGVhY2hWaWV3Lm51bUl0ZW1zID09PSAwKSB7XG4gICAgICAgICAgICAgIGVhY2hWaWV3LmluRWxzZU1vZGUgPSB0cnVlO1xuICAgICAgICAgICAgICBlYWNoVmlldy5fZG9tcmFuZ2UuYWRkTWVtYmVyKFxuICAgICAgICAgICAgICAgIEJsYXplLl9tYXRlcmlhbGl6ZVZpZXcoXG4gICAgICAgICAgICAgICAgICBCbGF6ZS5WaWV3KCdlYWNoX2Vsc2UnLGVhY2hWaWV3LmVsc2VGdW5jKSxcbiAgICAgICAgICAgICAgICAgIGVhY2hWaWV3KSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVhY2hWaWV3LmluaXRpYWxTdWJ2aWV3cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgY2hhbmdlZEF0OiBmdW5jdGlvbiAoaWQsIG5ld0l0ZW0sIG9sZEl0ZW0sIGluZGV4KSB7XG4gICAgICAgIFRyYWNrZXIubm9ucmVhY3RpdmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChlYWNoVmlldy5leHBhbmRlZFZhbHVlRGVwKSB7XG4gICAgICAgICAgICBlYWNoVmlldy5leHBhbmRlZFZhbHVlRGVwLmNoYW5nZWQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGl0ZW1WaWV3O1xuICAgICAgICAgICAgaWYgKGVhY2hWaWV3Ll9kb21yYW5nZSkge1xuICAgICAgICAgICAgICBpdGVtVmlldyA9IGVhY2hWaWV3Ll9kb21yYW5nZS5nZXRNZW1iZXIoaW5kZXgpLnZpZXc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpdGVtVmlldyA9IGVhY2hWaWV3LmluaXRpYWxTdWJ2aWV3c1tpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWFjaFZpZXcudmFyaWFibGVOYW1lKSB7XG4gICAgICAgICAgICAgIGl0ZW1WaWV3Ll9zY29wZUJpbmRpbmdzW2VhY2hWaWV3LnZhcmlhYmxlTmFtZV0uc2V0KHsgdmFsdWU6IG5ld0l0ZW0gfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpdGVtVmlldy5kYXRhVmFyLnNldCh7IHZhbHVlOiBuZXdJdGVtIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgbW92ZWRUbzogZnVuY3Rpb24gKGlkLCBpdGVtLCBmcm9tSW5kZXgsIHRvSW5kZXgpIHtcbiAgICAgICAgVHJhY2tlci5ub25yZWFjdGl2ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKGVhY2hWaWV3LmV4cGFuZGVkVmFsdWVEZXApIHtcbiAgICAgICAgICAgIGVhY2hWaWV3LmV4cGFuZGVkVmFsdWVEZXAuY2hhbmdlZCgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZWFjaFZpZXcuX2RvbXJhbmdlKSB7XG4gICAgICAgICAgICBlYWNoVmlldy5fZG9tcmFuZ2UubW92ZU1lbWJlcihmcm9tSW5kZXgsIHRvSW5kZXgpO1xuICAgICAgICAgICAgdXBkYXRlSW5kaWNlcyhcbiAgICAgICAgICAgICAgTWF0aC5taW4oZnJvbUluZGV4LCB0b0luZGV4KSwgTWF0aC5tYXgoZnJvbUluZGV4LCB0b0luZGV4KSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHN1YnZpZXdzID0gZWFjaFZpZXcuaW5pdGlhbFN1YnZpZXdzO1xuICAgICAgICAgICAgY29uc3QgaXRlbVZpZXcgPSBzdWJ2aWV3c1tmcm9tSW5kZXhdO1xuICAgICAgICAgICAgc3Vidmlld3Muc3BsaWNlKGZyb21JbmRleCwgMSk7XG4gICAgICAgICAgICBzdWJ2aWV3cy5zcGxpY2UodG9JbmRleCwgMCwgaXRlbVZpZXcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZWFjaFZpZXcuZWxzZUZ1bmMgJiYgZWFjaFZpZXcubnVtSXRlbXMgPT09IDApIHtcbiAgICAgIGVhY2hWaWV3LmluRWxzZU1vZGUgPSB0cnVlO1xuICAgICAgZWFjaFZpZXcuaW5pdGlhbFN1YnZpZXdzWzBdID1cbiAgICAgICAgQmxhemUuVmlldygnZWFjaF9lbHNlJywgZWFjaFZpZXcuZWxzZUZ1bmMpO1xuICAgIH1cbiAgfSk7XG5cbiAgZWFjaFZpZXcub25WaWV3RGVzdHJveWVkKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZWFjaFZpZXcuc3RvcEhhbmRsZSlcbiAgICAgIGVhY2hWaWV3LnN0b3BIYW5kbGUuc3RvcCgpO1xuICB9KTtcblxuICByZXR1cm4gZWFjaFZpZXc7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBgQmxhemUuTGV0YCB2aWV3IHRoYXQgdW53cmFwcyB0aGUgZ2l2ZW4gdmFsdWUuXG4gKiBAcGFyYW0ge3Vua25vd259IHZhbHVlXG4gKiBAcmV0dXJucyB7QmxhemUuVmlld31cbiAqL1xuQmxhemUuX0F3YWl0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBCbGF6ZS5MZXQoeyB2YWx1ZSB9LCBCbGF6ZS5fQXdhaXRDb250ZW50KTtcbn07XG5cbkJsYXplLl9Bd2FpdENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBCbGF6ZS5jdXJyZW50Vmlldy5fc2NvcGVCaW5kaW5ncy52YWx1ZS5nZXQoKT8udmFsdWU7XG59O1xuXG5CbGF6ZS5fVGVtcGxhdGVXaXRoID0gZnVuY3Rpb24gKGFyZywgY29udGVudEZ1bmMpIHtcbiAgbGV0IHc7XG5cbiAgbGV0IGFyZ0Z1bmMgPSBhcmc7XG4gIGlmICh0eXBlb2YgYXJnICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgYXJnRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgYSBsaXR0bGUgbWVzc3kuICBXaGVuIHdlIGNvbXBpbGUgYHt7PiBUZW1wbGF0ZS5jb250ZW50QmxvY2t9fWAsIHdlXG4gIC8vIHdyYXAgaXQgaW4gQmxhemUuX0luT3V0ZXJUZW1wbGF0ZVNjb3BlIGluIG9yZGVyIHRvIHNraXAgdGhlIGludGVybWVkaWF0ZVxuICAvLyBwYXJlbnQgVmlld3MgaW4gdGhlIGN1cnJlbnQgdGVtcGxhdGUuICBIb3dldmVyLCB3aGVuIHRoZXJlJ3MgYW4gYXJndW1lbnRcbiAgLy8gKGB7ez4gVGVtcGxhdGUuY29udGVudEJsb2NrIGFyZ319YCksIHRoZSBhcmd1bWVudCBuZWVkcyB0byBiZSBldmFsdWF0ZWRcbiAgLy8gaW4gdGhlIG9yaWdpbmFsIHNjb3BlLiAgVGhlcmUncyBubyBnb29kIG9yZGVyIHRvIG5lc3RcbiAgLy8gQmxhemUuX0luT3V0ZXJUZW1wbGF0ZVNjb3BlIGFuZCBCbGF6ZS5fVGVtcGxhdGVXaXRoIHRvIGFjaGlldmUgdGhpcyxcbiAgLy8gc28gd2Ugd3JhcCBhcmdGdW5jIHRvIHJ1biBpdCBpbiB0aGUgXCJvcmlnaW5hbCBwYXJlbnRWaWV3XCIgb2YgdGhlXG4gIC8vIEJsYXplLl9Jbk91dGVyVGVtcGxhdGVTY29wZS5cbiAgLy9cbiAgLy8gVG8gbWFrZSB0aGlzIGJldHRlciwgcmVjb25zaWRlciBfSW5PdXRlclRlbXBsYXRlU2NvcGUgYXMgYSBwcmltaXRpdmUuXG4gIC8vIExvbmdlciB0ZXJtLCBldmFsdWF0ZSBleHByZXNzaW9ucyBpbiB0aGUgcHJvcGVyIGxleGljYWwgc2NvcGUuXG4gIGNvbnN0IHdyYXBwZWRBcmdGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCB2aWV3VG9FdmFsdWF0ZUFyZyA9IG51bGw7XG4gICAgaWYgKHcucGFyZW50VmlldyAmJiB3LnBhcmVudFZpZXcubmFtZSA9PT0gJ0luT3V0ZXJUZW1wbGF0ZVNjb3BlJykge1xuICAgICAgdmlld1RvRXZhbHVhdGVBcmcgPSB3LnBhcmVudFZpZXcub3JpZ2luYWxQYXJlbnRWaWV3O1xuICAgIH1cbiAgICBpZiAodmlld1RvRXZhbHVhdGVBcmcpIHtcbiAgICAgIHJldHVybiBCbGF6ZS5fd2l0aEN1cnJlbnRWaWV3KHZpZXdUb0V2YWx1YXRlQXJnLCBhcmdGdW5jKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFyZ0Z1bmMoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgd3JhcHBlZENvbnRlbnRGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBjb250ZW50ID0gY29udGVudEZ1bmMuY2FsbCh0aGlzKTtcblxuICAgIC8vIFNpbmNlIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBCbGF6ZS5fVGVtcGxhdGVXaXRoIHZpZXcgZm9yIHRoZVxuICAgIC8vIHVzZXIsIHNldCB0aGUgZmxhZyBvbiB0aGUgY2hpbGQgdmlldy4gIElmIGBjb250ZW50YCBpcyBhIHRlbXBsYXRlLFxuICAgIC8vIGNvbnN0cnVjdCB0aGUgVmlldyBzbyB0aGF0IHdlIGNhbiBzZXQgdGhlIGZsYWcuXG4gICAgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBCbGF6ZS5UZW1wbGF0ZSkge1xuICAgICAgY29udGVudCA9IGNvbnRlbnQuY29uc3RydWN0VmlldygpO1xuICAgIH1cbiAgICBpZiAoY29udGVudCBpbnN0YW5jZW9mIEJsYXplLlZpZXcpIHtcbiAgICAgIGNvbnRlbnQuX2hhc0dlbmVyYXRlZFBhcmVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH07XG5cbiAgdyA9IEJsYXplLldpdGgod3JhcHBlZEFyZ0Z1bmMsIHdyYXBwZWRDb250ZW50RnVuYyk7XG4gIHcuX19pc1RlbXBsYXRlV2l0aCA9IHRydWU7XG4gIHJldHVybiB3O1xufTtcblxuQmxhemUuX0luT3V0ZXJUZW1wbGF0ZVNjb3BlID0gZnVuY3Rpb24gKHRlbXBsYXRlVmlldywgY29udGVudEZ1bmMpIHtcbiAgY29uc3QgdmlldyA9IEJsYXplLlZpZXcoJ0luT3V0ZXJUZW1wbGF0ZVNjb3BlJywgY29udGVudEZ1bmMpO1xuICBsZXQgcGFyZW50VmlldyA9IHRlbXBsYXRlVmlldy5wYXJlbnRWaWV3O1xuXG4gIC8vIEhhY2sgc28gdGhhdCBpZiB5b3UgY2FsbCBge3s+IGZvbyBiYXJ9fWAgYW5kIGl0IGV4cGFuZHMgaW50b1xuICAvLyBge3sjd2l0aCBiYXJ9fXt7PiBmb299fXt7L3dpdGh9fWAsIGFuZCB0aGVuIGBmb29gIGlzIGEgdGVtcGxhdGVcbiAgLy8gdGhhdCBpbnNlcnRzIGB7ez4gVGVtcGxhdGUuY29udGVudEJsb2NrfX1gLCB0aGUgZGF0YSBjb250ZXh0IGZvclxuICAvLyBgVGVtcGxhdGUuY29udGVudEJsb2NrYCBpcyBub3QgYGJhcmAgYnV0IHRoZSBvbmUgZW5jbG9zaW5nIHRoYXQuXG4gIGlmIChwYXJlbnRWaWV3Ll9faXNUZW1wbGF0ZVdpdGgpXG4gICAgcGFyZW50VmlldyA9IHBhcmVudFZpZXcucGFyZW50VmlldztcblxuICB2aWV3Lm9uVmlld0NyZWF0ZWQoZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3JpZ2luYWxQYXJlbnRWaWV3ID0gdGhpcy5wYXJlbnRWaWV3O1xuICAgIHRoaXMucGFyZW50VmlldyA9IHBhcmVudFZpZXc7XG4gICAgdGhpcy5fX2NoaWxkRG9lc250U3RhcnROZXdMZXhpY2FsU2NvcGUgPSB0cnVlO1xuICB9KTtcbiAgcmV0dXJuIHZpZXc7XG59O1xuXG4iLCJpbXBvcnQgaGFzIGZyb20gJ2xvZGFzaC5oYXMnO1xuXG4vKiogQHBhcmFtIHtmdW5jdGlvbihCaW5kaW5nKTogYm9vbGVhbn0gZm4gKi9cbmZ1bmN0aW9uIF9jcmVhdGVCaW5kaW5nc0hlbHBlcihmbikge1xuICAvKiogQHBhcmFtIHtzdHJpbmdbXX0gbmFtZXMgKi9cbiAgcmV0dXJuICguLi5uYW1lcykgPT4ge1xuICAgIGNvbnN0IHZpZXcgPSBCbGF6ZS5jdXJyZW50VmlldztcblxuICAgIC8vIFRoZXJlJ3MgZWl0aGVyIHplcm8gYXJndW1lbnRzIChpLmUuLCBjaGVjayBhbGwgYmluZGluZ3MpIG9yIGFuIGFkZGl0aW9uYWxcbiAgICAvLyBcImhhc2hcIiBhcmd1bWVudCB0aGF0IHdlIGhhdmUgdG8gaWdub3JlLlxuICAgIG5hbWVzID0gbmFtZXMubGVuZ3RoID09PSAwXG4gICAgICAvLyBUT0RPOiBTaG91bGQgd2Ugd2FsayB1cCB0aGUgYmluZGluZ3MgaGVyZT9cbiAgICAgID8gT2JqZWN0LmtleXModmlldy5fc2NvcGVCaW5kaW5ncylcbiAgICAgIDogbmFtZXMuc2xpY2UoMCwgLTEpO1xuXG4gICAgcmV0dXJuIG5hbWVzLnNvbWUobmFtZSA9PiB7XG4gICAgICBjb25zdCBiaW5kaW5nID0gX2xleGljYWxCaW5kaW5nTG9va3VwKHZpZXcsIG5hbWUpO1xuICAgICAgaWYgKCFiaW5kaW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQmluZGluZyBmb3IgXCIke25hbWV9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGJpbmRpbmcuZ2V0KCkpO1xuICAgIH0pO1xuICB9O1xufVxuXG5CbGF6ZS5fZ2xvYmFsSGVscGVycyA9IHtcbiAgLyoqIEBzdW1tYXJ5IENoZWNrIHdoZXRoZXIgYW55IG9mIHRoZSBnaXZlbiBiaW5kaW5ncyAob3IgYWxsIGlmIG5vbmUgZ2l2ZW4pIGlzIHN0aWxsIHBlbmRpbmcuICovXG4gICdAcGVuZGluZyc6IF9jcmVhdGVCaW5kaW5nc0hlbHBlcihiaW5kaW5nID0+IGJpbmRpbmcgPT09IHVuZGVmaW5lZCksXG4gIC8qKiBAc3VtbWFyeSBDaGVjayB3aGV0aGVyIGFueSBvZiB0aGUgZ2l2ZW4gYmluZGluZ3MgKG9yIGFsbCBpZiBub25lIGdpdmVuKSBoYXMgcmVqZWN0ZWQuICovXG4gICdAcmVqZWN0ZWQnOiBfY3JlYXRlQmluZGluZ3NIZWxwZXIoYmluZGluZyA9PiAhIWJpbmRpbmcgJiYgJ2Vycm9yJyBpbiBiaW5kaW5nKSxcbiAgLyoqIEBzdW1tYXJ5IENoZWNrIHdoZXRoZXIgYW55IG9mIHRoZSBnaXZlbiBiaW5kaW5ncyAob3IgYWxsIGlmIG5vbmUgZ2l2ZW4pIGhhcyByZXNvbHZlZC4gKi9cbiAgJ0ByZXNvbHZlZCc6IF9jcmVhdGVCaW5kaW5nc0hlbHBlcihiaW5kaW5nID0+ICEhYmluZGluZyAmJiAndmFsdWUnIGluIGJpbmRpbmcpLFxufTtcblxuLy8gRG9jdW1lbnRlZCBhcyBUZW1wbGF0ZS5yZWdpc3RlckhlbHBlci5cbi8vIFRoaXMgZGVmaW5pdGlvbiBhbHNvIHByb3ZpZGVzIGJhY2stY29tcGF0IGZvciBgVUkucmVnaXN0ZXJIZWxwZXJgLlxuQmxhemUucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbiAobmFtZSwgZnVuYykge1xuICBCbGF6ZS5fZ2xvYmFsSGVscGVyc1tuYW1lXSA9IGZ1bmM7XG59O1xuXG4vLyBBbHNvIGRvY3VtZW50ZWQgYXMgVGVtcGxhdGUuZGVyZWdpc3RlckhlbHBlclxuQmxhemUuZGVyZWdpc3RlckhlbHBlciA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgZGVsZXRlIEJsYXplLl9nbG9iYWxIZWxwZXJzW25hbWVdO1xufTtcblxuY29uc3QgYmluZElmSXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh4LCB0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiB4ICE9PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB4O1xuICByZXR1cm4gQmxhemUuX2JpbmQoeCwgdGFyZ2V0KTtcbn07XG5cbi8vIElmIGB4YCBpcyBhIGZ1bmN0aW9uLCBiaW5kcyB0aGUgdmFsdWUgb2YgYHRoaXNgIGZvciB0aGF0IGZ1bmN0aW9uXG4vLyB0byB0aGUgY3VycmVudCBkYXRhIGNvbnRleHQuXG5jb25zdCBiaW5kRGF0YUNvbnRleHQgPSBmdW5jdGlvbiAoeCkge1xuICBpZiAodHlwZW9mIHggPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgIGxldCBkYXRhID0gQmxhemUuZ2V0RGF0YSgpO1xuICAgICAgaWYgKGRhdGEgPT0gbnVsbClcbiAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgcmV0dXJuIHguYXBwbHkoZGF0YSwgYXJncyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4geDtcbn07XG5cbkJsYXplLl9PTERTVFlMRV9IRUxQRVIgPSB7fTtcblxuQmxhemUuX2dldFRlbXBsYXRlSGVscGVyID0gZnVuY3Rpb24gKHRlbXBsYXRlLCBuYW1lLCB0bXBsSW5zdGFuY2VGdW5jKSB7XG4gIC8vIFhYWCBDT01QQVQgV0lUSCAwLjkuM1xuICBsZXQgaXNLbm93bk9sZFN0eWxlSGVscGVyID0gZmFsc2U7XG5cbiAgaWYgKHRlbXBsYXRlLl9faGVscGVycy5oYXMobmFtZSkpIHtcbiAgICBjb25zdCBoZWxwZXIgPSB0ZW1wbGF0ZS5fX2hlbHBlcnMuZ2V0KG5hbWUpO1xuICAgIGlmIChoZWxwZXIgPT09IEJsYXplLl9PTERTVFlMRV9IRUxQRVIpIHtcbiAgICAgIGlzS25vd25PbGRTdHlsZUhlbHBlciA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChoZWxwZXIgIT0gbnVsbCkge1xuICAgICAgY29uc3QgcHJpbnROYW1lID0gYCR7dGVtcGxhdGUudmlld05hbWV9ICR7bmFtZX1gO1xuICAgICAgcmV0dXJuIHdyYXBIZWxwZXIoYmluZERhdGFDb250ZXh0KGhlbHBlciksIHRtcGxJbnN0YW5jZUZ1bmMsIHByaW50TmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIG9sZC1zdHlsZSBoZWxwZXJcbiAgaWYgKG5hbWUgaW4gdGVtcGxhdGUpIHtcbiAgICAvLyBPbmx5IHdhcm4gb25jZSBwZXIgaGVscGVyXG4gICAgaWYgKCEgaXNLbm93bk9sZFN0eWxlSGVscGVyKSB7XG4gICAgICB0ZW1wbGF0ZS5fX2hlbHBlcnMuc2V0KG5hbWUsIEJsYXplLl9PTERTVFlMRV9IRUxQRVIpO1xuICAgICAgaWYgKCEgdGVtcGxhdGUuX05PV0FSTl9PTERTVFlMRV9IRUxQRVJTKSB7XG4gICAgICAgIEJsYXplLl93YXJuKCdBc3NpZ25pbmcgaGVscGVyIHdpdGggYCcgKyB0ZW1wbGF0ZS52aWV3TmFtZSArICcuJyArXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgKyAnID0gLi4uYCBpcyBkZXByZWNhdGVkLiAgVXNlIGAnICsgdGVtcGxhdGUudmlld05hbWUgK1xuICAgICAgICAgICAgICAgICAgICAnLmhlbHBlcnMoLi4uKWAgaW5zdGVhZC4nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRlbXBsYXRlW25hbWVdICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB3cmFwSGVscGVyKGJpbmREYXRhQ29udGV4dCh0ZW1wbGF0ZVtuYW1lXSksIHRtcGxJbnN0YW5jZUZ1bmMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuY29uc3Qgd3JhcEhlbHBlciA9IGZ1bmN0aW9uIChmLCB0ZW1wbGF0ZUZ1bmMsIG5hbWUgPSAndGVtcGxhdGUgaGVscGVyJykge1xuICBpZiAodHlwZW9mIGYgIT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBmO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gQmxhemUuVGVtcGxhdGUuX3dpdGhUZW1wbGF0ZUluc3RhbmNlRnVuYyh0ZW1wbGF0ZUZ1bmMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBCbGF6ZS5fd3JhcENhdGNoaW5nRXhjZXB0aW9ucyhmLCBuYW1lKS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIF9sZXhpY2FsS2VlcEdvaW5nKGN1cnJlbnRWaWV3KSB7XG4gIGlmICghY3VycmVudFZpZXcucGFyZW50Vmlldykge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgaWYgKCFjdXJyZW50Vmlldy5fX3N0YXJ0c05ld0xleGljYWxTY29wZSkge1xuICAgIHJldHVybiBjdXJyZW50Vmlldy5wYXJlbnRWaWV3O1xuICB9XG4gIGlmIChjdXJyZW50Vmlldy5wYXJlbnRWaWV3Ll9fY2hpbGREb2VzbnRTdGFydE5ld0xleGljYWxTY29wZSkge1xuICAgIHJldHVybiBjdXJyZW50Vmlldy5wYXJlbnRWaWV3O1xuICB9XG5cbiAgLy8gaW4gdGhlIGNhc2Ugb2Yge3s+IFRlbXBsYXRlLmNvbnRlbnRCbG9jayBkYXRhfX0gdGhlIGNvbnRlbnRCbG9jayBsb3NlcyB0aGUgbGV4aWNhbCBzY29wZSBvZiBpdCdzIHBhcmVudCwgd2hlcmFzIHt7PiBUZW1wbGF0ZS5jb250ZW50QmxvY2t9fSBpdCBkb2VzIG5vdFxuICAvLyB0aGlzIGlzIGJlY2F1c2UgYSAjd2l0aCBzaXRzIGJldHdlZW4gdGhlIGluY2x1ZGUgSW5PdXRlclRlbXBsYXRlU2NvcGVcbiAgaWYgKGN1cnJlbnRWaWV3LnBhcmVudFZpZXcubmFtZSA9PT0gXCJ3aXRoXCIgJiYgY3VycmVudFZpZXcucGFyZW50Vmlldy5wYXJlbnRWaWV3ICYmIGN1cnJlbnRWaWV3LnBhcmVudFZpZXcucGFyZW50Vmlldy5fX2NoaWxkRG9lc250U3RhcnROZXdMZXhpY2FsU2NvcGUpIHtcbiAgICByZXR1cm4gY3VycmVudFZpZXcucGFyZW50VmlldztcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBfbGV4aWNhbEJpbmRpbmdMb29rdXAodmlldywgbmFtZSkge1xuICBsZXQgY3VycmVudFZpZXcgPSB2aWV3O1xuXG4gIC8vIHdhbGsgdXAgdGhlIHZpZXdzIHN0b3BwaW5nIGF0IGEgU3BhY2ViYXJzLmluY2x1ZGUgb3IgVGVtcGxhdGUgdmlldyB0aGF0XG4gIC8vIGRvZXNuJ3QgaGF2ZSBhbiBJbk91dGVyVGVtcGxhdGVTY29wZSB2aWV3IGFzIGEgcGFyZW50XG4gIGRvIHtcbiAgICAvLyBza2lwIGJsb2NrIGhlbHBlcnMgdmlld3NcbiAgICAvLyBpZiB3ZSBmb3VuZCB0aGUgYmluZGluZyBvbiB0aGUgc2NvcGUsIHJldHVybiBpdFxuICAgIGlmIChoYXMoY3VycmVudFZpZXcuX3Njb3BlQmluZGluZ3MsIG5hbWUpKSB7XG4gICAgICByZXR1cm4gY3VycmVudFZpZXcuX3Njb3BlQmluZGluZ3NbbmFtZV07XG4gICAgfVxuICB9IHdoaWxlIChjdXJyZW50VmlldyA9IF9sZXhpY2FsS2VlcEdvaW5nKGN1cnJlbnRWaWV3KSk7XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbkJsYXplLl9sZXhpY2FsQmluZGluZ0xvb2t1cCA9IGZ1bmN0aW9uICh2aWV3LCBuYW1lKSB7XG4gIGNvbnN0IGJpbmRpbmcgPSBfbGV4aWNhbEJpbmRpbmdMb29rdXAodmlldywgbmFtZSk7XG4gIHJldHVybiBiaW5kaW5nICYmICgoKSA9PiBiaW5kaW5nLmdldCgpPy52YWx1ZSk7XG59O1xuXG4vLyB0ZW1wbGF0ZUluc3RhbmNlIGFyZ3VtZW50IGlzIHByb3ZpZGVkIHRvIGJlIGF2YWlsYWJsZSBmb3IgcG9zc2libGVcbi8vIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9ucyBvZiB0aGlzIGZ1bmN0aW9uIGJ5IDNyZCBwYXJ0eSBwYWNrYWdlcy5cbkJsYXplLl9nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uIChuYW1lLCB0ZW1wbGF0ZUluc3RhbmNlKSB7XG4gIGlmICgobmFtZSBpbiBCbGF6ZS5UZW1wbGF0ZSkgJiYgKEJsYXplLlRlbXBsYXRlW25hbWVdIGluc3RhbmNlb2YgQmxhemUuVGVtcGxhdGUpKSB7XG4gICAgcmV0dXJuIEJsYXplLlRlbXBsYXRlW25hbWVdO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuQmxhemUuX2dldEdsb2JhbEhlbHBlciA9IGZ1bmN0aW9uIChuYW1lLCB0ZW1wbGF0ZUluc3RhbmNlKSB7XG4gIGlmIChCbGF6ZS5fZ2xvYmFsSGVscGVyc1tuYW1lXSAhPSBudWxsKSB7XG4gICAgY29uc3QgcHJpbnROYW1lID0gYGdsb2JhbCBoZWxwZXIgJHtuYW1lfWA7XG4gICAgcmV0dXJuIHdyYXBIZWxwZXIoYmluZERhdGFDb250ZXh0KEJsYXplLl9nbG9iYWxIZWxwZXJzW25hbWVdKSwgdGVtcGxhdGVJbnN0YW5jZSwgcHJpbnROYW1lKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8vIExvb2tzIHVwIGEgbmFtZSwgbGlrZSBcImZvb1wiIG9yIFwiLi5cIiwgYXMgYSBoZWxwZXIgb2YgdGhlXG4vLyBjdXJyZW50IHRlbXBsYXRlOyB0aGUgbmFtZSBvZiBhIHRlbXBsYXRlOyBhIGdsb2JhbCBoZWxwZXI7XG4vLyBvciBhIHByb3BlcnR5IG9mIHRoZSBkYXRhIGNvbnRleHQuICBDYWxsZWQgb24gdGhlIFZpZXcgb2Zcbi8vIGEgdGVtcGxhdGUgKGkuZS4gYSBWaWV3IHdpdGggYSBgLnRlbXBsYXRlYCBwcm9wZXJ0eSxcbi8vIHdoZXJlIHRoZSBoZWxwZXJzIGFyZSkuICBVc2VkIGZvciB0aGUgZmlyc3QgbmFtZSBpbiBhXG4vLyBcInBhdGhcIiBpbiBhIHRlbXBsYXRlIHRhZywgbGlrZSBcImZvb1wiIGluIGB7e2Zvby5iYXJ9fWAgb3Jcbi8vIFwiLi5cIiBpbiBge3tmcm9idWxhdGUgLi4vYmxhaH19YC5cbi8vXG4vLyBSZXR1cm5zIGEgZnVuY3Rpb24sIGEgbm9uLWZ1bmN0aW9uIHZhbHVlLCBvciBudWxsLiAgSWZcbi8vIGEgZnVuY3Rpb24gaXMgZm91bmQsIGl0IGlzIGJvdW5kIGFwcHJvcHJpYXRlbHkuXG4vL1xuLy8gTk9URTogVGhpcyBmdW5jdGlvbiBtdXN0IG5vdCBlc3RhYmxpc2ggYW55IHJlYWN0aXZlXG4vLyBkZXBlbmRlbmNpZXMgaXRzZWxmLiAgSWYgdGhlcmUgaXMgYW55IHJlYWN0aXZpdHkgaW4gdGhlXG4vLyB2YWx1ZSwgbG9va3VwIHNob3VsZCByZXR1cm4gYSBmdW5jdGlvbi5cbkJsYXplLlZpZXcucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uIChuYW1lLCBfb3B0aW9ucykge1xuICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gIGNvbnN0IGxvb2t1cFRlbXBsYXRlID0gX29wdGlvbnMgJiYgX29wdGlvbnMudGVtcGxhdGU7XG4gIGxldCBoZWxwZXI7XG4gIGxldCBiaW5kaW5nO1xuICBsZXQgYm91bmRUbXBsSW5zdGFuY2U7XG4gIGxldCBmb3VuZFRlbXBsYXRlO1xuXG4gIGlmICh0aGlzLnRlbXBsYXRlSW5zdGFuY2UpIHtcbiAgICBib3VuZFRtcGxJbnN0YW5jZSA9IEJsYXplLl9iaW5kKHRoaXMudGVtcGxhdGVJbnN0YW5jZSwgdGhpcyk7XG4gIH1cblxuICAvLyAwLiBsb29raW5nIHVwIHRoZSBwYXJlbnQgZGF0YSBjb250ZXh0IHdpdGggdGhlIHNwZWNpYWwgXCIuLi9cIiBzeW50YXhcbiAgaWYgKC9eXFwuLy50ZXN0KG5hbWUpKSB7XG4gICAgLy8gc3RhcnRzIHdpdGggYSBkb3QuIG11c3QgYmUgYSBzZXJpZXMgb2YgZG90cyB3aGljaCBtYXBzIHRvIGFuXG4gICAgLy8gYW5jZXN0b3Igb2YgdGhlIGFwcHJvcHJpYXRlIGhlaWdodC5cbiAgICBpZiAoIS9eKFxcLikrJC8udGVzdChuYW1lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlkIHN0YXJ0aW5nIHdpdGggZG90IG11c3QgYmUgYSBzZXJpZXMgb2YgZG90c1wiKTtcblxuICAgIHJldHVybiBCbGF6ZS5fcGFyZW50RGF0YShuYW1lLmxlbmd0aCAtIDEsIHRydWUgLypfZnVuY3Rpb25XcmFwcGVkKi8pO1xuXG4gIH1cblxuICAvLyAxLiBsb29rIHVwIGEgaGVscGVyIG9uIHRoZSBjdXJyZW50IHRlbXBsYXRlXG4gIGlmICh0ZW1wbGF0ZSAmJiAoKGhlbHBlciA9IEJsYXplLl9nZXRUZW1wbGF0ZUhlbHBlcih0ZW1wbGF0ZSwgbmFtZSwgYm91bmRUbXBsSW5zdGFuY2UpKSAhPSBudWxsKSkge1xuICAgIHJldHVybiBoZWxwZXI7XG4gIH1cblxuICAvLyAyLiBsb29rIHVwIGEgYmluZGluZyBieSB0cmF2ZXJzaW5nIHRoZSBsZXhpY2FsIHZpZXcgaGllcmFyY2h5IGluc2lkZSB0aGVcbiAgLy8gY3VycmVudCB0ZW1wbGF0ZVxuICBpZiAodGVtcGxhdGUgJiYgKGJpbmRpbmcgPSBCbGF6ZS5fbGV4aWNhbEJpbmRpbmdMb29rdXAoQmxhemUuY3VycmVudFZpZXcsIG5hbWUpKSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGJpbmRpbmc7XG4gIH1cblxuICAvLyAzLiBsb29rIHVwIGEgdGVtcGxhdGUgYnkgbmFtZVxuICBpZiAobG9va3VwVGVtcGxhdGUgJiYgKChmb3VuZFRlbXBsYXRlID0gQmxhemUuX2dldFRlbXBsYXRlKG5hbWUsIGJvdW5kVG1wbEluc3RhbmNlKSkgIT0gbnVsbCkpIHtcbiAgICByZXR1cm4gZm91bmRUZW1wbGF0ZTtcbiAgfVxuXG4gIC8vIDQuIGxvb2sgdXAgYSBnbG9iYWwgaGVscGVyXG4gIGhlbHBlciA9IEJsYXplLl9nZXRHbG9iYWxIZWxwZXIobmFtZSwgYm91bmRUbXBsSW5zdGFuY2UpO1xuICBpZiAoaGVscGVyICE9IG51bGwpIHtcbiAgICByZXR1cm4gaGVscGVyO1xuICB9XG5cbiAgLy8gNS4gbG9vayB1cCBpbiBhIGRhdGEgY29udGV4dFxuICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBpc0NhbGxlZEFzRnVuY3Rpb24gPSAoYXJncy5sZW5ndGggPiAwKTtcbiAgICBjb25zdCBkYXRhID0gQmxhemUuZ2V0RGF0YSgpO1xuICAgIGNvbnN0IHggPSBkYXRhICYmIGRhdGFbbmFtZV07XG4gICAgaWYgKCEgeCkge1xuICAgICAgaWYgKGxvb2t1cFRlbXBsYXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHN1Y2ggdGVtcGxhdGU6IFwiICsgbmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzQ2FsbGVkQXNGdW5jdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzdWNoIGZ1bmN0aW9uOiBcIiArIG5hbWUpO1xuICAgICAgfSBlbHNlIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gJ0AnICYmICgoeCA9PT0gbnVsbCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHggPT09IHVuZGVmaW5lZCkpKSB7XG4gICAgICAgIC8vIFRocm93IGFuIGVycm9yIGlmIHRoZSB1c2VyIHRyaWVzIHRvIHVzZSBhIGBAZGlyZWN0aXZlYFxuICAgICAgICAvLyB0aGF0IGRvZXNuJ3QgZXhpc3QuICBXZSBkb24ndCBpbXBsZW1lbnQgYWxsIGRpcmVjdGl2ZXNcbiAgICAgICAgLy8gZnJvbSBIYW5kbGViYXJzLCBzbyB0aGVyZSdzIGEgcG90ZW50aWFsIGZvciBjb25mdXNpb25cbiAgICAgICAgLy8gaWYgd2UgZmFpbCBzaWxlbnRseS4gIE9uIHRoZSBvdGhlciBoYW5kLCB3ZSB3YW50IHRvXG4gICAgICAgIC8vIHRocm93IGxhdGUgaW4gY2FzZSBzb21lIGFwcCBvciBwYWNrYWdlIHdhbnRzIHRvIHByb3ZpZGVcbiAgICAgICAgLy8gYSBtaXNzaW5nIGRpcmVjdGl2ZS5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgZGlyZWN0aXZlOiBcIiArIG5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoISBkYXRhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB4ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoaXNDYWxsZWRBc0Z1bmN0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNhbGwgbm9uLWZ1bmN0aW9uOiBcIiArIHgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIHJldHVybiB4LmFwcGx5KGRhdGEsIGFyZ3MpO1xuICB9O1xufTtcblxuLy8gSW1wbGVtZW50IFNwYWNlYmFycycge3suLi8uLn19LlxuLy8gQHBhcmFtIGhlaWdodCB7TnVtYmVyfSBUaGUgbnVtYmVyIG9mICcuLidzXG5CbGF6ZS5fcGFyZW50RGF0YSA9IGZ1bmN0aW9uIChoZWlnaHQsIF9mdW5jdGlvbldyYXBwZWQpIHtcbiAgLy8gSWYgaGVpZ2h0IGlzIG51bGwgb3IgdW5kZWZpbmVkLCB3ZSBkZWZhdWx0IHRvIDEsIHRoZSBmaXJzdCBwYXJlbnQuXG4gIGlmIChoZWlnaHQgPT0gbnVsbCkge1xuICAgIGhlaWdodCA9IDE7XG4gIH1cbiAgbGV0IHRoZVdpdGggPSBCbGF6ZS5nZXRWaWV3KCd3aXRoJyk7XG4gIGZvciAobGV0IGkgPSAwOyAoaSA8IGhlaWdodCkgJiYgdGhlV2l0aDsgaSsrKSB7XG4gICAgdGhlV2l0aCA9IEJsYXplLmdldFZpZXcodGhlV2l0aCwgJ3dpdGgnKTtcbiAgfVxuXG4gIGlmICghIHRoZVdpdGgpXG4gICAgcmV0dXJuIG51bGw7XG4gIGlmIChfZnVuY3Rpb25XcmFwcGVkKVxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGVXaXRoLmRhdGFWYXIuZ2V0KCk/LnZhbHVlOyB9O1xuICByZXR1cm4gdGhlV2l0aC5kYXRhVmFyLmdldCgpPy52YWx1ZTtcbn07XG5cblxuQmxhemUuVmlldy5wcm90b3R5cGUubG9va3VwVGVtcGxhdGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gdGhpcy5sb29rdXAobmFtZSwge3RlbXBsYXRlOnRydWV9KTtcbn07XG4iLCJpbXBvcnQgaXNPYmplY3QgZnJvbSAnbG9kYXNoLmlzb2JqZWN0JztcbmltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJ2xvZGFzaC5pc2Z1bmN0aW9uJztcbmltcG9ydCBoYXMgZnJvbSAnbG9kYXNoLmhhcyc7XG5pbXBvcnQgaXNFbXB0eSBmcm9tICdsb2Rhc2guaXNlbXB0eSc7XG5cbi8vIFtuZXddIEJsYXplLlRlbXBsYXRlKFt2aWV3TmFtZV0sIHJlbmRlckZ1bmN0aW9uKVxuLy9cbi8vIGBCbGF6ZS5UZW1wbGF0ZWAgaXMgdGhlIGNsYXNzIG9mIHRlbXBsYXRlcywgbGlrZSBgVGVtcGxhdGUuZm9vYCBpblxuLy8gTWV0ZW9yLCB3aGljaCBpcyBgaW5zdGFuY2VvZiBUZW1wbGF0ZWAuXG4vL1xuLy8gYHZpZXdLaW5kYCBpcyBhIHN0cmluZyB0aGF0IGxvb2tzIGxpa2UgXCJUZW1wbGF0ZS5mb29cIiBmb3IgdGVtcGxhdGVzXG4vLyBkZWZpbmVkIGJ5IHRoZSBjb21waWxlci5cblxuLyoqXG4gKiBAY2xhc3NcbiAqIEBzdW1tYXJ5IENvbnN0cnVjdG9yIGZvciBhIFRlbXBsYXRlLCB3aGljaCBpcyB1c2VkIHRvIGNvbnN0cnVjdCBWaWV3cyB3aXRoIHBhcnRpY3VsYXIgbmFtZSBhbmQgY29udGVudC5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbdmlld05hbWVdIE9wdGlvbmFsLiAgQSBuYW1lIGZvciBWaWV3cyBjb25zdHJ1Y3RlZCBieSB0aGlzIFRlbXBsYXRlLiAgU2VlIFtgdmlldy5uYW1lYF0oI3ZpZXdfbmFtZSkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZW5kZXJGdW5jdGlvbiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBbKnJlbmRlcmFibGUgY29udGVudCpdKCNSZW5kZXJhYmxlLUNvbnRlbnQpLiAgVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGFzIHRoZSBgcmVuZGVyRnVuY3Rpb25gIGZvciBWaWV3cyBjb25zdHJ1Y3RlZCBieSB0aGlzIFRlbXBsYXRlLlxuICovXG5CbGF6ZS5UZW1wbGF0ZSA9IGZ1bmN0aW9uICh2aWV3TmFtZSwgcmVuZGVyRnVuY3Rpb24pIHtcbiAgaWYgKCEgKHRoaXMgaW5zdGFuY2VvZiBCbGF6ZS5UZW1wbGF0ZSkpXG4gICAgLy8gY2FsbGVkIHdpdGhvdXQgYG5ld2BcbiAgICByZXR1cm4gbmV3IEJsYXplLlRlbXBsYXRlKHZpZXdOYW1lLCByZW5kZXJGdW5jdGlvbik7XG5cbiAgaWYgKHR5cGVvZiB2aWV3TmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIG9taXR0ZWQgXCJ2aWV3TmFtZVwiIGFyZ3VtZW50XG4gICAgcmVuZGVyRnVuY3Rpb24gPSB2aWV3TmFtZTtcbiAgICB2aWV3TmFtZSA9ICcnO1xuICB9XG4gIGlmICh0eXBlb2Ygdmlld05hbWUgIT09ICdzdHJpbmcnKVxuICAgIHRocm93IG5ldyBFcnJvcihcInZpZXdOYW1lIG11c3QgYmUgYSBTdHJpbmcgKG9yIG9taXR0ZWQpXCIpO1xuICBpZiAodHlwZW9mIHJlbmRlckZ1bmN0aW9uICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBFcnJvcihcInJlbmRlckZ1bmN0aW9uIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcblxuICB0aGlzLnZpZXdOYW1lID0gdmlld05hbWU7XG4gIHRoaXMucmVuZGVyRnVuY3Rpb24gPSByZW5kZXJGdW5jdGlvbjtcblxuICB0aGlzLl9faGVscGVycyA9IG5ldyBIZWxwZXJNYXA7XG4gIHRoaXMuX19ldmVudE1hcHMgPSBbXTtcblxuICB0aGlzLl9jYWxsYmFja3MgPSB7XG4gICAgY3JlYXRlZDogW10sXG4gICAgcmVuZGVyZWQ6IFtdLFxuICAgIGRlc3Ryb3llZDogW11cbiAgfTtcbn07XG5jb25zdCBUZW1wbGF0ZSA9IEJsYXplLlRlbXBsYXRlO1xuXG5jb25zdCBIZWxwZXJNYXAgPSBmdW5jdGlvbiAoKSB7fTtcbkhlbHBlck1hcC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXNbJyAnK25hbWVdO1xufTtcbkhlbHBlck1hcC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG5hbWUsIGhlbHBlcikge1xuICB0aGlzWycgJytuYW1lXSA9IGhlbHBlcjtcbn07XG5IZWxwZXJNYXAucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiAodHlwZW9mIHRoaXNbJyAnK25hbWVdICE9PSAndW5kZWZpbmVkJyk7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJldHVybnMgdHJ1ZSBpZiBgdmFsdWVgIGlzIGEgdGVtcGxhdGUgb2JqZWN0IGxpa2UgYFRlbXBsYXRlLm15VGVtcGxhdGVgLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtBbnl9IHZhbHVlIFRoZSB2YWx1ZSB0byB0ZXN0LlxuICovXG5CbGF6ZS5pc1RlbXBsYXRlID0gZnVuY3Rpb24gKHQpIHtcbiAgcmV0dXJuICh0IGluc3RhbmNlb2YgQmxhemUuVGVtcGxhdGUpO1xufTtcblxuLyoqXG4gKiBAbmFtZSAgb25DcmVhdGVkXG4gKiBAaW5zdGFuY2VcbiAqIEBtZW1iZXJPZiBUZW1wbGF0ZVxuICogQHN1bW1hcnkgUmVnaXN0ZXIgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBhbiBpbnN0YW5jZSBvZiB0aGlzIHRlbXBsYXRlIGlzIGNyZWF0ZWQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBBIGZ1bmN0aW9uIHRvIGJlIGFkZGVkIGFzIGEgY2FsbGJhY2suXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5wcm90b3R5cGUub25DcmVhdGVkID0gZnVuY3Rpb24gKGNiKSB7XG4gIHRoaXMuX2NhbGxiYWNrcy5jcmVhdGVkLnB1c2goY2IpO1xufTtcblxuLyoqXG4gKiBAbmFtZSAgb25SZW5kZXJlZFxuICogQGluc3RhbmNlXG4gKiBAbWVtYmVyT2YgVGVtcGxhdGVcbiAqIEBzdW1tYXJ5IFJlZ2lzdGVyIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gYW4gaW5zdGFuY2Ugb2YgdGhpcyB0ZW1wbGF0ZSBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBBIGZ1bmN0aW9uIHRvIGJlIGFkZGVkIGFzIGEgY2FsbGJhY2suXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5wcm90b3R5cGUub25SZW5kZXJlZCA9IGZ1bmN0aW9uIChjYikge1xuICB0aGlzLl9jYWxsYmFja3MucmVuZGVyZWQucHVzaChjYik7XG59O1xuXG4vKipcbiAqIEBuYW1lICBvbkRlc3Ryb3llZFxuICogQGluc3RhbmNlXG4gKiBAbWVtYmVyT2YgVGVtcGxhdGVcbiAqIEBzdW1tYXJ5IFJlZ2lzdGVyIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gYW4gaW5zdGFuY2Ugb2YgdGhpcyB0ZW1wbGF0ZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTSBhbmQgZGVzdHJveWVkLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQSBmdW5jdGlvbiB0byBiZSBhZGRlZCBhcyBhIGNhbGxiYWNrLlxuICogQGxvY3VzIENsaWVudFxuICogQGltcG9ydEZyb21QYWNrYWdlIHRlbXBsYXRpbmdcbiAqL1xuVGVtcGxhdGUucHJvdG90eXBlLm9uRGVzdHJveWVkID0gZnVuY3Rpb24gKGNiKSB7XG4gIHRoaXMuX2NhbGxiYWNrcy5kZXN0cm95ZWQucHVzaChjYik7XG59O1xuXG5UZW1wbGF0ZS5wcm90b3R5cGUuX2dldENhbGxiYWNrcyA9IGZ1bmN0aW9uICh3aGljaCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgbGV0IGNhbGxiYWNrcyA9IHNlbGZbd2hpY2hdID8gW3NlbGZbd2hpY2hdXSA6IFtdO1xuICAvLyBGaXJlIGFsbCBjYWxsYmFja3MgYWRkZWQgd2l0aCB0aGUgbmV3IEFQSSAoVGVtcGxhdGUub25SZW5kZXJlZCgpKVxuICAvLyBhcyB3ZWxsIGFzIHRoZSBvbGQtc3R5bGUgY2FsbGJhY2sgKGUuZy4gVGVtcGxhdGUucmVuZGVyZWQpIGZvclxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eS5cbiAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLmNvbmNhdChzZWxmLl9jYWxsYmFja3Nbd2hpY2hdKTtcbiAgcmV0dXJuIGNhbGxiYWNrcztcbn07XG5cbmNvbnN0IGZpcmVDYWxsYmFja3MgPSBmdW5jdGlvbiAoY2FsbGJhY2tzLCB0ZW1wbGF0ZSkge1xuICBUZW1wbGF0ZS5fd2l0aFRlbXBsYXRlSW5zdGFuY2VGdW5jKFxuICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRlbXBsYXRlOyB9LFxuICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwLCBOID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IE47IGkrKykge1xuICAgICAgICBjYWxsYmFja3NbaV0uY2FsbCh0ZW1wbGF0ZSk7XG4gICAgICB9XG4gICAgfSk7XG59O1xuXG5UZW1wbGF0ZS5wcm90b3R5cGUuY29uc3RydWN0VmlldyA9IGZ1bmN0aW9uIChjb250ZW50RnVuYywgZWxzZUZ1bmMpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIGNvbnN0IHZpZXcgPSBCbGF6ZS5WaWV3KHNlbGYudmlld05hbWUsIHNlbGYucmVuZGVyRnVuY3Rpb24pO1xuICB2aWV3LnRlbXBsYXRlID0gc2VsZjtcblxuICB2aWV3LnRlbXBsYXRlQ29udGVudEJsb2NrID0gKFxuICAgIGNvbnRlbnRGdW5jID8gbmV3IFRlbXBsYXRlKCcoY29udGVudEJsb2NrKScsIGNvbnRlbnRGdW5jKSA6IG51bGwpO1xuICB2aWV3LnRlbXBsYXRlRWxzZUJsb2NrID0gKFxuICAgIGVsc2VGdW5jID8gbmV3IFRlbXBsYXRlKCcoZWxzZUJsb2NrKScsIGVsc2VGdW5jKSA6IG51bGwpO1xuXG4gIGlmIChzZWxmLl9fZXZlbnRNYXBzIHx8IHR5cGVvZiBzZWxmLmV2ZW50cyA9PT0gJ29iamVjdCcpIHtcbiAgICB2aWV3Ll9vblZpZXdSZW5kZXJlZChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodmlldy5yZW5kZXJDb3VudCAhPT0gMSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBpZiAoISBzZWxmLl9fZXZlbnRNYXBzLmxlbmd0aCAmJiB0eXBlb2Ygc2VsZi5ldmVudHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgLy8gUHJvdmlkZSBsaW1pdGVkIGJhY2stY29tcGF0IHN1cHBvcnQgZm9yIGAuZXZlbnRzID0gey4uLn1gXG4gICAgICAgIC8vIHN5bnRheC4gIFBhc3MgYHRlbXBsYXRlLmV2ZW50c2AgdG8gdGhlIG9yaWdpbmFsIGAuZXZlbnRzKC4uLilgXG4gICAgICAgIC8vIGZ1bmN0aW9uLiAgVGhpcyBjb2RlIG11c3QgcnVuIG9ubHkgb25jZSBwZXIgdGVtcGxhdGUsIGluXG4gICAgICAgIC8vIG9yZGVyIHRvIG5vdCBiaW5kIHRoZSBoYW5kbGVycyBtb3JlIHRoYW4gb25jZSwgd2hpY2ggaXNcbiAgICAgICAgLy8gZW5zdXJlZCBieSB0aGUgZmFjdCB0aGF0IHdlIG9ubHkgZG8gdGhpcyB3aGVuIGBfX2V2ZW50TWFwc2BcbiAgICAgICAgLy8gaXMgZmFsc3ksIGFuZCB3ZSBjYXVzZSBpdCB0byBiZSBzZXQgbm93LlxuICAgICAgICBUZW1wbGF0ZS5wcm90b3R5cGUuZXZlbnRzLmNhbGwoc2VsZiwgc2VsZi5ldmVudHMpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9fZXZlbnRNYXBzLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgQmxhemUuX2FkZEV2ZW50TWFwKHZpZXcsIG0sIHZpZXcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICB2aWV3Ll90ZW1wbGF0ZUluc3RhbmNlID0gbmV3IEJsYXplLlRlbXBsYXRlSW5zdGFuY2Uodmlldyk7XG4gIHZpZXcudGVtcGxhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBVcGRhdGUgZGF0YSwgZmlyc3ROb2RlLCBhbmQgbGFzdE5vZGUsIGFuZCByZXR1cm4gdGhlIFRlbXBsYXRlSW5zdGFuY2VcbiAgICAvLyBvYmplY3QuXG4gICAgY29uc3QgaW5zdCA9IHZpZXcuX3RlbXBsYXRlSW5zdGFuY2U7XG5cbiAgICAvKipcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyT2YgQmxhemUuVGVtcGxhdGVJbnN0YW5jZVxuICAgICAqIEBuYW1lICBkYXRhXG4gICAgICogQHN1bW1hcnkgVGhlIGRhdGEgY29udGV4dCBvZiB0aGlzIGluc3RhbmNlJ3MgbGF0ZXN0IGludm9jYXRpb24uXG4gICAgICogQGxvY3VzIENsaWVudFxuICAgICAqL1xuICAgIGluc3QuZGF0YSA9IEJsYXplLmdldERhdGEodmlldyk7XG5cbiAgICBpZiAodmlldy5fZG9tcmFuZ2UgJiYgIXZpZXcuaXNEZXN0cm95ZWQpIHtcbiAgICAgIGluc3QuZmlyc3ROb2RlID0gdmlldy5fZG9tcmFuZ2UuZmlyc3ROb2RlKCk7XG4gICAgICBpbnN0Lmxhc3ROb2RlID0gdmlldy5fZG9tcmFuZ2UubGFzdE5vZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb24gJ2NyZWF0ZWQnIG9yICdkZXN0cm95ZWQnIGNhbGxiYWNrcyB3ZSBkb24ndCBoYXZlIGEgRG9tUmFuZ2VcbiAgICAgIGluc3QuZmlyc3ROb2RlID0gbnVsbDtcbiAgICAgIGluc3QubGFzdE5vZGUgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBpbnN0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmFtZSAgY3JlYXRlZFxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlck9mIFRlbXBsYXRlXG4gICAqIEBzdW1tYXJ5IFByb3ZpZGUgYSBjYWxsYmFjayB3aGVuIGFuIGluc3RhbmNlIG9mIGEgdGVtcGxhdGUgaXMgY3JlYXRlZC5cbiAgICogQGxvY3VzIENsaWVudFxuICAgKiBAZGVwcmVjYXRlZCBpbiAxLjFcbiAgICovXG4gIC8vIFRvIGF2b2lkIHNpdHVhdGlvbnMgd2hlbiBuZXcgY2FsbGJhY2tzIGFyZSBhZGRlZCBpbiBiZXR3ZWVuIHZpZXdcbiAgLy8gaW5zdGFudGlhdGlvbiBhbmQgZXZlbnQgYmVpbmcgZmlyZWQsIGRlY2lkZSBvbiBhbGwgY2FsbGJhY2tzIHRvIGZpcmVcbiAgLy8gaW1tZWRpYXRlbHkgYW5kIHRoZW4gZmlyZSB0aGVtIG9uIHRoZSBldmVudC5cbiAgY29uc3QgY3JlYXRlZENhbGxiYWNrcyA9IHNlbGYuX2dldENhbGxiYWNrcygnY3JlYXRlZCcpO1xuICB2aWV3Lm9uVmlld0NyZWF0ZWQoZnVuY3Rpb24gKCkge1xuICAgIGZpcmVDYWxsYmFja3MoY3JlYXRlZENhbGxiYWNrcywgdmlldy50ZW1wbGF0ZUluc3RhbmNlKCkpO1xuICB9KTtcblxuICAvKipcbiAgICogQG5hbWUgIHJlbmRlcmVkXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyT2YgVGVtcGxhdGVcbiAgICogQHN1bW1hcnkgUHJvdmlkZSBhIGNhbGxiYWNrIHdoZW4gYW4gaW5zdGFuY2Ugb2YgYSB0ZW1wbGF0ZSBpcyByZW5kZXJlZC5cbiAgICogQGxvY3VzIENsaWVudFxuICAgKiBAZGVwcmVjYXRlZCBpbiAxLjFcbiAgICovXG4gIGNvbnN0IHJlbmRlcmVkQ2FsbGJhY2tzID0gc2VsZi5fZ2V0Q2FsbGJhY2tzKCdyZW5kZXJlZCcpO1xuICB2aWV3Lm9uVmlld1JlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICBmaXJlQ2FsbGJhY2tzKHJlbmRlcmVkQ2FsbGJhY2tzLCB2aWV3LnRlbXBsYXRlSW5zdGFuY2UoKSk7XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBAbmFtZSAgZGVzdHJveWVkXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyT2YgVGVtcGxhdGVcbiAgICogQHN1bW1hcnkgUHJvdmlkZSBhIGNhbGxiYWNrIHdoZW4gYW4gaW5zdGFuY2Ugb2YgYSB0ZW1wbGF0ZSBpcyBkZXN0cm95ZWQuXG4gICAqIEBsb2N1cyBDbGllbnRcbiAgICogQGRlcHJlY2F0ZWQgaW4gMS4xXG4gICAqL1xuICBjb25zdCBkZXN0cm95ZWRDYWxsYmFja3MgPSBzZWxmLl9nZXRDYWxsYmFja3MoJ2Rlc3Ryb3llZCcpO1xuICB2aWV3Lm9uVmlld0Rlc3Ryb3llZChmdW5jdGlvbiAoKSB7XG4gICAgZmlyZUNhbGxiYWNrcyhkZXN0cm95ZWRDYWxsYmFja3MsIHZpZXcudGVtcGxhdGVJbnN0YW5jZSgpKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHZpZXc7XG59O1xuXG4vKipcbiAqIEBjbGFzc1xuICogQHN1bW1hcnkgVGhlIGNsYXNzIGZvciB0ZW1wbGF0ZSBpbnN0YW5jZXNcbiAqIEBwYXJhbSB7QmxhemUuVmlld30gdmlld1xuICogQGluc3RhbmNlTmFtZSB0ZW1wbGF0ZVxuICovXG5CbGF6ZS5UZW1wbGF0ZUluc3RhbmNlID0gZnVuY3Rpb24gKHZpZXcpIHtcbiAgaWYgKCEgKHRoaXMgaW5zdGFuY2VvZiBCbGF6ZS5UZW1wbGF0ZUluc3RhbmNlKSlcbiAgICAvLyBjYWxsZWQgd2l0aG91dCBgbmV3YFxuICAgIHJldHVybiBuZXcgQmxhemUuVGVtcGxhdGVJbnN0YW5jZSh2aWV3KTtcblxuICBpZiAoISAodmlldyBpbnN0YW5jZW9mIEJsYXplLlZpZXcpKVxuICAgIHRocm93IG5ldyBFcnJvcihcIlZpZXcgcmVxdWlyZWRcIik7XG5cbiAgdmlldy5fdGVtcGxhdGVJbnN0YW5jZSA9IHRoaXM7XG5cbiAgLyoqXG4gICAqIEBuYW1lIHZpZXdcbiAgICogQG1lbWJlck9mIEJsYXplLlRlbXBsYXRlSW5zdGFuY2VcbiAgICogQGluc3RhbmNlXG4gICAqIEBzdW1tYXJ5IFRoZSBbVmlld10oLi4vYXBpL2JsYXplLmh0bWwjQmxhemUtVmlldykgb2JqZWN0IGZvciB0aGlzIGludm9jYXRpb24gb2YgdGhlIHRlbXBsYXRlLlxuICAgKiBAbG9jdXMgQ2xpZW50XG4gICAqIEB0eXBlIHtCbGF6ZS5WaWV3fVxuICAgKi9cbiAgdGhpcy52aWV3ID0gdmlldztcbiAgdGhpcy5kYXRhID0gbnVsbDtcblxuICAvKipcbiAgICogQG5hbWUgZmlyc3ROb2RlXG4gICAqIEBtZW1iZXJPZiBCbGF6ZS5UZW1wbGF0ZUluc3RhbmNlXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAc3VtbWFyeSBUaGUgZmlyc3QgdG9wLWxldmVsIERPTSBub2RlIGluIHRoaXMgdGVtcGxhdGUgaW5zdGFuY2UuXG4gICAqIEBsb2N1cyBDbGllbnRcbiAgICogQHR5cGUge0RPTU5vZGV9XG4gICAqL1xuICB0aGlzLmZpcnN0Tm9kZSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEBuYW1lIGxhc3ROb2RlXG4gICAqIEBtZW1iZXJPZiBCbGF6ZS5UZW1wbGF0ZUluc3RhbmNlXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAc3VtbWFyeSBUaGUgbGFzdCB0b3AtbGV2ZWwgRE9NIG5vZGUgaW4gdGhpcyB0ZW1wbGF0ZSBpbnN0YW5jZS5cbiAgICogQGxvY3VzIENsaWVudFxuICAgKiBAdHlwZSB7RE9NTm9kZX1cbiAgICovXG4gIHRoaXMubGFzdE5vZGUgPSBudWxsO1xuXG4gIC8vIFRoaXMgZGVwZW5kZW5jeSBpcyB1c2VkIHRvIGlkZW50aWZ5IHN0YXRlIHRyYW5zaXRpb25zIGluXG4gIC8vIF9zdWJzY3JpcHRpb25IYW5kbGVzIHdoaWNoIGNvdWxkIGNhdXNlIHRoZSByZXN1bHQgb2ZcbiAgLy8gVGVtcGxhdGVJbnN0YW5jZSNzdWJzY3JpcHRpb25zUmVhZHkgdG8gY2hhbmdlLiBCYXNpY2FsbHkgdGhpcyBpcyB0cmlnZ2VyZWRcbiAgLy8gd2hlbmV2ZXIgYSBuZXcgc3Vic2NyaXB0aW9uIGhhbmRsZSBpcyBhZGRlZCBvciB3aGVuIGEgc3Vic2NyaXB0aW9uIGhhbmRsZVxuICAvLyBpcyByZW1vdmVkIGFuZCB0aGV5IGFyZSBub3QgcmVhZHkuXG4gIHRoaXMuX2FsbFN1YnNSZWFkeURlcCA9IG5ldyBUcmFja2VyLkRlcGVuZGVuY3koKTtcbiAgdGhpcy5fYWxsU3Vic1JlYWR5ID0gZmFsc2U7XG5cbiAgdGhpcy5fc3Vic2NyaXB0aW9uSGFuZGxlcyA9IHt9O1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBGaW5kIGFsbCBlbGVtZW50cyBtYXRjaGluZyBgc2VsZWN0b3JgIGluIHRoaXMgdGVtcGxhdGUgaW5zdGFuY2UsIGFuZCByZXR1cm4gdGhlbSBhcyBhIEpRdWVyeSBvYmplY3QuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgVGhlIENTUyBzZWxlY3RvciB0byBtYXRjaCwgc2NvcGVkIHRvIHRoZSB0ZW1wbGF0ZSBjb250ZW50cy5cbiAqIEByZXR1cm5zIHtET01Ob2RlW119XG4gKi9cbkJsYXplLlRlbXBsYXRlSW5zdGFuY2UucHJvdG90eXBlLiQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgY29uc3QgdmlldyA9IHRoaXMudmlldztcbiAgaWYgKCEgdmlldy5fZG9tcmFuZ2UpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgdXNlICQgb24gdGVtcGxhdGUgaW5zdGFuY2Ugd2l0aCBubyBET01cIik7XG4gIHJldHVybiB2aWV3Ll9kb21yYW5nZS4kKHNlbGVjdG9yKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgRmluZCBhbGwgZWxlbWVudHMgbWF0Y2hpbmcgYHNlbGVjdG9yYCBpbiB0aGlzIHRlbXBsYXRlIGluc3RhbmNlLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIFRoZSBDU1Mgc2VsZWN0b3IgdG8gbWF0Y2gsIHNjb3BlZCB0byB0aGUgdGVtcGxhdGUgY29udGVudHMuXG4gKiBAcmV0dXJucyB7RE9NRWxlbWVudFtdfVxuICovXG5CbGF6ZS5UZW1wbGF0ZUluc3RhbmNlLnByb3RvdHlwZS5maW5kQWxsID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLiQoc2VsZWN0b3IpKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgRmluZCBvbmUgZWxlbWVudCBtYXRjaGluZyBgc2VsZWN0b3JgIGluIHRoaXMgdGVtcGxhdGUgaW5zdGFuY2UuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgVGhlIENTUyBzZWxlY3RvciB0byBtYXRjaCwgc2NvcGVkIHRvIHRoZSB0ZW1wbGF0ZSBjb250ZW50cy5cbiAqIEByZXR1cm5zIHtET01FbGVtZW50fVxuICovXG5CbGF6ZS5UZW1wbGF0ZUluc3RhbmNlLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHRoaXMuJChzZWxlY3Rvcik7XG4gIHJldHVybiByZXN1bHRbMF0gfHwgbnVsbDtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgQSB2ZXJzaW9uIG9mIFtUcmFja2VyLmF1dG9ydW5dKGh0dHBzOi8vZG9jcy5tZXRlb3IuY29tL2FwaS90cmFja2VyLmh0bWwjVHJhY2tlci1hdXRvcnVuKSB0aGF0IGlzIHN0b3BwZWQgd2hlbiB0aGUgdGVtcGxhdGUgaXMgZGVzdHJveWVkLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcnVuRnVuYyBUaGUgZnVuY3Rpb24gdG8gcnVuLiBJdCByZWNlaXZlcyBvbmUgYXJndW1lbnQ6IGEgVHJhY2tlci5Db21wdXRhdGlvbiBvYmplY3QuXG4gKi9cbkJsYXplLlRlbXBsYXRlSW5zdGFuY2UucHJvdG90eXBlLmF1dG9ydW4gPSBmdW5jdGlvbiAoZikge1xuICByZXR1cm4gdGhpcy52aWV3LmF1dG9ydW4oZik7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IEEgdmVyc2lvbiBvZiBbTWV0ZW9yLnN1YnNjcmliZV0oaHR0cHM6Ly9kb2NzLm1ldGVvci5jb20vYXBpL3B1YnN1Yi5odG1sI01ldGVvci1zdWJzY3JpYmUpIHRoYXQgaXMgc3RvcHBlZFxuICogd2hlbiB0aGUgdGVtcGxhdGUgaXMgZGVzdHJveWVkLlxuICogQHJldHVybiB7U3Vic2NyaXB0aW9uSGFuZGxlfSBUaGUgc3Vic2NyaXB0aW9uIGhhbmRsZSB0byB0aGUgbmV3bHkgbWFkZVxuICogc3Vic2NyaXB0aW9uLiBDYWxsIGBoYW5kbGUuc3RvcCgpYCB0byBtYW51YWxseSBzdG9wIHRoZSBzdWJzY3JpcHRpb24sIG9yXG4gKiBgaGFuZGxlLnJlYWR5KClgIHRvIGZpbmQgb3V0IGlmIHRoaXMgcGFydGljdWxhciBzdWJzY3JpcHRpb24gaGFzIGxvYWRlZCBhbGxcbiAqIG9mIGl0cyBpbml0YWwgZGF0YS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIE5hbWUgb2YgdGhlIHN1YnNjcmlwdGlvbi4gIE1hdGNoZXMgdGhlIG5hbWUgb2YgdGhlXG4gKiBzZXJ2ZXIncyBgcHVibGlzaCgpYCBjYWxsLlxuICogQHBhcmFtIHtBbnl9IFthcmcxLGFyZzIuLi5dIE9wdGlvbmFsIGFyZ3VtZW50cyBwYXNzZWQgdG8gcHVibGlzaGVyIGZ1bmN0aW9uXG4gKiBvbiBzZXJ2ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gW29wdGlvbnNdIElmIGEgZnVuY3Rpb24gaXMgcGFzc2VkIGluc3RlYWQgb2YgYW5cbiAqIG9iamVjdCwgaXQgaXMgaW50ZXJwcmV0ZWQgYXMgYW4gYG9uUmVhZHlgIGNhbGxiYWNrLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMub25SZWFkeV0gUGFzc2VkIHRvIFtgTWV0ZW9yLnN1YnNjcmliZWBdKGh0dHBzOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9wdWJzdWIuaHRtbCNNZXRlb3Itc3Vic2NyaWJlKS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLm9uU3RvcF0gUGFzc2VkIHRvIFtgTWV0ZW9yLnN1YnNjcmliZWBdKGh0dHBzOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9wdWJzdWIuaHRtbCNNZXRlb3Itc3Vic2NyaWJlKS5cbiAqIEBwYXJhbSB7RERQLkNvbm5lY3Rpb259IFtvcHRpb25zLmNvbm5lY3Rpb25dIFRoZSBjb25uZWN0aW9uIG9uIHdoaWNoIHRvIG1ha2UgdGhlXG4gKiBzdWJzY3JpcHRpb24uXG4gKi9cbkJsYXplLlRlbXBsYXRlSW5zdGFuY2UucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gIGNvbnN0IHN1YkhhbmRsZXMgPSBzZWxmLl9zdWJzY3JpcHRpb25IYW5kbGVzO1xuXG4gIC8vIER1cGxpY2F0ZSBsb2dpYyBmcm9tIE1ldGVvci5zdWJzY3JpYmVcbiAgbGV0IG9wdGlvbnMgPSB7fTtcbiAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgY29uc3QgbGFzdFBhcmFtID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuXG4gICAgLy8gTWF0Y2ggcGF0dGVybiB0byBjaGVjayBpZiB0aGUgbGFzdCBhcmcgaXMgYW4gb3B0aW9ucyBhcmd1bWVudFxuICAgIGNvbnN0IGxhc3RQYXJhbU9wdGlvbnNQYXR0ZXJuID0ge1xuICAgICAgb25SZWFkeTogTWF0Y2guT3B0aW9uYWwoRnVuY3Rpb24pLFxuICAgICAgLy8gWFhYIENPTVBBVCBXSVRIIDEuMC4zLjEgb25FcnJvciB1c2VkIHRvIGV4aXN0LCBidXQgbm93IHdlIHVzZVxuICAgICAgLy8gb25TdG9wIHdpdGggYW4gZXJyb3IgY2FsbGJhY2sgaW5zdGVhZC5cbiAgICAgIG9uRXJyb3I6IE1hdGNoLk9wdGlvbmFsKEZ1bmN0aW9uKSxcbiAgICAgIG9uU3RvcDogTWF0Y2guT3B0aW9uYWwoRnVuY3Rpb24pLFxuICAgICAgY29ubmVjdGlvbjogTWF0Y2guT3B0aW9uYWwoTWF0Y2guQW55KVxuICAgIH07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihsYXN0UGFyYW0pKSB7XG4gICAgICBvcHRpb25zLm9uUmVhZHkgPSBhcmdzLnBvcCgpO1xuICAgIH0gZWxzZSBpZiAobGFzdFBhcmFtICYmICEgaXNFbXB0eShsYXN0UGFyYW0pICYmIE1hdGNoLnRlc3QobGFzdFBhcmFtLCBsYXN0UGFyYW1PcHRpb25zUGF0dGVybikpIHtcbiAgICAgIG9wdGlvbnMgPSBhcmdzLnBvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBzdWJIYW5kbGU7XG4gIGNvbnN0IG9sZFN0b3BwZWQgPSBvcHRpb25zLm9uU3RvcDtcbiAgb3B0aW9ucy5vblN0b3AgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAvLyBXaGVuIHRoZSBzdWJzY3JpcHRpb24gaXMgc3RvcHBlZCwgcmVtb3ZlIGl0IGZyb20gdGhlIHNldCBvZiB0cmFja2VkXG4gICAgLy8gc3Vic2NyaXB0aW9ucyB0byBhdm9pZCB0aGlzIGxpc3QgZ3Jvd2luZyB3aXRob3V0IGJvdW5kXG4gICAgZGVsZXRlIHN1YkhhbmRsZXNbc3ViSGFuZGxlLnN1YnNjcmlwdGlvbklkXTtcblxuICAgIC8vIFJlbW92aW5nIGEgc3Vic2NyaXB0aW9uIGNhbiBvbmx5IGNoYW5nZSB0aGUgcmVzdWx0IG9mIHN1YnNjcmlwdGlvbnNSZWFkeVxuICAgIC8vIGlmIHdlIGFyZSBub3QgcmVhZHkgKHRoYXQgc3Vic2NyaXB0aW9uIGNvdWxkIGJlIHRoZSBvbmUgYmxvY2tpbmcgdXMgYmVpbmdcbiAgICAvLyByZWFkeSkuXG4gICAgaWYgKCEgc2VsZi5fYWxsU3Vic1JlYWR5KSB7XG4gICAgICBzZWxmLl9hbGxTdWJzUmVhZHlEZXAuY2hhbmdlZCgpO1xuICAgIH1cblxuICAgIGlmIChvbGRTdG9wcGVkKSB7XG4gICAgICBvbGRTdG9wcGVkKGVycm9yKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgeyBvblJlYWR5LCBvbkVycm9yLCBvblN0b3AsIGNvbm5lY3Rpb24gfSA9IG9wdGlvbnM7XG4gIGNvbnN0IGNhbGxiYWNrcyA9IHsgb25SZWFkeSwgb25FcnJvciwgb25TdG9wIH07XG5cbiAgLy8gVGhlIGNhbGxiYWNrcyBhcmUgcGFzc2VkIGFzIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGFyZ3VtZW50cyBhcnJheSBwYXNzZWQgdG9cbiAgLy8gVmlldyNzdWJzY3JpYmVcbiAgYXJncy5wdXNoKGNhbGxiYWNrcyk7XG5cbiAgLy8gVmlldyNzdWJzY3JpYmUgdGFrZXMgdGhlIGNvbm5lY3Rpb24gYXMgb25lIG9mIHRoZSBvcHRpb25zIGluIHRoZSBsYXN0XG4gIC8vIGFyZ3VtZW50XG4gIHN1YkhhbmRsZSA9IHNlbGYudmlldy5zdWJzY3JpYmUuY2FsbChzZWxmLnZpZXcsIGFyZ3MsIHtcbiAgICBjb25uZWN0aW9uOiBjb25uZWN0aW9uXG4gIH0pO1xuXG4gIGlmICghaGFzKHN1YkhhbmRsZXMsIHN1YkhhbmRsZS5zdWJzY3JpcHRpb25JZCkpIHtcbiAgICBzdWJIYW5kbGVzW3N1YkhhbmRsZS5zdWJzY3JpcHRpb25JZF0gPSBzdWJIYW5kbGU7XG5cbiAgICAvLyBBZGRpbmcgYSBuZXcgc3Vic2NyaXB0aW9uIHdpbGwgYWx3YXlzIGNhdXNlIHVzIHRvIHRyYW5zaXRpb24gZnJvbSByZWFkeVxuICAgIC8vIHRvIG5vdCByZWFkeSwgYnV0IGlmIHdlIGFyZSBhbHJlYWR5IG5vdCByZWFkeSB0aGVuIHRoaXMgY2FuJ3QgbWFrZSB1c1xuICAgIC8vIHJlYWR5LlxuICAgIGlmIChzZWxmLl9hbGxTdWJzUmVhZHkpIHtcbiAgICAgIHNlbGYuX2FsbFN1YnNSZWFkeURlcC5jaGFuZ2VkKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN1YkhhbmRsZTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgQSByZWFjdGl2ZSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSB3aGVuIGFsbCBvZiB0aGUgc3Vic2NyaXB0aW9uc1xuICogY2FsbGVkIHdpdGggW3RoaXMuc3Vic2NyaWJlXSgjVGVtcGxhdGVJbnN0YW5jZS1zdWJzY3JpYmUpIGFyZSByZWFkeS5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFRydWUgaWYgYWxsIHN1YnNjcmlwdGlvbnMgb24gdGhpcyB0ZW1wbGF0ZSBpbnN0YW5jZSBhcmVcbiAqIHJlYWR5LlxuICovXG5CbGF6ZS5UZW1wbGF0ZUluc3RhbmNlLnByb3RvdHlwZS5zdWJzY3JpcHRpb25zUmVhZHkgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuX2FsbFN1YnNSZWFkeURlcC5kZXBlbmQoKTtcbiAgdGhpcy5fYWxsU3Vic1JlYWR5ID0gT2JqZWN0LnZhbHVlcyh0aGlzLl9zdWJzY3JpcHRpb25IYW5kbGVzKS5ldmVyeSgoaGFuZGxlKSA9PiB7XG4gICAgcmV0dXJuIGhhbmRsZS5yZWFkeSgpO1xuICB9KTtcblxuICByZXR1cm4gdGhpcy5fYWxsU3Vic1JlYWR5O1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBTcGVjaWZ5IHRlbXBsYXRlIGhlbHBlcnMgYXZhaWxhYmxlIHRvIHRoaXMgdGVtcGxhdGUuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge09iamVjdH0gaGVscGVycyBEaWN0aW9uYXJ5IG9mIGhlbHBlciBmdW5jdGlvbnMgYnkgbmFtZS5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSB0ZW1wbGF0aW5nXG4gKi9cblRlbXBsYXRlLnByb3RvdHlwZS5oZWxwZXJzID0gZnVuY3Rpb24gKGRpY3QpIHtcbiAgaWYgKCFpc09iamVjdChkaWN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkhlbHBlcnMgZGljdGlvbmFyeSBoYXMgdG8gYmUgYW4gb2JqZWN0XCIpO1xuICB9XG5cbiAgZm9yIChsZXQgayBpbiBkaWN0KSB0aGlzLl9faGVscGVycy5zZXQoaywgZGljdFtrXSk7XG59O1xuXG5jb25zdCBjYW5Vc2VHZXR0ZXJzID0gKGZ1bmN0aW9uICgpIHtcbiAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgIGxldCBvYmogPSB7fTtcbiAgICB0cnkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgXCJzZWxmXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBvYmo7IH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iai5zZWxmID09PSBvYmo7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSkoKTtcblxuaWYgKGNhblVzZUdldHRlcnMpIHtcbiAgLy8gTGlrZSBCbGF6ZS5jdXJyZW50VmlldyBidXQgZm9yIHRoZSB0ZW1wbGF0ZSBpbnN0YW5jZS4gQSBmdW5jdGlvblxuICAvLyByYXRoZXIgdGhhbiBhIHZhbHVlIHNvIHRoYXQgbm90IGFsbCBoZWxwZXJzIGFyZSBpbXBsaWNpdGx5IGRlcGVuZGVudFxuICAvLyBvbiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBpbnN0YW5jZSdzIGBkYXRhYCBwcm9wZXJ0eSwgd2hpY2ggd291bGQgbWFrZVxuICAvLyB0aGVtIGRlcGVuZGVudCBvbiB0aGUgZGF0YSBjb250ZXh0IG9mIHRoZSB0ZW1wbGF0ZSBpbmNsdXNpb24uXG4gIGxldCBjdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmMgPSBudWxsO1xuXG4gIC8vIElmIGdldHRlcnMgYXJlIHN1cHBvcnRlZCwgZGVmaW5lIHRoaXMgcHJvcGVydHkgd2l0aCBhIGdldHRlciBmdW5jdGlvblxuICAvLyB0byBtYWtlIGl0IGVmZmVjdGl2ZWx5IHJlYWQtb25seSwgYW5kIHRvIHdvcmsgYXJvdW5kIHRoaXMgYml6YXJyZSBKU0NcbiAgLy8gYnVnOiBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9pc3N1ZXMvOTkyNlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGVtcGxhdGUsIFwiX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuY1wiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gY3VycmVudFRlbXBsYXRlSW5zdGFuY2VGdW5jO1xuICAgIH1cbiAgfSk7XG5cbiAgVGVtcGxhdGUuX3dpdGhUZW1wbGF0ZUluc3RhbmNlRnVuYyA9IGZ1bmN0aW9uICh0ZW1wbGF0ZUluc3RhbmNlRnVuYywgZnVuYykge1xuICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgZnVuY3Rpb24sIGdvdDogXCIgKyBmdW5jKTtcbiAgICB9XG4gICAgY29uc3Qgb2xkVG1wbEluc3RhbmNlRnVuYyA9IGN1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYztcbiAgICB0cnkge1xuICAgICAgY3VycmVudFRlbXBsYXRlSW5zdGFuY2VGdW5jID0gdGVtcGxhdGVJbnN0YW5jZUZ1bmM7XG4gICAgICByZXR1cm4gZnVuYygpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmMgPSBvbGRUbXBsSW5zdGFuY2VGdW5jO1xuICAgIH1cbiAgfTtcbn0gZWxzZSB7XG4gIC8vIElmIGdldHRlcnMgYXJlIG5vdCBzdXBwb3J0ZWQsIGp1c3QgdXNlIGEgbm9ybWFsIHByb3BlcnR5LlxuICBUZW1wbGF0ZS5fY3VycmVudFRlbXBsYXRlSW5zdGFuY2VGdW5jID0gbnVsbDtcblxuICBUZW1wbGF0ZS5fd2l0aFRlbXBsYXRlSW5zdGFuY2VGdW5jID0gZnVuY3Rpb24gKHRlbXBsYXRlSW5zdGFuY2VGdW5jLCBmdW5jKSB7XG4gICAgaWYgKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBmdW5jdGlvbiwgZ290OiBcIiArIGZ1bmMpO1xuICAgIH1cbiAgICBjb25zdCBvbGRUbXBsSW5zdGFuY2VGdW5jID0gVGVtcGxhdGUuX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYztcbiAgICB0cnkge1xuICAgICAgVGVtcGxhdGUuX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYyA9IHRlbXBsYXRlSW5zdGFuY2VGdW5jO1xuICAgICAgcmV0dXJuIGZ1bmMoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgVGVtcGxhdGUuX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYyA9IG9sZFRtcGxJbnN0YW5jZUZ1bmM7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIEBzdW1tYXJ5IFNwZWNpZnkgZXZlbnQgaGFuZGxlcnMgZm9yIHRoaXMgdGVtcGxhdGUuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge0V2ZW50TWFwfSBldmVudE1hcCBFdmVudCBoYW5kbGVycyB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIHRlbXBsYXRlLlxuICogQGltcG9ydEZyb21QYWNrYWdlIHRlbXBsYXRpbmdcbiAqL1xuVGVtcGxhdGUucHJvdG90eXBlLmV2ZW50cyA9IGZ1bmN0aW9uIChldmVudE1hcCkge1xuICBpZiAoIWlzT2JqZWN0KGV2ZW50TWFwKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IG1hcCBoYXMgdG8gYmUgYW4gb2JqZWN0XCIpO1xuICB9XG5cbiAgY29uc3QgdGVtcGxhdGUgPSB0aGlzO1xuICBsZXQgZXZlbnRNYXAyID0ge307XG4gIGZvciAobGV0IGsgaW4gZXZlbnRNYXApIHtcbiAgICBldmVudE1hcDJba10gPSAoZnVuY3Rpb24gKGssIHYpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQgLyosIC4uLiovKSB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzOyAvLyBwYXNzZWQgYnkgRXZlbnRBdWdtZW50ZXJcbiAgICAgICAgY29uc3QgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIC8vIEV4aXRpbmcgdGhlIGN1cnJlbnQgY29tcHV0YXRpb24gdG8gYXZvaWQgY3JlYXRpbmcgdW5uZWNlc3NhcnlcbiAgICAgICAgLy8gYW5kIHVuZXhwZWN0ZWQgcmVhY3RpdmUgZGVwZW5kZW5jaWVzIHdpdGggVGVtcGxhdGVzIGRhdGFcbiAgICAgICAgLy8gb3IgYW55IG90aGVyIHJlYWN0aXZlIGRlcGVuZGVuY2llcyBkZWZpbmVkIGluIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgIHJldHVybiBUcmFja2VyLm5vbnJlYWN0aXZlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBsZXQgZGF0YSA9IEJsYXplLmdldERhdGEoZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkgZGF0YSA9IHt9O1xuICAgICAgICAgIGNvbnN0IHRtcGxJbnN0YW5jZUZ1bmMgPSBCbGF6ZS5fYmluZCh2aWV3LnRlbXBsYXRlSW5zdGFuY2UsIHZpZXcpO1xuICAgICAgICAgIGFyZ3Muc3BsaWNlKDEsIDAsIHRtcGxJbnN0YW5jZUZ1bmMoKSk7XG4gICAgICAgICAgcmV0dXJuIFRlbXBsYXRlLl93aXRoVGVtcGxhdGVJbnN0YW5jZUZ1bmModG1wbEluc3RhbmNlRnVuYywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHYuYXBwbHkoZGF0YSwgYXJncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KShrLCBldmVudE1hcFtrXSk7XG4gIH1cblxuICB0ZW1wbGF0ZS5fX2V2ZW50TWFwcy5wdXNoKGV2ZW50TWFwMik7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgaW5zdGFuY2VcbiAqIEBtZW1iZXJPZiBUZW1wbGF0ZVxuICogQHN1bW1hcnkgVGhlIFt0ZW1wbGF0ZSBpbnN0YW5jZV0oI1RlbXBsYXRlLWluc3RhbmNlcykgY29ycmVzcG9uZGluZyB0byB0aGUgY3VycmVudCB0ZW1wbGF0ZSBoZWxwZXIsIGV2ZW50IGhhbmRsZXIsIGNhbGxiYWNrLCBvciBhdXRvcnVuLiAgSWYgdGhlcmUgaXNuJ3Qgb25lLCBgbnVsbGAuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcmV0dXJucyB7QmxhemUuVGVtcGxhdGVJbnN0YW5jZX1cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSB0ZW1wbGF0aW5nXG4gKi9cblRlbXBsYXRlLmluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gVGVtcGxhdGUuX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuY1xuICAgICYmIFRlbXBsYXRlLl9jdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmMoKTtcbn07XG5cbi8vIE5vdGU6IFRlbXBsYXRlLmN1cnJlbnREYXRhKCkgaXMgZG9jdW1lbnRlZCB0byB0YWtlIHplcm8gYXJndW1lbnRzLFxuLy8gd2hpbGUgQmxhemUuZ2V0RGF0YSB0YWtlcyB1cCB0byBvbmUuXG5cbi8qKlxuICogQHN1bW1hcnlcbiAqXG4gKiAtIEluc2lkZSBhbiBgb25DcmVhdGVkYCwgYG9uUmVuZGVyZWRgLCBvciBgb25EZXN0cm95ZWRgIGNhbGxiYWNrLCByZXR1cm5zXG4gKiB0aGUgZGF0YSBjb250ZXh0IG9mIHRoZSB0ZW1wbGF0ZS5cbiAqIC0gSW5zaWRlIGFuIGV2ZW50IGhhbmRsZXIsIHJldHVybnMgdGhlIGRhdGEgY29udGV4dCBvZiB0aGUgdGVtcGxhdGUgb24gd2hpY2hcbiAqIHRoaXMgZXZlbnQgaGFuZGxlciB3YXMgZGVmaW5lZC5cbiAqIC0gSW5zaWRlIGEgaGVscGVyLCByZXR1cm5zIHRoZSBkYXRhIGNvbnRleHQgb2YgdGhlIERPTSBub2RlIHdoZXJlIHRoZSBoZWxwZXJcbiAqIHdhcyB1c2VkLlxuICpcbiAqIEVzdGFibGlzaGVzIGEgcmVhY3RpdmUgZGVwZW5kZW5jeSBvbiB0aGUgcmVzdWx0LlxuICogQGxvY3VzIENsaWVudFxuICogQGZ1bmN0aW9uXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5jdXJyZW50RGF0YSA9IEJsYXplLmdldERhdGE7XG5cbi8qKlxuICogQHN1bW1hcnkgQWNjZXNzZXMgb3RoZXIgZGF0YSBjb250ZXh0cyB0aGF0IGVuY2xvc2UgdGhlIGN1cnJlbnQgZGF0YSBjb250ZXh0LlxuICogQGxvY3VzIENsaWVudFxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0ludGVnZXJ9IFtudW1MZXZlbHNdIFRoZSBudW1iZXIgb2YgbGV2ZWxzIGJleW9uZCB0aGUgY3VycmVudCBkYXRhIGNvbnRleHQgdG8gbG9vay4gRGVmYXVsdHMgdG8gMS5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSB0ZW1wbGF0aW5nXG4gKi9cblRlbXBsYXRlLnBhcmVudERhdGEgPSBCbGF6ZS5fcGFyZW50RGF0YTtcblxuLyoqXG4gKiBAc3VtbWFyeSBEZWZpbmVzIGEgW2hlbHBlciBmdW5jdGlvbl0oI1RlbXBsYXRlLWhlbHBlcnMpIHdoaWNoIGNhbiBiZSB1c2VkIGZyb20gYWxsIHRlbXBsYXRlcy5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGhlbHBlciBmdW5jdGlvbiB5b3UgYXJlIGRlZmluaW5nLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY3Rpb24gVGhlIGhlbHBlciBmdW5jdGlvbiBpdHNlbGYuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5yZWdpc3RlckhlbHBlciA9IEJsYXplLnJlZ2lzdGVySGVscGVyO1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJlbW92ZXMgYSBnbG9iYWwgW2hlbHBlciBmdW5jdGlvbl0oI1RlbXBsYXRlLWhlbHBlcnMpLlxuICogQGxvY3VzIENsaWVudFxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgaGVscGVyIGZ1bmN0aW9uIHlvdSBhcmUgZGVmaW5pbmcuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5kZXJlZ2lzdGVySGVscGVyID0gQmxhemUuZGVyZWdpc3RlckhlbHBlcjtcbiIsIlVJID0gQmxhemU7XG5cbkJsYXplLlJlYWN0aXZlVmFyID0gUmVhY3RpdmVWYXI7XG5VSS5fdGVtcGxhdGVJbnN0YW5jZSA9IEJsYXplLlRlbXBsYXRlLmluc3RhbmNlO1xuXG5IYW5kbGViYXJzID0ge307XG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gQmxhemUucmVnaXN0ZXJIZWxwZXI7XG5cbkhhbmRsZWJhcnMuX2VzY2FwZSA9IEJsYXplLl9lc2NhcGU7XG5cbi8vIFJldHVybiB0aGVzZSBmcm9tIHt7Li4ufX0gaGVscGVycyB0byBhY2hpZXZlIHRoZSBzYW1lIGFzIHJldHVybmluZ1xuLy8gc3RyaW5ncyBmcm9tIHt7ey4uLn19fSBoZWxwZXJzXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG4iXX0=
