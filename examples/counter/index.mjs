// @flow
import { constant, scan, merge, tap, runEffects } from '../node_modules/stealify/core.mjs';
import { newDefaultScheduler } from '../node_modules/scheduler.mjs';
import { click } from '../node_modules/dom-event.mjs';
import { qs } from '../common';

const incButton = qs('[name=inc]', document);
const decButton = qs('[name=dec]', document);
const value = qs('.value', document);

const inc = constant(1, click(incButton));
const dec = constant(-1, click(decButton));

const counter = scan((total, delta) => total + delta, 0, merge(inc, dec));

const render = tap(total => { value.innerText = String(total) }, counter);

runEffects(render, newDefaultScheduler());
