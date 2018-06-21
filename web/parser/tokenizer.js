function read_while(input, predicate) {
    var str = "";
    while (!input.eof() && predicate(input.peek()))
        str += input.next();
    return str;
}

function TokenStream(input) {
    var current = null;
    var lang = lambda_lang;

    // var keyword_tree = {};

    // for (const key in lang) {
    //     if (lang.hasOwnProperty(key) && key != "types" && key != "whitespaces" && key != "keywords") {
    //         const category = lang[key];
    //         for (let i = 0; i < category.length; i++) {
    //             const element = category[i];
    //             var text = element.matcher;
    //             var state = keyword_tree;
    //             for (var j = 0; j < text.length; j++) {
    //                 var char = text.charAt(j);
    //                 if (state[char] === undefined) {
    //                     var temp = {};
    //                     state[char] = temp;
    //                     state = temp;
    //                 } else {
    //                     state = state[char];
    //                 }
    //             }
    //             state.data = element;
    //             state.data.category = key;
    //         }
    //     }
    // }

    return {
        next: next,
        peek: peek,
        eof: eof,
        croak: input.croak
    };

    function is_whitespace(ch) {
        return lang.whitespaces.indexOf(ch) >= 0;
    }

    function read_next() {
        read_while(input, is_whitespace);
        if (input.eof()) return null;
        var ch = input.peek();

        for (const typeName in lang.types) {
            if (lang.types.hasOwnProperty(typeName)) {
                const type = lang.types[typeName];
                var start_with = type.start_with;
                if (start_with != undefined && ch.match(start_with)) {
                    var value = type.read(input);
                    if (value != null) {
                        return value;
                    } else {
                        read_next();
                    }
                }
            }
        }

        // var input_state = input.getState();
        // var reading = true;
        // var tree_state = keyword_tree;
        // while (reading) {
        //     var char = input.next();
        //     tree_state = tree_state[char];
        //     if (tree_state === undefined) {
        //         reading = false;
        //         input.setState(input_state);
        //     }
        // }

        // for (let i = 0; i < lang.punces.length; i++) {
        //     const element = lang.punces[i];
        //     if (ch.match(element.matcher)) {
        //         return {
        //             type: "punc",
        //             value: input.next()
        //         };
        //     }
        // }



        var punc = check(input, lang.punces, "punc");
        if (punc) return punc;
        var op = check(input, lang.operators, "op")
        if (op) return op;

        input.croak("Can't handle character: " + ch);
    }

    function check(input, checks, type) {
        var input_state = input.getState();
        for (let i = 0; i < checks.length; i++) {
            const element = checks[i];
            var matcher = element.matcher;
            var text = "";
            for (let j = 0; j < matcher.length; j++) {
                text += input.next();
            }
            if (text === matcher) {
                return {
                    type: type,
                    value: matcher
                };
            } else {
                input.setState(input_state);
            }
        }
        return null;
    }

    function peek() {
        return current || (current = read_next());
    }

    function next() {
        var tok = current;
        current = null;
        return tok || read_next();
    }

    function eof() {
        return peek() == null;
    }
}