/*
 * IE8 Polyfils for iframeResizer.js
 *
 * Public domain code - Mozilla Contributors
 * https://developer.mozilla.org/
 */

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fun /*, thisArg */) {
    'use strict';
    if (this === void 0 || this === null || typeof fun !== 'function')
      throw new TypeError();

    var t = Object(this),
      len = t.length >>> 0,
      thisArg = arguments.length >= 2 ? arguments[1] : void 0;

    for (var i = 0; i < len; i++) if (i in t) fun.call(thisArg, t[i], i, t);
  };
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError(
        'Function.prototype.bind - what is trying to be bound is not callable'
      );
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function() {},
      fBound = function() {
        return fToBind.apply(
          this instanceof fNOP ? this : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments))
        );
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

/*
 * File: iframeResizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe
 *       to force the iframe to resize to the content size.
 * Requires: iframeResizer.js on host page.
 * Doc: https://github.com/davidjbradshaw/iframe-resizer
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 * Contributor: Ian Caunce - ian@hallnet.co.uk
 */

(function(undefined) {
  'use strict';

  if (typeof window === 'undefined') return; // don't run for server side render

  var autoResize = true,
    base = 10,
    bodyBackground = '',
    bodyMargin = 0,
    bodyMarginStr = '',
    bodyObserver = null,
    bodyPadding = '',
    calculateWidth = false,
    doubleEventList = { resize: 1, click: 1 },
    eventCancelTimer = 128,
    firstRun = true,
    height = 1,
    heightCalcModeDefault = 'bodyOffset',
    heightCalcMode = heightCalcModeDefault,
    initLock = true,
    initMsg = '',
    inPageLinks = {},
    interval = 32,
    intervalTimer = null,
    logging = false,
    msgID = '[iFrameSizer]', //Must match host page msg ID
    msgIdLen = msgID.length,
    myID = '',
    observer = null,
    resetRequiredMethods = {
      max: 1,
      min: 1,
      bodyScroll: 1,
      documentElementScroll: 1
    },
    resizeFrom = 'child',
    sendPermit = true,
    target = window.parent,
    targetOriginDefault = '*',
    tolerance = 0,
    triggerLocked = false,
    triggerLockedTimer = null,
    throttledTimer = 16,
    width = 1,
    widthCalcModeDefault = 'scroll',
    widthCalcMode = widthCalcModeDefault,
    win = window,
    messageCallback = function() {
      warn('MessageCallback function not defined');
    },
    readyCallback = function() {},
    pageInfoCallback = function() {},
    customCalcMethods = {
      height: function() {
        warn('Custom height calculation function not defined');
        return document.documentElement.offsetHeight;
      },
      width: function() {
        warn('Custom width calculation function not defined');
        return document.body.scrollWidth;
      }
    },
    eventHandlersByName = {},
    passiveSupported = false,
    onceSupported = false;

  function noop() {}

  try {
    var options = Object.create(
      {},
      {
        passive: {
          get: function() {
            passiveSupported = true;
          }
        },
        once: {
          get: function() {
            onceSupported = true;
          }
        }
      }
    );
    window.addEventListener('test', noop, options);
    window.removeEventListener('test', noop, options);
  } catch (e) {
    /* */
  }

  function addEventListener(el, evt, func, options) {
    /* istanbul ignore else */ // Not testable in phantomJS
    if ('addEventListener' in window) {
      el.addEventListener(evt, func, passiveSupported ? options || {} : false);
    } else if ('attachEvent' in window) {
      //IE
      el.attachEvent('on' + evt, func);
    }
  }

  function removeEventListener(el, evt, func) {
    /* istanbul ignore else */ // Not testable in phantomJS
    if ('removeEventListener' in window) {
      el.removeEventListener(evt, func, false);
    } else if ('detachEvent' in window) {
      //IE
      el.detachEvent('on' + evt, func);
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  //Based on underscore.js
  function throttle(func) {
    var context,
      args,
      result,
      timeout = null,
      previous = 0,
      later = function() {
        previous = getNow();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      };

    return function() {
      var now = getNow();

      if (!previous) {
        previous = now;
      }

      var remaining = throttledTimer - (now - previous);

      context = this;
      args = arguments;

      if (remaining <= 0 || remaining > throttledTimer) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }

        previous = now;
        result = func.apply(context, args);

        if (!timeout) {
          context = args = null;
        }
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }

      return result;
    };
  }

  var getNow =
    Date.now ||
    function() {
      /* istanbul ignore next */ // Not testable in PhantonJS
      return new Date().getTime();
    };

  function formatLogMsg(msg) {
    return msgID + '[' + myID + ']' + ' ' + msg;
  }

  function log(msg) {
    if (logging && 'object' === typeof window.console) {
      console.log(formatLogMsg(msg));
    }
  }

  function warn(msg) {
    if ('object' === typeof window.console) {
      console.warn(formatLogMsg(msg));
    }
  }

  function init() {
    readDataFromParent();
    log('Initialising iFrame (' + location.href + ')');
    readDataFromPage();
    setMargin();
    setBodyStyle('background', bodyBackground);
    setBodyStyle('padding', bodyPadding);
    injectClearFixIntoBodyElement();
    checkHeightMode();
    checkWidthMode();
    stopInfiniteResizingOfIFrame();
    setupPublicMethods();
    startEventListeners();
    inPageLinks = setupInPageLinks();
    sendSize('init', 'Init message from host page');
    readyCallback();
  }

  function readDataFromParent() {
    function strBool(str) {
      return 'true' === str ? true : false;
    }

    var data = initMsg.substr(msgIdLen).split(':');

    myID = data[0];
    bodyMargin = undefined !== data[1] ? Number(data[1]) : bodyMargin; //For V1 compatibility
    calculateWidth = undefined !== data[2] ? strBool(data[2]) : calculateWidth;
    logging = undefined !== data[3] ? strBool(data[3]) : logging;
    interval = undefined !== data[4] ? Number(data[4]) : interval;
    autoResize = undefined !== data[6] ? strBool(data[6]) : autoResize;
    bodyMarginStr = data[7];
    heightCalcMode = undefined !== data[8] ? data[8] : heightCalcMode;
    bodyBackground = data[9];
    bodyPadding = data[10];
    tolerance = undefined !== data[11] ? Number(data[11]) : tolerance;
    inPageLinks.enable = undefined !== data[12] ? strBool(data[12]) : false;
    resizeFrom = undefined !== data[13] ? data[13] : resizeFrom;
    widthCalcMode = undefined !== data[14] ? data[14] : widthCalcMode;
  }

  function readDataFromPage() {
    function readData() {
      var data = window.iFrameResizer;

      log('Reading data from page: ' + JSON.stringify(data));

      messageCallback =
        'messageCallback' in data ? data.messageCallback : messageCallback;
      readyCallback =
        'readyCallback' in data ? data.readyCallback : readyCallback;
      targetOriginDefault =
        'targetOrigin' in data ? data.targetOrigin : targetOriginDefault;
      heightCalcMode =
        'heightCalculationMethod' in data
          ? data.heightCalculationMethod
          : heightCalcMode;
      widthCalcMode =
        'widthCalculationMethod' in data
          ? data.widthCalculationMethod
          : widthCalcMode;
    }

    function setupCustomCalcMethods(calcMode, calcFunc) {
      if ('function' === typeof calcMode) {
        log('Setup custom ' + calcFunc + 'CalcMethod');
        customCalcMethods[calcFunc] = calcMode;
        calcMode = 'custom';
      }

      return calcMode;
    }

    if (
      'iFrameResizer' in window &&
      Object === window.iFrameResizer.constructor
    ) {
      readData();
      heightCalcMode = setupCustomCalcMethods(heightCalcMode, 'height');
      widthCalcMode = setupCustomCalcMethods(widthCalcMode, 'width');
    }

    log('TargetOrigin for parent set to: ' + targetOriginDefault);
  }

  function chkCSS(attr, value) {
    if (-1 !== value.indexOf('-')) {
      warn('Negative CSS value ignored for ' + attr);
      value = '';
    }
    return value;
  }

  function setBodyStyle(attr, value) {
    if (undefined !== value && '' !== value && 'null' !== value) {
      document.body.style[attr] = value;
      log('Body ' + attr + ' set to "' + value + '"');
    }
  }

  function setMargin() {
    //If called via V1 script, convert bodyMargin from int to str
    if (undefined === bodyMarginStr) {
      bodyMarginStr = bodyMargin + 'px';
    }

    setBodyStyle('margin', chkCSS('margin', bodyMarginStr));
  }

  function stopInfiniteResizingOfIFrame() {
    document.documentElement.style.height = '';
    document.body.style.height = '';
    log('HTML & body height set to "auto"');
  }

  function manageTriggerEvent(options) {
    var listener = {
      add: function(eventName) {
        function handleEvent() {
          sendSize(options.eventName, options.eventType);
        }

        eventHandlersByName[eventName] = handleEvent;

        addEventListener(window, eventName, handleEvent, { passive: true });
      },
      remove: function(eventName) {
        var handleEvent = eventHandlersByName[eventName];
        delete eventHandlersByName[eventName];

        removeEventListener(window, eventName, handleEvent);
      }
    };

    if (options.eventNames && Array.prototype.map) {
      options.eventName = options.eventNames[0];
      options.eventNames.map(listener[options.method]);
    } else {
      listener[options.method](options.eventName);
    }

    log(
      capitalizeFirstLetter(options.method) +
        ' event listener: ' +
        options.eventType
    );
  }

  function manageEventListeners(method) {
    manageTriggerEvent({
      method: method,
      eventType: 'Animation Start',
      eventNames: ['animationstart', 'webkitAnimationStart']
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Animation Iteration',
      eventNames: ['animationiteration', 'webkitAnimationIteration']
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Animation End',
      eventNames: ['animationend', 'webkitAnimationEnd']
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Input',
      eventName: 'input'
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Mouse Up',
      eventName: 'mouseup'
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Mouse Down',
      eventName: 'mousedown'
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Orientation Change',
      eventName: 'orientationchange'
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Print',
      eventName: ['afterprint', 'beforeprint']
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Ready State Change',
      eventName: 'readystatechange'
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Touch Start',
      eventName: 'touchstart'
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Touch End',
      eventName: 'touchend'
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Touch Cancel',
      eventName: 'touchcancel'
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Transition Start',
      eventNames: [
        'transitionstart',
        'webkitTransitionStart',
        'MSTransitionStart',
        'oTransitionStart',
        'otransitionstart'
      ]
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Transition Iteration',
      eventNames: [
        'transitioniteration',
        'webkitTransitionIteration',
        'MSTransitionIteration',
        'oTransitionIteration',
        'otransitioniteration'
      ]
    });
    manageTriggerEvent({
      method: method,
      eventType: 'Transition End',
      eventNames: [
        'transitionend',
        'webkitTransitionEnd',
        'MSTransitionEnd',
        'oTransitionEnd',
        'otransitionend'
      ]
    });
    if ('child' === resizeFrom) {
      manageTriggerEvent({
        method: method,
        eventType: 'IFrame Resized',
        eventName: 'resize'
      });
    }
  }

  function checkCalcMode(calcMode, calcModeDefault, modes, type) {
    if (calcModeDefault !== calcMode) {
      if (!(calcMode in modes)) {
        warn(
          calcMode + ' is not a valid option for ' + type + 'CalculationMethod.'
        );
        calcMode = calcModeDefault;
      }
      log(type + ' calculation method set to "' + calcMode + '"');
    }

    return calcMode;
  }

  function checkHeightMode() {
    heightCalcMode = checkCalcMode(
      heightCalcMode,
      heightCalcModeDefault,
      getHeight,
      'height'
    );
  }

  function checkWidthMode() {
    widthCalcMode = checkCalcMode(
      widthCalcMode,
      widthCalcModeDefault,
      getWidth,
      'width'
    );
  }

  function startEventListeners() {
    if (true === autoResize) {
      manageEventListeners('add');
      setupMutationObserver();
    } else {
      log('Auto Resize disabled');
    }
  }

  function stopMsgsToParent() {
    log('Disable outgoing messages');
    sendPermit = false;
  }

  function removeMsgListener() {
    log('Remove event listener: Message');
    removeEventListener(window, 'message', receiver);
  }

  function disconnectMutationObserver() {
    if (null !== bodyObserver) {
      /* istanbul ignore next */ // Not testable in PhantonJS
      bodyObserver.disconnect();
    }
  }

  function stopEventListeners() {
    manageEventListeners('remove');
    disconnectMutationObserver();
    clearInterval(intervalTimer);
  }

  function teardown() {
    stopMsgsToParent();
    removeMsgListener();
    if (true === autoResize) stopEventListeners();
  }

  function injectClearFixIntoBodyElement() {
    var clearFix = document.createElement('div');
    clearFix.style.clear = 'both';
    clearFix.style.display = 'block'; //Guard against this having been globally redefined in CSS.
    document.body.appendChild(clearFix);
  }

  function setupInPageLinks() {
    function getPagePosition() {
      return {
        x:
          window.pageXOffset !== undefined
            ? window.pageXOffset
            : document.documentElement.scrollLeft,
        y:
          window.pageYOffset !== undefined
            ? window.pageYOffset
            : document.documentElement.scrollTop
      };
    }

    function getElementPosition(el) {
      var elPosition = el.getBoundingClientRect(),
        pagePosition = getPagePosition();

      return {
        x: parseInt(elPosition.left, 10) + parseInt(pagePosition.x, 10),
        y: parseInt(elPosition.top, 10) + parseInt(pagePosition.y, 10)
      };
    }

    function findTarget(location) {
      function jumpToTarget(target) {
        var jumpPosition = getElementPosition(target);

        log(
          'Moving to in page link (#' +
            hash +
            ') at x: ' +
            jumpPosition.x +
            ' y: ' +
            jumpPosition.y
        );
        sendMsg(jumpPosition.y, jumpPosition.x, 'scrollToOffset'); // X&Y reversed at sendMsg uses height/width
      }

      var hash = location.split('#')[1] || location, //Remove # if present
        hashData = decodeURIComponent(hash),
        target =
          document.getElementById(hashData) ||
          document.getElementsByName(hashData)[0];

      if (undefined !== target) {
        jumpToTarget(target);
      } else {
        log(
          'In page link (#' +
            hash +
            ') not found in iFrame, so sending to parent'
        );
        sendMsg(0, 0, 'inPageLink', '#' + hash);
      }
    }

    function checkLocationHash() {
      if ('' !== location.hash && '#' !== location.hash) {
        findTarget(location.href);
      }
    }

    function bindAnchors() {
      function setupLink(el) {
        function linkClicked(e) {
          e.preventDefault();

          /*jshint validthis:true */
          findTarget(this.getAttribute('href'));
        }

        if ('#' !== el.getAttribute('href')) {
          addEventListener(el, 'click', linkClicked);
        }
      }

      Array.prototype.forEach.call(
        document.querySelectorAll('a[href^="#"]'),
        setupLink
      );
    }

    function bindLocationHash() {
      addEventListener(window, 'hashchange', checkLocationHash);
    }

    function initCheck() {
      //check if page loaded with location hash after init resize
      setTimeout(checkLocationHash, eventCancelTimer);
    }

    function enableInPageLinks() {
      /* istanbul ignore else */ // Not testable in phantonJS
      if (Array.prototype.forEach && document.querySelectorAll) {
        log('Setting up location.hash handlers');
        bindAnchors();
        bindLocationHash();
        initCheck();
      } else {
        warn(
          'In page linking not fully supported in this browser! (See README.md for IE8 workaround)'
        );
      }
    }

    if (inPageLinks.enable) {
      enableInPageLinks();
    } else {
      log('In page linking not enabled');
    }

    return {
      findTarget: findTarget
    };
  }

  function setupPublicMethods() {
    log('Enable public methods');

    win.parentIFrame = {
      autoResize: function autoResizeF(resize) {
        if (true === resize && false === autoResize) {
          autoResize = true;
          startEventListeners();
          //sendSize('autoResize','Auto Resize enabled');
        } else if (false === resize && true === autoResize) {
          autoResize = false;
          stopEventListeners();
        }

        return autoResize;
      },

      close: function closeF() {
        sendMsg(0, 0, 'close');
        teardown();
      },

      getId: function getIdF() {
        return myID;
      },

      getPageInfo: function getPageInfoF(callback) {
        if ('function' === typeof callback) {
          pageInfoCallback = callback;
          sendMsg(0, 0, 'pageInfo');
        } else {
          pageInfoCallback = function() {};
          sendMsg(0, 0, 'pageInfoStop');
        }
      },

      moveToAnchor: function moveToAnchorF(hash) {
        inPageLinks.findTarget(hash);
      },

      reset: function resetF() {
        resetIFrame('parentIFrame.reset');
      },

      scrollTo: function scrollToF(x, y) {
        sendMsg(y, x, 'scrollTo'); // X&Y reversed at sendMsg uses height/width
      },

      scrollToOffset: function scrollToF(x, y) {
        sendMsg(y, x, 'scrollToOffset'); // X&Y reversed at sendMsg uses height/width
      },

      sendMessage: function sendMessageF(msg, targetOrigin) {
        sendMsg(0, 0, 'message', JSON.stringify(msg), targetOrigin);
      },

      setHeightCalculationMethod: function setHeightCalculationMethodF(
        heightCalculationMethod
      ) {
        heightCalcMode = heightCalculationMethod;
        checkHeightMode();
      },

      setWidthCalculationMethod: function setWidthCalculationMethodF(
        widthCalculationMethod
      ) {
        widthCalcMode = widthCalculationMethod;
        checkWidthMode();
      },

      setTargetOrigin: function setTargetOriginF(targetOrigin) {
        log('Set targetOrigin: ' + targetOrigin);
        targetOriginDefault = targetOrigin;
      },

      size: function sizeF(customHeight, customWidth) {
        var valString =
          '' +
          (customHeight ? customHeight : '') +
          (customWidth ? ',' + customWidth : '');
        //lockTrigger();
        sendSize(
          'size',
          'parentIFrame.size(' + valString + ')',
          customHeight,
          customWidth
        );
      }
    };
  }

  function initInterval() {
    if (0 !== interval) {
      log('setInterval: ' + interval + 'ms');
      intervalTimer = setInterval(function() {
        sendSize('interval', 'setInterval: ' + interval);
      }, Math.abs(interval));
    }
  } //Not testable in PhantomJS

  /* istanbul ignore next */ function setupBodyMutationObserver() {
    function addImageLoadListners(mutation) {
      function addImageLoadListener(element) {
        if (false === element.complete) {
          log('Attach listeners to ' + element.src);
          element.addEventListener('load', imageLoaded, false);
          element.addEventListener('error', imageError, false);
          elements.push(element);
        }
      }

      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        addImageLoadListener(mutation.target);
      } else if (mutation.type === 'childList') {
        Array.prototype.forEach.call(
          mutation.target.querySelectorAll('img'),
          addImageLoadListener
        );
      }
    }

    function removeFromArray(element) {
      elements.splice(elements.indexOf(element), 1);
    }

    function removeImageLoadListener(element) {
      log('Remove listeners from ' + element.src);
      element.removeEventListener('load', imageLoaded, false);
      element.removeEventListener('error', imageError, false);
      removeFromArray(element);
    }

    function imageEventTriggered(event, type, typeDesc) {
      removeImageLoadListener(event.target);
      sendSize(type, typeDesc + ': ' + event.target.src, undefined, undefined);
    }

    function imageLoaded(event) {
      imageEventTriggered(event, 'imageLoad', 'Image loaded');
    }

    function imageError(event) {
      imageEventTriggered(event, 'imageLoadFailed', 'Image load failed');
    }

    function mutationObserved(mutations) {
      sendSize(
        'mutationObserver',
        'mutationObserver: ' + mutations[0].target + ' ' + mutations[0].type
      );

      //Deal with WebKit asyncing image loading when tags are injected into the page
      mutations.forEach(addImageLoadListners);
    }

    function createMutationObserver() {
      var target = document.querySelector('body'),
        config = {
          attributes: true,
          attributeOldValue: false,
          characterData: true,
          characterDataOldValue: false,
          childList: true,
          subtree: true
        };

      observer = new MutationObserver(mutationObserved);

      log('Create body MutationObserver');
      observer.observe(target, config);

      return observer;
    }

    var elements = [],
      MutationObserver =
        window.MutationObserver || window.WebKitMutationObserver,
      observer = createMutationObserver();

    return {
      disconnect: function() {
        if ('disconnect' in observer) {
          log('Disconnect body MutationObserver');
          observer.disconnect();
          elements.forEach(removeImageLoadListener);
        }
      }
    };
  }

  function setupMutationObserver() {
    var forceIntervalTimer = 0 > interval; // Not testable in PhantomJS

    /* istanbul ignore if */ if (
      window.MutationObserver ||
      window.WebKitMutationObserver
    ) {
      if (forceIntervalTimer) {
        initInterval();
      } else {
        bodyObserver = setupBodyMutationObserver();
      }
    } else {
      log('MutationObserver not supported in this browser!');
      initInterval();
    }
  }

  // document.documentElement.offsetHeight is not reliable, so
  // we have to jump through hoops to get a better value.
  function getComputedStyle(prop, el) {
    /* istanbul ignore next */ //Not testable in PhantomJS
    function convertUnitsToPxForIE8(value) {
      var PIXEL = /^\d+(px)?$/i;

      if (PIXEL.test(value)) {
        return parseInt(value, base);
      }

      var style = el.style.left,
        runtimeStyle = el.runtimeStyle.left;

      el.runtimeStyle.left = el.currentStyle.left;
      el.style.left = value || 0;
      value = el.style.pixelLeft;
      el.style.left = style;
      el.runtimeStyle.left = runtimeStyle;

      return value;
    }

    var retVal = 0;
    el = el || document.body; // Not testable in phantonJS

    /* istanbul ignore else */ if (
      'defaultView' in document &&
      'getComputedStyle' in document.defaultView
    ) {
      retVal = document.defaultView.getComputedStyle(el, null);
      retVal = null !== retVal ? retVal[prop] : 0;
    } else {
      //IE8
      retVal = convertUnitsToPxForIE8(el.currentStyle[prop]);
    }

    return parseInt(retVal, base);
  }

  function chkEventThottle(timer) {
    if (timer > throttledTimer / 2) {
      throttledTimer = 2 * timer;
      log('Event throttle increased to ' + throttledTimer + 'ms');
    }
  }

  //Idea from https://github.com/guardian/iframe-messenger
  function getMaxElement(side, elements) {
    var elementsLength = elements.length,
      elVal = 0,
      maxVal = 0,
      Side = capitalizeFirstLetter(side),
      timer = getNow();

    for (var i = 0; i < elementsLength; i++) {
      elVal =
        elements[i].getBoundingClientRect()[side] +
        getComputedStyle('margin' + Side, elements[i]);
      if (elVal > maxVal) {
        maxVal = elVal;
      }
    }

    timer = getNow() - timer;

    log('Parsed ' + elementsLength + ' HTML elements');
    log('Element position calculated in ' + timer + 'ms');

    chkEventThottle(timer);

    return maxVal;
  }

  function getAllMeasurements(dimention) {
    return [
      dimention.bodyOffset(),
      dimention.bodyScroll(),
      dimention.documentElementOffset(),
      dimention.documentElementScroll()
    ];
  }

  function getTaggedElements(side, tag) {
    function noTaggedElementsFound() {
      warn('No tagged elements (' + tag + ') found on page');
      return document.querySelectorAll('body *');
    }

    var elements = document.querySelectorAll('[' + tag + ']');

    if (0 === elements.length) noTaggedElementsFound();

    return getMaxElement(side, elements);
  }

  function getAllElements() {
    return document.querySelectorAll('body *');
  }

  var getHeight = {
      bodyOffset: function getBodyOffsetHeight() {
        return (
          document.body.offsetHeight +
          getComputedStyle('marginTop') +
          getComputedStyle('marginBottom')
        );
      },

      offset: function() {
        return getHeight.bodyOffset(); //Backwards compatability
      },

      bodyScroll: function getBodyScrollHeight() {
        return document.body.scrollHeight;
      },

      custom: function getCustomWidth() {
        return customCalcMethods.height();
      },

      documentElementOffset: function getDEOffsetHeight() {
        return document.documentElement.offsetHeight;
      },

      documentElementScroll: function getDEScrollHeight() {
        return document.documentElement.scrollHeight;
      },

      max: function getMaxHeight() {
        return Math.max.apply(null, getAllMeasurements(getHeight));
      },

      min: function getMinHeight() {
        return Math.min.apply(null, getAllMeasurements(getHeight));
      },

      grow: function growHeight() {
        return getHeight.max(); //Run max without the forced downsizing
      },

      lowestElement: function getBestHeight() {
        return Math.max(
          getHeight.bodyOffset() || getHeight.documentElementOffset(),
          getMaxElement('bottom', getAllElements())
        );
      },

      taggedElement: function getTaggedElementsHeight() {
        return getTaggedElements('bottom', 'data-iframe-height');
      }
    },
    getWidth = {
      bodyScroll: function getBodyScrollWidth() {
        return document.body.scrollWidth;
      },

      bodyOffset: function getBodyOffsetWidth() {
        return document.body.offsetWidth;
      },

      custom: function getCustomWidth() {
        return customCalcMethods.width();
      },

      documentElementScroll: function getDEScrollWidth() {
        return document.documentElement.scrollWidth;
      },

      documentElementOffset: function getDEOffsetWidth() {
        return document.documentElement.offsetWidth;
      },

      scroll: function getMaxWidth() {
        return Math.max(
          getWidth.bodyScroll(),
          getWidth.documentElementScroll()
        );
      },

      max: function getMaxWidth() {
        return Math.max.apply(null, getAllMeasurements(getWidth));
      },

      min: function getMinWidth() {
        return Math.min.apply(null, getAllMeasurements(getWidth));
      },

      rightMostElement: function rightMostElement() {
        return getMaxElement('right', getAllElements());
      },

      taggedElement: function getTaggedElementsWidth() {
        return getTaggedElements('right', 'data-iframe-width');
      }
    };

  function sizeIFrame(
    triggerEvent,
    triggerEventDesc,
    customHeight,
    customWidth
  ) {
    function resizeIFrame() {
      height = currentHeight;
      width = currentWidth;

      sendMsg(height, width, triggerEvent);
    }

    function isSizeChangeDetected() {
      function checkTolarance(a, b) {
        var retVal = Math.abs(a - b) <= tolerance;
        return !retVal;
      }

      currentHeight =
        undefined !== customHeight ? customHeight : getHeight[heightCalcMode]();
      currentWidth =
        undefined !== customWidth ? customWidth : getWidth[widthCalcMode]();

      return (
        checkTolarance(height, currentHeight) ||
        (calculateWidth && checkTolarance(width, currentWidth))
      );
    }

    function isForceResizableEvent() {
      return !(triggerEvent in { init: 1, interval: 1, size: 1 });
    }

    function isForceResizableCalcMode() {
      return (
        heightCalcMode in resetRequiredMethods ||
        (calculateWidth && widthCalcMode in resetRequiredMethods)
      );
    }

    function logIgnored() {
      log('No change in size detected');
    }

    function checkDownSizing() {
      if (isForceResizableEvent() && isForceResizableCalcMode()) {
        resetIFrame(triggerEventDesc);
      } else if (!(triggerEvent in { interval: 1 })) {
        logIgnored();
      }
    }

    var currentHeight, currentWidth;

    if (isSizeChangeDetected() || 'init' === triggerEvent) {
      lockTrigger();
      resizeIFrame();
    } else {
      checkDownSizing();
    }
  }

  var sizeIFrameThrottled = throttle(sizeIFrame);

  function sendSize(triggerEvent, triggerEventDesc, customHeight, customWidth) {
    function recordTrigger() {
      if (!(triggerEvent in { reset: 1, resetPage: 1, init: 1 })) {
        log('Trigger event: ' + triggerEventDesc);
      }
    }

    function isDoubleFiredEvent() {
      return triggerLocked && triggerEvent in doubleEventList;
    }

    if (!isDoubleFiredEvent()) {
      recordTrigger();
      if (triggerEvent === 'init') {
        sizeIFrame(triggerEvent, triggerEventDesc, customHeight, customWidth);
      } else {
        sizeIFrameThrottled(
          triggerEvent,
          triggerEventDesc,
          customHeight,
          customWidth
        );
      }
    } else {
      log('Trigger event cancelled: ' + triggerEvent);
    }
  }

  function lockTrigger() {
    if (!triggerLocked) {
      triggerLocked = true;
      log('Trigger event lock on');
    }
    clearTimeout(triggerLockedTimer);
    triggerLockedTimer = setTimeout(function() {
      triggerLocked = false;
      log('Trigger event lock off');
      log('--');
    }, eventCancelTimer);
  }

  function triggerReset(triggerEvent) {
    height = getHeight[heightCalcMode]();
    width = getWidth[widthCalcMode]();

    sendMsg(height, width, triggerEvent);
  }

  function resetIFrame(triggerEventDesc) {
    var hcm = heightCalcMode;
    heightCalcMode = heightCalcModeDefault;

    log('Reset trigger event: ' + triggerEventDesc);
    lockTrigger();
    triggerReset('reset');

    heightCalcMode = hcm;
  }

  function sendMsg(height, width, triggerEvent, msg, targetOrigin) {
    function setTargetOrigin() {
      if (undefined === targetOrigin) {
        targetOrigin = targetOriginDefault;
      } else {
        log('Message targetOrigin: ' + targetOrigin);
      }
    }

    function sendToParent() {
      var size = height + ':' + width,
        message =
          myID +
          ':' +
          size +
          ':' +
          triggerEvent +
          (undefined !== msg ? ':' + msg : '');

      log('Sending message to host page (' + message + ')');
      target.postMessage(msgID + message, targetOrigin);
    }

    if (true === sendPermit) {
      setTargetOrigin();
      sendToParent();
    }
  }

  function receiver(event) {
    var processRequestFromParent = {
      init: function initFromParent() {
        initMsg = event.data;
        target = event.source;

        init();
        firstRun = false;
        setTimeout(function() {
          initLock = false;
        }, eventCancelTimer);
      },

      reset: function resetFromParent() {
        if (!initLock) {
          log('Page size reset by host page');
          triggerReset('resetPage');
        } else {
          log('Page reset ignored by init');
        }
      },

      resize: function resizeFromParent() {
        sendSize('resizeParent', 'Parent window requested size check');
      },

      moveToAnchor: function moveToAnchorF() {
        inPageLinks.findTarget(getData());
      },
      inPageLink: function inPageLinkF() {
        this.moveToAnchor();
      }, //Backward compatability

      pageInfo: function pageInfoFromParent() {
        var msgBody = getData();
        log('PageInfoFromParent called from parent: ' + msgBody);
        pageInfoCallback(JSON.parse(msgBody));
        log(' --');
      },

      message: function messageFromParent() {
        var msgBody = getData();

        log('MessageCallback called from parent: ' + msgBody);
        messageCallback(JSON.parse(msgBody));
        log(' --');
      }
    };

    function isMessageForUs() {
      return msgID === ('' + event.data).substr(0, msgIdLen); //''+ Protects against non-string messages
    }

    function getMessageType() {
      return event.data.split(']')[1].split(':')[0];
    }

    function getData() {
      return event.data.substr(event.data.indexOf(':') + 1);
    }

    function isMiddleTier() {
      return (
        (!(typeof module !== 'undefined' && module.exports) &&
          'iFrameResize' in window) ||
        ('jQuery' in window && 'iFrameResize' in window.jQuery.prototype)
      );
    }

    function isInitMsg() {
      //Test if this message is from a child below us. This is an ugly test, however, updating
      //the message format would break backwards compatibity.
      return event.data.split(':')[2] in { true: 1, false: 1 };
    }

    function callFromParent() {
      var messageType = getMessageType();

      if (messageType in processRequestFromParent) {
        processRequestFromParent[messageType]();
      } else if (!isMiddleTier() && !isInitMsg()) {
        warn('Unexpected message (' + event.data + ')');
      }
    }

    function processMessage() {
      if (false === firstRun) {
        callFromParent();
      } else if (isInitMsg()) {
        processRequestFromParent.init();
      } else {
        log(
          'Ignored message of type "' +
            getMessageType() +
            '". Received before initialization.'
        );
      }
    }

    if (isMessageForUs()) {
      processMessage();
    }
  }

  //Normally the parent kicks things off when it detects the iFrame has loaded.
  //If this script is async-loaded, then tell parent page to retry init.
  function chkLateLoaded() {
    if ('loading' !== document.readyState) {
      window.parent.postMessage('[iFrameResizerChild]Ready', '*');
    }
  }

  addEventListener(window, 'message', receiver);
  addEventListener(window, 'readystatechange', chkLateLoaded);
  chkLateLoaded();

  
})();

var NO_JQUERY={};!function(e,t,n){if(!("console"in e)){var a=e.console={};a.log=a.warn=a.error=a.debug=function(){}}t===NO_JQUERY&&(t={fn:{},extend:function(){for(var e=arguments[0],t=1,n=arguments.length;t<n;t++){var a=arguments[t];for(var s in a)e[s]=a[s]}return e}}),t.fn.pm=function(){return console.log("usage: \nto send:    $.pm(options)\nto receive: $.pm.bind(type, fn, [origin])"),this},t.pm=e.pm=function(e){s.send(e)},t.pm.bind=e.pm.bind=function(e,t,n,a,r){s.bind(e,t,n,a,!0===r)},t.pm.unbind=e.pm.unbind=function(e,t){s.unbind(e,t)},t.pm.origin=e.pm.origin=null,t.pm.poll=e.pm.poll=200;var s={send:function(e){var n=t.extend({},s.defaults,e),a=n.target;if(!n.target)return void console.warn("postmessage target window required");if(!n.type)return void console.warn("postmessage type required");var r={data:n.data,type:n.type};n.success&&(r.callback=s._callback(n.success)),n.error&&(r.errback=s._callback(n.error)),"postMessage"in a&&!n.hash?(s._bind(),a.postMessage(JSON.stringify(r),n.origin||"*")):(s.hash._bind(),s.hash.send(n,r))},bind:function(e,t,n,a,r){s._replyBind(e,t,n,a,r)},_replyBind:function(n,a,r,i,o){"postMessage"in e&&!i?s._bind():s.hash._bind();var l=s.data("listeners.postmessage");l||(l={},s.data("listeners.postmessage",l));var c=l[n];c||(c=[],l[n]=c),c.push({fn:a,callback:o,origin:r||t.pm.origin})},unbind:function(e,t){var n=s.data("listeners.postmessage");if(n)if(e)if(t){var a=n[e];if(a){for(var r=[],i=0,o=a.length;i<o;i++){var l=a[i];l.fn!==t&&r.push(l)}n[e]=r}}else delete n[e];else for(var i in n)delete n[i]},data:function(e,t){return void 0===t?s._data[e]:(s._data[e]=t,t)},_data:{},_CHARS:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),_random:function(){for(var e=[],t=0;t<32;t++)e[t]=s._CHARS[0|32*Math.random()];return e.join("")},_callback:function(e){var t=s.data("callbacks.postmessage");t||(t={},s.data("callbacks.postmessage",t));var n=s._random();return t[n]=e,n},_bind:function(){s.data("listening.postmessage")||(e.addEventListener?e.addEventListener("message",s._dispatch,!1):e.attachEvent&&e.attachEvent("onmessage",s._dispatch),s.data("listening.postmessage",1))},_dispatch:function(e){function t(t){n.callback&&s.send({target:e.source,data:t,type:n.callback})}try{if (e.data.indexOf('iFrameResizer') == -1 && e.data.indexOf('iFrameSizer') == -1){var n=JSON.parse(e.data);}else{return;}}catch(e){return void console.warn("postmessage data invalid json: ",e)}if(!n.type)return void console.warn("postmessage message type required");var a=s.data("callbacks.postmessage")||{},r=a[n.type];if(r)r(n.data);else for(var i=s.data("listeners.postmessage")||{},o=i[n.type]||[],l=0,c=o.length;l<c;l++){var u=o[l];if(u.origin&&"*"!==u.origin&&e.origin!==u.origin){if(console.warn("postmessage message origin mismatch",e.origin,u.origin),n.errback){var p={message:"postmessage origin mismatch",origin:[e.origin,u.origin]};s.send({target:e.source,data:p,type:n.errback})}}else try{u.callback?u.fn(n.data,t,e):t(u.fn(n.data,e))}catch(t){if(!n.errback)throw t;s.send({target:e.source,data:t,type:n.errback})}}}};s.hash={send:function(t,n){var a=t.target,r=t.url;if(!r)return void console.warn("postmessage target window url is required");r=s.hash._url(r);var i,o=s.hash._url(e.location.href);if(e==a.parent)i="parent";else try{for(var l=0,c=parent.frames.length;l<c;l++){if(parent.frames[l]==e){i=l;break}}}catch(t){i=e.name}if(null==i)return void console.warn("postmessage windows must be direct parent/child windows and the child must be available through the parent window.frames list");var u={"x-requested-with":"postmessage",source:{name:i,url:o},postmessage:n},p="#x-postmessage-id="+s._random();a.location=r+p+encodeURIComponent(JSON.stringify(u))},_regex:/^\#x\-postmessage\-id\=(\w{32})/,_regex_len:"#x-postmessage-id=".length+32,_bind:function(){s.data("polling.postmessage")||(setInterval(function(){var t=""+e.location.hash,n=s.hash._regex.exec(t);if(n){var a=n[1];s.hash._last!==a&&(s.hash._last=a,s.hash._dispatch(t.substring(s.hash._regex_len)))}},t.pm.poll||200),s.data("polling.postmessage",1))},_dispatch:function(t){function n(e){a.callback&&s.send({target:o,data:e,type:a.callback,hash:!0,url:t.source.url})}if(t){try{if(t=JSON.parse(decodeURIComponent(t)),!("postmessage"===t["x-requested-with"]&&t.source&&null!=t.source.name&&t.source.url&&t.postmessage))return}catch(e){return}var a=t.postmessage,r=s.data("callbacks.postmessage")||{},i=r[a.type];if(i)i(a.data);else{var o;o="parent"===t.source.name?e.parent:e.frames[t.source.name];for(var l=s.data("listeners.postmessage")||{},c=l[a.type]||[],u=0,p=c.length;u<p;u++){var f=c[u];if(f.origin){var d=/https?\:\/\/[^\/]*/.exec(t.source.url)[0];if("*"!==f.origin&&d!==f.origin){if(console.warn("postmessage message origin mismatch",d,f.origin),a.errback){var g={message:"postmessage origin mismatch",origin:[d,f.origin]};s.send({target:o,data:g,type:a.errback,hash:!0,url:t.source.url})}continue}}try{f.callback?f.fn(a.data,n):n(f.fn(a.data))}catch(e){if(!a.errback)throw e;s.send({target:o,data:e,type:a.errback,hash:!0,url:t.source.url})}}}}},_url:function(e){return(""+e).replace(/#.*$/,"")}},t.extend(s,{defaults:{target:null,url:null,type:null,data:null,success:null,error:null,origin:"*",hash:!1}})}(window,"undefined"==typeof jQuery?NO_JQUERY:jQuery),"JSON"in window&&window.JSON||(JSON={}),function(){function f(e){return e<10?"0"+e:e}function quote(e){return escapable.lastIndex=0,escapable.test(e)?'"'+e.replace(escapable,function(e){var t=meta[e];return"string"==typeof t?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var n,a,s,r,i,o=gap,l=t[e];switch(l&&"object"==typeof l&&"function"==typeof l.toJSON&&(l=l.toJSON(e)),"function"==typeof rep&&(l=rep.call(t,e,l)),typeof l){case"string":return quote(l);case"number":return isFinite(l)?String(l):"null";case"boolean":case"null":return String(l);case"object":if(!l)return"null";if(gap+=indent,i=[],"[object Array]"===Object.prototype.toString.apply(l)){for(r=l.length,n=0;n<r;n+=1)i[n]=str(n,l)||"null";return s=0===i.length?"[]":gap?"[\n"+gap+i.join(",\n"+gap)+"\n"+o+"]":"["+i.join(",")+"]",gap=o,s}if(rep&&"object"==typeof rep)for(r=rep.length,n=0;n<r;n+=1)"string"==typeof(a=rep[n])&&(s=str(a,l))&&i.push(quote(a)+(gap?": ":":")+s);else for(a in l)Object.hasOwnProperty.call(l,a)&&(s=str(a,l))&&i.push(quote(a)+(gap?": ":":")+s);return s=0===i.length?"{}":gap?"{\n"+gap+i.join(",\n"+gap)+"\n"+o+"}":"{"+i.join(",")+"}",gap=o,s}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(e){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(e){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;"function"!=typeof JSON.stringify&&(JSON.stringify=function(e,t,n){var a;if(gap="",indent="","number"==typeof n)for(a=0;a<n;a+=1)indent+=" ";else"string"==typeof n&&(indent=n);if(rep=t,t&&"function"!=typeof t&&("object"!=typeof t||"number"!=typeof t.length))throw new Error("JSON.stringify");return str("",{"":e})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(e,t){var n,a,s=e[t];if(s&&"object"==typeof s)for(n in s)Object.hasOwnProperty.call(s,n)&&(a=walk(s,n),void 0!==a?s[n]=a:delete s[n]);return reviver.call(e,t,s)}var j;if(cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}(),function(e,t){"use strict";e.SeamlessBase={isNumeric:function(e){return e-parseFloat(e)+1>=0},getElement:function(e){var n="querySelectorAll";0===e.indexOf("#")&&(n="getElementById",e=e.substr(1,e.length));var a=t[n](e);return a&&"querySelectorAll"===n?a[0]:a},elementHeight:function(e){var n=0,a=0;return t.all?(n=e.currentStyle.height,this.isNumeric(n)||(n=e.offsetHeight),n=parseInt(n,10),a=parseInt(e.currentStyle.marginTop,10)+parseInt(e.currentStyle.marginBottom,10)):(n=parseInt(t.defaultView.getComputedStyle(e,"").getPropertyValue("height"),10),a=parseInt(t.defaultView.getComputedStyle(e,"").getPropertyValue("margin-top"),10)+parseInt(t.defaultView.getComputedStyle(e,"").getPropertyValue("margin-bottom"),10)),n+a},hasClass:function(e,t){return e.classList?e.classList.contains(t):!!e.className.match(new RegExp("(\\s|^)"+t+"(\\s|$)"))},addClass:function(e,t){e.classList?e.classList.add(t):this.hasClass(e,t)||(e.className+=" "+t)},removeClass:function(e,t){if(e.classList)e.classList.remove(t);else if(this.hasClass(e,t)){var n=new RegExp("(\\s|^)"+t+"(\\s|$)");e.className=e.className.replace(n," ")}},getParam:function(t,n){n=n||e.location.search;var a="[?&]"+t+"=([^&#]*)",s=new RegExp(a),r=s.exec(n);return null===r?"":decodeURIComponent(r[1].replace(/\+/g," "))},filterText:function(e){return e.replace(/[<>]/g,"")},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},setStyle:function(t,n){n.length>0&&(n="string"==typeof n?n:n.join(" "),n=e.SeamlessBase.filterText(n),t.styleSheet?t.styleSheet.cssText=n:t.innerHTML=n)},injectStyles:function(n){var a=this.getElement("style#injected-styles");if(a)e.SeamlessBase.setStyle(a,n);else{var s=t.createElement("style");s.setAttribute("type","text/css"),s.setAttribute("id","injected-styles"),e.SeamlessBase.setStyle(s,n);var r=t.head||t.getElementsByTagName("head")[0];r&&r.appendChild(s)}},injectAppendedStyles:function(e){var n=e.join(";"),a=t.head||t.getElementsByTagName("head")[0],s=t.createElement("style");s.type="text/css",s.styleSheet?s.styleSheet.cssText=n:s.appendChild(t.createTextNode(n)),a.appendChild(s)}}}(window,document),function(e){"use strict";e.SeamlessConnection=function(e,t){this.id=0,this.target=e,this.url=t,this.active=!1,this.queue=[]},e.SeamlessConnection.prototype.send=function(t){this.active&&this.target?(t=t||{},t.hasOwnProperty("data")||(t={data:t}),t.target=this.target,t.url=this.url||"index.html",t.type=t.type||"seamless_data",t.data=t.data||{},t.data.__id=this.id,e.pm(t)):this.queue.push(t)},e.SeamlessConnection.prototype.receive=function(t,n){"function"==typeof t&&(n=t,t="seamless_data");var a=this;e.pm.bind(t,function(e,t){return!(!e.__id||e.__id!==a.id)&&n(e,t)})},e.SeamlessConnection.prototype.setActive=function(e){if(this.active=e,this.queue.length>0){for(var t in this.queue)this.send(this.queue[t]);this.queue=[],this.queue.length=0}}}(window),function(e,t,n){"use strict";if(!e.hasOwnProperty("pm"))return void console.log("You must install the postmessage.js module to use seamless.js.");n.seamless=e.seamless={options:{url:"",container:"body",update:200,allowStyleInjection:!1,allowAppendedStyleInjection:!1,requireCookies:!1,cookieFallbackMsg:"Your browser requires this page to be opened in a separate window.",cookieFallbackLinkMsg:"Click Here",cookieFallbackAfterMsg:" to open in a separate window.",onUpdate:null,onConnect:null},connect:function(n){n=n||{};for(var a in n)this.options.hasOwnProperty(a)&&(this.options[a]=n[a]);n=this.options;var s=new e.SeamlessConnection(e.parent,n.url),r=!1;s.setActive(!0),n.requireCookies&&(t.cookie="cookieTest=1",-1===t.cookie.indexOf("cookieTest")&&function(e,t,n){r=!0,s.send({type:"seamless_error",data:{msg:e,linkText:t,afterText:n}})}(n.cookieFallbackMsg,n.cookieFallbackLinkMsg,n.cookieFallbackAfterMsg));var i=e.SeamlessBase.getParam("noiframe").toString();if("1"===i||"true"===i.toLowerCase())s.send({type:"seamless_noiframe",data:{href:e.location.href}});else{var o=!1,l=n.container,c=0,u=0,p=function(){if(!r){u&&clearTimeout(u);var t=e.SeamlessBase.elementHeight(e.SeamlessBase.getElement(l));if(!o&&c!==t){o=!0;var a={height:t};n.onUpdate&&n.onUpdate(a),s.send({type:"seamless_update",data:a,success:function(e){c=e.height,o=!1}})}u=setTimeout(p,n.update)}},f=function(e){r||(e=e||0,s.id||(s.send({type:"seamless_ready",data:{}}),e<50&&setTimeout(function(){f(++e)},200)))};e.pm.bind("seamless_styles",function(t){n.allowStyleInjection&&e.SeamlessBase.injectStyles(t),n.allowAppendedStyleInjection&&e.SeamlessBase.injectAppendedStyles(t),p()}),e.pm.bind("seamless_connect",function(a,r){s.id=a.id,n.onConnect&&n.onConnect(a);var i=t.body.getAttribute("style");return t.body.setAttribute("style","overflow:hidden;"+i),t.body.setAttribute("scroll","no"),n.allowStyleInjection&&e.SeamlessBase.injectStyles(a.styles),p(),a}),f()}return s}}}(window,document,"undefined"==typeof jQuery?{}:jQuery);
