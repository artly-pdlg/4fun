function buildblock(words, b) {
    var _a, _b, _c, _d, _e;
    var e = b;
    if (words[e] == '{') {
        var block = [];
        var blockp;
        e++;
        while (words[e] != '}') {
            if (words[e] == undefined)
                throw '大括号未匹配';
            _a = buildblock(words, e), blockp = _a[0], e = _a[1];
            block.push(blockp);
        }
        e++;
        return [block, e];
    }
    if (words[e] == 'function') {
        var block = {};
        block.type = 'function';
        e++;
        block.name = words[e];
        e++;
        if (words[e] != '(')
            throw 'function后未找到\'(\'';
        e++;
        var f = 1;
        while (f > 0) {
            if (words[e] == undefined)
                throw '括号未匹配';
            if (words[e] == '(')
                f++;
            else if (words[e] == ')')
                f--;
            e++;
        }
        block.args = buildtree(words.slice(b + 3, e - 1));
        _b = buildblock(words, e), block.todo = _b[0], e = _b[1];
        return [block, e];
    }
    if (words[e] == 'if') {
        var block = {};
        block.type = 'if';
        e++;
        if (words[e] != '(')
            throw 'if后未找到\'(\'';
        e++;
        var f = 1;
        while (f > 0) {
            if (words[e] == undefined)
                throw '括号未匹配';
            if (words[e] == '(')
                f++;
            else if (words[e] == ')')
                f--;
            e++;
        }
        var co = words.slice(b + 2, e - 1);
        if (co.length == 0)
            throw 'if的条件为空';
        block.condition = buildtree(co);
        _c = buildblock(words, e), block.if = _c[0], e = _c[1];
        if (words[e] == 'else') {
            e++;
            _d = buildblock(words, e), block.else = _d[0], e = _d[1];
        }
        return [block, e];
    }
    if (words[e] == 'while') {
        var block = {};
        block.type = 'while';
        e++;
        if (words[e] != '(')
            throw 'while后未找到\'(\'';
        e++;
        var f = 1;
        while (f > 0) {
            if (words[e] == undefined)
                throw '括号未匹配';
            if (words[e] == '(')
                f++;
            else if (words[e] == ')')
                f--;
            e++;
        }
        var co = words.slice(b + 2, e - 1);
        if (co.length == 0)
            throw 'while的条件为空';
        block.condition = buildtree(co);
        _e = buildblock(words, e), block.todo = _e[0], e = _e[1];
        return [block, e];
    }
    var block = [];
    while (words[e] != ';') {
        if (words[e] == undefined)
            throw '未找到\';\'';
        block.push(words[e]);
        e++;
    }
    e++;
    return [buildtree(block), e];
}
