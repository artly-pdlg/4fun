function buildblock(words, b) {
    var e = b;
    if (words[e] == '{') {
        var block = [];
        var blockp;
        e++;
        while (words[e] != '}') {
            [blockp, e] = buildblock(words, e);
            block.push(blockp);
        }
        e++;
        return [block, e];
    }
    if (words[e] == 'if') {
        var block = {};
        block.type = 'if';
        e++;
        if (words[e] != '(') throw new Error('if(');
        e++;
        var f = 1;
        while (f > 0) {
            if (words[e] == '(') f++;
            else if (words[e] == ')') f--;
            e++;
        }
        block.condition = buildtree(words.slice(b + 2, e - 1));
        [block.if, e] = buildblock(words, e);
        if (words[e] == 'else') {
            e++;
            [block.else, e] = buildblock(words, e);
        }
        return [block, e];
    }
    if (words[e] == 'while') {
        var block = {};
        block.type = 'while';
        e++;
        if (words[e] != '(') throw new Error('while(');
        e++;
        var f = 1;
        while (f > 0) {
            if (words[e] == '(') f++;
            else if (words[e] == ')') f--;
            e++;
        }
        block.condition = buildtree(words.slice(b + 2, e - 1));
        [block.todo, e] = buildblock(words, e);
        return [block, e];
    }
    var block = [];
    while (words[e] != ';') {
        block.push(words[e]);
        e++;
    }
    e++;
    return [buildtree(block), e];
}