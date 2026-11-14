/* سالن‌بوک — هسته‌ی مشترک: ارقام، تاریخ شمسی، ساعت‌های خالی، بسته‌بندی لینک، رمزنگاری، ذخیره‌سازی.
   هم در اپ سالن‌دار و هم در صفحه‌ی مشتری و ابزار مدیر استفاده می‌شود. بدون وابستگی بیرونی. */
(function (g) {
  'use strict';
  var SB = g.SB = g.SB || {};
  var C = SB.core = {};

  /* ---------- ارقام و متن ---------- */
  var FA = '۰۱۲۳۴۵۶۷۸۹', AR = '٠١٢٣٤٥٦٧٨٩';
  C.en = function (s) {
    return String(s == null ? '' : s).replace(/[۰-۹]/g, function (c) { return FA.indexOf(c); })
      .replace(/[٠-٩]/g, function (c) { return AR.indexOf(c); });
  };
  C.fa = function (s) { return String(s).replace(/\d/g, function (d) { return FA[+d]; }); };
  C.num = function (n) { return C.fa(Math.round(+n || 0).toLocaleString('en-US').replace(/,/g, '٬')); };
  C.int = function (s) { var n = parseInt(C.en(s).replace(/[^\d-]/g, ''), 10); return isNaN(n) ? 0 : n; };
  C.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  C.phone = function (s) {
    var d = C.en(s).replace(/\D/g, '');
    if (d.indexOf('0098') === 0) d = '0' + d.slice(4);
    else if (d.indexOf('98') === 0 && d.length === 12) d = '0' + d.slice(2);
    else if (d.length === 10 && d[0] === '9') d = '0' + d;
    return d;
  };
  C.phoneOk = function (d) { return /^09\d{9}$/.test(d); };
  C.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  C.fill = function (t, v) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); };

  /* ---------- تقویم شمسی (الگوریتم jalaali) ---------- */
  function div(a, b) { return ~~(a / b); }
  function mod(a, b) { return a - ~~(a / b) * b; }
  function jalCal(jy) {
    var br = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    var bl = br.length, gy = jy + 621, leapJ = -14, jp = br[0], jm, jump = 0, leap, leapG, march, n, i;
    if (jy < jp || jy >= br[bl - 1]) throw new Error('سال نامعتبر');
    for (i = 1; i < bl; i += 1) {
      jm = br[i]; jump = jm - jp;
      if (jy < jm) break;
      leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return { leap: leap, gy: gy, march: march };
  }
  function g2d(gy, gm, gd) {
    var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
    return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  }
  function d2g(jdn) {
    var j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    var i = div(mod(j, 1461), 4) * 5 + 308;
    var gd = div(mod(i, 153), 5) + 1, gm = mod(div(i, 153), 12) + 1;
    return { gy: div(j, 1461) - 100100 + div(8 - gm, 6), gm: gm, gd: gd };
  }
  function j2d(jy, jm, jd) {
    var r = jalCal(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  }
  function d2j(jdn) {
    var gy = d2g(jdn).gy, jy = gy - 621, r = jalCal(jy), j1 = g2d(gy, 3, r.march), k = jdn - j1, jm, jd;
    if (k >= 0) {
      if (k <= 185) return { y: jy, m: 1 + div(k, 31), d: mod(k, 31) + 1 };
      k -= 186;
    } else { jy -= 1; k += 179; if (r.leap === 1) k += 1; }
    jm = 7 + div(k, 30); jd = mod(k, 30) + 1;
    return { y: jy, m: jm, d: jd };
  }
  C.jLeap = function (y) { return jalCal(y).leap === 0; };
  C.jLen = function (y, m) { return m <= 6 ? 31 : m <= 11 ? 30 : (C.jLeap(y) ? 30 : 29); };
  C.JM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  C.WD = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  /* ---------- تاریخ میلادی ISO (YYYY-MM-DD، ساعت محلی دستگاه) ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  C.pad = pad;
  C.iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  C.today = function () { return C.iso(new Date()); };
  C.parse = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); };
  C.addDays = function (s, n) { var d = C.parse(s); d.setDate(d.getDate() + n); return C.iso(d); };
  C.diffDays = function (a, b) { return Math.round((C.parse(b) - C.parse(a)) / 864e5); };
  C.wd = function (s) { return (C.parse(s).getDay() + 1) % 7; };           // شنبه=۰ ... جمعه=۶
  C.jOf = function (s) { var p = s.split('-'); return d2j(g2d(+p[0], +p[1], +p[2])); };
  C.isoOfJ = function (y, m, d) { var x = d2g(j2d(y, m, d)); return x.gy + '-' + pad(x.gm) + '-' + pad(x.gd); };
  C.jfmt = function (s, o) {
    o = o || {};
    var j = C.jOf(s), t = C.fa(j.d) + ' ' + C.JM[j.m - 1];
    if (o.year) t += ' ' + C.fa(j.y);
    if (o.wd) t = C.WD[C.wd(s)] + ' ' + t;
    return t;
  };

  /* ---------- ساعت (دقیقه از نیمه‌شب) ---------- */
  C.mm = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  C.hm = function (s) { var p = C.en(s).split(':'); return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0); };

  /* ساعت‌های شروع ممکن: win={from,to}، busy=[[s,e],...]، minStart=کمترین ساعت مجاز */
  C.slots = function (win, dur, step, busy, minStart) {
    var out = [], s, i, ok;
    if (!win || !(step > 0)) return out;
    for (s = win.from; s + dur <= win.to; s += step) {
      if (minStart != null && s < minStart) continue;
      ok = true;
      for (i = 0; i < busy.length; i++) { if (s < busy[i][1] && busy[i][0] < s + dur) { ok = false; break; } }
      if (ok) out.push(s);
    }
    return out;
  };
  C.mergeBusy = function (list) {
    var a = list.map(function (x) { return [x[0], x[1]]; }).sort(function (p, q) { return p[0] - q[0]; }), out = [];
    a.forEach(function (x) {
      var l = out[out.length - 1];
      if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else out.push(x);
    });
    return out;
  };

})(window);
