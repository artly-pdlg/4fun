function buildtree(words) {
    if (words.length == 0) return null;
    var b = 0;
    var e = words.length;
    var tree = {};
    var oplist = [
        [','],
        ['='],
        ['||'],
        ['&&'],
        ['!'],
        ['==', '!=', '===', '!==', '<', '>', '>=', '<='],
        ['|'],
        ['xor'],
        ['&'],
        ['<<', '>>'],
        ['+', '-'],
        ['*', '/', '//', '%'],
        ['~'],
        ['^']
    ];
    for (l of oplist) {
        var f = 0;
        for (var i = e - 1; i >= b; i--) {
            if (words[i] == ')') f++;
            else if (words[i] == '(') f--;
            if (f > 0) continue;
            if (l.includes(words[i])) {
                tree.type = 'op';
                tree.op = words[i];
                tree.l = buildtree(words.slice(b, i));
                tree.r = buildtree(words.slice(i + 1, e));
                return tree;
            }
        }
    }
    if (words[b] == '(') {
        if (words[e - 1] != ')') throw new Error('()');
        return buildtree(words.slice(b + 1, e - 1));
    }
    if (words[e - 1] == ')') {
        tree.type = 'call';
        tree.name = words[b];
        tree.args = buildtree(words.slice(b + 2, e - 1));
        return tree;
    }
    return words.join('');
}