import { map, now, runEffects, filter, fromPromise, debounce, skipRepeats, switchLatest, tap } from '../node_modules/stealify/core.mjs'
import { newDefaultScheduler } from '../node_modules/stealify/scheduler.mjs'
import { input } from '../node_modules/stealify/dom-event.mjs'
import { partition, mapEither, unpartition } from '../node_modules/stealify/product.mjs'
//import rest from 'rest/client/jsonp'

const url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='

const search = document.getElementById('search')
const resultList = document.getElementById('results')
const template = document.getElementById('template').innerHTML



// Fetch results with rest.js
// Returns a promise for the wikipedia json response
var getResults = function getResults(text) {
  return jsonp(url + text).entity();
};

// Get input value when it changes
// Multicast the stream as it's later being merged by an observer
// @most/core's API is curried, and works great with the pipeline operator |>
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Pipeline_operator
// for more info about the pipeline operator
var _ref, _ref2, _input, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _searchText;
var searchText = (_ref = (_ref2 = (_input = input(search), map(function (e) {
  return e.target.value.trim();
})(_input)), skipRepeats(_ref2)), debounce(500)(_ref)); // Get results from wikipedia API and render
// Only search if the user stopped typing for 500ms
// and is different than the last time we saw the text
// Ignore empty results, extract and return the actual
// list of results from the wikipedia payload

var results = (_ref3 = (_ref4 = (_ref5 = (_ref6 = (_ref7 = (_ref8 = (_searchText = searchText, filter$$1(function (text) {
  return text.length > 1;
})(_searchText)), map(getResults)(_ref8)), map(fromPromise)(_ref7)), switchLatest(_ref6)), partition(function (results) {
  return results.length > 1;
})(_ref5)), mapEither(function (_) {
  return [];
}, function (results) {
  return results[1];
})(_ref4)), unpartition(_ref3));

var render = function render(resultContent) {
  resultList.innerHTML = resultContent.reduce(function (html, item) {
    return html + template.replace(/\{name\}/g, item);
  }, '');
}; 
// Render the results
runEffects(tap(render, results), newDefaultScheduler())
