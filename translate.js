function translate(s) {
    var words;
    var tree;
    var code = [];
    try {
        words = token(s);
        console.log(words);
        words.push('}');
        words.unshift('{');
        tree = buildblock(words, 0)[0];
        console.log(tree);
        translatetree(tree, 0, code);
    } catch (e) {
        return e;
    }
    code.push('end');
    if (islinenumber) for (i in code) code[i] = i + ': ' + code[i];
    return code.join('\n');
}