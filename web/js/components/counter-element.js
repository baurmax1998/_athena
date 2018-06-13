/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html, Master } from './master.js';
import { plusIcon, minusIcon } from './my-icons.js';
import { ButtonSharedStyles } from './button-shared-styles.js';
import { LitElement } from '../../lib/js/lit-element.js';

// This is a reusable element. It is not connected to the store. You can
// imagine that it could just as well be a third-party element that you
// got from someone else.
class CounterElement extends Master {
    _render() {
        return html `
      ${ButtonSharedStyles}
      <style>
        span { width: 20px; display: inline-block; text-align: center; font-weight: bold;}
      </style>
      <div>
        <p>
          Clicked: <span>${this.props.clicks}</span> times.
          Value is <span>${this.props.value}</span>.
          <button on-click="${() => this._onIncrement()}" title="Add 1">${plusIcon}</button>
          <button on-click="${() => this._onDecrement()}" title="Minus 1">${minusIcon}</button>
        </p>
      </div>
    `;
    }

    static get properties() {
        return {
            clicks: {
                type: String,
                attrName: "clicks"
            },
            value: {
                type: String,
                attrName: "value"
            }
        }
    };



    _onIncrement() {
        this.props.clicks = parseInt(this.props.clicks) + 1;
        this.props.value = parseInt(this.props.value) + 1;
        this.invalidate() // this.dispatchEvent(new CustomEvent('counter-incremented'));
    }

    _onDecrement() {
        this.props.clicks = parseInt(this.props.clicks) + 1;
        this.props.value = parseInt(this.props.value) - 1;
        this.invalidate()
            // this.dispatchEvent(new CustomEvent('counter-decremented'));
    }
}

window.customElements.define('counter-element', CounterElement);