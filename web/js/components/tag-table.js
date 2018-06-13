import { html, Master } from './master.js';


class TagTable extends Master {

    constructor() {
        super();

        var that = this;
        window.addEventListener("showTable", function(e) {
            that.data = e.detail.elements;
            that.invalidate();
        });

        that.filterText = "";

        window.addEventListener("filterFor", function(e) {
            that.filterText = e.detail.filterText;
            that.invalidate();
        });
    }

    _render() {
        if (this.data == undefined) {
            return this.loadingScreen();
        } else {
            return this.table(this.data);
        }
        // return html ``;
    }

    table(data) {
            var doit = this.enterElement;
            var filterText = this.filterText;
            return html `
            <table class="w3-table w3-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        $(this.data.Tags).map((y,x) => {
                            var display = JSON.stringify(x).indexOf(filterText) == -1 ?"none":"show";
                            return html `<tr 
                            class="w3-hover-gray" 
                            style="cursor: pointer; display:${display}" 
                            onclick=${doit}>
                            <td>${x.ID}</td>
                            <td>${x.Name}</td>
                            <td>TAG</td>
                        </tr>`;
                        })
                    }
                    ${
                        $(this.data.Files).map((y,x) => 
                        html `<tr class="w3-hover-green">
                            <td>${x.ID}</td>
                            <td>${x.Name}</td>
                            <td>FILE</td>
                        </tr>`)
                    }
                </tbody>
            </table>
        `;
    }

    enterElement(){
        var element = this;
        window.dispatchEvent(new CustomEvent("enterElement", {
            detail: {
                elements: element
            }
        }));

    }

    loadingScreen() {
        return html `
        <style>
        
        /* Default styles for each spinner */
        .spinner {
          width: 100px;
          height: 100px;
          position: relative;
          margin: 50px;
          display: inline-block;
        }
        
        .spinner:after, .spinner:before {
          content: "";
          display: block;
          width: 100px;
          height: 100px;
          border-radius: 50%;
            
        }
        
        /* Spinner 1 */
        .spinner-1:before {
          
          position: absolute;
          top: -2px;
          left: -2px;
          border: 2px solid transparent;
          border-top-color: #c0392b;
          border-bottom-color: #3498db;
          -webkit-animation: spin-style-1 1s linear infinite;
                  animation: spin-style-1 1s linear infinite;
            
        }
        
        
        /* Spinner 1 & 2 Animation ( Style 1 ) with -webkit- prefix and without ( Spinner 1 & Spinner 2 have the same animation ) */
        @-webkit-keyframes spin-style-1 {
          0% {
            -webkit-transform: rotate(0deg);
                    transform: rotate(0deg);
          }
        
          50% {
            -webkit-transform: rotate(180deg);
                    transform: rotate(180deg);
          }
        
          100% {
            -webkit-transform: rotate(360deg);
                    transform: rotate(360deg);
          }
        }
        
        @keyframes spin-style-1 {
          0% {
            -webkit-transform: rotate(0deg);
                    transform: rotate(0deg);
          }
        
          50% {
            -webkit-transform: rotate(180deg);
                    transform: rotate(180deg);
          }
        
          100% {
            -webkit-transform: rotate(360deg);
                    transform: rotate(360deg);
          }
        }
        
        </style>
        
        <div class="spinner spinner-1"></div>`;
    }
}

customElements.define('tag-table', TagTable);