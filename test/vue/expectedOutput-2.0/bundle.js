/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__

	/* script */
	__vue_exports__ = __webpack_require__(1)

	/* template */
	var __vue_template__ = __webpack_require__(6)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (
	  typeof __vue_exports__.default === "object" ||
	  typeof __vue_exports__.default === "function"
	) {
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}

	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

	module.exports = __vue_exports__


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	//
	"use strict";
	var component_vue_1 = __webpack_require__(2);
	var helper_1 = __webpack_require__(5);
	exports.__esModule = true;
	exports["default"] = {
	    components: { component: component_vue_1["default"] },
	    data: function () {
	        return {
	            msg: "world"
	        };
	    },
	    method: {
	        myMethod: helper_1.myMethod
	    }
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_exports__, __vue_options__

	/* script */
	__vue_exports__ = __webpack_require__(3)

	/* template */
	var __vue_template__ = __webpack_require__(4)
	__vue_options__ = __vue_exports__ = __vue_exports__ || {}
	if (
	  typeof __vue_exports__.default === "object" ||
	  typeof __vue_exports__.default === "function"
	) {
	__vue_options__ = __vue_exports__ = __vue_exports__.default
	}
	if (typeof __vue_options__ === "function") {
	  __vue_options__ = __vue_options__.options
	}

	__vue_options__.render = __vue_template__.render
	__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

	module.exports = __vue_exports__


/***/ },
/* 3 */
/***/ function(module, exports) {

	//
	"use strict";
	exports.__esModule = true;
	exports["default"] = {
	    data: function () {
	        return {
	            msg: "component"
	        };
	    }
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports={render:function (){with(this) {
	  return _h('p', ["Hello from " + _s(msg)])
	}},staticRenderFns: []}

/***/ },
/* 5 */
/***/ function(module, exports) {

	export function myMethod() {
	  console.log('from helper!')
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports={render:function (){with(this) {
	  return _h('p', ["hallo " + _s(msg)])
	}},staticRenderFns: []}

/***/ }
/******/ ]);