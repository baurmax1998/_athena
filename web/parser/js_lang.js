var js_lang = {
    keywords: {
        if: {

        },
        else: {

        },
        true: {

        },
        false: {

        }
    },
    types: {
        num: {
            matcher: /[0-9]/i

        },
        str: {
            matcher: /[a-z]/i

        },
        bool: {

        },
        var: {

        }
    },
    operators: [{
        matcher: "=",
        order: 1
    }, {
        matcher: "||",
        order: 2
    }, {
        matcher: "&&",
        order: 3
    }, {
        matcher: "<",
        order: 7
    }, {
        matcher: ">",
        order: 7
    }, {
        matcher: "<=",
        order: 7
    }, {
        matcher: ">=",
        order: 7
    }, {
        matcher: "==",
        order: 7
    }, {
        matcher: "!=",
        order: 7
    }, {
        matcher: "+",
        order: 10
    }, {
        matcher: "-",
        order: 10
    }, {
        matcher: "*",
        order: 20
    }, {
        matcher: "/",
        order: 20
    }, {
        matcher: "%",
        order: 20
    }, {
        matcher: "!",
        order: 30
    }],
    punces: [{
        matcher: ","
    }, {
        matcher: ";"
    }, {
        matcher: "("
    }, {
        matcher: ")"
    }, {
        matcher: "{"
    }, {
        matcher: "}"
    }, {
        matcher: "["
    }, {
        matcher: "]"
    }],
    whitespaces: [{
        matcher: " "
    }, {
        matcher: "\t"
    }, {
        matcher: "\n"
    }]
}