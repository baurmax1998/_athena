import { html, Master } from './master.js';

class HelloWorld extends Master {
    static get properties() {
        return {
            uppercase: {
                type: Boolean,
                attrName: "uppercase"
            }
        }
    }

    render() {
        return html `
      <style>
        .uppercase {
          text-transform: uppercase;
        }
      </style>
      <div id="box" class$="${this.uppercase ? 'uppercase' : ''}">
        <slot>Hello World</slot>
      </div>
    `;
    }
}
customElements.define('hello-world', HelloWorld.withProperties());