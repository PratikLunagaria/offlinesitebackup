if (self.CavalryLogger) { CavalryLogger.start_js(["\/PypV"]); }

__d("ChatQuietLinks",["DataStore","DOM","Event","Parent","UserAgent_DEPRECATED","getOrCreateDOMID"],(function(a,b,c,d,e,f){__p&&__p();var g={};a={silenceLinks:function(a){h(a,this.removeEmptyHrefs.bind(this))},nukeLinks:function(a){h(a,this.removeAllHrefs.bind(this))},removeEmptyHrefs:function(a){i(a,function(a){return!a||a==="#"})},removeAllHrefs:function(a){i(a)}};function h(a,c){__p&&__p();if(!a)return;var d=!!b("UserAgent_DEPRECATED").chrome(),e=!!b("UserAgent_DEPRECATED").chrome()||b("UserAgent_DEPRECATED").ie()>=9||b("UserAgent_DEPRECATED").firefox()>=4;if(g[b("getOrCreateDOMID")(a)])return;g[b("getOrCreateDOMID")(a)]=!0;if(!e)return;if(!d){c&&c(a);return}b("Event").listen(a,"mouseover",function(a){a=b("Parent").byTag(a.getTarget(),"a");if(a){var c=a.getAttribute("href");j(c)&&(b("DataStore").set(a,"stashedHref",a.getAttribute("href")),a.removeAttribute("href"))}});b("Event").listen(a,"mouseout",function(a){a=b("Parent").byTag(a.getTarget(),"a");var c=a&&b("DataStore").remove(a,"stashedHref");j(c)&&a.setAttribute("href",c)});b("Event").listen(a,"mousedown",function(a){if(!a.isDefaultRequested())return!0;a=b("Parent").byTag(a.getTarget(),"a");var c=a&&b("DataStore").get(a,"stashedHref");j(c)&&a.setAttribute("href",c)})}function i(a,c){a=b("DOM").scry(a,"a");c&&(a=a.filter(function(a){return c(a.getAttribute("href"))}));a.forEach(function(a){a.removeAttribute("href"),a.tabIndex||a.setAttribute("tabindex",0)})}function j(a){return a&&a!=="#"}e.exports=a}),null);
__d("Dock",["csx","ArbiterMixin","BlueBar","ChatQuietLinks","CSS","DataStore","DOM","Event","Parent","Scroll","Style","Toggler","Vector","emptyFunction","gkx","isKeyActivation","shield"],(function(a,b,c,d,e,f,g){__p&&__p();function c(){}Object.assign(c,b("ArbiterMixin"),{MIN_HEIGHT:140,INITIAL_FLYOUT_HEIGHT_OFFSET:10,init:function(a){__p&&__p();this.init=b("emptyFunction");this.rootEl=a;this.calculateViewportDimensions();b("ChatQuietLinks").removeEmptyHrefs(this.rootEl);b("Event").listen(a,"click",this._onClick.bind(this));var c=a.querySelector(".fbNubButton");c&&b("Event").listen(c,"keypress",this._onKeyPress.bind(this));b("Event").listen(window,"resize",this._onWindowResize.bind(this));b("Toggler").subscribe(["show","hide"],function(c,d){d=d.getActive();if(!b("DOM").contains(a,d))return;if(b("CSS").hasClass(d,"fbNub"))this.notifyNub(d,c),c==="show"&&this._resizeNubFlyout(d);else{d=b("Parent").byClass(d,"fbNubFlyout");d&&b("CSS").conditionClass(d,"menuOpened",c==="show")}}.bind(this));this.inform("init",{},"persistent")},calculateViewportDimensions:function(){return this.viewportDimensions=b("Vector").getViewportDimensions()},getFlyoutHeightOffset:function(){if(this.flyoutHeightOffset)return this.flyoutHeightOffset;this.flyoutHeightOffset=this.INITIAL_FLYOUT_HEIGHT_OFFSET+b("Vector").getElementDimensions(this.rootEl).y;var a=b("BlueBar").getBar();if(a){var c=b("Style").isFixed(a)?"viewport":"document";this.flyoutHeightOffset+=b("Vector").getElementPosition(a,c).y+b("Vector").getElementDimensions(a).y}return this.flyoutHeightOffset},toggle:function(a){var c=this._findFlyout(a);if(!c)return;this.subscribe("init",function(){b("Toggler").toggle(a)})},show:function(a){this.subscribe("init",function(){b("Toggler").show(a)})},showNub:function(a){b("CSS").show(a)},hide:function(a){this.subscribe("init",function(){var c=b("Toggler").getInstance(a);b("DOM").contains(a,c.getActive())&&c.hide()})},hideNub:function(a){b("CSS").hide(a),this.hide(a)},setUseMaxHeight:function(a,c){b("CSS").conditionClass(a,"maxHeight",c!==!1),this._resizeNubFlyout(a)},_resizeNubFlyout:function(a){__p&&__p();var c=this._findFlyout(a);if(!c||b("CSS").hasClass(a,"placeholder")||!(b("CSS").hasClass(a,"openToggler")||b("CSS").hasClass(a,"opened")))return;var d=b("DOM").find(c,"div.fbNubFlyoutOuter"),e=b("DOM").find(d,"div.fbNubFlyoutInner"),f=b("DOM").find(e,"div.fbNubFlyoutBody"),g=b("CSS").hasClass(a,"canBeCompactTab"),h=b("Scroll").getTop(f),i=f.offsetHeight;b("Style").set(f,"height","auto");var j=b("Vector").getElementDimensions(c),k=b("Vector").getElementDimensions(f),l=this.getMaxFlyoutHeight(a);b("Style").set(c,"max-height",l+"px");b("Style").set(d,"max-height",l+"px");j=b("Vector").getElementDimensions(c);d=b("Vector").getElementDimensions(e);l=d.y-k.y;e=j.y-l;d=parseInt(f.style.height||f.clientHeight,10);d=e!==d;j.y>l&&d&&!g&&b("Style").set(f,"height",e+"px");b("CSS").removeClass(c,"swapDirection");var m=b("Vector").getElementPosition(c).x;b("CSS").conditionClass(c,"swapDirection",function(){if(m<0)return!0;return!j||!this.viewportDimensions?!1:m+j.x>this.viewportDimensions.x}.bind(this)());d&&h+i>=k.y?b("Scroll").setTop(f,f.scrollHeight):b("Scroll").setTop(f,h);this.notifyNub(a,"resize")},getMaxFlyoutHeight:function(a){a=this._findFlyout(a);var c=b("Vector").getElementPosition(a,"viewport");a=b("Vector").getElementDimensions(a);if(!this.viewportDimensions||!c)return 0;c=Math.max(this.MIN_HEIGHT,this.viewportDimensions.y-this.getFlyoutHeightOffset())-(this.viewportDimensions.y-c.y-a.y);return Math.max(c,0)},resizeAllFlyouts:function(){var a=this._getAllNubs(),b=a.length;while(b--)this._resizeNubFlyout(a[b])},_getAllNubs:function(){if(!this.rootEl)return[];var a=b("DOM").scry(this.rootEl,"div._50-v.openToggler:not(._s0f)");return a.concat(b("DOM").scry(this.rootEl,"div._50-v.opened:not(._s0f)"))},_onKeyPress:function(a){var c=a.getTarget();c=b("Parent").byClass(c,"fbNub");b("isKeyActivation")(a)&&c&&this.toggle(c)},_onClick:function(a){__p&&__p();a=a.getTarget();var c=b("Parent").byClass(a,"fbNub");if(c){if(b("Parent").byClass(a,"fbNubFlyoutTitlebar")&&!b("gkx")("836108")){var d=b("Parent").byTag(a,"a");a=a.nodeName=="INPUT"&&a.getAttribute("type")=="submit";if(!d&&!a){this.hide(c);return!1}}this.notifyNub(c,"click")}},_onWindowResize:function(a){this.calculateViewportDimensions(),this.resizeAllFlyouts()},_findFlyout:function(a){return b("CSS").hasClass(a,"fbNubFlyout")?a:b("DOM").scry(a,"div.fbNubFlyout")[0]||null},registerNubController:function(a,c){b("DataStore").set(a,"dock:nub:controller",c),c.subscribe("nub/button/content-changed",b("shield")(this.inform,this,"resize",a)),c.subscribe("nub/flyout/content-changed",b("shield")(this._resizeNubFlyout,this,a))},unregisterNubController:function(a){b("DataStore").remove(a,"dock:nub:controller")},notifyNub:function(a,c,d){a=b("DataStore").get(a,"dock:nub:controller");a&&a.inform(c,d)}});e.exports=a.Dock||c}),null);
__d("SimpleDrag",["ArbiterMixin","Event","SubscriptionsHandler","UserAgent_DEPRECATED","Vector","emptyFunction"],(function(a,b,c,d,e,f){__p&&__p();function a(a){this.minDragDistance=0,this._subscriptions=new(b("SubscriptionsHandler"))(),this._subscriptions.addSubscriptions(b("Event").listen(a,"mousedown",this._start.bind(this)))}Object.assign(a.prototype,b("ArbiterMixin"),{setMinDragDistance:function(a){this.minDragDistance=a},destroy:function(){this._subscriptions.release()},_start:function(a){__p&&__p();var c=!1,d=!0,e=null;this.inform("mousedown",a)&&(d=!1);if(this.minDragDistance)e=b("Vector").getEventPosition(a);else{c=!0;var f=this.inform("start",a);if(f===!0)d=!1;else if(f===!1){c=!1;return}}f=b("UserAgent_DEPRECATED").ie()<9?document.documentElement:window;var g=b("Event").listen(f,{selectstart:d?b("Event").prevent:b("emptyFunction"),mousemove:function(a){__p&&__p();if(!c){var d=b("Vector").getEventPosition(a);if(e.distanceTo(d)<this.minDragDistance)return;c=!0;if(this.inform("start",a)===!1){c=!1;return}}this.inform("update",a)}.bind(this),mouseup:function(a){for(var b in g)g[b].remove();c?this.inform("end",a):this.inform("click",a)}.bind(this)});d&&a.prevent()}});e.exports=a}),null);
__d("FBEngagementWhiteopsFraudSensorTypedLogger",["Banzai","GeneratedLoggerUtils","nullthrows"],(function(a,b,c,d,e,f){"use strict";__p&&__p();a=function(){__p&&__p();function a(){this.$1={}}var c=a.prototype;c.log=function(){b("GeneratedLoggerUtils").log("logger:FBEngagementWhiteopsFraudSensorLoggerConfig",this.$1,b("Banzai").BASIC)};c.logVital=function(){b("GeneratedLoggerUtils").log("logger:FBEngagementWhiteopsFraudSensorLoggerConfig",this.$1,b("Banzai").VITAL)};c.logImmediately=function(){b("GeneratedLoggerUtils").log("logger:FBEngagementWhiteopsFraudSensorLoggerConfig",this.$1,{signal:!0})};c.clear=function(){this.$1={};return this};c.getData=function(){return babelHelpers["extends"]({},this.$1)};c.updateData=function(a){this.$1=babelHelpers["extends"]({},this.$1,a);return this};c.setInstanceID=function(a){this.$1.instance_id=a;return this};c.setPageID=function(a){this.$1.page_id=a;return this};c.setPostID=function(a){this.$1.post_id=a;return this};c.setTime=function(a){this.$1.time=a;return this};c.setTqBotDetectionProductEnum=function(a){this.$1.tq_bot_detection_product_enum=a;return this};c.setVC=function(a){this.$1.vc=a;return this};c.setWeight=function(a){this.$1.weight=a;return this};return a}();c={instance_id:!0,page_id:!0,post_id:!0,time:!0,tq_bot_detection_product_enum:!0,vc:!0,weight:!0};e.exports=a}),null);
__d("BasicFBNux",["AsyncRequest","XBasicFBNuxDismissController","XBasicFBNuxViewController"],(function(a,b,c,d,e,f){var g={subscribeHide:function(a,b){a.subscribe("hide",g.onDismiss.bind(this,b))},onView:function(a){a=b("XBasicFBNuxViewController").getURIBuilder().setInt("nux_id",a).getURI();new(b("AsyncRequest"))().setURI(a).send()},onDismiss:function(a){a=b("XBasicFBNuxDismissController").getURIBuilder().setInt("nux_id",a).getURI();new(b("AsyncRequest"))().setURI(a).send()}};e.exports=g}),null);
__d("KeyboardShortcutToken",["KeyEventController"],(function(a,b,c,d,e,f){__p&&__p();a=function(){"use strict";__p&&__p();function a(a,b,c){this.$1=!0,this.key=a,this.handler=b,this.filter=c.filter,this.persistOnTransition=c.persistOnTransition,this.shortcutInfo=c.shortcutInfo,this.register()}var c=a.prototype;c.register=function(){var a=this;if(!this.$1)return;this.token=b("KeyEventController").registerKey(this.key,this.handler,this.filter,!1,function(){return a.persistOnTransition})};c.remove=function(){this.token.remove(),this.$1=!1};c.unregister=function(){this.token.remove()};c.isActive=function(){return this.$1};c.getKey=function(){return this.key};c.getShortcutInfo=function(){return this.shortcutInfo};return a}();e.exports=a}),null);
__d("translateKey",["fbt","invariant"],(function(a,b,c,d,e,f,g,h){var i={alt:g._("\u0a93\u0ab2\u0acd\u0a9f \u0a95\u0abf"),enter:g._("\u0aa6\u0abe\u0a96\u0ab2 \u0a95\u0ab0\u0acb"),"delete":g._("\u0a95\u0abe\u0aa2\u0ac0 \u0aa8\u0abe\u0a96\u0acb"),shift:g._("\u0ab6\u0abf\u0aab\u0acd\u0a9f \u0a95\u0ac0"),opt:g._("\u0aaa\u0ab8\u0a82\u0aa6 \u0a95\u0ab0\u0acb"),ctrl:g._("\u0a95\u0a82\u0a9f\u0acd\u0ab0\u0acb\u0ab2"),cmd:g._("cmd"),esc:g._("esc"),tab:g._("\u0a9f\u0ac5\u0aac"),up:g._("\u0a89\u0aaa\u0ab0"),down:g._("\u0aa8\u0ac0\u0a9a\u0ac7"),right:g._("\u0a9c\u0aae\u0aa3\u0ac7"),left:g._("\u0aa1\u0abe\u0aac\u0ac0 \u0aac\u0abe\u0a9c\u0ac1"),page_up:g._("\u0a86\u0a97\u0ab3\u0aa8\u0ac1\u0a82 \u0aaa\u0ac3\u0ab7\u0acd\u0aa0"),page_down:g._("\u0aaa\u0abe\u0aa8\u0ac1\u0a82 \u0aa8\u0ac0\u0a9a\u0ac7 \u0a95\u0ab0\u0acb"),home:g._("\u0ab9\u0acb\u0aae"),end:g._("\u0ab8\u0aae\u0abe\u0aaa\u0acd\u0aa4")};function a(a){if(Object.prototype.hasOwnProperty.call(i,a))return i[a];a.length===1||h(0,2507);return a}e.exports=a}),null);
__d("KeyboardShortcuts",["csx","cx","fbt","Arbiter","BasicFBNux","CSS","Dock","KeyboardShortcutToken","KeyEventController","Layer","ModalLayer","NavigationMessage","PageTransitions","Run","emptyFunction","translateKey"],(function(a,b,c,d,e,f,g,h,i){__p&&__p();a={_arbiter:null,_hasTriggeredShortcut:!1,_flyoutNub:null,_nubNux:null,_nubNuxID:null,_tokenLayers:[],showInfo:b("emptyFunction"),register:function(a,c,d){__p&&__p();var e=this,f=d?d:{};d=function(a,b){c.call(e,a,b),f.allowDefault||a.prevent(),e._hasTriggeredShortcut||e._handleFirstShortcutTriggered()};var g=f.baseFilters||[b("KeyEventController").defaultFilter],h=function(a,b){__p&&__p();for(var c=g,d=Array.isArray(c),e=0,c=d?c:c[typeof Symbol==="function"?Symbol.iterator:"@@iterator"]();;){var h;if(d){if(e>=c.length)break;h=c[e++]}else{e=c.next();if(e.done)break;h=e.value}h=h;if(!h(a,b))return!1}return!f.filter||f.filter(a,b)};a=new(b("KeyboardShortcutToken"))(a,d,{filter:h,persistOnTransition:f.persistOnTransition,shortcutInfo:f.shortcutInfo});this._tokenLayers.length||this._tokenLayers.push([]);this._tokenLayers[this._tokenLayers.length-1].push(a);this.inform("token_added");return a},init:function(){__p&&__p();var a=this;this._cleanup=this._cleanup.bind(this);b("Run").onLeave(this._cleanup);b("Arbiter").subscribe(b("NavigationMessage").NAVIGATION_BEGIN,this._cleanup);b("Layer").subscribe("show",function(c,d){d.hasBehavior(b("ModalLayer"))&&a.pushLayer()});b("Layer").subscribe("hide",function(c,d){d.hasBehavior(b("ModalLayer"))&&a.popLayer()});this.register("SLASH",function(){var c=a._getFlyoutNub();c&&b("Dock").toggle(c)},{filter:function(a,b){return a.getModifiers().shift},persistOnTransition:!0,shortcutInfo:{displayKeys:[b("translateKey")("?")],description:i._("\u0a86 \u0ab8\u0ab9\u0abe\u0aaf \u0ab8\u0a82\u0ab5\u0abe\u0aa6 \u0aac\u0aa4\u0abe\u0ab5\u0acb")}})},_cleanup:function(){__p&&__p();var a=this,c=[];this._tokenLayers.forEach(function(a){var b=[];a.forEach(function(a){a.isActive()&&b.push(a)});b.length&&c.push(b)});this._tokenLayers=c;this.inform("cleanup");b("PageTransitions").registerCompletionCallback(function(){b("Run").onLeave(a._cleanup),b("Arbiter").subscribe(b("NavigationMessage").NAVIGATION_BEGIN,a._cleanup)})},pushLayer:function(){var a=this._getTopLayer();a&&a.forEach(function(a){a.unregister()});this._tokenLayers.push([])},popLayer:function(){if(this._tokenLayers.length===0)return;var a=this._tokenLayers.pop();a.forEach(function(a){a.remove()});a=this._getTopLayer();a&&a.forEach(function(a){a.register()})},_getTopLayer:function(){return!this._tokenLayers.length?null:this._tokenLayers[this._tokenLayers.length-1]},_getBaseLayer:function(){return!this._tokenLayers.length?null:this._tokenLayers[0]},getShortcutInfos:function(){var a=[],b=this._getBaseLayer();b&&b.forEach(function(b){var c=b.getShortcutInfo();b.isActive()&&c!=null&&a.push(c)});return a},_getArbiterInstance:function(){this._arbiter||(this._arbiter=new(b("Arbiter"))());return this._arbiter},inform:function(a,b,c){return this._getArbiterInstance().inform(a,b,c)},subscribe:function(a,b,c){return this._getArbiterInstance().subscribe(a,b,c)},unsubscribe:function(a){this._getArbiterInstance().unsubscribe(a)},_handleFirstShortcutTriggered:function(){this._hasTriggeredShortcut=!0;var a=this._getFlyoutNub();a&&(b("CSS").removeClass(a,"_ur5"),this._nubNux&&this._nubNuxID&&(this._nubNux.show(),b("BasicFBNux").onView(this._nubNuxID),this._nubNux.subscribe("hide",b("BasicFBNux").onDismiss.bind(this,this._nubNuxID))))},_getFlyoutNub:function(){this._flyoutNub||(this._flyoutNub=document.querySelector("#pagelet_dock ._rz3"));return this._flyoutNub},showShortcutFlyout:function(){this._hasTriggeredShortcut||this._handleFirstShortcutTriggered();var a=this._getFlyoutNub();a&&b("Dock").show(a)},hasFlyoutToShow:function(){return this._getFlyoutNub()!=null&&this.getShortcutInfos().length>0},initNUXEvent:function(a,b){this._nubNux=a,this._nubNuxID=b}};a.init();e.exports=a}),null);
__d("Rect",["invariant","Vector","$"],(function(a,b,c,d,e,f,g){__p&&__p();a=function(){"use strict";__p&&__p();function a(c,d,e,f,h){__p&&__p();if(arguments.length===1){if(c instanceof a)return c;if(c instanceof b("Vector"))return new a(c.y,c.x,c.y,c.x,c.domain);typeof c==="string"&&(c=b("$")(c));return a.getElementBounds(c)}typeof c==="number"&&typeof d==="number"&&typeof e==="number"&&typeof f==="number"&&(!h||typeof h==="string")||g(0,1087);Object.assign(this,{t:c,r:d,b:e,l:f,domain:h||"pure"});return this}var c=a.prototype;c.w=function(){return this.r-this.l};c.h=function(){return this.b-this.t};c.getWidth=function(){return this.w()};c.getHeight=function(){return this.h()};c.toString=function(){return"(("+this.l+", "+this.t+"), ("+this.r+", "+this.b+"))"};c.contains=function(b){b=new a(b).convertTo(this.domain);var c=this;return c.l<=b.l&&c.r>=b.r&&c.t<=b.t&&c.b>=b.b};c.isEqualTo=function(a){return this.t===a.t&&this.r===a.r&&this.b===a.b&&this.l===a.l&&this.domain===a.domain};c.add=function(c,d){if(arguments.length==1){c instanceof a&&c.domain!="pure"&&(c=c.convertTo(this.domain));return c instanceof b("Vector")?this.add(c.x,c.y):this}var e=parseFloat(c),f=parseFloat(d);return new a(this.t+f,this.r+e,this.b+f,this.l+e,this.domain)};c.sub=function(a,c){if(arguments.length==1&&a instanceof b("Vector"))return this.add(a.mul(-1));else if(typeof a==="number"&&typeof c==="number")return this.add(-a,-c);return this};c.rotateAroundOrigin=function(b){var c=this.getCenter().rotate(b*Math.PI/2),d=0;b%2?(d=this.h(),b=this.w()):(d=this.w(),b=this.h());var e=c.y-b/2;c=c.x-d/2;b=e+b;d=c+d;return new a(e,d,b,c,this.domain)};c.boundWithin=function(a){var b=0,c=0;this.l<a.l?b=a.l-this.l:this.r>a.r&&(b=a.r-this.r);this.t<a.t?c=a.t-this.t:this.b>a.b&&(c=a.b-this.b);return this.add(b,c)};c.getCenter=function(){return new(b("Vector"))(this.l+this.w()/2,this.t+this.h()/2,this.domain)};c.getTop=function(){return this.t};c.getRight=function(){return this.r};c.getBottom=function(){return this.b};c.getLeft=function(){return this.l};c.getPositionVector=function(){return new(b("Vector"))(this.l,this.t,this.domain)};c.getDimensionVector=function(){return new(b("Vector"))(this.w(),this.h(),"pure")};c.convertTo=function(c){if(this.domain==c)return this;if(c=="pure")return new a(this.t,this.r,this.b,this.l,"pure");if(this.domain=="pure")return new a(0,0,0,0);var d=new(b("Vector"))(this.l,this.t,this.domain).convertTo(c);return new a(d.y,d.x+this.w(),d.y+this.h(),d.x,c)};a.deserialize=function(b){b=b.split(":");return new a(parseFloat(b[1]),parseFloat(b[2]),parseFloat(b[3]),parseFloat(b[0]))};a.newFromVectors=function(b,c){return new a(b.y,b.x+c.x,b.y+c.y,b.x,b.domain)};a.getElementBounds=function(c){return a.newFromVectors(b("Vector").getElementPosition(c),b("Vector").getElementDimensions(c))};a.getViewportBounds=function(){return a.newFromVectors(b("Vector").getScrollPosition(),b("Vector").getViewportDimensions())};a.getViewportWithoutScrollbarsBounds=function(){return a.newFromVectors(b("Vector").getScrollPosition(),b("Vector").getViewportWithoutScrollbarDimensions())};a.minimumBoundingBox=function(b){var c=new a(Infinity,-Infinity,-Infinity,Infinity),d;for(var e=0;e<b.length;e++)d=b[e],c.t=Math.min(c.t,d.t),c.r=Math.max(c.r,d.r),c.b=Math.max(c.b,d.b),c.l=Math.min(c.l,d.l);return c};return a}();e.exports=a}),null);
__d("ScrollableArea",["ArbiterMixin","Bootloader","BrowserSupport","CSS","CSSFade","DataStore","Deferred","DOM","Event","FocusEvent","Run","Scroll","SimpleDrag","Style","SubscriptionsHandler","TimeSlice","UserAgent_DEPRECATED","Vector","clearTimeout","createCancelableFunction","emptyFunction","firstx","getScrollableAreaContainingNode","ifRequired","mixin","promiseDone","queryThenMutateDOM","setTimeoutAcrossTransitions","throttle"],(function(a,b,c,d,e,f){__p&&__p();var g=12;function h(){b("Run").onAfterLoad(function(){return b("Bootloader").loadModules(["Animation"],b("emptyFunction"),"ScrollableArea")})}a=function(a){"use strict";__p&&__p();babelHelpers.inheritsLoose(c,a);function c(c,d){__p&&__p();var e;e=a.call(this)||this;e.adjustGripper=function(){var a=function(){b("queryThenMutateDOM")(function(){return e._needsGripper()},function(a){a&&(b("Style").set(e._gripper,"height",e._gripperHeight+"px"),e._slideGripper())}),e._throttledShowGripperAndShadows()};a=b("TimeSlice").guard(a,"ScrollableArea adjustGripper",{propagationType:b("TimeSlice").PropagationType.ORPHAN});a();return babelHelpers.assertThisInitialized(e)};e._computeHeights=function(){e._containerHeight=e._elem.clientHeight,e._contentHeight=e._content.offsetHeight,e._trackHeight=e._track.offsetHeight,e._gripperHeight=Math.max(e._containerHeight/e._contentHeight*e._trackHeight,g)};e._showGripperAndShadows=function(){b("queryThenMutateDOM")(function(){return{needsGripper:e._needsGripper(),top:b("Scroll").getTop(e._wrap)>0,isScrolledToBottom:e.isScrolledToBottom()}},function(a){var c=a.needsGripper,d=a.top;a=a.isScrolledToBottom;b("CSS").conditionShow(e._gripper,c);b("CSS").conditionClass(e._elem,"contentBefore",d);b("CSS").conditionClass(e._elem,"contentAfter",!a)})};e._respondMouseMove=function(){if(!e._mouseOver||e._isFocussed)return;var a=e._options.fade!==!1,c=e._mousePos,d=b("Vector").getElementPosition(e._track).x,f=b("Vector").getElementDimensions(e._track).x;d=Math.abs(d+f/2-c.x);f=b("BrowserSupport").hasPointerEvents()&&d<=10;f&&!e._trackIsHovered?(e._trackIsHovered=!0,b("CSS").addClass(e._elem,"uiScrollableAreaTrackOver"),e.throttledAdjustGripper()):!f&&e._trackIsHovered&&(e._trackIsHovered=!1,b("CSS").removeClass(e._elem,"uiScrollableAreaTrackOver"));a&&(d<25?e.showScrollbar({hideAfterDelay:!1}):!e._options.no_fade_on_hover&&!e._isFocussed&&e.hideScrollbar({hideAfterDelay:!0,shouldFade:!0}))};if(!c)return babelHelpers.assertThisInitialized(e);d=d||{};h();e._elem=c;e._wrap=b("firstx")(b("DOM").scry(c,"div.uiScrollableAreaWrap"));e._body=b("firstx")(b("DOM").scry(e._wrap,"div.uiScrollableAreaBody"));e._content=b("firstx")(b("DOM").scry(e._body,"div.uiScrollableAreaContent"));e._track=b("firstx")(b("DOM").scry(c,"div.uiScrollableAreaTrack"));e._trackIsHovered=!1;e._isFocussed=!1;e._gripper=b("firstx")(b("DOM").scry(e._track,"div.uiScrollableAreaGripper"));e._options=d;e._throttledComputeHeights=b("throttle").withBlocking(e._computeHeights,250,babelHelpers.assertThisInitialized(e));e.throttledAdjustGripper=b("throttle").withBlocking(e.adjustGripper,250,babelHelpers.assertThisInitialized(e));e.throttledAdjustGripper=b("TimeSlice").guard(e.throttledAdjustGripper,"ScrollableArea throttledAdjustGripper",{propagationType:b("TimeSlice").PropagationType.ORPHAN});e._throttledShowGripperAndShadows=b("throttle").withBlocking(e._showGripperAndShadows,250,babelHelpers.assertThisInitialized(e));e._throttledRespondMouseMove=b("throttle")(e._respondMouseMove,250,babelHelpers.assertThisInitialized(e));b("setTimeoutAcrossTransitions")(e.adjustGripper.bind(babelHelpers.assertThisInitialized(e)),0);e._listeners=new(b("SubscriptionsHandler"))();e._listeners.addSubscriptions(b("Event").listen(e._wrap,"scroll",e._handleScroll.bind(babelHelpers.assertThisInitialized(e))),b("Event").listen(c,"mousemove",e._handleMouseMove.bind(babelHelpers.assertThisInitialized(e))),b("Event").listen(e._track,"click",e._handleClickOnTrack.bind(babelHelpers.assertThisInitialized(e))));b("BrowserSupport").hasPointerEvents()&&e._listeners.addSubscriptions(b("Event").listen(c,"mousedown",e._handleClickOnTrack.bind(babelHelpers.assertThisInitialized(e))));if(d.fade!==!1){var f;(f=e._listeners).addSubscriptions.apply(f,[b("Event").listen(c,"mouseenter",e._handleMouseEnter.bind(babelHelpers.assertThisInitialized(e))),b("Event").listen(c,"mouseleave",e._handleMouseLeave.bind(babelHelpers.assertThisInitialized(e)))].concat(e._attachFocusListeners(e._wrap)))}else b("BrowserSupport").hasPointerEvents()&&e._listeners.addSubscriptions(b("Event").listen(c,"mouseleave",function(){e._isFocussed||(e._trackIsHovered=!1,b("CSS").removeClass(c,"uiScrollableAreaTrackOver"))}));b("UserAgent_DEPRECATED").webkit()||b("UserAgent_DEPRECATED").chrome()?e._listeners.addSubscriptions(b("Event").listen(c,"mousedown",function(){var a=b("Event").listen(window,"mouseup",function(){b("Scroll").getLeft(c)&&b("Scroll").setLeft(c,0),a.remove()})})):b("UserAgent_DEPRECATED").firefox()&&e._wrap.addEventListener("DOMMouseScroll",function(a){a.axis===a.HORIZONTAL_AXIS&&a.preventDefault()},!1);e._drag=e.initDrag();b("DataStore").set(e._elem,"ScrollableArea",babelHelpers.assertThisInitialized(e));d.persistent||(e._destroy=b("createCancelableFunction")(e._destroy.bind(babelHelpers.assertThisInitialized(e))),b("Run").onLeave(e._destroy));d.shadow!==!1&&b("CSS").addClass(e._elem,"uiScrollableAreaWithShadow");return e}var d=c.prototype;d.getContentHeight=function(){return this._contentHeight};d.getElement=function(){return this._elem};d.initDrag=function(){__p&&__p();var a=b("BrowserSupport").hasPointerEvents(),c=new(b("SimpleDrag"))(a?this._elem:this._gripper);c.subscribe("start",function(d,e){__p&&__p();if(!(e.which&&e.which===1||e.button&&e.button===1))return void 0;d=b("Vector").getEventPosition(e,"viewport");if(a){var f=this._gripper.getBoundingClientRect();if(d.x<f.left||d.x>f.right||d.y<f.top||d.y>f.bottom)return!1}e.stopPropagation();this.inform("grip_start");var g=d.y,h=this._gripper.offsetTop;b("CSS").addClass(this._elem,"uiScrollableAreaDragging");var i=c.subscribe("update",function(a,c){a=b("Vector").getEventPosition(c,"viewport").y-g;this._throttledComputeHeights();c=this._contentHeight-this._containerHeight;a=h+a;var d=this._trackHeight-this._gripperHeight;a=Math.max(Math.min(a,d),0);a=a/d*c;b("Scroll").setTop(this._wrap,a)}.bind(this)),j=c.subscribe("end",function(){c.unsubscribe(i),c.unsubscribe(j),b("CSS").removeClass(this._elem,"uiScrollableAreaDragging"),this.inform("grip_end")}.bind(this));return void 0}.bind(this));return c};d._attachFocusListeners=function(a){var c=this,d;return[b("FocusEvent").listen(a,function(a){d&&(d.reject(),d=null),a?(d=new(b("Deferred"))(),b("promiseDone")(d.getPromise(),function(){c._isFocussed=!0,c._trackIsHovered=!0,b("queryThenMutateDOM")(null,function(){b("CSS").addClass(c._elem,"uiScrollableAreaTrackOver")}),c.showScrollbar({hideAfterDelay:!1}),d=null},function(){d=null})):(c._isFocussed=!1,c._mouseOver?c._respondMouseMove():(b("queryThenMutateDOM")(null,function(){b("CSS").removeClass(c._elem,"uiScrollableAreaTrackOver")}),c.hideScrollbar({hideAfterDelay:!1,shouldFade:!1})))}),b("Event").listen(document.documentElement,"keyup",function(a){d&&d.resolve()})]};d._needsGripper=function(){this._throttledComputeHeights();return this._gripperHeight<this._trackHeight};d._slideGripper=function(){var a=this;b("queryThenMutateDOM")(function(){return b("Scroll").getTop(a._wrap)/(a._contentHeight-a._containerHeight)*(a._trackHeight-a._gripperHeight)},function(c){b("Style").set(a._gripper,"top",c+"px")})};d.destroy=function(){this._destroy(),this._destroy.cancel&&this._destroy.cancel()};d._destroy=function(){this._listeners&&this._listeners.release(),this._elem&&b("DataStore").remove(this._elem,"ScrollableArea"),this._drag&&this._drag.destroy()};d._handleClickOnTrack=function(a){var c=b("Vector").getEventPosition(a,"viewport"),d=this._gripper.getBoundingClientRect();c.x<d.right&&c.x>d.left&&(c.y<d.top?this.setScrollTop(this.getScrollTop()-this._elem.clientHeight):c.y>d.bottom&&this.setScrollTop(this.getScrollTop()+this._elem.clientHeight),a.kill())};d._handleMouseMove=function(a){var c=this._options.fade!==!1;(b("BrowserSupport").hasPointerEvents()||c)&&(this._mousePos=b("Vector").getEventPosition(a),this._throttledRespondMouseMove())};d._handleScroll=function(a){this._needsGripper()&&this._slideGripper(),this.throttledAdjustGripper(),this._options.fade!==!1&&!this._isFocussed&&this.showScrollbar({hideAfterDelay:!0}),this.inform("scroll")};d._handleMouseLeave=function(a){this._mouseOver=!1,this._mousePos=b("Vector").getEventPosition(a),this._isFocussed||this.hideScrollbar({hideAfterDelay:!0,shouldFade:!0})};d._handleMouseEnter=function(a){this._mouseOver=!0,this._mousePos=b("Vector").getEventPosition(a),this._isFocussed||this.showScrollbar({hideAfterDelay:!0})};d.hideScrollbar=function(a){var c=this,d=a.hideAfterDelay,e=a.shouldFade;if(this._hideTimeout||!this._scrollbarVisible)return this;var f=function(){c._scrollbarVisible=!1,b("CSSFade").hide(c._track,{simple:!e,invisible:b("CSS").hasClass(c._track,"invisible_elem")})};d?this._hideTimeout=b("setTimeoutAcrossTransitions")(function(){c._hideTimeout=null,f()},750):f();return this};d.pageDown=function(a,b){this._scrollPage(1,a,b)};d.pageUp=function(a,b){this._scrollPage(-1,a,b)};d._scrollPage=function(a,b,c){a=a*this._containerHeight;var d=this.getScrollHeight()-this._containerHeight;d=Math.max(0,Math.min(d,this.getScrollTop()+a));this.setScrollTop(d,b,c)};d.resize=function(){this._body.style.width&&(this._body.style.width="");var a=this._wrap.offsetWidth-this._wrap.clientWidth;a>0&&b("Style").set(this._body,"margin-right",-a+"px");return this};d.showScrollbar=function(a){var c=this,d=a.hideAfterDelay;this._hideTimeout&&(b("clearTimeout")(this._hideTimeout),this._hideTimeout=null);if(this._scrollbarVisible)return this;this._scrollbarVisible=!0;b("queryThenMutateDOM")(null,function(){b("CSSFade").show(c._track,{duration:0,invisible:b("CSS").hasClass(c._track,"invisible_elem")}),c.throttledAdjustGripper(),d&&c.hideScrollbar({hideAfterDelay:!0,shouldFade:!c._options.no_fade_on_hover})});return this};d.distanceToBottom=function(){this._computeHeights();var a=Math.round(b("Scroll").getTop(this._wrap));return this._contentHeight-(a+this._containerHeight)};d.isScrolledToBottom=function(){return this.distanceToBottom()<=0};d.isScrolledToTop=function(){return b("Scroll").getTop(this._wrap)===0};d.scrollToBottom=function(a,b){this.setScrollTop(this._wrap.scrollHeight,a,b)};d.scrollToTop=function(a,b){this.setScrollTop(0,a,b)};d.scrollIntoView=function(a,c,d){var e=this._wrap.clientHeight,f=a.offsetHeight,g=b("Scroll").getTop(this._wrap),h=g+e;a=this.getScrollOffsetForElement(a);var i=a+f;if(a<g||e<f)return this.setScrollTop(a,c,{callback:d});else if(i>h)return this.setScrollTop(g+(i-h),c,{callback:d});d&&d();return b("emptyFunction")};d.getScrollOffsetForElement=function(a){var b=0;while(a!=null&&a!==this._wrap)b+=a.offsetTop,a=a.offsetParent;return b};d.scrollElemToTop=function(a,b,c){this.setScrollTop(a.offsetTop,b,{callback:c})};d.poke=function(){var a=b("Scroll").getTop(this._wrap);b("Scroll").setTop(this._wrap,b("Scroll").getTop(this._wrap)+1);b("Scroll").setTop(this._wrap,b("Scroll").getTop(this._wrap)-1);b("Scroll").setTop(this._wrap,a);if(this._isFocussed)return this;else return this.showScrollbar({hideAfterDelay:!1})};d.getClientHeight=function(){return this._wrap.clientHeight};d.getScrollTop=function(){return b("Scroll").getTop(this._wrap)};d.getScrollHeight=function(){return this._wrap.scrollHeight};d.setScrollTop=function(a,c,d){var e=this;d===void 0&&(d={});var f;c!==!1?f=b("ifRequired")("Animation",function(b){return e._animatedSetScrollTop(b,a,d)},function(){return e._simpleSetScrollTop(a,d)}):this._simpleSetScrollTop(a,d);return function(){f&&f.stop(),f=null}};d._simpleSetScrollTop=function(a,c){b("Scroll").setTop(this._wrap,a),c.callback&&c.callback()};d._animatedSetScrollTop=function(a,b,c){this._scrollTopAnimation&&this._scrollTopAnimation.stop();var d=c.duration||250,e=c.ease||a.ease.end;this._scrollTopAnimation=new a(this._wrap).to("scrollTop",b).ease(e).duration(d).ondone(c.callback).go();return this._scrollTopAnimation};c.renderDOM=function(){var a=b("DOM").create("div",{className:"uiScrollableAreaContent"}),c=b("DOM").create("div",{className:"uiScrollableAreaBody"},a),d=b("DOM").create("div",{className:"uiScrollableAreaWrap scrollable"},c),e=b("DOM").create("div",{className:"uiScrollableArea native"},d);return{root:e,wrap:d,body:c,content:a}};c.fromNative=function(a,d){__p&&__p();if(!b("CSS").hasClass(a,"uiScrollableArea")||!b("CSS").hasClass(a,"native"))return void 0;d=d||{};b("CSS").removeClass(a,"native");var e=b("DOM").create("div",{className:"uiScrollableAreaTrack"},b("DOM").create("div",{className:"uiScrollableAreaGripper"}));d.fade!==!1?(b("CSS").addClass(a,"fade"),b("CSS").addClass(e,"hidden_elem")):b("CSS").addClass(a,"nofade");d.tabIndex!==void 0&&d.tabIndex!==null?(b("DOM").setAttributes(e,{tabIndex:d.tabIndex}),b("DOM").prependContent(a,e)):b("DOM").appendContent(a,e);e=new c(a,d);e.resize();return e};c.getInstance=function(a){return b("getScrollableAreaContainingNode")(a)};c.poke=function(a){a=c.getInstance(a);a&&a.poke()};return c}(b("mixin")(b("ArbiterMixin")));e.exports=a}),null);
__d("MenuTheme",["cx"],(function(a,b,c,d,e,f,g){e.exports={className:"_569t"}}),null);
__d("FBSiteWhiteOps",["ControlledReferer","FBEngagementWhiteopsFraudSensorTypedLogger","Style","URI","UserAgent"],(function(a,b,c,d,e,f){"use strict";__p&&__p();a={appendToWindow:function(a,c,d,e,f){__p&&__p();e===void 0&&(e=null);f===void 0&&(f=null);var g=window.document.body;try{var h="fbsbx-sig-iframe-detection";if(g.getElementsByClassName(h).length!==0)return;var i=window.document.createElement("iframe");b("Style").apply(i,{height:"1px",width:"1px",opacity:"0",position:"relative",zIndex:"-9999999"});i.id="fbsbx-sig-iframe-"+a;i.className=h;i.referrerPolicy="no-referrer";b("ControlledReferer").useFacebookReferer(i,function(){__p&&__p();i.sandbox="allow-scripts allow-same-origin";var g="https://s.update.fbsbx.com/2/843748/utils.html?ti="+a+"&di=facebook.com&bt="+c+"&dt=8437481520966594402012";d&&(g+="&sn="+d);e!=null&&e!==""&&(g+="&c1="+e);f!=null&&f!==""&&(g+="&c3="+f);g=new(b("URI"))(g);var h=i.contentWindow.document,j="fbsbx-sig-iframe-form-"+a,k=g.toString();g=g.getQueryData();if(b("UserAgent").isBrowser("IE")||b("UserAgent").isBrowser("Edge")||b("UserAgent").isBrowser("IE Mobile")){var l="";for(var m in g)Object.prototype.hasOwnProperty.call(g,m)&&(l+="<input "+('name="'+m+'" ')+'type="hidden" autocomplete="off" '+('value="'+g[m]+'" />'));h.body.innerHTML='<form method="GET" id='+j+">"+l+"</form>";l=h.getElementById(j);l.action=k}else{h.body.innerHTML='<form method="GET" id='+j+"></form>";l=h.getElementById(j);l.action=k;for(var n in g)if(Object.prototype.hasOwnProperty.call(g,n)){k=h.createElement("input");k.name=n;k.value=g[n];k.autocomplete="off";k.type="hidden";l.appendChild(k)}}h.body.innerHTML+='<iframe height="100%" width="100%" onload=\'document.getElementById("'+j+"\").submit()'/>;"});g.appendChild(i)}catch(a){}},log:function(a,c,d){new(b("FBEngagementWhiteopsFraudSensorTypedLogger"))().setInstanceID(a).setTqBotDetectionProductEnum(c).log()}};e.exports=a}),null);
__d("getOwnObjectValues",[],(function(a,b,c,d,e,f){function a(a){return Object.keys(a).map(function(b){return a[b]})}e.exports=a}),null);
__d("DamerauLevenshtein",[],(function(a,b,c,d,e,f){__p&&__p();a={DamerauLevenshteinDistance:function(a,b){__p&&__p();if(a.length===0)return b.length;if(b.length===0)return a.length;if(a===b)return 0;var c,d,e=[];e[0]=[];e[1]=[];e[2]=[];for(d=0;d<=b.length;d++)e[0][d]=d;for(c=1;c<=a.length;c++)for(d=1;d<=b.length;d++){e[c%3][0]=c;var f=a.charAt(c-1)===b.charAt(d-1)?0:1;e[c%3][d]=Math.min(e[(c-1)%3][d]+1,e[c%3][d-1]+1,e[(c-1)%3][d-1]+f);c>1&&d>1&&a.charAt(c-1)==b.charAt(d-2)&&a.charAt(c-2)==b.charAt(d-1)&&(e[c%3][d]=Math.min(e[c%3][d],e[(c-2)%3][d-2]+f))}return e[a.length%3][b.length]}};e.exports=a}),null);