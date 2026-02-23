// ionicons: Custom Elements Define Library, ES Module/ES5 Target
import { defineCustomElement } from './ionicons.core';
import {
  Icon
} from './ionicons.components';

export function defineCustomElements(window, opts) {
  defineCustomElement(window, [
    Icon
  ], opts);
}
