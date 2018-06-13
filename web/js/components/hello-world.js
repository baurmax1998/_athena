import { html, Master } from './master.js';

class HelloWorld extends Master {
    render() {
        return html `
      <div style="font-weight: bold">Hello World</div>
    `;
    }
}
customElements.define('hello-world', HelloWorld)