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
                var l=words.slice(b, i);
                var r=words.slice(i + 1, e);
                if(l.length==0&&tree.op!='!'&&tree.op!='~')throw '\''+tree.op+'\'左边找不到元素';
                if(r.length==0)throw '\''+tree.op+'\'右边找不到元素';
                if(tree.op!='!'&&tree.op!='~')tree.l = buildtree(l);
                tree.r = buildtree(r);
                return tree;
            }
        }
        if(f!=0)throw '括号未匹配';
    }
    if (words[b] == '(') {
        if (words[e - 1] != ')') throw '括号未匹配';
        var ink=words.slice(b + 1, e - 1);
        if(ink.length==0)throw '括号内为空';
        return buildtree(ink);
    }
    if (words[e - 1] == ')') {
        tree.type = 'call';
        tree.name = words[b];
        if(words[b+1]!='(')throw '括号不匹配';
        tree.args = buildtree(words.slice(b + 2, e - 1));
        return tree;
    }
    return words.join('');
}