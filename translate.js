function translate(s) {
    var words;
    var tree;
    var code = [];
    try {
        words = token(s);
        console.log(words);
        words.push('}');
        words.unshift('{');
        var e;
        [tree,e] = buildblock(words, 0);
        if(e!=words.length)throw '大括号未匹配';
        console.log(tree);
        translatetree(tree, 0, code);
    } catch (e) {
        return e;
    }
    code.push('end');
    return code;
}