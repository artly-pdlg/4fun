var arrayp = {};
function translatetree(tree, p, code) {
    if (tree == null) return [p, null];
    var dp = p;
    if (typeof (tree) == 'string') {
        return [p, tree];
    }
    if (tree instanceof Array) {
        for (i of tree)
            translatetree(i, p, code);
        return [p, null];
    }
    if (tree.type == 'call') {
        function dodefaultf(name, args, p, code) {
            var dp = p;
            var argsm = [];
            console.log(args);
            for (i of args) {
                var arg;
                [dp,arg]=translatetree(i,dp,code);
                argsm.push(arg);
            }
            code.push(name+' '+argsm.join(' '));
        }
        var defaultf = ['read', 'write', 'print', 'printflush', 'drawflush', 'draw',
            'control', 'sensor', 'getlink', 'radar', 'ubind','unitControl','unitRadar','unitLocate'];
        var definedf = {
            newArray: (args, p, code) => {
                var name = args[0];
                var size = parseInt(args[1]);
                code.push('set @counter ' + (size * 4 + 1 + code.length));
                arrayp[name] = [code.length, code.length + size * 2];
                for (var i = 0; i < size; i++) {
                    code.push('set _ARRAYGET ' + '_a' + name + i);
                    code.push('set @counter _ARRAYBACK');
                }
                for (var i = 0; i < size; i++) {
                    code.push('set _a' + name + i + ' _ARRAYSET');
                    code.push('set @counter _ARRAYBACK');
                }

            },
            getArray: (args, p, code) => {
                var setp = code.length;
                code.push('set _ARRAYBACK ');
                [dp, index] = translatetree(args[1], p, code);
                code.push('op mul _m' + p + ' 2 ' + index);
                code.push('op add _m' + p + ' _m' + p + ' ' + arrayp[args[0]][0]);
                code.push('set @counter _m' + p);
                code[setp] += code.length;
                code.push('set ' + args[2] + ' _ARRAYGET');
            },
            setArray: (args, p, code) => {
                var setp = code.length;
                code.push('set _ARRAYBACK ');
                [dp, value] = translatetree(args[2], p, code);
                code.push('set _ARRAYSET ' + value);
                [dp, index] = translatetree(args[1], p, code);
                code.push('op mul _m' + p + ' 2 ' + index);
                code.push('op add _m' + p + ' _m' + p + ' ' + arrayp[args[0]][1]);
                code.push('set @counter _m' + p);
                code[setp] += code.length;
            },
        };
        var args = argstolist(tree.args);
        var i;
        if (tree.name in definedf) {
            definedf[tree.name](args, p, code);
            return [p, null];
        }
        if (defaultf.includes(tree.name)){
            dodefaultf(tree.name, args, p, code);
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
            [_, l] = translatetree(tree.l, p, code);
            [dp, r] = translatetree(tree.r, p, code);
            code.push('set ' + l + ' ' + r);
            return [p, l];
        }
        if (tree.op == '!==') {
            code.push('set _m' + p + ' false');
            p++;
            dp = p;
            [dp, l] = translatetree(tree.l, dp, code);
            [dp, r] = translatetree(tree.r, dp, code);
            code.push('jump ' + (code.length + 2) + ' strictEqual ' + l + ' ' + r);
            code.push('set _m' + (p - 1) + ' true');
            return [p, '_m' + (p - 1)];
        }
        if (tree.op == '!') {
            code.push('set _m' + p + ' true');
            p++;
            [dp, r] = translatetree(tree.r, p, code);
            code.push('jump ' + (code.length + 2) + ' equal ' + r + ' false');
            code.push('set _m' + (p - 1) + ' false');
            return [p, '_m' + (p - 1)];
        }
        if (tree.op == '||') {
            code.push('set _m' + p + ' true');
            p++;
            [dp, l] = translatetree(tree.l, p, code);
            var jumpp = code.length;
            code.push('jump  equal ' + l + ' true');
            [dp, r] = translatetree(tree.r, p, code);
            code.push('jump ' + (code.length + 2) + ' equal ' + r + ' true');
            code.push('set _m' + (p - 1) + ' false');
            code[jumpp] = code[jumpp].slice(0, 5) + code.length + code[jumpp].slice(5);
            return [p, '_m' + (p - 1)];
        }
        if (tree.op == '~') {
            [dp, r] = translatetree(tree.r, dp, code);
            code.push('op ' + opstr[tree.op] + ' _m' + p + ' ' + r);
            p++;
            return [p, '_m' + (p - 1)];
        }
        [dp, l] = translatetree(tree.l, dp, code);
        [dp, r] = translatetree(tree.r, dp, code);
        code.push('op ' + opstr[tree.op] + ' _m' + p + ' ' + l + ' ' + r);
        p++;
        return [p, '_m' + (p - 1)];

    }
    return code;
}