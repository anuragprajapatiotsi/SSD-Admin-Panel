'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@fortune-sheet/core');
var React = require('react');
var produce = require('immer');
var _ = require('lodash');
var regeneratorRuntime = require('regenerator-runtime');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var produce__default = /*#__PURE__*/_interopDefaultLegacy(produce);
var ___default = /*#__PURE__*/_interopDefaultLegacy(_);
var regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(regeneratorRuntime);

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _objectDestructuringEmpty(t) {
  if (null == t) throw new TypeError("Cannot destructure " + t);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o,
    r,
    i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return _regeneratorDefine(u, "_invoke", function (r, n, o) {
      var i,
        c,
        u,
        f = 0,
        p = o || [],
        y = !1,
        G = {
          p: 0,
          n: 0,
          v: e,
          a: d,
          f: d.bind(e, 4),
          d: function (t, r) {
            return i = t, c = 0, u = e, G.n = r, a;
          }
        };
      function d(r, n) {
        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
          var o,
            i = p[t],
            d = G.p,
            l = i[2];
          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
        }
        if (o || r > 1) return a;
        throw y = !0, n;
      }
      return function (o, p, l) {
        if (f > 1) throw TypeError("Generator is already running");
        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
          try {
            if (f = 2, i) {
              if (c || (o = "next"), t = i[o]) {
                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u = t.value, c < 2 && (c = 0);
              } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
              i = e;
            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
          } catch (t) {
            i = e, c = 1, u = t;
          } finally {
            f = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r, o, i), !0), u;
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
      return this;
    }), t),
    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
    return this;
  }), _regeneratorDefine(u, "toString", function () {
    return "[object Generator]";
  }), (_regenerator = function () {
    return {
      w: i,
      m: f
    };
  })();
}
function _regeneratorDefine(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  _regeneratorDefine = function (e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r ? i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
  }, _regeneratorDefine(e, r, n, t);
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

var defaultRefs = {
  globalCache: {
    undoList: [],
    redoList: []
  },
  cellInput: /*#__PURE__*/React__default['default'].createRef(),
  fxInput: /*#__PURE__*/React__default['default'].createRef(),
  canvas: /*#__PURE__*/React__default['default'].createRef(),
  cellArea: /*#__PURE__*/React__default['default'].createRef(),
  workbookContainer: /*#__PURE__*/React__default['default'].createRef()
};
var WorkbookContext = /*#__PURE__*/React__default['default'].createContext({
  context: core.defaultContext(defaultRefs),
  setContext: function setContext() {},
  settings: core.defaultSettings,
  handleUndo: function handleUndo() {},
  handleRedo: function handleRedo() {},
  refs: {
    globalCache: {
      undoList: [],
      redoList: []
    },
    cellInput: /*#__PURE__*/React__default['default'].createRef(),
    fxInput: /*#__PURE__*/React__default['default'].createRef(),
    canvas: /*#__PURE__*/React__default['default'].createRef(),
    scrollbarX: /*#__PURE__*/React__default['default'].createRef(),
    scrollbarY: /*#__PURE__*/React__default['default'].createRef(),
    cellArea: /*#__PURE__*/React__default['default'].createRef(),
    workbookContainer: /*#__PURE__*/React__default['default'].createRef()
  }
});

var SVGIcon = function SVGIcon(_ref) {
  var _ref$width = _ref.width,
    width = _ref$width === void 0 ? 24 : _ref$width,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 24 : _ref$height,
    name = _ref.name,
    style = _ref.style;
  return /*#__PURE__*/React__default['default'].createElement("svg", {
    width: width,
    height: height,
    style: style,
    "aria-hidden": "true"
  }, /*#__PURE__*/React__default['default'].createElement("use", {
    xlinkHref: "#".concat(name)
  }));
};

var ColumnHeader = function ColumnHeader() {
  var _refs$globalCache$fre2;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    settings = _useContext.settings,
    refs = _useContext.refs;
  var containerRef = React.useRef(null);
  var colChangeSizeRef = React.useRef(null);
  var _useState = React.useState({
      col: -1,
      col_pre: -1,
      col_index: -1
    }),
    _useState2 = _slicedToArray(_useState, 2),
    hoverLocation = _useState2[0],
    setHoverLocation = _useState2[1];
  var _useState3 = React.useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    hoverInFreeze = _useState4[0],
    setHoverInFreeze = _useState4[1];
  var _useState5 = React.useState([]),
    _useState6 = _slicedToArray(_useState5, 2),
    selectedLocation = _useState6[0],
    setSelectedLocation = _useState6[1];
  var allowEditRef = React.useRef(true);
  var sheetIndex = core.getSheetIndex(context, context.currentSheetId);
  var sheet = sheetIndex == null ? null : context.luckysheetfile[sheetIndex];
  var freezeHandleLeft = React.useMemo(function () {
    var _sheet$frozen, _sheet$frozen2, _sheet$frozen3, _sheet$frozen4;
    if ((sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen = sheet.frozen) === null || _sheet$frozen === void 0 ? void 0 : _sheet$frozen.type) === "column" || (sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen2 = sheet.frozen) === null || _sheet$frozen2 === void 0 ? void 0 : _sheet$frozen2.type) === "rangeColumn" || (sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen3 = sheet.frozen) === null || _sheet$frozen3 === void 0 ? void 0 : _sheet$frozen3.type) === "rangeBoth" || (sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen4 = sheet.frozen) === null || _sheet$frozen4 === void 0 ? void 0 : _sheet$frozen4.type) === "both") {
      var _sheet$frozen5, _sheet$frozen5$range;
      return core.colLocationByIndex((sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen5 = sheet.frozen) === null || _sheet$frozen5 === void 0 ? void 0 : (_sheet$frozen5$range = _sheet$frozen5.range) === null || _sheet$frozen5$range === void 0 ? void 0 : _sheet$frozen5$range.column_focus) || 0, context.visibledatacolumn)[1] - 2 + context.scrollLeft;
    }
    return context.scrollLeft;
  }, [context.visibledatacolumn, sheet === null || sheet === void 0 ? void 0 : sheet.frozen, context.scrollLeft]);
  var onMouseMove = React.useCallback(function (e) {
    var _refs$globalCache$fre;
    if (context.luckysheet_cols_change_size) {
      return;
    }
    var mouseX = e.pageX - containerRef.current.getBoundingClientRect().left - window.scrollX;
    var _x = mouseX + containerRef.current.scrollLeft;
    var freeze = (_refs$globalCache$fre = refs.globalCache.freezen) === null || _refs$globalCache$fre === void 0 ? void 0 : _refs$globalCache$fre[context.currentSheetId];
    var _fixPositionOnFrozenC = core.fixPositionOnFrozenCells(freeze, _x, 0, mouseX, 0),
      x = _fixPositionOnFrozenC.x,
      inVerticalFreeze = _fixPositionOnFrozenC.inVerticalFreeze;
    var col_location = core.colLocation(x, context.visibledatacolumn);
    var _col_location = _slicedToArray(col_location, 3),
      col_pre = _col_location[0],
      col = _col_location[1],
      col_index = _col_location[2];
    if (col_index !== hoverLocation.col_index) {
      setHoverLocation({
        col_pre: col_pre,
        col: col,
        col_index: col_index
      });
      setHoverInFreeze(inVerticalFreeze);
    }
    var flowdata = core.getFlowdata(context);
    if (!___default['default'].isNil(flowdata)) allowEditRef.current = core.isAllowEdit(context) && core.isAllowEdit(context, [{
      row: [0, flowdata.length - 1],
      column: col_location
    }]);
  }, [context, hoverLocation.col_index, refs.globalCache.freezen]);
  var onMouseDown = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleColumnHeaderMouseDown(draftCtx, refs.globalCache, nativeEvent, containerRef.current, refs.cellInput.current, refs.fxInput.current);
    });
  }, [refs.globalCache, refs.cellInput, refs.fxInput, setContext]);
  var onMouseLeave = React.useCallback(function () {
    if (context.luckysheet_cols_change_size) {
      return;
    }
    setHoverLocation({
      col: -1,
      col_pre: -1,
      col_index: -1
    });
  }, [context.luckysheet_cols_change_size]);
  var onColSizeHandleMouseDown = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleColSizeHandleMouseDown(draftCtx, refs.globalCache, nativeEvent, containerRef.current, refs.workbookContainer.current, refs.cellArea.current);
    });
    e.stopPropagation();
  }, [refs.cellArea, refs.globalCache, refs.workbookContainer, setContext]);
  var onColSizeHandleDoubleClick = React.useCallback(function (e) {
    e.preventDefault();
    e.stopPropagation();
    setContext(function (draftCtx) {
      var _refs$canvas$current;
      var renderContext = (_refs$canvas$current = refs.canvas.current) === null || _refs$canvas$current === void 0 ? void 0 : _refs$canvas$current.getContext("2d");
      if (!renderContext) return;
      core.autoFitColumns(draftCtx, renderContext, core.getAutoFitColumnIndexes(draftCtx, hoverLocation.col_index));
    });
  }, [hoverLocation.col_index, refs.canvas, setContext]);
  var onColFreezeHandleMouseDown = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleColFreezeHandleMouseDown(draftCtx, refs.globalCache, nativeEvent, containerRef.current, refs.workbookContainer.current, refs.cellArea.current);
    });
    e.stopPropagation();
  }, [refs.cellArea, refs.globalCache, refs.workbookContainer, setContext]);
  var onContextMenu = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleContextMenu(draftCtx, settings, nativeEvent, refs.workbookContainer.current, refs.cellArea.current, "columnHeader");
    });
  }, [refs.workbookContainer, setContext, settings, refs.cellArea]);
  React.useEffect(function () {
    var s = context.luckysheet_select_save;
    if (___default['default'].isNil(s)) return;
    var columnTitleMap = {};
    for (var i = 0; i < s.length; i += 1) {
      var c1 = s[i].column[0];
      var c2 = s[i].column[1];
      columnTitleMap = core.selectTitlesMap(columnTitleMap, c1, c2);
    }
    var columnTitleRange = core.selectTitlesRange(columnTitleMap);
    var selects = [];
    for (var j = 0; j < columnTitleRange.length; j += 1) {
      var _c = columnTitleRange[j][0];
      var _c2 = columnTitleRange[j][columnTitleRange[j].length - 1];
      var col = core.colLocationByIndex(_c2, context.visibledatacolumn)[1];
      var col_pre = core.colLocationByIndex(_c, context.visibledatacolumn)[0];
      if (___default['default'].isNumber(col) && ___default['default'].isNumber(col_pre)) {
        selects.push({
          col: col,
          col_pre: col_pre,
          c1: _c,
          c2: _c2
        });
      }
    }
    setSelectedLocation(selects);
  }, [context.luckysheet_select_save, context.visibledatacolumn]);
  React.useEffect(function () {
    containerRef.current.scrollLeft = context.scrollLeft;
  }, [context.scrollLeft]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    ref: containerRef,
    className: "fortune-col-header",
    style: {
      height: context.columnHeaderHeight - 1.5
    },
    onMouseMove: onMouseMove,
    onMouseDown: onMouseDown,
    onMouseLeave: onMouseLeave,
    onContextMenu: onContextMenu
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-cols-freeze-handle",
    onMouseDown: onColFreezeHandleMouseDown,
    style: {
      left: freezeHandleLeft || 0
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-cols-change-size",
    ref: colChangeSizeRef,
    id: "fortune-cols-change-size",
    onMouseDown: onColSizeHandleMouseDown,
    onDoubleClick: onColSizeHandleDoubleClick,
    style: {
      left: hoverLocation.col - 5 + (hoverInFreeze ? context.scrollLeft : 0),
      opacity: context.luckysheet_cols_change_size ? 1 : 0
    }
  }), !context.luckysheet_cols_change_size && hoverLocation.col_index >= 0 ? (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-col-header-hover",
    style: ___default['default'].assign({
      left: hoverLocation.col_pre,
      width: hoverLocation.col - hoverLocation.col_pre - 1,
      display: "block"
    }, core.fixColumnStyleOverflowInFreeze(context, hoverLocation.col_index, hoverLocation.col_index, (_refs$globalCache$fre2 = refs.globalCache.freezen) === null || _refs$globalCache$fre2 === void 0 ? void 0 : _refs$globalCache$fre2[context.currentSheetId]))
  }, allowEditRef.current && (/*#__PURE__*/React__default['default'].createElement("span", {
    className: "header-arrow",
    onClick: function onClick(e) {
      setContext(function (ctx) {
        ctx.contextMenu = {
          x: e.pageX,
          y: 90,
          headerMenu: true
        };
      });
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "headDownArrow",
    width: 12
  }))))) : null, selectedLocation.map(function (_ref, i) {
    var _refs$globalCache$fre3;
    var col = _ref.col,
      col_pre = _ref.col_pre,
      c1 = _ref.c1,
      c2 = _ref.c2;
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-col-header-selected",
      key: i,
      style: ___default['default'].assign({
        left: col_pre,
        width: col - col_pre - 1,
        display: "block",
        backgroundColor: "rgba(76, 76, 76, 0.1)"
      }, core.fixColumnStyleOverflowInFreeze(context, c1, c2, (_refs$globalCache$fre3 = refs.globalCache.freezen) === null || _refs$globalCache$fre3 === void 0 ? void 0 : _refs$globalCache$fre3[context.currentSheetId]))
    });
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-cols-h-cells luckysheetsheetchange",
    id: "luckysheet-cols-h-cells_0",
    style: {
      width: context.ch_width,
      height: 1
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-cols-h-cells-c"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-grdblkpush"
  }))));
};

var RowHeader = function RowHeader() {
  var _refs$globalCache$fre2;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    settings = _useContext.settings,
    refs = _useContext.refs;
  var rowChangeSizeRef = React.useRef(null);
  var containerRef = React.useRef(null);
  var _useState = React.useState({
      row: -1,
      row_pre: -1,
      row_index: -1
    }),
    _useState2 = _slicedToArray(_useState, 2),
    hoverLocation = _useState2[0],
    setHoverLocation = _useState2[1];
  var _useState3 = React.useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    hoverInFreeze = _useState4[0],
    setHoverInFreeze = _useState4[1];
  var _useState5 = React.useState([]),
    _useState6 = _slicedToArray(_useState5, 2),
    selectedLocation = _useState6[0],
    setSelectedLocation = _useState6[1];
  var sheetIndex = core.getSheetIndex(context, context.currentSheetId);
  var sheet = sheetIndex == null ? null : context.luckysheetfile[sheetIndex];
  var freezeHandleTop = React.useMemo(function () {
    var _sheet$frozen, _sheet$frozen2, _sheet$frozen3, _sheet$frozen4;
    if ((sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen = sheet.frozen) === null || _sheet$frozen === void 0 ? void 0 : _sheet$frozen.type) === "row" || (sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen2 = sheet.frozen) === null || _sheet$frozen2 === void 0 ? void 0 : _sheet$frozen2.type) === "rangeRow" || (sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen3 = sheet.frozen) === null || _sheet$frozen3 === void 0 ? void 0 : _sheet$frozen3.type) === "rangeBoth" || (sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen4 = sheet.frozen) === null || _sheet$frozen4 === void 0 ? void 0 : _sheet$frozen4.type) === "both") {
      var _sheet$frozen5, _sheet$frozen5$range;
      return core.rowLocationByIndex((sheet === null || sheet === void 0 ? void 0 : (_sheet$frozen5 = sheet.frozen) === null || _sheet$frozen5 === void 0 ? void 0 : (_sheet$frozen5$range = _sheet$frozen5.range) === null || _sheet$frozen5$range === void 0 ? void 0 : _sheet$frozen5$range.row_focus) || 0, context.visibledatarow)[1] + context.scrollTop;
    }
    return context.scrollTop;
  }, [context.visibledatarow, sheet === null || sheet === void 0 ? void 0 : sheet.frozen, context.scrollTop]);
  var onMouseMove = React.useCallback(function (e) {
    var _refs$globalCache$fre;
    if (context.luckysheet_rows_change_size) {
      return;
    }
    var mouseY = e.pageY - containerRef.current.getBoundingClientRect().top - window.scrollY;
    var _y = mouseY + containerRef.current.scrollTop;
    var freeze = (_refs$globalCache$fre = refs.globalCache.freezen) === null || _refs$globalCache$fre === void 0 ? void 0 : _refs$globalCache$fre[context.currentSheetId];
    var _fixPositionOnFrozenC = core.fixPositionOnFrozenCells(freeze, 0, _y, 0, mouseY),
      y = _fixPositionOnFrozenC.y,
      inHorizontalFreeze = _fixPositionOnFrozenC.inHorizontalFreeze;
    var row_location = core.rowLocation(y, context.visibledatarow);
    var _row_location = _slicedToArray(row_location, 3),
      row_pre = _row_location[0],
      row = _row_location[1],
      row_index = _row_location[2];
    if (row_pre !== hoverLocation.row_pre || row !== hoverLocation.row) {
      setHoverLocation({
        row_pre: row_pre,
        row: row,
        row_index: row_index
      });
      setHoverInFreeze(inHorizontalFreeze);
    }
  }, [context.luckysheet_rows_change_size, context.visibledatarow, hoverLocation.row, hoverLocation.row_pre, refs.globalCache.freezen, context.currentSheetId]);
  var onMouseDown = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleRowHeaderMouseDown(draftCtx, refs.globalCache, nativeEvent, containerRef.current, refs.cellInput.current, refs.fxInput.current);
    });
  }, [refs.globalCache, refs.cellInput, refs.fxInput, setContext]);
  var onMouseLeave = React.useCallback(function () {
    if (context.luckysheet_rows_change_size) {
      return;
    }
    setHoverLocation({
      row: -1,
      row_pre: -1,
      row_index: -1
    });
  }, [context.luckysheet_rows_change_size]);
  var onRowSizeHandleMouseDown = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleRowSizeHandleMouseDown(draftCtx, refs.globalCache, nativeEvent, containerRef.current, refs.workbookContainer.current, refs.cellArea.current);
    });
    e.stopPropagation();
  }, [refs.cellArea, refs.globalCache, refs.workbookContainer, setContext]);
  var onRowFreezeHandleMouseDown = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleRowFreezeHandleMouseDown(draftCtx, refs.globalCache, nativeEvent, containerRef.current, refs.workbookContainer.current, refs.cellArea.current);
    });
    e.stopPropagation();
  }, [refs.cellArea, refs.globalCache, refs.workbookContainer, setContext]);
  var onContextMenu = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleContextMenu(draftCtx, settings, nativeEvent, refs.workbookContainer.current, refs.cellArea.current, "rowHeader");
    });
  }, [refs.workbookContainer, setContext, settings, refs.cellArea]);
  React.useEffect(function () {
    var s = context.luckysheet_select_save || [];
    var rowTitleMap = {};
    for (var i = 0; i < s.length; i += 1) {
      var r1 = s[i].row[0];
      var r2 = s[i].row[1];
      rowTitleMap = core.selectTitlesMap(rowTitleMap, r1, r2);
    }
    var rowTitleRange = core.selectTitlesRange(rowTitleMap);
    var selects = [];
    for (var _i = 0; _i < rowTitleRange.length; _i += 1) {
      var _r = rowTitleRange[_i][0];
      var _r2 = rowTitleRange[_i][rowTitleRange[_i].length - 1];
      var row = core.rowLocationByIndex(_r2, context.visibledatarow)[1];
      var row_pre = core.rowLocationByIndex(_r, context.visibledatarow)[0];
      if (___default['default'].isNumber(row_pre) && ___default['default'].isNumber(row)) {
        selects.push({
          row: row,
          row_pre: row_pre,
          r1: _r,
          r2: _r2
        });
      }
    }
    setSelectedLocation(selects);
  }, [context.luckysheet_select_save, context.visibledatarow]);
  React.useEffect(function () {
    containerRef.current.scrollTop = context.scrollTop;
  }, [context.scrollTop]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    ref: containerRef,
    className: "fortune-row-header",
    style: {
      width: context.rowHeaderWidth - 1.5,
      height: context.cellmainHeight
    },
    onMouseMove: onMouseMove,
    onMouseDown: onMouseDown,
    onMouseLeave: onMouseLeave,
    onContextMenu: onContextMenu
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-rows-freeze-handle",
    onMouseDown: onRowFreezeHandleMouseDown,
    style: {
      top: freezeHandleTop || 0
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-rows-change-size",
    ref: rowChangeSizeRef,
    onMouseDown: onRowSizeHandleMouseDown,
    style: {
      top: hoverLocation.row - 3 + (hoverInFreeze ? context.scrollTop : 0),
      opacity: context.luckysheet_rows_change_size ? 1 : 0
    }
  }), !context.luckysheet_rows_change_size && hoverLocation.row_index >= 0 ? (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-row-header-hover",
    style: ___default['default'].assign({
      top: hoverLocation.row_pre,
      height: hoverLocation.row - hoverLocation.row_pre - 1,
      display: "block"
    }, core.fixRowStyleOverflowInFreeze(context, hoverLocation.row_index, hoverLocation.row_index, (_refs$globalCache$fre2 = refs.globalCache.freezen) === null || _refs$globalCache$fre2 === void 0 ? void 0 : _refs$globalCache$fre2[context.currentSheetId]))
  })) : null, selectedLocation.map(function (_ref, i) {
    var _refs$globalCache$fre3;
    var row = _ref.row,
      row_pre = _ref.row_pre,
      r1 = _ref.r1,
      r2 = _ref.r2;
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-row-header-selected",
      key: i,
      style: ___default['default'].assign({
        top: row_pre,
        height: row - row_pre - 1,
        display: "block",
        backgroundColor: "rgba(76, 76, 76, 0.1)"
      }, core.fixRowStyleOverflowInFreeze(context, r1, r2, (_refs$globalCache$fre3 = refs.globalCache.freezen) === null || _refs$globalCache$fre3 === void 0 ? void 0 : _refs$globalCache$fre3[context.currentSheetId]))
    });
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    style: {
      height: context.rh_height,
      width: 1
    },
    id: "luckysheetrowHeader_0",
    className: "luckysheetsheetchange"
  }));
};

var ContentEditable = function ContentEditable(_ref) {
  var props = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
  var lastHtml = React.useRef("");
  var root = React.useRef(null);
  var autoFocus = props.autoFocus,
    initialContent = props.initialContent,
    onChange = props.onChange;
  React.useEffect(function () {
    if (autoFocus) {
      var _root$current;
      (_root$current = root.current) === null || _root$current === void 0 ? void 0 : _root$current.focus();
    }
  }, [autoFocus]);
  React.useEffect(function () {
    if (initialContent && root.current != null) {
      root.current.innerHTML = initialContent;
    }
  }, [initialContent]);
  var fnEmitChange = React.useCallback(function (__, isBlur) {
    var html;
    if (root.current != null) {
      html = root.current.innerHTML;
    }
    if (onChange && html !== lastHtml.current) {
      onChange(html || "", isBlur);
    }
    lastHtml.current = html || "";
  }, [root, onChange]);
  var innerRef = props.innerRef,
    _onBlur = props.onBlur;
  var allowEdit = props.allowEdit;
  if (___default['default'].isNil(allowEdit)) allowEdit = true;
  return /*#__PURE__*/React__default['default'].createElement("div", _objectSpread2(_objectSpread2({
    onDoubleClick: function onDoubleClick(e) {
      return e.stopPropagation();
    },
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, ___default['default'].omit(props, "innerRef", "onChange", "html", "onBlur", "autoFocus", "allowEdit", "initialContent")), {}, {
    ref: function ref(e) {
      root.current = e;
      innerRef === null || innerRef === void 0 ? void 0 : innerRef(e);
    },
    tabIndex: 0,
    onInput: fnEmitChange,
    onBlur: function onBlur(e) {
      fnEmitChange(null, true);
      _onBlur === null || _onBlur === void 0 ? void 0 : _onBlur(e);
    },
    contentEditable: allowEdit
  }));
};

var FormulaSearch = function FormulaSearch(props) {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context;
  if (___default['default'].isEmpty(context.functionCandidates)) return null;
  return /*#__PURE__*/React__default['default'].createElement("div", _objectSpread2(_objectSpread2({}, props), {}, {
    id: "luckysheet-formula-search-c",
    className: "luckysheet-formula-search-c"
  }), context.functionCandidates.map(function (v, index) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: v.n,
      "data-func": v.n,
      className: "luckysheet-formula-search-item ".concat(index === 0 ? "luckysheet-formula-search-item-active" : "")
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-formula-search-func"
    }, v.n), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-formula-search-detail"
    }, v.d));
  }));
};

var FormulaHint = function FormulaHint(props) {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context;
  var _locale = core.locale(context),
    formulaMore = _locale.formulaMore;
  if (!context.functionHint) return null;
  var fn = context.formulaCache.functionlistMap[context.functionHint];
  if (!fn) return null;
  return /*#__PURE__*/React__default['default'].createElement("div", _objectSpread2(_objectSpread2({}, props), {}, {
    id: "luckysheet-formula-help-c",
    className: "luckysheet-formula-help-c"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-close",
    title: "\u5173\u95ED"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "fa fa-times",
    "aria-hidden": "true"
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-collapse",
    title: "\u6536\u8D77"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "fa fa-angle-up",
    "aria-hidden": "true"
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-title"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-title-formula"
  }, /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-help-function-name"
  }, fn.n), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-paren"
  }, "("), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-parameter-holder"
  }, fn.p.map(function (param, i) {
    var name = param.name;
    if (param.repeat === "y") {
      name += ", ...";
    }
    if (param.require === "o") {
      name = "[".concat(name, "]");
    }
    return /*#__PURE__*/React__default['default'].createElement("span", {
      className: "luckysheet-arguments-help-parameter",
      dir: "auto",
      key: name
    }, name, i !== fn.p.length - 1 && ", ");
  })), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-paren"
  }, ")"))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-content"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-content-example"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-arguments-help-section-title"
  }, formulaMore.helpExample), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-arguments-help-formula"
  }, /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-help-function-name"
  }, fn.n), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-paren"
  }, "("), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-parameter-holder"
  }, fn.p.map(function (param, i) {
    return /*#__PURE__*/React__default['default'].createElement("span", {
      key: param.name,
      className: "luckysheet-arguments-help-parameter",
      dir: "auto"
    }, param.example, i !== fn.p.length - 1 && ", ");
  })), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-paren"
  }, ")"))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-content-detail"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-arguments-help-section"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-arguments-help-section-title luckysheet-arguments-help-parameter-name"
  }, formulaMore.helpAbstract), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-arguments-help-parameter-content"
  }, fn.d))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-content-param"
  }, fn.p.map(function (param) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-arguments-help-section",
      key: param.name
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-arguments-help-section-title"
    }, param.name, param.repeat === "y" && (/*#__PURE__*/React__default['default'].createElement("span", {
      className: "luckysheet-arguments-help-argument-info"
    }, "...-", formulaMore.allowRepeatText)), param.require === "o" && (/*#__PURE__*/React__default['default'].createElement("span", {
      className: "luckysheet-arguments-help-argument-info"
    }, "-[", formulaMore.allowOptionText, "]"))), /*#__PURE__*/React__default['default'].createElement("span", {
      className: "luckysheet-arguments-help-parameter-content"
    }, param.detail));
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-formula-help-foot"
  }));
};

function usePrevious(value) {
  var ref = React.useRef(null);
  React.useEffect(function () {
    ref.current = value;
  }, [value]);
  return ref.current;
}

var InputBox = function InputBox() {
  var _context$luckysheet_s, _context$rangeDialog;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var inputRef = React.useRef(null);
  var lastKeyDownEventRef = React.useRef(null);
  var prevCellUpdate = usePrevious(context.luckysheetCellUpdate);
  var prevSheetId = usePrevious(context.currentSheetId);
  var _useState = React.useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isHidenRC = _useState2[0],
    setIsHidenRC = _useState2[1];
  var firstSelection = (_context$luckysheet_s = context.luckysheet_select_save) === null || _context$luckysheet_s === void 0 ? void 0 : _context$luckysheet_s[0];
  var row_index = firstSelection === null || firstSelection === void 0 ? void 0 : firstSelection.row_focus;
  var col_index = firstSelection === null || firstSelection === void 0 ? void 0 : firstSelection.column_focus;
  var preText = React.useRef("");
  var inputBoxStyle = React.useMemo(function () {
    if (firstSelection && context.luckysheetCellUpdate.length > 0) {
      var flowdata = core.getFlowdata(context);
      if (!flowdata) return {};
      return core.getStyleByCell(context, flowdata, firstSelection.row_focus, firstSelection.column_focus);
    }
    return {};
  }, [context.luckysheetfile, context.currentSheetId, context.luckysheetCellUpdate, firstSelection]);
  React.useLayoutEffect(function () {
    if (!context.allowEdit) {
      setContext(function (ctx) {
        var flowdata = core.getFlowdata(ctx);
        if (!___default['default'].isNil(flowdata) && ctx.forceFormulaRef) {
          var value = core.getCellValue(row_index, col_index, flowdata, "f");
          core.createRangeHightlight(ctx, value);
        }
      });
    }
    if (firstSelection && context.luckysheetCellUpdate.length > 0) {
      var _flowdata$row_index;
      if (refs.globalCache.doNotUpdateCell) {
        delete refs.globalCache.doNotUpdateCell;
        return;
      }
      if (___default['default'].isEqual(prevCellUpdate, context.luckysheetCellUpdate) && prevSheetId === context.currentSheetId) {
        return;
      }
      var flowdata = core.getFlowdata(context);
      var cell = flowdata === null || flowdata === void 0 ? void 0 : (_flowdata$row_index = flowdata[row_index]) === null || _flowdata$row_index === void 0 ? void 0 : _flowdata$row_index[col_index];
      var value = "";
      if (cell && !refs.globalCache.overwriteCell) {
        if (core.isInlineStringCell(cell)) {
          value = core.getInlineStringHTML(row_index, col_index, flowdata);
        } else if (cell.f) {
          value = core.getCellValue(row_index, col_index, flowdata, "f");
          setContext(function (ctx) {
            core.createRangeHightlight(ctx, value);
          });
        } else {
          value = core.valueShowEs(row_index, col_index, flowdata);
          if (Number(cell.qp) === 1) {
            value = value ? "".concat(value) : value;
          }
        }
      }
      refs.globalCache.overwriteCell = false;
      if (!refs.globalCache.ignoreWriteCell) inputRef.current.innerHTML = core.escapeHTMLTag(core.escapeScriptTag(value));
      refs.globalCache.ignoreWriteCell = false;
      if (!refs.globalCache.doNotFocus) {
        setTimeout(function () {
          core.moveToEnd(inputRef.current);
        });
      }
      delete refs.globalCache.doNotFocus;
    }
  }, [context.luckysheetCellUpdate, context.luckysheetfile, context.currentSheetId, firstSelection]);
  React.useEffect(function () {
    if (___default['default'].isEmpty(context.luckysheetCellUpdate)) {
      if (inputRef.current) {
        inputRef.current.innerHTML = "";
      }
    }
  }, [context.luckysheetCellUpdate]);
  React.useEffect(function () {
    setIsHidenRC(core.isShowHidenCR(context));
  }, [context.luckysheet_select_save]);
  var getActiveFormula = React.useCallback(function () {
    return document.querySelector(".luckysheet-formula-search-item-active");
  }, []);
  var clearSearchItemActiveClass = React.useCallback(function () {
    var activeFormula = getActiveFormula();
    if (activeFormula) {
      activeFormula.classList.remove("luckysheet-formula-search-item-active");
    }
  }, [getActiveFormula]);
  var selectActiveFormula = React.useCallback(function (e) {
    var activeFormula = getActiveFormula();
    var formulaNameDiv = activeFormula === null || activeFormula === void 0 ? void 0 : activeFormula.querySelector(".luckysheet-formula-search-func");
    if (formulaNameDiv) {
      var formulaName = formulaNameDiv.textContent;
      var textEditor = document.getElementById("luckysheet-rich-text-editor");
      if (textEditor) {
        var _getrangeseleciton;
        var searchTxt = ((_getrangeseleciton = core.getrangeseleciton()) === null || _getrangeseleciton === void 0 ? void 0 : _getrangeseleciton.textContent) || "";
        var deleteCount = searchTxt.length;
        textEditor.focus();
        var selection = window.getSelection();
        if ((selection === null || selection === void 0 ? void 0 : selection.rangeCount) === 0) return;
        var range = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(0);
        if (deleteCount !== 0 && range) {
          var startOffset = Math.max(range.startOffset - deleteCount, 0);
          var endOffset = range.startOffset;
          range.setStart(range.startContainer, startOffset);
          range.setEnd(range.startContainer, endOffset);
          range.deleteContents();
        }
        var functionStr = "<span dir=\"auto\" class=\"luckysheet-formula-text-func\">".concat(formulaName, "</span>");
        var lParStr = "<span dir=\"auto\" class=\"luckysheet-formula-text-lpar\">(</span>";
        var functionNode = new DOMParser().parseFromString(functionStr, "text/html").body.childNodes[0];
        var lParNode = new DOMParser().parseFromString(lParStr, "text/html").body.childNodes[0];
        if (range === null || range === void 0 ? void 0 : range.startContainer.parentNode) {
          range === null || range === void 0 ? void 0 : range.setStart(range.startContainer.parentNode, 1);
        }
        range === null || range === void 0 ? void 0 : range.insertNode(lParNode);
        range === null || range === void 0 ? void 0 : range.insertNode(functionNode);
        range === null || range === void 0 ? void 0 : range.collapse();
        selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
        if (range) selection === null || selection === void 0 ? void 0 : selection.addRange(range);
        setContext(function (draftCtx) {
          draftCtx.functionCandidates = [];
          draftCtx.functionHint = formulaName;
        });
      }
      e.preventDefault();
      e.stopPropagation();
    }
  }, [getActiveFormula, setContext]);
  var onKeyDown = React.useCallback(function (e) {
    lastKeyDownEventRef.current = new KeyboardEvent(e.type, e.nativeEvent);
    preText.current = inputRef.current.innerText;
    if (e.key === "Escape" && context.luckysheetCellUpdate.length > 0) {
      setContext(function (draftCtx) {
        core.cancelNormalSelected(draftCtx);
        core.moveHighlightCell(draftCtx, "down", 0, "rangeOfSelect");
      });
      e.preventDefault();
    } else if (e.key === "Enter" && context.luckysheetCellUpdate.length > 0) {
      if (e.altKey || e.metaKey) {
        document.execCommand("insertHTML", false, "\n ");
        document.execCommand("delete", false);
        e.stopPropagation();
      } else selectActiveFormula(e);
    } else if (e.key === "Tab" && context.luckysheetCellUpdate.length > 0) {
      selectActiveFormula(e);
      e.preventDefault();
    } else if (e.key === "F4" && context.luckysheetCellUpdate.length > 0) {
      e.preventDefault();
    } else if (e.key === "ArrowUp" && context.luckysheetCellUpdate.length > 0) {
      if (document.getElementById("luckysheet-formula-search-c")) {
        var formulaSearchContainer = document.getElementById("luckysheet-formula-search-c");
        var activeItem = formulaSearchContainer === null || formulaSearchContainer === void 0 ? void 0 : formulaSearchContainer.querySelector(".luckysheet-formula-search-item-active");
        var previousItem = activeItem ? activeItem.previousElementSibling : null;
        if (!previousItem) {
          previousItem = (formulaSearchContainer === null || formulaSearchContainer === void 0 ? void 0 : formulaSearchContainer.querySelector(".luckysheet-formula-search-item:last-child")) || null;
        }
        clearSearchItemActiveClass();
        if (previousItem) {
          previousItem.classList.add("luckysheet-formula-search-item-active");
        }
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown" && context.luckysheetCellUpdate.length > 0) {
      if (document.getElementById("luckysheet-formula-search-c")) {
        var _formulaSearchContainer = document.getElementById("luckysheet-formula-search-c");
        var _activeItem = _formulaSearchContainer === null || _formulaSearchContainer === void 0 ? void 0 : _formulaSearchContainer.querySelector(".luckysheet-formula-search-item-active");
        var nextItem = _activeItem ? _activeItem.nextElementSibling : null;
        if (!nextItem) {
          nextItem = (_formulaSearchContainer === null || _formulaSearchContainer === void 0 ? void 0 : _formulaSearchContainer.querySelector(".luckysheet-formula-search-item:first-child")) || null;
        }
        clearSearchItemActiveClass();
        if (nextItem) {
          nextItem.classList.add("luckysheet-formula-search-item-active");
        }
      }
      e.preventDefault();
    }
  }, [clearSearchItemActiveClass, context.luckysheetCellUpdate.length, selectActiveFormula, setContext]);
  var onChange = React.useCallback(function (__, isBlur) {
    var e = lastKeyDownEventRef.current;
    if (!e) return;
    var kcode = e.keyCode;
    if (!kcode) return;
    if (!(kcode >= 112 && kcode <= 123 || kcode <= 46 || kcode === 144 || kcode === 108 || e.ctrlKey || e.altKey || e.shiftKey && (kcode === 37 || kcode === 38 || kcode === 39 || kcode === 40)) || kcode === 8 || kcode === 32 || kcode === 46 || e.ctrlKey && kcode === 86) {
      setContext(function (draftCtx) {
        if ((draftCtx.formulaCache.rangestart || draftCtx.formulaCache.rangedrag_column_start || draftCtx.formulaCache.rangedrag_row_start || core.israngeseleciton(draftCtx)) && isBlur) return;
        if (!core.isAllowEdit(draftCtx, draftCtx.luckysheet_select_save)) {
          return;
        }
        core.handleFormulaInput(draftCtx, refs.fxInput.current, refs.cellInput.current, kcode, preText.current);
      });
    }
  }, [refs.cellInput, refs.fxInput, setContext]);
  var onPaste = React.useCallback(function (e) {
    if (___default['default'].isEmpty(context.luckysheetCellUpdate)) {
      e.preventDefault();
    }
  }, [context.luckysheetCellUpdate]);
  var cfg = context.config || {};
  var rowReadOnly = cfg.rowReadOnly || {};
  var colReadOnly = cfg.colReadOnly || {};
  var edit = !((colReadOnly[col_index] || rowReadOnly[row_index]) && context.allowEdit === true);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-input-box",
    style: firstSelection && !((_context$rangeDialog = context.rangeDialog) === null || _context$rangeDialog === void 0 ? void 0 : _context$rangeDialog.show) ? {
      left: firstSelection.left,
      top: firstSelection.top,
      zIndex: ___default['default'].isEmpty(context.luckysheetCellUpdate) ? -1 : 19,
      display: "block"
    } : {
      left: -10000,
      top: -10000,
      display: "block"
    },
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onMouseUp: function onMouseUp(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-input-box-inner",
    style: firstSelection ? _objectSpread2({
      minWidth: (firstSelection === null || firstSelection === void 0 ? void 0 : firstSelection.width) || 0,
      minHeight: (firstSelection === null || firstSelection === void 0 ? void 0 : firstSelection.height) || 0
    }, inputBoxStyle) : {}
  }, /*#__PURE__*/React__default['default'].createElement(ContentEditable, {
    innerRef: function innerRef(e) {
      inputRef.current = e;
      refs.cellInput.current = e;
    },
    className: "luckysheet-cell-input",
    id: "luckysheet-rich-text-editor",
    style: {
      transform: "scale(".concat(context.zoomRatio, ")"),
      transformOrigin: "left top",
      width: "".concat(100 / context.zoomRatio, "%"),
      height: "".concat(100 / context.zoomRatio, "%")
    },
    onChange: onChange,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    allowEdit: edit ? !isHidenRC : edit
  })), document.activeElement === inputRef.current && (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement(FormulaSearch, {
    style: {
      top: ((firstSelection === null || firstSelection === void 0 ? void 0 : firstSelection.height_move) || 0) + 4
    }
  }), /*#__PURE__*/React__default['default'].createElement(FormulaHint, {
    style: {
      top: ((firstSelection === null || firstSelection === void 0 ? void 0 : firstSelection.height_move) || 0) + 4
    }
  }))));
};

var ScrollBar = function ScrollBar(_ref) {
  var axis = _ref.axis;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    refs = _useContext.refs,
    setContext = _useContext.setContext;
  React.useEffect(function () {
    if (axis === "x") {
      refs.scrollbarX.current.scrollLeft = context.scrollLeft;
    } else {
      refs.scrollbarY.current.scrollTop = context.scrollTop;
    }
  }, [axis === "x" ? context.scrollLeft : context.scrollTop]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    ref: axis === "x" ? refs.scrollbarX : refs.scrollbarY,
    style: axis === "x" ? {
      left: context.rowHeaderWidth,
      width: "calc(100% - ".concat(context.rowHeaderWidth, "px)")
    } : {
      height: "100%"
    },
    className: "luckysheet-scrollbars luckysheet-scrollbar-ltr luckysheet-scrollbar-".concat(axis),
    onScroll: function onScroll() {
      if (axis === "x") {
        setContext(function (draftCtx) {
          draftCtx.scrollLeft = refs.scrollbarX.current.scrollLeft;
        });
      } else {
        setContext(function (draftCtx) {
          draftCtx.scrollTop = refs.scrollbarY.current.scrollTop;
        });
      }
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    style: axis === "x" ? {
      width: context.ch_width,
      height: 10
    } : {
      width: 10,
      height: context.rh_height
    }
  }));
};

var Dialog = function Dialog(_ref) {
  var type = _ref.type,
    onOk = _ref.onOk,
    onCancel = _ref.onCancel,
    children = _ref.children,
    containerStyle = _ref.containerStyle,
    contentStyle = _ref.contentStyle;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context;
  var _locale = core.locale(context),
    button = _locale.button;
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-dialog",
    style: containerStyle
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-modal-dialog-header"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-modal-dialog-icon-close",
    onClick: onCancel,
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "close",
    style: {
      padding: 7,
      cursor: "pointer"
    }
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-dialog-box-content",
    style: contentStyle
  }, children), type != null && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-dialog-box-button-container"
  }, type === "ok" ? (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-message-box-button button-default",
    onClick: onOk,
    tabIndex: 0
  }, button.confirm)) : (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-message-box-button button-primary",
    onClick: onOk,
    tabIndex: 0
  }, button.confirm), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-message-box-button button-default",
    onClick: onCancel,
    tabIndex: 0
  }, button.cancel))))));
};

var MessageBox = function MessageBox(_ref) {
  var _ref$type = _ref.type,
    type = _ref$type === void 0 ? "yesno" : _ref$type,
    onOk = _ref.onOk,
    onCancel = _ref.onCancel,
    children = _ref.children;
  return /*#__PURE__*/React__default['default'].createElement(Dialog, {
    type: type,
    onOk: onOk,
    onCancel: onCancel,
    contentStyle: {
      width: 300,
      paddingTop: 20,
      paddingBottom: 30,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }
  }, children);
};

var ModalContext = /*#__PURE__*/React__default['default'].createContext({
  component: null,
  showModal: function showModal() {},
  hideModal: function hideModal() {}
});
var ModalProvider = function ModalProvider(_ref) {
  var children = _ref.children;
  var _useState = React.useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    component = _useState2[0],
    setComponent = _useState2[1];
  var showModal = React.useCallback(function (c) {
    setComponent(c);
  }, []);
  var hideModal = React.useCallback(function () {
    setComponent(null);
  }, []);
  var providerValue = React.useMemo(function () {
    return {
      component: null,
      showModal: showModal,
      hideModal: hideModal
    };
  }, [hideModal, showModal]);
  return /*#__PURE__*/React__default['default'].createElement(ModalContext.Provider, {
    value: providerValue
  }, children, component && (/*#__PURE__*/React__default['default'].createElement("div", {
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onMouseMove: function onMouseMove(e) {
      return e.stopPropagation();
    },
    onMouseUp: function onMouseUp(e) {
      return e.stopPropagation();
    },
    onContextMenu: function onContextMenu(e) {
      return e.stopPropagation();
    },
    className: "fortune-popover-backdrop fortune-modal-container"
  }, component)));
};

function useAlert() {
  var _useContext = React.useContext(ModalContext),
    showModal = _useContext.showModal,
    hideModal = _useContext.hideModal;
  var showAlert = React.useCallback(function (message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ok";
    var onOk = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : hideModal;
    var onCancel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : hideModal;
    showModal(/*#__PURE__*/React__default['default'].createElement(MessageBox, {
      type: type,
      onOk: onOk,
      onCancel: onCancel
    }, message));
  }, [hideModal, showModal]);
  return {
    showAlert: showAlert,
    hideAlert: hideModal
  };
}

var SearchReplace = function SearchReplace(_ref) {
  var getContainer = _ref.getContainer;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var _locale = core.locale(context),
    findAndReplace = _locale.findAndReplace,
    button = _locale.button;
  var _useState = React.useState(""),
    _useState2 = _slicedToArray(_useState, 2),
    searchText = _useState2[0],
    setSearchText = _useState2[1];
  var _useState3 = React.useState(""),
    _useState4 = _slicedToArray(_useState3, 2),
    replaceText = _useState4[0],
    setReplaceText = _useState4[1];
  var _useState5 = React.useState(context.showReplace),
    _useState6 = _slicedToArray(_useState5, 2),
    showReplace = _useState6[0],
    setShowReplace = _useState6[1];
  var _useState7 = React.useState([]),
    _useState8 = _slicedToArray(_useState7, 2),
    searchResult = _useState8[0],
    setSearchResult = _useState8[1];
  var _useState9 = React.useState(),
    _useState0 = _slicedToArray(_useState9, 2),
    selectedCell = _useState0[0],
    setSelectedCell = _useState0[1];
  var _useAlert = useAlert(),
    showAlert = _useAlert.showAlert;
  var _useState1 = React.useState({
      regCheck: false,
      wordCheck: false,
      caseCheck: false
    }),
    _useState10 = _slicedToArray(_useState1, 2),
    checkMode = _useState10[0],
    checkModeReplace = _useState10[1];
  var closeDialog = React.useCallback(function () {
    ___default['default'].set(refs.globalCache, "searchDialog.mouseEnter", false);
    setContext(function (draftCtx) {
      draftCtx.showSearch = false;
      draftCtx.showReplace = false;
    });
  }, [refs.globalCache, setContext]);
  var setCheckMode = React.useCallback(function (mode, value) {
    return checkModeReplace(produce__default['default'](function (draft) {
      ___default['default'].set(draft, mode, value);
    }));
  }, []);
  var getInitialPosition = React.useCallback(function (container) {
    var rect = container.getBoundingClientRect();
    return {
      left: (rect.width - 500) / 2,
      top: (rect.height - 200) / 3
    };
  }, []);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-search-replace",
    className: "fortune-search-replace fortune-dialog",
    style: getInitialPosition(getContainer()),
    onMouseEnter: function onMouseEnter() {
      ___default['default'].set(refs.globalCache, "searchDialog.mouseEnter", true);
    },
    onMouseLeave: function onMouseLeave() {
      ___default['default'].set(refs.globalCache, "searchDialog.mouseEnter", false);
    },
    onMouseDown: function onMouseDown(e) {
      var nativeEvent = e.nativeEvent;
      core.onSearchDialogMoveStart(refs.globalCache, nativeEvent, getContainer());
      e.stopPropagation();
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "container",
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "icon-close fortune-modal-dialog-icon-close",
    onClick: closeDialog,
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "close",
    style: {
      padding: 7,
      cursor: "pointer"
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "tabBox"
  }, /*#__PURE__*/React__default['default'].createElement("span", {
    id: "searchTab",
    className: showReplace ? "" : "on",
    onClick: function onClick() {
      return setShowReplace(false);
    },
    tabIndex: 0
  }, findAndReplace.find), /*#__PURE__*/React__default['default'].createElement("span", {
    id: "replaceTab",
    className: showReplace ? "on" : "",
    onClick: function onClick() {
      return setShowReplace(true);
    },
    tabIndex: 0
  }, findAndReplace.replace)), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "ctBox"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "row"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "inputBox"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "textboxs",
    id: "searchInput"
  }, findAndReplace.findTextbox, "\uFF1A", /*#__PURE__*/React__default['default'].createElement("input", {
    className: "formulaInputFocus",
    autoFocus: true,
    spellCheck: "false",
    onKeyDown: function onKeyDown(e) {
      return e.stopPropagation();
    },
    value: searchText,
    onChange: function onChange(e) {
      return setSearchText(e.target.value);
    }
  })), showReplace && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "textboxs",
    id: "replaceInput"
  }, findAndReplace.replaceTextbox, "\uFF1A", /*#__PURE__*/React__default['default'].createElement("input", {
    className: "formulaInputFocus",
    spellCheck: "false",
    onKeyDown: function onKeyDown(e) {
      return e.stopPropagation();
    },
    value: replaceText,
    onChange: function onChange(e) {
      return setReplaceText(e.target.value);
    }
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "checkboxs"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    id: "regCheck"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "checkbox",
    onChange: function onChange(e) {
      return setCheckMode("regCheck", e.target.checked);
    }
  }), /*#__PURE__*/React__default['default'].createElement("span", null, findAndReplace.regexTextbox)), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "wordCheck"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "checkbox",
    onChange: function onChange(e) {
      return setCheckMode("wordCheck", e.target.checked);
    }
  }), /*#__PURE__*/React__default['default'].createElement("span", null, findAndReplace.wholeTextbox)), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "caseCheck"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "checkbox",
    onChange: function onChange(e) {
      return setCheckMode("caseCheck", e.target.checked);
    }
  }), /*#__PURE__*/React__default['default'].createElement("span", null, findAndReplace.distinguishTextbox)))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "btnBox"
  }, showReplace && (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement("div", {
    id: "replaceAllBtn",
    className: "fortune-message-box-button button-default",
    onClick: function onClick() {
      setContext(function (draftCtx) {
        setSelectedCell(undefined);
        var alertMsg = core.replaceAll(draftCtx, searchText, replaceText, checkMode);
        showAlert(alertMsg);
      });
    },
    tabIndex: 0
  }, findAndReplace.allReplaceBtn), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "replaceBtn",
    className: "fortune-message-box-button button-default",
    onClick: function onClick() {
      return setContext(function (draftCtx) {
        setSelectedCell(undefined);
        var alertMsg = core.replace(draftCtx, searchText, replaceText, checkMode);
        if (alertMsg != null) {
          showAlert(alertMsg);
        }
      });
    },
    tabIndex: 0
  }, findAndReplace.replaceBtn))), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "searchAllBtn",
    className: "fortune-message-box-button button-default",
    onClick: function onClick() {
      return setContext(function (draftCtx) {
        setSelectedCell(undefined);
        if (!searchText) return;
        var res = core.searchAll(draftCtx, searchText, checkMode);
        setSearchResult(res);
        if (___default['default'].isEmpty(res)) showAlert(findAndReplace.noFindTip);
      });
    },
    tabIndex: 0
  }, findAndReplace.allFindBtn), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "searchNextBtn",
    className: "fortune-message-box-button button-default",
    onClick: function onClick() {
      return setContext(function (draftCtx) {
        setSearchResult([]);
        var alertMsg = core.searchNext(draftCtx, searchText, checkMode);
        if (alertMsg != null) showAlert(alertMsg);
      });
    },
    tabIndex: 0
  }, findAndReplace.findBtn))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "close-button fortune-message-box-button button-default",
    onClick: closeDialog,
    tabIndex: 0
  }, button.close), searchResult.length > 0 && (/*#__PURE__*/React__default['default'].createElement("div", {
    id: "searchAllbox"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "boxTitle"
  }, /*#__PURE__*/React__default['default'].createElement("span", null, findAndReplace.searchTargetSheet), /*#__PURE__*/React__default['default'].createElement("span", null, findAndReplace.searchTargetCell), /*#__PURE__*/React__default['default'].createElement("span", null, findAndReplace.searchTargetValue)), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "boxMain"
  }, searchResult.map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "boxItem ".concat(___default['default'].isEqual(selectedCell, {
        r: v.r,
        c: v.c
      }) ? "on" : ""),
      key: v.cellPosition,
      onClick: function onClick() {
        setContext(function (draftCtx) {
          draftCtx.luckysheet_select_save = core.normalizeSelection(draftCtx, [{
            row: [v.r, v.r],
            column: [v.c, v.c]
          }]);
          core.scrollToHighlightCell(draftCtx, v.r, v.c);
        });
        setSelectedCell({
          r: v.r,
          c: v.c
        });
      },
      tabIndex: 0
    }, /*#__PURE__*/React__default['default'].createElement("span", null, v.sheetName), /*#__PURE__*/React__default['default'].createElement("span", null, v.cellPosition), /*#__PURE__*/React__default['default'].createElement("span", null, v.value));
  }))))));
};

var LinkEditCard = function LinkEditCard(_ref) {
  var r = _ref.r,
    c = _ref.c,
    rc = _ref.rc,
    originText = _ref.originText,
    originType = _ref.originType,
    originAddress = _ref.originAddress,
    isEditing = _ref.isEditing,
    position = _ref.position,
    selectingCellRange = _ref.selectingCellRange;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var _useState = React.useState(originText),
    _useState2 = _slicedToArray(_useState, 2),
    linkText = _useState2[0],
    setLinkText = _useState2[1];
  var _useState3 = React.useState(originAddress),
    _useState4 = _slicedToArray(_useState3, 2),
    linkAddress = _useState4[0],
    setLinkAddress = _useState4[1];
  var _useState5 = React.useState(originType),
    _useState6 = _slicedToArray(_useState5, 2),
    linkType = _useState6[0],
    setLinkType = _useState6[1];
  var _locale = core.locale(context),
    insertLink = _locale.insertLink,
    linkTypeList = _locale.linkTypeList,
    button = _locale.button;
  var lastCell = React.useRef(core.normalizeSelection(context, [{
    row: [r, r],
    column: [c, c]
  }]));
  var skipCellRangeSet = React.useRef(true);
  var isLinkAddressValid = core.isLinkValid(context, linkType, linkAddress);
  var tooltip = /*#__PURE__*/React__default['default'].createElement("div", {
    className: "validation-input-tip"
  }, isLinkAddressValid.tooltip);
  var hideLinkCard = React.useCallback(function () {
    ___default['default'].set(refs.globalCache, "linkCard.mouseEnter", false);
    setContext(function (draftCtx) {
      draftCtx.linkCard = undefined;
    });
  }, [refs.globalCache, setContext]);
  var setRangeModalVisible = React.useCallback(function (visible) {
    return setContext(function (draftCtx) {
      draftCtx.luckysheet_select_save = lastCell.current;
      if (draftCtx.linkCard != null) draftCtx.linkCard.selectingCellRange = visible;
    });
  }, [setContext]);
  var containerEvent = React.useMemo(function () {
    return {
      onMouseEnter: function onMouseEnter() {
        return ___default['default'].set(refs.globalCache, "linkCard.mouseEnter", true);
      },
      onMouseLeave: function onMouseLeave() {
        return ___default['default'].set(refs.globalCache, "linkCard.mouseEnter", false);
      },
      onMouseDown: function onMouseDown(e) {
        return e.stopPropagation();
      },
      onMouseMove: function onMouseMove(e) {
        return e.stopPropagation();
      },
      onMouseUp: function onMouseUp(e) {
        return e.stopPropagation();
      },
      onKeyDown: function onKeyDown(e) {
        return e.stopPropagation();
      },
      onDoubleClick: function onDoubleClick(e) {
        return e.stopPropagation();
      }
    };
  }, [refs.globalCache]);
  var renderBottomButton = React.useCallback(function (onOk, onCancel) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "button-group"
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "button-basic button-default",
      onClick: onCancel,
      tabIndex: 0
    }, button.cancel), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "button-basic button-primary",
      onClick: onOk,
      tabIndex: 0
    }, button.confirm));
  }, [button]);
  var renderToolbarButton = React.useCallback(function (iconId, onClick) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-toolbar-button",
      onClick: onClick,
      tabIndex: 0
    }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
      name: iconId,
      style: {
        width: 18,
        height: 18
      }
    }));
  }, []);
  React.useLayoutEffect(function () {
    setLinkAddress(originAddress);
    setLinkText(originText);
    setLinkType(originType);
  }, [rc, originAddress, originText, originType]);
  React.useLayoutEffect(function () {
    if (selectingCellRange) {
      skipCellRangeSet.current = true;
    }
  }, [selectingCellRange]);
  React.useLayoutEffect(function () {
    if (skipCellRangeSet.current) {
      skipCellRangeSet.current = false;
      return;
    }
    if (selectingCellRange) {
      var len = ___default['default'].size(context.luckysheet_select_save);
      if (len > 0) {
        setLinkAddress(core.getRangetxt(context, context.currentSheetId, context.luckysheet_select_save[len - 1], ""));
      }
    }
  }, [context, selectingCellRange]);
  if (!isEditing) {
    return /*#__PURE__*/React__default['default'].createElement("div", _objectSpread2(_objectSpread2({}, containerEvent), {}, {
      onKeyDown: function onKeyDown(e) {
        e.stopPropagation();
      },
      className: "fortune-link-modify-modal link-toolbar",
      style: {
        left: position.cellLeft + 20,
        top: position.cellBottom
      }
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "link-content",
      onClick: function onClick() {
        setContext(function (draftCtx) {
          return core.goToLink(draftCtx, r, c, linkType, linkAddress, refs.scrollbarX.current, refs.scrollbarY.current);
        });
      },
      tabIndex: 0
    }, linkType === "webpage" ? insertLink.openLink : core.replaceHtml(insertLink.goTo, {
      linkAddress: linkAddress
    })), context.allowEdit === true && /*#__PURE__*/React__default['default'].createElement("div", {
      className: "divider"
    }), context.allowEdit === true && linkType === "webpage" && renderToolbarButton("copy", function () {
      navigator.clipboard.writeText(originAddress);
      hideLinkCard();
    }), context.allowEdit === true && renderToolbarButton("pencil", function () {
      return setContext(function (draftCtx) {
        if (draftCtx.linkCard != null && draftCtx.allowEdit) {
          draftCtx.linkCard.isEditing = true;
        }
      });
    }), context.allowEdit === true && /*#__PURE__*/React__default['default'].createElement("div", {
      className: "divider"
    }), context.allowEdit === true && renderToolbarButton("unlink", function () {
      return setContext(function (draftCtx) {
        ___default['default'].set(refs.globalCache, "linkCard.mouseEnter", false);
        core.removeHyperlink(draftCtx, r, c);
      });
    }));
  }
  return selectingCellRange ? (/*#__PURE__*/React__default['default'].createElement("div", _objectSpread2(_objectSpread2({
    className: "fortune-link-modify-modal range-selection-modal",
    style: {
      left: position.cellLeft,
      top: position.cellBottom + 5
    }
  }, ___default['default'].omit(containerEvent, ["onMouseDown", "onMouseMove", "onMouseUp"])), {}, {
    onMouseDown: function onMouseDown(e) {
      var nativeEvent = e.nativeEvent;
      core.onRangeSelectionModalMoveStart(context, refs.globalCache, nativeEvent);
      e.stopPropagation();
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "modal-icon-close",
    onClick: function onClick() {
      return setRangeModalVisible(false);
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "close"
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "modal-title"
  }, insertLink.selectCellRange), /*#__PURE__*/React__default['default'].createElement("input", _objectSpread2(_objectSpread2({}, containerEvent), {}, {
    className: "range-selection-input ".concat(!linkAddress || isLinkAddressValid.isValid ? "" : "error-input"),
    placeholder: insertLink.cellRangePlaceholder,
    onChange: function onChange(e) {
      return setLinkAddress(e.target.value);
    },
    value: linkAddress
  })), tooltip, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "modal-footer"
  }, renderBottomButton(function () {
    if (isLinkAddressValid.isValid) setRangeModalVisible(false);
  }, function () {
    setLinkAddress(originAddress);
    setRangeModalVisible(false);
  })))) : (/*#__PURE__*/React__default['default'].createElement("div", _objectSpread2({
    className: "fortune-link-modify-modal",
    style: {
      left: position.cellLeft + 20,
      top: position.cellBottom
    }
  }, containerEvent), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-line"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-title"
  }, insertLink.linkText), /*#__PURE__*/React__default['default'].createElement("input", {
    className: "fortune-link-modify-input",
    spellCheck: "false",
    autoFocus: true,
    value: linkText,
    onChange: function onChange(e) {
      return setLinkText(e.target.value);
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-line"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-title"
  }, insertLink.linkType), /*#__PURE__*/React__default['default'].createElement("select", {
    className: "fortune-link-modify-select",
    value: linkType,
    onChange: function onChange(e) {
      if (e.target.value === "sheet") {
        if (!linkText) {
          setLinkText(context.luckysheetfile[0].name);
        }
        setLinkAddress(context.luckysheetfile[0].name);
      } else {
        setLinkAddress("");
      }
      if (e.target.value === "cellrange") setRangeModalVisible(true);
      setLinkType(e.target.value);
    }
  }, linkTypeList.map(function (type) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      key: type.value,
      value: type.value
    }, type.text);
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-line"
  }, linkType === "webpage" && (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-title"
  }, insertLink.linkAddress), /*#__PURE__*/React__default['default'].createElement("input", {
    className: "fortune-link-modify-input ".concat(!linkAddress || isLinkAddressValid.isValid ? "" : "error-input"),
    spellCheck: "false",
    value: linkAddress,
    onChange: function onChange(e) {
      return setLinkAddress(e.target.value);
    }
  }), tooltip)), linkType === "cellrange" && (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-title"
  }, insertLink.linkCell), /*#__PURE__*/React__default['default'].createElement("input", {
    className: "fortune-link-modify-input ".concat(!linkAddress || isLinkAddressValid.isValid ? "" : "error-input"),
    spellCheck: "false",
    value: linkAddress,
    onChange: function onChange(e) {
      return setLinkAddress(e.target.value);
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-cell-selector",
    onClick: function onClick() {
      return setRangeModalVisible(true);
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "border-all"
  })), tooltip)), linkType === "sheet" && (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-link-modify-title"
  }, insertLink.linkSheet), /*#__PURE__*/React__default['default'].createElement("select", {
    className: "fortune-link-modify-select",
    onChange: function onChange(e) {
      if (!linkText) setLinkText(e.target.value);
      setLinkAddress(e.target.value);
    },
    value: linkAddress
  }, context.luckysheetfile.map(function (sheet) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      key: sheet.id,
      value: sheet.name
    }, sheet.name);
  })), tooltip))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "modal-footer"
  }, renderBottomButton(function () {
    if (!isLinkAddressValid.isValid) return;
    ___default['default'].set(refs.globalCache, "linkCard.mouseEnter", false);
    setContext(function (draftCtx) {
      return core.saveHyperlink(draftCtx, r, c, linkText, linkType, linkAddress);
    });
  }, hideLinkCard))));
};

var FilterOptions = function FilterOptions(_ref) {
  var _refs$globalCache$fre, _refs$globalCache$fre2;
  var getContainer = _ref.getContainer;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var filterOptions = context.filterOptions,
    currentSheetId = context.currentSheetId,
    filter = context.filter,
    visibledatarow = context.visibledatarow,
    visibledatacolumn = context.visibledatacolumn;
  var sheetIndex = core.getSheetIndex(context, context.currentSheetId);
  var _context$luckysheetfi = context.luckysheetfile[sheetIndex],
    filter_select = _context$luckysheetfi.filter_select,
    frozen = _context$luckysheetfi.frozen;
  React.useEffect(function () {
    setContext(function (draftCtx) {
      var sheetIdx = core.getSheetIndex(draftCtx, draftCtx.currentSheetId);
      if (sheetIdx == null) return;
      draftCtx.luckysheet_filter_save = draftCtx.luckysheetfile[sheetIdx].filter_select;
      draftCtx.filter = draftCtx.luckysheetfile[sheetIdx].filter || {};
      core.createFilterOptions(draftCtx, draftCtx.luckysheet_filter_save, undefined);
    });
  }, [visibledatarow, visibledatacolumn, setContext, currentSheetId, filter_select]);
  var showFilterContextMenu = React.useCallback(function (v, i) {
    if (filterOptions == null) return;
    setContext(function (draftCtx) {
      var _draftCtx$filterConte, _draftCtx$filter$i;
      if (((_draftCtx$filterConte = draftCtx.filterContextMenu) === null || _draftCtx$filterConte === void 0 ? void 0 : _draftCtx$filterConte.col) === filterOptions.startCol + i) return;
      draftCtx.filterContextMenu = {
        x: v.left + draftCtx.rowHeaderWidth - refs.scrollbarX.current.scrollLeft,
        y: v.top + 23 + draftCtx.toolbarHeight + draftCtx.calculatebarHeight + draftCtx.columnHeaderHeight - refs.scrollbarY.current.scrollTop,
        col: filterOptions.startCol + i,
        startRow: filterOptions.startRow,
        endRow: filterOptions.endRow,
        startCol: filterOptions.startCol,
        endCol: filterOptions.endCol,
        hiddenRows: ___default['default'].keys((_draftCtx$filter$i = draftCtx.filter[i]) === null || _draftCtx$filter$i === void 0 ? void 0 : _draftCtx$filter$i.rowhidden).map(function (r) {
          return parseInt(r, 10);
        }),
        listBoxMaxHeight: 400
      };
    });
  }, [filterOptions, getContainer, refs.scrollbarX, refs.scrollbarY, setContext]);
  var freezeType = frozen === null || frozen === void 0 ? void 0 : frozen.type;
  var frozenColumns = -1;
  var frozenRows = -1;
  if (freezeType === "row") frozenRows = 0;else if (freezeType === "column") frozenColumns = 0;else if (freezeType === "both") {
    frozenColumns = 0;
    frozenRows = 0;
  } else {
    var _frozen$range, _frozen$range2;
    frozenColumns = (frozen === null || frozen === void 0 ? void 0 : (_frozen$range = frozen.range) === null || _frozen$range === void 0 ? void 0 : _frozen$range.column_focus) || -1;
    frozenRows = (frozen === null || frozen === void 0 ? void 0 : (_frozen$range2 = frozen.range) === null || _frozen$range2 === void 0 ? void 0 : _frozen$range2.row_focus) || -1;
  }
  return filterOptions == null ? (/*#__PURE__*/React__default['default'].createElement("div", null)) : (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-filter-selected-sheet",
    className: "luckysheet-cell-selected luckysheet-filter-selected",
    style: ___default['default'].assign({
      left: filterOptions.left,
      width: filterOptions.width,
      top: filterOptions.top,
      height: filterOptions.height,
      display: "block"
    }, core.fixRowStyleOverflowInFreeze(context, filterOptions.startRow, filterOptions.endRow, (_refs$globalCache$fre = refs.globalCache.freezen) === null || _refs$globalCache$fre === void 0 ? void 0 : _refs$globalCache$fre[context.currentSheetId]), core.fixColumnStyleOverflowInFreeze(context, filterOptions.startCol, filterOptions.endCol, (_refs$globalCache$fre2 = refs.globalCache.freezen) === null || _refs$globalCache$fre2 === void 0 ? void 0 : _refs$globalCache$fre2[context.currentSheetId]))
  }), filterOptions.items.map(function (v, i) {
    var _refs$globalCache$fre3, _refs$globalCache$fre4;
    var filterParam = filter[i];
    var columnOverflowFreezeStyle = core.fixColumnStyleOverflowInFreeze(context, i + filterOptions.startCol, i + filterOptions.startCol, (_refs$globalCache$fre3 = refs.globalCache.freezen) === null || _refs$globalCache$fre3 === void 0 ? void 0 : _refs$globalCache$fre3[context.currentSheetId]);
    var rowOverflowFreezeStyle = core.fixRowStyleOverflowInFreeze(context, filterOptions.startRow, filterOptions.startRow, (_refs$globalCache$fre4 = refs.globalCache.freezen) === null || _refs$globalCache$fre4 === void 0 ? void 0 : _refs$globalCache$fre4[context.currentSheetId]);
    var col = visibledatacolumn[v.col];
    var col_pre = v.col > 0 ? visibledatacolumn[v.col - 1] : 0;
    var left = v.col <= frozenColumns && columnOverflowFreezeStyle.left ? columnOverflowFreezeStyle.left + col - col_pre - 20 : v.left;
    var top = filterOptions.startRow <= frozenRows && rowOverflowFreezeStyle.top ? rowOverflowFreezeStyle.top : v.top;
    var v_adjusted = _objectSpread2(_objectSpread2({}, v), {}, {
      left: left,
      top: top
    });
    return /*#__PURE__*/React__default['default'].createElement("div", {
      onMouseDown: function onMouseDown(e) {
        return e.stopPropagation();
      },
      onClick: function onClick(e) {
        e.stopPropagation();
        showFilterContextMenu(v_adjusted, i);
      },
      onDoubleClick: function onDoubleClick(e) {
        return e.stopPropagation();
      },
      tabIndex: 0,
      key: i,
      style: ___default['default'].assign(rowOverflowFreezeStyle, columnOverflowFreezeStyle, {
        left: left,
        top: top,
        height: undefined,
        width: undefined
      }),
      className: "luckysheet-filter-options ".concat(filterParam == null ? "" : "luckysheet-filter-options-active")
    }, filterParam == null ? (/*#__PURE__*/React__default['default'].createElement("div", {
      className: "caret down"
    })) : (/*#__PURE__*/React__default['default'].createElement(SVGIcon, {
      name: "filter-fill-white",
      style: {
        width: 15,
        height: 15
      }
    })));
  })));
};

var ImgBoxs = function ImgBoxs() {
  var _context$insertedImgs;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var activeImg = React.useMemo(function () {
    return ___default['default'].find(context.insertedImgs, {
      id: context.activeImg
    });
  }, [context.activeImg, context.insertedImgs]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-image-showBoxs"
  }, activeImg && (/*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-modal-dialog-activeImage",
    className: "luckysheet-modal-dialog",
    style: {
      padding: 0,
      position: "absolute",
      zIndex: 300,
      width: activeImg.width * context.zoomRatio,
      height: activeImg.height * context.zoomRatio,
      left: activeImg.left * context.zoomRatio,
      top: activeImg.top * context.zoomRatio
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-modal-dialog-border",
    style: {
      position: "absolute"
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-modal-dialog-content",
    style: {
      width: activeImg.width * context.zoomRatio,
      height: activeImg.height * context.zoomRatio,
      backgroundImage: "url(".concat(activeImg.src, ")"),
      backgroundSize: "".concat(activeImg.width * context.zoomRatio, "px ").concat(activeImg.height * context.zoomRatio, "px"),
      backgroundRepeat: "no-repeat"
    },
    onMouseDown: function onMouseDown(e) {
      var nativeEvent = e.nativeEvent;
      core.onImageMoveStart(context, refs.globalCache, nativeEvent);
      e.stopPropagation();
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-modal-dialog-resize"
  }, ["lt", "mt", "lm", "rm", "rt", "lb", "mb", "rb"].map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: v,
      className: "luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-".concat(v),
      "data-type": v,
      onMouseDown: function onMouseDown(e) {
        var nativeEvent = e.nativeEvent;
        core.onImageResizeStart(refs.globalCache, nativeEvent, v);
        e.stopPropagation();
      }
    });
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-modal-dialog-controll"
  }, /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-modal-controll-btn luckysheet-modal-controll-crop",
    role: "button",
    tabIndex: 0,
    "aria-label": "\u88C1\u526A",
    title: "\u88C1\u526A"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "fa fa-pencil",
    "aria-hidden": "true"
  })), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-modal-controll-btn luckysheet-modal-controll-restore",
    role: "button",
    tabIndex: 0,
    "aria-label": "\u6062\u590D\u539F\u56FE",
    title: "\u6062\u590D\u539F\u56FE"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "fa fa-window-maximize",
    "aria-hidden": "true"
  })), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-modal-controll-btn luckysheet-modal-controll-del",
    role: "button",
    tabIndex: 0,
    "aria-label": "\u5220\u9664",
    title: "\u5220\u9664"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "fa fa-trash",
    "aria-hidden": "true"
  }))))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "img-list"
  }, (_context$insertedImgs = context.insertedImgs) === null || _context$insertedImgs === void 0 ? void 0 : _context$insertedImgs.map(function (v) {
    var id = v.id,
      left = v.left,
      top = v.top,
      width = v.width,
      height = v.height,
      src = v.src;
    if (v.id === context.activeImg) return null;
    return /*#__PURE__*/React__default['default'].createElement("div", {
      id: id,
      key: id,
      className: "luckysheet-modal-dialog luckysheet-modal-dialog-image",
      style: {
        width: width * context.zoomRatio,
        height: height * context.zoomRatio,
        padding: 0,
        position: "absolute",
        left: left * context.zoomRatio,
        top: top * context.zoomRatio,
        zIndex: 200
      },
      onMouseDown: function onMouseDown(e) {
        return e.stopPropagation();
      },
      onClick: function onClick(e) {
        setContext(function (ctx) {
          ctx.activeImg = id;
        });
        e.stopPropagation();
      },
      tabIndex: 0
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-modal-dialog-content",
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative"
      }
    }, /*#__PURE__*/React__default['default'].createElement("img", {
      src: src,
      alt: "",
      style: {
        width: width * context.zoomRatio,
        height: height * context.zoomRatio
      }
    })), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-modal-dialog-border"
    }));
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-modal-dialog-cropping",
    className: "luckysheet-modal-dialog",
    style: {
      display: "none",
      padding: 0,
      position: "absolute",
      zIndex: 300
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "cropping-mask"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "cropping-content"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-modal-dialog-border",
    style: {
      position: "absolute"
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-modal-dialog-resize"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "resize-item lt",
    "data-type": "lt"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "resize-item mt",
    "data-type": "mt"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "resize-item lm",
    "data-type": "lm"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "resize-item rm",
    "data-type": "rm"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "resize-item rt",
    "data-type": "rt"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "resize-item lb",
    "data-type": "lb"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "resize-item mb",
    "data-type": "mb"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "resize-item rb",
    "data-type": "rb"
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-modal-dialog-controll"
  }, /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-modal-controll-btn luckysheet-modal-controll-crop",
    role: "button",
    tabIndex: 0,
    "aria-label": "\u88C1\u526A",
    title: "\u88C1\u526A"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "fa fa-pencil",
    "aria-hidden": "true"
  })), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-modal-controll-btn luckysheet-modal-controll-restore",
    role: "button",
    tabIndex: 0,
    "aria-label": "\u6062\u590D\u539F\u56FE",
    title: "\u6062\u590D\u539F\u56FE"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "fa fa-window-maximize",
    "aria-hidden": "true"
  })), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-modal-controll-btn luckysheet-modal-controll-del",
    role: "button",
    tabIndex: 0,
    "aria-label": "\u5220\u9664",
    title: "\u5220\u9664"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "fa fa-trash",
    "aria-hidden": "true"
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "cell-date-picker"
  }));
};

var NotationBoxes = function NotationBoxes() {
  var _context$commentBoxes;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var flowdata = core.getFlowdata(context);
  React.useEffect(function () {
    if (flowdata) {
      var psShownCells = [];
      for (var i = 0; i < flowdata.length; i += 1) {
        for (var j = 0; j < flowdata[i].length; j += 1) {
          var _cell$ps;
          var cell = flowdata[i][j];
          if (!cell) continue;
          if ((_cell$ps = cell.ps) === null || _cell$ps === void 0 ? void 0 : _cell$ps.isShow) {
            psShownCells.push({
              r: i,
              c: j
            });
          }
        }
      }
      setContext(function (ctx) {
        return core.showComments(ctx, psShownCells);
      });
    }
  }, [flowdata, setContext]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-postil-showBoxs"
  }, ___default['default'].concat((_context$commentBoxes = context.commentBoxes) === null || _context$commentBoxes === void 0 ? void 0 : _context$commentBoxes.filter(function (v) {
    var _context$editingComme;
    return (v === null || v === void 0 ? void 0 : v.rc) !== ((_context$editingComme = context.editingCommentBox) === null || _context$editingComme === void 0 ? void 0 : _context$editingComme.rc);
  }), [context.editingCommentBox, context.hoveredCommentBox]).map(function (commentBox) {
    var _context$editingComme2;
    if (!commentBox) return null;
    var r = commentBox.r,
      c = commentBox.c,
      rc = commentBox.rc,
      left = commentBox.left,
      top = commentBox.top,
      width = commentBox.width,
      height = commentBox.height,
      value = commentBox.value,
      autoFocus = commentBox.autoFocus,
      size = commentBox.size;
    var isEditing = ((_context$editingComme2 = context.editingCommentBox) === null || _context$editingComme2 === void 0 ? void 0 : _context$editingComme2.rc) === rc;
    var commentId = "comment-box-".concat(rc);
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: rc
    }, /*#__PURE__*/React__default['default'].createElement("canvas", {
      id: "arrowCanvas-".concat(rc),
      className: "arrowCanvas",
      width: size.width,
      height: size.height,
      style: {
        position: "absolute",
        left: size.left,
        top: size.top,
        zIndex: 100,
        pointerEvents: "none"
      }
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      id: commentId,
      className: "luckysheet-postil-show-main",
      style: {
        width: width,
        height: height,
        color: "#000",
        padding: 5,
        border: "1px solid #000",
        backgroundColor: "rgb(255,255,225)",
        position: "absolute",
        left: left,
        top: top,
        boxSizing: "border-box",
        zIndex: isEditing ? 200 : 100
      },
      onMouseDown: function onMouseDown(e) {
        var nativeEvent = e.nativeEvent;
        setContext(function (draftContext) {
          if (flowdata) {
            core.setEditingComment(draftContext, flowdata, r, c);
          }
        });
        core.onCommentBoxMoveStart(context, refs.globalCache, nativeEvent, {
          r: r,
          c: c,
          rc: rc
        }, commentId);
        e.stopPropagation();
      }
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-postil-dialog-move"
    }, ["t", "r", "b", "l"].map(function (v) {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: v,
        className: "luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-".concat(v),
        "data-type": v
      });
    })), isEditing && (/*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-postil-dialog-resize"
    }, ["lt", "mt", "lm", "rm", "rt", "lb", "mb", "rb"].map(function (v) {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: v,
        className: "luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-".concat(v),
        "data-type": v,
        onMouseDown: function onMouseDown(e) {
          var nativeEvent = e.nativeEvent;
          core.onCommentBoxResizeStart(context, refs.globalCache, nativeEvent, {
            r: r,
            c: c,
            rc: rc
          }, commentId, v);
          e.stopPropagation();
        }
      });
    }))), /*#__PURE__*/React__default['default'].createElement("div", {
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React__default['default'].createElement(ContentEditable, {
      id: "comment-editor-".concat(rc),
      autoFocus: autoFocus,
      style: {
        width: "100%",
        height: "100%",
        lineHeight: "20px",
        boxSizing: "border-box",
        textAlign: "center",
        wordBreak: "break-all",
        outline: "none"
      },
      allowEdit: context.allowEdit,
      spellCheck: false,
      "data-r": r,
      "data-c": c,
      onKeyDown: function onKeyDown(e) {
        return e.stopPropagation();
      },
      onFocus: function onFocus(e) {
        if (context.allowEdit === false) return;
        refs.globalCache.editingCommentBoxEle = e.target;
      },
      onMouseDown: function onMouseDown(e) {
        setContext(function (draftContext) {
          if (flowdata) {
            core.setEditingComment(draftContext, flowdata, r, c);
          }
        });
        e.stopPropagation();
      },
      onDoubleClick: function onDoubleClick(e) {
        e.stopPropagation();
      },
      initialContent: value
    }))));
  }));
};

function useDialog() {
  var _useContext = React.useContext(ModalContext),
    showModal = _useContext.showModal,
    hideModal = _useContext.hideModal;
  var showDialog = React.useCallback(function (content, type) {
    var onOk = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : hideModal;
    var onCancel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : hideModal;
    showModal(/*#__PURE__*/React__default['default'].createElement(Dialog, {
      type: type,
      onOk: onOk,
      onCancel: onCancel
    }, content));
  }, [hideModal, showModal]);
  return {
    showDialog: showDialog,
    hideDialog: hideModal
  };
}

var DataVerification = function DataVerification() {
  var _context$dataVerifica, _context$dataVerifica2, _context$dataVerifica3, _context$dataVerifica4, _context$dataVerifica5, _context$dataVerifica6, _context$dataVerifica7, _context$dataVerifica8, _context$dataVerifica9, _context$dataVerifica0, _context$dataVerifica1, _context$dataVerifica10, _context$dataVerifica11, _context$dataVerifica12, _context$dataVerifica13, _context$dataVerifica14, _context$dataVerifica15, _context$dataVerifica16, _context$dataVerifica17, _context$dataVerifica18, _context$dataVerifica19, _context$dataVerifica20, _context$dataVerifica21, _context$dataVerifica22, _context$dataVerifica23;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog,
    hideDialog = _useDialog.hideDialog;
  var _locale = core.locale(context),
    dataVerification = _locale.dataVerification,
    toolbar = _locale.toolbar,
    button = _locale.button,
    generalDialog = _locale.generalDialog;
  var _useState = React.useState(["between", "notBetween", "equal", "notEqualTo", "moreThanThe", "lessThan", "greaterOrEqualTo", "lessThanOrEqualTo"]),
    _useState2 = _slicedToArray(_useState, 1),
    numberCondition = _useState2[0];
  var _useState3 = React.useState(["between", "notBetween", "equal", "notEqualTo", "earlierThan", "noEarlierThan", "laterThan", "noLaterThan"]),
    _useState4 = _slicedToArray(_useState3, 1),
    dateCondition = _useState4[0];
  var dataSelectRange = React.useCallback(function (type, value) {
    hideDialog();
    setContext(function (ctx) {
      ctx.rangeDialog.show = true;
      ctx.rangeDialog.type = type;
      ctx.rangeDialog.rangeTxt = value;
    });
  }, [hideDialog, setContext]);
  var btn = React.useCallback(function (type) {
    if (type === "confirm") {
      setContext(function (ctx) {
        var isPass = core.confirmMessage(ctx, generalDialog, dataVerification);
        if (isPass) {
          var _ctx$dataVerification, _ctx$dataVerification2, _ctx$luckysheetfile$g, _range, _range2, _range3, _range4;
          var range = core.getRangeByTxt(ctx, (_ctx$dataVerification = ctx.dataVerification) === null || _ctx$dataVerification === void 0 ? void 0 : (_ctx$dataVerification2 = _ctx$dataVerification.dataRegulation) === null || _ctx$dataVerification2 === void 0 ? void 0 : _ctx$dataVerification2.rangeTxt);
          if (range.length === 0) {
            return;
          }
          var regulation = ctx.dataVerification.dataRegulation;
          var verifacationT = regulation === null || regulation === void 0 ? void 0 : regulation.type;
          var value1 = regulation.value1;
          var item = _objectSpread2(_objectSpread2({}, regulation), {}, {
            checked: false
          });
          if (verifacationT === "dropdown") {
            var list = core.getDropdownList(ctx, value1);
            item.value1 = list.join(",");
          }
          var currentDataVerification = (_ctx$luckysheetfile$g = ctx.luckysheetfile[core.getSheetIndex(ctx, ctx.currentSheetId)].dataVerification) !== null && _ctx$luckysheetfile$g !== void 0 ? _ctx$luckysheetfile$g : {};
          var str = (_range = range[range.length - 1]) === null || _range === void 0 ? void 0 : _range.row[0];
          var edr = (_range2 = range[range.length - 1]) === null || _range2 === void 0 ? void 0 : _range2.row[1];
          var stc = (_range3 = range[range.length - 1]) === null || _range3 === void 0 ? void 0 : _range3.column[0];
          var edc = (_range4 = range[range.length - 1]) === null || _range4 === void 0 ? void 0 : _range4.column[1];
          var d = core.getFlowdata(ctx);
          if (!d || ___default['default'].isNil(str) || ___default['default'].isNil(stc) || ___default['default'].isNil(edr) || ___default['default'].isNil(edc)) return;
          for (var r = str; r <= edr; r += 1) {
            for (var c = stc; c <= edc; c += 1) {
              var key = "".concat(r, "_").concat(c);
              currentDataVerification[key] = item;
              if (regulation.type === "checkbox") {
                core.setCellValue(ctx, r, c, d, item.value2);
              }
            }
          }
          ctx.luckysheetfile[core.getSheetIndex(ctx, ctx.currentSheetId)].dataVerification = currentDataVerification;
        }
      });
    } else if (type === "delete") {
      setContext(function (ctx) {
        var _ctx$dataVerification3, _ctx$dataVerification4, _ctx$luckysheetfile$g2, _range5, _range6, _range7, _range8;
        var range = core.getRangeByTxt(ctx, (_ctx$dataVerification3 = ctx.dataVerification) === null || _ctx$dataVerification3 === void 0 ? void 0 : (_ctx$dataVerification4 = _ctx$dataVerification3.dataRegulation) === null || _ctx$dataVerification4 === void 0 ? void 0 : _ctx$dataVerification4.rangeTxt);
        if (range.length === 0) {
          showDialog(generalDialog.noSeletionError, "ok");
          return;
        }
        var currentDataVerification = (_ctx$luckysheetfile$g2 = ctx.luckysheetfile[core.getSheetIndex(ctx, ctx.currentSheetId)].dataVerification) !== null && _ctx$luckysheetfile$g2 !== void 0 ? _ctx$luckysheetfile$g2 : {};
        var str = (_range5 = range[range.length - 1]) === null || _range5 === void 0 ? void 0 : _range5.row[0];
        var edr = (_range6 = range[range.length - 1]) === null || _range6 === void 0 ? void 0 : _range6.row[1];
        var stc = (_range7 = range[range.length - 1]) === null || _range7 === void 0 ? void 0 : _range7.column[0];
        var edc = (_range8 = range[range.length - 1]) === null || _range8 === void 0 ? void 0 : _range8.column[1];
        if (___default['default'].isNil(str) || ___default['default'].isNil(stc) || ___default['default'].isNil(edr) || ___default['default'].isNil(edc)) return;
        for (var r = str; r <= edr; r += 1) {
          for (var c = stc; c <= edc; c += 1) {
            delete currentDataVerification["".concat(r, "_").concat(c)];
          }
        }
      });
    }
    hideDialog();
  }, [dataVerification, generalDialog, hideDialog, setContext, showDialog]);
  React.useEffect(function () {
    setContext(function (ctx) {
      var _defaultItem$value, _ctx$rangeDialog, _ctx$rangeDialog2;
      var rangeT = "";
      if (ctx.luckysheet_select_save) {
        var range = ctx.luckysheet_select_save[ctx.luckysheet_select_save.length - 1];
        rangeT = core.getRangetxt(context, context.currentSheetId, range, context.currentSheetId);
      }
      var index = core.getSheetIndex(ctx, ctx.currentSheetId);
      var ctxDataVerification = ctx.luckysheetfile[index].dataVerification || {};
      if (!ctx.luckysheet_select_save) return;
      var last = ctx.luckysheet_select_save[ctx.luckysheet_select_save.length - 1];
      var rowIndex = last.row_focus;
      var colIndex = last.column_focus;
      if (rowIndex == null || colIndex == null) return;
      var item = ctxDataVerification["".concat(rowIndex, "_").concat(colIndex)];
      var defaultItem = item !== null && item !== void 0 ? item : {};
      var rangValue = (_defaultItem$value = defaultItem.value1) !== null && _defaultItem$value !== void 0 ? _defaultItem$value : "";
      if (((_ctx$rangeDialog = ctx.rangeDialog) === null || _ctx$rangeDialog === void 0 ? void 0 : _ctx$rangeDialog.type) === "dropDown" && ctx.dataVerification && ctx.dataVerification.dataRegulation && ctx.dataVerification.dataRegulation.rangeTxt) {
        rangeT = ctx.dataVerification.dataRegulation.rangeTxt;
        rangValue = ctx.rangeDialog.rangeTxt;
      } else if (((_ctx$rangeDialog2 = ctx.rangeDialog) === null || _ctx$rangeDialog2 === void 0 ? void 0 : _ctx$rangeDialog2.type) === "rangeTxt" && ctx.dataVerification && ctx.dataVerification.dataRegulation && ctx.dataVerification.dataRegulation.value1) {
        rangValue = ctx.dataVerification.dataRegulation.value1;
        rangeT = ctx.rangeDialog.rangeTxt;
      }
      ctx.rangeDialog.type = "";
      if (item) {
        ctx.dataVerification.dataRegulation = _objectSpread2(_objectSpread2({}, item), {}, {
          value1: rangValue,
          rangeTxt: rangeT
        });
      } else {
        ctx.dataVerification.dataRegulation = {
          type: "dropdown",
          type2: "",
          rangeTxt: rangeT,
          value1: rangValue,
          value2: "",
          validity: "",
          remote: false,
          prohibitInput: false,
          hintShow: false,
          hintValue: ""
        };
      }
    });
  }, []);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-data-verification"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "title"
  }, toolbar.dataVerification), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "box"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "box-item",
    style: {
      borderTop: "1px solid #E1E4E8"
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "box-item-title"
  }, dataVerification.cellRange), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "data-verification-range"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    className: "formulaInputFocus",
    spellCheck: "false",
    value: (_context$dataVerifica = context.dataVerification.dataRegulation) === null || _context$dataVerifica === void 0 ? void 0 : _context$dataVerifica.rangeTxt,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.rangeTxt = value;
      });
    }
  }), /*#__PURE__*/React__default['default'].createElement("i", {
    className: "icon",
    "aria-hidden": "true",
    onClick: function onClick() {
      hideDialog();
      dataSelectRange("rangeTxt", context.dataVerification.dataRegulation.value1);
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "tab",
    width: 18
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "box-item"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "box-item-title"
  }, dataVerification.verificationCondition), /*#__PURE__*/React__default['default'].createElement("select", {
    className: "data-verification-type-select",
    value: context.dataVerification.dataRegulation.type,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.type = value;
        if (value === "dropdown" || value === "checkbox") {
          ctx.dataVerification.dataRegulation.type2 = "";
        } else if (value === "number" || value === "number_integer" || value === "number_decimal" || value === "text_length" || value === "date") {
          ctx.dataVerification.dataRegulation.type2 = "between";
        } else if (value === "text_content") {
          ctx.dataVerification.dataRegulation.type2 = "include";
        } else if (value === "validity") {
          ctx.dataVerification.dataRegulation.type2 = "identificationNumber";
        }
        ctx.dataVerification.dataRegulation.value1 = "";
        ctx.dataVerification.dataRegulation.value2 = "";
      });
    }
  }, ["dropdown", "checkbox", "number", "number_integer", "number_decimal", "text_content", "text_length", "date", "validity"].map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      value: v,
      key: v
    }, dataVerification[v]);
  })), ((_context$dataVerifica2 = context.dataVerification) === null || _context$dataVerifica2 === void 0 ? void 0 : (_context$dataVerifica3 = _context$dataVerifica2.dataRegulation) === null || _context$dataVerifica3 === void 0 ? void 0 : _context$dataVerifica3.type) === "dropdown" && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "show-box-item"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "data-verification-range"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    className: "formulaInputFocus",
    spellCheck: "false",
    value: context.dataVerification.dataRegulation.value1,
    placeholder: dataVerification.placeholder1,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value1 = value;
      });
    }
  }), /*#__PURE__*/React__default['default'].createElement("i", {
    className: "icon",
    "aria-hidden": "true",
    onClick: function onClick() {
      return dataSelectRange("dropDown", context.dataVerification.dataRegulation.value1);
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "tab",
    width: 18
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "check"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "checkbox",
    checked: context.dataVerification.dataRegulation.type2 === "true",
    id: "mul",
    onChange: function onChange(e) {
      var checked = e.target.checked;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.type2 = "".concat(checked);
      });
    }
  }), /*#__PURE__*/React__default['default'].createElement("label", {
    htmlFor: "mul"
  }, dataVerification.allowMultiSelect)))), ((_context$dataVerifica4 = context.dataVerification) === null || _context$dataVerifica4 === void 0 ? void 0 : (_context$dataVerifica5 = _context$dataVerifica4.dataRegulation) === null || _context$dataVerifica5 === void 0 ? void 0 : _context$dataVerifica5.type) === "checkbox" && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "show-box-item"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "check-box"
  }, /*#__PURE__*/React__default['default'].createElement("span", null, dataVerification.selected, " \u2014\u2014 "), /*#__PURE__*/React__default['default'].createElement("input", {
    type: "text",
    className: "data-verification-value1",
    placeholder: dataVerification.placeholder2,
    value: (_context$dataVerifica6 = context.dataVerification) === null || _context$dataVerifica6 === void 0 ? void 0 : (_context$dataVerifica7 = _context$dataVerifica6.dataRegulation) === null || _context$dataVerifica7 === void 0 ? void 0 : _context$dataVerifica7.value1,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value1 = value;
      });
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "check-box"
  }, /*#__PURE__*/React__default['default'].createElement("span", null, dataVerification.notSelected, " \u2014\u2014 "), /*#__PURE__*/React__default['default'].createElement("input", {
    type: "text",
    className: "data-verification-value2",
    placeholder: dataVerification.placeholder2,
    value: (_context$dataVerifica8 = context.dataVerification) === null || _context$dataVerifica8 === void 0 ? void 0 : (_context$dataVerifica9 = _context$dataVerifica8.dataRegulation) === null || _context$dataVerifica9 === void 0 ? void 0 : _context$dataVerifica9.value2,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value2 = value;
      });
    }
  })))), (((_context$dataVerifica0 = context.dataVerification) === null || _context$dataVerifica0 === void 0 ? void 0 : (_context$dataVerifica1 = _context$dataVerifica0.dataRegulation) === null || _context$dataVerifica1 === void 0 ? void 0 : _context$dataVerifica1.type) === "number" || ((_context$dataVerifica10 = context.dataVerification) === null || _context$dataVerifica10 === void 0 ? void 0 : (_context$dataVerifica11 = _context$dataVerifica10.dataRegulation) === null || _context$dataVerifica11 === void 0 ? void 0 : _context$dataVerifica11.type) === "number_integer" || ((_context$dataVerifica12 = context.dataVerification) === null || _context$dataVerifica12 === void 0 ? void 0 : (_context$dataVerifica13 = _context$dataVerifica12.dataRegulation) === null || _context$dataVerifica13 === void 0 ? void 0 : _context$dataVerifica13.type) === "number_decimal" || ((_context$dataVerifica14 = context.dataVerification) === null || _context$dataVerifica14 === void 0 ? void 0 : (_context$dataVerifica15 = _context$dataVerifica14.dataRegulation) === null || _context$dataVerifica15 === void 0 ? void 0 : _context$dataVerifica15.type) === "text_length") && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "show-box-item"
  }, /*#__PURE__*/React__default['default'].createElement("select", {
    className: "data-verification-type-select",
    value: context.dataVerification.dataRegulation.type2,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.type2 = value;
        ctx.dataVerification.dataRegulation.value1 = "";
        ctx.dataVerification.dataRegulation.value2 = "";
      });
    }
  }, numberCondition.map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      value: v,
      key: v
    }, dataVerification[v]);
  })), context.dataVerification.dataRegulation.type2 === "between" || context.dataVerification.dataRegulation.type2 === "notBetween" ? (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "input-box"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "number",
    placeholder: "1",
    value: context.dataVerification.dataRegulation.value1,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value1 = value;
      });
    }
  }), /*#__PURE__*/React__default['default'].createElement("span", null, "-"), /*#__PURE__*/React__default['default'].createElement("input", {
    type: "number",
    placeholder: "100",
    value: context.dataVerification.dataRegulation.value2,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value2 = value;
      });
    }
  }))) : (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "input-box"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "number",
    style: {
      width: "100%"
    },
    placeholder: dataVerification.placeholder3,
    value: context.dataVerification.dataRegulation.value1,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value1 = value;
      });
    }
  }))))), ((_context$dataVerifica16 = context.dataVerification) === null || _context$dataVerifica16 === void 0 ? void 0 : (_context$dataVerifica17 = _context$dataVerifica16.dataRegulation) === null || _context$dataVerifica17 === void 0 ? void 0 : _context$dataVerifica17.type) === "text_content" && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "show-box-item"
  }, /*#__PURE__*/React__default['default'].createElement("select", {
    className: "data-verification-type-select",
    value: context.dataVerification.dataRegulation.type2,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.type2 = value;
        ctx.dataVerification.dataRegulation.value1 = "";
        ctx.dataVerification.dataRegulation.value2 = "";
      });
    }
  }, ["include", "exclude", "equal"].map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      value: v,
      key: v
    }, dataVerification[v]);
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "input-box"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "text",
    style: {
      width: "100%"
    },
    placeholder: dataVerification.placeholder4,
    value: context.dataVerification.dataRegulation.value1,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value1 = value;
      });
    }
  })))), ((_context$dataVerifica18 = context.dataVerification) === null || _context$dataVerifica18 === void 0 ? void 0 : (_context$dataVerifica19 = _context$dataVerifica18.dataRegulation) === null || _context$dataVerifica19 === void 0 ? void 0 : _context$dataVerifica19.type) === "date" && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "show-box-item"
  }, /*#__PURE__*/React__default['default'].createElement("select", {
    className: "data-verification-type-select",
    value: context.dataVerification.dataRegulation.type2,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.type2 = value;
        ctx.dataVerification.dataRegulation.value1 = "";
        ctx.dataVerification.dataRegulation.value2 = "";
      });
    }
  }, dateCondition.map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      value: v,
      key: v
    }, dataVerification[v]);
  })), context.dataVerification.dataRegulation.type2 === "between" || context.dataVerification.dataRegulation.type2 === "notBetween" ? (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "input-box"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "date",
    placeholder: "1",
    value: context.dataVerification.dataRegulation.value1,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value1 = value;
      });
    }
  }), /*#__PURE__*/React__default['default'].createElement("span", null, "-"), /*#__PURE__*/React__default['default'].createElement("input", {
    type: "date",
    placeholder: "100",
    value: context.dataVerification.dataRegulation.value2,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value2 = value;
      });
    }
  }))) : (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "input-box"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "date",
    style: {
      width: "100%"
    },
    placeholder: dataVerification.placeholder3,
    value: context.dataVerification.dataRegulation.value1,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.value1 = value;
      });
    }
  }))))), ((_context$dataVerifica20 = context.dataVerification) === null || _context$dataVerifica20 === void 0 ? void 0 : (_context$dataVerifica21 = _context$dataVerifica20.dataRegulation) === null || _context$dataVerifica21 === void 0 ? void 0 : _context$dataVerifica21.type) === "validity" && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "show-box-item"
  }, /*#__PURE__*/React__default['default'].createElement("select", {
    className: "data-verification-type-select",
    value: context.dataVerification.dataRegulation.type2,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.type2 = value;
        ctx.dataVerification.dataRegulation.value1 = "";
        ctx.dataVerification.dataRegulation.value2 = "";
      });
    }
  }, ["identificationNumber", "phoneNumber"].map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      value: v,
      key: v
    }, dataVerification[v]);
  }))))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "box-item"
  }, ["prohibitInput", "hintShow"].map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "check",
      key: "div".concat(v)
    }, /*#__PURE__*/React__default['default'].createElement("input", {
      type: "checkbox",
      id: v,
      key: "input".concat(v),
      checked: context.dataVerification.dataRegulation[v],
      onChange: function onChange() {
        setContext(function (ctx) {
          var _ctx$dataVerification5;
          var dataRegulation = (_ctx$dataVerification5 = ctx.dataVerification) === null || _ctx$dataVerification5 === void 0 ? void 0 : _ctx$dataVerification5.dataRegulation;
          if (v === "prohibitInput") {
            dataRegulation.prohibitInput = !dataRegulation.prohibitInput;
          } else if (v === "hintShow") {
            dataRegulation.hintShow = !dataRegulation.hintShow;
          }
        });
      }
    }), /*#__PURE__*/React__default['default'].createElement("label", {
      htmlFor: v,
      key: "label".concat(v)
    }, dataVerification[v]));
  }), ((_context$dataVerifica22 = context.dataVerification) === null || _context$dataVerifica22 === void 0 ? void 0 : (_context$dataVerifica23 = _context$dataVerifica22.dataRegulation) === null || _context$dataVerifica23 === void 0 ? void 0 : _context$dataVerifica23.hintShow) && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "input-box"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "text",
    style: {
      width: "100%"
    },
    placeholder: dataVerification.placeholder5,
    value: context.dataVerification.dataRegulation.hintValue,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.dataVerification.dataRegulation.hintValue = value;
      });
    }
  }))))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      btn("confirm");
    },
    tabIndex: 0
  }, button.confirm), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-close",
    onClick: function onClick() {
      btn("delete");
    },
    tabIndex: 0
  }, dataVerification.deleteVerification), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-close",
    onClick: function onClick() {
      btn("close");
    },
    tabIndex: 0
  }, button.cancel));
};

var ConditionRules = function ConditionRules(_ref) {
  var type = _ref.type;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var _useDialog = useDialog(),
    hideDialog = _useDialog.hideDialog;
  var _locale = core.locale(context),
    conditionformat = _locale.conditionformat,
    button = _locale.button,
    protection = _locale.protection,
    generalDialog = _locale.generalDialog;
  var _useState = React.useState({
      textColor: "#000000",
      cellColor: "#000000"
    }),
    _useState2 = _slicedToArray(_useState, 2),
    colorRules = _useState2[0],
    setColorRules = _useState2[1];
  var close = React.useCallback(function (closeType) {
    if (closeType === "confirm") {
      setContext(function (ctx) {
        ctx.conditionRules.textColor.color = colorRules.textColor;
        ctx.conditionRules.cellColor.color = colorRules.cellColor;
        core.setConditionRules(ctx, protection, generalDialog, conditionformat, ctx.conditionRules);
      });
    }
    setContext(function (ctx) {
      ctx.conditionRules = {
        rulesType: "",
        rulesValue: "",
        textColor: {
          check: true,
          color: "#000000"
        },
        cellColor: {
          check: true,
          color: "#000000"
        },
        betweenValue: {
          value1: "",
          value2: ""
        },
        dateValue: "",
        repeatValue: "0",
        projectValue: "10"
      };
    });
    hideDialog();
  }, [colorRules, conditionformat, generalDialog, hideDialog, protection, setContext]);
  React.useEffect(function () {
    setContext(function (ctx) {
      ctx.conditionRules.rulesType = type;
      if (!ctx.rangeDialog) return;
      var rangeDialogType = ctx.rangeDialog.type;
      var rangeT = ctx.rangeDialog.rangeTxt;
      if (rangeDialogType === "conditionRulesbetween1") {
        ctx.conditionRules.betweenValue.value1 = rangeT;
      } else if (rangeDialogType === "conditionRulesbetween2") {
        ctx.conditionRules.betweenValue.value2 = rangeT;
      } else if (rangeDialogType.indexOf("conditionRules") >= 0) {
        ctx.conditionRules.rulesValue = rangeT;
      } else if (rangeDialogType === "") {
        ctx.conditionRules = {
          rulesType: type,
          rulesValue: "",
          textColor: {
            check: true,
            color: "#000000"
          },
          cellColor: {
            check: true,
            color: "#000000"
          },
          betweenValue: {
            value1: "",
            value2: ""
          },
          dateValue: "",
          repeatValue: "0",
          projectValue: "10"
        };
      }
      ctx.rangeDialog.type = "";
      ctx.rangeDialog.rangeTxt = "";
    });
  }, []);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-title"
  }, conditionformat["conditionformat_".concat(type)]), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "conditin-rules-value"
  }, conditionformat["conditionformat_".concat(type, "_title")]), (type === "greaterThan" || type === "lessThan" || type === "equal" || type === "textContains") && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-inpbox"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    className: "condition-rules-input",
    type: "text",
    value: context.conditionRules.rulesValue,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.conditionRules.rulesValue = value;
      });
    }
  }))), type === "between" && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-between-box"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-between-inpbox"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    className: "condition-rules-between-input",
    type: "text",
    value: context.conditionRules.betweenValue.value1,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.conditionRules.betweenValue.value1 = value;
      });
    }
  })), /*#__PURE__*/React__default['default'].createElement("span", {
    style: {
      margin: "0px 4px"
    }
  }, conditionformat.to), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-between-inpbox"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    className: "condition-rules-between-input",
    type: "text",
    value: context.conditionRules.betweenValue.value2,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.conditionRules.betweenValue.value2 = value;
      });
    }
  })))), type === "occurrenceDate" && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-inpbox"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "date",
    className: "condition-rules-date",
    value: context.conditionRules.dateValue,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.conditionRules.dateValue = value;
      });
    }
  }))), type === "duplicateValue" && (/*#__PURE__*/React__default['default'].createElement("select", {
    className: "condition-rules-select",
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.conditionRules.repeatValue = value;
      });
    }
  }, /*#__PURE__*/React__default['default'].createElement("option", {
    value: "0"
  }, conditionformat.duplicateValue), /*#__PURE__*/React__default['default'].createElement("option", {
    value: "1"
  }, conditionformat.uniqueValue))), (type === "top10" || type === "top10_percent" || type === "last10" || type === "last10_percent") && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-project-box"
  }, type === "top10" || type === "top10_percent" ? conditionformat.top : conditionformat.last, /*#__PURE__*/React__default['default'].createElement("input", {
    className: "condition-rules-project-input",
    type: "number",
    value: context.conditionRules.projectValue,
    onChange: function onChange(e) {
      var value = e.target.value;
      setContext(function (ctx) {
        ctx.conditionRules.projectValue = value;
      });
    }
  }), type === "top10" || type === "last10" ? conditionformat.oneself : "%")), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-set-title"
  }, "".concat(conditionformat.setAs, "\uFF1A")), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-setbox"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-set"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-color"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    id: "checkTextColor",
    type: "checkbox",
    className: "condition-rules-check",
    checked: context.conditionRules.textColor.check,
    onChange: function onChange(e) {
      var checked = e.target.checked;
      setContext(function (ctx) {
        ctx.conditionRules.textColor.check = checked;
      });
    }
  }), /*#__PURE__*/React__default['default'].createElement("label", {
    htmlFor: "checkTextColor",
    className: "condition-rules-label"
  }, conditionformat.textColor), /*#__PURE__*/React__default['default'].createElement("input", {
    type: "color",
    className: "condition-rules-select-color",
    value: colorRules.textColor,
    onChange: function onChange(e) {
      var value = e.target.value;
      setColorRules(produce__default['default'](function (draft) {
        draft.textColor = value;
      }));
    }
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-set"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-rules-color"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    id: "checkCellColor",
    type: "checkbox",
    className: "condition-rules-check",
    checked: context.conditionRules.cellColor.check,
    onChange: function onChange(e) {
      var checked = e.target.checked;
      setContext(function (ctx) {
        ctx.conditionRules.cellColor.check = checked;
      });
    }
  }), /*#__PURE__*/React__default['default'].createElement("label", {
    htmlFor: "checkCellColor",
    className: "condition-rules-label"
  }, conditionformat.cellColor), /*#__PURE__*/React__default['default'].createElement("input", {
    type: "color",
    className: "condition-rules-select-color",
    value: colorRules.cellColor,
    onChange: function onChange(e) {
      var value = e.target.value;
      setColorRules(produce__default['default'](function (draft) {
        draft.cellColor = value;
      }));
    }
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      close("confirm");
    },
    tabIndex: 0
  }, button.confirm), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-close",
    onClick: function onClick() {
      close("close");
    },
    tabIndex: 0
  }, button.cancel));
};

var RangeDialog = function RangeDialog() {
  var _context$rangeDialog$, _context$rangeDialog;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog;
  var _locale = core.locale(context),
    dataVerification = _locale.dataVerification,
    button = _locale.button;
  var _useState = React.useState((_context$rangeDialog$ = (_context$rangeDialog = context.rangeDialog) === null || _context$rangeDialog === void 0 ? void 0 : _context$rangeDialog.rangeTxt) !== null && _context$rangeDialog$ !== void 0 ? _context$rangeDialog$ : ""),
    _useState2 = _slicedToArray(_useState, 2),
    rangeTxt2 = _useState2[0],
    setRangeTxt2 = _useState2[1];
  var close = React.useCallback(function () {
    setContext(function (ctx) {
      ctx.rangeDialog.show = false;
      ctx.rangeDialog.singleSelect = false;
    });
    if (!context.rangeDialog) return;
    var rangeDialogType = context.rangeDialog.type;
    if (rangeDialogType.indexOf("between") >= 0) {
      showDialog(/*#__PURE__*/React__default['default'].createElement(ConditionRules, {
        type: "between"
      }));
      return;
    }
    if (rangeDialogType.indexOf("conditionRules") >= 0) {
      var rulesType = rangeDialogType.substring("conditionRules".length, rangeDialogType.length);
      showDialog(/*#__PURE__*/React__default['default'].createElement(ConditionRules, {
        type: rulesType
      }));
      return;
    }
    showDialog(/*#__PURE__*/React__default['default'].createElement(DataVerification, null));
  }, [context.rangeDialog, setContext, showDialog]);
  React.useEffect(function () {
    setRangeTxt2(function (r) {
      if (context.luckysheet_select_save) {
        var range = context.luckysheet_select_save[context.luckysheet_select_save.length - 1];
        r = core.getRangetxt(context, context.currentSheetId, range, context.currentSheetId);
        return r;
      }
      return "";
    });
  }, [context, context.luckysheet_select_save]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "range-dialog",
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    onChange: function onChange(e) {
      return e.stopPropagation();
    },
    onKeyDown: function onKeyDown(e) {
      return e.stopPropagation();
    },
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onMouseUp: function onMouseUp(e) {
      return e.stopPropagation();
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "dialog-title"
  }, dataVerification.selectCellRange), /*#__PURE__*/React__default['default'].createElement("input", {
    readOnly: true,
    placeholder: dataVerification.selectCellRange2,
    value: rangeTxt2
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    style: {
      marginLeft: "6px"
    },
    onClick: function onClick() {
      setContext(function (ctx) {
        ctx.rangeDialog.rangeTxt = rangeTxt2;
      });
      close();
    },
    tabIndex: 0
  }, button.confirm), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-close",
    onClick: function onClick() {
      close();
    },
    tabIndex: 0
  }, button.close));
};

function useOutsideClick(containerRef, handler, deps) {
  React.useEffect(function () {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handler();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return function () {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, deps);
}

function toggleDropdownSelection(selected, value) {
  var nextSelected = _toConsumableArray(selected);
  var index = nextSelected.indexOf(value);
  if (index < 0) {
    nextSelected.push(value);
  } else {
    nextSelected.splice(index, 1);
  }
  return nextSelected;
}
var DropDownList = function DropDownList() {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var containerRef = React.useRef(null);
  var _useState = React.useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    list = _useState2[0],
    setList = _useState2[1];
  var _useState3 = React.useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isMul = _useState4[0],
    setIsMul = _useState4[1];
  var _useState5 = React.useState(),
    _useState6 = _slicedToArray(_useState5, 2),
    position = _useState6[0],
    setPosition = _useState6[1];
  var _useState7 = React.useState([]),
    _useState8 = _slicedToArray(_useState7, 2),
    selected = _useState8[0],
    setSelected = _useState8[1];
  var selectedRef = React.useRef([]);
  var updateSelected = React.useCallback(function (nextSelected) {
    selectedRef.current = nextSelected;
    setSelected(nextSelected);
  }, []);
  var close = React.useCallback(function () {
    setContext(function (ctx) {
      ctx.dataVerificationDropDownList = false;
    });
  }, [setContext]);
  useOutsideClick(containerRef, close, [close]);
  React.useEffect(function () {
    if (!context.luckysheet_select_save) return;
    var last = context.luckysheet_select_save[context.luckysheet_select_save.length - 1];
    var rowIndex = last.row_focus;
    var colIndex = last.column_focus;
    if (rowIndex == null || colIndex == null) return;
    var row = context.visibledatarow[rowIndex];
    var col_pre = colIndex === 0 ? 0 : context.visibledatacolumn[colIndex - 1];
    var d = core.getFlowdata(context);
    if (!d) return;
    var margeSet = core.mergeBorder(context, d, rowIndex, colIndex);
    if (margeSet) {
      var _margeSet$row = _slicedToArray(margeSet.row, 2);
      row = _margeSet$row[1];
      var _margeSet$column = _slicedToArray(margeSet.column, 2);
      col_pre = _margeSet$column[0];
    }
    var index = core.getSheetIndex(context, context.currentSheetId);
    var dataVerification = context.luckysheetfile[index].dataVerification;
    var item = dataVerification["".concat(rowIndex, "_").concat(colIndex)];
    var dropdownList = core.getDropdownList(context, item.value1);
    var cellValue = core.getCellValue(rowIndex, colIndex, d);
    updateSelected(cellValue ? cellValue.toString().split(",") : []);
    setList(dropdownList);
    setPosition({
      left: col_pre,
      top: row
    });
    setIsMul(item.type2 === "true");
  }, []);
  React.useEffect(function () {
    if (!context.luckysheet_select_save) return;
    var last = context.luckysheet_select_save[context.luckysheet_select_save.length - 1];
    var rowIndex = last.row_focus;
    var colIndex = last.column_focus;
    if (rowIndex == null || colIndex == null) return;
    var index = core.getSheetIndex(context, context.currentSheetId);
    var dataVerification = context.luckysheetfile[index].dataVerification;
    var item = dataVerification["".concat(rowIndex, "_").concat(colIndex)];
    if (item.type2 !== "true") return;
    var d = core.getFlowdata(context);
    if (!d) return;
    var cellValue = core.getCellValue(rowIndex, colIndex, d);
    updateSelected(cellValue ? cellValue.toString().split(",") : []);
  }, [context.luckysheetfile]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-dataVerification-dropdown-List",
    style: position,
    ref: containerRef,
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    onChange: function onChange(e) {
      return e.stopPropagation();
    },
    onKeyDown: function onKeyDown(e) {
      return e.stopPropagation();
    },
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onMouseUp: function onMouseUp(e) {
      return e.stopPropagation();
    },
    tabIndex: 0
  }, list.map(function (v, i) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "dropdown-List-item",
      key: i,
      onClick: function onClick() {
        var nextSelected = toggleDropdownSelection(selectedRef.current, v);
        updateSelected(nextSelected);
        setContext(function (ctx) {
          core.setDropcownValue(ctx, v, nextSelected);
        });
      },
      tabIndex: 0
    }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
      name: "check",
      width: 12,
      style: {
        verticalAlign: "middle",
        display: isMul && selected.indexOf(v) >= 0 ? "inline" : "none"
      }
    }), v);
  }));
};

var SheetOverlay = function SheetOverlay() {
  var _refs$cellArea$curren, _refs$cellArea$curren2, _context$luckysheet_s4, _context$luckysheet_s5, _context$luckysheet_s6, _context$luckysheet_s7, _context$luckysheet_s8, _context$luckysheet_s9, _context$presences$le, _context$presences, _context$linkCard, _context$rangeDialog;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    settings = _useContext.settings,
    refs = _useContext.refs;
  var _locale = core.locale(context),
    info = _locale.info,
    rightclick = _locale.rightclick;
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog;
  var containerRef = React.useRef(null);
  var bottomAddRowInputRef = React.useRef(null);
  var dataVerificationHintBoxRef = React.useRef(null);
  var _useState = React.useState(""),
    _useState2 = _slicedToArray(_useState, 2),
    lastRangeText = _useState2[0],
    setLastRangeText = _useState2[1];
  var _useState3 = React.useState(""),
    _useState4 = _slicedToArray(_useState3, 2),
    lastCellValue = _useState4[0],
    setLastCellValue = _useState4[1];
  var _useAlert = useAlert(),
    showAlert = _useAlert.showAlert;
  var cellAreaMouseDown = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    if (e.button !== 2) {
      setContext(function (draftCtx) {
        var _draftCtx$luckysheet_;
        core.handleCellAreaMouseDown(draftCtx, refs.globalCache, nativeEvent, refs.cellInput.current, refs.cellArea.current, refs.fxInput.current, refs.canvas.current.getContext("2d"));
        if (!___default['default'].isEmpty((_draftCtx$luckysheet_ = draftCtx.luckysheet_select_save) === null || _draftCtx$luckysheet_ === void 0 ? void 0 : _draftCtx$luckysheet_[0]) && refs.cellInput.current) {
          setTimeout(function () {
            var _refs$cellInput$curre;
            (_refs$cellInput$curre = refs.cellInput.current) === null || _refs$cellInput$curre === void 0 ? void 0 : _refs$cellInput$curre.focus();
          });
        }
      });
    }
  }, [setContext, refs.globalCache, refs.cellInput, refs.cellArea, refs.fxInput, refs.canvas]);
  var cellAreaContextMenu = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleContextMenu(draftCtx, settings, nativeEvent, refs.workbookContainer.current, refs.cellArea.current, "cell");
    });
  }, [refs.workbookContainer, setContext, settings, refs.cellArea]);
  var cellAreaDoubleClick = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleCellAreaDoubleClick(draftCtx, refs.globalCache, settings, nativeEvent, refs.cellArea.current);
    });
  }, [refs.cellArea, refs.globalCache, setContext, settings]);
  var onLeftTopClick = React.useCallback(function () {
    setContext(function (draftCtx) {
      core.selectAll(draftCtx);
    });
  }, [setContext]);
  var debouncedShowLinkCard = React.useMemo(function () {
    return ___default['default'].debounce(function (globalCache, r, c, isEditing) {
      var _globalCache$linkCard;
      var skip = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      if (skip || ((_globalCache$linkCard = globalCache.linkCard) === null || _globalCache$linkCard === void 0 ? void 0 : _globalCache$linkCard.mouseEnter)) return;
      setContext(function (draftCtx) {
        core.showLinkCard(draftCtx, r, c, isEditing);
      });
    }, 800);
  }, [setContext]);
  var overShowLinkCard = React.useCallback(function (ctx, globalCache, e, container, scrollX, scrollY) {
    var rc = core.getCellRowColumn(ctx, e, container, scrollX, scrollY);
    if (rc == null) return;
    var link = core.getCellHyperlink(ctx, rc.r, rc.c);
    if (link == null) {
      debouncedShowLinkCard(globalCache, rc.r, rc.c, false);
    } else {
      core.showLinkCard(ctx, rc.r, rc.c, false);
      debouncedShowLinkCard(globalCache, rc.r, rc.c, false, true);
    }
  }, [debouncedShowLinkCard]);
  var onMouseMove = React.useCallback(function (nativeEvent) {
    setContext(function (draftCtx) {
      overShowLinkCard(draftCtx, refs.globalCache, nativeEvent, containerRef.current, refs.scrollbarX.current, refs.scrollbarY.current);
      core.handleOverlayMouseMove(draftCtx, refs.globalCache, nativeEvent, refs.cellInput.current, refs.scrollbarX.current, refs.scrollbarY.current, containerRef.current, refs.fxInput.current);
    });
  }, [overShowLinkCard, refs.cellInput, refs.fxInput, refs.globalCache, refs.scrollbarX, refs.scrollbarY, setContext]);
  var onMouseUp = React.useCallback(function (nativeEvent) {
    setContext(function (draftCtx) {
      try {
        core.handleOverlayMouseUp(draftCtx, refs.globalCache, settings, nativeEvent, refs.scrollbarX.current, refs.scrollbarY.current, containerRef.current, refs.cellInput.current, refs.fxInput.current);
      } catch (e) {
        showAlert(e.message);
      }
    });
  }, [refs.cellInput, refs.fxInput, refs.globalCache, refs.scrollbarX, refs.scrollbarY, setContext, settings, showAlert]);
  var onKeyDownForZoom = React.useCallback(function (ev) {
    var newZoom = core.handleKeydownForZoom(ev, context.zoomRatio);
    if (newZoom !== context.zoomRatio) {
      setContext(function (ctx) {
        ctx.zoomRatio = newZoom;
        ctx.luckysheetfile[core.getSheetIndex(ctx, ctx.currentSheetId)].zoomRatio = newZoom;
      });
    }
  }, [context.zoomRatio, setContext]);
  var onTouchStart = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftContext) {
      core.handleOverlayTouchStart(draftContext, nativeEvent, refs.globalCache);
    });
    e.stopPropagation();
  }, [refs.globalCache, setContext]);
  var onTouchMove = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    setContext(function (draftCtx) {
      core.handleOverlayTouchMove(draftCtx, nativeEvent, refs.globalCache, refs.scrollbarX.current, refs.scrollbarY.current);
    });
  }, [refs.globalCache, refs.scrollbarX, refs.scrollbarY, setContext]);
  var onTouchEnd = React.useCallback(function () {
    core.handleOverlayTouchEnd(refs.globalCache);
  }, [refs.globalCache]);
  var handleBottomAddRow = React.useCallback(function () {
    var _bottomAddRowInputRef;
    var valueStr = ((_bottomAddRowInputRef = bottomAddRowInputRef.current) === null || _bottomAddRowInputRef === void 0 ? void 0 : _bottomAddRowInputRef.value) || context.addDefaultRows.toString();
    var value = parseInt(valueStr, 10);
    if (Number.isNaN(value)) {
      return;
    }
    if (value < 1) {
      return;
    }
    var insertRowColOp = {
      type: "row",
      index: context.luckysheetfile[core.getSheetIndex(context, context.currentSheetId)].data.length - 1,
      count: value,
      direction: "rightbottom",
      id: context.currentSheetId
    };
    setContext(function (draftCtx) {
      try {
        core.insertRowCol(draftCtx, insertRowColOp, false);
      } catch (err) {
        if (err.message === "maxExceeded") showAlert(rightclick.rowOverLimit);
      }
    }, {
      insertRowColOp: insertRowColOp
    });
  }, [context, rightclick.rowOverLimit, setContext, showAlert]);
  React.useEffect(function () {
    setContext(function (draftCtx) {
      var _currentSheet$luckysh;
      var sheetIndex = core.getSheetIndex(draftCtx, draftCtx.currentSheetId);
      if (sheetIndex === undefined || sheetIndex === null) return;
      var currentSheet = draftCtx.luckysheetfile[sheetIndex];
      if (!((_currentSheet$luckysh = currentSheet.luckysheet_select_save) === null || _currentSheet$luckysh === void 0 ? void 0 : _currentSheet$luckysh.length)) {
        core.api.setSelection(draftCtx, [{
          row: [0],
          column: [0]
        }], {});
      }
    });
  }, [context.currentSheetId, setContext]);
  React.useEffect(function () {
    if (context.warnDialog) {
      setTimeout(function () {
        showDialog(context.warnDialog, "ok");
      }, 240);
    }
  }, [context.warnDialog]);
  React.useEffect(function () {
    refs.cellArea.current.scrollLeft = context.scrollLeft;
    refs.cellArea.current.scrollTop = context.scrollTop;
  }, [context.scrollLeft, context.scrollTop, refs.cellArea, (_refs$cellArea$curren = refs.cellArea.current) === null || _refs$cellArea$curren === void 0 ? void 0 : _refs$cellArea$curren.scrollLeft, (_refs$cellArea$curren2 = refs.cellArea.current) === null || _refs$cellArea$curren2 === void 0 ? void 0 : _refs$cellArea$curren2.scrollTop]);
  React.useLayoutEffect(function () {
    if (context.commentBoxes || context.hoveredCommentBox || context.editingCommentBox) {
      var _context$commentBoxes;
      ___default['default'].concat((_context$commentBoxes = context.commentBoxes) === null || _context$commentBoxes === void 0 ? void 0 : _context$commentBoxes.filter(function (v) {
        var _context$editingComme;
        return v.rc !== ((_context$editingComme = context.editingCommentBox) === null || _context$editingComme === void 0 ? void 0 : _context$editingComme.rc);
      }), [context.hoveredCommentBox, context.editingCommentBox]).forEach(function (box) {
        if (box) {
          core.drawArrow(box.rc, box.size);
        }
      });
    }
  }, [context.commentBoxes, context.hoveredCommentBox, context.editingCommentBox]);
  React.useEffect(function () {
    document.addEventListener("mousemove", onMouseMove);
    return function () {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove]);
  React.useEffect(function () {
    document.addEventListener("mouseup", onMouseUp);
    return function () {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);
  React.useEffect(function () {
    document.addEventListener("keydown", onKeyDownForZoom);
    return function () {
      document.removeEventListener("keydown", onKeyDownForZoom);
    };
  }, [onKeyDownForZoom]);
  var rangeText = React.useMemo(function () {
    var lastSelection = ___default['default'].last(context.luckysheet_select_save);
    if (!(lastSelection && lastSelection.row_focus != null && lastSelection.column_focus != null)) return "";
    var rf = lastSelection.row_focus;
    var cf = lastSelection.column_focus;
    if (context.config.merge != null && "".concat(rf, "_").concat(cf) in context.config.merge) {
      return core.getRangetxt(context, context.currentSheetId, {
        column: [cf, cf],
        row: [rf, rf]
      });
    }
    var rawRangeTxt = core.getRangetxt(context, context.currentSheetId, lastSelection);
    return rawRangeTxt.replace(/([A-Z]+)(\d+)/g, "$1. $2");
  }, [context.currentSheetId, context.luckysheet_select_save]);
  var cellValue = function cellValue() {
    var _context$luckysheet_s, _context$luckysheet_s2;
    if (((_context$luckysheet_s = (_context$luckysheet_s2 = context.luckysheet_select_save) === null || _context$luckysheet_s2 === void 0 ? void 0 : _context$luckysheet_s2.length) !== null && _context$luckysheet_s !== void 0 ? _context$luckysheet_s : 0) > 0) {
      var _context$luckysheet_s3, _selection$row_focus, _selection$column_foc, _context$luckysheetfi, _context$luckysheetfi2, _context$luckysheetfi3, _context$luckysheetfi4;
      var selection = (_context$luckysheet_s3 = context.luckysheet_select_save) === null || _context$luckysheet_s3 === void 0 ? void 0 : _context$luckysheet_s3[context.luckysheet_select_save.length - 1];
      if (!selection) return "";
      var sheetIndex = core.getSheetIndex(context, context.currentSheetId);
      if (sheetIndex === undefined || sheetIndex === null) return "";
      var rowFocus = (_selection$row_focus = selection.row_focus) !== null && _selection$row_focus !== void 0 ? _selection$row_focus : 0;
      var columnFocus = (_selection$column_foc = selection.column_focus) !== null && _selection$column_foc !== void 0 ? _selection$column_foc : 0;
      var cellVal = ((_context$luckysheetfi = context.luckysheetfile[sheetIndex]) === null || _context$luckysheetfi === void 0 ? void 0 : (_context$luckysheetfi2 = _context$luckysheetfi.data) === null || _context$luckysheetfi2 === void 0 ? void 0 : (_context$luckysheetfi3 = _context$luckysheetfi2[rowFocus]) === null || _context$luckysheetfi3 === void 0 ? void 0 : (_context$luckysheetfi4 = _context$luckysheetfi3[columnFocus]) === null || _context$luckysheetfi4 === void 0 ? void 0 : _context$luckysheetfi4.m) || "";
      return cellVal;
    }
    return "";
  };
  var computedCellValue = cellValue();
  React.useEffect(function () {
    if (context.sheetFocused) {
      setLastRangeText(String(rangeText));
      setLastCellValue(String(cellValue()));
    }
  }, [context.sheetFocused]);
  return /*#__PURE__*/React__default['default'].createElement("main", {
    className: "fortune-sheet-overlay",
    ref: containerRef,
    onTouchStart: onTouchStart,
    onTouchMove: onTouchMove,
    onTouchEnd: onTouchEnd,
    tabIndex: -1,
    style: {
      width: context.luckysheetTableContentHW[0],
      height: context.luckysheetTableContentHW[1]
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-col-header-wrap"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-left-top",
    onClick: onLeftTopClick,
    tabIndex: 0,
    style: {
      width: context.rowHeaderWidth - 1.5,
      height: context.columnHeaderHeight - 1.5
    }
  }), /*#__PURE__*/React__default['default'].createElement(ColumnHeader, null)), (context.showSearch || context.showReplace) && (/*#__PURE__*/React__default['default'].createElement(SearchReplace, {
    getContainer: function getContainer() {
      return containerRef.current;
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-row-body"
  }, /*#__PURE__*/React__default['default'].createElement(RowHeader, null), /*#__PURE__*/React__default['default'].createElement(ScrollBar, {
    axis: "x"
  }), /*#__PURE__*/React__default['default'].createElement(ScrollBar, {
    axis: "y"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    ref: refs.cellArea,
    className: "fortune-cell-area",
    onMouseDown: cellAreaMouseDown,
    onDoubleClick: cellAreaDoubleClick,
    onContextMenu: cellAreaContextMenu,
    style: {
      width: context.cellmainWidth,
      height: context.cellmainHeight,
      cursor: context.luckysheet_cell_selected_extend ? "crosshair" : "default"
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-formula-functionrange"
  }), context.formulaRangeSelect && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-selection-copy fortune-formula-functionrange-select",
    style: context.formulaRangeSelect
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-selection-copy-top fortune-copy"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-selection-copy-right fortune-copy"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-selection-copy-bottom fortune-copy"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-selection-copy-left fortune-copy"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-selection-copy-hc"
  }))), context.formulaRangeHighlight.map(function (v) {
    var rangeIndex = v.rangeIndex,
      backgroundColor = v.backgroundColor;
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: rangeIndex,
      id: "fortune-formula-functionrange-highlight",
      className: "fortune-selection-highlight fortune-formula-functionrange-highlight",
      style: ___default['default'].omit(v, "backgroundColor")
    }, ["top", "right", "bottom", "left"].map(function (d) {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: d,
        "data-type": d,
        className: "fortune-selection-copy-".concat(d, " fortune-copy"),
        style: {
          backgroundColor: backgroundColor
        }
      });
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-selection-copy-hc",
      style: {
        backgroundColor: backgroundColor
      }
    }), ["lt", "rt", "lb", "rb"].map(function (d) {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: d,
        "data-type": d,
        className: "fortune-selection-highlight-".concat(d, " luckysheet-highlight"),
        style: {
          backgroundColor: backgroundColor
        }
      });
    }));
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-row-count-show luckysheet-count-show",
    id: "luckysheet-row-count-show"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-column-count-show luckysheet-count-show",
    id: "luckysheet-column-count-show"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-change-size-line",
    hidden: !context.luckysheet_cols_change_size && !context.luckysheet_rows_change_size && !context.luckysheet_cols_freeze_drag && !context.luckysheet_rows_freeze_drag
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-freeze-drag-line",
    hidden: !context.luckysheet_cols_freeze_drag && !context.luckysheet_rows_freeze_drag
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-cell-selected-focus",
    style: ((_context$luckysheet_s4 = (_context$luckysheet_s5 = context.luckysheet_select_save) === null || _context$luckysheet_s5 === void 0 ? void 0 : _context$luckysheet_s5.length) !== null && _context$luckysheet_s4 !== void 0 ? _context$luckysheet_s4 : 0) > 0 ? function (_refs$globalCache$fre, _refs$globalCache$fre2) {
      var selection = ___default['default'].last(context.luckysheet_select_save);
      return ___default['default'].assign({
        left: selection.left,
        top: selection.top,
        width: (selection === null || selection === void 0 ? void 0 : selection.width) || 0,
        height: (selection === null || selection === void 0 ? void 0 : selection.height) || 0,
        display: "block"
      }, core.fixRowStyleOverflowInFreeze(context, selection.row_focus || 0, selection.row_focus || 0, (_refs$globalCache$fre = refs.globalCache.freezen) === null || _refs$globalCache$fre === void 0 ? void 0 : _refs$globalCache$fre[context.currentSheetId]), core.fixColumnStyleOverflowInFreeze(context, selection.column_focus || 0, selection.column_focus || 0, (_refs$globalCache$fre2 = refs.globalCache.freezen) === null || _refs$globalCache$fre2 === void 0 ? void 0 : _refs$globalCache$fre2[context.currentSheetId]));
    }() : {},
    onMouseDown: function onMouseDown(e) {
      return e.preventDefault();
    }
  }), ((_context$luckysheet_s6 = (_context$luckysheet_s7 = context.luckysheet_selection_range) === null || _context$luckysheet_s7 === void 0 ? void 0 : _context$luckysheet_s7.length) !== null && _context$luckysheet_s6 !== void 0 ? _context$luckysheet_s6 : 0) > 0 && (/*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-selection-copy"
  }, context.luckysheet_selection_range.map(function (range) {
    var r1 = range.row[0];
    var r2 = range.row[1];
    var c1 = range.column[0];
    var c2 = range.column[1];
    var row = context.visibledatarow[r2];
    var row_pre = r1 - 1 === -1 ? 0 : context.visibledatarow[r1 - 1];
    var col = context.visibledatacolumn[c2];
    var col_pre = c1 - 1 === -1 ? 0 : context.visibledatacolumn[c1 - 1];
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-selection-copy",
      key: "".concat(r1, "-").concat(r2, "-").concat(c1, "-").concat(c2),
      style: {
        left: col_pre,
        width: col - col_pre - 1,
        top: row_pre,
        height: row - row_pre - 1
      }
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-selection-copy-top fortune-copy"
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-selection-copy-right fortune-copy"
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-selection-copy-bottom fortune-copy"
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-selection-copy-left fortune-copy"
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-selection-copy-hc"
    }));
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-chart-rangeShow"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-cell-selected-extend"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-cell-selected-move",
    id: "fortune-cell-selected-move",
    onMouseDown: function onMouseDown(e) {
      return e.preventDefault();
    }
  }), ((_context$luckysheet_s8 = (_context$luckysheet_s9 = context.luckysheet_select_save) === null || _context$luckysheet_s9 === void 0 ? void 0 : _context$luckysheet_s9.length) !== null && _context$luckysheet_s8 !== void 0 ? _context$luckysheet_s8 : 0) > 0 && (/*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-cell-selected-boxs"
  }, context.luckysheet_select_save.map(function (selection, index) {
    var _refs$globalCache$fre3, _refs$globalCache$fre4;
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: index,
      id: "luckysheet-cell-selected",
      className: "luckysheet-cell-selected",
      style: ___default['default'].assign({
        left: selection.left_move,
        top: selection.top_move,
        width: (selection === null || selection === void 0 ? void 0 : selection.width_move) || 0,
        height: (selection === null || selection === void 0 ? void 0 : selection.height_move) || 0,
        display: "block"
      }, core.fixRowStyleOverflowInFreeze(context, selection.row[0], selection.row[1], (_refs$globalCache$fre3 = refs.globalCache.freezen) === null || _refs$globalCache$fre3 === void 0 ? void 0 : _refs$globalCache$fre3[context.currentSheetId]), core.fixColumnStyleOverflowInFreeze(context, selection.column[0], selection.column[1], (_refs$globalCache$fre4 = refs.globalCache.freezen) === null || _refs$globalCache$fre4 === void 0 ? void 0 : _refs$globalCache$fre4[context.currentSheetId])),
      onMouseDown: function onMouseDown(e) {
        e.stopPropagation();
        var nativeEvent = e.nativeEvent;
        setContext(function (draftCtx) {
          core.onCellsMoveStart(draftCtx, refs.globalCache, nativeEvent, refs.scrollbarX.current, refs.scrollbarY.current, containerRef.current);
        });
      }
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-inner-border"
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-fillhandle",
      onMouseDown: function onMouseDown(e) {
        var nativeEvent = e.nativeEvent;
        setContext(function (draftContext) {
          core.createDropCellRange(draftContext, nativeEvent, containerRef.current);
        });
        e.stopPropagation();
      }
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-inner-border"
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-draghandle-top luckysheet-cs-draghandle",
      onMouseDown: function onMouseDown(e) {
        return e.preventDefault();
      }
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-draghandle-bottom luckysheet-cs-draghandle",
      onMouseDown: function onMouseDown(e) {
        return e.preventDefault();
      }
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-draghandle-left luckysheet-cs-draghandle",
      onMouseDown: function onMouseDown(e) {
        return e.preventDefault();
      }
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-draghandle-right luckysheet-cs-draghandle",
      onMouseDown: function onMouseDown(e) {
        return e.preventDefault();
      }
    }), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-touchhandle luckysheet-cs-touchhandle-lt"
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-touchhandle-btn"
    })), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-touchhandle luckysheet-cs-touchhandle-rb"
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "luckysheet-cs-touchhandle-btn"
    })));
  }))), ((_context$presences$le = (_context$presences = context.presences) === null || _context$presences === void 0 ? void 0 : _context$presences.length) !== null && _context$presences$le !== void 0 ? _context$presences$le : 0) > 0 && context.presences.map(function (presence, index) {
    if (presence.sheetId !== context.currentSheetId) {
      return null;
    }
    var _presence$selection = presence.selection,
      r = _presence$selection.r,
      c = _presence$selection.c,
      color = presence.color;
    var row_pre = r - 1 === -1 ? 0 : context.visibledatarow[r - 1];
    var col_pre = c - 1 === -1 ? 0 : context.visibledatacolumn[c - 1];
    var row = context.visibledatarow[r];
    var col = context.visibledatacolumn[c];
    var width = col - col_pre - 1;
    var height = row - row_pre - 1;
    var usernameStyle = {
      maxWidth: width + 1,
      backgroundColor: color
    };
    ___default['default'].set(usernameStyle, r === 0 ? "top" : "bottom", height);
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: (presence === null || presence === void 0 ? void 0 : presence.userId) || index,
      className: "fortune-presence-selection",
      style: {
        left: col_pre,
        top: row_pre - 2,
        width: width,
        height: height,
        borderColor: color,
        borderWidth: 1
      }
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-presence-username",
      style: usernameStyle
    }, presence.username));
  }), ((_context$linkCard = context.linkCard) === null || _context$linkCard === void 0 ? void 0 : _context$linkCard.sheetId) === context.currentSheetId && (/*#__PURE__*/React__default['default'].createElement(LinkEditCard, _objectSpread2({}, context.linkCard))), ((_context$rangeDialog = context.rangeDialog) === null || _context$rangeDialog === void 0 ? void 0 : _context$rangeDialog.show) && /*#__PURE__*/React__default['default'].createElement(RangeDialog, null), /*#__PURE__*/React__default['default'].createElement(FilterOptions, {
    getContainer: function getContainer() {
      return containerRef.current;
    }
  }), /*#__PURE__*/React__default['default'].createElement(InputBox, null), /*#__PURE__*/React__default['default'].createElement(NotationBoxes, null), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-multipleRange-show"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-dynamicArray-hightShow"
  }), /*#__PURE__*/React__default['default'].createElement(ImgBoxs, null), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-dataVerification-dropdown-btn",
    onClick: function onClick() {
      setContext(function (ctx) {
        ctx.dataVerificationDropDownList = true;
        dataVerificationHintBoxRef.current.style.display = "none";
      });
    },
    tabIndex: 0,
    style: {
      display: "none"
    }
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "combo-arrow",
    width: 16
  })), context.dataVerificationDropDownList && /*#__PURE__*/React__default['default'].createElement(DropDownList, null), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-dataVerification-showHintBox",
    className: "luckysheet-mousedown-cancel",
    ref: dataVerificationHintBoxRef
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-cell-copy"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-grdblkflowpush"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-cell-flow_0",
    className: "luckysheet-cell-flow luckysheetsheetchange"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-cell-flow-clip"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-grdblkpush"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheetcoltable_0",
    className: "luckysheet-cell-flow-col"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-sheettable_0",
    className: "luckysheet-cell-sheettable",
    style: {
      height: context.rh_height,
      width: context.ch_width
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-bottom-controll-row",
    className: "luckysheet-bottom-controll-row",
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onMouseUp: function onMouseUp(e) {
      return e.stopPropagation();
    },
    onKeyDown: function onKeyDown(e) {
      return e.stopPropagation();
    },
    onKeyUp: function onKeyUp(e) {
      return e.stopPropagation();
    },
    onKeyPress: function onKeyPress(e) {
      return e.stopPropagation();
    },
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    onDoubleClick: function onDoubleClick(e) {
      return e.stopPropagation();
    },
    tabIndex: 0,
    style: {
      left: context.scrollLeft,
      display: context.allowEdit ? "block" : "none"
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-add-row-button",
    onClick: function onClick() {
      handleBottomAddRow();
    },
    tabIndex: 0
  }, info.add), /*#__PURE__*/React__default['default'].createElement("input", {
    ref: bottomAddRowInputRef,
    type: "text",
    style: {
      width: 50
    },
    placeholder: context.addDefaultRows.toString()
  }), " ", /*#__PURE__*/React__default['default'].createElement("span", {
    style: {
      fontSize: 14
    }
  }, info.row), " ", /*#__PURE__*/React__default['default'].createElement("span", {
    style: {
      fontSize: 14,
      color: "#9c9c9c"
    }
  }, "(", info.addLast, ")"), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "fortune-add-row-button",
    onClick: function onClick() {
      setContext(function (ctx) {
        ctx.scrollTop = 0;
      });
    },
    tabIndex: 0
  }, info.backTop))))))), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "sr-selection",
    className: "sr-only",
    role: "alert"
  }, !rangeText.includes("NaN") ? "".concat(rangeText, " ").concat(computedCellValue) : "A1. ".concat(info.sheetSrIntro)), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "sr-sheetFocus",
    className: "sr-only",
    role: "alert"
  }, context.sheetFocused ? "".concat(lastRangeText, " ").concat(lastCellValue ? "".concat(lastCellValue, ".") : "", " ").concat(info.sheetIsFocused) : "Toolbar. ".concat(info.sheetNotFocused)));
};

var Sheet = function Sheet(_ref) {
  var _context$config, _context$config2, _context$config3;
  var sheet = _ref.sheet;
  var data = sheet.data;
  var containerRef = React.useRef(null);
  var placeholderRef = React.useRef(null);
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs,
    settings = _useContext.settings;
  React.useEffect(function () {
    function resize() {
      if (!data) return;
      setContext(function (draftCtx) {
        if (settings.devicePixelRatio === 0) {
          draftCtx.devicePixelRatio = (typeof globalThis !== "undefined" ? globalThis : window).devicePixelRatio;
        }
        core.updateContextWithSheetData(draftCtx, data);
        core.updateContextWithCanvas(draftCtx, refs.canvas.current, placeholderRef.current);
      });
    }
    window.addEventListener("resize", resize);
    var themeObserver = new MutationObserver(resize);
    var ancestor = refs.canvas.current;
    while (ancestor) {
      themeObserver.observe(ancestor, {
        attributes: true,
        attributeFilter: ["class", "data-theme"]
      });
      ancestor = ancestor.parentElement;
    }
    return function () {
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
    };
  }, [data, refs.canvas, setContext, settings.devicePixelRatio]);
  React.useEffect(function () {
    if (!data) return;
    setContext(function (draftCtx) {
      return core.updateContextWithSheetData(draftCtx, data);
    });
  }, [(_context$config = context.config) === null || _context$config === void 0 ? void 0 : _context$config.rowlen, (_context$config2 = context.config) === null || _context$config2 === void 0 ? void 0 : _context$config2.columnlen, (_context$config3 = context.config) === null || _context$config3 === void 0 ? void 0 : _context$config3.rowhidden, context.config.colhidden, data, context.zoomRatio, setContext]);
  React.useEffect(function () {
    setContext(function (draftCtx) {
      return core.updateContextWithCanvas(draftCtx, refs.canvas.current, placeholderRef.current);
    });
  }, [refs.canvas, setContext, context.rowHeaderWidth, context.columnHeaderHeight, context.devicePixelRatio]);
  React.useEffect(function () {
    core.initFreeze(context, refs.globalCache, context.currentSheetId);
  }, [refs.globalCache, sheet.frozen, context.currentSheetId, context.visibledatacolumn, context.visibledatarow]);
  React.useEffect(function () {
    var _refs$globalCache$fre, _freeze$horizontal, _freeze$vertical;
    if (context.groupValuesRefreshData.length > 0) {
      return;
    }
    var tableCanvas = new core.Canvas(refs.canvas.current, context);
    if (tableCanvas == null) return;
    var freeze = (_refs$globalCache$fre = refs.globalCache.freezen) === null || _refs$globalCache$fre === void 0 ? void 0 : _refs$globalCache$fre[sheet.id];
    if ((freeze === null || freeze === void 0 ? void 0 : (_freeze$horizontal = freeze.horizontal) === null || _freeze$horizontal === void 0 ? void 0 : _freeze$horizontal.freezenhorizontaldata) || (freeze === null || freeze === void 0 ? void 0 : (_freeze$vertical = freeze.vertical) === null || _freeze$vertical === void 0 ? void 0 : _freeze$vertical.freezenverticaldata)) {
      var _freeze$horizontal2, _freeze$vertical2;
      var horizontalData = freeze === null || freeze === void 0 ? void 0 : (_freeze$horizontal2 = freeze.horizontal) === null || _freeze$horizontal2 === void 0 ? void 0 : _freeze$horizontal2.freezenhorizontaldata;
      var verticallData = freeze === null || freeze === void 0 ? void 0 : (_freeze$vertical2 = freeze.vertical) === null || _freeze$vertical2 === void 0 ? void 0 : _freeze$vertical2.freezenverticaldata;
      if (horizontalData && verticallData) {
        var _horizontalData = _slicedToArray(horizontalData, 3),
          horizontalPx = _horizontalData[0],
          horizontalScrollTop = _horizontalData[2];
        var _verticallData = _slicedToArray(verticallData, 3),
          verticalPx = _verticallData[0],
          verticalScrollWidth = _verticallData[2];
        tableCanvas.drawMain({
          scrollWidth: context.scrollLeft + verticalPx - verticalScrollWidth,
          scrollHeight: context.scrollTop + horizontalPx - horizontalScrollTop,
          offsetLeft: verticalPx - verticalScrollWidth + context.rowHeaderWidth,
          offsetTop: horizontalPx - horizontalScrollTop + context.columnHeaderHeight,
          clear: true
        });
        tableCanvas.drawMain({
          scrollWidth: context.scrollLeft + verticalPx - verticalScrollWidth,
          scrollHeight: horizontalScrollTop,
          drawHeight: horizontalPx,
          offsetLeft: verticalPx - verticalScrollWidth + context.rowHeaderWidth
        });
        tableCanvas.drawMain({
          scrollWidth: verticalScrollWidth,
          scrollHeight: context.scrollTop + horizontalPx - horizontalScrollTop,
          drawWidth: verticalPx,
          offsetTop: horizontalPx - horizontalScrollTop + context.columnHeaderHeight
        });
        tableCanvas.drawMain({
          scrollWidth: verticalScrollWidth,
          scrollHeight: horizontalScrollTop,
          drawWidth: verticalPx,
          drawHeight: horizontalPx
        });
        tableCanvas.drawColumnHeader(context.scrollLeft + verticalPx - verticalScrollWidth, undefined, verticalPx - verticalScrollWidth + context.rowHeaderWidth);
        tableCanvas.drawColumnHeader(verticalScrollWidth, verticalPx);
        tableCanvas.drawRowHeader(context.scrollTop + horizontalPx - horizontalScrollTop, undefined, horizontalPx - horizontalScrollTop + context.columnHeaderHeight);
        tableCanvas.drawRowHeader(horizontalScrollTop, horizontalPx);
        tableCanvas.drawFreezeLine({
          horizontalTop: horizontalPx - horizontalScrollTop + context.columnHeaderHeight - 2,
          verticalLeft: verticalPx - verticalScrollWidth + context.rowHeaderWidth - 2
        });
      } else if (horizontalData) {
        var _horizontalData2 = _slicedToArray(horizontalData, 3),
          _horizontalPx = _horizontalData2[0],
          _horizontalScrollTop = _horizontalData2[2];
        tableCanvas.drawMain({
          scrollWidth: context.scrollLeft,
          scrollHeight: context.scrollTop + _horizontalPx - _horizontalScrollTop,
          offsetTop: _horizontalPx - _horizontalScrollTop + context.columnHeaderHeight,
          clear: true
        });
        tableCanvas.drawMain({
          scrollWidth: context.scrollLeft,
          scrollHeight: _horizontalScrollTop,
          drawHeight: _horizontalPx
        });
        tableCanvas.drawColumnHeader(context.scrollLeft);
        tableCanvas.drawRowHeader(context.scrollTop + _horizontalPx - _horizontalScrollTop, undefined, _horizontalPx - _horizontalScrollTop + context.columnHeaderHeight);
        tableCanvas.drawRowHeader(_horizontalScrollTop, _horizontalPx);
        tableCanvas.drawFreezeLine({
          horizontalTop: _horizontalPx - _horizontalScrollTop + context.columnHeaderHeight - 2
        });
      } else if (verticallData) {
        var _verticallData2 = _slicedToArray(verticallData, 3),
          _verticalPx = _verticallData2[0],
          _verticalScrollWidth = _verticallData2[2];
        tableCanvas.drawMain({
          scrollWidth: context.scrollLeft + _verticalPx - _verticalScrollWidth,
          scrollHeight: context.scrollTop,
          offsetLeft: _verticalPx - _verticalScrollWidth + context.rowHeaderWidth
        });
        tableCanvas.drawMain({
          scrollWidth: _verticalScrollWidth,
          scrollHeight: context.scrollTop,
          drawWidth: _verticalPx
        });
        tableCanvas.drawRowHeader(context.scrollTop);
        tableCanvas.drawColumnHeader(context.scrollLeft + _verticalPx - _verticalScrollWidth, undefined, _verticalPx - _verticalScrollWidth + context.rowHeaderWidth);
        tableCanvas.drawColumnHeader(_verticalScrollWidth, _verticalPx);
        tableCanvas.drawFreezeLine({
          verticalLeft: _verticalPx - _verticalScrollWidth + context.rowHeaderWidth - 2
        });
      }
    } else {
      tableCanvas.drawMain({
        scrollWidth: context.scrollLeft,
        scrollHeight: context.scrollTop,
        clear: true
      });
      tableCanvas.drawColumnHeader(context.scrollLeft);
      tableCanvas.drawRowHeader(context.scrollTop);
    }
  }, [context, refs.canvas, refs.globalCache.freezen, setContext, sheet.id]);
  var onWheel = React.useCallback(function (e) {
    var nextScroll = core.handleGlobalWheel(context, e, refs.globalCache, refs.scrollbarX.current, refs.scrollbarY.current);
    if (nextScroll) {
      setContext(function (draftCtx) {
        if (nextScroll.scrollTop != null) {
          draftCtx.scrollTop = nextScroll.scrollTop;
        }
        if (nextScroll.scrollLeft != null) {
          draftCtx.scrollLeft = nextScroll.scrollLeft;
        }
      }, {
        noHistory: true
      });
    }
    e.preventDefault();
  }, [context, refs.globalCache, refs.scrollbarX, refs.scrollbarY, setContext]);
  React.useEffect(function () {
    var container = containerRef.current;
    container === null || container === void 0 ? void 0 : container.addEventListener("wheel", onWheel, {
      passive: false
    });
    return function () {
      container === null || container === void 0 ? void 0 : container.removeEventListener("wheel", onWheel);
    };
  }, [onWheel]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    ref: containerRef,
    className: "fortune-sheet-container"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    ref: placeholderRef,
    className: "fortune-sheet-canvas-placeholder"
  }), /*#__PURE__*/React__default['default'].createElement("canvas", {
    className: "fortune-sheet-canvas",
    ref: refs.canvas,
    "aria-hidden": "true"
  }), /*#__PURE__*/React__default['default'].createElement(SheetOverlay, null));
};

var Button = function Button(_ref) {
  var tooltip = _ref.tooltip,
    onClick = _ref.onClick,
    iconId = _ref.iconId,
    disabled = _ref.disabled,
    selected = _ref.selected,
    children = _ref.children;
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-button fortune-toolbar-item",
    onClick: onClick,
    tabIndex: 0,
    "data-tips": tooltip,
    role: "button",
    "aria-label": tooltip,
    style: selected ? {
      backgroundColor: "#E7E5EB"
    } : {}
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: iconId,
    style: disabled ? {
      opacity: 0.3
    } : {}
  }), tooltip && /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-tooltip"
  }, tooltip), children);
};

var Divider = function Divider() {
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-divider fortune-toolbar-item"
  });
};
var MenuDivider = function MenuDivider() {
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-menu-divider"
  });
};

var Combo = function Combo(_ref) {
  var tooltip = _ref.tooltip,
    _onClick = _ref.onClick,
    text = _ref.text,
    iconId = _ref.iconId,
    children = _ref.children;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context;
  var style = {
    userSelect: "none"
  };
  var _useState = React.useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    open = _useState2[0],
    setOpen = _useState2[1];
  var _useState3 = React.useState({
      left: 0
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    popupPosition = _useState4[0],
    setPopupPosition = _useState4[1];
  var popupRef = React.useRef(null);
  var buttonRef = React.useRef(null);
  var _locale = core.locale(context),
    info = _locale.info;
  useOutsideClick(popupRef, function () {
    setOpen(false);
  });
  React.useLayoutEffect(function () {
    if (!popupRef.current) {
      return;
    }
    if (!open) {
      setPopupPosition({
        left: 0
      });
    }
    var winW = window.innerWidth;
    var rect = popupRef.current.getBoundingClientRect();
    var menuW = rect.width;
    var left = rect.left;
    if (left + menuW > winW) {
      setPopupPosition({
        left: -rect.width + buttonRef.current.clientWidth
      });
    }
  }, [open]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toobar-combo-container fortune-toolbar-item"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    ref: buttonRef,
    className: "fortune-toolbar-combo"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-combo-button",
    onClick: function onClick(e) {
      if (_onClick) _onClick(e);else setOpen(!open);
    },
    tabIndex: 0,
    "data-tips": tooltip,
    role: "button",
    "aria-label": "".concat(tooltip, ": ").concat(text !== undefined ? text : ""),
    style: style
  }, iconId ? (/*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: iconId
  })) : (/*#__PURE__*/React__default['default'].createElement("span", {
    className: "fortune-toolbar-combo-text"
  }, text !== undefined ? text : ""))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-combo-arrow",
    onClick: function onClick() {
      return setOpen(!open);
    },
    tabIndex: 0,
    "data-tips": tooltip,
    role: "button",
    "aria-label": "".concat(tooltip, ": ").concat(info.Dropdown),
    style: style
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "combo-arrow",
    width: 10
  })), tooltip && /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-tooltip"
  }, tooltip)), open && (/*#__PURE__*/React__default['default'].createElement("div", {
    ref: popupRef,
    className: "fortune-toolbar-combo-popup",
    style: popupPosition
  }, children === null || children === void 0 ? void 0 : children(setOpen))));
};

var Select = function Select(_ref) {
  var children = _ref.children,
    style = _ref.style;
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-select",
    style: style
  }, children);
};
var Option = function Option(_ref2) {
  var iconId = _ref2.iconId,
    onClick = _ref2.onClick,
    children = _ref2.children,
    _onMouseLeave = _ref2.onMouseLeave,
    _onMouseEnter = _ref2.onMouseEnter;
  return /*#__PURE__*/React__default['default'].createElement("div", {
    onClick: onClick,
    tabIndex: 0,
    className: "fortune-toolbar-select-option",
    onMouseLeave: function onMouseLeave(e) {
      return _onMouseLeave === null || _onMouseLeave === void 0 ? void 0 : _onMouseLeave(e);
    },
    onMouseEnter: function onMouseEnter(e) {
      return _onMouseEnter === null || _onMouseEnter === void 0 ? void 0 : _onMouseEnter(e);
    }
  }, iconId && /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: iconId
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortuen-toolbar-text"
  }, children));
};

var FormulaSearch$1 = function FormulaSearch(_ref) {
  var _onCancel = _ref.onCancel;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    _useContext$refs = _useContext.refs,
    cellInput = _useContext$refs.cellInput,
    globalCache = _useContext$refs.globalCache;
  var _useState = React.useState(0),
    _useState2 = _slicedToArray(_useState, 2),
    selectedType = _useState2[0],
    setSelectedType = _useState2[1];
  var _useState3 = React.useState(0),
    _useState4 = _slicedToArray(_useState3, 2),
    selectedFuncIndex = _useState4[0],
    setSelectedFuncIndex = _useState4[1];
  var _useState5 = React.useState(""),
    _useState6 = _slicedToArray(_useState5, 2),
    searchText = _useState6[0],
    setSearchText = _useState6[1];
  var _locale = core.locale(context),
    formulaMore = _locale.formulaMore,
    functionlist = _locale.functionlist,
    button = _locale.button;
  var typeList = React.useMemo(function () {
    return [{
      t: 0,
      n: formulaMore.Math
    }, {
      t: 1,
      n: formulaMore.Statistical
    }, {
      t: 2,
      n: formulaMore.Lookup
    }, {
      t: 3,
      n: formulaMore.luckysheet
    }, {
      t: 4,
      n: formulaMore.dataMining
    }, {
      t: 5,
      n: formulaMore.Database
    }, {
      t: 6,
      n: formulaMore.Date
    }, {
      t: 7,
      n: formulaMore.Filter
    }, {
      t: 8,
      n: formulaMore.Financial
    }, {
      t: 9,
      n: formulaMore.Engineering
    }, {
      t: 10,
      n: formulaMore.Logical
    }, {
      t: 11,
      n: formulaMore.Operator
    }, {
      t: 12,
      n: formulaMore.Text
    }, {
      t: 13,
      n: formulaMore.Parser
    }, {
      t: 14,
      n: formulaMore.Array
    }, {
      t: -1,
      n: formulaMore.other
    }];
  }, [formulaMore]);
  var filteredFunctionList = React.useMemo(function () {
    if (searchText) {
      var list = [];
      var text = ___default['default'].cloneDeep(searchText.toUpperCase());
      for (var i = 0; i < functionlist.length; i += 1) {
        if (/^[a-zA-Z]+$/.test(text)) {
          if (functionlist[i].n.indexOf(text) !== -1) {
            list.push(functionlist[i]);
          }
        } else if (functionlist[i].a.indexOf(text) !== -1) {
          list.push(functionlist[i]);
        }
      }
      return list;
    }
    return ___default['default'].filter(functionlist, function (v) {
      return v.t === selectedType;
    });
  }, [functionlist, selectedType, searchText]);
  var onConfirm = React.useCallback(function () {
    var _context$luckysheet_s;
    var last = (_context$luckysheet_s = context.luckysheet_select_save) === null || _context$luckysheet_s === void 0 ? void 0 : _context$luckysheet_s[context.luckysheet_select_save.length - 1];
    var row_index = last === null || last === void 0 ? void 0 : last.row_focus;
    var col_index = last === null || last === void 0 ? void 0 : last.column_focus;
    if (!last) {
      row_index = 0;
      col_index = 0;
    } else {
      if (row_index == null) {
        var _last$row = _slicedToArray(last.row, 1);
        row_index = _last$row[0];
      }
      if (col_index == null) {
        var _last$column = _slicedToArray(last.column, 1);
        col_index = _last$column[0];
      }
    }
    var formulaTxt = "<span dir=\"auto\" class=\"luckysheet-formula-text-color\">=</span><span dir=\"auto\" class=\"luckysheet-formula-text-color\">".concat(filteredFunctionList[selectedFuncIndex].n.toUpperCase(), "</span><span dir=\"auto\" class=\"luckysheet-formula-text-color\">(</span>");
    setContext(function (ctx) {
      if (cellInput.current != null) {
        ctx.luckysheetCellUpdate = [row_index, col_index];
        globalCache.doNotUpdateCell = true;
        cellInput.current.innerHTML = formulaTxt;
        var spans = cellInput.current.childNodes;
        if (!___default['default'].isEmpty(spans)) {
          core.setCaretPosition(ctx, spans[spans.length - 1], 0, 1);
        }
        ctx.functionHint = filteredFunctionList[selectedFuncIndex].n.toUpperCase();
        ctx.functionCandidates = [];
        if (___default['default'].isEmpty(ctx.formulaCache.functionlistMap)) {
          for (var i = 0; i < functionlist.length; i += 1) {
            ctx.formulaCache.functionlistMap[functionlist[i].n] = functionlist[i];
          }
        }
        _onCancel();
      }
    });
  }, [cellInput, context.luckysheet_select_save, filteredFunctionList, globalCache, selectedFuncIndex, setContext, _onCancel, functionlist]);
  var onCancel = React.useCallback(function () {
    setContext(function (ctx) {
      core.cancelNormalSelected(ctx);
      if (cellInput.current) {
        cellInput.current.innerHTML = "";
      }
    });
    _onCancel();
  }, [_onCancel, cellInput, setContext]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-search-formula"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "inpbox"
  }, /*#__PURE__*/React__default['default'].createElement("div", null, formulaMore.findFunctionTitle, "\uFF1A"), /*#__PURE__*/React__default['default'].createElement("input", {
    className: "formulaInputFocus",
    id: "searchFormulaListInput",
    placeholder: formulaMore.tipInputFunctionName,
    spellCheck: "false",
    onChange: function onChange(e) {
      return setSearchText(e.target.value);
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "selbox"
  }, /*#__PURE__*/React__default['default'].createElement("span", null, formulaMore.selectCategory, "\uFF1A"), /*#__PURE__*/React__default['default'].createElement("select", {
    id: "formulaTypeSelect",
    onChange: function onChange(e) {
      setSelectedType(parseInt(e.target.value, 10));
      setSelectedFuncIndex(0);
    }
  }, typeList.map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      key: v.t,
      value: v.t
    }, v.n);
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "listbox",
    style: {
      height: 200
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", null, formulaMore.selectFunctionTitle, "\uFF1A"), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "formulaList"
  }, filteredFunctionList.map(function (v, index) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "listBox".concat(index === selectedFuncIndex ? " on" : ""),
      key: v.n,
      onClick: function onClick() {
        return setSelectedFuncIndex(index);
      },
      tabIndex: 0
    }, /*#__PURE__*/React__default['default'].createElement("div", null, v.n), /*#__PURE__*/React__default['default'].createElement("div", null, v.a));
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-dialog-box-button-container"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-message-box-button button-primary",
    onClick: onConfirm,
    tabIndex: 0
  }, button.confirm), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-message-box-button button-default",
    onClick: onCancel,
    tabIndex: 0
  }, button.cancel)));
};

var SplitColumn = function SplitColumn() {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var _locale = core.locale(context),
    splitText = _locale.splitText,
    button = _locale.button;
  var _useState = React.useState(""),
    _useState2 = _slicedToArray(_useState, 2),
    splitOperate = _useState2[0],
    setSplitOperate = _useState2[1];
  var _useState3 = React.useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    otherFlag = _useState4[0],
    setOtherFlag = _useState4[1];
  var _useState5 = React.useState([]),
    _useState6 = _slicedToArray(_useState5, 2),
    tableData = _useState6[0],
    setTableData = _useState6[1];
  var splitSymbols = React.useRef(null);
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog,
    hideDialog = _useDialog.hideDialog;
  var certainBtn = React.useCallback(function () {
    hideDialog();
    var dataArr = core.getDataArr(splitOperate, context);
    var r = context.luckysheet_select_save[0].row[0];
    var c = context.luckysheet_select_save[0].column[0];
    if (dataArr[0].length === 1) {
      return;
    }
    var dataCover = false;
    var data = core.getFlowdata(context);
    for (var i = 0; i < dataArr.length; i += 1) {
      for (var j = 1; j < dataArr[0].length; j += 1) {
        var cell = data[r + i][c + j];
        if (!___default['default'].isNull(cell) && !___default['default'].isNull(cell.v)) {
          dataCover = true;
          break;
        }
      }
    }
    if (dataCover) {
      showDialog(splitText.splitConfirmToExe, "yesno", function () {
        hideDialog();
        setContext(function (ctx) {
          core.updateMoreCell(r, c, dataArr, ctx);
        });
      });
    } else {
      setContext(function (ctx) {
        core.updateMoreCell(r, c, dataArr, ctx);
      });
    }
  }, [context, hideDialog, setContext, showDialog, splitOperate, splitText.splitConfirmToExe]);
  React.useEffect(function () {
    setTableData(function (table) {
      table = core.getDataArr(splitOperate, context);
      return table;
    });
  }, [context, splitOperate]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-split-column"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "title"
  }, splitText.splitTextTitle), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "splitDelimiters"
  }, splitText.splitDelimiters), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "splitSymbols",
    ref: splitSymbols
  }, splitText.splitSymbols.map(function (o) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: o.value,
      className: "splitSymbol"
    }, /*#__PURE__*/React__default['default'].createElement("input", {
      id: o.value,
      name: o.value,
      type: "checkbox",
      onClick: function onClick() {
        return setSplitOperate(function (regStr) {
          var _splitSymbols$current;
          return core.getRegStr(regStr, (_splitSymbols$current = splitSymbols.current) === null || _splitSymbols$current === void 0 ? void 0 : _splitSymbols$current.childNodes);
        });
      },
      tabIndex: 0
    }), /*#__PURE__*/React__default['default'].createElement("label", {
      htmlFor: o.value
    }, o.name));
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "splitSymbol"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    id: "other",
    name: "other",
    type: "checkbox",
    onClick: function onClick() {
      setOtherFlag(!otherFlag);
      setSplitOperate(function (regStr) {
        var _splitSymbols$current2;
        return core.getRegStr(regStr, (_splitSymbols$current2 = splitSymbols.current) === null || _splitSymbols$current2 === void 0 ? void 0 : _splitSymbols$current2.childNodes);
      });
    },
    tabIndex: 0
  }), /*#__PURE__*/React__default['default'].createElement("label", {
    htmlFor: "other"
  }, splitText.splitOther), /*#__PURE__*/React__default['default'].createElement("input", {
    id: "otherValue",
    name: "otherValue",
    type: "text",
    onBlur: function onBlur() {
      if (otherFlag) {
        setSplitOperate(function (regStr) {
          var _splitSymbols$current3;
          return core.getRegStr(regStr, (_splitSymbols$current3 = splitSymbols.current) === null || _splitSymbols$current3 === void 0 ? void 0 : _splitSymbols$current3.childNodes);
        });
      }
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "splitSymbol splitSimple"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    id: "splitsimple",
    name: "splitsimple",
    type: "checkbox",
    onClick: function onClick() {
      setSplitOperate(function (regStr) {
        var _splitSymbols$current4;
        return core.getRegStr(regStr, (_splitSymbols$current4 = splitSymbols.current) === null || _splitSymbols$current4 === void 0 ? void 0 : _splitSymbols$current4.childNodes);
      });
    },
    tabIndex: 0
  }), /*#__PURE__*/React__default['default'].createElement("label", {
    htmlFor: "splitsimple"
  }, splitText.splitContinueSymbol))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "splitDataPreview"
  }, splitText.splitDataPreview), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "splitColumnData"
  }, /*#__PURE__*/React__default['default'].createElement("table", null, /*#__PURE__*/React__default['default'].createElement("tbody", null, tableData.map(function (o, index) {
    if (o.length >= 1) {
      return /*#__PURE__*/React__default['default'].createElement("tr", {
        key: index
      }, o.map(function (o1) {
        return /*#__PURE__*/React__default['default'].createElement("td", {
          key: o + o1
        }, o1);
      }));
    }
    return /*#__PURE__*/React__default['default'].createElement("tr", null, /*#__PURE__*/React__default['default'].createElement("td", null));
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      certainBtn();
    },
    tabIndex: 0
  }, button.confirm), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-close",
    onClick: function onClick() {
      hideDialog();
    },
    tabIndex: 0
  }, button.cancel));
};

var LocationCondition = function LocationCondition() {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog,
    hideDialog = _useDialog.hideDialog;
  var _locale = core.locale(context),
    findAndReplace = _locale.findAndReplace,
    button = _locale.button;
  var _useState = React.useState("locationConstant"),
    _useState2 = _slicedToArray(_useState, 2),
    conditionType = _useState2[0],
    setConditionType = _useState2[1];
  var _useState3 = React.useState({
      locationDate: true,
      locationDigital: true,
      locationString: true,
      locationBool: true,
      locationError: true
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    constants = _useState4[0],
    setConstants = _useState4[1];
  var _useState5 = React.useState({
      locationDate: true,
      locationDigital: true,
      locationString: true,
      locationBool: true,
      locationError: true
    }),
    _useState6 = _slicedToArray(_useState5, 2),
    formulas = _useState6[0],
    setFormulas = _useState6[1];
  var onConfirm = React.useCallback(function () {
    if (conditionType === "locationConstant") {
      var value = core.getOptionValue(constants);
      var selectRange = core.getSelectRange(context);
      setContext(function (ctx) {
        var rangeArr = core.applyLocation(selectRange, conditionType, value, ctx);
        if (rangeArr.length === 0) showDialog(findAndReplace.locationTipNotFindCell, "ok");
      });
    } else if (conditionType === "locationFormula") {
      var _value = core.getOptionValue(formulas);
      var _selectRange = core.getSelectRange(context);
      setContext(function (ctx) {
        var rangeArr = core.applyLocation(_selectRange, conditionType, _value, ctx);
        if (rangeArr.length === 0) showDialog(findAndReplace.locationTipNotFindCell, "ok");
      });
    } else if (conditionType === "locationRowSpan") {
      var _context$luckysheet_s, _context$luckysheet_s2;
      if (((_context$luckysheet_s = context.luckysheet_select_save) === null || _context$luckysheet_s === void 0 ? void 0 : _context$luckysheet_s.length) === 0 || ((_context$luckysheet_s2 = context.luckysheet_select_save) === null || _context$luckysheet_s2 === void 0 ? void 0 : _context$luckysheet_s2.length) === 1 && context.luckysheet_select_save[0].row[0] === context.luckysheet_select_save[0].row[1]) {
        showDialog(findAndReplace.locationTiplessTwoRow, "ok");
        return;
      }
      var _selectRange2 = ___default['default'].assignIn([], context.luckysheet_select_save);
      setContext(function (ctx) {
        var rangeArr = core.applyLocation(_selectRange2, conditionType, undefined, ctx);
        if (rangeArr.length === 0) showDialog(findAndReplace.locationTipNotFindCell, "ok");
      });
    } else if (conditionType === "locationColumnSpan") {
      var _context$luckysheet_s3, _context$luckysheet_s4;
      if (((_context$luckysheet_s3 = context.luckysheet_select_save) === null || _context$luckysheet_s3 === void 0 ? void 0 : _context$luckysheet_s3.length) === 0 || ((_context$luckysheet_s4 = context.luckysheet_select_save) === null || _context$luckysheet_s4 === void 0 ? void 0 : _context$luckysheet_s4.length) === 1 && context.luckysheet_select_save[0].column[0] === context.luckysheet_select_save[0].column[1]) {
        showDialog(findAndReplace.locationTiplessTwoColumn, "ok");
        return;
      }
      var _selectRange3 = ___default['default'].assignIn([], context.luckysheet_select_save);
      setContext(function (ctx) {
        var rangeArr = core.applyLocation(_selectRange3, conditionType, undefined, ctx);
        if (rangeArr.length === 0) showDialog(findAndReplace.locationTipNotFindCell, "ok");
      });
    } else {
      var _context$luckysheet_s5, _context$luckysheet_s6;
      var _selectRange4;
      if (((_context$luckysheet_s5 = context.luckysheet_select_save) === null || _context$luckysheet_s5 === void 0 ? void 0 : _context$luckysheet_s5.length) === 0 || ((_context$luckysheet_s6 = context.luckysheet_select_save) === null || _context$luckysheet_s6 === void 0 ? void 0 : _context$luckysheet_s6.length) === 1 && context.luckysheet_select_save[0].row[0] === context.luckysheet_select_save[0].row[1] && context.luckysheet_select_save[0].column[0] === context.luckysheet_select_save[0].column[1]) {
        var flowdata = core.getFlowdata(context, context.currentSheetId);
        _selectRange4 = [{
          row: [0, flowdata.length - 1],
          column: [0, flowdata[0].length - 1]
        }];
      } else {
        _selectRange4 = ___default['default'].assignIn([], context.luckysheet_select_save);
      }
      setContext(function (ctx) {
        var rangeArr = core.applyLocation(_selectRange4, conditionType, undefined, ctx);
        if (rangeArr.length === 0) showDialog(findAndReplace.locationTipNotFindCell, "ok");
      });
    }
  }, [conditionType, constants, context, findAndReplace.locationTipNotFindCell, findAndReplace.locationTiplessTwoColumn, findAndReplace.locationTiplessTwoRow, formulas, setContext, showDialog]);
  var isSelect = React.useCallback(function (currentType) {
    return conditionType === currentType;
  }, [conditionType]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-location-condition"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "title"
  }, findAndReplace.location), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "listbox"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "listItem"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "radio",
    name: "locationType",
    id: "locationConstant",
    checked: isSelect("locationConstant"),
    onChange: function onChange() {
      setConditionType("locationConstant");
    }
  }), /*#__PURE__*/React__default['default'].createElement("label", {
    htmlFor: "locationConstant"
  }, findAndReplace.locationConstant), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "subbox"
  }, ["locationDate", "locationDigital", "locationString", "locationBool", "locationError"].map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "subItem",
      key: v
    }, /*#__PURE__*/React__default['default'].createElement("input", {
      type: "checkbox",
      disabled: !isSelect("locationConstant"),
      checked: constants[v],
      onChange: function onChange() {
        setConstants(produce__default['default'](function (draft) {
          ___default['default'].set(draft, v, !draft[v]);
        }));
      }
    }), /*#__PURE__*/React__default['default'].createElement("label", {
      htmlFor: v,
      style: {
        color: isSelect("locationConstant") ? "#000" : "#666"
      }
    }, findAndReplace[v]));
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "listItem"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "radio",
    name: "locationType",
    id: "locationFormula",
    checked: isSelect("locationFormula"),
    onChange: function onChange() {
      setConditionType("locationFormula");
    }
  }), /*#__PURE__*/React__default['default'].createElement("label", {
    htmlFor: "locationFormula"
  }, findAndReplace.locationFormula), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "subbox"
  }, ["locationDate", "locationDigital", "locationString", "locationBool", "locationError"].map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "subItem",
      key: v
    }, /*#__PURE__*/React__default['default'].createElement("input", {
      type: "checkbox",
      disabled: !isSelect("locationFormula"),
      checked: formulas[v],
      onChange: function onChange() {
        setFormulas(produce__default['default'](function (draft) {
          ___default['default'].set(draft, v, !draft[v]);
        }));
      }
    }), /*#__PURE__*/React__default['default'].createElement("label", {
      htmlFor: v,
      style: {
        color: isSelect("locationFormula") ? "#000" : "#666"
      }
    }, findAndReplace[v]));
  }))), ["locationNull", "locationRowSpan", "locationColumnSpan"].map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "listItem",
      key: v
    }, /*#__PURE__*/React__default['default'].createElement("input", {
      type: "radio",
      name: v,
      checked: isSelect(v),
      onChange: function onChange() {
        setConditionType(v);
      }
    }), /*#__PURE__*/React__default['default'].createElement("label", {
      htmlFor: v
    }, findAndReplace[v]));
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      hideDialog();
      onConfirm();
    },
    tabIndex: 0
  }, button.confirm), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-close",
    onClick: function onClick() {
      hideDialog();
    },
    tabIndex: 0
  }, button.cancel));
};

var ConditionalFormat = function ConditionalFormat(_ref) {
  var items = _ref.items,
    setOpen = _ref.setOpen;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog;
  var _locale = core.locale(context),
    conditionformat = _locale.conditionformat;
  var showSubMenu = React.useCallback(function (e) {
    var target = e.target;
    var menuItem = target.className === "fortune-toolbar-menu-line" ? target.parentElement : target;
    var menuItemRect = menuItem.getBoundingClientRect();
    var workbookContainerRect = refs.workbookContainer.current.getBoundingClientRect();
    var subMenu = menuItem.querySelector(".condition-format-sub-menu");
    if (___default['default'].isNil(subMenu)) return;
    var menuItemStyle = window.getComputedStyle(menuItem);
    var menuItemPaddingRight = parseFloat(menuItemStyle.getPropertyValue("padding-right").replace("px", ""));
    if (workbookContainerRect.right - menuItemRect.right < parseFloat(subMenu.style.width.replace("px", ""))) {
      subMenu.style.display = "block";
      subMenu.style.right = "".concat(menuItemRect.width - menuItemPaddingRight, "px");
    } else {
      subMenu.style.display = "block";
      subMenu.style.right = "".concat(-(parseFloat(subMenu.style.width.replace("px", "")) + menuItemPaddingRight), "px");
    }
  }, [refs.workbookContainer]);
  var hideSubMenu = React.useCallback(function (e) {
    var target = e.target;
    if (target.className === "condition-format-sub-menu") {
      target.style.display = "none";
      return;
    }
    var subMenu = target.className === "condition-format-item" ? target.parentElement : target.querySelector(".condition-format-sub-menu");
    if (___default['default'].isNil(subMenu)) return;
    subMenu.style.display = "none";
  }, []);
  var getConditionFormatItem = React.useCallback(function (name) {
    if (name === "-") {
      return /*#__PURE__*/React__default['default'].createElement(MenuDivider, {
        key: name
      });
    }
    if (name === "highlightCellRules") {
      return /*#__PURE__*/React__default['default'].createElement(Option, {
        key: name,
        onMouseEnter: showSubMenu,
        onMouseLeave: hideSubMenu
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-toolbar-menu-line",
        key: "div".concat(name)
      }, conditionformat[name], /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
        name: "rightArrow",
        width: 18
      }), /*#__PURE__*/React__default['default'].createElement("div", {
        className: "condition-format-sub-menu",
        style: {
          display: "none",
          width: 150
        }
      }, [{
        text: "greaterThan",
        value: ">"
      }, {
        text: "lessThan",
        value: "<"
      }, {
        text: "between",
        value: "[]"
      }, {
        text: "equal",
        value: "="
      }, {
        text: "textContains",
        value: "()"
      }, {
        text: "occurrenceDate",
        value: conditionformat.yesterday
      }, {
        text: "duplicateValue",
        value: "##"
      }].map(function (v) {
        return /*#__PURE__*/React__default['default'].createElement("div", {
          className: "condition-format-item",
          key: v.text,
          onClick: function onClick() {
            setOpen(false);
            showDialog(/*#__PURE__*/React__default['default'].createElement(ConditionRules, {
              type: v.text
            }));
          },
          tabIndex: 0
        }, conditionformat[v.text], /*#__PURE__*/React__default['default'].createElement("span", null, v.value));
      }))));
    }
    if (name === "itemSelectionRules") {
      return /*#__PURE__*/React__default['default'].createElement(Option, {
        key: name,
        onMouseEnter: showSubMenu,
        onMouseLeave: hideSubMenu
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-toolbar-menu-line"
      }, conditionformat[name], /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
        name: "rightArrow",
        width: 18
      }), /*#__PURE__*/React__default['default'].createElement("div", {
        className: "condition-format-sub-menu",
        style: {
          display: "none",
          width: 180
        }
      }, [{
        text: "top10",
        value: conditionformat.top10
      }, {
        text: "top10_percent",
        value: conditionformat.top10_percent
      }, {
        text: "last10",
        value: conditionformat.last10
      }, {
        text: "last10_percent",
        value: conditionformat.last10_percent
      }, {
        text: "aboveAverage",
        value: conditionformat.above
      }, {
        text: "belowAverage",
        value: conditionformat.below
      }].map(function (v) {
        return /*#__PURE__*/React__default['default'].createElement("div", {
          className: "condition-format-item",
          key: v.text,
          onClick: function onClick() {
            setOpen(false);
            showDialog(/*#__PURE__*/React__default['default'].createElement(ConditionRules, {
              type: v.text
            }));
          },
          tabIndex: 0
        }, conditionformat[v.text], /*#__PURE__*/React__default['default'].createElement("span", null, v.value));
      }))));
    }
    if (name === "dataBar") {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-toolbar-menu-line",
        key: "div".concat(name)
      }, conditionformat[name], /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
        name: "rightArrow",
        width: 18
      }));
    }
    if (name === "colorGradation") {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-toolbar-menu-line",
        key: "div".concat(name)
      }, conditionformat[name], /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
        name: "rightArrow",
        width: 18
      }));
    }
    if (name === "icons") {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-toolbar-menu-line",
        key: "div".concat(name)
      }, conditionformat[name]);
    }
    if (name === "newFormatRule") {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-toolbar-menu-line",
        key: "div".concat(name)
      }, conditionformat[name]);
    }
    if (name === "deleteRule") {
      return /*#__PURE__*/React__default['default'].createElement(Option, {
        key: name,
        onMouseEnter: showSubMenu,
        onMouseLeave: hideSubMenu
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-toolbar-menu-line"
      }, conditionformat[name], /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
        name: "rightArrow",
        width: 18
      }), /*#__PURE__*/React__default['default'].createElement("div", {
        className: "condition-format-sub-menu",
        style: {
          display: "none",
          width: 150
        }
      }, ["deleteSheetRule"].map(function (v) {
        return /*#__PURE__*/React__default['default'].createElement("div", {
          className: "condition-format-item",
          key: v,
          style: {
            padding: "6px 10px"
          },
          onClick: function onClick() {
            setContext(function (ctx) {
              core.updateItem(ctx, "delSheet");
            });
          },
          tabIndex: 0
        }, conditionformat[v]);
      }))));
    }
    if (name === "manageRules") {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-toolbar-menu-line",
        key: "div".concat(name)
      }, conditionformat[name]);
    }
    return /*#__PURE__*/React__default['default'].createElement("div", null);
  }, [conditionformat, hideSubMenu, setContext, setOpen, showDialog, showSubMenu]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "condition-format"
  }, /*#__PURE__*/React__default['default'].createElement(Select, {
    style: {
      overflow: "visible"
    }
  }, items.map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: "option".concat(v)
    }, getConditionFormatItem(v));
  })));
};

var CustomIcon = function CustomIcon(_ref) {
  var iconName = _ref.iconName,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 24 : _ref$width,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 24 : _ref$height,
    content = _ref.content;
  var innrContent = React.useMemo(function () {
    if (iconName) {
      return /*#__PURE__*/React__default['default'].createElement("svg", {
        width: width,
        height: height
      }, /*#__PURE__*/React__default['default'].createElement("use", {
        xlinkHref: "#".concat(iconName)
      }));
    }
    if (content) {
      return content;
    }
    return /*#__PURE__*/React__default['default'].createElement("svg", {
      width: width,
      height: width
    }, /*#__PURE__*/React__default['default'].createElement("use", {
      xlinkHref: "#default"
    }));
  }, [content, height, iconName, width]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    style: {
      width: width,
      height: height,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }
  }, innrContent);
};

var CustomButton = function CustomButton(_ref) {
  var tooltip = _ref.tooltip,
    onClick = _ref.onClick,
    selected = _ref.selected,
    children = _ref.children,
    iconName = _ref.iconName,
    icon = _ref.icon;
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-button fortune-toolbar-item",
    onClick: onClick,
    tabIndex: 0,
    "data-tips": tooltip,
    role: "button",
    style: selected ? {
      backgroundColor: "#E7E5EB"
    } : {}
  }, /*#__PURE__*/React__default['default'].createElement(CustomIcon, {
    iconName: iconName,
    content: icon
  }), tooltip && /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-tooltip"
  }, tooltip), children);
};

var palette = [["#000000", "#444444", "#666666", "#999999", "#cccccc", "#eeeeee", "#f3f3f3", "#ffffff"], ["#f00f00", "#f90f90", "#ff0ff0", "#0f00f0", "#0ff0ff", "#00f00f", "#90f90f", "#f0ff0f"], ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"], ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"], ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"], ["#c00c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"], ["#900900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"], ["#600600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]];
var ColorPicker = function ColorPicker(_ref) {
  var onPick = _ref.onPick;
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-color-picker"
  }, palette.map(function (rows, i) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: i,
      className: "fortune-toolbar-color-picker-row"
    }, rows.map(function (c) {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: c,
        className: "fortune-toolbar-color-picker-item",
        onClick: function onClick() {
          return onPick(c);
        },
        tabIndex: 0,
        style: {
          backgroundColor: c
        }
      });
    }));
  }));
};

var CustomColor = function CustomColor(_ref) {
  var onCustomPick = _ref.onCustomPick,
    onColorPick = _ref.onColorPick;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context;
  var _locale = core.locale(context),
    toolbar = _locale.toolbar,
    sheetconfig = _locale.sheetconfig,
    button = _locale.button;
  var _useState = React.useState("#000000"),
    _useState2 = _slicedToArray(_useState, 2),
    inputColor = _useState2[0],
    setInputColor = _useState2[1];
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-custom-color"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "color-reset",
    onClick: function onClick() {
      return onCustomPick(undefined);
    },
    tabIndex: 0
  }, sheetconfig.resetColor), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "custom-color"
  }, /*#__PURE__*/React__default['default'].createElement("div", null, toolbar.customColor, ":"), /*#__PURE__*/React__default['default'].createElement("input", {
    type: "color",
    value: inputColor,
    onChange: function onChange(e) {
      return setInputColor(e.target.value);
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      onCustomPick(inputColor);
    },
    tabIndex: 0
  }, button.confirm)), /*#__PURE__*/React__default['default'].createElement(ColorPicker, {
    onPick: function onPick(color) {
      onColorPick(color);
    }
  }));
};

var size = [{
  Text: "1",
  value: "Thin",
  strokeDasharray: "1,0",
  strokeWidth: "1"
}, {
  Text: "2",
  value: "Hair",
  strokeDasharray: "1,5",
  strokeWidth: "1"
}, {
  Text: "3",
  value: "Dotted",
  strokeDasharray: "2,5",
  strokeWidth: "2"
}, {
  Text: "4",
  value: "Dashed",
  strokeDasharray: "5,5",
  strokeWidth: "2"
}, {
  Text: "5",
  value: "DashDot",
  strokeDasharray: "20,5,5,10,5,5",
  strokeWidth: "2"
}, {
  Text: "6",
  value: "DashDotDot",
  strokeDasharray: "20,5,5,5,5,10,5,5,5,5",
  strokeWidth: "2"
}, {
  Text: "8",
  value: "Medium",
  strokeDasharray: "2,0",
  strokeWidth: "2"
}, {
  Text: "9",
  value: "MediumDashed",
  strokeDasharray: "3,5",
  strokeWidth: "3"
}, {
  Text: "10",
  value: "MediumDashDot",
  strokeDasharray: "20,5,5,10,5,5",
  strokeWidth: "3"
}, {
  Text: "11",
  value: "MediumDashDotDot",
  strokeDasharray: "5,5,5,5,20,5,5,5,5,10",
  strokeWidth: "3"
}, {
  Text: "13",
  value: "Thick",
  strokeDasharray: "2,0",
  strokeWidth: "3"
}];
var CustomBorder = function CustomBorder(_ref) {
  var onPick = _ref.onPick;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    refs = _useContext.refs;
  var _locale = core.locale(context),
    border = _locale.border;
  var _useState = React.useState("#000000"),
    _useState2 = _slicedToArray(_useState, 2),
    changeColor = _useState2[0],
    setchangeColor = _useState2[1];
  var _useState3 = React.useState("1"),
    _useState4 = _slicedToArray(_useState3, 2),
    changeStyle = _useState4[0],
    setchangeStyle = _useState4[1];
  var colorRef = React.useRef(null);
  var styleRef = React.useRef(null);
  var colorPreviewRef = React.useRef(null);
  var _useState5 = React.useState(""),
    _useState6 = _slicedToArray(_useState5, 2),
    previewWith = _useState6[0],
    setPreviewWith = _useState6[1];
  var _useState7 = React.useState(""),
    _useState8 = _slicedToArray(_useState7, 2),
    previewdasharry = _useState8[0],
    setPreviewdasharray = _useState8[1];
  var showBorderSubMenu = React.useCallback(function (e) {
    var target = e.target;
    var menuItemRect = target.getBoundingClientRect();
    var subMenuItem = target.querySelector(".fortune-border-select-menu");
    if (___default['default'].isNil(subMenuItem)) return;
    subMenuItem.style.display = "block";
    var workbookContainerRect = refs.workbookContainer.current.getBoundingClientRect();
    if (workbookContainerRect.width - menuItemRect.right > parseFloat(subMenuItem.style.width.replace("px", ""))) {
      subMenuItem.style.left = "".concat(menuItemRect === null || menuItemRect === void 0 ? void 0 : menuItemRect.width, "px");
    } else {
      subMenuItem.style.left = "-".concat(subMenuItem.style.width);
    }
  }, [refs.workbookContainer]);
  var hideBorderSubMenu = React.useCallback(function () {
    styleRef.current.style.display = "none";
    colorRef.current.style.display = "none";
  }, []);
  var changePreviewStyle = React.useCallback(function (width, dasharray) {
    setPreviewWith(width);
    setPreviewdasharray(dasharray);
  }, []);
  return /*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-border-select-option",
    key: "borderColor",
    onMouseEnter: function onMouseEnter(e) {
      showBorderSubMenu(e);
    },
    onMouseLeave: function onMouseLeave() {
      hideBorderSubMenu();
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-menu-line"
  }, border.borderColor, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "rightArrow",
    style: {
      width: "14px"
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    ref: colorPreviewRef,
    className: "fortune-border-color-preview",
    style: {
      backgroundColor: changeColor
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    ref: colorRef,
    className: "fortune-border-select-menu",
    style: {
      display: "none",
      width: "166px"
    }
  }, /*#__PURE__*/React__default['default'].createElement(CustomColor, {
    onCustomPick: function onCustomPick(color) {
      onPick(color, changeStyle);
      colorPreviewRef.current.style.backgroundColor = changeColor;
      setchangeColor(color);
    },
    onColorPick: function onColorPick(color) {
      onPick(color, changeStyle);
      setchangeColor(color);
    }
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-border-select-option",
    key: "borderStyle",
    onMouseEnter: function onMouseEnter(e) {
      showBorderSubMenu(e);
    },
    onMouseLeave: function onMouseLeave() {
      hideBorderSubMenu();
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-toolbar-menu-line"
  }, border.borderStyle, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "rightArrow",
    style: {
      width: "14px"
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-border-style-preview"
  }, /*#__PURE__*/React__default['default'].createElement("svg", {
    width: "90"
  }, /*#__PURE__*/React__default['default'].createElement("g", {
    fill: "none",
    stroke: "black",
    strokeWidth: previewWith
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    strokeDasharray: previewdasharry,
    d: "M0 0 l90 0"
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    ref: styleRef,
    className: "fortune-border-select-menu fortune-toolbar-select",
    style: {
      display: "none",
      width: "110px"
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-border-style-picker-menu fortune-border-style-reset",
    onClick: function onClick() {
      onPick(changeColor, "1");
      changePreviewStyle("1", "1,0");
    },
    tabIndex: 0
  }, border.borderDefault), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-boder-style-picker"
  }, size.map(function (items, i) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      key: i,
      className: "fortune-border-style-picker-menu",
      onClick: function onClick() {
        onPick(changeColor, items.Text);
        setchangeStyle(items.Text);
        changePreviewStyle(items.strokeWidth, items.strokeDasharray);
      },
      tabIndex: 0
    }, /*#__PURE__*/React__default['default'].createElement("svg", {
      height: "10",
      width: "90"
    }, /*#__PURE__*/React__default['default'].createElement("g", {
      fill: "none",
      stroke: "black",
      strokeWidth: items.strokeWidth
    }, /*#__PURE__*/React__default['default'].createElement("path", {
      strokeDasharray: items.strokeDasharray,
      d: "M0 5 l85 0"
    }))));
  })))));
};

var FormatSearch = function FormatSearch(_ref) {
  var type = _ref.type,
    _onCancel = _ref.onCancel;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    cellInput = _useContext.refs.cellInput;
  var _useState = React.useState(2),
    _useState2 = _slicedToArray(_useState, 2),
    decimalPlace = _useState2[0],
    setDecimalPlace = _useState2[1];
  var _useState3 = React.useState(0),
    _useState4 = _slicedToArray(_useState3, 2),
    selectedFormatIndex = _useState4[0],
    setSelectedFormatIndex = _useState4[1];
  var _locale = core.locale(context),
    button = _locale.button,
    format = _locale.format,
    currencyDetail = _locale.currencyDetail,
    dateFmtList = _locale.dateFmtList,
    numberFmtList = _locale.numberFmtList;
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog;
  var toolbarFormatAll = React.useMemo(function () {
    return {
      currency: currencyDetail,
      date: dateFmtList,
      number: numberFmtList
    };
  }, [currencyDetail, dateFmtList, numberFmtList]);
  var toolbarFormat = React.useMemo(function () {
    return toolbarFormatAll[type];
  }, [toolbarFormatAll, type]);
  var tips = ___default['default'].get(format, type);
  var onConfirm = React.useCallback(function () {
    if (decimalPlace < 0 || decimalPlace > 9) {
      _onCancel();
      showDialog(format.tipDecimalPlaces, "ok");
      return;
    }
    setContext(function (ctx) {
      var index = core.getSheetIndex(ctx, ctx.currentSheetId);
      if (___default['default'].isNil(index)) return;
      var selectedFormatVal = toolbarFormat[selectedFormatIndex].value;
      var selectedFormatPos;
      if ("pos" in toolbarFormat[selectedFormatIndex]) selectedFormatPos = toolbarFormat[selectedFormatIndex].pos || "before";
      ___default['default'].forEach(ctx.luckysheet_select_save, function (selection) {
        for (var r = selection.row[0]; r <= selection.row[1]; r += 1) {
          for (var c = selection.column[0]; c <= selection.column[1]; c += 1) {
            var _ctx$luckysheetfile$i, _ctx$luckysheetfile$i2, _ctx$luckysheetfile$i3, _ctx$luckysheetfile$i4;
            if (((_ctx$luckysheetfile$i = ctx.luckysheetfile[index].data) === null || _ctx$luckysheetfile$i === void 0 ? void 0 : _ctx$luckysheetfile$i[r][c]) && ((_ctx$luckysheetfile$i2 = ctx.luckysheetfile[index].data) === null || _ctx$luckysheetfile$i2 === void 0 ? void 0 : (_ctx$luckysheetfile$i3 = _ctx$luckysheetfile$i2[r][c]) === null || _ctx$luckysheetfile$i3 === void 0 ? void 0 : (_ctx$luckysheetfile$i4 = _ctx$luckysheetfile$i3.ct) === null || _ctx$luckysheetfile$i4 === void 0 ? void 0 : _ctx$luckysheetfile$i4.t) === "n") {
              var zero = 0;
              if (selectedFormatPos === "after") {
                ctx.luckysheetfile[index].data[r][c].ct.fa = zero.toFixed(decimalPlace).concat("".concat(selectedFormatVal));
                ctx.luckysheetfile[index].data[r][c].m = core.update(zero.toFixed(decimalPlace).concat("".concat(selectedFormatVal)), ctx.luckysheetfile[index].data[r][c].v);
              } else {
                ctx.luckysheetfile[index].data[r][c].ct.fa = "".concat(selectedFormatVal).concat(zero.toFixed(decimalPlace));
                ctx.luckysheetfile[index].data[r][c].m = core.update("".concat(selectedFormatVal).concat(zero.toFixed(decimalPlace)), ctx.luckysheetfile[index].data[r][c].v);
              }
            }
          }
        }
      });
      _onCancel();
    });
  }, [_onCancel, decimalPlace, format.tipDecimalPlaces, selectedFormatIndex, setContext, showDialog, toolbarFormat]);
  var onCancel = React.useCallback(function () {
    setContext(function (ctx) {
      core.cancelNormalSelected(ctx);
      if (cellInput.current) {
        cellInput.current.innerHTML = "";
      }
    });
    _onCancel();
  }, [_onCancel, cellInput, setContext]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-search-format"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "listbox",
    style: {
      height: 200
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    style: {
      marginBottom: 16
    }
  }, tips, format.format, "\uFF1A"), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "inpbox",
    style: {
      display: "block"
    }
  }, format.decimalPlaces, "\uFF1A", /*#__PURE__*/React__default['default'].createElement("input", {
    className: "decimal-places-input",
    id: "decimal-places-input",
    min: 0,
    max: 9,
    defaultValue: 2,
    type: "number",
    onChange: function onChange(e) {
      setDecimalPlace(parseInt(e.target.value, 10));
    }
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "format-list"
  }, toolbarFormat.map(function (v, index) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "listBox".concat(index === selectedFormatIndex ? " on" : ""),
      key: v.name,
      onClick: function onClick() {
        setSelectedFormatIndex(index);
      },
      tabIndex: 0
    }, /*#__PURE__*/React__default['default'].createElement("div", null, v.name), /*#__PURE__*/React__default['default'].createElement("div", null, v.value));
  }))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-dialog-box-button-container",
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-message-box-button button-primary",
    onClick: onConfirm,
    tabIndex: 0
  }, button.confirm), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-message-box-button button-default",
    onClick: onCancel,
    tabIndex: 0
  }, button.cancel)));
};

var Toolbar = function Toolbar(_ref) {
  var _context$luckysheet_s, _flowdata$row, _settings$customToolb;
  var setMoreItems = _ref.setMoreItems,
    moreItemsOpen = _ref.moreItemsOpen;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs,
    settings = _useContext.settings,
    handleUndo = _useContext.handleUndo,
    handleRedo = _useContext.handleRedo;
  var contextRef = React.useRef(context);
  var containerRef = React.useRef(null);
  var _useState = React.useState(-1),
    _useState2 = _slicedToArray(_useState, 2),
    toolbarWrapIndex = _useState2[0],
    setToolbarWrapIndex = _useState2[1];
  var _useState3 = React.useState([]),
    _useState4 = _slicedToArray(_useState3, 2),
    itemLocations = _useState4[0],
    setItemLocations = _useState4[1];
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog,
    hideDialog = _useDialog.hideDialog;
  var firstSelection = (_context$luckysheet_s = context.luckysheet_select_save) === null || _context$luckysheet_s === void 0 ? void 0 : _context$luckysheet_s[0];
  var flowdata = core.getFlowdata(context);
  contextRef.current = context;
  var row = firstSelection === null || firstSelection === void 0 ? void 0 : firstSelection.row_focus;
  var col = firstSelection === null || firstSelection === void 0 ? void 0 : firstSelection.column_focus;
  var cell = flowdata && row != null && col != null ? flowdata === null || flowdata === void 0 ? void 0 : (_flowdata$row = flowdata[row]) === null || _flowdata$row === void 0 ? void 0 : _flowdata$row[col] : undefined;
  var _locale = core.locale(context),
    toolbar = _locale.toolbar,
    merge = _locale.merge,
    border = _locale.border,
    freezen = _locale.freezen,
    defaultFmt = _locale.defaultFmt,
    formula = _locale.formula,
    sort = _locale.sort,
    align = _locale.align,
    textWrap = _locale.textWrap,
    rotation = _locale.rotation,
    screenshot = _locale.screenshot,
    filter = _locale.filter,
    splitText = _locale.splitText,
    findAndReplace = _locale.findAndReplace,
    comment = _locale.comment,
    fontarray = _locale.fontarray;
  var toolbarFormat = core.locale(context).format;
  var sheetWidth = context.luckysheetTableContentHW[0];
  var currency = settings.currency;
  var defaultFormat = defaultFmt(currency);
  var _useState5 = React.useState("#000000"),
    _useState6 = _slicedToArray(_useState5, 2),
    customColor = _useState6[0],
    setcustomColor = _useState6[1];
  var _useState7 = React.useState("1"),
    _useState8 = _slicedToArray(_useState7, 2),
    customStyle = _useState8[0],
    setcustomStyle = _useState8[1];
  var showSubMenu = React.useCallback(function (e, className) {
    var target = e.target;
    var menuItem = target.className === "fortune-toolbar-menu-line" ? target.parentElement : target;
    var menuItemRect = menuItem.getBoundingClientRect();
    var workbookContainerRect = refs.workbookContainer.current.getBoundingClientRect();
    var subMenu = menuItem.querySelector(".".concat(className));
    if (___default['default'].isNil(subMenu)) return;
    var menuItemStyle = window.getComputedStyle(menuItem);
    var menuItemPaddingRight = parseFloat(menuItemStyle.getPropertyValue("padding-right").replace("px", ""));
    if (workbookContainerRect.right - menuItemRect.right < parseFloat(subMenu.style.width.replace("px", ""))) {
      subMenu.style.display = "block";
      subMenu.style.right = "".concat(menuItemRect.width - menuItemPaddingRight, "px");
    } else {
      subMenu.style.display = "block";
      subMenu.style.right = className === "more-format" ? "".concat(-(parseFloat(subMenu.style.width.replace("px", "")) + 0), "px") : "".concat(-(parseFloat(subMenu.style.width.replace("px", "")) + menuItemPaddingRight), "px");
    }
  }, [refs.workbookContainer]);
  var hideSubMenu = React.useCallback(function (e, className) {
    var target = e.target;
    if (target.className === "".concat(className)) {
      target.style.display = "none";
      return;
    }
    var subMenu = target.className === "condition-format-item" ? target.parentElement : target.querySelector(".".concat(className));
    if (___default['default'].isNil(subMenu)) return;
    subMenu.style.display = "none";
  }, []);
  React.useEffect(function () {
    setToolbarWrapIndex(-1);
  }, [settings.toolbarItems, settings.customToolbarItems]);
  React.useEffect(function () {
    if (toolbarWrapIndex === -1) {
      var container = containerRef.current;
      if (!container) return;
      var items = container.querySelectorAll(".fortune-toolbar-item");
      if (!items) return;
      var locations = [];
      var containerRect = container.getBoundingClientRect();
      for (var i = 0; i < items.length; i += 1) {
        var item = items[i];
        var itemRect = item.getBoundingClientRect();
        locations.push(itemRect.left - containerRect.left + itemRect.width);
      }
      setItemLocations(locations);
    }
  }, [toolbarWrapIndex, sheetWidth]);
  React.useEffect(function () {
    if (itemLocations.length === 0) return;
    var container = containerRef.current;
    if (!container) return;
    var moreButtonWidth = 50;
    for (var i = itemLocations.length - 1; i >= 0; i -= 1) {
      var loc = itemLocations[i];
      if (loc + moreButtonWidth < container.clientWidth) {
        setToolbarWrapIndex(i - itemLocations.length + settings.toolbarItems.length);
        if (i === itemLocations.length - 1) {
          setMoreItems(null);
        }
        break;
      }
    }
  }, [itemLocations, setMoreItems, settings.toolbarItems.length, sheetWidth]);
  var getToolbarItem = React.useCallback(function (name, i) {
    var _toolbarItemSelectedF;
    var tooltip = toolbar[name];
    if (name === "|") {
      return /*#__PURE__*/React__default['default'].createElement(Divider, {
        key: i
      });
    }
    if (["font-color", "background"].includes(name)) {
      var pick = function pick(color) {
        setContext(function (draftCtx) {
          return (name === "font-color" ? core.handleTextColor : core.handleTextBackground)(draftCtx, refs.cellInput.current, color);
        });
        if (name === "font-color") {
          refs.globalCache.recentTextColor = color;
        } else {
          refs.globalCache.recentBackgroundColor = color;
        }
      };
      return /*#__PURE__*/React__default['default'].createElement("div", {
        style: {
          position: "relative"
        },
        key: name
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        style: {
          width: 17,
          height: 2,
          backgroundColor: name === "font-color" ? refs.globalCache.recentTextColor : refs.globalCache.recentBackgroundColor,
          position: "absolute",
          bottom: 8,
          left: 9,
          zIndex: 100
        }
      }), /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: name,
        tooltip: tooltip,
        onClick: function onClick() {
          var color = name === "font-color" ? refs.globalCache.recentTextColor : refs.globalCache.recentBackgroundColor;
          if (color) pick(color);
        }
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(CustomColor, {
          onCustomPick: function onCustomPick(color) {
            pick(color);
            setOpen(false);
          },
          onColorPick: pick
        });
      }));
    }
    if (name === "format") {
      var currentFmt = defaultFormat[0].text;
      if (cell) {
        var curr = core.normalizedCellAttr(cell, "ct");
        var format = ___default['default'].find(defaultFormat, function (v) {
          return v.value === (curr === null || curr === void 0 ? void 0 : curr.fa);
        });
        if ((curr === null || curr === void 0 ? void 0 : curr.fa) != null) {
          if (format != null) {
            currentFmt = format.text;
          } else {
            currentFmt = defaultFormat[defaultFormat.length - 1].text;
          }
        }
      }
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        text: currentFmt,
        key: name,
        tooltip: tooltip
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, defaultFormat.map(function (_ref2, ii) {
          var text = _ref2.text,
            value = _ref2.value,
            example = _ref2.example;
          if (value === "split") {
            return /*#__PURE__*/React__default['default'].createElement(MenuDivider, {
              key: ii
            });
          }
          if (value === "fmtOtherSelf") {
            return /*#__PURE__*/React__default['default'].createElement(Option, {
              key: value,
              onMouseEnter: function onMouseEnter(e) {
                return showSubMenu(e, "more-format");
              },
              onMouseLeave: function onMouseLeave(e) {
                return hideSubMenu(e, "more-format");
              }
            }, /*#__PURE__*/React__default['default'].createElement("div", {
              className: "fortune-toolbar-menu-line"
            }, /*#__PURE__*/React__default['default'].createElement("div", null, text), /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
              name: "rightArrow",
              width: 14
            })), /*#__PURE__*/React__default['default'].createElement("div", {
              className: "more-format toolbar-item-sub-menu fortune-toolbar-select",
              style: {
                display: "none",
                width: 150,
                bottom: 10,
                top: undefined
              }
            }, [{
              text: toolbarFormat.moreCurrency,
              onclick: function onclick() {
                showDialog(/*#__PURE__*/React__default['default'].createElement(FormatSearch, {
                  onCancel: hideDialog,
                  type: "currency"
                }));
                setOpen(false);
              }
            }, {
              text: toolbarFormat.moreNumber,
              onclick: function onclick() {
                showDialog(/*#__PURE__*/React__default['default'].createElement(FormatSearch, {
                  onCancel: hideDialog,
                  type: "number"
                }));
                setOpen(false);
              }
            }].map(function (v) {
              return /*#__PURE__*/React__default['default'].createElement("div", {
                className: "set-background-item fortune-toolbar-select-option",
                key: v.text,
                onClick: function onClick() {
                  v.onclick();
                  setOpen(false);
                },
                tabIndex: 0
              }, v.text);
            })));
          }
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              setOpen(false);
              setContext(function (ctx) {
                var d = core.getFlowdata(ctx);
                if (d == null) return;
                core.updateFormat(ctx, refs.cellInput.current, d, "ct", value);
              });
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, /*#__PURE__*/React__default['default'].createElement("div", null, text), /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-subtext"
          }, example)));
        }));
      });
    }
    if (name === "font") {
      var current = fontarray[0];
      if ((cell === null || cell === void 0 ? void 0 : cell.ff) != null) {
        if (___default['default'].isNumber(cell.ff)) {
          current = fontarray[cell.ff];
        } else {
          current = cell.ff;
        }
      }
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        text: current,
        key: name,
        tooltip: tooltip
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, fontarray.map(function (o) {
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: o,
            onClick: function onClick() {
              setContext(function (ctx) {
                current = o;
                var d = core.getFlowdata(ctx);
                if (!d) return;
                core.updateFormat(ctx, refs.cellInput.current, d, "ff", o);
              });
              setOpen(false);
            }
          }, o);
        }));
      });
    }
    if (name === "font-size") {
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        text: cell ? core.normalizedCellAttr(cell, "fs", context.defaultFontSize) : context.defaultFontSize.toString(),
        key: name,
        tooltip: tooltip
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, [9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(function (num) {
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: num,
            onClick: function onClick() {
              setContext(function (draftContext) {
                return core.handleTextSize(draftContext, refs.cellInput.current, num, refs.canvas.current.getContext("2d"));
              });
              setOpen(false);
            }
          }, num);
        }));
      });
    }
    if (name === "horizontal-align") {
      var _$find;
      var items = [{
        title: "align-left",
        text: align.left,
        value: 1
      }, {
        title: "align-center",
        text: align.center,
        value: 0
      }, {
        title: "align-right",
        text: align.right,
        value: 2
      }];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: ((_$find = ___default['default'].find(items, function (item) {
          return "".concat(item.value) === "".concat(cell === null || cell === void 0 ? void 0 : cell.ht);
        })) === null || _$find === void 0 ? void 0 : _$find.title) || "align-left",
        key: name,
        tooltip: toolbar.horizontalAlign
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, items.map(function (_ref3) {
          var text = _ref3.text,
            title = _ref3.title;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: title,
            onClick: function onClick() {
              setContext(function (ctx) {
                core.handleHorizontalAlign(ctx, refs.cellInput.current, title.replace("align-", ""));
              });
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, text, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
            name: title
          })));
        }));
      });
    }
    if (name === "vertical-align") {
      var _$find2;
      var _items = [{
        title: "align-top",
        text: align.top,
        value: 1
      }, {
        title: "align-middle",
        text: align.middle,
        value: 0
      }, {
        title: "align-bottom",
        text: align.bottom,
        value: 2
      }];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: ((_$find2 = ___default['default'].find(_items, function (item) {
          return "".concat(item.value) === "".concat(cell === null || cell === void 0 ? void 0 : cell.vt);
        })) === null || _$find2 === void 0 ? void 0 : _$find2.title) || "align-top",
        key: name,
        tooltip: toolbar.verticalAlign
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, _items.map(function (_ref4) {
          var text = _ref4.text,
            title = _ref4.title;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: title,
            onClick: function onClick() {
              setContext(function (ctx) {
                core.handleVerticalAlign(ctx, refs.cellInput.current, title.replace("align-", ""));
              });
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, text, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
            name: title
          })));
        }));
      });
    }
    if (name === "undo") {
      return /*#__PURE__*/React__default['default'].createElement(Button, {
        iconId: name,
        tooltip: tooltip,
        key: name,
        disabled: refs.globalCache.undoList.length === 0,
        onClick: function onClick() {
          return handleUndo();
        }
      });
    }
    if (name === "redo") {
      return /*#__PURE__*/React__default['default'].createElement(Button, {
        iconId: name,
        tooltip: tooltip,
        key: name,
        disabled: refs.globalCache.redoList.length === 0,
        onClick: function onClick() {
          return handleRedo();
        }
      });
    }
    if (name === "screenshot") {
      return /*#__PURE__*/React__default['default'].createElement(Button, {
        iconId: name,
        tooltip: tooltip,
        key: name,
        onClick: function onClick() {
          var imgsrc = core.handleScreenShot(contextRef.current);
          if (imgsrc) {
            showDialog(/*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement("div", null, screenshot.screenshotTipSuccess), /*#__PURE__*/React__default['default'].createElement("img", {
              src: imgsrc,
              alt: "",
              style: {
                maxWidth: "100%",
                maxHeight: "100%"
              }
            })));
          }
        }
      });
    }
    if (name === "splitColumn") {
      return /*#__PURE__*/React__default['default'].createElement(Button, {
        iconId: name,
        tooltip: tooltip,
        key: name,
        onClick: function onClick() {
          if (context.allowEdit === false) return;
          if (___default['default'].isUndefined(context.luckysheet_select_save)) {
            showDialog(splitText.tipNoSelect, "ok");
          } else {
            var currentColumn = context.luckysheet_select_save[context.luckysheet_select_save.length - 1].column;
            if (context.luckysheet_select_save.length > 1) {
              showDialog(splitText.tipNoMulti, "ok");
            } else if (currentColumn[0] !== currentColumn[1]) {
              showDialog(splitText.tipNoMultiColumn, "ok");
            } else {
              showDialog(/*#__PURE__*/React__default['default'].createElement(SplitColumn, null));
            }
          }
        }
      });
    }
    if (name === "dataVerification") {
      return /*#__PURE__*/React__default['default'].createElement(Button, {
        iconId: name,
        tooltip: tooltip,
        key: name,
        onClick: function onClick() {
          if (context.allowEdit === false) return;
          showDialog(/*#__PURE__*/React__default['default'].createElement(DataVerification, null));
        }
      });
    }
    if (name === "locationCondition") {
      var _items2 = [{
        text: findAndReplace.location,
        value: "location"
      }, {
        text: findAndReplace.locationFormula,
        value: "locationFormula"
      }, {
        text: findAndReplace.locationDate,
        value: "locationDate"
      }, {
        text: findAndReplace.locationDigital,
        value: "locationDigital"
      }, {
        text: findAndReplace.locationString,
        value: "locationString"
      }, {
        text: findAndReplace.locationError,
        value: "locationError"
      }, {
        text: findAndReplace.locationRowSpan,
        value: "locationRowSpan"
      }, {
        text: findAndReplace.columnSpan,
        value: "locationColumnSpan"
      }];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: "locationCondition",
        key: name,
        tooltip: findAndReplace.location
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, _items2.map(function (_ref5) {
          var text = _ref5.text,
            value = _ref5.value;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              var _context$luckysheet_s2, _context$luckysheet_s3;
              if (context.luckysheet_select_save == null) {
                showDialog(freezen.noSeletionError, "ok");
                return;
              }
              var last = context.luckysheet_select_save[0];
              var range;
              var rangeArr = [];
              if (((_context$luckysheet_s2 = context.luckysheet_select_save) === null || _context$luckysheet_s2 === void 0 ? void 0 : _context$luckysheet_s2.length) === 0 || ((_context$luckysheet_s3 = context.luckysheet_select_save) === null || _context$luckysheet_s3 === void 0 ? void 0 : _context$luckysheet_s3.length) === 1 && last.row[0] === last.row[1] && last.column[0] === last.column[1]) {
                range = [{
                  row: [0, flowdata.length - 1],
                  column: [0, flowdata[0].length - 1]
                }];
              } else {
                range = ___default['default'].assignIn([], context.luckysheet_select_save);
              }
              if (value === "location") {
                showDialog(/*#__PURE__*/React__default['default'].createElement(LocationCondition, null));
              } else if (value === "locationFormula") {
                setContext(function (ctx) {
                  rangeArr = core.applyLocation(range, "locationFormula", "all", ctx);
                });
              } else if (value === "locationDate") {
                setContext(function (ctx) {
                  rangeArr = core.applyLocation(range, "locationConstant", "d", ctx);
                });
              } else if (value === "locationDigital") {
                setContext(function (ctx) {
                  rangeArr = core.applyLocation(range, "locationConstant", "n", ctx);
                });
              } else if (value === "locationString") {
                setContext(function (ctx) {
                  rangeArr = core.applyLocation(range, "locationConstant", "s,g", ctx);
                });
              } else if (value === "locationError") {
                setContext(function (ctx) {
                  rangeArr = core.applyLocation(range, "locationConstant", "e", ctx);
                });
              } else if (value === "locationCondition") {
                setContext(function (ctx) {
                  rangeArr = core.applyLocation(range, "locationCF", undefined, ctx);
                });
              } else if (value === "locationRowSpan") {
                var _context$luckysheet_s4, _context$luckysheet_s5;
                if (((_context$luckysheet_s4 = context.luckysheet_select_save) === null || _context$luckysheet_s4 === void 0 ? void 0 : _context$luckysheet_s4.length) === 0 || ((_context$luckysheet_s5 = context.luckysheet_select_save) === null || _context$luckysheet_s5 === void 0 ? void 0 : _context$luckysheet_s5.length) === 1 && context.luckysheet_select_save[0].row[0] === context.luckysheet_select_save[0].row[1]) {
                  showDialog(findAndReplace.locationTiplessTwoRow, "ok");
                  return;
                }
                range = ___default['default'].assignIn([], context.luckysheet_select_save);
                setContext(function (ctx) {
                  rangeArr = core.applyLocation(range, "locationRowSpan", undefined, ctx);
                });
              } else if (value === "locationColumnSpan") {
                var _context$luckysheet_s6, _context$luckysheet_s7;
                if (((_context$luckysheet_s6 = context.luckysheet_select_save) === null || _context$luckysheet_s6 === void 0 ? void 0 : _context$luckysheet_s6.length) === 0 || ((_context$luckysheet_s7 = context.luckysheet_select_save) === null || _context$luckysheet_s7 === void 0 ? void 0 : _context$luckysheet_s7.length) === 1 && context.luckysheet_select_save[0].column[0] === context.luckysheet_select_save[0].column[1]) {
                  showDialog(findAndReplace.locationTiplessTwoColumn, "ok");
                  return;
                }
                range = ___default['default'].assignIn([], context.luckysheet_select_save);
                setContext(function (ctx) {
                  rangeArr = core.applyLocation(range, "locationColumnSpan", undefined, ctx);
                });
              }
              if (rangeArr.length === 0 && value !== "location") showDialog(findAndReplace.locationTipNotFindCell, "ok");
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, text));
        }));
      });
    }
    if (name === "conditionFormat") {
      var _items3 = ["highlightCellRules", "itemSelectionRules", "-", "deleteRule"];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: "conditionFormat",
        key: name,
        tooltip: toolbar.conditionalFormat
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(ConditionalFormat, {
          items: _items3,
          setOpen: setOpen
        });
      });
    }
    if (name === "image") {
      return /*#__PURE__*/React__default['default'].createElement(Button, {
        iconId: name,
        tooltip: toolbar.insertImage,
        key: name,
        onClick: function onClick() {
          if (context.allowEdit === false) return;
          core.showImgChooser();
        }
      }, /*#__PURE__*/React__default['default'].createElement("input", {
        id: "fortune-img-upload",
        type: "file",
        accept: "image/*",
        style: {
          display: "none"
        },
        onChange: function onChange(e) {
          var _e$currentTarget$file;
          var file = (_e$currentTarget$file = e.currentTarget.files) === null || _e$currentTarget$file === void 0 ? void 0 : _e$currentTarget$file[0];
          if (!file) return;
          var render = new FileReader();
          render.readAsDataURL(file);
          render.onload = function (event) {
            var _event$target;
            if (event.target == null) return;
            var src = (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.result;
            var image = new Image();
            image.onload = function () {
              setContext(function (draftCtx) {
                core.insertImage(draftCtx, image);
              });
            };
            image.src = src;
          };
          e.currentTarget.value = "";
        }
      }));
    }
    if (name === "comment") {
      var _context$luckysheet_s8, _flowdata$row_index, _flowdata$row_index$c;
      var last = (_context$luckysheet_s8 = context.luckysheet_select_save) === null || _context$luckysheet_s8 === void 0 ? void 0 : _context$luckysheet_s8[context.luckysheet_select_save.length - 1];
      var row_index = last === null || last === void 0 ? void 0 : last.row_focus;
      var col_index = last === null || last === void 0 ? void 0 : last.column_focus;
      if (!last) {
        row_index = 0;
        col_index = 0;
      } else {
        if (row_index == null) {
          var _last$row = _slicedToArray(last.row, 1);
          row_index = _last$row[0];
        }
        if (col_index == null) {
          var _last$column = _slicedToArray(last.column, 1);
          col_index = _last$column[0];
        }
      }
      var itemData;
      if ((flowdata === null || flowdata === void 0 ? void 0 : (_flowdata$row_index = flowdata[row_index]) === null || _flowdata$row_index === void 0 ? void 0 : (_flowdata$row_index$c = _flowdata$row_index[col_index]) === null || _flowdata$row_index$c === void 0 ? void 0 : _flowdata$row_index$c.ps) != null) {
        itemData = [{
          key: "edit",
          text: comment.edit,
          onClick: core.editComment
        }, {
          key: "delete",
          text: comment.delete,
          onClick: core.deleteComment
        }, {
          key: "showOrHide",
          text: comment.showOne,
          onClick: core.showHideComment
        }, {
          key: "showOrHideAll",
          text: comment.showAll,
          onClick: core.showHideAllComments
        }];
      } else {
        itemData = [{
          key: "new",
          text: comment.insert,
          onClick: core.newComment
        }, {
          key: "showOrHideAll",
          text: comment.showAll,
          onClick: core.showHideAllComments
        }];
      }
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: name,
        key: name,
        tooltip: tooltip
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, itemData.map(function (_ref6) {
          var key = _ref6.key,
            text = _ref6.text,
            _onClick = _ref6.onClick;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: key,
            onClick: function onClick() {
              setContext(function (draftContext) {
                return _onClick(draftContext, refs.globalCache, row_index, col_index);
              });
              setOpen(false);
            }
          }, text);
        }));
      });
    }
    if (name === "quick-formula") {
      var _itemData = [{
        text: formula.sum,
        value: "SUM"
      }, {
        text: formula.average,
        value: "AVERAGE"
      }, {
        text: formula.count,
        value: "COUNT"
      }, {
        text: formula.max,
        value: "MAX"
      }, {
        text: formula.min,
        value: "MIN"
      }];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: "formula-sum",
        key: name,
        tooltip: toolbar.autoSum,
        onClick: function onClick() {
          return setContext(function (ctx) {
            core.handleSum(ctx, refs.cellInput.current, refs.fxInput.current, refs.globalCache);
          });
        }
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, _itemData.map(function (_ref7) {
          var value = _ref7.value,
            text = _ref7.text;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              setContext(function (ctx) {
                core.autoSelectionFormula(ctx, refs.cellInput.current, refs.fxInput.current, value, refs.globalCache);
              });
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, /*#__PURE__*/React__default['default'].createElement("div", null, text), /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-subtext"
          }, value)));
        }), /*#__PURE__*/React__default['default'].createElement(MenuDivider, null), /*#__PURE__*/React__default['default'].createElement(Option, {
          key: "formula",
          onClick: function onClick() {
            showDialog(/*#__PURE__*/React__default['default'].createElement(FormulaSearch$1, {
              onCancel: hideDialog
            }));
            setOpen(false);
          }
        }, "".concat(formula.find, "...")));
      });
    }
    if (name === "merge-cell") {
      var itemdata = [{
        text: merge.mergeAll,
        value: "merge-all"
      }, {
        text: merge.mergeV,
        value: "merge-vertical"
      }, {
        text: merge.mergeH,
        value: "merge-horizontal"
      }, {
        text: merge.mergeCancel,
        value: "merge-cancel"
      }];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: "merge-all",
        key: name,
        tooltip: tooltip,
        text: "\u5408\u5E76\u5355\u5143\u683C",
        onClick: function onClick() {
          return setContext(function (ctx) {
            core.handleMerge(ctx, "merge-all");
          });
        }
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, itemdata.map(function (_ref8) {
          var text = _ref8.text,
            value = _ref8.value;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              setContext(function (ctx) {
                core.handleMerge(ctx, value);
              });
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
            name: value,
            style: {
              marginRight: 4
            }
          }), text));
        }));
      });
    }
    if (name === "border") {
      var _items4 = [{
        text: border.borderTop,
        value: "border-top"
      }, {
        text: border.borderBottom,
        value: "border-bottom"
      }, {
        text: border.borderLeft,
        value: "border-left"
      }, {
        text: border.borderRight,
        value: "border-right"
      }, {
        text: "",
        value: "divider"
      }, {
        text: border.borderNone,
        value: "border-none"
      }, {
        text: border.borderAll,
        value: "border-all"
      }, {
        text: border.borderOutside,
        value: "border-outside"
      }, {
        text: "",
        value: "divider"
      }, {
        text: border.borderInside,
        value: "border-inside"
      }, {
        text: border.borderHorizontal,
        value: "border-horizontal"
      }, {
        text: border.borderVertical,
        value: "border-vertical"
      }, {
        text: border.borderSlash,
        value: "border-slash"
      }, {
        text: "",
        value: "divider"
      }];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: "border-all",
        key: name,
        tooltip: tooltip,
        text: "\u8FB9\u6846\u8BBE\u7F6E",
        onClick: function onClick() {
          return setContext(function (ctx) {
            core.handleBorder(ctx, "border-all", customColor, customStyle);
          });
        }
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, _items4.map(function (_ref9, ii) {
          var text = _ref9.text,
            value = _ref9.value;
          return value !== "divider" ? (/*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              setContext(function (ctx) {
                core.handleBorder(ctx, value, customColor, customStyle);
              });
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, text, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
            name: value
          })))) : (/*#__PURE__*/React__default['default'].createElement(MenuDivider, {
            key: ii
          }));
        }), /*#__PURE__*/React__default['default'].createElement(CustomBorder, {
          onPick: function onPick(color, style) {
            setcustomColor(color);
            setcustomStyle(style);
          }
        }));
      });
    }
    if (name === "freeze") {
      var _items5 = [{
        text: freezen.freezenRowRange,
        value: "freeze-row"
      }, {
        text: freezen.freezenColumnRange,
        value: "freeze-col"
      }, {
        text: freezen.freezenRCRange,
        value: "freeze-row-col"
      }, {
        text: freezen.freezenCancel,
        value: "freeze-cancel"
      }];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: "freeze-row-col",
        key: name,
        tooltip: tooltip,
        onClick: function onClick() {
          return setContext(function (ctx) {
            core.handleFreeze(ctx, "freeze-row-col");
          });
        }
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, _items5.map(function (_ref0) {
          var text = _ref0.text,
            value = _ref0.value;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              setContext(function (ctx) {
                core.handleFreeze(ctx, value);
              });
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, text, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
            name: value
          })));
        }));
      });
    }
    if (name === "text-wrap") {
      var _items6 = [{
        text: textWrap.clip,
        iconId: "text-clip",
        value: "clip"
      }, {
        text: textWrap.overflow,
        iconId: "text-overflow",
        value: "overflow"
      }, {
        text: textWrap.wrap,
        iconId: "text-wrap",
        value: "wrap"
      }];
      var _curr = _items6[0];
      if ((cell === null || cell === void 0 ? void 0 : cell.tb) != null) {
        _curr = ___default['default'].get(_items6, cell.tb);
      }
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: _curr.iconId,
        key: name,
        tooltip: toolbar.textWrap
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, _items6.map(function (_ref1) {
          var text = _ref1.text,
            iconId = _ref1.iconId,
            value = _ref1.value;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              setContext(function (ctx) {
                var d = core.getFlowdata(ctx);
                if (d == null) return;
                core.updateFormat(ctx, refs.cellInput.current, d, "tb", value);
              });
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, text, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
            name: iconId
          })));
        }));
      });
    }
    if (name === "text-rotation") {
      var _items7 = [{
        text: rotation.none,
        iconId: "text-rotation-none",
        value: "none"
      }, {
        text: rotation.angleup,
        iconId: "text-rotation-angleup",
        value: "angleup"
      }, {
        text: rotation.angledown,
        iconId: "text-rotation-angledown",
        value: "angledown"
      }, {
        text: rotation.vertical,
        iconId: "text-rotation-vertical",
        value: "vertical"
      }, {
        text: rotation.rotationUp,
        iconId: "text-rotation-up",
        value: "rotation-up"
      }, {
        text: rotation.rotationDown,
        iconId: "text-rotation-down",
        value: "rotation-down"
      }];
      var _curr2 = _items7[0];
      if ((cell === null || cell === void 0 ? void 0 : cell.tr) != null) {
        _curr2 = ___default['default'].get(_items7, cell.tr);
      }
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: _curr2.iconId,
        key: name,
        tooltip: toolbar.textRotate
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, _items7.map(function (_ref10) {
          var text = _ref10.text,
            iconId = _ref10.iconId,
            value = _ref10.value;
          return /*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              setContext(function (ctx) {
                var d = core.getFlowdata(ctx);
                if (d == null) return;
                core.updateFormat(ctx, refs.cellInput.current, d, "tr", value);
              });
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, text, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
            name: iconId
          })));
        }));
      });
    }
    if (name === "filter") {
      var _items8 = [{
        iconId: "sort-asc",
        value: "sort-asc",
        text: sort.asc,
        onClick: function onClick() {
          setContext(function (ctx) {
            core.handleSort(ctx, true);
          });
        }
      }, {
        iconId: "sort-desc",
        value: "sort-desc",
        text: sort.desc,
        onClick: function onClick() {
          setContext(function (ctx) {
            core.handleSort(ctx, false);
          });
        }
      }, {
        iconId: "",
        value: "divider"
      }, {
        iconId: "filter1",
        value: "filter",
        text: filter.filter,
        onClick: function onClick() {
          return setContext(function (draftCtx) {
            core.createFilter(draftCtx);
          });
        }
      }, {
        iconId: "eraser",
        value: "eraser",
        text: filter.clearFilter,
        onClick: function onClick() {
          return setContext(function (draftCtx) {
            core.clearFilter(draftCtx);
          });
        }
      }];
      return /*#__PURE__*/React__default['default'].createElement(Combo, {
        iconId: "filter",
        key: name,
        tooltip: toolbar.sortAndFilter
      }, function (setOpen) {
        return /*#__PURE__*/React__default['default'].createElement(Select, null, _items8.map(function (_ref11, index) {
          var text = _ref11.text,
            iconId = _ref11.iconId,
            value = _ref11.value,
            _onClick2 = _ref11.onClick;
          return value !== "divider" ? (/*#__PURE__*/React__default['default'].createElement(Option, {
            key: value,
            onClick: function onClick() {
              _onClick2 === null || _onClick2 === void 0 ? void 0 : _onClick2();
              setOpen(false);
            }
          }, /*#__PURE__*/React__default['default'].createElement("div", {
            className: "fortune-toolbar-menu-line"
          }, text, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
            name: iconId
          })))) : (/*#__PURE__*/React__default['default'].createElement(MenuDivider, {
            key: "divider-".concat(index)
          }));
        }));
      });
    }
    return /*#__PURE__*/React__default['default'].createElement(Button, {
      iconId: name,
      tooltip: tooltip,
      key: name,
      selected: (_toolbarItemSelectedF = core.toolbarItemSelectedFunc(name)) === null || _toolbarItemSelectedF === void 0 ? void 0 : _toolbarItemSelectedF(cell),
      onClick: function onClick() {
        return setContext(function (draftCtx) {
          var _toolbarItemClickHand;
          (_toolbarItemClickHand = core.toolbarItemClickHandler(name)) === null || _toolbarItemClickHand === void 0 ? void 0 : _toolbarItemClickHand(draftCtx, refs.cellInput.current, refs.globalCache);
        });
      }
    });
  }, [toolbar, cell, setContext, refs.cellInput, refs.fxInput, refs.globalCache, defaultFormat, align, handleUndo, handleRedo, flowdata, formula, showDialog, hideDialog, merge, border, freezen, screenshot, sort, textWrap, rotation, filter, splitText, findAndReplace, context.luckysheet_select_save, context.defaultFontSize, context.allowEdit, comment, fontarray, hideSubMenu, showSubMenu, refs.canvas, customColor, customStyle, toolbarFormat.moreCurrency, toolbarFormat.moreNumber]);
  return /*#__PURE__*/React__default['default'].createElement("header", null, /*#__PURE__*/React__default['default'].createElement("div", {
    ref: containerRef,
    className: "fortune-toolbar",
    role: "toolbar",
    "aria-label": toolbar.toolbar
  }, settings.customToolbarItems.map(function (n) {
    return /*#__PURE__*/React__default['default'].createElement(CustomButton, {
      tooltip: n.tooltip,
      onClick: n.onClick,
      key: n.key,
      icon: n.icon,
      iconName: n.iconName
    }, n.children);
  }), ((_settings$customToolb = settings.customToolbarItems) === null || _settings$customToolb === void 0 ? void 0 : _settings$customToolb.length) > 0 ? (/*#__PURE__*/React__default['default'].createElement(Divider, {
    key: "customDivider"
  })) : null, (toolbarWrapIndex === -1 ? settings.toolbarItems : settings.toolbarItems.slice(0, toolbarWrapIndex + 1)).map(function (name, i) {
    return getToolbarItem(name, i);
  }), toolbarWrapIndex !== -1 && toolbarWrapIndex < settings.toolbarItems.length - 1 ? (/*#__PURE__*/React__default['default'].createElement(Button, {
    iconId: "more",
    tooltip: toolbar.toolMore,
    onClick: function onClick() {
      if (moreItemsOpen) {
        setMoreItems(null);
      } else {
        setMoreItems(settings.toolbarItems.slice(toolbarWrapIndex + 1).map(function (name, i) {
          return getToolbarItem(name, i);
        }));
      }
    }
  })) : null));
};

var LocationBox = function LocationBox() {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context;
  var rangeText = React.useMemo(function () {
    var lastSelection = ___default['default'].last(context.luckysheet_select_save);
    if (!(lastSelection && lastSelection.row_focus != null && lastSelection.column_focus != null)) return "";
    var rf = lastSelection.row_focus;
    var cf = lastSelection.column_focus;
    if (context.config.merge != null && "".concat(rf, "_").concat(cf) in context.config.merge) {
      return core.getRangetxt(context, context.currentSheetId, {
        column: [cf, cf],
        row: [rf, rf]
      });
    }
    return core.getRangetxt(context, context.currentSheetId, lastSelection);
  }, [context.currentSheetId, context.luckysheet_select_save]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-name-box-container"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-name-box",
    tabIndex: 0,
    dir: "ltr"
  }, rangeText));
};

var FxEditor = function FxEditor() {
  var _context$luckysheet_s;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var _useState = React.useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    focused = _useState2[0],
    setFocused = _useState2[1];
  var lastKeyDownEventRef = React.useRef(null);
  var inputContainerRef = React.useRef(null);
  var _useState3 = React.useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isHidenRC = _useState4[0],
    setIsHidenRC = _useState4[1];
  var firstSelection = (_context$luckysheet_s = context.luckysheet_select_save) === null || _context$luckysheet_s === void 0 ? void 0 : _context$luckysheet_s[0];
  var prevFirstSelection = usePrevious(firstSelection);
  var prevSheetId = usePrevious(context.currentSheetId);
  var recentText = React.useRef("");
  var _locale = core.locale(context),
    info = _locale.info;
  React.useEffect(function () {
    setIsHidenRC(core.isShowHidenCR(context));
    if (___default['default'].isEqual(prevFirstSelection, firstSelection) && context.currentSheetId === prevSheetId) {
      return;
    }
    var d = core.getFlowdata(context);
    var value = "";
    if (firstSelection) {
      var _d$r;
      var r = firstSelection.row_focus;
      var c = firstSelection.column_focus;
      if (___default['default'].isNil(r) || ___default['default'].isNil(c)) return;
      var cell = d === null || d === void 0 ? void 0 : (_d$r = d[r]) === null || _d$r === void 0 ? void 0 : _d$r[c];
      if (cell) {
        if (core.isInlineStringCell(cell)) {
          value = core.getInlineStringNoStyle(r, c, d);
        } else if (cell.f) {
          value = core.getCellValue(r, c, d, "f");
        } else {
          value = core.valueShowEs(r, c, d);
        }
      }
      refs.fxInput.current.innerHTML = core.escapeHTMLTag(core.escapeScriptTag(value));
    } else {
      refs.fxInput.current.innerHTML = "";
    }
  }, [context.luckysheetfile, context.currentSheetId, context.luckysheet_select_save]);
  var onFocus = React.useCallback(function () {
    var _context$luckysheet_s2, _context$luckysheet_s3;
    if (context.allowEdit === false) {
      return;
    }
    if (((_context$luckysheet_s2 = (_context$luckysheet_s3 = context.luckysheet_select_save) === null || _context$luckysheet_s3 === void 0 ? void 0 : _context$luckysheet_s3.length) !== null && _context$luckysheet_s2 !== void 0 ? _context$luckysheet_s2 : 0) > 0 && !context.luckysheet_cell_selected_move && core.isAllowEdit(context, context.luckysheet_select_save)) {
      setFocused(true);
      setContext(function (draftCtx) {
        var last = draftCtx.luckysheet_select_save[draftCtx.luckysheet_select_save.length - 1];
        var row_index = last.row_focus;
        var col_index = last.column_focus;
        draftCtx.luckysheetCellUpdate = [row_index, col_index];
        refs.globalCache.doNotFocus = true;
      });
    }
  }, [context.config, context.luckysheet_select_save, context.luckysheetfile, context.currentSheetId, refs.globalCache, setContext]);
  var onKeyDown = React.useCallback(function (e) {
    if (context.allowEdit === false) {
      return;
    }
    lastKeyDownEventRef.current = new KeyboardEvent(e.type, e.nativeEvent);
    var key = e.key;
    recentText.current = refs.fxInput.current.innerText;
    if (key === "ArrowLeft" || key === "ArrowRight") {
      e.stopPropagation();
    }
    setContext(function (draftCtx) {
      if (context.luckysheetCellUpdate.length > 0) {
        switch (key) {
          case "Enter":
            {
              var lastCellUpdate = ___default['default'].clone(draftCtx.luckysheetCellUpdate);
              core.updateCell(draftCtx, draftCtx.luckysheetCellUpdate[0], draftCtx.luckysheetCellUpdate[1], refs.fxInput.current);
              draftCtx.luckysheet_select_save = [{
                row: [lastCellUpdate[0], lastCellUpdate[0]],
                column: [lastCellUpdate[1], lastCellUpdate[1]],
                row_focus: lastCellUpdate[0],
                column_focus: lastCellUpdate[1]
              }];
              core.moveHighlightCell(draftCtx, "down", 1, "rangeOfSelect");
              e.preventDefault();
              e.stopPropagation();
              break;
            }
          case "Escape":
            {
              core.cancelNormalSelected(draftCtx);
              core.moveHighlightCell(draftCtx, "down", 0, "rangeOfSelect");
              e.preventDefault();
              e.stopPropagation();
              break;
            }
          case "ArrowLeft":
            {
              core.rangeHightlightselected(draftCtx, refs.fxInput.current);
              break;
            }
          case "ArrowRight":
            {
              core.rangeHightlightselected(draftCtx, refs.fxInput.current);
              break;
            }
        }
      }
    });
  }, [context.allowEdit, context.luckysheetCellUpdate.length, refs.fxInput, setContext]);
  var onChange = React.useCallback(function () {
    var e = lastKeyDownEventRef.current;
    if (!e) return;
    var kcode = e.keyCode;
    if (!kcode) return;
    if (!(kcode >= 112 && kcode <= 123 || kcode <= 46 || kcode === 144 || kcode === 108 || e.ctrlKey || e.altKey || e.shiftKey && (kcode === 37 || kcode === 38 || kcode === 39 || kcode === 40)) || kcode === 8 || kcode === 32 || kcode === 46 || e.ctrlKey && kcode === 86) {
      setContext(function (draftCtx) {
        core.handleFormulaInput(draftCtx, refs.cellInput.current, refs.fxInput.current, kcode, recentText.current);
      });
    }
  }, [refs.cellInput, refs.fxInput, setContext]);
  var allowEdit = React.useMemo(function () {
    if (context.allowEdit === false) {
      return false;
    }
    if (isHidenRC) {
      return false;
    }
    if (!core.isAllowEdit(context, context.luckysheet_select_save)) {
      return false;
    }
    return true;
  }, [context.config, context.luckysheet_select_save, context.luckysheetfile, context.currentSheetId, isHidenRC]);
  return /*#__PURE__*/React__default['default'].createElement("aside", null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-fx-editor"
  }, /*#__PURE__*/React__default['default'].createElement(LocationBox, null), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-fx-icon"
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "fx",
    width: 18,
    height: 18
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    ref: inputContainerRef,
    className: "fortune-fx-input-container"
  }, /*#__PURE__*/React__default['default'].createElement(ContentEditable, {
    innerRef: function innerRef(e) {
      refs.fxInput.current = e;
    },
    className: "fortune-fx-input",
    role: "textbox",
    id: "luckysheet-functionbox-cell",
    "aria-label": info.currentCellInput,
    onFocus: onFocus,
    onKeyDown: onKeyDown,
    onChange: onChange,
    onBlur: function onBlur() {
      return setFocused(false);
    },
    tabIndex: 0,
    allowEdit: allowEdit
  }), focused && (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement(FormulaSearch, {
    style: {
      top: inputContainerRef.current.clientHeight
    }
  }), /*#__PURE__*/React__default['default'].createElement(FormulaHint, {
    style: {
      top: inputContainerRef.current.clientHeight
    }
  }))))));
};

var SheetItem = function SheetItem(_ref) {
  var sheet = _ref.sheet,
    isDropPlaceholder = _ref.isDropPlaceholder;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var _useState = React.useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    editing = _useState2[0],
    setEditing = _useState2[1];
  var containerRef = React.useRef(null);
  var editable = React.useRef(null);
  var _useState3 = React.useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    dragOver = _useState4[0],
    setDragOver = _useState4[1];
  var _useState5 = React.useState("#c3c3c3"),
    _useState6 = _slicedToArray(_useState5, 2),
    svgColor = _useState6[0],
    setSvgColor = _useState6[1];
  var _useAlert = useAlert(),
    showAlert = _useAlert.showAlert;
  var _locale = core.locale(context),
    info = _locale.info;
  React.useEffect(function () {
    setContext(function (draftCtx) {
      var r = context.sheetScrollRecord[draftCtx === null || draftCtx === void 0 ? void 0 : draftCtx.currentSheetId];
      if (r) {
        var _r$scrollLeft, _r$scrollTop, _r$luckysheet_select_, _r$luckysheet_select_2;
        draftCtx.scrollLeft = (_r$scrollLeft = r.scrollLeft) !== null && _r$scrollLeft !== void 0 ? _r$scrollLeft : 0;
        draftCtx.scrollTop = (_r$scrollTop = r.scrollTop) !== null && _r$scrollTop !== void 0 ? _r$scrollTop : 0;
        draftCtx.luckysheet_select_status = (_r$luckysheet_select_ = r.luckysheet_select_status) !== null && _r$luckysheet_select_ !== void 0 ? _r$luckysheet_select_ : false;
        draftCtx.luckysheet_select_save = (_r$luckysheet_select_2 = r.luckysheet_select_save) !== null && _r$luckysheet_select_2 !== void 0 ? _r$luckysheet_select_2 : undefined;
      } else {
        draftCtx.scrollLeft = 0;
        draftCtx.scrollTop = 0;
        draftCtx.luckysheet_select_status = false;
        draftCtx.luckysheet_select_save = undefined;
      }
      draftCtx.luckysheet_selection_range = [];
    });
  }, [context.currentSheetId, context.sheetScrollRecord, setContext]);
  React.useEffect(function () {
    if (!editable.current) return;
    if (editing) {
      if (window.getSelection) {
        var range = document.createRange();
        range.selectNodeContents(editable.current);
        if (range.startContainer && document.body.contains(range.startContainer)) {
          var selection = window.getSelection();
          selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
          selection === null || selection === void 0 ? void 0 : selection.addRange(range);
        }
      } else if (document.selection) {
        var _range = document.body.createTextRange();
        _range.moveToElementText(editable.current);
        _range.select();
      }
    }
    editable.current.dataset.oldText = editable.current.innerText;
  }, [editing]);
  var onBlur = React.useCallback(function () {
    setContext(function (draftCtx) {
      try {
        core.editSheetName(draftCtx, editable.current);
      } catch (e) {
        showAlert(e.message);
      }
    });
    setEditing(false);
  }, [setContext, showAlert]);
  var onKeyDown = React.useCallback(function (e) {
    if (e.key === "Enter") {
      var _editable$current;
      (_editable$current = editable.current) === null || _editable$current === void 0 ? void 0 : _editable$current.blur();
    }
    e.stopPropagation();
  }, []);
  var onDragStart = React.useCallback(function (e) {
    if (context.allowEdit === true) e.dataTransfer.setData("sheetId", "".concat(sheet.id));
    e.stopPropagation();
  }, [context.allowEdit, sheet.id]);
  var onDrop = React.useCallback(function (e) {
    if (context.allowEdit === false) return;
    var draggingId = e.dataTransfer.getData("sheetId");
    setContext(function (draftCtx) {
      var droppingId = sheet.id;
      var draggingSheet;
      var droppingSheet;
      ___default['default'].sortBy(draftCtx.luckysheetfile, ["order"]).forEach(function (f, i) {
        f.order = i;
        if (f.id === draggingId) {
          draggingSheet = f;
        } else if (f.id === droppingId) {
          droppingSheet = f;
        }
      });
      if (draggingSheet && droppingSheet) {
        draggingSheet.order = droppingSheet.order - 0.1;
        ___default['default'].sortBy(draftCtx.luckysheetfile, ["order"]).forEach(function (f, i) {
          f.order = i;
        });
      } else if (draggingSheet && isDropPlaceholder) {
        draggingSheet.order = draftCtx.luckysheetfile.length;
      }
    });
    setDragOver(false);
    e.stopPropagation();
  }, [context.allowEdit, isDropPlaceholder, setContext, sheet.id]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    role: "button",
    onDragOver: function onDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    onDragEnter: function onDragEnter(e) {
      setDragOver(true);
      e.stopPropagation();
    },
    onDragLeave: function onDragLeave(e) {
      setDragOver(false);
      e.stopPropagation();
    },
    onDragEnd: function onDragEnd(e) {
      setDragOver(false);
      e.stopPropagation();
    },
    onDrop: onDrop,
    onDragStart: onDragStart,
    draggable: context.allowEdit && !editing,
    key: sheet.id,
    ref: containerRef,
    className: isDropPlaceholder ? "fortune-sheettab-placeholder" : "luckysheet-sheets-item".concat(context.currentSheetId === sheet.id ? " luckysheet-sheets-item-active" : ""),
    onClick: function onClick() {
      if (isDropPlaceholder) return;
      setContext(function (draftCtx) {
        draftCtx.sheetScrollRecord[draftCtx.currentSheetId] = {
          scrollLeft: draftCtx.scrollLeft,
          scrollTop: draftCtx.scrollTop,
          luckysheet_select_status: draftCtx.luckysheet_select_status,
          luckysheet_select_save: draftCtx.luckysheet_select_save,
          luckysheet_selection_range: draftCtx.luckysheet_selection_range
        };
        draftCtx.dataVerificationDropDownList = false;
        draftCtx.currentSheetId = sheet.id;
        draftCtx.zoomRatio = sheet.zoomRatio || 1;
        core.cancelActiveImgItem(draftCtx, refs.globalCache);
        core.cancelNormalSelected(draftCtx);
      });
    },
    tabIndex: 0,
    onContextMenu: function onContextMenu(e) {
      if (isDropPlaceholder) return;
      var rect = refs.workbookContainer.current.getBoundingClientRect();
      var pageX = e.pageX,
        pageY = e.pageY;
      setContext(function (ctx) {
        ctx.dataVerificationDropDownList = false;
        ctx.currentSheetId = sheet.id;
        ctx.zoomRatio = sheet.zoomRatio || 1;
        ctx.sheetTabContextMenu = {
          x: pageX - rect.left - window.scrollX,
          y: pageY - rect.top - window.scrollY,
          sheet: sheet,
          onRename: function onRename() {
            return setEditing(true);
          }
        };
      });
    },
    style: {
      borderLeft: dragOver ? "2px solid #0188fb" : "",
      display: sheet.hide === 1 ? "none" : ""
    }
  }, /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-sheets-item-name",
    spellCheck: "false",
    suppressContentEditableWarning: true,
    contentEditable: isDropPlaceholder ? false : editing,
    onDoubleClick: function onDoubleClick() {
      return setEditing(true);
    },
    onBlur: onBlur,
    onKeyDown: onKeyDown,
    ref: editable,
    style: dragOver ? {
      pointerEvents: "none"
    } : {}
  }, sheet.name), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-sheets-item-function",
    onMouseEnter: function onMouseEnter() {
      return setSvgColor("#5c5c5c");
    },
    onMouseLeave: function onMouseLeave() {
      return setSvgColor("#c3c3c3");
    },
    onClick: function onClick(e) {
      if (isDropPlaceholder || context.allowEdit === false) return;
      var rect = refs.workbookContainer.current.getBoundingClientRect();
      var pageX = e.pageX,
        pageY = e.pageY;
      setContext(function (ctx) {
        ctx.currentSheetId = sheet.id;
        ctx.sheetTabContextMenu = {
          x: pageX - rect.left - window.scrollX,
          y: pageY - rect.top - window.scrollY,
          sheet: sheet,
          onRename: function onRename() {
            return setEditing(true);
          }
        };
      });
    },
    tabIndex: 0,
    "aria-label": info.sheetOptions
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "downArrow",
    width: 12,
    style: {
      fill: svgColor
    }
  })), !!sheet.color && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-sheets-item-color",
    style: {
      background: sheet.color
    }
  })));
};

var presets = [{
  text: "10%",
  value: 0.1
}, {
  text: "30%",
  value: 0.3
}, {
  text: "50%",
  value: 0.5
}, {
  text: "70%",
  value: 0.7
}, {
  text: "100%",
  value: 1
}, {
  text: "150%",
  value: 1.5
}, {
  text: "200%",
  value: 2
}, {
  text: "300%",
  value: 3
}, {
  text: "400%",
  value: 4
}];
var ZoomControl = function ZoomControl() {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var menuRef = React.useRef(null);
  var _useState = React.useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    radioMenuOpen = _useState2[0],
    setRadioMenuOpen = _useState2[1];
  var _locale = core.locale(context),
    info = _locale.info;
  useOutsideClick(menuRef, function () {
    setRadioMenuOpen(false);
  }, []);
  var zoomTo = React.useCallback(function (val) {
    val = parseFloat(val.toFixed(1));
    if (val > core.MAX_ZOOM_RATIO || val < core.MIN_ZOOM_RATIO) {
      return;
    }
    setContext(function (ctx) {
      var index = core.getSheetIndex(ctx, ctx.currentSheetId);
      if (index == null) {
        return;
      }
      ctx.luckysheetfile[index].zoomRatio = val;
      ctx.zoomRatio = val;
    }, {
      noHistory: true
    });
  }, [setContext]);
  return /*#__PURE__*/React__default['default'].createElement("aside", {
    title: "Zoom settings",
    className: "fortune-zoom-container"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-zoom-button",
    "aria-label": info.zoomOut,
    onClick: function onClick(e) {
      zoomTo(context.zoomRatio - 0.1);
      e.stopPropagation();
    },
    tabIndex: 0,
    role: "button"
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "minus",
    width: 16,
    height: 16
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-zoom-ratio"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-zoom-ratio-current fortune-zoom-button",
    onClick: function onClick() {
      return setRadioMenuOpen(true);
    },
    tabIndex: 0
  }, (context.zoomRatio * 100).toFixed(0), "%"), radioMenuOpen && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-zoom-ratio-menu",
    ref: menuRef
  }, presets.map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-zoom-ratio-item",
      key: v.text,
      onClick: function onClick(e) {
        zoomTo(v.value);
        e.preventDefault();
      },
      tabIndex: 0
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "fortune-zoom-ratio-text"
    }, v.text));
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-zoom-button",
    "aria-label": info.zoomIn,
    onClick: function onClick(e) {
      zoomTo(context.zoomRatio + 0.1);
      e.stopPropagation();
    },
    tabIndex: 0,
    role: "button"
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "plus",
    width: 16,
    height: 16
  })));
};

var SheetTab = function SheetTab() {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    settings = _useContext.settings,
    refs = _useContext.refs;
  var tabContainerRef = React.useRef(null);
  var leftScrollRef = React.useRef(null);
  var rightScrollRef = React.useRef(null);
  var _useState = React.useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isShowScrollBtn = _useState2[0],
    setIsShowScrollBtn = _useState2[1];
  var _useState3 = React.useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    isShowBoundary = _useState4[0],
    setIsShowBoundary = _useState4[1];
  var _locale = core.locale(context),
    info = _locale.info;
  var scrollDelta = 150;
  var scrollBy = React.useCallback(function (amount) {
    var _tabContainerRef$curr;
    if (tabContainerRef.current == null || tabContainerRef.current.scrollLeft == null) {
      return;
    }
    var scrollLeft = tabContainerRef.current.scrollLeft;
    if (scrollLeft + amount <= 0) setIsShowBoundary(true);else if (scrollLeft > 0) setIsShowBoundary(false);
    (_tabContainerRef$curr = tabContainerRef.current) === null || _tabContainerRef$curr === void 0 ? void 0 : _tabContainerRef$curr.scrollBy({
      left: amount,
      behavior: "smooth"
    });
  }, []);
  React.useEffect(function () {
    var tabCurrent = tabContainerRef.current;
    if (!tabCurrent) return;
    setIsShowScrollBtn(tabCurrent.scrollWidth - 2 > tabCurrent.clientWidth);
  }, [context.luckysheetfile]);
  var onAddSheetClick = React.useCallback(function () {
    return setTimeout(function () {
      setContext(function (draftCtx) {
        if (draftCtx.luckysheetCellUpdate.length > 0) {
          core.updateCell(draftCtx, draftCtx.luckysheetCellUpdate[0], draftCtx.luckysheetCellUpdate[1], refs.cellInput.current);
        }
        core.addSheet(draftCtx, settings);
      }, {
        addSheetOp: true
      });
      var tabCurrent = tabContainerRef.current;
      setIsShowScrollBtn(tabCurrent.scrollWidth > tabCurrent.clientWidth);
    });
  }, [refs.cellInput, setContext, settings]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-sheet-area luckysheet-noselected-text",
    onContextMenu: function onContextMenu(e) {
      return e.preventDefault();
    },
    id: "luckysheet-sheet-area"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-sheet-content"
  }, context.allowEdit && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sheettab-button",
    onClick: onAddSheetClick,
    tabIndex: 0,
    "aria-label": info.newSheet,
    role: "button"
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "plus",
    width: 16,
    height: 16
  }))), context.allowEdit && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "sheet-list-container"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    id: "all-sheets",
    className: "fortune-sheettab-button",
    ref: tabContainerRef,
    onMouseDown: function onMouseDown(e) {
      e.stopPropagation();
      setContext(function (ctx) {
        ctx.showSheetList = ___default['default'].isUndefined(ctx.showSheetList) ? true : !ctx.showSheetList;
        ctx.sheetTabContextMenu = {};
      });
    }
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "all-sheets",
    width: 16,
    height: 16
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    id: "luckysheet-sheets-m",
    className: "luckysheet-sheets-m lucky-button-custom"
  }, /*#__PURE__*/React__default['default'].createElement("i", {
    className: "iconfont luckysheet-iconfont-caidan2"
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sheettab-container",
    id: "fortune-sheettab-container"
  }, !isShowBoundary && /*#__PURE__*/React__default['default'].createElement("div", {
    className: "boundary boundary-left"
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sheettab-container-c",
    id: "fortune-sheettab-container-c",
    ref: tabContainerRef
  }, ___default['default'].sortBy(context.luckysheetfile, function (s) {
    return Number(s.order);
  }).map(function (sheet) {
    return /*#__PURE__*/React__default['default'].createElement(SheetItem, {
      key: sheet.id,
      sheet: sheet
    });
  })), isShowBoundary && isShowScrollBtn && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "boundary boundary-right"
  }))), isShowScrollBtn && (/*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-sheettab-leftscroll",
    className: "fortune-sheettab-scroll",
    ref: leftScrollRef,
    onClick: function onClick() {
      scrollBy(-scrollDelta);
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "arrow-doubleleft",
    width: 12,
    height: 12
  }))), isShowScrollBtn && (/*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-sheettab-rightscroll",
    className: "fortune-sheettab-scroll",
    ref: rightScrollRef,
    onClick: function onClick() {
      scrollBy(scrollDelta);
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "arrow-doubleright",
    width: 12,
    height: 12
  })))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sheet-area-right"
  }, /*#__PURE__*/React__default['default'].createElement(ZoomControl, null)));
};

var Divider$1 = function Divider() {
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-context-menu-divider"
  });
};

function activateClosestMenuItemOnEnter(e) {
  var _e$currentTarget$clos;
  e.stopPropagation();
  if (e.key !== "Enter" || e.repeat) return;
  e.preventDefault();
  (_e$currentTarget$clos = e.currentTarget.closest(".luckysheet-cols-menuitem")) === null || _e$currentTarget$clos === void 0 ? void 0 : _e$currentTarget$clos.click();
}
var Menu = function Menu(_ref) {
  var _onClick = _ref.onClick,
    _onMouseLeave = _ref.onMouseLeave,
    _onMouseEnter = _ref.onMouseEnter,
    children = _ref.children;
  React.useEffect(function () {
    var element = document.querySelector(".luckysheet-cols-menuitem");
    if (element) {
      element.focus();
    }
  }, []);
  var containerRef = React.useRef(null);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    ref: containerRef,
    className: "luckysheet-cols-menuitem luckysheet-mousedown-cancel",
    onClick: function onClick(e) {
      return _onClick === null || _onClick === void 0 ? void 0 : _onClick(e, containerRef.current);
    },
    onMouseLeave: function onMouseLeave(e) {
      return _onMouseLeave === null || _onMouseLeave === void 0 ? void 0 : _onMouseLeave(e, containerRef.current);
    },
    onMouseEnter: function onMouseEnter(e) {
      return _onMouseEnter === null || _onMouseEnter === void 0 ? void 0 : _onMouseEnter(e, containerRef.current);
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-cols-menuitem-content luckysheet-mousedown-cancel"
  }, children));
};

var CustomSort = function CustomSort() {
  var _useState = React.useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    rangeColChar = _useState2[0],
    setRangeColChar = _useState2[1];
  var _useState3 = React.useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    ascOrDesc = _useState4[0],
    setAscOrDesc = _useState4[1];
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var _useState5 = React.useState("0"),
    _useState6 = _slicedToArray(_useState5, 2),
    selectedValue = _useState6[0],
    setSelectedValue = _useState6[1];
  var _useState7 = React.useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    isTitleChange = _useState8[0],
    setIstitleChange = _useState8[1];
  var _locale = core.locale(context),
    sort = _locale.sort;
  var _useDialog = useDialog(),
    hideDialog = _useDialog.hideDialog;
  var col_start = context.luckysheet_select_save[0].column[0];
  var col_end = context.luckysheet_select_save[0].column[1];
  var row_start = context.luckysheet_select_save[0].row[0];
  var row_end = context.luckysheet_select_save[0].row[1];
  var sheetIndex = core.getSheetIndex(context, context.currentSheetId);
  var handleSelectChange = function handleSelectChange(event) {
    setSelectedValue(event.target.value);
  };
  var handleRadioChange = React.useCallback(function (e) {
    var sortValue = e.target.value;
    setAscOrDesc(sortValue === "asc");
  }, []);
  var handleTitleChange = React.useCallback(function (e) {
    var value = e.target.checked;
    setIstitleChange(value);
  }, []);
  React.useEffect(function () {
    var list = [];
    if (isTitleChange) {
      for (var i = col_start; i <= col_end; i += 1) {
        var _context$luckysheetfi, _context$luckysheetfi2;
        var cell = (_context$luckysheetfi = context.luckysheetfile[sheetIndex].data) === null || _context$luckysheetfi === void 0 ? void 0 : (_context$luckysheetfi2 = _context$luckysheetfi[row_start]) === null || _context$luckysheetfi2 === void 0 ? void 0 : _context$luckysheetfi2[i];
        var colHeaderValue = (cell === null || cell === void 0 ? void 0 : cell.m) || (cell === null || cell === void 0 ? void 0 : cell.v);
        if (colHeaderValue) {
          list.push(colHeaderValue);
        } else {
          var ColumnChar = core.indexToColumnChar(i);
          list.push("".concat(sort.columnOperation, " ").concat(ColumnChar));
        }
      }
    } else {
      for (var _i = col_start; _i <= col_end; _i += 1) {
        var _ColumnChar = core.indexToColumnChar(_i);
        list.push(_ColumnChar);
      }
    }
    setRangeColChar(list);
  }, [col_end, col_start, context.luckysheetfile, isTitleChange, row_start, sheetIndex, sort.columnOperation]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sort"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sort-title"
  }, /*#__PURE__*/React__default['default'].createElement("span", null, /*#__PURE__*/React__default['default'].createElement("span", null, sort.sortRangeTitle), core.indexToColumnChar(col_start), row_start + 1, /*#__PURE__*/React__default['default'].createElement("span", null, sort.sortRangeTitleTo), core.indexToColumnChar(col_end), row_end + 1)), /*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sort-modal"
  }, /*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "checkbox",
    id: "fortune-sort-haveheader",
    onChange: handleTitleChange
  }), /*#__PURE__*/React__default['default'].createElement("span", null, sort.hasTitle)), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sort-tablec"
  }, /*#__PURE__*/React__default['default'].createElement("table", {
    cellSpacing: "0"
  }, /*#__PURE__*/React__default['default'].createElement("tbody", null, /*#__PURE__*/React__default['default'].createElement("tr", null, /*#__PURE__*/React__default['default'].createElement("td", {
    style: {
      width: "190px"
    }
  }, sort.sortBy, /*#__PURE__*/React__default['default'].createElement("select", {
    name: "sort_0",
    onChange: handleSelectChange
  }, rangeColChar.map(function (col, index) {
    return /*#__PURE__*/React__default['default'].createElement("option", {
      value: index,
      key: index
    }, col);
  }))), /*#__PURE__*/React__default['default'].createElement("td", null, /*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "radio",
    value: "asc",
    defaultChecked: true,
    name: "sort_0",
    onChange: handleRadioChange
  }), /*#__PURE__*/React__default['default'].createElement("span", null, sort.asc)), /*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement("input", {
    type: "radio",
    value: "desc",
    name: "sort_0",
    onChange: handleRadioChange
  }), /*#__PURE__*/React__default['default'].createElement("span", null, sort.desc))))))))), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sort-button"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      setContext(function (draftCtx) {
        core.sortSelection(draftCtx, ascOrDesc, parseInt(selectedValue, 10));
        draftCtx.contextMenu = {};
      });
      hideDialog();
    },
    tabIndex: 0
  }, sort.confirm)));
};

var ContextMenu = function ContextMenu() {
  var _useDialog = useDialog(),
    showDialog = _useDialog.showDialog;
  var containerRef = React.useRef(null);
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    settings = _useContext.settings,
    refs = _useContext.refs;
  var contextMenu = context.contextMenu;
  var _useAlert = useAlert(),
    showAlert = _useAlert.showAlert;
  var _locale = core.locale(context),
    rightclick = _locale.rightclick,
    drag = _locale.drag,
    generalDialog = _locale.generalDialog,
    info = _locale.info;
  var getMenuElement = React.useCallback(function (name, i) {
    var _context$luckysheet_s;
    var selection = (_context$luckysheet_s = context.luckysheet_select_save) === null || _context$luckysheet_s === void 0 ? void 0 : _context$luckysheet_s[0];
    if (name === "|") {
      return /*#__PURE__*/React__default['default'].createElement(Divider$1, {
        key: "divider-".concat(i)
      });
    }
    if (name === "copy") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          setContext(function (draftCtx) {
            var _draftCtx$luckysheet_;
            if (((_draftCtx$luckysheet_ = draftCtx.luckysheet_select_save) === null || _draftCtx$luckysheet_ === void 0 ? void 0 : _draftCtx$luckysheet_.length) > 1) {
              showAlert(rightclick.noMulti, "ok");
              draftCtx.contextMenu = {};
              return;
            }
            core.handleCopy(draftCtx);
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.copy);
    }
    if (name === "paste" && regeneratorRuntime__default['default']) {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function () {
          var _onClick = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
            var clipboardText, sessionClipboardText, finalText, _t;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.p = _context.n) {
                case 0:
                  clipboardText = "";
                  sessionClipboardText = sessionStorage.getItem("localClipboard") || "";
                  _context.p = 1;
                  _context.n = 2;
                  return navigator.clipboard.readText();
                case 2:
                  clipboardText = _context.v;
                  _context.n = 4;
                  break;
                case 3:
                  _context.p = 3;
                  _t = _context.v;
                  console.warn("Clipboard access blocked. Attempting to use sessionStorage fallback.");
                case 4:
                  finalText = clipboardText || sessionClipboardText;
                  setContext(function (draftCtx) {
                    core.handlePasteByClick(draftCtx, finalText);
                    draftCtx.contextMenu = {};
                  });
                case 5:
                  return _context.a(2);
              }
            }, _callee, null, [[1, 3]]);
          }));
          function onClick() {
            return _onClick.apply(this, arguments);
          }
          return onClick;
        }()
      }, rightclick.paste);
    }
    if (name === "insert-column") {
      return (selection === null || selection === void 0 ? void 0 : selection.row_select) ? null : ["left", "right"].map(function (dir) {
        var _context$lang, _context$lang2;
        return /*#__PURE__*/React__default['default'].createElement(Menu, {
          key: "add-col-".concat(dir),
          onClick: function onClick(_e, container) {
            var _context$luckysheet_s2, _context$luckysheet_s3, _context$luckysheet_s4, _container$querySelec;
            var position = (_context$luckysheet_s2 = context.luckysheet_select_save) === null || _context$luckysheet_s2 === void 0 ? void 0 : (_context$luckysheet_s3 = _context$luckysheet_s2[0]) === null || _context$luckysheet_s3 === void 0 ? void 0 : (_context$luckysheet_s4 = _context$luckysheet_s3.column) === null || _context$luckysheet_s4 === void 0 ? void 0 : _context$luckysheet_s4[0];
            if (position == null) return;
            var countStr = (_container$querySelec = container.querySelector("input")) === null || _container$querySelec === void 0 ? void 0 : _container$querySelec.value;
            if (countStr == null) return;
            var count = parseInt(countStr, 10);
            if (count < 1) return;
            var direction = dir === "left" ? "lefttop" : "rightbottom";
            var insertRowColOp = {
              type: "column",
              index: position,
              count: count,
              direction: direction,
              id: context.currentSheetId
            };
            setContext(function (draftCtx) {
              try {
                core.insertRowCol(draftCtx, insertRowColOp);
                draftCtx.contextMenu = {};
              } catch (err) {
                if (err.message === "maxExceeded") showAlert(rightclick.columnOverLimit, "ok");else if (err.message === "readOnly") showAlert(rightclick.cannotInsertOnColumnReadOnly, "ok");
                draftCtx.contextMenu = {};
              }
            }, {
              insertRowColOp: insertRowColOp
            });
          }
        }, /*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, ___default['default'].startsWith((_context$lang = context.lang) !== null && _context$lang !== void 0 ? _context$lang : "", "zh") && (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, rightclick.to, /*#__PURE__*/React__default['default'].createElement("span", {
          className: "luckysheet-cols-rows-shift-".concat(dir)
        }, rightclick[dir]))), "".concat(rightclick.insert, "  "), /*#__PURE__*/React__default['default'].createElement("input", {
          onClick: function onClick(e) {
            return e.stopPropagation();
          },
          onKeyDown: activateClosestMenuItemOnEnter,
          tabIndex: 0,
          type: "text",
          className: "luckysheet-mousedown-cancel",
          placeholder: rightclick.number,
          defaultValue: "1"
        }), /*#__PURE__*/React__default['default'].createElement("span", {
          className: "luckysheet-cols-rows-shift-word luckysheet-mousedown-cancel"
        }, "".concat(rightclick.column, "  ")), !___default['default'].startsWith((_context$lang2 = context.lang) !== null && _context$lang2 !== void 0 ? _context$lang2 : "", "zh") && (/*#__PURE__*/React__default['default'].createElement("span", {
          className: "luckysheet-cols-rows-shift-".concat(dir)
        }, rightclick[dir]))));
      });
    }
    if (name === "insert-row") {
      return (selection === null || selection === void 0 ? void 0 : selection.column_select) ? null : ["top", "bottom"].map(function (dir) {
        var _context$lang3, _context$lang4;
        return /*#__PURE__*/React__default['default'].createElement(Menu, {
          key: "add-row-".concat(dir),
          onClick: function onClick(e, container) {
            var _context$luckysheet_s5, _context$luckysheet_s6, _context$luckysheet_s7, _container$querySelec2;
            var position = (_context$luckysheet_s5 = context.luckysheet_select_save) === null || _context$luckysheet_s5 === void 0 ? void 0 : (_context$luckysheet_s6 = _context$luckysheet_s5[0]) === null || _context$luckysheet_s6 === void 0 ? void 0 : (_context$luckysheet_s7 = _context$luckysheet_s6.row) === null || _context$luckysheet_s7 === void 0 ? void 0 : _context$luckysheet_s7[0];
            if (position == null) return;
            var countStr = (_container$querySelec2 = container.querySelector("input")) === null || _container$querySelec2 === void 0 ? void 0 : _container$querySelec2.value;
            if (countStr == null) return;
            var count = parseInt(countStr, 10);
            if (count < 1) return;
            var direction = dir === "top" ? "lefttop" : "rightbottom";
            var insertRowColOp = {
              type: "row",
              index: position,
              count: count,
              direction: direction,
              id: context.currentSheetId
            };
            setContext(function (draftCtx) {
              try {
                core.insertRowCol(draftCtx, insertRowColOp);
                draftCtx.contextMenu = {};
              } catch (err) {
                if (err.message === "maxExceeded") showAlert(rightclick.rowOverLimit, "ok");else if (err.message === "readOnly") showAlert(rightclick.cannotInsertOnRowReadOnly, "ok");
                draftCtx.contextMenu = {};
              }
            }, {
              insertRowColOp: insertRowColOp
            });
          }
        }, /*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, ___default['default'].startsWith((_context$lang3 = context.lang) !== null && _context$lang3 !== void 0 ? _context$lang3 : "", "zh") && (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, rightclick.to, /*#__PURE__*/React__default['default'].createElement("span", {
          className: "luckysheet-cols-rows-shift-".concat(dir)
        }, rightclick[dir]))), "".concat(rightclick.insert, "  "), /*#__PURE__*/React__default['default'].createElement("input", {
          onClick: function onClick(e) {
            return e.stopPropagation();
          },
          onKeyDown: activateClosestMenuItemOnEnter,
          tabIndex: 0,
          type: "text",
          className: "luckysheet-mousedown-cancel",
          placeholder: rightclick.number,
          defaultValue: "1"
        }), /*#__PURE__*/React__default['default'].createElement("span", {
          className: "luckysheet-cols-rows-shift-word luckysheet-mousedown-cancel"
        }, "".concat(rightclick.row, "  ")), !___default['default'].startsWith((_context$lang4 = context.lang) !== null && _context$lang4 !== void 0 ? _context$lang4 : "", "zh") && (/*#__PURE__*/React__default['default'].createElement("span", {
          className: "luckysheet-cols-rows-shift-".concat(dir)
        }, rightclick[dir]))));
      });
    }
    if (name === "delete-column") {
      return (selection === null || selection === void 0 ? void 0 : selection.column_select) && (/*#__PURE__*/React__default['default'].createElement(Menu, {
        key: "delete-col",
        onClick: function onClick() {
          if (!selection) return;
          var _selection$column = _slicedToArray(selection.column, 2),
            st_index = _selection$column[0],
            ed_index = _selection$column[1];
          var deleteRowColOp = {
            type: "column",
            start: st_index,
            end: ed_index,
            id: context.currentSheetId
          };
          setContext(function (draftCtx) {
            var _draftCtx$luckysheet_2, _draftCtx$luckysheetf, _draftCtx$luckysheetf2;
            if (((_draftCtx$luckysheet_2 = draftCtx.luckysheet_select_save) === null || _draftCtx$luckysheet_2 === void 0 ? void 0 : _draftCtx$luckysheet_2.length) > 1) {
              showAlert(rightclick.noMulti, "ok");
              draftCtx.contextMenu = {};
              draftCtx.dataVerificationDropDownList = false;
              return;
            }
            var slen = ed_index - st_index + 1;
            var index = core.getSheetIndex(draftCtx, context.currentSheetId);
            if (((_draftCtx$luckysheetf = draftCtx.luckysheetfile[index].data) === null || _draftCtx$luckysheetf === void 0 ? void 0 : (_draftCtx$luckysheetf2 = _draftCtx$luckysheetf[0]) === null || _draftCtx$luckysheetf2 === void 0 ? void 0 : _draftCtx$luckysheetf2.length) <= slen) {
              showAlert(rightclick.cannotDeleteAllColumn, "ok");
              draftCtx.contextMenu = {};
              return;
            }
            try {
              core.deleteRowCol(draftCtx, deleteRowColOp);
            } catch (e) {
              if (e.message === "readOnly") {
                showAlert(rightclick.cannotDeleteColumnReadOnly, "ok");
              }
            }
            draftCtx.contextMenu = {};
          }, {
            deleteRowColOp: deleteRowColOp
          });
        }
      }, rightclick.deleteSelected, rightclick.column));
    }
    if (name === "delete-row") {
      return (selection === null || selection === void 0 ? void 0 : selection.row_select) && (/*#__PURE__*/React__default['default'].createElement(Menu, {
        key: "delete-row",
        onClick: function onClick() {
          if (!selection) return;
          var _selection$row = _slicedToArray(selection.row, 2),
            st_index = _selection$row[0],
            ed_index = _selection$row[1];
          var deleteRowColOp = {
            type: "row",
            start: st_index,
            end: ed_index,
            id: context.currentSheetId
          };
          setContext(function (draftCtx) {
            var _draftCtx$luckysheet_3, _draftCtx$luckysheetf3;
            if (((_draftCtx$luckysheet_3 = draftCtx.luckysheet_select_save) === null || _draftCtx$luckysheet_3 === void 0 ? void 0 : _draftCtx$luckysheet_3.length) > 1) {
              showAlert(rightclick.noMulti, "ok");
              draftCtx.contextMenu = {};
              return;
            }
            var slen = ed_index - st_index + 1;
            var index = core.getSheetIndex(draftCtx, context.currentSheetId);
            if (((_draftCtx$luckysheetf3 = draftCtx.luckysheetfile[index].data) === null || _draftCtx$luckysheetf3 === void 0 ? void 0 : _draftCtx$luckysheetf3.length) <= slen) {
              showAlert(rightclick.cannotDeleteAllRow, "ok");
              draftCtx.contextMenu = {};
              return;
            }
            try {
              core.deleteRowCol(draftCtx, deleteRowColOp);
            } catch (e) {
              if (e.message === "readOnly") {
                showAlert(rightclick.cannotDeleteRowReadOnly, "ok");
              }
            }
            draftCtx.contextMenu = {};
          }, {
            deleteRowColOp: deleteRowColOp
          });
        }
      }, rightclick.deleteSelected, rightclick.row));
    }
    if (name === "hide-row") {
      return (selection === null || selection === void 0 ? void 0 : selection.row_select) === true && ["hideSelected", "showHide"].map(function (item) {
        return /*#__PURE__*/React__default['default'].createElement(Menu, {
          key: item,
          onClick: function onClick() {
            setContext(function (draftCtx) {
              var msg = "";
              if (item === "hideSelected") {
                msg = core.hideSelected(draftCtx, "row");
              } else if (item === "showHide") {
                core.showSelected(draftCtx, "row");
              }
              if (msg === "noMulti") {
                showDialog(drag.noMulti);
              }
              draftCtx.contextMenu = {};
            });
          }
        }, rightclick[item] + rightclick.row);
      });
    }
    if (name === "hide-column") {
      return (selection === null || selection === void 0 ? void 0 : selection.column_select) === true && ["hideSelected", "showHide"].map(function (item) {
        return /*#__PURE__*/React__default['default'].createElement(Menu, {
          key: item,
          onClick: function onClick() {
            setContext(function (draftCtx) {
              var msg = "";
              if (item === "hideSelected") {
                msg = core.hideSelected(draftCtx, "column");
              } else if (item === "showHide") {
                core.showSelected(draftCtx, "column");
              }
              if (msg === "noMulti") {
                showDialog(drag.noMulti);
              }
              draftCtx.contextMenu = {};
            });
          }
        }, rightclick[item] + rightclick.column);
      });
    }
    if (name === "set-row-height") {
      var _context$luckysheet_s8, _context$luckysheet_s9;
      var rowHeight = (selection === null || selection === void 0 ? void 0 : selection.height) || context.defaultrowlen;
      var shownRowHeight = ((_context$luckysheet_s8 = context.luckysheet_select_save) === null || _context$luckysheet_s8 === void 0 ? void 0 : _context$luckysheet_s8.some(function (section) {
        return section.height_move !== (rowHeight + 1) * (section.row[1] - section.row[0] + 1) - 1;
      })) ? "" : rowHeight;
      return ((_context$luckysheet_s9 = context.luckysheet_select_save) === null || _context$luckysheet_s9 === void 0 ? void 0 : _context$luckysheet_s9.some(function (section) {
        return section.row_select;
      })) ? (/*#__PURE__*/React__default['default'].createElement(Menu, {
        key: "set-row-height",
        onClick: function onClick(e, container) {
          var _container$querySelec3;
          var targetRowHeight = (_container$querySelec3 = container.querySelector("input")) === null || _container$querySelec3 === void 0 ? void 0 : _container$querySelec3.value;
          setContext(function (draftCtx) {
            if (___default['default'].isUndefined(targetRowHeight) || targetRowHeight === "" || parseInt(targetRowHeight, 10) <= 0 || parseInt(targetRowHeight, 10) > 545) {
              showAlert(info.tipRowHeightLimit, "ok");
              draftCtx.contextMenu = {};
              return;
            }
            var numRowHeight = parseInt(targetRowHeight, 10);
            var rowHeightList = {};
            ___default['default'].forEach(draftCtx.luckysheet_select_save, function (section) {
              for (var rowNum = section.row[0]; rowNum <= section.row[1]; rowNum += 1) {
                rowHeightList[rowNum] = numRowHeight;
              }
            });
            core.api.setRowHeight(draftCtx, rowHeightList, {}, true);
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.row, rightclick.height, /*#__PURE__*/React__default['default'].createElement("input", {
        onClick: function onClick(e) {
          return e.stopPropagation();
        },
        onKeyDown: activateClosestMenuItemOnEnter,
        tabIndex: 0,
        type: "number",
        min: 1,
        max: 545,
        className: "luckysheet-mousedown-cancel",
        placeholder: rightclick.number,
        defaultValue: shownRowHeight,
        style: {
          width: "40px"
        }
      }), "px")) : null;
    }
    if (name === "set-column-width") {
      var _context$luckysheet_s0, _context$luckysheet_s1;
      var colWidth = (selection === null || selection === void 0 ? void 0 : selection.width) || context.defaultcollen;
      var shownColWidth = ((_context$luckysheet_s0 = context.luckysheet_select_save) === null || _context$luckysheet_s0 === void 0 ? void 0 : _context$luckysheet_s0.some(function (section) {
        return section.width_move !== (colWidth + 1) * (section.column[1] - section.column[0] + 1) - 1;
      })) ? "" : colWidth;
      return ((_context$luckysheet_s1 = context.luckysheet_select_save) === null || _context$luckysheet_s1 === void 0 ? void 0 : _context$luckysheet_s1.some(function (section) {
        return section.column_select;
      })) ? (/*#__PURE__*/React__default['default'].createElement(Menu, {
        key: "set-column-width",
        onClick: function onClick(e, container) {
          var _container$querySelec4;
          var targetColWidth = (_container$querySelec4 = container.querySelector("input")) === null || _container$querySelec4 === void 0 ? void 0 : _container$querySelec4.value;
          setContext(function (draftCtx) {
            if (___default['default'].isUndefined(targetColWidth) || targetColWidth === "" || parseInt(targetColWidth, 10) <= 0 || parseInt(targetColWidth, 10) > 2038) {
              showAlert(info.tipColumnWidthLimit, "ok");
              draftCtx.contextMenu = {};
              return;
            }
            var numColWidth = parseInt(targetColWidth, 10);
            var colWidthList = {};
            ___default['default'].forEach(draftCtx.luckysheet_select_save, function (section) {
              for (var colNum = section.column[0]; colNum <= section.column[1]; colNum += 1) {
                colWidthList[colNum] = numColWidth;
              }
            });
            core.api.setColumnWidth(draftCtx, colWidthList, {}, true);
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.column, rightclick.width, /*#__PURE__*/React__default['default'].createElement("input", {
        onClick: function onClick(e) {
          return e.stopPropagation();
        },
        onKeyDown: activateClosestMenuItemOnEnter,
        tabIndex: 0,
        type: "number",
        min: 1,
        max: 545,
        className: "luckysheet-mousedown-cancel",
        placeholder: rightclick.number,
        defaultValue: shownColWidth,
        style: {
          width: "40px"
        }
      }), "px")) : null;
    }
    if (name === "clear") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          setContext(function (draftCtx) {
            var allowEdit = core.isAllowEdit(draftCtx);
            if (!allowEdit) return;
            if (draftCtx.activeImg != null) {
              core.removeActiveImage(draftCtx);
            } else {
              var msg = core.deleteSelectedCellText(draftCtx);
              if (msg === "partMC") {
                showDialog(generalDialog.partiallyError, "ok");
              } else if (msg === "allowEdit") {
                showDialog(generalDialog.readOnlyError, "ok");
              } else if (msg === "dataNullError") {
                showDialog(generalDialog.dataNullError, "ok");
              }
            }
            draftCtx.contextMenu = {};
            core.jfrefreshgrid(draftCtx, null, undefined);
          });
        }
      }, rightclick.clearContent);
    }
    if (name === "orderAZ") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          setContext(function (draftCtx) {
            core.sortSelection(draftCtx, true);
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.orderAZ);
    }
    if (name === "orderZA") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          setContext(function (draftCtx) {
            core.sortSelection(draftCtx, false);
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.orderZA);
    }
    if (name === "sort") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          setContext(function (draftCtx) {
            showDialog(/*#__PURE__*/React__default['default'].createElement(CustomSort, null));
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.sortSelection);
    }
    if (name === "filter") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          setContext(function (draftCtx) {
            core.createFilter(draftCtx);
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.filterSelection);
    }
    if (name === "image") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          setContext(function (draftCtx) {
            core.showImgChooser();
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.image);
    }
    if (name === "link") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          setContext(function (draftCtx) {
            core.handleLink(draftCtx);
            draftCtx.contextMenu = {};
          });
        }
      }, rightclick.link);
    }
    return null;
  }, [context.currentSheetId, context.lang, context.luckysheet_select_save, context.defaultrowlen, context.defaultcollen, rightclick, info, setContext, showAlert, showDialog, drag, generalDialog]);
  React.useLayoutEffect(function () {
    var _refs$workbookContain;
    if (!containerRef.current) {
      return;
    }
    var winH = window.innerHeight;
    var winW = window.innerWidth;
    var rect = containerRef.current.getBoundingClientRect();
    var workbookRect = (_refs$workbookContain = refs.workbookContainer.current) === null || _refs$workbookContain === void 0 ? void 0 : _refs$workbookContain.getBoundingClientRect();
    if (!workbookRect) {
      return;
    }
    var menuW = rect.width;
    var menuH = rect.height;
    var top = contextMenu.y || 0;
    var left = contextMenu.x || 0;
    var hasOverflow = false;
    if (workbookRect.left + left + menuW > winW) {
      left -= menuW;
      hasOverflow = true;
    }
    if (workbookRect.top + top + menuH > winH) {
      top -= menuH;
      hasOverflow = true;
    }
    if (top < 0) {
      top = 0;
      hasOverflow = true;
    }
    if (hasOverflow) {
      setContext(function (draftCtx) {
        draftCtx.contextMenu.x = left;
        draftCtx.contextMenu.y = top;
      });
    }
  }, [contextMenu.x, contextMenu.y, refs.workbookContainer, setContext]);
  if (___default['default'].isEmpty(context.contextMenu)) return null;
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-context-menu luckysheet-cols-menu",
    ref: containerRef,
    onContextMenu: function onContextMenu(e) {
      return e.stopPropagation();
    },
    style: {
      left: contextMenu.x,
      top: contextMenu.y
    }
  }, context.contextMenu.headerMenu === true ? settings.headerContextMenu.map(function (menu, i) {
    return getMenuElement(menu, i);
  }) : settings.cellContextMenu.map(function (menu, i) {
    return getMenuElement(menu, i);
  }));
};

var getPath = function getPath(currency) {
  switch (currency) {
    case "$":
      return "M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z";
    case "€":
      return "M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936c0-.11 0-.219.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.617 6.617 0 0010.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z";
    case "£":
      return "M4 8.585h1.969c.115.465.186.939.186 1.43 0 1.385-.736 2.496-2.075 2.771V14H12v-1.24H6.492v-.129c.825-.525 1.135-1.446 1.135-2.694 0-.465-.07-.913-.168-1.352h3.29v-.972H7.22c-.186-.723-.372-1.455-.372-2.247 0-1.274 1.047-2.066 2.58-2.066a5.32 5.32 0 012.103.465V2.456A5.629 5.629 0 009.348 2C6.865 2 5.322 3.291 5.322 5.366c0 .775.195 1.515.399 2.247H4v.972z";
    case "₹":
      return "M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4v1.06z";
    default:
      return "M8.75 14v-2.629h2.446v-.967H8.75v-1.31h2.445v-.967H9.128L12.5 2h-1.699L8.047 7.327h-.086L5.207 2H3.5l3.363 6.127H4.778v.968H7.25v1.31H4.78v.966h2.47V14h1.502z";
  }
};
var SVGDefines = function SVGDefines(_ref) {
  var currency = _ref.currency;
  return /*#__PURE__*/React__default['default'].createElement("svg", {
    style: {
      position: "absolute",
      width: 0,
      height: 0
    },
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink"
  }, /*#__PURE__*/React__default['default'].createElement("defs", null, /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "add"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "4.75",
    y: "4.75",
    width: "14.5",
    height: "14.5",
    rx: "0.75",
    stroke: "#424A59",
    strokeOpacity: "0.9",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "11.25",
    y: "8.5",
    width: "1.5",
    height: "7",
    fill: "#535B68"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "15.5",
    y: "11.25",
    width: "1.5",
    height: "7",
    transform: "rotate(90 15.5 11.25)",
    fill: "#535B68"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "align-bottom"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M9.25 12.5L12.0002 15.5L14.75 12.5H9.25Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.5",
    y: "16.5",
    width: "13",
    height: "1.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "11.25",
    y: "5.5",
    width: "1.5",
    height: "7.5",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "align-center"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5 6.75H19",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M8 12H16",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5 17.25L19 17.25",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "align-justify"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M19.5 6.5H4.5",
    stroke: "#525C6F",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M19.5 12L4.5 12",
    stroke: "#525C6F",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M19.5 17.5H4.5",
    stroke: "#525C6F",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "align-left"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5 6.75H19",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5 12H13",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5 17.25L19 17.25",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "align-middle"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M9.25 16.5L12.0002 13.5L14.75 16.5H9.25Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M9.25 7L12.0002 10L14.75 7L9.25 7Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.5",
    y: "11",
    width: "13",
    height: "1.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "11.25",
    y: "16",
    width: "1.5",
    height: "3.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "11.25",
    y: "4",
    width: "1.5",
    height: "3.5",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "align-right"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5 6.75H19",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M11 12H19",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5 17.25L19 17.25",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "align-top"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M9.25 11L12.0002 8L14.75 11H9.25Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.5",
    y: "5.5",
    width: "13",
    height: "1.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "11.25",
    y: "10.5",
    width: "1.5",
    height: "7.5",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "bold"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M6.30566 5.07617V18.9992H12.4872C13.9107 18.9992 15.0417 18.7067 15.8607 18.1607C16.8162 17.4977 17.3037 16.4837 17.3037 15.1187C17.3037 14.1827 17.0307 13.4417 16.5237 12.8567C16.0167 12.2717 15.3147 11.8817 14.3982 11.7257C15.1002 11.4917 15.6657 11.1212 16.0947 10.6142C16.5042 10.0487 16.7187 9.36617 16.7187 8.58617C16.7187 7.49417 16.3482 6.63617 15.6072 6.01217C14.8467 5.38817 13.8132 5.07617 12.5262 5.07617H6.30566ZM7.90466 6.42167H12.1557C13.1307 6.42167 13.8717 6.59717 14.3787 6.98717C14.8857 7.37717 15.1392 7.96217 15.1392 8.74217C15.1392 9.54167 14.8662 10.1462 14.3592 10.5557C13.8522 10.9457 13.1112 11.1602 12.1362 11.1602H7.90466V6.42167ZM7.90466 12.4862H12.3507C13.4232 12.4862 14.2422 12.6812 14.8077 13.1102C15.3927 13.5392 15.7047 14.2022 15.7047 15.0992C15.7047 15.9962 15.3537 16.6787 14.6712 17.1077C14.0862 17.4587 13.3257 17.6537 12.3507 17.6537H7.90466V12.4862Z",
    fill: "#394259"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-all"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-bottom"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "5",
    y1: "18.25",
    x2: "19",
    y2: "18.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-color"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M16 10.9106L18.9511 13.8617L14.5431 18.2697H11.592V15.3186L16 10.9106Z",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.5 6.5H17.5V9.84613H19V6.5V5H17.5H6.5H5V6.5V17.5V19H6.5H9.84616V17.5H6.5V6.5Z",
    fill: "#535A68"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-horizontal"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "5",
    y1: "18.25",
    x2: "19",
    y2: "18.25",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border_diagonal_down"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "17.9697",
    y1: "18.0303",
    x2: "5.96967",
    y2: "6.03033",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border_diagonal_up"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    y1: "-0.75",
    x2: "16.9706",
    y2: "-0.75",
    transform: "matrix(0.707107 -0.707107 -0.707107 -0.707107 5.5 17.5)",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-inside"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-left"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "5.75",
    y1: "19",
    x2: "5.75",
    y2: "5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-none"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-outside"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-right"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "18.25",
    y1: "19",
    x2: "18.25",
    y2: "5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-vertical"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "18.25",
    y1: "19",
    x2: "18.25",
    y2: "5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-slash"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "5.75",
    y1: "5.75",
    x2: "17.95",
    y2: "17.95",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-style"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "5",
    y1: "5.75",
    x2: "19",
    y2: "5.75",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "5",
    y1: "12.25",
    x2: "7.5",
    y2: "12.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "8.8252",
    y1: "12.25",
    x2: "11.3252",
    y2: "12.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12.6504",
    y1: "12.25",
    x2: "15.1504",
    y2: "12.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "16.4746",
    y1: "12.25",
    x2: "18.9746",
    y2: "12.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "5",
    y1: "18.25",
    x2: "6.5",
    y2: "18.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "7.08008",
    y1: "18.25",
    x2: "8.58008",
    y2: "18.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "9.16016",
    y1: "18.25",
    x2: "10.6602",
    y2: "18.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "11.2402",
    y1: "18.25",
    x2: "12.7402",
    y2: "18.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "13.3203",
    y1: "18.25",
    x2: "14.8203",
    y2: "18.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "15.4004",
    y1: "18.25",
    x2: "16.9004",
    y2: "18.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "17.4805",
    y1: "18.25",
    x2: "18.9805",
    y2: "18.25",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "border-top"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#CCCED2",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "5",
    y1: "5.75",
    x2: "19",
    y2: "5.75",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 18 18",
    fill: "none",
    id: "close"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M13.9255 5L5.00091 13.9246",
    stroke: "#262A33",
    strokeOpacity: "0.9",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M13.9255 13.9238L5.00091 4.9992",
    stroke: "#262A33",
    strokeOpacity: "0.9",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 10 24",
    fill: "none",
    id: "combo-arrow"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M8 10H2L5 14L8 10Z",
    fill: "#A6A6A6"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    fill: "none",
    viewBox: "0 0 24 24",
    id: "comment"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.968 15.7L12 17.956l2.032-2.258H18.5v-10h-13v10h4.468zm1.289 3.673L9.3 17.2H5.5A1.5 1.5 0 014 15.7v-10a1.5 1.5 0 011.5-1.5h13A1.5 1.5 0 0120 5.7v10a1.5 1.5 0 01-1.5 1.5h-3.8l-1.957 2.174a1 1 0 01-1.486 0z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M7 8.2h10v1.5H7V8.2zM7 11.699h6v1.5H7z",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "strike-through"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "6",
    y: "11.5",
    width: "13",
    height: "1.5",
    fill: "#394259"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M9.00344 11.5C9.69342 11.9717 10.6431 12.3814 11.8525 12.729C13.071 13.0815 13.9121 13.4403 14.376 13.8052C14.8398 14.1639 15.0718 14.6742 15.0718 15.3359C15.0718 15.9977 14.8213 16.5203 14.3203 16.9038C13.8193 17.2873 13.0988 17.479 12.1587 17.479C11.1506 17.479 10.3434 17.244 9.7373 16.7739C9.13737 16.2977 8.8374 15.6514 8.8374 14.835H7.04688C7.04688 15.6204 7.26335 16.3224 7.69629 16.9409C8.13542 17.5594 8.757 18.048 9.56104 18.4067C10.3651 18.7593 11.231 18.9355 12.1587 18.9355C13.5874 18.9355 14.7285 18.6077 15.582 17.9521C16.4355 17.2904 16.8623 16.4121 16.8623 15.3174C16.8623 14.6309 16.7077 14.034 16.3984 13.5269C16.0954 13.0197 15.6253 12.5775 14.9883 12.2002C14.581 11.9526 14.0705 11.7192 13.457 11.5H9.00344Z",
    fill: "#394259"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M7.71685 10C7.5547 9.61466 7.47363 9.19458 7.47363 8.73975C7.47363 7.67594 7.8973 6.79769 8.74463 6.10498C9.59814 5.40609 10.7052 5.05664 12.0659 5.05664C12.9937 5.05664 13.8193 5.236 14.543 5.59473C15.2728 5.95345 15.8356 6.44824 16.2314 7.0791C16.6335 7.70996 16.8345 8.39958 16.8345 9.14795H15.0439C15.0439 8.33154 14.7842 7.69141 14.2646 7.22754C13.7451 6.75749 13.0122 6.52246 12.0659 6.52246C11.1877 6.52246 10.5011 6.71729 10.0063 7.10693C9.51774 7.4904 9.27344 8.02539 9.27344 8.71191C9.27344 9.2095 9.46296 9.63887 9.84201 10H7.71685Z",
    fill: "#394259"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "clear-format"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "8",
    y1: "18.25",
    x2: "20",
    y2: "18.25",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M14 7.12132L17.8787 11L10 18.8787L6.12132 15L14 7.12132ZM14 5L15.0607 6.06066L18.9393 9.93934L20 11L18.9393 12.0607L12 19L8 19L5.06066 16.0607L4 15L5.06066 13.9393L12.9393 6.06066L14 5Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "13.9375",
    y: "6.12316",
    width: "6.98528",
    height: "5.7265",
    transform: "rotate(45 13.9375 6.12316)",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "image"
  }, /*#__PURE__*/React__default['default'].createElement("circle", {
    cx: "8.75",
    cy: "8.75",
    r: "1.25",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "4.75",
    y: "5.25",
    width: "14.5",
    height: "13.5",
    rx: "0.75",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M7 19L12.984 11.8949C13.1659 11.6789 13.4905 11.6563 13.7006 11.845L19.5 17.0556",
    stroke: "#525C6F",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "italic"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M11 5H16V6.5H11V5Z",
    fill: "#394259"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M9 17.5H14V19H9V17.5Z",
    fill: "#394259"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M10.7598 17.877L12.7598 5.87695L14.2394 6.12355L12.2394 18.1236L10.7598 17.877Z",
    fill: "#394259"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "merge-cancel"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M13 14.9998L16.5 11.9996L13 8.99982V14.9998Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M11 14.9998L7.5 11.9996L11 8.99982L11 14.9998Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "10",
    y: "11.2498",
    width: "4.5",
    height: "1.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.5 6.49982H6.5L6.5 17.4998H9.5V15.4999H11V17.4998V18.9998H9.5H6.5H5V17.4998L5 6.49982V4.99982H6.5H9.5L11 4.99982V6.49982V8.49988H9.5V6.49982ZM13 15.4999V15.9998V17.4998V18.9998H14.5H17.5H19V17.4998V6.49982V4.99982H17.5H14.5H13V6.49982V7.99982V8.49988H14.5V7.99982V6.49982H17.5V17.4998H14.5L14.5 15.9998V15.4999H13Z",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "merge-horizontal"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M11 15L14.5 11.9998L11 9V15Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5",
    y: "11.25",
    width: "8.5",
    height: "1.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.5 6.5H7.5H9.5H11V5H9.5H6.5H5V6.5V17.5V19H6.5H9.5H11V17.5H9.5H7.5H6.5V6.5ZM13 16V15.5H14.5V16V17.5H17.5V6.5H14.5V8V8.5H13V8V6.5V5H14.5H17.5H19V6.5V17.5V19H17.5H14.5H13V17.5V16Z",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "merge-vertical"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M9 10.9998L12.0002 14.4998L15 10.9998L9 10.9998Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "12.75",
    y: "4.99982",
    width: "8.5",
    height: "1.5",
    transform: "rotate(90 12.75 4.99982)",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M17.5 6.49982L17.5 7L17.5 10.9998H19V9.49982V6.49982V4.99982H17.5L6.5 4.99982H5V6.49982L5 9.49982V10.9998H6.5V9.49982L6.5 7L6.5 6.49982L17.5 6.49982ZM8 12.9998L8.5 12.9998V14.4998H8H6.5V17.4998H17.5V14.4998H16H15.5V12.9998H16H17.5H19L19 14.4998V17.4998V18.9998H17.5H6.5L5 18.9998L5 17.4998V14.4998V12.9998H6.5H8Z",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "merge-all"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M15.5 14.9998L12 11.9996L15.5 8.99982V14.9998Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M8.5 14.9998L12 11.9996L8.5 8.99982L8.5 14.9998Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "7",
    y: "11.2498",
    width: "2.5",
    height: "1.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "14.5",
    y: "11.2498",
    width: "2.5",
    height: "1.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.5 6.49982H6.5L6.5 17.4998H9.5V15.4999H11V17.4998V18.9998H9.5H6.5H5V17.4998L5 6.49982V4.99982H6.5H9.5L11 4.99982V6.49982V8.49988H9.5V6.49982ZM13 15.4999V15.9998V17.4998V18.9998H14.5H17.5H19V17.4998V6.49982V4.99982H17.5H14.5H13V6.49982V7.99982V8.49988H14.5V7.99982V6.49982H17.5V17.4998H14.5L14.5 15.9998V15.4999H13Z",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    fill: "none",
    viewBox: "0 0 16 16",
    id: "plus"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M8 1.715v12.571M1.714 8h12.572",
    stroke: "#666",
    strokeWidth: "1.714"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    version: "1.1",
    "p-id": "4116",
    id: "minus"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M801.895 542.105h-579.79C205.479 542.105 192 528.627 192 512c0-16.627 13.479-30.105 30.105-30.105h579.789C818.521 481.895 832 495.373 832 512c0 16.627-13.479 30.105-30.105 30.105z",
    "p-id": "4117"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "-100 -100 1224 1224",
    fill: "#525C6F",
    id: "background"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M766.4 744.3c43.7 0 79.4-36.2 79.4-80.5 0-53.5-79.4-140.8-79.4-140.8S687 610.3 687 663.8c0 44.3 35.7 80.5 79.4 80.5zM389.3 700.2c7.1 7.1 18.6 7.1 25.6 0l256.1-256c7.1-7.1 7.1-18.6 0-25.6l-256-256c-0.6-0.6-1.3-1.2-2-1.7l-78.2-78.2c-3.5-3.5-9.3-3.5-12.8 0l-48 48c-3.5 3.5-3.5 9.3 0 12.8l67.2 67.2-207.8 207.9c-7.1 7.1-7.1 18.6 0 25.6l255.9 256z m12.9-448.6l178.9 178.9H223.4l178.8-178.9zM904 816H120c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-80c0-4.4-3.6-8-8-8z"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "-100 -100 1224 1224",
    fill: "#525C6F",
    id: "font-color"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M904 816H120c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-80c0-4.4-3.6-8-8-8zM253.7 736h85c4.2 0 8-2.7 9.3-6.8l53.7-166h219.2l53.2 166c1.3 4 5 6.8 9.3 6.8h89.1c1.1 0 2.2-0.2 3.2-0.5 5.1-1.8 7.8-7.3 6-12.4L573.6 118.6c-1.4-3.9-5.1-6.6-9.2-6.6H462.1c-4.2 0-7.9 2.6-9.2 6.6L244.5 723.1c-0.4 1-0.5 2.1-0.5 3.2-0.1 5.3 4.3 9.7 9.7 9.7z m255.9-516.1h4.1l83.8 263.8H424.9l84.7-263.8z"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "text-overflow"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M16.5 15L20 11.9998L16.5 9V15Z",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "7",
    y: "11.25",
    width: "9.5",
    height: "1.5",
    fill: "#525C6F"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "4.75",
    y1: "5",
    x2: "4.75",
    y2: "19",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12.25",
    y1: "5",
    x2: "12.25",
    y2: "9.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12.25",
    y1: "14.5",
    x2: "12.25",
    y2: "19",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "text-wrap"
  }, /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "4.75",
    y1: "5",
    x2: "4.75",
    y2: "19",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "19.25",
    y1: "5",
    x2: "19.25",
    y2: "19",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M7.00001 16.2502L9.99 13.5V15.5H12.0005C13.9335 15.5 15.5005 13.933 15.5005 12C15.5005 10.067 13.9335 8.5 12.0005 8.5H7V7H12.0005C14.7619 7 17.0005 9.23857 17.0005 12C17.0005 14.7614 14.7619 17 12.0005 17H9.99V19L7.00001 16.2502Z",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "underline"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M17 19H7V17.5H17V19Z",
    fill: "#394259"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.25 5V12.25C9.25 13.7688 10.4812 15 12 15C13.5188 15 14.75 13.7688 14.75 12.25V5H16.25V12.25C16.25 14.5972 14.3472 16.5 12 16.5C9.65278 16.5 7.75 14.5972 7.75 12.25V5H9.25Z",
    fill: "#394259"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "undo"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M3.5 7.75001L7.2019 10.835V8.5H13.25C15.4591 8.5 17.25 10.2909 17.25 12.5C17.25 14.7091 15.4591 16.5 13.25 16.5H7V18H13.25C16.2876 18 18.75 15.5376 18.75 12.5C18.75 9.46244 16.2876 7 13.25 7H7.2019V4.66547L3.5 7.75001Z",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "redo"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M20.5 7.75001L16.7981 10.835V8.5H10.75C8.54086 8.5 6.75 10.2909 6.75 12.5C6.75 14.7091 8.54086 16.5 10.75 16.5H17V18H10.75C7.71243 18 5.25 15.5376 5.25 12.5C5.25 9.46244 7.71243 7 10.75 7H16.7981V4.66547L20.5 7.75001Z",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    id: "fx"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M841 370c3-3.3 2.7-8.3-0.6-11.3-1.5-1.3-3.4-2.1-5.3-2.1h-72.6c-2.4 0-4.6 1-6.1 2.8L633.5 504.6c-2.9 3.4-7.9 3.8-11.3 0.9-0.9-0.8-1.6-1.7-2.1-2.8l-63.5-141.3c-1.3-2.9-4.1-4.7-7.3-4.7H380.7l0.9-4.7 8-42.3c10.5-55.4 38-81.4 85.8-81.4 18.6 0 35.5 1.7 48.8 4.7l14.1-66.8c-22.6-4.7-35.2-6.1-54.9-6.1-103.3 0-156.4 44.3-175.9 147.3l-9.4 49.4h-97.6c-3.8 0-7.1 2.7-7.8 6.4L181.9 415c-0.9 4.3 1.9 8.6 6.2 9.5 0.5 0.1 1.1 0.2 1.6 0.2H284l-89 429.9c-0.9 4.3 1.9 8.6 6.2 9.5 0.5 0.1 1.1 0.2 1.6 0.2H269c3.8 0 7.1-2.7 7.8-6.4l89.7-433.1h135.8l68.2 139.1c1.4 2.9 1 6.4-1.2 8.8l-180.6 203c-2.9 3.3-2.6 8.4 0.7 11.3 1.5 1.3 3.4 2 5.3 2h72.7c2.4 0 4.6-1 6.1-2.8l123.7-146.7c2.8-3.4 7.9-3.8 11.3-1 0.9 0.8 1.6 1.7 2.1 2.8L676.4 784c1.3 2.8 4.1 4.7 7.3 4.7h64.6c4.4 0 8-3.6 8-8 0-1.2-0.3-2.4-0.8-3.5l-95.2-198.9c-1.4-2.9-0.9-6.4 1.3-8.8L841 370z"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 16 16",
    id: "currency-format"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "#525C6F",
    d: getPath(currency),
    "p-id": "5490"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    id: "percentage-format"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "#525C6F",
    d: "M855.7 210.8l-42.4-42.4c-3.1-3.1-8.2-3.1-11.3 0L168.3 801.9c-3.1 3.1-3.1 8.2 0 11.3l42.4 42.4c3.1 3.1 8.2 3.1 11.3 0L855.6 222c3.2-3 3.2-8.1 0.1-11.2zM304 448c79.4 0 144-64.6 144-144s-64.6-144-144-144-144 64.6-144 144 64.6 144 144 144z m0-216c39.7 0 72 32.3 72 72s-32.3 72-72 72-72-32.3-72-72 32.3-72 72-72zM720 576c-79.4 0-144 64.6-144 144s64.6 144 144 144 144-64.6 144-144-64.6-144-144-144z m0 216c-39.7 0-72-32.3-72-72s32.3-72 72-72 72 32.3 72 72-32.3 72-72 72z",
    "p-id": "5920"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    id: "number-decrease"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "#525C6F",
    d: "M132.266667 597.333333h76.8a4.266667 4.266667 0 0 0 4.266666-4.266666v-76.8a4.266667 4.266667 0 0 0-4.266666-4.266667H132.266667a4.266667 4.266667 0 0 0-4.266667 4.266667v76.8a4.266667 4.266667 0 0 0 4.266667 4.266666z m367.616-403.925333a94.72 94.72 0 0 0-27.306667-17.322667c-25.514667-10.496-54.954667-11.392-81.706667-5.632-36.778667 7.936-66.56 31.872-84.906666 64.256-19.797333 34.816-28.16 77.397333-28.16 139.178667 0 61.184 8.405333 102.4 28.16 137.941333a125.866667 125.866667 0 0 0 112.768 67.797334c48.64 0 90.581333-25.6 113.365333-67.84 19.2-34.773333 28.16-77.354667 28.16-135.552 0-50.432-5.888-104.106667-32.768-148.394667a148.906667 148.906667 0 0 0-27.562667-34.474667z m-81.066667 314.197333c-38.954667 0-59.306667-45.568-59.306667-134.4 0-88.149333 20.394667-133.76 58.794667-133.76 39.594667 0 59.306667 45.653333 59.306667 135.552 0 87.04-20.394667 132.565333-58.794667 132.565334z m289.024 212.394667a4.266667 4.266667 0 0 1-4.266667-4.266667V640l-103.68 103.68a4.266667 4.266667 0 0 0 0 6.016L704 853.333333v-75.733333a4.266667 4.266667 0 0 1 4.266667-4.266667H896v-53.333333h-187.733333z",
    "p-id": "6524"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    id: "number-increase"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "#525C6F",
    d: "M132.266667 597.333333h76.8a4.266667 4.266667 0 0 0 4.266666-4.266666v-76.8a4.266667 4.266667 0 0 0-4.266666-4.266667H132.266667a4.266667 4.266667 0 0 0-4.266667 4.266667v76.8a4.266667 4.266667 0 0 0 4.266667 4.266666z m366.848-402.944a111.530667 111.530667 0 0 0-45.226667-21.76 142.933333 142.933333 0 0 0-71.253333 1.152A130.56 130.56 0 0 0 305.92 234.666667c-19.797333 34.816-28.16 77.397333-28.16 139.178666 0 61.184 8.405333 102.4 28.16 137.941334a125.866667 125.866667 0 0 0 112.768 67.797333c48.64 0 90.581333-25.6 113.365333-67.84 19.2-34.773333 28.16-77.354667 28.16-135.552 0-61.696-11.178667-141.653333-61.098666-181.888z m-79.872 313.173334c-38.954667 0-59.306667-45.568-59.306667-134.4 0-88.149333 20.394667-133.76 58.794667-133.76 39.594667 0 59.306667 45.653333 59.306666 135.552 0 87.04-20.394667 132.565333-58.794666 132.565333z m335.232 71.978666c48.64 0 90.581333-25.6 113.365333-67.84 19.2-34.730667 28.16-77.312 28.16-135.509333 0-47.786667-3.84-99.114667-27.093333-141.909333-27.178667-50.176-82.944-75.392-139.093334-64.554667l-12.8 3.157333A128.64 128.64 0 0 0 641.706667 234.666667c-19.797333 34.773333-28.16 77.354667-28.16 139.093333 0 61.184 8.405333 102.4 28.16 137.941333a125.866667 125.866667 0 0 0 112.768 67.754667z m0-340.053333c39.594667 0 59.306667 45.653333 59.306666 135.552 0 86.954667-20.394667 132.565333-58.794666 132.565333-38.954667 0-59.306667-45.568-59.306667-134.4 0-88.192 20.394667-133.76 58.794667-133.76z m34.858666 476.16a4.266667 4.266667 0 0 1-4.266666 4.266667H597.333333v53.333333h187.733334a4.266667 4.266667 0 0 1 4.266666 4.266667V853.333333l103.68-103.68a4.266667 4.266667 0 0 0 0-6.016L789.333333 640v75.733333z",
    "p-id": "6702"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    id: "format-painter"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "#525C6F",
    d: "M15.1004 6.5L6.90039 6.5V9.8L15.1004 9.8L15.1004 6.5ZM15.1004 5C15.9288 5 16.6004 5.67157 16.6004 6.5V9.8C16.6004 10.6284 15.9288 11.3 15.1004 11.3H6.90039C6.07196 11.3 5.40039 10.6284 5.40039 9.8V6.5C5.40039 5.67157 6.07196 5 6.90039 5H15.1004Z"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "#525C6F",
    d: "M17.7174 8.90039H15.3262V7.40039H18.4674C18.8816 7.40039 19.2174 7.73618 19.2174 8.15039V13.7859C19.2174 14.163 18.9374 14.4814 18.5634 14.5297L10.8174 15.5299V19.0004H9.31738V14.8705C9.31738 14.4934 9.59736 14.175 9.97134 14.1267L17.7174 13.1265V8.90039Z"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1096 1096",
    id: "formula-sum"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "#525C6F",
    d: "M725.333333 853.333333H256c-17.066667 0-29.866667-8.533333-38.4-25.6-8.533333-17.066667-4.266667-34.133333 4.266667-46.933333l230.4-268.8-230.4-268.8c-8.533333-12.8-12.8-34.133333-4.266667-46.933333 8.533333-17.066667 21.333333-25.6 38.4-25.6h469.333333c46.933333 0 85.333333 38.4 85.333334 85.333333v85.333333c0 25.6-17.066667 42.666667-42.666667 42.666667s-42.666667-17.066667-42.666667-42.666667V256H349.866667l196.266666 226.133333c12.8 17.066667 12.8 38.4 0 55.466667L349.866667 768H725.333333v-85.333333c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667v85.333333c0 46.933333-38.4 85.333333-85.333334 85.333333z"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    id: "arrow-doubleleft"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M272.9 512l265.4-339.1c4.1-5.2 0.4-12.9-6.3-12.9h-77.3c-4.9 0-9.6 2.3-12.6 6.1L186.8 492.3c-9.1 11.6-9.1 27.9 0 39.5l255.3 326.1c3 3.9 7.7 6.1 12.6 6.1H532c6.7 0 10.4-7.7 6.3-12.9L272.9 512z"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M576.9 512l265.4-339.1c4.1-5.2 0.4-12.9-6.3-12.9h-77.3c-4.9 0-9.6 2.3-12.6 6.1L490.8 492.3c-9.1 11.6-9.1 27.9 0 39.5l255.3 326.1c3 3.9 7.7 6.1 12.6 6.1H836c6.7 0 10.4-7.7 6.3-12.9L576.9 512z"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    id: "arrow-doubleright"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M533.2 492.3L277.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H188c-6.7 0-10.4 7.7-6.3 12.9L447.1 512 181.7 851.1c-4.1 5.2-0.4 12.9 6.3 12.9h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5z"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M837.2 492.3L581.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H492c-6.7 0-10.4 7.7-6.3 12.9L751.1 512 485.7 851.1c-4.1 5.2-0.4 12.9 6.3 12.9h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5z"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "freeze-col"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5.75 12H18.25M12 5.5V18.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M12 12L5.5 17.75",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M11.25 6L5.75 11.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "freeze-row"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5.75 12H18.25M12 5.5V18.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M18 6.5L11.5 12.25",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M11.25 6L5.75 11.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "freeze-row-col"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M5.75 12H18.25M12 5.5V18.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M18 6L5.75 18.25",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M11.25 6L5.75 11.5",
    stroke: "#525C6F",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 24 24",
    fill: "none",
    id: "freeze-cancel"
  }, /*#__PURE__*/React__default['default'].createElement("rect", {
    x: "5.75",
    y: "5.75",
    width: "12.5",
    height: "12.5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "6.5",
    y1: "12",
    x2: "17.5",
    y2: "12",
    stroke: "#535A68",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React__default['default'].createElement("line", {
    x1: "12",
    y1: "17.5",
    x2: "12",
    y2: "6.5",
    stroke: "#535A68",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "sort-desc"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M839.6 433.8L749 150.5c-1.2-3.9-4.8-6.5-8.9-6.5h-77.4c-4.1 0-7.6 2.6-8.9 6.5l-91.3 283.3c-0.3 0.9-0.5 1.9-0.5 2.9 0 5.1 4.2 9.3 9.3 9.3h56.4c4.2 0 7.8-2.8 9-6.8l17.5-61.6h89l17.3 61.5c1.1 4 4.8 6.8 9 6.8h61.2c1 0 1.9-0.1 2.8-0.4 2.4-0.8 4.3-2.4 5.5-4.6 1.1-2.2 1.3-4.7 0.6-7.1zM663.3 325.5l32.8-116.9h6.3l32.1 116.9h-71.2z",
    "p-id": "2016"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M806.8 818.4H677.2v-0.4l132.6-188.9c1.1-1.6 1.7-3.4 1.7-5.4v-36.4c0-5.1-4.2-9.3-9.3-9.3h-204c-5.1 0-9.3 4.2-9.3 9.3v43c0 5.1 4.2 9.3 9.3 9.3h122.6v0.4L587.7 828.9c-1.1 1.6-1.7 3.4-1.7 5.4v36.4c0 5.1 4.2 9.3 9.3 9.3h211.4c5.1 0 9.3-4.2 9.3-9.3v-43c0.1-5.1-4.1-9.3-9.2-9.3z",
    "p-id": "2017"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M416 702h-76V172c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v530h-76c-6.7 0-10.5 7.8-6.3 13l112 141.9c3.2 4.1 9.4 4.1 12.6 0l112-141.9c4.1-5.2 0.4-13-6.3-13z",
    "p-id": "2018"
  })), /*#__PURE__*/React__default['default'].createElement("svg", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "sort-asc"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M839.6 433.8L749 150.5c-1.2-3.9-4.8-6.5-8.9-6.5h-77.4c-4.1 0-7.6 2.6-8.9 6.5l-91.3 283.3c-0.3 0.9-0.5 1.9-0.5 2.9 0 5.1 4.2 9.3 9.3 9.3h56.4c4.2 0 7.8-2.8 9-6.8l17.5-61.6h89l17.3 61.5c1.1 4 4.8 6.8 9 6.8h61.2c1 0 1.9-0.1 2.8-0.4 2.4-0.8 4.3-2.4 5.5-4.6 1.1-2.2 1.3-4.7 0.6-7.1zM663.3 325.5l32.8-116.9h6.3l32.1 116.9h-71.2z",
    "p-id": "2263"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M806.8 818.4H677.2v-0.4l132.6-188.9c1.1-1.6 1.7-3.4 1.7-5.4v-36.4c0-5.1-4.2-9.3-9.3-9.3h-204c-5.1 0-9.3 4.2-9.3 9.3v43c0 5.1 4.2 9.3 9.3 9.3h122.6v0.4L587.7 828.9c-1.1 1.6-1.7 3.4-1.7 5.4v36.4c0 5.1 4.2 9.3 9.3 9.3h211.4c5.1 0 9.3-4.2 9.3-9.3v-43c0.1-5.1-4.1-9.3-9.2-9.3z",
    "p-id": "2264"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M310.3 167.1c-3.2-4.1-9.4-4.1-12.6 0L185.7 309c-4.2 5.3-0.4 13 6.3 13h76v530c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V322h76c6.7 0 10.5-7.8 6.3-13l-112-141.9z",
    "p-id": "2265"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "more"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M224 597.333333C183.466667 597.333333 149.333333 563.2 149.333333 522.666667S183.466667 448 224 448s74.666667 34.133333 74.666667 74.666667-32 74.666667-74.666667 74.666666zM512 597.333333c-40.533333 0-74.666667-34.133333-74.666667-74.666666S471.466667 448 512 448s74.666667 34.133333 74.666667 74.666667S554.666667 597.333333 512 597.333333zM800 597.333333c-40.533333 0-74.666667-34.133333-74.666667-74.666666s34.133333-74.666667 74.666667-74.666667 74.666667 34.133333 74.666667 74.666667-32 74.666667-74.666667 74.666666z"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    width: "24",
    height: "24",
    id: "text-clip"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M217.6 810.666667h76.8a4.266667 4.266667 0 0 0 4.266667-4.266667V217.6a4.266667 4.266667 0 0 0-4.266667-4.266667H217.6a4.266667 4.266667 0 0 0-4.266667 4.266667v588.8a4.266667 4.266667 0 0 0 4.266667 4.266667zM725.333333 217.6v247.466667a4.266667 4.266667 0 0 1-4.266666 4.266666H388.266667a4.266667 4.266667 0 0 0-4.266667 4.266667v76.8a4.266667 4.266667 0 0 0 4.266667 4.266667h332.8a4.266667 4.266667 0 0 1 4.266666 4.266666v247.466667a4.266667 4.266667 0 0 0 4.266667 4.266667h76.8a4.266667 4.266667 0 0 0 4.266667-4.266667V217.6a4.266667 4.266667 0 0 0-4.266667-4.266667h-76.8a4.266667 4.266667 0 0 0-4.266667 4.266667z",
    "p-id": "13371",
    fill: "#525C6F"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "text-rotation-none"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M657.066667 620.088889c24.177778 0 39.822222-24.177778 31.288889-46.933333L509.155556 150.755556c-14.222222-34.133333-64-34.133333-78.222223 0L250.311111 573.155556c-9.955556 22.755556 7.111111 46.933333 31.288889 46.933333 14.222222 0 25.6-8.533333 31.288889-21.333333l36.977778-92.444445h240.355555l36.977778 92.444445c4.266667 12.8 17.066667 21.333333 29.866667 21.333333z m-285.866667-170.666667L469.333333 203.377778l98.133334 246.044444H371.2zM704 662.755556c-11.377778 11.377778-11.377778 28.444444 0 39.822222l45.511111 45.511111H204.8c-15.644444 0-28.444444 12.8-28.444444 28.444444s12.8 28.444444 28.444444 28.444445h544.711111l-45.511111 45.511111c-11.377778 11.377778-11.377778 28.444444 0 39.822222 11.377778 11.377778 28.444444 11.377778 39.822222 0L839.111111 796.444444c11.377778-11.377778 11.377778-28.444444 0-39.822222l-93.866667-93.866666c-11.377778-11.377778-29.866667-11.377778-41.244444 0z",
    "p-id": "17165"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "text-rotation-angleup"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M634.311111 398.222222c17.066667-17.066667 11.377778-45.511111-11.377778-54.044444L196.266667 170.666667c-35.555556-14.222222-69.688889 21.333333-55.466667 55.466666l172.088889 426.666667c8.533333 22.755556 38.4 28.444444 54.044444 11.377778 9.955556-9.955556 12.8-24.177778 7.111111-36.977778l-39.822222-91.022222 170.666667-170.666667 91.022222 39.822222c12.8 4.266667 28.444444 2.844444 38.4-7.111111z m-322.844444 81.066667l-105.244445-243.2L449.422222 341.333333l-137.955555 137.955556zM696.888889 393.955556c0 15.644444 12.8 28.444444 28.444444 28.444444h64L403.911111 807.822222c-11.377778 11.377778-11.377778 28.444444 0 39.822222 11.377778 11.377778 28.444444 11.377778 39.822222 0l385.422223-385.422222V526.222222c0 15.644444 12.8 28.444444 28.444444 28.444445s28.444444-12.8 28.444444-28.444445v-133.688889c0-15.644444-12.8-28.444444-28.444444-28.444444h-133.688889c-14.222222 1.422222-27.022222 14.222222-27.022222 29.866667z",
    "p-id": "17929"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "text-rotation-angledown"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M625.777778 634.311111c17.066667 17.066667 45.511111 11.377778 54.044444-11.377778l172.088889-426.666666c14.222222-35.555556-21.333333-69.688889-55.466667-55.466667L371.2 312.888889c-22.755556 8.533333-28.444444 38.4-11.377778 54.044444 9.955556 9.955556 24.177778 12.8 36.977778 7.111111l91.022222-39.822222 170.666667 170.666667-39.822222 92.444444c-4.266667 11.377778-2.844444 27.022222 7.111111 36.977778z m-81.066667-322.844444l243.2-105.244445L682.666667 449.422222l-137.955556-137.955555zM630.044444 696.888889c-15.644444 0-28.444444 12.8-28.444444 28.444444v64L216.177778 403.911111c-11.377778-11.377778-28.444444-11.377778-39.822222 0-11.377778 11.377778-11.377778 28.444444 0 39.822222l385.422222 385.422223H497.777778c-15.644444 0-28.444444 12.8-28.444445 28.444444s12.8 28.444444 28.444445 28.444444h133.688889c15.644444 0 28.444444-12.8 28.444444-28.444444v-133.688889c-1.422222-14.222222-14.222222-27.022222-29.866667-27.022222z",
    "p-id": "18084"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "text-rotation-vertical"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M465.066667 672.711111c-24.177778 0-39.822222-24.177778-31.288889-46.933333l179.2-423.822222c14.222222-34.133333 64-34.133333 78.222222 0L871.822222 625.777778c9.955556 22.755556-7.111111 46.933333-31.288889 46.933333-14.222222 0-25.6-8.533333-31.288889-21.333333l-36.977777-92.444445H531.911111l-36.977778 92.444445c-4.266667 12.8-17.066667 21.333333-29.866666 21.333333z m285.866666-170.666667L652.8 256 554.666667 502.044444h196.266666zM157.866667 704c11.377778-11.377778 28.444444-11.377778 39.822222 0l45.511111 45.511111V204.8c0-15.644444 12.8-28.444444 28.444444-28.444444s28.444444 12.8 28.444445 28.444444v544.711111l45.511111-45.511111c11.377778-11.377778 28.444444-11.377778 39.822222 0 11.377778 11.377778 11.377778 28.444444 0 39.822222L292.977778 839.111111c-11.377778 11.377778-28.444444 11.377778-39.822222 0l-93.866667-93.866667c-12.8-11.377778-12.8-29.866667-1.422222-41.244444z",
    "p-id": "18239"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "text-rotation-up"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M620.088889 366.933333c0-24.177778-24.177778-39.822222-46.933333-31.288889L150.755556 514.844444c-34.133333 14.222222-34.133333 64 0 78.222223l423.822222 179.2c22.755556 9.955556 46.933333-7.111111 46.933333-31.288889 0-14.222222-8.533333-25.6-21.333333-31.288889l-92.444445-36.977778V433.777778l92.444445-36.977778c11.377778-4.266667 19.911111-17.066667 19.911111-29.866667z m-170.666667 285.866667L203.377778 554.666667l246.044444-98.133334v196.266667zM662.755556 320c11.377778 11.377778 28.444444 11.377778 39.822222 0l45.511111-45.511111v544.711111c0 15.644444 12.8 28.444444 28.444444 28.444444s28.444444-12.8 28.444445-28.444444V274.488889l45.511111 45.511111c11.377778 11.377778 28.444444 11.377778 39.822222 0 11.377778-11.377778 11.377778-28.444444 0-39.822222L796.444444 184.888889c-11.377778-11.377778-28.444444-11.377778-39.822222 0l-93.866666 93.866667c-11.377778 11.377778-11.377778 29.866667 0 41.244444z",
    "p-id": "18394"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "screenshot"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M320 704V128H256v128H128v64h128v448h448v128h64v-128h128v-64H320z m384-64h64V256H384v64h320v320z",
    "p-id": "3788"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "conditionFormat",
    width: "20"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M128 128h768v768H128V128z m64 512v128h128v-128H192z m256 0v128h192v-128H448zM192 448v128h128V448H192z m0-192v128h128V256H192z m192 0v128h192V256H384z m320 384v128h128v-128h-128z m0-192v128h128V448h-128z m0-192v128h128V256h-128z",
    "p-id": "1955"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "splitColumn"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M143.36 184.32v163.84h737.28v-163.84h-737.28z m-40.96-40.96h819.2v245.76h-819.2v-245.76z m342.016 333.824l67.584 67.584 67.584-67.584c8.192-8.192 20.48-8.192 28.672 0 8.192 8.192 8.192 20.48 0 28.672l-96.256 96.256-96.256-96.256c-8.192-8.192-8.192-20.48 0-28.672 8.192-8.192 20.48-8.192 28.672 0z m-342.016 157.696h368.64v245.76h-368.64v-245.76z m450.56 0h368.64v245.76h-368.64v-245.76z m-409.6 204.8h286.72v-163.84h-286.72v163.84z m450.56 0h286.72v-163.84h-286.72v163.84z",
    "p-id": "1984"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "locationCondition"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M938.666667 388.266667H584.533333V247.466667a21.333333 21.333333 0 0 0-21.333333-21.333334H85.333333A21.333333 21.333333 0 0 0 64 247.466667v324.266666a21.333333 21.333333 0 0 0 21.333333 21.333334h277.333334V785.066667a21.333333 21.333333 0 0 0 21.333333 21.333333h554.666667a21.333333 21.333333 0 0 0 21.333333-21.333333V409.6a21.333333 21.333333 0 0 0-21.333333-21.333333z m-832 162.133333v-281.6h435.2v119.466667H384a21.333333 21.333333 0 0 0-21.333333 21.333333v140.8h-256z",
    "p-id": "9672"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "dataVerification"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M510.9 921.6l-107.8-66.2c-124.6-76.5-202-214.8-202-361.1V243.9h21.7c205.1 0 262-115.5 267.8-128.6l5.7-13 28.7-0.3 6.2 13.1c5.9 13.3 62.8 128.8 267.8 128.8h21.7v250.4c0 146.3-77.4 284.6-202 361.1l-107.8 66.2zM244.5 287v207.3c0 131.2 69.5 255.4 181.3 324.1l85.1 52.2 85.1-52.2c111.8-68.6 181.3-192.8 181.3-324.1V287c-157.7-6.1-234.1-77.8-266.4-121.7-32.2 43.8-108.6 115.6-266.4 121.7z",
    "p-id": "5514"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M502.2 617.3c-5.6 0-11.1-2.1-15.4-6.4L410 534.1c-8.5-8.5-8.5-22.2 0-30.7s22.2-8.5 30.7 0l61.4 61.4 108.7-108.7c8.5-8.5 22.2-8.5 30.7 0s8.5 22.2 0 30.7l-124 124.1c-4.2 4.2-9.8 6.4-15.3 6.4z",
    "p-id": "5515"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "text-rotation-down"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M403.911111 657.066667c0 24.177778 24.177778 39.822222 46.933333 31.288889L873.244444 509.155556c34.133333-14.222222 34.13333299-64 0-78.222223L450.844444 250.311111c-22.755556-9.955556-46.933333 7.111111-46.933333 31.288889 0 14.222222 8.533333 25.6 21.333333 31.288889l92.444445 36.977778-1e-8 240.355555-92.44444499 36.977778c-12.8 4.266667-21.333333 17.066667-21.333333 29.866667z m170.666667-285.86666701L820.622222 469.33333299l-246.044444 98.13333401L574.577778 371.19999999zM361.244444 704c-11.377778-11.377778-28.444444-11.377778-39.822222 0l-45.511111 45.511111L275.911111 204.79999999c0-15.644444-12.8-28.444444-28.44444399-28.44444399s-28.444444 12.8-28.44444501 28.444444l-1e-8 544.711111-45.51111099-45.511111c-11.377778-11.377778-28.444444-11.377778-39.822222 0-11.377778 11.377778-11.377778 28.444444 0 39.822222L227.555556 839.111111c11.377778 11.377778 28.444444 11.377778 39.822222-1e-8l93.866666-93.86666699c11.377778-11.377778 11.377778-29.866667 0-41.244444z",
    "p-id": "10914"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "search"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M469.333 192c153.174 0 277.334 124.16 277.334 277.333 0 68.054-24.534 130.411-65.216 178.688L846.336 818.24l-48.341 49.877L630.4 695.125a276.053 276.053 0 0 1-161.067 51.542C316.16 746.667 192 622.507 192 469.333S316.16 192 469.333 192z m0 64C351.51 256 256 351.51 256 469.333s95.51 213.334 213.333 213.334 213.334-95.51 213.334-213.334S587.157 256 469.333 256z",
    "p-id": "11202"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "link"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M577.155781 655.619241L431.54903 801.139578a119.509873 119.509873 0 0 1-169.111224 0l-26.442532-25.924051a119.6827 119.6827 0 0 1 0-169.111223L366.393249 475.274262a21.344135 21.344135 0 0 1 30.417553 0 21.516962 21.516962 0 0 1 0 30.503966L266.585654 636.176203a76.389536 76.389536 0 0 0 0 108.016877l26.442532 26.442532a76.389536 76.389536 0 0 0 108.016877 0l145.520338-145.606751a76.389536 76.389536 0 0 0 0-108.016878L535.763713 505.864641A21.516962 21.516962 0 0 1 535.763713 475.274262a21.344135 21.344135 0 0 1 30.417553 0l11.233755 11.147341a119.6827 119.6827 0 0 1-0.25924 169.197638z",
    "p-id": "28239"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M546.565401 517.011983L535.763713 505.864641A21.516962 21.516962 0 0 1 535.763713 475.274262a21.344135 21.344135 0 0 1 30.417553 0l11.233755 11.147341",
    "p-id": "28240"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M446.844219 368.380759l145.606751-145.520337a119.509873 119.509873 0 0 1 169.111224 0l26.442532 26.356118a119.6827 119.6827 0 0 1 0 169.111224L657.606751 548.639325a21.344135 21.344135 0 0 1-30.417553 0 21.516962 21.516962 0 0 1 0-30.503966l130.225148-130.311562a76.389536 76.389536 0 0 0 0-108.016877l-26.442532-26.442532a76.389536 76.389536 0 0 0-108.016877 0L477.434599 398.971139a76.389536 76.389536 0 0 0 0 108.016878L488.581941 518.481013a21.516962 21.516962 0 0 1 0 30.503966 21.344135 21.344135 0 0 1-30.417553 0l-11.233755-11.147342a119.6827 119.6827 0 0 1-0.086414-169.456878z",
    "p-id": "28241"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M477.434599 506.988017L488.581941 518.481013a21.516962 21.516962 0 0 1 0 30.503966 21.344135 21.344135 0 0 1-30.417553 0l-11.233755-11.147342",
    "p-id": "28242"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "copy"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M832 128c-12.8-76.8-76.8-128-160-128h-448C102.4 0 0 102.4 0 224v448c0 76.8 57.6 140.8 128 160 12.8 76.8 76.8 128 160 128h512c89.6 0 160-70.4 160-160v-512c0-76.8-57.6-140.8-128-160zM64 672v-448C64 134.4 134.4 64 224 64h448c44.8 0 76.8 25.6 89.6 64H288C198.4 128 128 198.4 128 288v473.6c-38.4-12.8-64-44.8-64-89.6z m832 128c0 51.2-44.8 96-96 96h-512c-51.2 0-96-44.8-96-96v-512C192 236.8 236.8 192 288 192h512c51.2 0 96 44.8 96 96v512z",
    "p-id": "28791"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "pencil"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M966.283012 57.28336A194.600516 194.600516 0 0 0 828.144425 0.000203c-49.932663 0-100.118792 19.009897-138.138586 57.283157l-667.12066 667.12066-22.811877 276.784103c-1.013861 12.166334 8.61782 22.304946 20.530689 22.304946h1.774257l276.784104-22.811876 667.12066-667.12066c76.293054-76.293054 76.293054-199.984119 0-276.277173zM271.534635 941.116848l-205.813821 16.72871L82.702989 751.778272l547.231575-547.231575 189.085111 189.085111-547.48504 547.48504zM922.686981 289.964502l-60.071275 60.071275-189.085111-189.085111 60.071275-60.071275c25.34653-25.34653 58.803949-39.033656 94.542555-39.033656 35.738607 0 69.196026 13.940591 94.542556 39.033656 52.213851 52.213851 52.213851 136.87126 0 189.085111z",
    "p-id": "40167"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    fill: "#535A68",
    id: "unlink",
    viewBox: "0 0 1024 1024"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M240.469333 240.469333l241.194667 241.194667 90.965333-90.965333a42.88 42.88 0 0 1 60.672 60.672L542.293333 542.293333l241.237334 241.237334a42.666667 42.666667 0 0 1-60.330667 60.330666l-119.936-119.893333-151.893333 151.893333a214.4 214.4 0 0 1-309.674667-296.533333l6.4-6.698667 151.936-151.893333-119.893333-119.893333a42.666667 42.666667 0 0 1 60.330666-60.373334z m120.192 240.896l-151.893333 151.893334a128.64 128.64 0 0 0 176.426667 187.136l5.546666-5.162667 151.850667-151.936-60.629333-60.629333-30.592 30.634666a42.88 42.88 0 1 1-60.672-60.672l30.634666-30.592-60.672-60.672z m515.2-333.226666a214.4 214.4 0 0 1 0 303.232l-121.301333 121.258666A42.88 42.88 0 1 1 693.973333 512l121.258667-121.301333a128.64 128.64 0 0 0-181.930667-181.930667L512 330.069333a42.88 42.88 0 1 1-60.629333-60.629333l121.258666-121.301333a214.4 214.4 0 0 1 303.232 0z m-333.653333 273.365333l-60.373333 60.330667 60.330666 60.330666 60.330667-60.330666-60.330667-60.330667z",
    "p-id": "39251"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "filter"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M872.533333 134.4c-12.8-10.666667-29.866667-17.066667-49.066666-17.066667H198.4C157.866667 117.333333 123.733333 151.466667 123.733333 192c0 17.066667 6.4 34.133333 17.066667 49.066667l256 302.933333v251.733333c0 12.8 6.4 23.466667 17.066667 27.733334l162.133333 81.066666c4.266667 2.133333 8.533333 4.266667 14.933333 4.266667 6.4 0 10.666667-2.133333 17.066667-4.266667 8.533333-6.4 14.933333-17.066667 14.933333-27.733333V541.866667l256-302.933334c12.8-14.933333 19.2-34.133333 17.066667-53.333333 2.133333-19.2-6.4-38.4-23.466667-51.2z m-38.4 64L569.6 509.866667c-4.266667 6.4-8.533333 12.8-8.533333 21.333333v292.266667l-98.133334-49.066667V531.2c0-8.533333-2.133333-14.933333-8.533333-21.333333L189.866667 198.4c0-2.133333-2.133333-4.266667-2.133334-6.4 0-6.4 4.266667-10.666667 10.666667-10.666667h625.066667c2.133333 0 4.266667 0 6.4 2.133334 2.133333 2.133333 4.266667 6.4 4.266666 6.4 2.133333 2.133333 2.133333 6.4 0 8.533333z",
    "p-id": "43580"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "filter1"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M608 864C588.8 864 576 851.2 576 832L576 448c0-6.4 6.4-19.2 12.8-25.6L787.2 256c6.4-6.4 6.4-19.2 0-19.2 0-6.4-6.4-12.8-19.2-12.8L256 224c-12.8 0-19.2 6.4-19.2 12.8 0 6.4-6.4 12.8 6.4 19.2l198.4 166.4C441.6 428.8 448 441.6 448 448l0 256c0 19.2-12.8 32-32 32S384 723.2 384 704L384 460.8 198.4 307.2c-25.6-25.6-32-64-19.2-96C185.6 179.2 217.6 160 256 160L768 160c32 0 64 19.2 76.8 51.2 12.8 32 6.4 70.4-19.2 89.6l-192 160L633.6 832C640 851.2 627.2 864 608 864z",
    "p-id": "43727"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "eraser"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M596.437333 85.333333a42.837333 42.837333 0 0 0-30.549333 13.824l-469.333333 512a42.666667 42.666667 0 0 0 1.28 59.008l170.666666 170.666667A42.496 42.496 0 0 0 298.666667 853.333333h512v-85.333333h-195.669334l311.168-311.168a42.538667 42.538667 0 0 0 0-60.330667l-298.666666-298.666666A43.221333 43.221333 0 0 0 596.437333 85.333333z m-102.144 682.666667H316.330667l-129.28-129.28 268.8-293.205333 230.485333 230.485333-192.042667 192z m252.373334-252.330667l-233.130667-233.130666 85.12-92.842667L835.669333 426.666667 746.666667 515.669333z",
    "p-id": "50819"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1057 1024",
    fill: "#535A68",
    id: "sort"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M438.634667 192v644.202667l-0.810667 5.781333c-1.152 7.210667-2.304 8.704-8.64 17.002667l-7.168 3.925333c-15.914667 8.490667-18.282667 7.168-38.4-3.925333L149.333333 624.533333l45.269334-45.226666 180.032 180.138666V192h64z m216.96 10.005333l231.04 231.146667-45.269334 45.248L661.333333 298.261333V865.706667h-64V226.133333a34.133333 34.133333 0 0 1 58.282667-24.128z",
    "p-id": "52781"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "filter-fill"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M776.341333 170.666667a64 64 0 0 1 49.557334 104.512L627.541333 517.76v273.386667L398.293333 687.018667v-169.237334l-192.469333-243.413333A64 64 0 0 1 256 170.666667h520.341333z",
    "p-id": "18344"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#ffffff",
    id: "filter-fill-white"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M776.341333 170.666667a64 64 0 0 1 49.557334 104.512L627.541333 517.76v273.386667L398.293333 687.018667v-169.237334l-192.469333-243.413333A64 64 0 0 1 256 170.666667h520.341333z",
    "p-id": "18344"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "all-sheets"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M849.427 1000.999h-157.9c-73.785 0-132.809-59.029-132.809-132.809v-258.243c0-14.759 10.33-26.562 25.088-29.513 4.427-1.472 8.853-2.953 13.278-2.953h252.337c73.785 0 132.809 59.029 132.809 132.809v157.9c-1.472 72.309-60.5 132.809-132.809 132.809zM616.268 636.505v231.684c0 39.844 32.468 73.785 73.785 73.785h157.9c39.844 0 73.785-32.468 73.785-73.785v-157.9c0-39.844-32.468-73.785-73.785-73.785h-231.684z",
    "p-id": "4941"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M315.23 1000.999h-147.571c-76.736 0-137.241-61.981-137.241-137.241v-147.571c0-76.736 61.981-137.241 137.241-137.241h247.911c4.427 0 8.853 1.472 13.278 2.953 14.759 1.472 25.088 14.759 25.088 29.513v253.814c0 73.785-61.981 135.764-138.711 135.764zM167.657 636.505c-42.796 0-78.211 35.418-78.211 78.211v147.571c0 44.269 35.418 78.211 78.211 78.211h147.571c42.796 0 78.211-35.418 78.211-78.211v-225.779h-225.779z",
    "p-id": "4942"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M415.576 471.232h-255.291c-72.309 0-129.859-57.549-129.859-129.859v-163.801c0-72.309 57.549-129.859 129.859-129.859h163.801c72.309 0 129.859 57.549 129.859 129.859v261.199c0 14.759-10.33 26.562-25.088 29.513-4.427 1.472-8.853 2.953-13.278 2.953zM158.805 105.259c-38.369 0-70.836 32.468-70.836 70.836v165.279c0 38.369 32.468 70.836 70.836 70.836h234.634v-234.634c0-38.369-32.468-70.836-70.836-70.836h-163.801z",
    "p-id": "4943"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M847.948 471.232h-252.337c-4.427 0-8.853-1.472-13.278-2.953-14.759-1.472-25.088-14.759-25.088-29.513v-258.243c0-73.785 60.5-134.287 134.287-134.287h156.423c73.785 0 134.287 60.5 134.287 134.287v156.423c-1.472 73.785-60.5 134.287-134.287 134.287zM616.268 412.199h230.207c41.318 0 75.263-33.941 75.263-75.263v-156.423c0-41.318-33.941-75.263-75.263-75.263h-156.423c-41.318 0-75.263 33.941-75.263 75.263v231.684z",
    "p-id": "4944"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "hidden"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M849.152 665.429333c62.762667-69.674667 86.826667-138.538667 87.296-139.904a42.410667 42.410667 0 0 0 0-27.008C935.552 495.658667 837.674667 213.333333 512 213.333333c-37.802667 0-72.192 4.138667-104.064 10.837334l75.776 75.776c9.301333-0.554667 18.517333-1.28 28.288-1.28 228.309333 0 316.757333 164.096 338.176 213.333333a369.365333 369.365333 0 0 1-60.544 93.866667l59.52 59.562666zM512 810.666667c78.293333 0 143.146667-16.597333 196.906667-41.429334l156.928 156.928 60.330666-60.330666-768-768-60.330666 60.330666 141.610666 141.610667c-111.530667 83.285333-151.338667 196.906667-151.936 198.698667a42.410667 42.410667 0 0 0 0 27.008C88.448 528.341333 186.325333 810.666667 512 810.666667zM299.989333 360.32l96.938667 96.938667c-22.229333 47.488-14.378667 106.282667 24.533333 145.194666s97.706667 46.805333 145.194667 24.533334l76.842667 76.842666A394.325333 394.325333 0 0 1 512 725.333333c-228.309333 0-316.757333-164.096-338.176-213.333333a366.933333 366.933333 0 0 1 126.165333-151.68z",
    "p-id": "19355"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "check"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M439.439404 776.947278a32.717146 32.717146 0 0 1-21.343097-7.892761L185.810916 570.228169c-13.779841-11.795651-15.389502-32.527834-3.593851-46.308698 11.795651-13.778818 32.528857-15.390525 46.308699-3.593852L435.957093 697.877431l349.863273-405.566946c11.846816-13.736862 32.588209-15.265682 46.323025-3.415796 13.733792 11.847839 15.263635 32.587186 3.414773 46.322002l-371.235023 430.340165c-6.492878 7.52744-15.661701 11.390421-24.883737 11.390422z",
    fill: "",
    "p-id": "5612"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#A8ABB0",
    id: "rightArrow"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M781.963636 495.709091l-418.909091-323.490909c-20.945455-16.290909-37.236364-9.309091-37.236363 16.290909v646.981818c0 25.6 16.290909 32.581818 37.236363 16.290909l418.909091-323.490909c11.636364-9.309091 11.636364-23.272727 0-32.581818z",
    "p-id": "5380"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    id: "downArrow"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M163.396608 289.168384c-40.577024 0-66.526208 54.183936-35.44064 85.25824L477.217792 723.704832c20.031488 20.031488 49.82272 20.031488 69.853184 0l349.274112-349.278208c30.30528-30.294016 6.677504-85.25824-34.927616-85.25824L163.396608 289.168384z",
    "p-id": "2683"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#272636",
    id: "headDownArrow"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M0 511.976727C0 229.678545 229.725091 0 511.976727 0s511.976727 229.632 511.976727 511.976727c0 282.391273-229.725091 511.976727-511.976727 511.976727C229.725091 1024 0 794.368 0 511.976727M955.717818 511.976727c0-244.898909-199.121455-444.206545-443.741091-444.206545-244.666182 0-443.694545 199.307636-443.694545 444.206545 0 244.945455 199.121455 444.253091 443.694545 444.253091C756.642909 956.276364 955.717818 756.968727 955.717818 511.976727M230.027636 419.025455c0-6.562909 2.420364-13.102545 7.563636-18.059636 9.914182-9.960727 26.042182-9.960727 36.096 0l238.289455 236.916364L750.312727 401.105455c9.960727-9.914182 26.135273-9.914182 36.305455 0 9.914182 9.960727 9.914182 26.042182 0 35.956364L511.976727 709.678545 237.474909 436.922182C232.424727 432.104727 230.027636 425.588364 230.027636 419.025455",
    "p-id": "5142"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    id: "tab"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M960 591.424V368.96c0-0.288 0.16-0.512 0.16-0.768S960 367.68 960 367.424V192a32 32 0 0 0-32-32H96a32 32 0 0 0-32 32v175.424c0 0.288-0.16 0.512-0.16 0.768s0.16 0.48 0.16 0.768v222.464c0 0.288-0.16 0.512-0.16 0.768s0.16 0.48 0.16 0.768V864a32 32 0 0 0 32 32h832a32 32 0 0 0 32-32v-271.04c0-0.288 0.16-0.512 0.16-0.768S960 591.68 960 591.424z m-560-31.232v-160H608v160h-208z m208 64V832h-208v-207.808H608z m-480-224h208v160H128v-160z m544 0h224v160h-224v-160zM896 224v112.192H128V224h768zM128 624.192h208V832H128v-207.808zM672 832v-207.808h224V832h-224z",
    "p-id": "3023"
  })), /*#__PURE__*/React__default['default'].createElement("symbol", {
    viewBox: "0 0 1024 1024",
    fill: "#535A68",
    id: "default"
  }, /*#__PURE__*/React__default['default'].createElement("path", {
    d: "M844.8 896c25.6 0 51.2-19.2 51.2-51.2v-185.6h-51.2c-44.8 0-83.2-38.4-83.2-83.2s38.4-83.2 83.2-83.2h51.2V313.6c0-25.6-19.2-51.2-51.2-51.2h-134.4c0-70.4-57.6-128-128-128S448 185.6 448 256H313.6c-25.6 0-51.2 19.2-51.2 51.2V448C185.6 448 128 505.6 128 576s57.6 128 128 128v134.4c0 25.6 19.2 51.2 51.2 51.2h185.6v-51.2c0-44.8 38.4-83.2 83.2-83.2 44.8 0 83.2 38.4 83.2 83.2v57.6h185.6zM576 710.4c-70.4 0-128 57.6-128 128H307.2v-185.6H256c-44.8 0-83.2-38.4-83.2-83.2S211.2 492.8 256 492.8h51.2V307.2h185.6V256c0-44.8 38.4-83.2 83.2-83.2 44.8 0 83.2 38.4 83.2 83.2v51.2h185.6V448c-70.4 0-128 57.6-128 128s57.6 128 128 128v140.8H704c6.4-70.4-51.2-134.4-128-134.4z",
    fill: "",
    "p-id": "36983"
  }))));
};

var ChangeColor = function ChangeColor(_ref) {
  var triggerParentUpdate = _ref.triggerParentUpdate;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var _locale = core.locale(context),
    toolbar = _locale.toolbar,
    sheetconfig = _locale.sheetconfig,
    button = _locale.button;
  var _useState = React.useState("#000000"),
    _useState2 = _slicedToArray(_useState, 2),
    inputColor = _useState2[0],
    setInputColor = _useState2[1];
  var _useState3 = React.useState(context.luckysheetfile[core.getSheetIndex(context, context.currentSheetId)].color),
    _useState4 = _slicedToArray(_useState3, 2),
    selectColor = _useState4[0],
    setSelectColor = _useState4[1];
  var certainBtn = React.useCallback(function () {
    setSelectColor(inputColor);
  }, [inputColor]);
  React.useEffect(function () {
    setContext(function (ctx) {
      if (ctx.allowEdit === false) return;
      var index = core.getSheetIndex(ctx, ctx.currentSheetId);
      ctx.luckysheetfile[index].color = selectColor;
    });
  }, [selectColor, setContext]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    id: "fortune-change-color"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "color-reset",
    onClick: function onClick() {
      return setSelectColor(undefined);
    },
    tabIndex: 0
  }, sheetconfig.resetColor), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "custom-color"
  }, /*#__PURE__*/React__default['default'].createElement("div", null, toolbar.customColor, ":"), /*#__PURE__*/React__default['default'].createElement("input", {
    type: "color",
    value: inputColor,
    onChange: function onChange(e) {
      return setInputColor(e.target.value);
    },
    onFocus: function onFocus() {
      triggerParentUpdate(true);
    },
    onBlur: function onBlur() {
      triggerParentUpdate(false);
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      certainBtn();
    },
    tabIndex: 0
  }, button.confirm)), /*#__PURE__*/React__default['default'].createElement(ColorPicker, {
    onPick: function onPick(color) {
      setInputColor(color);
      setSelectColor(color);
    }
  }));
};

var SheetTabContextMenu = function SheetTabContextMenu() {
  var _settings$sheetTabCon;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    settings = _useContext.settings;
  var _context$sheetTabCont = context.sheetTabContextMenu,
    x = _context$sheetTabCont.x,
    y = _context$sheetTabCont.y,
    sheet = _context$sheetTabCont.sheet,
    onRename = _context$sheetTabCont.onRename;
  var _locale = core.locale(context),
    sheetconfig = _locale.sheetconfig;
  var _useState = React.useState({
      x: -1,
      y: -1
    }),
    _useState2 = _slicedToArray(_useState, 2),
    position = _useState2[0],
    setPosition = _useState2[1];
  var _useState3 = React.useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isShowChangeColor = _useState4[0],
    setIsShowChangeColor = _useState4[1];
  var _useState5 = React.useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    isShowInputColor = _useState6[0],
    setIsShowInputColor = _useState6[1];
  var _useAlert = useAlert(),
    showAlert = _useAlert.showAlert,
    hideAlert = _useAlert.hideAlert;
  var containerRef = React.useRef(null);
  var close = React.useCallback(function () {
    setContext(function (ctx) {
      ctx.sheetTabContextMenu = {};
    });
  }, [setContext]);
  React.useLayoutEffect(function () {
    var _containerRef$current;
    var rect = (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : _containerRef$current.getBoundingClientRect();
    if (rect && x != null && y != null) {
      setPosition({
        x: x,
        y: y - rect.height
      });
    }
  }, [x, y]);
  useOutsideClick(containerRef, close, [close]);
  var moveSheet = React.useCallback(function (delta) {
    if (context.allowEdit === false) return;
    if (!sheet) return;
    setContext(function (ctx) {
      var currentOrder = -1;
      ___default['default'].sortBy(ctx.luckysheetfile, ["order"]).forEach(function (_sheet, i) {
        _sheet.order = i;
        if (_sheet.id === sheet.id) {
          currentOrder = i;
        }
      });
      core.api.setSheetOrder(ctx, _defineProperty({}, sheet.id, currentOrder + delta));
    });
  }, [context.allowEdit, setContext, sheet]);
  var hideSheet = React.useCallback(function () {
    if (context.allowEdit === false) return;
    if (!sheet) return;
    setContext(function (ctx) {
      var shownSheets = ctx.luckysheetfile.filter(function (oneSheet) {
        return ___default['default'].isUndefined(oneSheet.hide) || (oneSheet === null || oneSheet === void 0 ? void 0 : oneSheet.hide) !== 1;
      });
      if (shownSheets.length > 1) {
        core.api.hideSheet(ctx, sheet.id);
      } else {
        showAlert(sheetconfig.noMoreSheet, "ok");
      }
    });
  }, [context.allowEdit, setContext, sheet, showAlert, sheetconfig]);
  var copySheet = React.useCallback(function () {
    if (context.allowEdit === false) return;
    if (!(sheet === null || sheet === void 0 ? void 0 : sheet.id)) return;
    setContext(function (ctx) {
      core.api.copySheet(ctx, sheet.id);
    }, {
      addSheetOp: true
    });
  }, [context.allowEdit, setContext, sheet === null || sheet === void 0 ? void 0 : sheet.id]);
  var updateShowInputColor = React.useCallback(function (state) {
    setIsShowInputColor(state);
  }, []);
  var focusSheet = React.useCallback(function () {
    if (context.allowEdit === false) return;
    if (!(sheet === null || sheet === void 0 ? void 0 : sheet.id)) return;
    setContext(function (ctx) {
      ___default['default'].forEach(ctx.luckysheetfile, function (sheetfile) {
        sheetfile.status = sheet.id === sheetfile.id ? 1 : 0;
      });
    });
  }, [context.allowEdit, setContext, sheet === null || sheet === void 0 ? void 0 : sheet.id]);
  if (!sheet || x == null || y == null) return null;
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-context-menu luckysheet-cols-menu",
    onContextMenu: function onContextMenu(e) {
      return e.stopPropagation();
    },
    style: {
      left: position.x,
      top: position.y,
      overflow: "visible"
    },
    ref: containerRef
  }, (_settings$sheetTabCon = settings.sheetTabContextMenu) === null || _settings$sheetTabCon === void 0 ? void 0 : _settings$sheetTabCon.map(function (name, i) {
    if (name === "delete") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          var shownSheets = context.luckysheetfile.filter(function (singleSheet) {
            return ___default['default'].isUndefined(singleSheet.hide) || singleSheet.hide !== 1;
          });
          if (context.luckysheetfile.length > 1 && shownSheets.length > 1) {
            showAlert(sheetconfig.confirmDelete, "yesno", function () {
              setContext(function (ctx) {
                core.deleteSheet(ctx, sheet.id);
              }, {
                deleteSheetOp: {
                  id: sheet.id
                }
              });
              hideAlert();
            });
          } else {
            showAlert(sheetconfig.noMoreSheet, "ok");
          }
          close();
        }
      }, sheetconfig.delete);
    }
    if (name === "rename") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          onRename === null || onRename === void 0 ? void 0 : onRename();
          close();
        }
      }, sheetconfig.rename);
    }
    if (name === "move") {
      return /*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, {
        key: name
      }, /*#__PURE__*/React__default['default'].createElement(Menu, {
        onClick: function onClick() {
          moveSheet(-1.5);
          close();
        }
      }, sheetconfig.moveLeft), /*#__PURE__*/React__default['default'].createElement(Menu, {
        onClick: function onClick() {
          moveSheet(1.5);
          close();
        }
      }, sheetconfig.moveRight));
    }
    if (name === "hide") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          hideSheet();
          close();
        }
      }, sheetconfig.hide);
    }
    if (name === "copy") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          copySheet();
          close();
        }
      }, sheetconfig.copy);
    }
    if (name === "color") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onMouseEnter: function onMouseEnter() {
          setIsShowChangeColor(true);
        },
        onMouseLeave: function onMouseLeave() {
          if (!isShowInputColor) {
            setIsShowChangeColor(false);
          }
        }
      }, sheetconfig.changeColor, /*#__PURE__*/React__default['default'].createElement("span", {
        className: "change-color-triangle"
      }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
        name: "rightArrow",
        width: 18
      })), isShowChangeColor && context.allowEdit && (/*#__PURE__*/React__default['default'].createElement(ChangeColor, {
        triggerParentUpdate: updateShowInputColor
      })));
    }
    if (name === "focus") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          focusSheet();
          close();
        }
      }, sheetconfig.focus);
    }
    if (name === "|") {
      return /*#__PURE__*/React__default['default'].createElement(Divider$1, {
        key: "divide-".concat(i)
      });
    }
    return null;
  }));
};

var MoreItemsContaier = function MoreItemsContaier(_ref) {
  var onClose = _ref.onClose,
    children = _ref.children;
  var containerRef = React.useRef(null);
  useOutsideClick(containerRef, function () {
    onClose === null || onClose === void 0 ? void 0 : onClose();
  }, [containerRef, onClose]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    ref: containerRef,
    className: "fortune-toolbar-more-container"
  }, children);
};

function generateAPIs(context, setContext, handleUndo, handleRedo, settings, cellInput, scrollbarX, scrollbarY) {
  return {
    applyOp: function applyOp(ops) {
      setContext(function (ctx_) {
        var _ops$, _ops$$path, _ops$2, _ops$2$path, _ops$3;
        var _opToPatch = core.opToPatch(ctx_, ops),
          _opToPatch2 = _slicedToArray(_opToPatch, 2),
          patches = _opToPatch2[0],
          specialOps = _opToPatch2[1];
        if (specialOps.length > 0) {
          var _specialOps = _slicedToArray(specialOps, 1),
            specialOp = _specialOps[0];
          if (specialOp.op === "insertRowCol") {
            try {
              core.insertRowCol(ctx_, specialOp.value, false);
            } catch (e) {
              console.error(e);
            }
          } else if (specialOp.op === "deleteRowCol") {
            core.deleteRowCol(ctx_, specialOp.value);
          } else if (specialOp.op === "addSheet") {
            var _patches$filter, _patches$filter$, _specialOp$value;
            var name = (_patches$filter = patches.filter(function (path) {
              return path.path[0] === "name";
            })) === null || _patches$filter === void 0 ? void 0 : (_patches$filter$ = _patches$filter[0]) === null || _patches$filter$ === void 0 ? void 0 : _patches$filter$.value;
            if ((_specialOp$value = specialOp.value) === null || _specialOp$value === void 0 ? void 0 : _specialOp$value.id) {
              core.addSheet(ctx_, settings, specialOp.value.id, false, name, specialOp.value);
            }
            var fileIndex = core.getSheetIndex(ctx_, specialOp.value.id);
            core.api.initSheetData(ctx_, fileIndex, specialOp.value);
          } else if (specialOp.op === "deleteSheet") {
            core.deleteSheet(ctx_, specialOp.value.id);
            patches.length = 0;
          }
        }
        if (((_ops$ = ops[0]) === null || _ops$ === void 0 ? void 0 : (_ops$$path = _ops$.path) === null || _ops$$path === void 0 ? void 0 : _ops$$path[0]) === "filter_select") ctx_.luckysheet_filter_save = ops[0].value;else if (((_ops$2 = ops[0]) === null || _ops$2 === void 0 ? void 0 : (_ops$2$path = _ops$2.path) === null || _ops$2$path === void 0 ? void 0 : _ops$2$path[0]) === "hide") {
          if (ctx_.currentSheetId === ops[0].id) {
            var shownSheets = ctx_.luckysheetfile.filter(function (sheet) {
              return (___default['default'].isUndefined(sheet.hide) || (sheet === null || sheet === void 0 ? void 0 : sheet.hide) !== 1) && sheet.id !== ops[0].id;
            });
            ctx_.currentSheetId = ___default['default'].sortBy(shownSheets, function (sheet) {
              return sheet.order;
            })[0].id;
          }
        }
        core.createFilterOptions(ctx_, ctx_.luckysheet_filter_save, (_ops$3 = ops[0]) === null || _ops$3 === void 0 ? void 0 : _ops$3.id);
        if (patches.length === 0) return;
        try {
          produce.applyPatches(ctx_, patches);
        } catch (e) {
          console.error(e);
        }
      }, {
        noHistory: true
      });
    },
    getCellValue: function getCellValue(row, column) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return core.api.getCellValue(context, row, column, options);
    },
    setCellValue: function setCellValue(row, column, value) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return setContext(function (draftCtx) {
        return core.api.setCellValue(draftCtx, row, column, value, cellInput, options);
      });
    },
    clearCell: function clearCell(row, column) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return setContext(function (draftCtx) {
        return core.api.clearCell(draftCtx, row, column, options);
      });
    },
    setCellFormat: function setCellFormat(row, column, attr, value) {
      var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      return setContext(function (draftCtx) {
        return core.api.setCellFormat(draftCtx, row, column, attr, value, options);
      });
    },
    autoFillCell: function autoFillCell(copyRange, applyRange, direction) {
      return setContext(function (draftCtx) {
        return core.api.autoFillCell(draftCtx, copyRange, applyRange, direction);
      });
    },
    freeze: function freeze(type, range) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return setContext(function (draftCtx) {
        return core.api.freeze(draftCtx, type, range, options);
      });
    },
    insertRowOrColumn: function insertRowOrColumn(type, index, count) {
      var direction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "rightbottom";
      var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      return setContext(function (draftCtx) {
        return core.api.insertRowOrColumn(draftCtx, type, index, count, direction, options);
      });
    },
    deleteRowOrColumn: function deleteRowOrColumn(type, start, end) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return setContext(function (draftCtx) {
        return core.api.deleteRowOrColumn(draftCtx, type, start, end, options);
      });
    },
    hideRowOrColumn: function hideRowOrColumn(rowOrColInfo, type) {
      return setContext(function (draftCtx) {
        return core.api.hideRowOrColumn(draftCtx, rowOrColInfo, type);
      });
    },
    showRowOrColumn: function showRowOrColumn(rowOrColInfo, type) {
      return setContext(function (draftCtx) {
        return core.api.showRowOrColumn(draftCtx, rowOrColInfo, type);
      });
    },
    setRowHeight: function setRowHeight(rowInfo) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var custom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      return setContext(function (draftCtx) {
        return core.api.setRowHeight(draftCtx, rowInfo, options, custom);
      });
    },
    setColumnWidth: function setColumnWidth(columnInfo) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var custom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      return setContext(function (draftCtx) {
        return core.api.setColumnWidth(draftCtx, columnInfo, options, custom);
      });
    },
    getRowHeight: function getRowHeight(rows) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return core.api.getRowHeight(context, rows, options);
    },
    getColumnWidth: function getColumnWidth(columns) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return core.api.getColumnWidth(context, columns, options);
    },
    getSelection: function getSelection() {
      return core.api.getSelection(context);
    },
    getFlattenRange: function getFlattenRange(range) {
      return core.api.getFlattenRange(context, range);
    },
    getCellsByFlattenRange: function getCellsByFlattenRange(range) {
      return core.api.getCellsByFlattenRange(context, range);
    },
    getSelectionCoordinates: function getSelectionCoordinates() {
      return core.api.getSelectionCoordinates(context);
    },
    getCellsByRange: function getCellsByRange(range) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return core.api.getCellsByRange(context, range, options);
    },
    getHtmlByRange: function getHtmlByRange(range) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return core.api.getHtmlByRange(context, range, options);
    },
    setSelection: function setSelection(range) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return setContext(function (draftCtx) {
        return core.api.setSelection(draftCtx, range, options);
      });
    },
    setCellValuesByRange: function setCellValuesByRange(data, range) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return setContext(function (draftCtx) {
        return core.api.setCellValuesByRange(draftCtx, data, range, cellInput, options);
      });
    },
    setCellFormatByRange: function setCellFormatByRange(attr, value, range) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return setContext(function (draftCtx) {
        return core.api.setCellFormatByRange(draftCtx, attr, value, range, options);
      });
    },
    mergeCells: function mergeCells(ranges, type) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return setContext(function (draftCtx) {
        return core.api.mergeCells(draftCtx, ranges, type, options);
      });
    },
    cancelMerge: function cancelMerge(ranges) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return setContext(function (draftCtx) {
        return core.api.cancelMerge(draftCtx, ranges, options);
      });
    },
    getAllSheets: function getAllSheets() {
      return core.api.getAllSheets(context);
    },
    getSheet: function getSheet() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return core.api.getSheetWithLatestCelldata(context, options);
    },
    addSheet: function addSheet(sheetId) {
      var existingSheetIds = core.api.getAllSheets(context).map(function (sheet) {
        return sheet.id || "";
      });
      if (sheetId && existingSheetIds.includes(sheetId)) {
        console.error("Failed to add new sheet: A sheet with the id \"".concat(sheetId, "\" already exists. Please use a unique sheet id."));
      } else {
        setContext(function (draftCtx) {
          return core.api.addSheet(draftCtx, settings, sheetId);
        });
      }
    },
    deleteSheet: function deleteSheet() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return setContext(function (draftCtx) {
        return core.api.deleteSheet(draftCtx, options);
      });
    },
    updateSheet: function updateSheet(data) {
      return setContext(function (draftCtx) {
        return core.api.updateSheet(draftCtx, data);
      });
    },
    activateSheet: function activateSheet() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return setContext(function (draftCtx) {
        return core.api.activateSheet(draftCtx, options);
      });
    },
    setSheetName: function setSheetName(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return setContext(function (draftCtx) {
        return core.api.setSheetName(draftCtx, name, options);
      });
    },
    setSheetOrder: function setSheetOrder(orderList) {
      return setContext(function (draftCtx) {
        return core.api.setSheetOrder(draftCtx, orderList);
      });
    },
    scroll: function scroll(options) {
      return core.api.scroll(context, scrollbarX, scrollbarY, options);
    },
    addPresences: function addPresences(newPresences) {
      setContext(function (draftCtx) {
        draftCtx.presences = ___default['default'].differenceBy(draftCtx.presences || [], newPresences, function (v) {
          return v.userId == null ? v.username : v.userId;
        }).concat(newPresences);
      });
    },
    removePresences: function removePresences(arr) {
      setContext(function (draftCtx) {
        if (draftCtx.presences != null) {
          draftCtx.presences = ___default['default'].differenceBy(draftCtx.presences, arr, function (v) {
            return v.userId == null ? v.username : v.userId;
          });
        }
      });
    },
    handleUndo: handleUndo,
    handleRedo: handleRedo,
    calculateFormula: function calculateFormula(id, range) {
      setContext(function (draftCtx) {
        core.api.calculateFormula(draftCtx, id, range);
      });
    },
    dataToCelldata: function dataToCelldata(data) {
      return core.api.dataToCelldata(data);
    },
    celldataToData: function celldataToData(celldata, rowCount, colCount) {
      return core.api.celldataToData(celldata, rowCount, colCount);
    },
    batchCallApis: function batchCallApis(apiCalls) {
      setContext(function (draftCtx) {
        apiCalls.forEach(function (apiCall) {
          var name = apiCall.name,
            args = apiCall.args;
          if (typeof core.api[name] === "function") {
            core.api[name].apply(core.api, [draftCtx].concat(_toConsumableArray(args)));
          } else {
            console.warn("API ".concat(name, " does not exist"));
          }
        });
      });
    }
  };
}

var SelectItem = function SelectItem(_ref) {
  var item = _ref.item,
    isChecked = _ref.isChecked,
    _onChange = _ref.onChange,
    isItemVisible = _ref.isItemVisible;
  var checked = React.useMemo(function () {
    return isChecked(item.key);
  }, [isChecked, item.key]);
  return isItemVisible(item) ? (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "select-item"
  }, /*#__PURE__*/React__default['default'].createElement("input", {
    className: "filter-checkbox",
    type: "checkbox",
    checked: checked,
    onChange: function onChange() {
      _onChange(item, !checked);
    }
  }), /*#__PURE__*/React__default['default'].createElement("div", null, item.text), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "count"
  }, "( ".concat(item.rows.length, " )")))) : null;
};
var _DateSelectTreeItem = function DateSelectTreeItem(_ref2) {
  var item = _ref2.item,
    _ref2$depth = _ref2.depth,
    depth = _ref2$depth === void 0 ? 0 : _ref2$depth,
    initialExpand = _ref2.initialExpand,
    onExpand = _ref2.onExpand,
    isChecked = _ref2.isChecked,
    _onChange2 = _ref2.onChange,
    isItemVisible = _ref2.isItemVisible;
  var _useState = React.useState(initialExpand(item.key)),
    _useState2 = _slicedToArray(_useState, 2),
    expand = _useState2[0],
    setExpand = _useState2[1];
  var checked = React.useMemo(function () {
    return isChecked(item.key);
  }, [isChecked, item.key]);
  return isItemVisible(item) ? (/*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "select-item",
    style: {
      marginLeft: -2 + depth * 20
    },
    onClick: function onClick() {
      onExpand === null || onExpand === void 0 ? void 0 : onExpand(item.key, !expand);
      setExpand(!expand);
    },
    tabIndex: 0
  }, ___default['default'].isEmpty(item.children) ? (/*#__PURE__*/React__default['default'].createElement("div", {
    style: {
      width: 10
    }
  })) : (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "filter-caret ".concat(expand ? "down" : "right"),
    style: {
      cursor: "pointer"
    }
  })), /*#__PURE__*/React__default['default'].createElement("input", {
    className: "filter-checkbox",
    type: "checkbox",
    checked: checked,
    onChange: function onChange() {
      _onChange2(item, !checked);
    },
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    tabIndex: 0
  }), /*#__PURE__*/React__default['default'].createElement("div", null, item.text), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "count"
  }, "( ".concat(item.rows.length, " )"))), expand && item.children.map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement(_DateSelectTreeItem, _objectSpread2({
      key: v.key,
      item: v,
      depth: depth + 1
    }, {
      initialExpand: initialExpand,
      onExpand: onExpand,
      isChecked: isChecked,
      onChange: _onChange2,
      isItemVisible: isItemVisible
    }));
  }))) : null;
};
var DateSelectTree = function DateSelectTree(_ref3) {
  var dates = _ref3.dates,
    initialExpand = _ref3.initialExpand,
    onExpand = _ref3.onExpand,
    isChecked = _ref3.isChecked,
    onChange = _ref3.onChange,
    isItemVisible = _ref3.isItemVisible;
  return /*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, dates.map(function (v) {
    return /*#__PURE__*/React__default['default'].createElement(_DateSelectTreeItem, _objectSpread2({
      key: v.key,
      item: v
    }, {
      initialExpand: initialExpand,
      onExpand: onExpand,
      isChecked: isChecked,
      onChange: onChange,
      isItemVisible: isItemVisible
    }));
  }));
};
var FilterMenu = function FilterMenu() {
  var _settings$filterConte;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    settings = _useContext.settings,
    refs = _useContext.refs;
  var containerRef = React.useRef(null);
  var contextRef = React.useRef(context);
  var byColorMenuRef = React.useRef(null);
  var subMenuRef = React.useRef(null);
  var filterContextMenu = context.filterContextMenu;
  var _ref4 = filterContextMenu || {
      startRow: null,
      startCol: null,
      endRow: null,
      endCol: null,
      col: null,
      listBoxMaxHeight: 400
    },
    startRow = _ref4.startRow,
    startCol = _ref4.startCol,
    endRow = _ref4.endRow,
    endCol = _ref4.endCol,
    col = _ref4.col,
    listBoxMaxHeight = _ref4.listBoxMaxHeight;
  var _locale = core.locale(context),
    filter = _locale.filter;
  var _useState3 = React.useState({
      dates: [],
      dateRowMap: {},
      values: [],
      valueRowMap: {},
      visibleRows: [],
      flattenValues: []
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    data = _useState4[0],
    setData = _useState4[1];
  var _useState5 = React.useState([]),
    _useState6 = _slicedToArray(_useState5, 2),
    datesUncheck = _useState6[0],
    setDatesUncheck = _useState6[1];
  var _useState7 = React.useState([]),
    _useState8 = _slicedToArray(_useState7, 2),
    valuesUncheck = _useState8[0],
    setValuesUncheck = _useState8[1];
  var dateTreeExpandState = React.useRef({});
  var hiddenRows = React.useRef([]);
  var _useState9 = React.useState([]),
    _useState0 = _slicedToArray(_useState9, 2),
    showValues = _useState0[0],
    setShowValues = _useState0[1];
  var _useState1 = React.useState(""),
    _useState10 = _slicedToArray(_useState1, 2),
    searchText = _useState10[0],
    setSearchText = _useState10[1];
  var _useState11 = React.useState(),
    _useState12 = _slicedToArray(_useState11, 2),
    subMenuPos = _useState12[0],
    setSubMenuPos = _useState12[1];
  var _useState13 = React.useState({
      bgColors: [],
      fcColors: []
    }),
    _useState14 = _slicedToArray(_useState13, 2),
    filterColors = _useState14[0],
    setFilterColors = _useState14[1];
  var _useState15 = React.useState(false),
    _useState16 = _slicedToArray(_useState15, 2),
    showSubMenu = _useState16[0],
    setShowSubMenu = _useState16[1];
  var _useAlert = useAlert(),
    showAlert = _useAlert.showAlert;
  var mouseHoverSubMenu = React.useRef(false);
  contextRef.current = context;
  var close = React.useCallback(function () {
    setContext(function (ctx) {
      ctx.filterContextMenu = undefined;
    });
  }, [setContext]);
  useOutsideClick(containerRef, close, [close]);
  var initialExpand = React.useCallback(function (key) {
    var expand = dateTreeExpandState.current[key];
    if (expand == null) {
      dateTreeExpandState.current[key] = true;
      return true;
    }
    return expand;
  }, []);
  var onExpand = React.useCallback(function (key, expand) {
    dateTreeExpandState.current[key] = expand;
  }, []);
  var searchValues = React.useMemo(function () {
    return ___default['default'].debounce(function (text) {
      setShowValues(___default['default'].filter(data.flattenValues, function (v) {
        return v.toLowerCase().indexOf(text.toLowerCase()) > -1;
      }));
    }, 300);
  }, [data.flattenValues]);
  var selectAll = React.useCallback(function () {
    setDatesUncheck([]);
    setValuesUncheck([]);
    hiddenRows.current = [];
  }, []);
  var clearAll = React.useCallback(function () {
    setDatesUncheck(___default['default'].keys(data.dateRowMap));
    setValuesUncheck(___default['default'].keys(data.valueRowMap));
    hiddenRows.current = data.visibleRows;
  }, [data.dateRowMap, data.valueRowMap, data.visibleRows]);
  var inverseSelect = React.useCallback(function () {
    setDatesUncheck(produce__default['default'](function (draft) {
      return ___default['default'].xor(draft, ___default['default'].keys(data.dateRowMap));
    }));
    setValuesUncheck(produce__default['default'](function (draft) {
      return ___default['default'].xor(draft, ___default['default'].keys(data.valueRowMap));
    }));
    hiddenRows.current = ___default['default'].xor(hiddenRows.current, data.visibleRows);
  }, [data.dateRowMap, data.valueRowMap, data.visibleRows]);
  var onColorSelectChange = React.useCallback(function (key, color, checked) {
    setFilterColors(produce__default['default'](function (draft) {
      var colorData = ___default['default'].find(___default['default'].get(draft, key), function (v) {
        return v.color === color;
      });
      colorData.checked = checked;
    }));
  }, []);
  var delayHideSubMenu = React.useMemo(function () {
    return ___default['default'].debounce(function () {
      if (mouseHoverSubMenu.current) return;
      setShowSubMenu(false);
    }, 200);
  }, []);
  var sortData = React.useCallback(function (asc) {
    if (col == null) return;
    setContext(function (draftCtx) {
      var errMsg = core.orderbydatafiler(draftCtx, startRow, startCol, endRow, endCol, col, asc);
      if (errMsg != null) showAlert(errMsg);
    });
  }, [col, setContext, startRow, startCol, endRow, endCol, showAlert]);
  var renderColorList = React.useCallback(function (key, title, colors, onSelectChange) {
    return colors.length > 1 ? (/*#__PURE__*/React__default['default'].createElement("div", {
      key: key
    }, /*#__PURE__*/React__default['default'].createElement("div", {
      className: "title"
    }, title), /*#__PURE__*/React__default['default'].createElement("div", {
      className: "color-list"
    }, colors.map(function (v) {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: v.color,
        className: "item",
        onClick: function onClick() {
          return onSelectChange(key, v.color, !v.checked);
        },
        tabIndex: 0
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "color-label",
        style: {
          backgroundColor: v.color
        }
      }), /*#__PURE__*/React__default['default'].createElement("input", {
        className: "luckysheet-mousedown-cancel",
        type: "checkbox",
        checked: v.checked,
        onChange: function onChange() {}
      }));
    })))) : null;
  }, []);
  React.useLayoutEffect(function () {
    var _refs$workbookContain;
    if (!containerRef.current || !filterContextMenu) {
      return;
    }
    var winH = window.innerHeight;
    var winW = window.innerWidth;
    var rect = containerRef.current.getBoundingClientRect();
    var workbookRect = (_refs$workbookContain = refs.workbookContainer.current) === null || _refs$workbookContain === void 0 ? void 0 : _refs$workbookContain.getBoundingClientRect();
    if (!workbookRect) {
      return;
    }
    var menuW = rect.width;
    var menuH = 350;
    var top = filterContextMenu.y;
    var left = filterContextMenu.x;
    var hasOverflow = false;
    if (workbookRect.left + left + menuW > winW) {
      left -= menuW;
      hasOverflow = true;
    }
    if (workbookRect.top + top + menuH > winH) {
      top -= menuH;
      hasOverflow = true;
    }
    if (top < 0) {
      top = 0;
      hasOverflow = true;
    }
    var containerH = winH - rect.top - 350;
    if (containerH < 0) {
      containerH = 100;
    }
    if (filterContextMenu.x === left && filterContextMenu.y === top && filterContextMenu.listBoxMaxHeight === containerH) {
      return;
    }
    setContext(function (draftCtx) {
      if (hasOverflow) {
        ___default['default'].set(draftCtx, "filterContextMenu.x", left);
        ___default['default'].set(draftCtx, "filterContextMenu.y", top);
      }
      ___default['default'].set(draftCtx, "filterContextMenu.listBoxMaxHeight", containerH);
    });
  }, [filterContextMenu, refs.workbookContainer, setContext]);
  React.useLayoutEffect(function () {
    var _byColorMenuRef$curre, _subMenuRef$current;
    if (!subMenuPos) return;
    var rect = (_byColorMenuRef$curre = byColorMenuRef.current) === null || _byColorMenuRef$curre === void 0 ? void 0 : _byColorMenuRef$curre.getBoundingClientRect();
    var subMenuRect = (_subMenuRef$current = subMenuRef.current) === null || _subMenuRef$current === void 0 ? void 0 : _subMenuRef$current.getBoundingClientRect();
    if (rect == null || subMenuRect == null) return;
    var winW = window.innerWidth;
    var pos = ___default['default'].cloneDeep(subMenuPos);
    if (subMenuRect.left + subMenuRect.width > winW) {
      pos.left -= subMenuRect.width;
      setSubMenuPos(pos);
    }
  }, [subMenuPos]);
  React.useEffect(function () {
    if (col == null) return;
    setSearchText("");
    setShowSubMenu(false);
    dateTreeExpandState.current = {};
    hiddenRows.current = (filterContextMenu === null || filterContextMenu === void 0 ? void 0 : filterContextMenu.hiddenRows) || [];
    var res = core.getFilterColumnValues(contextRef.current, col, startRow, endRow, startCol);
    setData(___default['default'].omit(res, ["datesUncheck", "valuesUncheck"]));
    setDatesUncheck(res.datesUncheck);
    setValuesUncheck(res.valuesUncheck);
    setShowValues(res.flattenValues);
  }, [col, endRow, startRow, startCol, hiddenRows, filterContextMenu === null || filterContextMenu === void 0 ? void 0 : filterContextMenu.hiddenRows]);
  React.useEffect(function () {
    if (col == null) return;
    setFilterColors(core.getFilterColumnColors(contextRef.current, col, startRow, endRow));
  }, [col, endRow, startRow]);
  if (filterContextMenu == null) return null;
  return /*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-context-menu luckysheet-cols-menu fortune-filter-menu",
    id: "luckysheet-\\${menuid}-menu",
    ref: containerRef,
    style: {
      left: filterContextMenu.x,
      top: filterContextMenu.y
    }
  }, (_settings$filterConte = settings.filterContextMenu) === null || _settings$filterConte === void 0 ? void 0 : _settings$filterConte.map(function (name, i) {
    if (name === "|") {
      return /*#__PURE__*/React__default['default'].createElement(Divider$1, {
        key: "divider-".concat(i)
      });
    }
    if (name === "sort-by-asc") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          return sortData(true);
        }
      }, filter.sortByAsc);
    }
    if (name === "sort-by-desc") {
      return /*#__PURE__*/React__default['default'].createElement(Menu, {
        key: name,
        onClick: function onClick() {
          return sortData(false);
        }
      }, filter.sortByDesc);
    }
    if (name === "filter-by-color") {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: name,
        ref: byColorMenuRef,
        onMouseEnter: function onMouseEnter() {
          var _byColorMenuRef$curre2;
          if (!containerRef.current || !filterContextMenu) {
            return;
          }
          setShowSubMenu(true);
          var rect = (_byColorMenuRef$curre2 = byColorMenuRef.current) === null || _byColorMenuRef$curre2 === void 0 ? void 0 : _byColorMenuRef$curre2.getBoundingClientRect();
          if (rect == null) return;
          setSubMenuPos({
            top: rect.top - 5,
            left: rect.right
          });
        },
        onMouseLeave: delayHideSubMenu
      }, /*#__PURE__*/React__default['default'].createElement(Menu, {
        onClick: function onClick() {}
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "filter-bycolor-container"
      }, filter.filterByColor, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "filter-caret right"
      }))));
    }
    if (name === "filter-by-condition") {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: "name"
      }, /*#__PURE__*/React__default['default'].createElement(Menu, {
        onClick: function onClick() {}
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "filter-caret right"
      }), filter.filterByCondition), /*#__PURE__*/React__default['default'].createElement("div", {
        className: "luckysheet-\\${menuid}-bycondition",
        style: {
          display: "none"
        }
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "luckysheet-flat-menu-button luckysheet-mousedown-cancel",
        id: "luckysheet-\\${menuid}-selected"
      }, /*#__PURE__*/React__default['default'].createElement("span", {
        className: "luckysheet-mousedown-cancel",
        "data-value": "null",
        "data-type": "0"
      }, filter.filiterInputNone), /*#__PURE__*/React__default['default'].createElement("div", {
        className: "luckysheet-mousedown-cancel"
      }, /*#__PURE__*/React__default['default'].createElement("i", {
        className: "fa fa-sort",
        "aria-hidden": "true"
      })))));
    }
    if (name === "filter-by-value") {
      return /*#__PURE__*/React__default['default'].createElement("div", {
        key: name
      }, /*#__PURE__*/React__default['default'].createElement(Menu, {
        onClick: function onClick() {}
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "filter-caret right"
      }), filter.filterByValues), /*#__PURE__*/React__default['default'].createElement("div", {
        className: "luckysheet-filter-byvalue"
      }, /*#__PURE__*/React__default['default'].createElement("div", {
        className: "fortune-menuitem-row byvalue-btn-row"
      }, /*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement("span", {
        className: "fortune-byvalue-btn",
        onClick: selectAll,
        tabIndex: 0
      }, filter.filterValueByAllBtn), " - ", /*#__PURE__*/React__default['default'].createElement("span", {
        className: "fortune-byvalue-btn",
        onClick: clearAll,
        tabIndex: 0
      }, filter.filterValueByClearBtn), " - ", /*#__PURE__*/React__default['default'].createElement("span", {
        className: "fortune-byvalue-btn",
        onClick: inverseSelect,
        tabIndex: 0
      }, filter.filterValueByInverseBtn)), /*#__PURE__*/React__default['default'].createElement("div", {
        className: "byvalue-filter-icon"
      }, /*#__PURE__*/React__default['default'].createElement(SVGIcon, {
        name: "filter-fill",
        style: {
          width: 20,
          height: 20
        }
      }))), /*#__PURE__*/React__default['default'].createElement("div", {
        className: "filtermenu-input-container"
      }, /*#__PURE__*/React__default['default'].createElement("input", {
        type: "text",
        onKeyDown: function onKeyDown(e) {
          return e.stopPropagation();
        },
        placeholder: filter.filterValueByTip,
        className: "luckysheet-mousedown-cancel",
        id: "luckysheet-\\${menuid}-byvalue-input",
        value: searchText,
        onChange: function onChange(e) {
          setSearchText(e.target.value);
          searchValues(e.target.value);
        }
      })), /*#__PURE__*/React__default['default'].createElement("div", {
        id: "luckysheet-filter-byvalue-select",
        style: {
          maxHeight: listBoxMaxHeight
        }
      }, /*#__PURE__*/React__default['default'].createElement(DateSelectTree, {
        dates: data.dates,
        onExpand: onExpand,
        initialExpand: initialExpand,
        isChecked: function isChecked(key) {
          return ___default['default'].find(datesUncheck, function (v) {
            return v.match(key) != null;
          }) == null;
        },
        onChange: function onChange(item, checked) {
          var rows = hiddenRows.current;
          hiddenRows.current = checked ? ___default['default'].without.apply(___default['default'], [rows].concat(_toConsumableArray(item.rows))) : ___default['default'].union(rows, item.rows);
          setDatesUncheck(produce__default['default'](function (draft) {
            return checked ? ___default['default'].without.apply(___default['default'], [draft].concat(_toConsumableArray(item.dateValues))) : ___default['default'].union(draft, item.dateValues);
          }));
        },
        isItemVisible: function isItemVisible(item) {
          return showValues.length === data.flattenValues.length ? true : ___default['default'].findIndex(showValues, function (v) {
            return v.match(item.key) != null;
          }) > -1;
        }
      }), data.values.map(function (v) {
        return /*#__PURE__*/React__default['default'].createElement(SelectItem, {
          key: v.key,
          item: v,
          isChecked: function isChecked(key) {
            return !___default['default'].includes(valuesUncheck, key);
          },
          onChange: function onChange(item, checked) {
            var rows = hiddenRows.current;
            hiddenRows.current = checked ? ___default['default'].without.apply(___default['default'], [rows].concat(_toConsumableArray(item.rows))) : ___default['default'].concat(rows, item.rows);
            setValuesUncheck(produce__default['default'](function (draft) {
              if (checked) {
                ___default['default'].pull(draft, item.key);
              } else {
                draft.push(item.key);
              }
            }));
          },
          isItemVisible: function isItemVisible(item) {
            return showValues.length === data.flattenValues.length ? true : ___default['default'].includes(showValues, item.text);
          }
        });
      }))));
    }
    return null;
  }), /*#__PURE__*/React__default['default'].createElement(Divider$1, null), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-menuitem-row"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      if (col == null) return;
      setContext(function (draftCtx) {
        var rowHidden = ___default['default'].reduce(hiddenRows.current, function (pre, curr) {
          pre[curr] = 0;
          return pre;
        }, {});
        core.saveFilter(draftCtx, hiddenRows.current.length > 0, rowHidden, {}, startRow, endRow, col, startCol, endCol);
        hiddenRows.current = [];
        draftCtx.filterContextMenu = undefined;
      });
    },
    tabIndex: 0
  }, filter.filterConform), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-default",
    onClick: function onClick() {
      setContext(function (draftCtx) {
        draftCtx.filterContextMenu = undefined;
      });
    },
    tabIndex: 0
  }, filter.filterCancel), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-danger",
    onClick: function onClick() {
      setContext(function (draftCtx) {
        core.clearFilter(draftCtx);
      });
    },
    tabIndex: 0
  }, filter.clearFilter))), showSubMenu && (/*#__PURE__*/React__default['default'].createElement("div", {
    ref: subMenuRef,
    className: "luckysheet-filter-bycolor-submenu",
    style: subMenuPos,
    onMouseEnter: function onMouseEnter() {
      mouseHoverSubMenu.current = true;
    },
    onMouseLeave: function onMouseLeave() {
      mouseHoverSubMenu.current = false;
      setShowSubMenu(false);
    }
  }, filterColors.bgColors.length < 2 && filterColors.fcColors.length < 2 ? (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "one-color-tip"
  }, filter.filterContainerOneColorTip)) : (/*#__PURE__*/React__default['default'].createElement(React__default['default'].Fragment, null, [{
    key: "bgColors",
    title: filter.filiterByColorTip,
    colors: filterColors.bgColors
  }, {
    key: "fcColors",
    title: filter.filiterByTextColorTip,
    colors: filterColors.fcColors
  }].map(function (v) {
    return renderColorList(v.key, v.title, v.colors, onColorSelectChange);
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "button-basic button-primary",
    onClick: function onClick() {
      if (col == null) return;
      setContext(function (draftCtx) {
        var rowHidden = ___default['default'].reduce(___default['default'](filterColors).values().flatten().map(function (v) {
          return v.checked ? [] : v.rows;
        }).flatten().valueOf(), function (pre, curr) {
          pre[curr] = 0;
          return pre;
        }, {});
        core.saveFilter(draftCtx, !___default['default'].isEmpty(rowHidden), rowHidden, {}, startRow, endRow, col, startCol, endCol);
        hiddenRows.current = [];
        draftCtx.filterContextMenu = undefined;
      });
    },
    tabIndex: 0
  }, filter.filterConform))))));
};

var SheetHiddenButton = function SheetHiddenButton(_ref) {
  var style = _ref.style,
    sheet = _ref.sheet;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var showSheet = React.useCallback(function () {
    if (context.allowEdit === false) return;
    if (!sheet) return;
    setContext(function (ctx) {
      core.api.showSheet(ctx, sheet.id);
    });
  }, [context.allowEdit, setContext, sheet]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    style: style,
    onClick: function onClick(e) {
      e.stopPropagation();
      showSheet();
    },
    tabIndex: 0,
    className: "fortune-sheet-hidden-button"
  }, (sheet === null || sheet === void 0 ? void 0 : sheet.hide) === 1 ? (/*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "hidden",
    width: 16,
    height: 16,
    style: {
      marginTop: "7px"
    }
  })) : "");
};

var SheetListItem = function SheetListItem(_ref) {
  var sheet = _ref.sheet,
    isDropPlaceholder = _ref.isDropPlaceholder;
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext,
    refs = _useContext.refs;
  var containerRef = React.useRef(null);
  React.useEffect(function () {
    setContext(function (draftCtx) {
      var r = context.sheetScrollRecord[draftCtx === null || draftCtx === void 0 ? void 0 : draftCtx.currentSheetId];
      if (r) {
        var _r$scrollLeft, _r$scrollTop, _r$luckysheet_select_, _r$luckysheet_select_2;
        draftCtx.scrollLeft = (_r$scrollLeft = r.scrollLeft) !== null && _r$scrollLeft !== void 0 ? _r$scrollLeft : 0;
        draftCtx.scrollTop = (_r$scrollTop = r.scrollTop) !== null && _r$scrollTop !== void 0 ? _r$scrollTop : 0;
        draftCtx.luckysheet_select_status = (_r$luckysheet_select_ = r.luckysheet_select_status) !== null && _r$luckysheet_select_ !== void 0 ? _r$luckysheet_select_ : false;
        draftCtx.luckysheet_select_save = (_r$luckysheet_select_2 = r.luckysheet_select_save) !== null && _r$luckysheet_select_2 !== void 0 ? _r$luckysheet_select_2 : undefined;
      } else {
        draftCtx.scrollLeft = 0;
        draftCtx.scrollTop = 0;
        draftCtx.luckysheet_select_status = false;
        draftCtx.luckysheet_select_save = undefined;
      }
      draftCtx.luckysheet_selection_range = [];
    });
  }, [context.currentSheetId, context.sheetScrollRecord, setContext]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-sheet-list-item",
    key: sheet.id,
    ref: containerRef,
    onClick: function onClick() {
      if (isDropPlaceholder) return;
      setContext(function (draftCtx) {
        draftCtx.sheetScrollRecord[draftCtx.currentSheetId] = {
          scrollLeft: draftCtx.scrollLeft,
          scrollTop: draftCtx.scrollTop,
          luckysheet_select_status: draftCtx.luckysheet_select_status,
          luckysheet_select_save: draftCtx.luckysheet_select_save,
          luckysheet_selection_range: draftCtx.luckysheet_selection_range
        };
        draftCtx.currentSheetId = sheet.id;
        draftCtx.zoomRatio = sheet.zoomRatio || 1;
        core.cancelActiveImgItem(draftCtx, refs.globalCache);
        core.cancelNormalSelected(draftCtx);
      });
    },
    tabIndex: 0
  }, /*#__PURE__*/React__default['default'].createElement("span", {
    className: "fortune-sheet-selected-check-sapce"
  }, sheet.id === context.currentSheetId && (/*#__PURE__*/React__default['default'].createElement(SVGIcon, {
    name: "check",
    width: 16,
    height: 16,
    style: {
      lineHeight: 30,
      verticalAlign: "middle"
    }
  }))), /*#__PURE__*/React__default['default'].createElement("span", {
    className: "luckysheet-sheets-item-name fortune-sheet-list-item-name",
    spellCheck: "false"
  }, !!sheet.color && (/*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-sheets-list-item-color",
    style: {
      background: sheet.color
    }
  })), sheet.name), sheet.hide && /*#__PURE__*/React__default['default'].createElement(SheetHiddenButton, {
    sheet: sheet
  }));
};

var SheetList = function SheetList() {
  var _useContext = React.useContext(WorkbookContext),
    context = _useContext.context,
    setContext = _useContext.setContext;
  var containerRef = React.useRef(null);
  var close = React.useCallback(function () {
    setContext(function (ctx) {
      ctx.showSheetList = false;
    });
  }, [setContext]);
  useOutsideClick(containerRef, close, [close]);
  return /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-context-menu luckysheet-cols-menu fortune-sheet-list",
    ref: containerRef
  }, ___default['default'].sortBy(context.luckysheetfile, function (s) {
    return Number(s.order);
  }).map(function (singleSheet) {
    return /*#__PURE__*/React__default['default'].createElement(SheetListItem, {
      sheet: singleSheet,
      key: singleSheet.id
    });
  }));
};

var _excluded = ["onChange", "onOp", "data"];
produce.enablePatches();
var triggerGroupValuesRefresh = function triggerGroupValuesRefresh(ctx) {
  if (ctx.groupValuesRefreshData.length > 0) {
    core.groupValuesRefresh(ctx);
  }
};
var concatProducer = function concatProducer() {
  for (var _len = arguments.length, producers = new Array(_len), _key = 0; _key < _len; _key++) {
    producers[_key] = arguments[_key];
  }
  return function (ctx) {
    producers.forEach(function (producer) {
      producer(ctx);
    });
  };
};
var Workbook = /*#__PURE__*/React__default['default'].forwardRef(function (_ref, ref) {
  var _context$luckysheetfi;
  var onChange = _ref.onChange,
    onOp = _ref.onOp,
    originalData = _ref.data,
    props = _objectWithoutProperties(_ref, _excluded);
  var globalCache = React.useRef({
    undoList: [],
    redoList: []
  });
  var cellInput = React.useRef(null);
  var fxInput = React.useRef(null);
  var canvas = React.useRef(null);
  var scrollbarX = React.useRef(null);
  var scrollbarY = React.useRef(null);
  var cellArea = React.useRef(null);
  var workbookContainer = React.useRef(null);
  var refs = React.useMemo(function () {
    return {
      globalCache: globalCache.current,
      cellInput: cellInput,
      fxInput: fxInput,
      canvas: canvas,
      scrollbarX: scrollbarX,
      scrollbarY: scrollbarY,
      cellArea: cellArea,
      workbookContainer: workbookContainer
    };
  }, []);
  var _useState = React.useState(core.defaultContext(refs)),
    _useState2 = _slicedToArray(_useState, 2),
    context = _useState2[0],
    setContext = _useState2[1];
  var _locale = core.locale(context),
    formula = _locale.formula,
    info = _locale.info;
  var _useState3 = React.useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    moreToolbarItems = _useState4[0],
    setMoreToolbarItems = _useState4[1];
  var _useState5 = React.useState({
      numberC: 0,
      count: 0,
      sum: 0,
      max: 0,
      min: 0,
      average: ""
    }),
    _useState6 = _slicedToArray(_useState5, 2),
    calInfo = _useState6[0],
    setCalInfo = _useState6[1];
  var mergedSettings = React.useMemo(function () {
    return ___default['default'].assign(___default['default'].cloneDeep(core.defaultSettings), props);
  }, _toConsumableArray(___default['default'].values(props)));
  React.useEffect(function () {
    var selection = context.luckysheet_select_save;
    var lang = props.lang;
    if (selection) {
      var re = core.calcSelectionInfo(context, lang);
      setCalInfo(re);
    }
  }, [context.luckysheet_select_save]);
  var initSheetData = React.useCallback(function (draftCtx, newData, index) {
    var _lastRow$r, _lastCol$c;
    var celldata = newData.celldata,
      row = newData.row,
      column = newData.column;
    var lastRow = ___default['default'].maxBy(celldata, "r");
    var lastCol = ___default['default'].maxBy(celldata, "c");
    var lastRowNum = ((_lastRow$r = lastRow === null || lastRow === void 0 ? void 0 : lastRow.r) !== null && _lastRow$r !== void 0 ? _lastRow$r : 0) + 1;
    var lastColNum = ((_lastCol$c = lastCol === null || lastCol === void 0 ? void 0 : lastCol.c) !== null && _lastCol$c !== void 0 ? _lastCol$c : 0) + 1;
    if (row != null && column != null && row > 0 && column > 0) {
      lastRowNum = Math.max(lastRowNum, row);
      lastColNum = Math.max(lastColNum, column);
    } else {
      lastRowNum = Math.max(lastRowNum, draftCtx.defaultrowNum);
      lastColNum = Math.max(lastColNum, draftCtx.defaultcolumnNum);
    }
    if (lastRowNum && lastColNum) {
      var expandedData = ___default['default'].times(lastRowNum, function () {
        return ___default['default'].times(lastColNum, function () {
          return null;
        });
      });
      celldata === null || celldata === void 0 ? void 0 : celldata.forEach(function (d) {
        expandedData[d.r][d.c] = d.v;
      });
      draftCtx.luckysheetfile = produce__default['default'](draftCtx.luckysheetfile, function (d) {
        d[index].data = expandedData;
        delete d[index].celldata;
        return d;
      });
      return expandedData;
    }
    return null;
  }, []);
  var emitOp = React.useCallback(function (ctx, patches, options) {
    var undo = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (onOp) {
      onOp(core.patchToOp(ctx, patches, options, undo));
    }
  }, [onOp]);
  function reduceUndoList(ctx, ctxBefore) {
    var sheetsId = ctx.luckysheetfile.map(function (sheet) {
      return sheet.id;
    });
    var sheetDeletedByMe = globalCache.current.undoList.filter(function (undo) {
      var _undo$options;
      return (_undo$options = undo.options) === null || _undo$options === void 0 ? void 0 : _undo$options.deleteSheetOp;
    }).map(function (item) {
      var _item$options, _item$options$deleteS;
      return (_item$options = item.options) === null || _item$options === void 0 ? void 0 : (_item$options$deleteS = _item$options.deleteSheetOp) === null || _item$options$deleteS === void 0 ? void 0 : _item$options$deleteS.id;
    });
    globalCache.current.undoList = globalCache.current.undoList.filter(function (undo) {
      var _undo$options2, _undo$options3, _undo$options4, _undo$options5;
      return ((_undo$options2 = undo.options) === null || _undo$options2 === void 0 ? void 0 : _undo$options2.deleteSheetOp) || ((_undo$options3 = undo.options) === null || _undo$options3 === void 0 ? void 0 : _undo$options3.id) === undefined || ___default['default'].indexOf(sheetsId, (_undo$options4 = undo.options) === null || _undo$options4 === void 0 ? void 0 : _undo$options4.id) !== -1 || ___default['default'].indexOf(sheetDeletedByMe, (_undo$options5 = undo.options) === null || _undo$options5 === void 0 ? void 0 : _undo$options5.id) !== -1;
    });
    if (ctxBefore.luckysheetfile.length > ctx.luckysheetfile.length) {
      var sheetDeleted = ctxBefore.luckysheetfile.filter(function (oneSheet) {
        return ___default['default'].indexOf(ctx.luckysheetfile.map(function (item) {
          return item.id;
        }), oneSheet.id) === -1;
      }).map(function (item) {
        return core.getSheetIndex(ctxBefore, item.id);
      });
      var deletedIndex = sheetDeleted[0];
      globalCache.current.undoList = globalCache.current.undoList.map(function (oneStep) {
        oneStep.patches = oneStep.patches.map(function (onePatch) {
          if (typeof onePatch.path[1] === "number" && onePatch.path[1] > deletedIndex) {
            onePatch.path[1] -= 1;
          }
          return onePatch;
        });
        oneStep.inversePatches = oneStep.inversePatches.map(function (onePatch) {
          if (typeof onePatch.path[1] === "number" && onePatch.path[1] > deletedIndex) {
            onePatch.path[1] -= 1;
          }
          return onePatch;
        });
        return oneStep;
      });
    }
  }
  function dataToCelldata(data) {
    var cellData = [];
    for (var row = 0; row < (data === null || data === void 0 ? void 0 : data.length); row += 1) {
      for (var col = 0; col < ((_data$row = data[row]) === null || _data$row === void 0 ? void 0 : _data$row.length); col += 1) {
        var _data$row;
        if (data[row][col] !== null) {
          cellData.push({
            r: row,
            c: col,
            v: data[row][col]
          });
        }
      }
    }
    return cellData;
  }
  var setContextWithProduce = React.useCallback(function (recipe) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    setContext(function (ctx_) {
      var _produceWithPatches = produce.produceWithPatches(ctx_, concatProducer(recipe, triggerGroupValuesRefresh)),
        _produceWithPatches2 = _slicedToArray(_produceWithPatches, 3),
        result = _produceWithPatches2[0],
        patches = _produceWithPatches2[1],
        inversePatches = _produceWithPatches2[2];
      if (patches.length > 0 && !options.noHistory) {
        if (options.logPatch) {
          console.info("patch", patches);
        }
        var filteredPatches = core.filterPatch(patches);
        var filteredInversePatches = core.filterPatch(inversePatches);
        if (filteredInversePatches.length > 0) {
          options.id = ctx_.currentSheetId;
          if (options.deleteSheetOp) {
            var target = ctx_.luckysheetfile.filter(function (sheet) {
              var _options$deleteSheetO;
              return sheet.id === ((_options$deleteSheetO = options.deleteSheetOp) === null || _options$deleteSheetO === void 0 ? void 0 : _options$deleteSheetO.id);
            });
            if (target) {
              var index = core.getSheetIndex(ctx_, options.deleteSheetOp.id);
              options.deletedSheet = {
                id: options.deleteSheetOp.id,
                index: index,
                value: ___default['default'].cloneDeep(ctx_.luckysheetfile[index])
              };
              options.deletedSheet.value.celldata = dataToCelldata(options.deletedSheet.value.data);
              delete options.deletedSheet.value.data;
              options.deletedSheet.value.status = 0;
              filteredInversePatches = [{
                op: "add",
                path: ["luckysheetfile", 0],
                value: options.deletedSheet.value
              }];
            }
          } else if (options.addSheetOp) {
            options.addSheet = {};
            options.addSheet.id = result.luckysheetfile[result.luckysheetfile.length - 1].id;
          }
          globalCache.current.undoList.push({
            patches: filteredPatches,
            inversePatches: filteredInversePatches,
            options: options
          });
          globalCache.current.redoList = [];
          emitOp(result, filteredPatches, options);
        }
      } else {
        var _patches$, _patches$$value, _ctx_$luckysheetfile;
        if ((patches === null || patches === void 0 ? void 0 : (_patches$ = patches[0]) === null || _patches$ === void 0 ? void 0 : (_patches$$value = _patches$.value) === null || _patches$$value === void 0 ? void 0 : _patches$$value.length) < (ctx_ === null || ctx_ === void 0 ? void 0 : (_ctx_$luckysheetfile = ctx_.luckysheetfile) === null || _ctx_$luckysheetfile === void 0 ? void 0 : _ctx_$luckysheetfile.length)) {
          reduceUndoList(result, ctx_);
        }
      }
      return result;
    });
  }, [emitOp]);
  var handleUndo = React.useCallback(function () {
    var history = globalCache.current.undoList.pop();
    if (history) {
      setContext(function (ctx_) {
        var _history$options, _history$options3, _history$options4, _history$options5, _history$options6;
        if ((_history$options = history.options) === null || _history$options === void 0 ? void 0 : _history$options.deleteSheetOp) {
          var _history$options$dele, _history$options$dele2;
          history.inversePatches[0].path[1] = ctx_.luckysheetfile.length;
          var order = (_history$options$dele = history.options.deletedSheet) === null || _history$options$dele === void 0 ? void 0 : (_history$options$dele2 = _history$options$dele.value) === null || _history$options$dele2 === void 0 ? void 0 : _history$options$dele2.order;
          var sheetsRight = ctx_.luckysheetfile.filter(function (sheet) {
            var _history$options2, _history$options2$del;
            return (sheet === null || sheet === void 0 ? void 0 : sheet.order) >= order && sheet.id !== (history === null || history === void 0 ? void 0 : (_history$options2 = history.options) === null || _history$options2 === void 0 ? void 0 : (_history$options2$del = _history$options2.deleteSheetOp) === null || _history$options2$del === void 0 ? void 0 : _history$options2$del.id);
          });
          ___default['default'].forEach(sheetsRight, function (sheet) {
            history.inversePatches.push({
              op: "replace",
              path: ["luckysheetfile", core.getSheetIndex(ctx_, sheet.id), "order"],
              value: (sheet === null || sheet === void 0 ? void 0 : sheet.order) + 1
            });
          });
        }
        var newContext = produce.applyPatches(ctx_, history.inversePatches);
        globalCache.current.redoList.push(history);
        var inversedOptions = core.inverseRowColOptions(history.options);
        if (inversedOptions === null || inversedOptions === void 0 ? void 0 : inversedOptions.insertRowColOp) {
          inversedOptions.restoreDeletedCells = true;
        }
        if ((_history$options3 = history.options) === null || _history$options3 === void 0 ? void 0 : _history$options3.addSheetOp) {
          var _inversedOptions$addS;
          var index = core.getSheetIndex(ctx_, history.options.addSheet.id);
          inversedOptions.addSheet = {
            id: history.options.addSheet.id,
            index: index,
            value: ___default['default'].cloneDeep(ctx_.luckysheetfile[index])
          };
          inversedOptions.addSheet.value.celldata = dataToCelldata((_inversedOptions$addS = inversedOptions.addSheet.value) === null || _inversedOptions$addS === void 0 ? void 0 : _inversedOptions$addS.data);
          delete inversedOptions.addSheet.value.data;
        }
        emitOp(newContext, history.inversePatches, inversedOptions, true);
        if (((_history$options4 = history.options) === null || _history$options4 === void 0 ? void 0 : _history$options4.deleteRowColOp) || ((_history$options5 = history.options) === null || _history$options5 === void 0 ? void 0 : _history$options5.insertRowColOp) || ((_history$options6 = history.options) === null || _history$options6 === void 0 ? void 0 : _history$options6.restoreDeletedCells)) newContext.formulaCache.formulaCellInfoMap = null;else newContext.formulaCache.updateFormulaCache(newContext, history, "undo");
        return newContext;
      });
    }
  }, [emitOp]);
  var handleRedo = React.useCallback(function () {
    var history = globalCache.current.redoList.pop();
    if (history) {
      setContext(function (ctx_) {
        var _history$options7, _history$options8, _history$options9;
        var newContext = produce.applyPatches(ctx_, history.patches);
        globalCache.current.undoList.push(history);
        emitOp(newContext, history.patches, history.options);
        if (((_history$options7 = history.options) === null || _history$options7 === void 0 ? void 0 : _history$options7.deleteRowColOp) || ((_history$options8 = history.options) === null || _history$options8 === void 0 ? void 0 : _history$options8.insertRowColOp) || ((_history$options9 = history.options) === null || _history$options9 === void 0 ? void 0 : _history$options9.restoreDeletedCells)) newContext.formulaCache.formulaCellInfoMap = null;else newContext.formulaCache.updateFormulaCache(newContext, history, "redo");
        return newContext;
      });
    }
  }, [emitOp]);
  React.useEffect(function () {
    if (context.luckysheet_select_save != null) {
      var _mergedSettings$hooks, _mergedSettings$hooks2;
      (_mergedSettings$hooks = mergedSettings.hooks) === null || _mergedSettings$hooks === void 0 ? void 0 : (_mergedSettings$hooks2 = _mergedSettings$hooks.afterSelectionChange) === null || _mergedSettings$hooks2 === void 0 ? void 0 : _mergedSettings$hooks2.call(_mergedSettings$hooks, context.currentSheetId, context.luckysheet_select_save[0]);
    }
  }, [context.currentSheetId, context.luckysheet_select_save, mergedSettings.hooks]);
  var providerValue = React.useMemo(function () {
    return {
      context: context,
      setContext: setContextWithProduce,
      settings: mergedSettings,
      handleUndo: handleUndo,
      handleRedo: handleRedo,
      refs: refs
    };
  }, [context, handleRedo, handleUndo, mergedSettings, refs, setContextWithProduce]);
  React.useEffect(function () {
    if (!___default['default'].isEmpty(context.luckysheetfile)) {
      onChange === null || onChange === void 0 ? void 0 : onChange(context.luckysheetfile);
    }
  }, [context.luckysheetfile, onChange]);
  React.useEffect(function () {
    setContextWithProduce(function (draftCtx) {
      var _draftCtx$luckysheetf4, _draftCtx$luckysheet_;
      draftCtx.defaultcolumnNum = mergedSettings.column;
      draftCtx.defaultrowNum = mergedSettings.row;
      draftCtx.defaultFontSize = mergedSettings.defaultFontSize;
      if (___default['default'].isEmpty(draftCtx.luckysheetfile)) {
        var newData = produce__default['default'](originalData, function (draftData) {
          core.ensureSheetIndex(draftData, mergedSettings.generateSheetId);
        });
        draftCtx.luckysheetfile = newData;
        newData.forEach(function (newDatum) {
          var _draftCtx$luckysheetf;
          var index = core.getSheetIndex(draftCtx, newDatum.id);
          var sheet = (_draftCtx$luckysheetf = draftCtx.luckysheetfile) === null || _draftCtx$luckysheetf === void 0 ? void 0 : _draftCtx$luckysheetf[index];
          var cellMatrixData = initSheetData(draftCtx, sheet, index);
          core.setFormulaCellInfoMap(draftCtx, sheet.calcChain, cellMatrixData || undefined);
        });
      }
      if (mergedSettings.devicePixelRatio > 0) {
        draftCtx.devicePixelRatio = mergedSettings.devicePixelRatio;
      }
      draftCtx.lang = mergedSettings.lang;
      draftCtx.allowEdit = mergedSettings.allowEdit;
      draftCtx.hooks = mergedSettings.hooks;
      if (___default['default'].isEmpty(draftCtx.currentSheetId)) {
        core.initSheetIndex(draftCtx);
      }
      var sheetIdx = core.getSheetIndex(draftCtx, draftCtx.currentSheetId);
      if (sheetIdx == null) {
        var _draftCtx$luckysheetf2, _draftCtx$luckysheetf3;
        if (((_draftCtx$luckysheetf2 = (_draftCtx$luckysheetf3 = draftCtx.luckysheetfile) === null || _draftCtx$luckysheetf3 === void 0 ? void 0 : _draftCtx$luckysheetf3.length) !== null && _draftCtx$luckysheetf2 !== void 0 ? _draftCtx$luckysheetf2 : 0) > 0) {
          sheetIdx = 0;
          draftCtx.currentSheetId = draftCtx.luckysheetfile[0].id;
        }
      }
      if (sheetIdx == null) return;
      var sheet = (_draftCtx$luckysheetf4 = draftCtx.luckysheetfile) === null || _draftCtx$luckysheetf4 === void 0 ? void 0 : _draftCtx$luckysheetf4[sheetIdx];
      if (!sheet) return;
      var data = sheet.data;
      if (___default['default'].isEmpty(data)) {
        var temp = initSheetData(draftCtx, sheet, sheetIdx);
        if (!___default['default'].isNull(temp)) {
          data = temp;
        }
      }
      if (___default['default'].isEmpty(draftCtx.luckysheet_select_save) && !___default['default'].isEmpty(sheet.luckysheet_select_save)) {
        draftCtx.luckysheet_select_save = sheet.luckysheet_select_save;
      }
      if (((_draftCtx$luckysheet_ = draftCtx.luckysheet_select_save) === null || _draftCtx$luckysheet_ === void 0 ? void 0 : _draftCtx$luckysheet_.length) === 0) {
        var _data, _data$, _data$$, _data2, _data2$, _data2$$, _data2$$$mc, _data3, _data3$, _data3$$, _data3$$$mc;
        if (((_data = data) === null || _data === void 0 ? void 0 : (_data$ = _data[0]) === null || _data$ === void 0 ? void 0 : (_data$$ = _data$[0]) === null || _data$$ === void 0 ? void 0 : _data$$.mc) && !___default['default'].isNil((_data2 = data) === null || _data2 === void 0 ? void 0 : (_data2$ = _data2[0]) === null || _data2$ === void 0 ? void 0 : (_data2$$ = _data2$[0]) === null || _data2$$ === void 0 ? void 0 : (_data2$$$mc = _data2$$.mc) === null || _data2$$$mc === void 0 ? void 0 : _data2$$$mc.rs) && !___default['default'].isNil((_data3 = data) === null || _data3 === void 0 ? void 0 : (_data3$ = _data3[0]) === null || _data3$ === void 0 ? void 0 : (_data3$$ = _data3$[0]) === null || _data3$$ === void 0 ? void 0 : (_data3$$$mc = _data3$$.mc) === null || _data3$$$mc === void 0 ? void 0 : _data3$$$mc.cs)) {
          draftCtx.luckysheet_select_save = [{
            row: [0, data[0][0].mc.rs - 1],
            column: [0, data[0][0].mc.cs - 1]
          }];
        } else {
          draftCtx.luckysheet_select_save = [{
            row: [0, 0],
            column: [0, 0]
          }];
        }
      }
      draftCtx.config = ___default['default'].isNil(sheet.config) ? {} : sheet.config;
      draftCtx.insertedImgs = sheet.images;
      draftCtx.currency = mergedSettings.currency || "¥";
      draftCtx.zoomRatio = ___default['default'].isNil(sheet.zoomRatio) ? 1 : sheet.zoomRatio;
      draftCtx.rowHeaderWidth = mergedSettings.rowHeaderWidth * draftCtx.zoomRatio;
      draftCtx.columnHeaderHeight = mergedSettings.columnHeaderHeight * draftCtx.zoomRatio;
      if (!___default['default'].isNil(sheet.defaultRowHeight)) {
        draftCtx.defaultrowlen = Number(sheet.defaultRowHeight);
      } else {
        draftCtx.defaultrowlen = mergedSettings.defaultRowHeight;
      }
      if (!___default['default'].isNil(sheet.addRows)) {
        draftCtx.addDefaultRows = Number(sheet.addRows);
      } else {
        draftCtx.addDefaultRows = mergedSettings.addRows;
      }
      if (!___default['default'].isNil(sheet.defaultColWidth)) {
        draftCtx.defaultcollen = Number(sheet.defaultColWidth);
      } else {
        draftCtx.defaultcollen = mergedSettings.defaultColWidth;
      }
      if (!___default['default'].isNil(sheet.showGridLines)) {
        var showGridLines = sheet.showGridLines;
        if (showGridLines === 0 || showGridLines === false) {
          draftCtx.showGridLines = false;
        } else {
          draftCtx.showGridLines = true;
        }
      } else {
        draftCtx.showGridLines = true;
      }
      if (___default['default'].isNil(mergedSettings.lang)) {
        var lang = navigator.languages && navigator.languages[0] || navigator.language || navigator.userLanguage;
        draftCtx.lang = lang;
      }
    }, {
      noHistory: true
    });
  }, [context.currentSheetId, context.luckysheetfile.length, originalData, mergedSettings.defaultRowHeight, mergedSettings.defaultColWidth, mergedSettings.column, mergedSettings.row, mergedSettings.defaultFontSize, mergedSettings.devicePixelRatio, mergedSettings.lang, mergedSettings.allowEdit, mergedSettings.hooks, mergedSettings.generateSheetId, setContextWithProduce, initSheetData, mergedSettings.rowHeaderWidth, mergedSettings.columnHeaderHeight, mergedSettings.addRows, mergedSettings.currency]);
  var onKeyDown = React.useCallback(function (e) {
    var nativeEvent = e.nativeEvent;
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
      e.stopPropagation();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyY") {
      handleRedo();
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    setContextWithProduce(function (draftCtx) {
      core.handleGlobalKeyDown(draftCtx, cellInput.current, fxInput.current, nativeEvent, globalCache.current, handleUndo, handleRedo, canvas.current.getContext("2d"));
    });
  }, [handleRedo, handleUndo, setContextWithProduce]);
  var onPaste = React.useCallback(function (e) {
    var _document$activeEleme;
    if (cellInput.current === document.activeElement || ((_document$activeEleme = document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.className) === "fortune-sheet-overlay") {
      var clipboardData = e.clipboardData;
      if (!clipboardData) {
        clipboardData = window.clipboardData;
      }
      var txtdata = clipboardData.getData("text/html") || clipboardData.getData("text/plain");
      var ele = document.createElement("div");
      ele.innerHTML = txtdata;
      var trList = ele.querySelectorAll("table tr");
      var maxRow = trList.length + context.luckysheet_select_save[0].row[0];
      var rowToBeAdded = maxRow - context.luckysheetfile[core.getSheetIndex(context, context.currentSheetId)].data.length;
      var range = context.luckysheet_select_save;
      if (rowToBeAdded > 0) {
        var insertRowColOp = {
          type: "row",
          index: context.luckysheetfile[core.getSheetIndex(context, context.currentSheetId)].data.length - 1,
          count: rowToBeAdded,
          direction: "rightbottom",
          id: context.currentSheetId
        };
        setContextWithProduce(function (draftCtx) {
          core.insertRowCol(draftCtx, insertRowColOp);
          draftCtx.luckysheet_select_save = range;
        }, {
          insertRowColOp: insertRowColOp
        });
      }
      setContextWithProduce(function (draftCtx) {
        try {
          core.handlePaste(draftCtx, e);
        } catch (err) {
          console.error(err);
        }
      });
    }
  }, [context, setContextWithProduce]);
  var onMoreToolbarItemsClose = React.useCallback(function () {
    setMoreToolbarItems(null);
  }, []);
  React.useEffect(function () {
    document.addEventListener("paste", onPaste);
    return function () {
      document.removeEventListener("paste", onPaste);
    };
  }, [onPaste]);
  React.useImperativeHandle(ref, function () {
    return generateAPIs(context, setContextWithProduce, handleUndo, handleRedo, mergedSettings, cellInput.current, scrollbarX.current, scrollbarY.current);
  }, [context, setContextWithProduce, handleUndo, handleRedo, mergedSettings]);
  var i = core.getSheetIndex(context, context.currentSheetId);
  if (i == null) {
    return null;
  }
  var sheet = (_context$luckysheetfi = context.luckysheetfile) === null || _context$luckysheetfi === void 0 ? void 0 : _context$luckysheetfi[i];
  if (!sheet) {
    return null;
  }
  return /*#__PURE__*/React__default['default'].createElement(WorkbookContext.Provider, {
    value: providerValue
  }, /*#__PURE__*/React__default['default'].createElement(ModalProvider, null, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-container",
    ref: workbookContainer,
    onKeyDown: onKeyDown
  }, /*#__PURE__*/React__default['default'].createElement("section", {
    "aria-labelledby": "shortcuts-heading",
    id: "shortcut-list",
    className: "sr-only",
    tabIndex: 0,
    "aria-live": "polite"
  }, /*#__PURE__*/React__default['default'].createElement("h2", {
    id: "shortcuts-heading"
  }, info.shortcuts), /*#__PURE__*/React__default['default'].createElement("ul", null, /*#__PURE__*/React__default['default'].createElement("li", null, info.toggleSheetFocusShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.selectRangeShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.autoFillDownShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.autoFillRightShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.boldTextShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.copyShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.pasteShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.undoShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.redoShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.deleteCellContentShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.confirmCellEditShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.moveRightShortcut), /*#__PURE__*/React__default['default'].createElement("li", null, info.moveLeftShortcut))), /*#__PURE__*/React__default['default'].createElement(SVGDefines, {
    currency: mergedSettings.currency
  }), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-workarea"
  }, mergedSettings.showToolbar && (/*#__PURE__*/React__default['default'].createElement(Toolbar, {
    moreItemsOpen: moreToolbarItems !== null,
    setMoreItems: setMoreToolbarItems
  })), mergedSettings.showFormulaBar && /*#__PURE__*/React__default['default'].createElement(FxEditor, null)), /*#__PURE__*/React__default['default'].createElement(Sheet, {
    sheet: sheet
  }), mergedSettings.showSheetTabs && /*#__PURE__*/React__default['default'].createElement(SheetTab, null), /*#__PURE__*/React__default['default'].createElement(ContextMenu, null), /*#__PURE__*/React__default['default'].createElement(FilterMenu, null), /*#__PURE__*/React__default['default'].createElement(SheetTabContextMenu, null), context.showSheetList && /*#__PURE__*/React__default['default'].createElement(SheetList, null), moreToolbarItems && (/*#__PURE__*/React__default['default'].createElement(MoreItemsContaier, {
    onClose: onMoreToolbarItemsClose
  }, moreToolbarItems)), !___default['default'].isEmpty(context.contextMenu) && (/*#__PURE__*/React__default['default'].createElement("div", {
    onMouseDown: function onMouseDown() {
      setContextWithProduce(function (draftCtx) {
        draftCtx.contextMenu = {};
        draftCtx.filterContextMenu = undefined;
        draftCtx.showSheetList = undefined;
      });
    },
    onMouseMove: function onMouseMove(e) {
      return e.stopPropagation();
    },
    onMouseUp: function onMouseUp(e) {
      return e.stopPropagation();
    },
    onContextMenu: function onContextMenu(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    className: "fortune-popover-backdrop"
  })), /*#__PURE__*/React__default['default'].createElement("div", {
    className: "fortune-stat-area"
  }, /*#__PURE__*/React__default['default'].createElement("div", {
    className: "luckysheet-sheet-selection-calInfo"
  }, !!calInfo.count && (/*#__PURE__*/React__default['default'].createElement("div", {
    style: {
      width: "60px"
    }
  }, formula.count, ": ", calInfo.count)), !!calInfo.numberC && !!calInfo.sum && (/*#__PURE__*/React__default['default'].createElement("div", null, formula.sum, ": ", calInfo.sum)), !!calInfo.numberC && !!calInfo.average && (/*#__PURE__*/React__default['default'].createElement("div", null, formula.average, ": ", calInfo.average)), !!calInfo.numberC && !!calInfo.max && (/*#__PURE__*/React__default['default'].createElement("div", null, formula.max, ": ", calInfo.max)), !!calInfo.numberC && !!calInfo.min && (/*#__PURE__*/React__default['default'].createElement("div", null, formula.min, ": ", calInfo.min)))))));
});

exports.Workbook = Workbook;
