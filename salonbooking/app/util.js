/* ابزارهای مشترک پنل سالن، صفحه مشتری و ابزار مدیر. بدون وابستگی بیرونی. */
var J=SB.core;
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function en(s){return J.en(s).replace(/[,٬\s]/g,"")}
function nu(i){return +en($(i).value)||0}
function fm(n){return Math.round(n).toLocaleString("fa-IR")+" ریال"}
function fn(n){return Math.round(n).toLocaleString("fa-IR")}
function fv(n){return n?Number(n).toLocaleString("en-US"):""}
function fi(el){var n=en(el.value).replace(/\D/g,"");el.value=n?Number(n).toLocaleString("en-US"):""}
/* تاریخ: همه‌جا ساعت محلی دستگاه (نه UTC) */
function td(){return J.today()}
function addD(d,n){return J.addDays(d,n)}
function fd(d){return d?J.jfmt(d,{wd:1}):""}
function fdl(d){return d?J.jfmt(d,{year:1}):""}
function fdw(d){return d?J.jfmt(d,{wd:1,year:1}):""}
function dayLeft(a,b){return J.diffDays(a,b)}
function enc(o){return btoa(unescape(encodeURIComponent(JSON.stringify(o))))}
function dec(s){return JSON.parse(decodeURIComponent(escape(atob(s))))}
function b2u(b){var u=new Uint8Array(b),s="",i;for(i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function u2b(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";var r=atob(s),u=new Uint8Array(r.length),i;for(i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u}
function rnd8(){var a=new Uint32Array(1);crypto.getRandomValues(a);return String(10000000+a[0]%90000000)}
function cp(b){try{navigator.clipboard.writeText(b.dataset.t);b.textContent="کپی شد"}catch(e){}}
function dl(n,t,ty){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:ty||"application/json"}));a.download=n;a.click()}
function qrSvg(t){var q=qrcode(0,"L");q.addData(t);q.make();return q.createSvgTag(4)}
function ymdOf(iso){return J.jOf(iso)}

/* انتخاب تاریخ با تقویم شمسی (پنجره‌ی تقویم)؛ مقدار ذخیره‌شده تاریخ میلادی ISO است (سازگار با داده‌ی قبلی) */
var DP=null;
function dpLbl(iso){return iso?"📅 "+fdw(iso):"📅 انتخاب تاریخ"}
function jd(id,iso,opt){
 opt=opt||{};
 return '<button type="button" class="dp" id="'+id+'" data-v="'+(iso||"")+'" data-e="'+(opt.empty===false?0:1)+'" data-cb="'+esc(opt.cb||"")+'" onclick="dpOpen(\''+id+'\')">'+dpLbl(iso)+'</button>';
}
function jv(id){var e=$(id);return e?(e.dataset.v||""):""}
function dpOpen(id){var e=$(id),iso=e.dataset.v||td(),j=J.jOf(iso);DP={id:id,y:j.y,m:j.m,sel:e.dataset.v||"",e:e.dataset.e==="1"};dpDraw()}
function dpMv(n){DP.m+=n;if(DP.m>12){DP.m=1;DP.y++}if(DP.m<1){DP.m=12;DP.y--}dpDraw()}
function dpYr(n){DP.y+=n;dpDraw()}
function dpDraw(){
 var len=J.jLen(DP.y,DP.m),first=J.isoOfJ(DP.y,DP.m,1),off=J.wd(first),cells="",i,t=td();
 ["ش","ی","د","س","چ","پ","ج"].forEach(function(w){cells+='<div class="h">'+w+'</div>'});
 for(i=0;i<off;i++)cells+='<div></div>';
 for(i=1;i<=len;i++){var iso=J.isoOfJ(DP.y,DP.m,i);cells+='<button type="button" class="'+(iso===t?'today ':'')+(iso===DP.sel?'sel':'')+'" onclick="dpPick(\''+iso+'\')">'+J.fa(i)+'</button>'}
 var m=$("dpm");if(!m){m=document.createElement("div");m.id="dpm";m.className="dpm";document.body.appendChild(m)}
 m.innerHTML='<div class="c"><div class="r" style="align-items:center"><button type="button" class="g" onclick="dpMv(-1)">‹</button><b style="text-align:center">'+J.JM[DP.m-1]+' '+J.fa(DP.y)+'</b><button type="button" class="g" onclick="dpMv(1)">›</button></div><div class="r" style="margin:4px 0"><button type="button" class="g" onclick="dpYr(-1)">سال قبل</button><button type="button" class="g" onclick="dpYr(1)">سال بعد</button></div><div class="cal">'+cells+'</div><div class="ch"><button type="button" class="g" onclick="dpPick(td())">امروز</button>'+(DP.e?'<button type="button" class="g" onclick="dpPick(\'\')">پاک کردن</button>':'')+'<button type="button" class="g" onclick="dpClose()">بستن</button></div></div>';
}
function dpClose(){var m=$("dpm");if(m)m.remove();DP=null}
function dpPick(iso){var e=$(DP.id);e.dataset.v=iso;e.textContent=dpLbl(iso);var cb=e.dataset.cb;dpClose();if(cb){try{new Function(cb)()}catch(x){}}}
/* فشرده‌سازی لینک مشتری (کوچک‌تر شدن لینک و ممکن‌شدن QR) */
function packPub(p){var ts=[],ix={},dd={};Object.keys(p.days||{}).forEach(function(d){var k=p.days[d].join(","),i=ix[k];if(i===undefined){i=ts.length;ix[k]=i;ts.push(p.days[d])}dd[d]=i});p=Object.assign({},p);p.days=undefined;p.ts=ts;p.dd=dd;return p}
function unpackPub(p){if(p.dd){p.days={};Object.keys(p.dd).forEach(function(d){p.days[d]=p.ts[p.dd[d]]})}return p}
function zip(o){
 var raw=new TextEncoder().encode(JSON.stringify(o));
 if(!window.CompressionStream)return Promise.resolve("j"+b2u(raw));
 var cs=new CompressionStream("deflate-raw"),w=cs.writable.getWriter();w.write(raw);w.close();
 return new Response(cs.readable).arrayBuffer().then(function(b){return "z"+b2u(b)});
}
function unzip(h){
 if(h[0]!=="z"&&h[0]!=="j")return Promise.resolve(dec(h));
 var u=u2b(h.slice(1));
 if(h[0]==="j")return Promise.resolve(JSON.parse(new TextDecoder().decode(u)));
 var ds=new DecompressionStream("deflate-raw"),w=ds.writable.getWriter();w.write(u);w.close();
 return new Response(ds.readable).text().then(JSON.parse);
}

/* ---------- منوی آبشاری داده‌محور (الگوی برنامه قبلی) ----------
   گره: {k,t,ic,ch:[...],v:()=>html,badge:()=>n}. بدون دکمه‌ی بازگشت؛ زیرمنوها اول، بعد محتوا. */
var NAV={tree:[],path:[],open:{},draw:null};
/* شماره‌ی ترتیب و راهنمای کوتاه هر منو، با کلید مسیر مثل "s/hr/hrm" */
function decorNav(tree,NO,TIPS,pre){
 tree.forEach(function(n){var p=pre?pre+"/"+n.k:n.k;if(NO[p])n.no=NO[p];if(TIPS[p])n.tip=TIPS[p];if(n.ch){decorNav(n.ch,NO,TIPS,p);n.ch.sort(function(a,b){return (a.no||99)-(b.no||99)})}})
}
function nfind(list,k){for(var i=0;i<list.length;i++)if(list[i].k===k)return list[i];return null}
function nchain(){var out=[],l=NAV.tree,i,n;for(i=0;i<NAV.path.length;i++){n=nfind(l,NAV.path[i]);if(!n)break;out.push(n);l=n.ch||[]}return out}
function go(){NAV.path=[].slice.call(arguments);NAV.open={};F=null;if(NAV.draw)NAV.draw();window.scrollTo(0,0)}
function pick(depth,k){
 if(depth>0&&NAV.path[depth]===k){NAV.path=NAV.path.slice(0,depth);NAV.open={};F=null;NAV.draw();window.scrollTo(0,0);return}
 NAV.path=NAV.path.slice(0,depth);NAV.path.push(k);NAV.open={};var n=nchain().pop();
 while(n&&n.ch&&n.ch.length&&n.first!==false&&!n.v){NAV.path.push(n.ch[0].k);n=n.ch[0]}
 F=null;NAV.draw()}
function menuHtml(list,d,chain){
 var sel=chain[d],one=sel&&!NAV.open[d],shown=one?[sel]:list;
 return '<div class="menu lv'+Math.min(d-1,2)+'">'+shown.map(function(c){
  var on=sel&&sel.k===c.k,b=c.badge?c.badge():0;
  return '<button class="mi'+(on?' on':'')+'" onclick="pick('+d+',\''+c.k+'\')">'+(c.ic?'<span class="ic">'+c.ic+'</span>':'')+'<span class="t">'+(c.no?fn(c.no)+'. ':'')+c.t+'</span>'+(b?'<b class="bd">'+fn(b)+'</b>':'')+'<span class="ar">'+(on&&one?'↩ بازگشت':c.ch&&c.ch.length?'▾':'‹')+'</span></button>'+(on&&c.ch&&c.ch.length?menuHtml(c.ch,d+1,chain):'');
 }).join("")+'</div>';
}
function navHtml(){
 var chain=nchain(),h='',l=NAV.tree,d=0;
 h+='<div class="tabs">'+NAV.tree.map(function(n){var on=NAV.path[0]===n.k;return '<button class="tab'+(on?' on':'')+'" onclick="pick(0,\''+n.k+'\')"><span>'+(n.ic||"")+'</span>'+n.t+'</button>'}).join("")+'</div>';
 var body=chain[0]&&chain[0].ch?menuHtml(chain[0].ch,1,chain):'';
 var last=chain[chain.length-1],tp="",qi;
 for(qi=chain.length-1;qi>0&&!tp;qi--)tp=chain[qi].tip||"";
 if(!tp&&chain[0])tp=chain[0].tip||"";
 return {nav:h,menu:body,last:last,tip:tp?'<div class="tip">💡 '+tp+'</div>':''};
}
function stat(label,val,color,sub){return '<div class="stat" style="--sc:'+color+'"><div class="sv">'+val+'</div><div class="sl">'+label+'</div>'+(sub?'<div class="ss">'+sub+'</div>':'')+'</div>'}
function box(title,inner,cls){return '<div class="c'+(cls?' '+cls:'')+'">'+(title?'<h2>'+title+'</h2>':'')+inner+'</div>'}
var F=null;
/* ارسال متن با پیامک، واتس‌اپ، ایتا، کپی (روبیکا) */
function sendTo(t,txt,num,msgEl){
 var e=encodeURIComponent,n=String(num||"").replace(/\D/g,"");
 if(t==="sms")location.href="sms:"+n+"?body="+e(txt);
 else if(t==="wa")window.open("https://wa.me/"+(n?"98"+n.replace(/^0/,""):"")+"?text="+e(txt));
 else if(t==="tg")window.open("https://t.me/share/url?url=&text="+e(txt));
 else if(t==="ei")window.open("https://eitaa.com/share/url?text="+e(txt));
 else{try{navigator.clipboard.writeText(txt);if(msgEl)msgEl.textContent="کپی شد؛ در روبیکا بچسبان و بفرست."}catch(x){if(msgEl)msgEl.textContent=txt}}
}
function shareBtns(txtVar,numVar){
 return '<div class="ch"><button class="g" onclick="sendTo(\'sms\','+txtVar+','+numVar+',$(\'shm\'))">پیامک</button><button class="g" onclick="sendTo(\'wa\','+txtVar+','+numVar+',$(\'shm\'))">واتس‌اپ</button><button class="g" onclick="sendTo(\'ei\','+txtVar+','+numVar+',$(\'shm\'))">ایتا</button><button class="g" onclick="sendTo(\'cp\','+txtVar+','+numVar+',$(\'shm\'))">کپی (روبیکا)</button></div><p class="mu" id="shm"></p>';
}
/* تخفیف زمان‌دار */
function disc(p,t,v){return t==="pct"?Math.round(p*(100-Math.min(v,100))/100):t==="fix"?Math.max(0,p-v):p}
function fp(x){var t=td(),on=x.dt&&x.dt!=="none"&&(!x.from||t>=x.from)&&(!x.to||t<=x.to);return on?disc(x.price,x.dt,x.dv):x.price}
function dtx(x){if(!x.dt||x.dt==="none"||!x.dv)return"";return(x.dt==="pct"?fn(x.dv)+"٪ تخفیف":fm(x.dv)+" تخفیف")+(x.from||x.to?" ("+(x.from?"از "+fd(x.from):"")+(x.to?" تا "+fd(x.to):"")+")":"")}
function plat(p){return{rubika:"روبیکا",eitaa:"ایتا",wa:"واتس‌اپ",tg:"تلگرام",ig:"اینستاگرام",web:"وب‌سایت"}[p]||p}
