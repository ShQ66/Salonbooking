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

/* انتخاب تاریخ شمسی: سه لیست سال/ماه/روز؛ مقدار ذخیره‌شده تاریخ میلادی ISO است (سازگار با داده‌ی قبلی) */
function jd(id,iso,opt){
 opt=opt||{};var now=J.jOf(td()),j=iso?J.jOf(iso):null,y0=now.y-(opt.back||0),ys="",ms="",ds="",i;
 for(i=y0;i<=now.y+3;i++)ys+='<option value="'+i+'"'+(j&&j.y===i?" selected":"")+'>'+J.fa(i)+'</option>';
 for(i=1;i<=12;i++)ms+='<option value="'+i+'"'+(j&&j.m===i?" selected":"")+'>'+J.JM[i-1]+'</option>';
 for(i=1;i<=31;i++)ds+='<option value="'+i+'"'+(j&&j.d===i?" selected":"")+'>'+J.fa(i)+'</option>';
 var e='<option value="">—</option>';
 return '<div class="r jd" id="'+id+'"><select>'+(opt.empty!==false?e:"")+ys+'</select><select>'+(opt.empty!==false?e:"")+ms+'</select><select>'+(opt.empty!==false?e:"")+ds+'</select></div>';
}
function jv(id){
 var s=$(id).querySelectorAll("select"),y=+s[0].value,m=+s[1].value,d=+s[2].value;
 if(!y||!m||!d)return "";
 if(d>J.jLen(y,m))d=J.jLen(y,m);
 return J.isoOfJ(y,m,d);
}

/* ---------- منوی آبشاری داده‌محور (الگوی برنامه قبلی) ----------
   گره: {k,t,ic,ch:[...],v:()=>html,badge:()=>n}. بدون دکمه‌ی بازگشت؛ زیرمنوها اول، بعد محتوا. */
var NAV={tree:[],path:[],draw:null,locked:null};
function nfind(list,k){for(var i=0;i<list.length;i++)if(list[i].k===k)return list[i];return null}
function nchain(){var out=[],l=NAV.tree,i,n;for(i=0;i<NAV.path.length;i++){n=nfind(l,NAV.path[i]);if(!n)break;out.push(n);l=n.ch||[]}return out}
function go(){NAV.path=[].slice.call(arguments);F=null;if(NAV.draw)NAV.draw();window.scrollTo(0,0)}
function pick(depth,k){NAV.path=NAV.path.slice(0,depth);NAV.path.push(k);var n=nchain().pop();
 while(n&&n.ch&&n.ch.length&&n.first!==false&&!n.v){NAV.path.push(n.ch[0].k);n=n.ch[0]}
 F=null;NAV.draw()}
function menuHtml(list,d,chain){
 var sel=chain[d];
 return '<div class="menu lv'+Math.min(d-1,2)+'">'+list.map(function(c){
  var on=sel&&sel.k===c.k,b=c.badge?c.badge():0;
  return '<button class="mi'+(on?' on':'')+'" onclick="pick('+d+',\''+c.k+'\')">'+(c.ic?'<span class="ic">'+c.ic+'</span>':'')+'<span class="t">'+c.t+'</span>'+(b?'<b class="bd">'+fn(b)+'</b>':'')+'<span class="ar">'+(c.ch&&c.ch.length?'▾':'‹')+'</span></button>'+(on&&c.ch&&c.ch.length?menuHtml(c.ch,d+1,chain):'');
 }).join("")+'</div>';
}
function navHtml(){
 var chain=nchain(),h='',l=NAV.tree,d=0;
 h+='<div class="tabs">'+NAV.tree.map(function(n){var on=NAV.path[0]===n.k;return '<button class="tab'+(on?' on':'')+'" onclick="pick(0,\''+n.k+'\')"><span>'+(n.ic||"")+'</span>'+n.t+'</button>'}).join("")+'</div>';
 var body=chain[0]&&chain[0].ch?menuHtml(chain[0].ch,1,chain):'';
 var last=chain[chain.length-1];
 return {nav:h,menu:body,last:last};
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
