import { html, Master } from './master.js';

class AthenaHeader extends Master {
    _render() {
        return html `
        <div class="w3-container w3-teal">
            <h2>athena</h2>
        </div>
        `;
    }
}

customElements.define("athena-header", AthenaHeader);