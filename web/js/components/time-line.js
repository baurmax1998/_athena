import { html, Master } from './master.js';


class TimeLine extends Master {

    constructor() {
        super();
        this.elements = [];

        var that = this;
        window.addEventListener("addTimeLine", function(e) {
            that.addElement(e.detail);
        });

        window.addEventListener("PastTo", function(e) {
            that.pastTo(e.detail.element);
        });
    }

    pastTo(elem) {
        this.elements.length = this.elements.findIndex(function(e) {
            return elem == e.name;
        }) + 1;
        window.dispatchEvent(new CustomEvent("TimeLineChanged", {
            detail: {
                elements: this.elements
            }
        }));
        this.invalidate();
    }

    addElement(elem) {
        this.elements.push(elem);
        window.dispatchEvent(new CustomEvent("TimeLineChanged", {
            detail: {
                elements: this.elements
            }
        }));
        this.invalidate();
    }

    enterElement() {
        window.dispatchEvent(new CustomEvent("PastTo", {
            detail: {
                element: $(this).text()
            }
        }));
    }

    _render() {
            var doit = this.enterElement;
            return html `
        <style>
        .breadcrumb {
            margin: 2px;
            overflow: hidden;
            width: 100%;
            position: relative;
            z-index: 0;
        }
        
        .breadcrumb a,
        .breadcrumb .nolink {
            background-color: rgba(200, 200, 200, 0.6);
            float: left;
            padding: 9px 14px;
            margin: 0 8px 0 14px;
            text-decoration: none;
            color: #444;
            text-shadow: 0 1px 0 rgba(200, 200, 200, 0.5);
            position: relative;
        }
        
        .breadcrumb a:hover,
        .breadcrumb a:focus,
        .breadcrumb .nolink:hover,
        .breadcrumb .nolink:focus {
            background: #fff;
        }
        
        .breadcrumb a:hover:before,
        .breadcrumb a:focus:before,
        .breadcrumb .nolink:hover:before,
        .breadcrumb .nolink:focus:before {
            border-color: #fff transparent;
        }
        
        .breadcrumb a:hover:after,
        .breadcrumb a:focus:after,
        .breadcrumb .nolink:hover:after,
        .breadcrumb .nolink:focus:after {
            border-left-color: #fff;
        }
        
        .breadcrumb a:before,
        .breadcrumb .nolink:before {
            content: "";
            position: absolute;
            top: 50%;
            margin-top: -24px;
            border-width: 24px 0 24px 16px;
            border-style: solid;
            border-color: rgba(200, 200, 200, 0.6) transparent;
            left: -16px;
        }
        
        .breadcrumb a:first-child:hover:before,
        .breadcrumb a:first-child:focus:before,
        .breadcrumb .nolink:first-child:hover:before,
        .breadcrumb .nolink:first-child:focus:before {
            border-color: #fff;
        }
        
        .breadcrumb a:first-child:before,
        .breadcrumb .nolink:first-child:before {
            border-color: rgba(200, 200, 200, 0.6);
        }
        
        .breadcrumb a:after,
        .breadcrumb .nolink:after {
            content: "";
            position: absolute;
            top: 50%;
            margin-top: -24px;
            border-top: 24px solid transparent;
            border-bottom: 24px solid transparent;
            border-left: 16px solid rgba(200, 200, 200, 0.6);
            right: -16px;
        }
        
        .breadcrumb .current,
        .breadcrumb .current:hover,
        .breadcrumb .current:focus {
            font-weight: bold;
            background: none;
        }
        
        .breadcrumb .current:after,
        .breadcrumb .current:before {
            content: normal;
        }
        
        .ym-wbox-2 {
            overflow: hidden;
        }
        </style>
        <div class="ym-wbox-2">
            <div class="breadcrumb">
                ${$(this.elements).map((y,x) => 
                    html`<a style="cursor: pointer;" onclick=${doit}>${x.name}</a>`)}
            </div>
        </div>
      `;
    }
}

// <a href="#">Startseite</a>
// <span class="nolink">eine nicht verlinkte Seite</span>
//<a href="#">Super tolle Seite</a>
//<span class="nolink">aktuelle Seite</span>

customElements.define('time-line', TimeLine);