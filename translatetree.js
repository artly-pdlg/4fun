var arrayp={};
function translatetree(tree, p, code) {
    if(tree==null)return [p,null];
    var dp = p;
    if (typeof (tree) == 'string') {
        return [p,tree];
    }
    if (tree instanceof Array) {
        for (i of tree)
            translatetree(i, p, code);
        return [p, null];
    }
    if (tree.type == 'call') {
        var defaultf = {
            read: (args, p, code) => {
                code.push('read ' + args.join(' '));
            },
            write: (args, p, code) => {
                code.push('write ' + args.join(' '));
            },
            print: (args, p, code) => {
                code.push('print ' + args.join(' '));
            },
            printflush: (args, p, code) => {
                code.push('printflush ' + args.join(' '));
            },
            drawflush: (args, p, code) => {
                code.push('drawflush ' + args.join(' '));
            },
            draw: (args, p, code) => {
                code.push('draw ' + args.join(' '));
            },
            control: (args, p, code) => {
                code.push('control ' + args.join(' '));
            },
            sensor: (args, p, code) => {
                code.push('sensor ' + args.join(' '));
            },
            getlink: (args, p, code) => {
                code.push('getlink ' + args.join(' '));
            },
            radar: (args, p, code) => {
                code.push('radar ' + args.join(' '));
            },
            newArray:(args,p,code)=>{
                var name=args[0];
                var size=parseInt(args[1]);
                code.push('set @counter '+(size*4+1+code.length));
                arrayp[name]=[code.length,code.length+size*2];
                for(var i=0;i<size;i++){
                    code.push('set _ARRAYGET '+'_a'+name+i);
                    code.push('set @counter _ARRAYBACK');
                }
                for(var i=0;i<size;i++){
                    code.push('set _a'+name+i+' _ARRAYSET');
                    code.push('set @counter _ARRAYBACK');
                }
                
            },
            getArray:(args,p,code)=>{
                var setp=code.length;
                code.push('set _ARRAYBACK ');
                [dp,index]=translatetree(args[1],p,code);
                code.push('op mul _m'+p+' 2 '+index);
                code.push('op add _m'+p+' _m'+p+' '+arrayp[args[0]][0]);
                code.push('set @counter _m'+p);
                code[setp]+=code.length;
                code.push('set '+args[2]+' _ARRAYGET');
            },
            setArray:(args,p,code)=>{
                var setp=code.length;
                code.push('set _ARRAYBACK ');
                [dp,value]=translatetree(args[2],p,code);
                code.push('set _ARRAYSET '+value);
                [dp,index]=translatetree(args[1],p,code);
                code.push('op mul _m'+p+' 2 '+index);
                code.push('op add _m'+p+' _m'+p+' '+arrayp[args[0]][1]);
                code.push('set @counter _m'+p);
                code[setp]+=code.length;
            },
        };
        var args = argstolist(tree.args);
        var i;
        if (tree.name in defaultf) {
            defaultf[tree.name](args, p, code);
            return [p, null];
        }

    }
    if (tree.type == 'while') {
        var cod;
        var pwhile = code.length;
        [dp, cod] = translatetree(tree.condition, p, code);
        var pjump = code.length;
        code.push('jump  equal ' + cod + ' false');
        [dp, cod] = translatetree(tree.todo, p, code);
        code.push('set @counter ' + pwhile);
        code[pjump] = code[pjump].slice(0, 5) + code.length + code[pjump].slice(5);
        return [p, null];
    }
    if (tree.type == 'if') {
        var cod;
        [dp, cod] = translatetree(tree.condition, p, code);
        var pif = code.length;
        code.push('jump  equal ' + cod + ' false');
        translatetree(tree.if, p, code);
        if (tree.else == undefined) {
            code[pif] = code[pif].slice(0, 5) + code.length + code[pif].slice(5);
        }
        else {
            var pelse = code.length;
            code.push('set @counter ');
            code[pif] = code[pif].slice(0, 5) + code.length + code[pif].slice(5);
            [dp, _] = translatetree(tree.else, p, code);
            code[pelse] = code[pelse] + code.length;
        }
        return [p, null];
    }
    if (tree.type == 'op') {
        var l, r;
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
            [_,l] =translatetree(tree.l,p,code);
            [dp, r] = translatetree(tree.r, p, code);
            code.push('set ' + l + ' ' + r);
            return [p, l];
        }
        if (tree.op == '!==') {
            return [p, null];
        }
        if (tree.op == '!') {
            return [p, null];
        }
        if (tree.op == '||') {
            return [p, null];
        }
        [dp, l] = translatetree(tree.l, dp, code);
        [dp, r] = translatetree(tree.r, dp, code);
        code.push('op ' + opstr[tree.op] + ' _m' + p + ' ' + l + ' ' + r);
        p++;
        return [p, '_m' + (p - 1)];

    }
    return code;
}