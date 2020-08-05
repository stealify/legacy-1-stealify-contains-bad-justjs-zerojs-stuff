import { map, merge, scan } from './core.mjs';

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @license MIT License (c) copyright 2010-2016 original author or authors */
// id :: a -> a


var id = function id(x) {
  return x;
}; // compose :: (b -> c) -> (a -> b) -> (a -> c)

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var Right = function Right(value) {
  return {
    right: true,
    value: value
  };
};
var Left = function Left(value) {
  return {
    right: false,
    value: value
  };
};
var classify = function classify(p, a) {
  return p(a) ? Right(a) : Left(a);
};
var bimapEither = function bimapEither(f, g, e) {
  return e.right ? Right(g(e.value)) : Left(f(e.value));
};
var toPair = function toPair(_ref, eab) {
  var _ref2 = _slicedToArray(_ref, 2),
      a = _ref2[0],
      b = _ref2[1];

  return eab.right ? [a, eab.value] : [eab.value, b];
};

var inject = function inject(sa, sb) {
  return merge(map(Left, sa), map(Right, sb));
};
var partition = function partition(p, sa) {
  return map(function (a) {
    return classify(p, a);
  }, sa);
};
var unpartition = function unpartition(saa) {
  return map(function (aa) {
    return aa.value;
  }, saa);
};
var mapEither = function mapEither(f, g, s) {
  return map(function (eab) {
    return bimapEither(f, g, eab);
  }, s);
};
var mapLeft = function mapLeft(f, s) {
  return mapEither(f, id, s);
};
var mapRight = function mapRight(g, s) {
  return mapEither(id, g, s);
};

var dup = function dup(a) {
  return [a, a];
};
var projectPair = function projectPair(f, g, a) {
  return [f(a), g(a)];
};
var bimapPair = function bimapPair(f, g, _ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      a = _ref2[0],
      b = _ref2[1];

  return [f(a), g(b)];
};
var foldPair = function foldPair(f, _ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      a = _ref4[0],
      b = _ref4[1];

  return f(a, b);
};

var project = function project(f, g, s) {
  return map(function (a) {
    return projectPair(f, g, a);
  }, s);
};
var split = function split(s) {
  return map(dup, s);
};
var unsplit = function unsplit(f, s) {
  return map(function (p) {
    return foldPair(f, p);
  }, s);
};
var mapBoth = function mapBoth(f, g, s) {
  return map(function (p) {
    return bimapPair(f, g, p);
  }, s);
};
var mapFirst = function mapFirst(f, s) {
  return mapBoth(f, id, s);
};
var mapSecond = function mapSecond(g, s) {
  return mapBoth(id, g, s);
};
var update = function update(ab, s) {
  return scan(toPair, ab, s);
};

export { inject, partition, unpartition, mapEither, mapLeft, mapRight, project, split, unsplit, mapBoth, mapFirst, mapSecond, update, Right, Left, classify, bimapEither, toPair, dup, projectPair, bimapPair, foldPair };