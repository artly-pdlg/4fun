var arrayp = {};
var functionp = {};
function translatetree(tree, p, code) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    if (tree == null)
        return [p, null];
    var dp = p;
    if (typeof (tree) == 'string') {
        return [p, tree];
    }
    if (tree instanceof Array) {
        for (var _i = 0, tree_1 = tree; _i < tree_1.length; _i++) {
            i = tree_1[_i];
            translatetree(i, p, code);
        }
        return [p, null];
    }
    /*if(tree.type=='function'){
        code.push('set @counter ');
        functionp[tree.name]=code.length;
        var args = argstolist(tree.args);
        dp++;
        for(var i=0;i<args.length;i++){
            
        }
        return [p,null];
    }*/
    if (tree.type == 'call') {
        function dodefaultf(name, args, p, code) {
            var _a;
            var dp = p;
            var argsm = [];
            for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                i = args_1[_i];
                var arg;
                _a = translatetree(i, dp, code), dp = _a[0], arg = _a[1];
                argsm.push(arg);
            }
            code.push(name + ' ' + argsm.join(' '));
        }
        var defaultf = ['read', 'write', 'print', 'printflush', 'drawflush', 'draw',
            'control', 'sensor', 'getlink', 'radar', 'ubind', 'unitControl', 'unitRadar', 'unitLocate'];
        var definedf = {
            newArray: function (args, p, code) {
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
            getArray: function (args, p, code) {
                var _a;
                var setp = code.length;
                code.push('set _ARRAYBACK ');
                _a = translatetree(args[1], p, code), dp = _a[0], index = _a[1];
                code.push('op mul _m' + p + ' 2 ' + index);
                code.push('op add _m' + p + ' _m' + p + ' ' + arrayp[args[0]][0]);
                code.push('set @counter _m' + p);
                code[setp] += code.length;
                code.push('set ' + args[2] + ' _ARRAYGET');
            },
            setArray: function (args, p, code) {
                var _a, _b;
                var setp = code.length;
                code.push('set _ARRAYBACK ');
                _a = translatetree(args[2], p, code), dp = _a[0], value = _a[1];
                code.push('set _ARRAYSET ' + value);
                _b = translatetree(args[1], p, code), dp = _b[0], index = _b[1];
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
        if (defaultf.includes(tree.name)) {
            dodefaultf(tree.name, args, p, code);
            return [p, null];
        }
        throw '未定义的函数' + tree.name;
    }
    if (tree.type == 'while') {
        var cod;
        var pwhile = code.length;
        _a = translatetree(tree.condition, p, code), dp = _a[0], cod = _a[1];
        var pjump = code.length;
        code.push('jump  equal ' + cod + ' false');
        _b = translatetree(tree.todo, p, code), dp = _b[0], cod = _b[1];
        code.push('set @counter ' + pwhile);
        code[pjump] = code[pjump].slice(0, 5) + code.length + code[pjump].slice(5);
        return [p, null];
    }
    if (tree.type == 'if') {
        var cod;
        _c = translatetree(tree.condition, p, code), dp = _c[0], cod = _c[1];
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
            _d = translatetree(tree.else, p, code), dp = _d[0], _ = _d[1];
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
            _e = translatetree(tree.l, p, code), _ = _e[0], l = _e[1];
            _f = translatetree(tree.r, p, code), dp = _f[0], r = _f[1];
            code.push('set ' + l + ' ' + r);
            return [p, l];
        }
        if (tree.op == '!==') {
            code.push('set _m' + p + ' false');
            p++;
            dp = p;
            _g = translatetree(tree.l, dp, code), dp = _g[0], l = _g[1];
            _h = translatetree(tree.r, dp, code), dp = _h[0], r = _h[1];
            code.push('jump ' + (code.length + 2) + ' strictEqual ' + l + ' ' + r);
            code.push('set _m' + (p - 1) + ' true');
            return [p, '_m' + (p - 1)];
        }
        if (tree.op == '!') {
            code.push('set _m' + p + ' true');
            p++;
            _j = translatetree(tree.r, p, code), dp = _j[0], r = _j[1];
            code.push('jump ' + (code.length + 2) + ' equal ' + r + ' false');
            code.push('set _m' + (p - 1) + ' false');
            return [p, '_m' + (p - 1)];
        }
        if (tree.op == '||') {
            code.push('set _m' + p + ' true');
            p++;
            _k = translatetree(tree.l, p, code), dp = _k[0], l = _k[1];
            var jumpp = code.length;
            code.push('jump  equal ' + l + ' true');
            _l = translatetree(tree.r, p, code), dp = _l[0], r = _l[1];
            code.push('jump ' + (code.length + 2) + ' equal ' + r + ' true');
            code.push('set _m' + (p - 1) + ' false');
            code[jumpp] = code[jumpp].slice(0, 5) + code.length + code[jumpp].slice(5);
            return [p, '_m' + (p - 1)];
        }
        if (tree.op == '~') {
            _m = translatetree(tree.r, dp, code), dp = _m[0], r = _m[1];
            code.push('op ' + opstr[tree.op] + ' _m' + p + ' ' + r);
            p++;
            return [p, '_m' + (p - 1)];
        }
        _o = translatetree(tree.l, dp, code), dp = _o[0], l = _o[1];
        _p = translatetree(tree.r, dp, code), dp = _p[0], r = _p[1];
        code.push('op ' + opstr[tree.op] + ' _m' + p + ' ' + l + ' ' + r);
        p++;
        return [p, '_m' + (p - 1)];
    }
    return code;
}
