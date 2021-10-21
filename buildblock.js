function buildblock(words, b) {
    var e = b;
    if (words[e] == '{') {
        var block = [];
        var blockp;
        e++;
        while (words[e] != '}') {
            if(words[e]==undefined)throw '大括号未匹配';
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
        if (words[e] != '(') throw 'if后未找到\'(\'';
        e++;
        var f = 1;
        while (f > 0) {
            if(words[e]==undefined)throw '括号未匹配';
            if (words[e] == '(') f++;
            else if (words[e] == ')') f--;
            e++;
        }
        var co=words.slice(b + 2, e - 1);
        if(co.length==0)throw 'if的条件为空';
        block.condition = buildtree(co);
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
        if (words[e] != '(') throw 'while后未找到\'(\'';
        e++;
        var f = 1;
        while (f > 0) {
            if(words[e]==undefined)throw '括号未匹配';
            if (words[e] == '(') f++;
            else if (words[e] == ')') f--;
            e++;
        }
        var co=words.slice(b + 2, e - 1);
        if(co.length==0)throw 'while的条件为空';
        block.condition = buildtree(co);
        [block.todo, e] = buildblock(words, e);
        return [block, e];
    }
    var block = [];
    while (words[e] != ';') {
        if(words[e]==undefined)throw '未找到\';\'';
        block.push(words[e]);
        e++;
    }
    e++;
    return [buildtree(block), e];
}