import { html, Master } from './master.js';

class SearchBar extends Master {

    _render() {
        var doit = this.filter;
        return html `
        <style>
        *:focus {
            outline: none;
        }
        </style>
        <input 
            class="search w3-input w3-bar-item" 
            placeholder="Search" 
            onkeyup=${doit}
            type="text">
        `;
    }

    filter() {
        var searchText = $(this).val();

        window.dispatchEvent(new CustomEvent("searchFor", {
            detail: {
                searchText: searchText
            }
        }));
    }
}
customElements.define('search-bar', SearchBar);