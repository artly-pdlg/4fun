function argstolist(tree) {
    if (tree == undefined)
        return [];
    if (typeof (tree) == 'string')
        return [tree];
    if (tree.op == ',') {
        return argstolist(tree.l).concat([tree.r]);
    }
    return [tree];
}
