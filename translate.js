function translate(s) {
    var _a;
    var words;
    var tree;
    var code = [];
    try {
        words = token(s);
        console.log(words);
        words.push('}');
        words.unshift('{');
        var e;
        _a = buildblock(words, 0), tree = _a[0], e = _a[1];
        if (e != words.length)
            throw '大括号未匹配';
        console.log(tree);
        translatetree(tree, 0, code);
    }
    catch (e) {
        return e;
    }
    code.push('end');
    return code;
}
