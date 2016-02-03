(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root['M'] = factory();
  }

}(this, function () {

var Listener, MediaDef, MElementMixin, utils_StringUtil, AttrDef, Motherboardjs;
Listener = function () {
  function Listener(target, type, handler) {
    this.target = target;
    this.type = type;
    this.handler = handler;
    this.isEnabled = false;
  }
  Listener.prototype.enable = function () {
    if (this.isEnabled === true) {
      return;
    }
    if (this.target instanceof EventTarget) {
      this.target.addEventListener(this.type, this.handler);
    } else if (this.target instanceof Array) {
      var i = this.target.length;
      while (--i > -1) {
        this.target[i].addEventListener(this.type, this.handler);
      }
    }
    this.isEnabled = true;
  };
  Listener.prototype.disable = function () {
    if (this.target instanceof EventTarget) {
      this.target.removeEventListener(this.type, this.handler);
    } else if (this.target instanceof Array) {
      var i = this.target.length;
      while (--i > -1) {
        this.target[i].removeEventListener(this.type, this.handler);
      }
    }
    this.isEnabled = false;
  };
  return Listener;
}();
MediaDef = function () {
  function MediaDef(params) {
    this.attrDef = null;
    this.element = null;
    this.mqls = [];
    this.listener = Function.prototype;
    // noop
    this.set(params);
  }
  MediaDef.prototype.set = function (params) {
    var prop;
    for (prop in params) {
      if (params.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
        this[prop] = params[prop];
      }
    }
  };
  MediaDef.prototype.update = function () {
    this.mqls.forEach(function (mql) {
      mql.removeListener(this.listener);
    }, this);
    this.mqls = [];
    if (document.contains(this.element) === false) {
      return;
    }
    var prop = this.attrDef.getPropertyName();
    var parsed = this.attrDef.parseResponsiveAttribute(this.element[prop]);
    var oldVal = parsed.unmatched;
    this.listener = function () {
      var newVal = this.element[this.attrDef.getEvaluatedPropertyName()];
      if (newVal !== oldVal) {
        this.attrDef.mediaChangedCallback.call(this.element, oldVal, newVal);
        oldVal = newVal;
      }
    }.bind(this);
    this.mqls = parsed.breakpoints.map(function (breakpoint) {
      var mql = window.matchMedia(breakpoint.mediaQuery);
      if (mql.matches) {
        oldVal = breakpoint.value;
      }
      mql.addListener(this.listener);
      return mql;
    }, this);
  };
  return MediaDef;
}();
MElementMixin = function (Listener, MediaDef) {
  var MElementMixin = {
    customAttributes: [],
    createdCallback: function () {
      this.listeners = [];
      this.mediaDefs = this.customAttributes.filter(function (x) {
        return x.responsive === true;
      }).map(function (attrDef) {
        return new MediaDef({
          element: this,
          attrDef: attrDef
        });
      }, this);
    },
    attachedCallback: function () {
      this.mediaDefs.forEach(function (mediaDef) {
        mediaDef.update();
      });
    },
    detachedCallback: function () {
      this.mediaDefs.forEach(function (mediaDef) {
        mediaDef.update();
      });
    },
    attributeChangedCallback: function (attrName, oldVal, newVal) {
      var attrDef = this.customAttributes.find(function (x) {
        return x.name === attrName;
      });
      if (attrDef === undefined) {
        return;
      }
      attrDef.changedCallback.call(this, oldVal, newVal);
      var mediaDef = this.mediaDefs.find(function (x) {
        return x.attrDef === attrDef;
      });
      if (mediaDef === undefined || document.contains(this) === false) {
        return;
      }
      mediaDef.update();
      var oldProp = oldVal === null ? '' + attrDef.default : oldVal;
      var oldEvaluatedProp = attrDef.evaluateResponsiveAttribute(oldProp);
      var newEvaluatedProp = this[attrDef.getEvaluatedPropertyName()];
      if (oldEvaluatedProp !== newEvaluatedProp) {
        attrDef.mediaChangedCallback.call(this, oldEvaluatedProp, newEvaluatedProp);
      }
    },
    // TODO: Maybe refactor element queries to use getElementsByTagName? http://jsperf.com/exhaustive-selector-performance-test
    getComponent: function (T, tag) {
      var selector = T.prototype.selector;
      if (tag !== undefined) {
        selector += '[data-tag="' + tag + '"]';
      }
      return this.querySelector(selector);
    },
    getComponents: function (T, tag) {
      var selector = T.prototype.selector;
      if (tag !== undefined) {
        selector += '[data-tag="' + tag + '"]';
      }
      return _nodeListToArray(this.querySelectorAll(selector));
    },
    findWithTag: function (tag) {
      return this.querySelector('[data-tag="' + tag + '"]');
    },
    findAllWithTag: function (tag) {
      return _nodeListToArray(this.querySelectorAll('[data-tag="' + tag + '"]'));
    },
    listen: function (target, type, handler) {
      var listener = new Listener(target, type, handler.bind(this));
      this.listeners.push(listener);
      return listener;
    },
    enable: function () {
      var i;
      var l = this.listeners.length;
      for (i = 0; i < l; i++) {
        this.listeners[i].enable();
      }
    },
    disable: function () {
      var i;
      var l = this.listeners.length;
      for (i = 0; i < l; i++) {
        this.listeners[i].disable();
      }
    },
    trigger: function (type, detail) {
      var e = new CustomEvent(type, {
        detail: detail,
        bubbles: true
      });
      return this.dispatchEvent(e);
    }
  };
  var _nodeListToArray = function (nodeList) {
    var l = nodeList.length;
    var arr = new Array(l);
    // Setting the length first speeds up the conversion
    for (var i = 0; i < l; i++) {
      arr[i] = nodeList[i];
    }
    return arr;
  };
  return MElementMixin;
}(Listener, MediaDef);
utils_StringUtil = function () {
  var StringUtil = {};
  StringUtil.toCamelCase = function (str) {
    return str.replace(/(\-[a-z])/g, function ($1) {
      return $1.toUpperCase().replace('-', '');
    });
  };
  StringUtil.capitalize = function (str) {
    return str.replace(/./, function ($1) {
      return $1.toUpperCase();
    });
  };
  return StringUtil;
}();
AttrDef = function (StringUtil) {
  function AttrDef(name, params) {
    this.name = name;
    this.type = null;
    this.default = null;
    this.responsive = false;
    this.mediaChangedCallback = Function.prototype;
    // noop
    this.changedCallback = Function.prototype;
    // noop
    this.set(params);
  }
  AttrDef.prototype.set = function (params) {
    var prop;
    for (prop in params) {
      if (params.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
        this[prop] = params[prop];
      }
    }
  };
  AttrDef.prototype.getPropertyName = function () {
    return StringUtil.toCamelCase(this.name);  // 'attr-name' => 'attrName'
  };
  AttrDef.prototype.getEvaluatedPropertyName = function () {
    return 'current' + StringUtil.capitalize(this.getPropertyName());  // 'attr-name' => 'currentAttrName'
  };
  AttrDef.prototype.parseResponsiveAttribute = function (value) {
    if (value === null) {
      return {
        unmatched: null,
        breakpoints: []
      };
    }
    var definitions = value.split(',').map(function (x) {
      return x.trim();
    });
    var unmatched = definitions.pop();
    if (this.type === Number) {
      unmatched = +unmatched;
    }
    return {
      unmatched: unmatched,
      breakpoints: definitions.map(function (definition) {
        var parts = definition.split(/\s(?=[^\s]*$)/);
        // Find last occurence of whitespace and split at it
        var mediaQuery = parts[0];
        var value = parts[1];
        if (this.type === Number) {
          value = +value;
        }
        return {
          mediaQuery: mediaQuery,
          value: value
        };
      }, this)
    };
  };
  AttrDef.prototype.evaluateResponsiveAttribute = function (value) {
    var parsed = this.parseResponsiveAttribute(value);
    return parsed.breakpoints.reduce(function (previous, breakpoint) {
      if (window.matchMedia(breakpoint.mediaQuery).matches) {
        return breakpoint.value;
      }
      return previous;
    }, parsed.unmatched);
  };
  AttrDef.prototype.addToPrototype = function (prototype) {
    var attrDef = this;
    var prop = this.getPropertyName();
    Object.defineProperty(prototype, prop, {
      get: function () {
        var attrValue = this.getAttribute(attrDef.name);
        switch (attrDef.type) {
        case Number:
          // If the attribute is responsive, fallthrough to the String case
          if (attrDef.responsive !== true) {
            if (attrValue === null || attrValue.trim() === '' || isNaN(+attrValue)) {
              if (attrDef.default === null) {
                return null;
              }
              attrValue = attrDef.default;
            }
            return +attrValue;  // `+` quickly casts to a number
          }
        case String:
          if (attrValue === null) {
            if (attrDef.default === null) {
              return null;
            }
            attrValue = attrDef.default + '';
          }
          return attrValue;
        case Boolean:
          return attrValue !== null;
        }
      },
      set: function (value) {
        switch (attrDef.type) {
        case Number:
          // If the attribute is responsive, fallthrough to the String case
          if (attrDef.responsive !== true) {
            if (isNaN(+value)) {
              break;
            }
            this.setAttribute(attrDef.name, value);
            break;
          }
        case String:
          this.setAttribute(attrDef.name, value);
          break;
        case Boolean:
          if (!!value) {
            // `!!` quickly casts to a boolean
            this.setAttribute(attrDef.name, '');
          } else {
            this.removeAttribute(attrDef.name);
          }
          break;
        }
      }
    });
    if (attrDef.responsive === true) {
      Object.defineProperty(prototype, this.getEvaluatedPropertyName(), {
        get: function () {
          return attrDef.evaluateResponsiveAttribute(this[prop]);
        }
      });
    }
  };
  return AttrDef;
}(utils_StringUtil);
Motherboardjs = function (MElementMixin, AttrDef) {
  function M() {
  }
  M.attribute = function (name, params) {
    return new AttrDef(name, params);
  };
  M.element = function (customTagName, definition) {
    var constructor = HTMLElement;
    var base = Object.assign(Object.create(constructor.prototype), MElementMixin);
    var prototype = Object.create(base);
    Object.defineProperty(prototype, 'selector', { value: customTagName });
    definition(prototype, base);
    return _register(customTagName, { prototype: prototype });
  };
  M.extend = function () {
    if (typeof arguments[0] === 'string') {
      return _extendNative.apply(this, arguments);
    }
    return _extendCustom.apply(this, arguments);
  };
  var _extendNative = function (tagName, customTagName, definition) {
    var constructor = document.createElement(tagName).constructor;
    var base = Object.assign(Object.create(constructor.prototype), MElementMixin);
    var prototype = Object.create(base);
    Object.defineProperty(prototype, 'selector', { value: tagName + '[is="' + customTagName + '"]' });
    definition(prototype, base);
    return _register(customTagName, {
      prototype: prototype,
      extends: tagName
    });
  };
  var _extendCustom = function (T, customTagName, definition) {
    var options = {};
    var selector;
    var selectorParts = T.prototype.selector.split('[');
    var extendsNative = selectorParts.length > 1;
    if (extendsNative) {
      options.extends = selectorParts[0];
      selector = options.extends + '[is="' + customTagName + '"]';
    } else {
      selector = customTagName;
    }
    var base = T.prototype;
    var prototype = Object.create(base);
    Object.defineProperty(prototype, 'selector', { value: selector });
    definition(prototype, base);
    options.prototype = prototype;
    return _register(customTagName, options);
  };
  var _register = function (customTagName, options) {
    // Register custom attributes
    var prototype = options.prototype;
    prototype.customAttributes.forEach(function (attrDef) {
      attrDef.addToPrototype(prototype);
    });
    // Register the custom element
    return document.registerElement(customTagName, options);
  };
  M.setTag = function (element, tag) {
    element.dataset.tag = tag;
  };
  M.getTag = function (element) {
    return element.dataset.tag;
  };
  return M;
}(MElementMixin, AttrDef);    return Motherboardjs;
}));
