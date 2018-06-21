function InputStream(input) {
    var pos = 0,
        line = 1,
        col = 0;
    return {
        setState: setState,
        getState: getState,
        next: next,
        peek: peek,
        eof: eof,
        croak: croak,
    };

    function setState(state) {
        pos = state.pos;
        line = state.line;
        col = state.line;
    }

    function getState() {
        return {
            pos: pos,
            line: line,
            col: col
        };
    }

    function next() {
        var ch = input.charAt(pos++);
        if (ch == "\n") line++, col = 0;
        else col++;
        return ch;
    }

    function peek() {
        return input.charAt(pos);
    }

    function eof() {
        return peek() == "";
    }

    function croak(msg) {
        throw new Error(msg + " (" + line + ":" + col + ")");
    }
}