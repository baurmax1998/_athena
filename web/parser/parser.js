var lambda_lang = (function() {
    var lang = {
        types: [{
            name: "comment",
            start_with: "#",
            read: function(input) {
                read_while(input, function(ch) { return ch != "\n" });
                input.next();
            },
        }, {
            name: "num",
            start_with: /[0-9]/i,
            read: function(input) {
                var start_with = this.start_with;
                var has_dot = false;
                var number = read_while(input, function(ch) {
                    if (ch == ".") {
                        if (has_dot) return false;
                        has_dot = true;
                        return true;
                    }
                    return ch.match(start_with);
                });
                return { type: "num", value: parseFloat(number) };
            }
        }, {
            name: "str",
            start_with: "\"",
            read: function(input) {
                return { type: "str", value: read_escaped(input, '"') };
            }
        }, {
            name: "bool"
        }, {
            name: "var",
            start_with: /[a-z]/i,
            read: function(input) {
                var start_with = this.start_with;
                var id = read_while(input, function(ch) {
                    return ch.match(start_with) || "?!-<>=0123456789".indexOf(ch) >= 0
                });

                return {
                    type: is_keyword(id) ? "kw" : "var",
                    value: id
                };
            },

        }],
        keywords: [{
            matcher: "if",
        }, {
            matcher: "lambda"
        }, {
            matcher: "than"
        }, {
            matcher: "else"
        }, {
            matcher: "true"
        }, {
            matcher: "false"
        }],
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
        whitespaces: " \t\n"
    };

    function is_keyword(x) {
        for (let i = 0; i < lang.keywords.length; i++) {
            const element = lang.keywords[i];
            if (element.matcher === x) {
                return true;
            }
        }
        return false;
    }


    function read_escaped(input, end) {
        var escaped = false,
            str = "";
        input.next();
        while (!input.eof()) {
            var ch = input.next();
            if (escaped) {
                str += ch;
                escaped = false;
            } else if (ch == "\\") {
                escaped = true;
            } else if (ch == end) {
                break;
            } else {
                str += ch;
            }
        }
        return str;
    }

    return lang;
})();

function parse(input) {
    var PRECEDENCE = {
        "=": 1,
        "||": 2,
        "&&": 3,
        "<": 7,
        ">": 7,
        "<=": 7,
        ">=": 7,
        "==": 7,
        "!=": 7,
        "+": 10,
        "-": 10,
        "*": 20,
        "/": 20,
        "%": 20,
    };
    var FALSE = { type: "bool", value: false };

    var prog = [];
    while (!input.eof()) {
        prog.push(parse_expression());
        if (!input.eof()) skip_punc(";");
    }
    return { type: "prog", prog: prog };

    function is_punc(ch) {
        var tok = input.peek();
        return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
    }

    function is_kw(kw) {
        var tok = input.peek();
        return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
    }

    function is_op(op) {
        var tok = input.peek();
        return tok && tok.type == "op" && (!op || tok.value == op) && tok;
    }

    function skip_punc(ch) {
        if (is_punc(ch)) input.next();
        else input.croak("Expecting punctuation: \"" + ch + "\"");
    }

    function skip_kw(kw) {
        if (is_kw(kw)) input.next();
        else input.croak("Expecting keyword: \"" + kw + "\"");
    }

    function skip_op(op) {
        if (is_op(op)) input.next();
        else input.croak("Expecting operator: \"" + op + "\"");
    }

    function unexpected() {
        input.croak("Unexpected token: " + JSON.stringify(input.peek()));
    }

    function maybe_binary(left, my_prec) {
        var tok = is_op();
        if (tok) {
            var his_prec = PRECEDENCE[tok.value];
            if (his_prec > my_prec) {
                input.next();
                return maybe_binary({
                    type: tok.value == "=" ? "assign" : "binary",
                    operator: tok.value,
                    left: left,
                    right: maybe_binary(parse_atom(), his_prec)
                }, my_prec);
            }
        }
        return left;
    }

    function delimited(start, stop, separator, parser) {
        var a = [],
            first = true;
        skip_punc(start);
        while (!input.eof()) {
            if (is_punc(stop)) break;
            if (first) first = false;
            else skip_punc(separator);
            if (is_punc(stop)) break;
            a.push(parser());
        }
        skip_punc(stop);
        return a;
    }

    function parse_call(func) {
        return {
            type: "call",
            func: func,
            args: delimited("(", ")", ",", parse_expression),
        };
    }

    function parse_varname() {
        var name = input.next();
        if (name.type != "var") input.croak("Expecting variable name");
        return name.value;
    }

    function parse_if() {
        skip_kw("if");
        var cond = parse_expression();
        if (!is_punc("{")) skip_kw("then");
        var then = parse_expression();
        var ret = {
            type: "if",
            cond: cond,
            then: then,
        };
        if (is_kw("else")) {
            input.next();
            ret.else = parse_expression();
        }
        return ret;
    }

    function parse_lambda() {
        return {
            type: "lambda",
            vars: delimited("(", ")", ",", parse_varname),
            body: parse_expression()
        };
    }

    function parse_bool() {
        return {
            type: "bool",
            value: input.next().value == "true"
        };
    }

    function maybe_call(expr) {
        expr = expr();
        return is_punc("(") ? parse_call(expr) : expr;
    }

    function parse_atom() {
        return maybe_call(function() {
            if (is_punc("(")) {
                input.next();
                var exp = parse_expression();
                skip_punc(")");
                return exp;
            }
            if (is_punc("{")) return parse_prog();
            if (is_kw("if")) return parse_if();
            if (is_kw("true") || is_kw("false")) return parse_bool();
            if (is_kw("lambda")) {
                input.next();
                return parse_lambda();
            }
            var tok = input.next();
            if (tok.type == "var" || tok.type == "num" || tok.type == "str")
                return tok;
            unexpected();
        });
    }

    function parse_prog() {
        var prog = delimited("{", "}", ";", parse_expression);
        if (prog.length == 0) return FALSE;
        if (prog.length == 1) return prog[0];
        return { type: "prog", prog: prog };
    }

    function parse_expression() {
        return maybe_call(function() {
            return maybe_binary(parse_atom(), 0);
        });
    }
}

function Environment(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
}
Environment.prototype = {
    extend: function() {
        return new Environment(this);
    },
    lookup: function(name) {
        var scope = this;
        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name))
                return scope;
            scope = scope.parent;
        }
    },
    get: function(name) {
        if (name in this.vars)
            return this.vars[name];
        throw new Error("Undefined variable " + name);
    },
    set: function(name, value) {
        var scope = this.lookup(name);
        if (!scope && this.parent)
            throw new Error("Undefined variable " + name);
        return (scope || this).vars[name] = value;
    },
    def: function(name, value) {
        return this.vars[name] = value;
    }
};

function evaluate(exp, env) {
    switch (exp.type) {
        case "num":
        case "str":
        case "bool":
            return exp.value;

        case "var":
            return env.get(exp.value);

        case "assign":
            if (exp.left.type != "var")
                throw new Error("Cannot assign to " + JSON.stringify(exp.left));
            return env.set(exp.left.value, evaluate(exp.right, env));

        case "binary":
            return apply_op(exp.operator,
                evaluate(exp.left, env),
                evaluate(exp.right, env));

        case "lambda":
            return make_lambda(env, exp);

        case "if":
            var cond = evaluate(exp.cond, env);
            if (cond !== false) return evaluate(exp.then, env);
            return exp.else ? evaluate(exp.else, env) : false;

        case "prog":
            var val = false;
            exp.prog.forEach(function(exp) { val = evaluate(exp, env) });
            return val;

        case "call":
            var func = evaluate(exp.func, env);
            return func.apply(null, exp.args.map(function(arg) {
                return evaluate(arg, env);
            }));

        default:
            throw new Error("I don't know how to evaluate " + exp.type);
    }
}

function apply_op(op, a, b) {
    function num(x) {
        if (typeof x != "number")
            throw new Error("Expected number but got " + x);
        return x;
    }

    function div(x) {
        if (num(x) == 0)
            throw new Error("Divide by zero");
        return x;
    }
    switch (op) {
        case "+":
            return num(a) + num(b);
        case "-":
            return num(a) - num(b);
        case "*":
            return num(a) * num(b);
        case "/":
            return num(a) / div(b);
        case "%":
            return num(a) % div(b);
        case "&&":
            return a !== false && b;
        case "||":
            return a !== false ? a : b;
        case "<":
            return num(a) < num(b);
        case ">":
            return num(a) > num(b);
        case "<=":
            return num(a) <= num(b);
        case ">=":
            return num(a) >= num(b);
        case "==":
            return a === b;
        case "!=":
            return a !== b;
    }
    throw new Error("Can't apply operator " + op);
}

function make_lambda(env, exp) {
    function lambda() {
        var names = exp.vars;
        var scope = env.extend();
        for (var i = 0; i < names.length; ++i)
            scope.def(names[i], i < arguments.length ? arguments[i] : false);
        return evaluate(exp.body, scope);
    }
    return lambda;
}