function translate(s) {
    var words = token(s);
    console.log(words);
    words.push('}');
    words.unshift('{');
    var tree;
    tree = buildblock(words, 0)[0];
    console.log(tree);
    code = [];
    translatetree(tree, 0, code);
    code.push('end');
    if (islinenumber) for (i in code) code[i] = i + ': ' + code[i];
    return code.join('\n');
}