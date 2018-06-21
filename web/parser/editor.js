(function($) {
    $.fn.attachToCaret = function(elem) {
        that = this;
        that.on("mousedown mouseup keydown keyup", function(e) {
            var posi = that.caret("position");
            var top = posi.top +
                posi.height +
                that.position().top +
                parseInt(that.css("font-size"));
            var left = posi.left;
            if (that.text().charAt(that.caret("pos") - 1) == "\n") {
                // elem.position().left 
                left = 0 + parseInt(that.css("border-left-width"));
                top = top + posi.height;
            }
            elem.css({
                "top": top,
                "left": left
            })
        });
        return this;
    }
}(jQuery));

(function($) {
    $.fn.editable = function() {
        this
            .css({
                "-moz-tab-size": "4",
                "tab-size": "4",
                "white-space": "pre",
                "outline": "none"
            })
            .attr("spellcheck", false)
            .attr("contentEditable", "true")
            .keydown(function(e) {
                if (e.keyCode === 13) {
                    document.execCommand('insertHTML', false, '\n');
                    return false;
                } else if (e.keyCode == 9 && e.shiftKey) {
                    document.execCommand('insertHTML', false, '\t');
                    return false;
                } else if (e.keyCode == 9) {
                    document.execCommand('insertHTML', false, '\t');
                    return false;
                }
            });
        return this;
    };
}(jQuery));

String.prototype.splice = function(start, delCount, newSubStr) {
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};

function insertTextAtCursor(text) {
    var sel, range, html;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
}

var $editable = $('#editor');
var $completion = $("#completion");

$editable
    .editable()
    .attachToCaret($completion);

$completion.hide();

$.ajax({
    url: "./json-test-data/demo_test.js",
    url: "./json-test-data/lamda-lang.txt",
    success: function(result) {
        result = result.replace(/    /g, "\t")
        $editable.text(result);
        $editable.caret('pos', 53).focus();



        var inputStream = InputStream(result);
        var tokenStream = TokenStream(inputStream);
        var ast = parse(tokenStream);

        // create the global environment
        var globalEnv = new Environment();

        // define the "print" primitive function
        globalEnv.def("print", function(txt) {
            console.log(txt);
        });

        // run the evaluator
        evaluate(ast, globalEnv); // will print 5

    }
});