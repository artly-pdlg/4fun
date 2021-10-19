function translatetree(tree, p,code) {
    var l, r;
    if(typeof(tree)=='string'){
        if(tree[0]=='.'||tree[0]>='0'&&tree[0]<='9')return [p,tree];
        return [p,'v_'+tree];
    }
    if (tree instanceof Array) {
        for (i of tree)
            translatetree(i, p,code);
        return [p,null];
    }
    if(tree.type=='while'){
        var cod;
        var pwhile=code.length;
        [dp,cod]=translatetree(tree.condition,p,code);
        var pjump=code.length;
        code.push('jump  equal '+cod+' false');
        [dp,cod]=translatetree(tree.todo,p,code);
        code.push('set @counter '+pwhile);
        code[pjump]=code[pjump].slice(0,5)+code.length+code[pjump].slice(5);
        return[p,null];
    }
    if(tree.type=='if'){
        var cod;
        [dp,cod]=translatetree(tree.condition,p,code);
        var pif=code.length;
        code.push('jump  equal '+cod+' false');
        translatetree(tree.if,p,code);
        if(tree.else==undefined){
        code[pif]=code[pif].slice(0,5)+code.length+code[pif].slice(5);
        }
        else{
            var pelse=code.length;
            code.push('set @counter ');
            code[pif]=code[pif].slice(0,5)+code.length+code[pif].slice(5);
            [dp,_]=translatetree(tree.else,p,code);
            code[pelse]=code[pelse]+code.length;
        }
        return[p,null];
    }
    if (tree.type == 'op') {
        var dp=p;
        opstr = {
            '+': 'add',
            '-': 'sub',
            '*': 'mul',
            '/': 'div',
            '//': 'idiv',
            '%': 'mod',
            '^': 'pow',
            '==': 'equal',
            '!=': 'notEqual',
            '&&': 'land',
            '<': 'lessThan',
            '<=': 'lessThanEq',
            '>': 'greaterThan',
            '>=': 'greaterThan',
            '===': 'strictEqual',
            '<<': 'shl',
            '>>': 'shr',
            '|': 'or',
            '&': 'and',
            'xor': 'xor',
            '~': 'not'
        };
        if (tree.op == '=') {
            l = 'v_'+tree.l;
            [dp,r] = translatetree(tree.r, p,code);
            code.push('set ' + l + ' ' + r);
            return [ p,l];
        }
        if(tree.op=='!=='){
            return [p,null];
        }
        if(tree.op=='!'){
            return [p,null];
        }
        if(tree.op=='||'){
            return [p,null];
        }
        [dp,l] = translatetree(tree.l, dp,code);
        [dp,r] = translatetree(tree.r, dp,code);
        code.push('op ' + opstr[tree.op] + ' m_' + p + ' ' + l + ' ' + r);
        p++;
        return [ p,'m_'+(p-1)];

    }
    return code;
}