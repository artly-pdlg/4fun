function token(s) {
    function isld(c) {
        return c >= '0' && c <= '9' || c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c == '@';
    }
    function pushop(s, words) {
        var l = [',', '.', ';', '+', '-', '*', '/', '//', '%', '^', '<<', '>>',
            '|', '||', '&&', '&', '!', '~', '===', '!==',
            '!=', '==', '>', '<', '>=', '<=', '=', '(', ')', '{', '}'];
        var pl = l;
        var pl2;
        var p = 0;
        var ns = '';
        s += ' ';
        for (var _i = 0, s_2 = s; _i < s_2.length; _i++) {
            var i = s_2[_i];
            if (pl.length == 0)
                throw '非法的字符:' + ns;
            pl2 = pl.filter(function (x) { return x[p] == i; });
            if (pl2.length == 0) {
                if (!l.includes(ns))
                    throw '非法的字符:' + ns;
                words.push(ns);
                p = 1;
                ns = i;
                pl = l.filter(function (x) { return x[0] == i; });
                continue;
            }
            ns += i;
            p++;
            pl = pl2;
        }
    }
    s += ' ';
    var words = [];
    var p = 0;
    var ps = '';
    var instr = false;
    var strtype = '';
    for (var _i = 0, s_1 = s; _i < s_1.length; _i++) {
        var c = s_1[_i];
        if (!instr && (c == '\'' || c == '\"')) {
            if (ps.length > 0)
                words.push(ps);
            ps = c;
            instr = true;
            strtype = c;
            continue;
        }
        if (instr) {
            if (c == strtype) {
                words.push(ps + c);
                ps = '';
                instr = false;
                continue;
            }
            ps += c;
            continue;
        }
        if (ps == '') {
            if (c != ' ' && c != '\n')
                ps = c;
            continue;
        }
        if (c == ' ' || c == '\n') {
            if (!isld(ps[0]))
                pushop(ps, words);
            else
                words.push(ps);
            ps = '';
            continue;
        }
        if (!isld(c) && isld(ps[0])) {
            words.push(ps);
            ps = c;
            continue;
        }
        if (isld(c) && !isld(ps[0])) {
            pushop(ps, words);
            ps = c;
            continue;
        }
        ps += c;
    }
    return words;
}
