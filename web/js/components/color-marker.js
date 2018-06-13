import { html, Master } from './master.js';


class ColorMarker extends Master {
    changeColor() {
        const color = Math.random().toString(16).substr(2, 6);
        // Easily query the element by id:
        this.$("button").style.backgroundColor = `#${color}`;
    }

    _render() {
        return html `
        <style>
          div {
            background-color: yellow;
          }
        </style>
        <button id="button" on-click=${() => this.changeColor()}>
          Change background color
        </button>
      `;
    }
}

customElements.define('color-marker', ColorMarker);