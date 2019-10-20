import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
import './polyfills/startsWith';
import './polyfills/endsWith';
import './polyfills/findIndex';
import './polyfills/find';
import './polyfills/includes';
import Reveal from './reveal'

window.Reveal = Reveal;
