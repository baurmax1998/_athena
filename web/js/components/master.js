import { LitElement, html } from '../../lib/js/lit-element.js';
export { html }
from '../../lib/js/lit-extended.js';
export { TemplateResult }
from '../../lib/js/lit-html.js';

export class Master extends LitElement {
    render() {
        var temp = this._render(this.props);
        return html `
        <link rel="stylesheet" type="text/css" href="./lib/css/w3.css">
        ${temp}
        `;

    }

    get props() {
        return this.__values__;
    }
}