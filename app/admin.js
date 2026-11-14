/* ابزار مدیر (نسخه ۳). فقط روی دستگاه خود مدیر نگه داشته شود؛ آنلاین نگذار. */
var app=$("app");
var DEF_TPL={
 code:"سلام {name} عزیز\nاشتراک «{plan}» ({days} روز) شما آماده شد. این کد را در برنامه، بخش تنظیمات ← اشتراک ← کد فعال‌سازی وارد کن:\n\n{code}",
 remind:"سلام {name} عزیز\nاشتراک شما {left} روز دیگر ({exp}) تمام می‌شود. برای تمدید پیام بده.",
 pay:"سلام {name} عزیز\nپرداخت شما دریافت شد؛ کد فعال‌سازی تا دقایقی دیگر ارسال می‌شود."
};
var P={plans:[],sales:[]},K=null,ed=null,out="",q="",AMs=null;
try{var a=localStorage.getItem("adm");if(a)P=JSON.parse(a);var k=localStorage.getItem("adk");if(k)K=JSON.parse(k)}catch(e){}
P.mgr=P.mgr||{cards:[],c:{}};P.mgr.c=P.mgr.c||{};P.mgr.cards=P.mgr.cards||[];P.tpl=P.tpl||{};
if(!P.base&&P.plans.length&&P.plans[0].price)P.base=Math.round(P.plans[0].price*30/P.plans[0].days);
P.base=P.base||0;P.trial=P.trial||{on:false,days:7};
function sv(){try{localStorage.setItem("adm",JSON.stringify(P))}catch(e){}}
function svk(){try{localStorage.setItem("adk",JSON.stringify(K))}catch(e){}}
function tplT(k){return P.tpl[k]||DEF_TPL[k]}
function pb(x){return Math.round((P.base||0)*(x.days||0)/30)}
function fp(x){var t=td(),on=x.dt&&x.dt!=="none"&&(!x.from||t>=x.from)&&(!x.to||t<=x.to);return on?disc(pb(x),x.dt,x.dv):pb(x)}
function xp(x){return Object.assign({},x,{price:pb(x)})}
function dtx2(x){return dtx(x)}

/* ---------- محاسبه‌ی وضعیت سالن‌ها از روی فروش‌ها ---------- */
function salons(){
 var m={};
 P.sales.forEach(function(s){(m[s.dev]=m[s.dev]||[]).push(s)});
 return Object.keys(m).map(function(dev){
  var L=m[dev].slice().sort(function(a,b){return a.t<b.t?-1:a.t>b.t?1:0}),cur="",nm="",ph="",pl="",paid=0;
  L.forEach(function(s){var b=cur&&cur>s.t?cur:s.t;cur=addD(b,s.days);if(s.name)nm=s.name;if(s.phone)ph=s.phone;pl=s.plan;paid+=s.paid});
  return{dev:dev,name:nm,phone:ph,plan:pl,exp:cur,left:dayLeft(td(),cur),paid:paid,n:L.length};
 }).sort(function(a,b){return a.left-b.left});
}
function stTxt(l){return l<=0?'<span class="er">منقضی</span>':l<=7?'<span class="wn">رو به پایان</span>':'<span class="ok">فعال</span>'}
function jmKey(iso){var j=J.jOf(iso);return j.y+"/"+J.pad(j.m)}

/* ---------- داشبورد ---------- */
function aDash(){
 var S=salons(),act=S.filter(function(s){return s.left>0}).length,ex=S.filter(function(s){return s.left>0&&s.left<=7}),dead=S.filter(function(s){return s.left<=0}).length;
 var mk0=jmKey(td()),mon=P.sales.filter(function(s){return jmKey(s.t)===mk0}).reduce(function(t,s){return t+s.paid},0),tot=P.sales.reduce(function(t,s){return t+s.paid},0);
 return '<div class="stats">'+stat("سالن فعال",fn(act),"var(--ok)")+stat("رو به پایان (≤۷ روز)",fn(ex.length),"var(--wn)")+stat("منقضی",fn(dead),"var(--er)")+stat("درآمد این ماه",fm(mon),"var(--ac)")+'</div>'+
 box("",'<h2>رو به پایان</h2>'+(ex.map(salonRow).join("")||'<p class="mu">موردی نیست.</p>'))+
 box("",'<p class="mu">جمع کل فروش: <b>'+fm(tot)+'</b> · تعداد کد صادرشده: '+fn(P.sales.length)+'</p>')+(K?'':'<div class="c er">هنوز کلید امضا نساخته‌ای: تنظیمات ← کلید امضا.</div>');
}
function salonRow(s){
 return '<div class="row"><div><b>'+esc(s.name||"—")+'</b> · '+stTxt(s.left)+'<small>'+s.dev+' · '+esc(s.plan)+' · پایان: '+fdl(s.exp)+' ('+(s.left>0?fn(s.left)+' روز مانده':'منقضی')+')'+(s.phone?' · <span class="ltr">'+esc(s.phone)+'</span>':'')+'</small></div><div><button class="g" onclick="remMsg(\''+s.dev+'\')">یادآوری</button></div></div>';
}
function remMsg(dev){
 var s=salons().filter(function(x){return x.dev===dev})[0];if(!s)return;
 AMs={t:J.fill(tplT("remind"),{name:s.name||"",left:s.left,exp:fdl(s.exp),plan:s.plan}),ph:s.phone||"",who:s.name||s.dev};
 render();window.scrollTo(0,0);
}
function msgBox(){
 if(!AMs)return"";
 window._at=AMs.t;window._ap=AMs.ph;
 return '<div class="c" style="border-color:var(--ac)"><h2>پیام برای '+esc(AMs.who)+'</h2><textarea rows="5" oninput="window._at=this.value;AMs.t=this.value">'+esc(AMs.t)+'</textarea><input class="ltr" inputmode="tel" placeholder="موبایل گیرنده" value="'+esc(AMs.ph)+'" oninput="window._ap=this.value;AMs.ph=this.value">'+shareBtns("window._at","window._ap")+'<button class="g" onclick="AMs=null;render()">بستن</button></div>';
}

/* ---------- معرفی برنامه ---------- */
function itxt(){return (P.appText||"برنامه نوبت‌دهی سالن زیبایی؛ نصب و تست رایگان:")+"\n"+P.appUrl}
function aIntro(){
 var u=(P.appUrl||"").trim(),ok=/^https?:\/\/\S+$/.test(u),qr="";
 if(ok){try{qr=qrSvg(u)}catch(e){}}
 window._it=ok?itxt():"";
 return box("",'<input class="ltr" placeholder="لینک برنامه (https://...)" value="'+esc(P.appUrl||"")+'" onchange="P.appUrl=this.value.trim();sv();render()"><textarea rows="2" placeholder="متن پیام معرفی (اختیاری)" oninput="P.appText=this.value;sv()">'+esc(P.appText||"")+'</textarea>'+
 (ok?shareBtns("window._it","''")+'<div id="qr">'+qr+'</div><button class="g" onclick="dl(\'app-qr.svg\',qrSvg(P.appUrl),\'image/svg+xml\')">دانلود QR</button>':'<p class="mu">لینک برنامه را وارد کن تا دکمه‌های ارسال و QR ساخته شود.</p>')+'<p class="mu">این لینک عمومی است و برای ارسال به سالن‌ها امن است.</p>');
}

/* ---------- سالن‌ها ---------- */
function aCode(){
 var opts=P.plans.filter(function(x){return x.on}).map(function(x){return '<option value="'+x.id+'">'+esc(x.n)+' — '+fm(fp(x))+'</option>'}).join("");
 return box("",'<input id="sname" placeholder="نام سالن (برای پیگیری)"><input id="sph" class="ltr" inputmode="tel" placeholder="موبایل سالن (اختیاری، برای ارسال کد)"><input id="dv" inputmode="numeric" maxlength="8" placeholder="کد ۸ رقمی دستگاه (از سالن)"><select id="sp">'+opts+'</select><div class="r"><select id="ot"><option value="none">بدون تخفیف موردی</option><option value="pct">تخفیف موردی درصدی</option><option value="fix">تخفیف موردی مبلغ (ریال)</option></select><input id="ov" inputmode="numeric" placeholder="مقدار" oninput="fi(this)"></div><button onclick="mk()" '+(K?'':'disabled')+'>ساخت کد</button>'+(K?'':'<p class="er">اول کلید امضا بساز (تنظیمات).</p>'))+'<div id="res">'+out+'</div>';
}
function signMsg(msg,cb){
 crypto.subtle.importKey("jwk",K.priv,{name:"ECDSA",namedCurve:"P-256"},false,["sign"]).then(function(k){return crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},k,new TextEncoder().encode(msg))}).then(function(sig){cb(b2u(new TextEncoder().encode(msg))+"."+b2u(sig))});
}
function dstamp(){return td().replace(/-/g,"")}
function sign(dev,days,cb){signMsg(dev+"|"+days+"|"+dstamp(),cb)}
function codeBox(code,paid,s){
 var exp=addD(td(),s.days);
 window._at=J.fill(tplT("code"),{name:s.name||"",plan:s.plan,days:s.days,code:code,exp:fdl(exp)});window._ap=s.phone||"";
 return '<div class="c"><p class="ok">مبلغ قابل پرداخت: <b>'+fm(paid)+'</b></p><textarea class="ltr" rows="4" readonly onclick="this.select()">'+code+'</textarea><button class="g" onclick="cp(this)" data-t="'+code+'">کپی کد</button><hr><span class="mu">ارسال کد به سالن</span>'+shareBtns("window._at","window._ap")+'</div>';
}
function mk(){
 var dev=en($("dv").value);if(!/^\d{8}$/.test(dev)){alert("کد دستگاه باید ۸ رقم باشد.");return}
 var x=P.plans.filter(function(y){return y.id===$("sp").value})[0];if(!x){alert("پلن انتخاب کن.");return}
 var paid=fp(x),ot=$("ot").value,ov=nu("ov");if(ot!=="none")paid=disc(paid,ot,ov);
 var nm=$("sname").value.trim(),ph=J.phone($("sph").value);
 sign(dev,x.days,function(code){var s={t:td(),dev:dev,name:nm,phone:ph,plan:x.n,days:x.days,paid:paid};P.sales.push(s);sv();out=codeBox(code,paid,s);render()});
}
function remain(x){return x.days-dayLeft(x.t,td())}
function aReis(){
 var ls=salons().filter(function(s){return s.left>0}).map(function(s){return '<div class="row"><div><b>'+esc(s.name||"—")+'</b><small>'+s.dev+' · '+fn(s.left)+' روز مانده</small></div><button class="g" onclick="reis(\''+s.dev+'\')">صدور مجدد</button></div>'}).join("")||'<p class="mu">سالن فعالی نیست.</p>';
 return box("",'<p class="mu">وقتی سالن گوشی را عوض کرد (کد دستگاه جدید)، برای روزهای باقی‌مانده و بدون مبلغ کد تازه بساز.</p>'+ls)+'<div id="res">'+out+'</div>';
}
function reis(dev){
 var s=salons().filter(function(x){return x.dev===dev})[0];if(!s)return;
 if(!K){alert("اول کلید را بساز یا بازیابی کن.");return}
 var nd=en(prompt("کد ۸ رقمی دستگاه جدید سالن:",dev)||"");
 if(!/^\d{8}$/.test(nd))return;
 if(!confirm("کد جدید برای "+s.left+" روز باقی‌مانده و بدون مبلغ ساخته شود؟"))return;
 sign(nd,s.left,function(code){var r={t:td(),dev:nd,name:s.name,phone:s.phone,plan:"صدور مجدد: "+s.plan,days:s.left,paid:0};P.sales.push(r);sv();out=codeBox(code,0,r);render();window.scrollTo(0,document.body.scrollHeight/2)});
}
function aSalons(){
 var S=salons();
 return msgBox()+box("",(S.map(salonRow).join("")||'<p class="mu">هنوز سالنی ثبت نشده.</p>'));
}

/* ---------- حسابداری ---------- */
function pvw(){var el=$("pvw");if(!el)return;var d=nu("pd"),t=$("pt").value,v=nu("pv"),b=pb({days:d});
 if(!P.base){el.innerHTML='<span class="er">اول قیمت پایه را وارد کن.</span>';return}
 if(!d){el.innerHTML='<span class="mu">مدت را وارد کن.</span>';return}
 var f=disc(b,t,v);el.innerHTML='قیمت پایه این پلن: <b>'+fm(b)+'</b><br>'+(t!=="none"&&v?'تخفیف: '+(t==="pct"?fn(v)+'٪':fm(v))+' ← <b>'+fm(b-f)+'</b><br>':'')+'قیمت نهایی: <b class="ok">'+fm(f)+'</b>'}
function pll(){return P.plans.map(function(x){return '<div class="row"><div><b>'+esc(x.n)+'</b>'+(x.on?'':' <span class="er">(غیرفعال)</span>')+'<small>'+fn(x.days)+' روز · '+fm(pb(x))+(dtx(x)?' · '+dtx(x):'')+'</small><small>قیمت نهایی امروز: '+fm(fp(x))+'</small></div><div><button class="g" onclick="edit(\''+x.id+'\')">ویرایش</button> <label class="mu"><input type="checkbox"'+(x.on?' checked':'')+' onchange="tog(\''+x.id+'\')"> فعال</label> <button class="d" onclick="del(\''+x.id+'\')">حذف</button></div></div>'}).join("")||'<p class="mu">هنوز پلنی تعریف نشده.</p>'}
function aPlans(){
 var e=ed!==null?P.plans.filter(function(x){return x.id===ed})[0]||{}:{};
 return box("",'<p class="mu">قیمت پایه اشتراک (برای ۳۰ روز، ریال). قیمت هر پلن بر اساس مدتش از این محاسبه می‌شود.</p><input id="pb" class="ltr" inputmode="numeric" placeholder="قیمت پایه (ریال)" value="'+fv(P.base)+'" oninput="fi(this);P.base=nu(\'pb\');sv();$(\'pls\').innerHTML=pll();pvw()"><div id="pls">'+pll()+'</div>')+
 box("",'<h2>'+(ed!==null?'ویرایش پلن':'افزودن پلن')+'</h2><input id="pn" placeholder="نام پلن (مثلاً یک‌ماهه)" value="'+esc(e.n||"")+'"><input id="pd" inputmode="numeric" placeholder="مدت (روز)" value="'+(e.days||"")+'" oninput="pvw()">'+
 '<div class="r"><select id="pt" onchange="pvw()"><option value="none">بدون تخفیف ثابت</option><option value="pct"'+(e.dt==="pct"?" selected":"")+'>تخفیف درصدی</option><option value="fix"'+(e.dt==="fix"?" selected":"")+'>تخفیف مبلغ ثابت (ریال)</option></select><input id="pv" inputmode="numeric" placeholder="مقدار تخفیف" value="'+fv(e.dv)+'" oninput="fi(this);pvw()"></div><div id="pvw" class="pre"></div>'+
 '<span class="mu">شروع تخفیف (اختیاری)</span>'+jd("pf",e.from)+'<span class="mu">پایان تخفیف (اختیاری)</span>'+jd("pe",e.to)+
 '<button onclick="sp()">'+(ed!==null?'ذخیره تغییرات':'افزودن')+'</button>'+(ed!==null?' <button class="g" onclick="ed=null;render()">انصراف</button>':''));
}
function sp(){
 var n=$("pn").value.trim(),d=nu("pd"),p=pb({days:d});if(!n||!d||!P.base){alert("نام، مدت و قیمت پایه را کامل کن.");return}
 var o={id:ed||("p"+Date.now()),n:n,days:d,price:p,dt:$("pt").value,dv:nu("pv"),from:jv("pf"),to:jv("pe"),on:true};
 if(ed!==null){P.plans=P.plans.map(function(x){return x.id===ed?Object.assign(o,{on:x.on}):x})}else P.plans.push(o);
 ed=null;sv();render();
}
function edit(i){ed=i;render();window.scrollTo(0,document.body.scrollHeight/3)}
function tog(i){P.plans.forEach(function(x){if(x.id===i)x.on=!x.on});sv();render()}
function del(i){if(confirm("این پلن حذف شود؟")){P.plans=P.plans.filter(function(x){return x.id!==i});sv();render()}}
function slist(){
 var qq=q.trim().toLowerCase(),qd=en(qq);
 return P.sales.map(function(x,i){return[x,i]}).reverse().filter(function(y){var x=y[0];return !qq||(x.dev.indexOf(qd)>-1&&qd.length>0)||((x.name||"")+" "+x.plan).toLowerCase().indexOf(qq)>-1}).map(function(y){var x=y[0],r=remain(x);return '<div class="row"><div>'+esc(x.name||"—")+' · '+esc(x.plan)+'<small>'+x.dev+' · '+fdl(x.t)+' · '+(r>0?fn(r)+' روز باقی‌مانده':'منقضی')+'</small></div><div><b>'+fm(x.paid)+'</b></div></div>'}).join("")||'<p class="mu">موردی یافت نشد.</p>';
}
function aSales(){
 var tot=P.sales.reduce(function(s,x){return s+x.paid},0);
 return box("",'<p>جمع کل: <b>'+fm(tot)+'</b> · تعداد: '+fn(P.sales.length)+'</p><input placeholder="جستجو: کد دستگاه، نام سالن یا پلن" value="'+esc(q)+'" oninput="q=this.value;$(\'sl\').innerHTML=slist()"><div id="sl">'+slist()+'</div>');
}
function aRep(){
 var m={};P.sales.forEach(function(s){var k=jmKey(s.t),o=m[k]||(m[k]={n:0,sum:0,free:0});o.n++;o.sum+=s.paid;if(!s.paid)o.free++});
 var ks=Object.keys(m).sort().reverse(),rows=ks.map(function(k){var p=k.split("/"),o=m[k];return '<div class="row"><div><b>'+J.JM[+p[1]-1]+' '+J.fa(p[0])+'</b><small>'+fn(o.n)+' کد'+(o.free?' ('+fn(o.free)+' بدون مبلغ)':'')+'</small></div><b>'+fm(o.sum)+'</b></div>'}).join("")||'<p class="mu">فروشی ثبت نشده.</p>';
 return box("",rows)+(ks.length?'<button class="g" onclick="repCsv()">دانلود گزارش (CSV)</button>':'');
}
function repCsv(){
 var l=["تاریخ,کد دستگاه,نام,پلن,روز,مبلغ"];P.sales.forEach(function(s){l.push([s.t,s.dev,(s.name||"").replace(/,/g," "),(s.plan||"").replace(/,/g," "),s.days,s.paid].join(","))});
 dl("sales.csv","﻿"+l.join("\n"),"text/csv");
}

/* ---------- پشتیبانی ---------- */
function aContact(){
 P.mgr.off=P.mgr.off||{};
 var rows=[["sms","شماره موبایل برای پیامک (09...)"],["wa","شماره واتس‌اپ (09...)"],["eitaa","لینک پروفایل ایتا (https://eitaa.com/...)"],["rubika","لینک پروفایل روبیکا"],["tg","لینک تلگرام (https://t.me/...)"]].map(function(k){var off=P.mgr.off[k[0]];return '<div class="r" style="align-items:center"><input class="ltr" placeholder="'+k[1]+'" value="'+esc(P.mgr.c[k[0]]||"")+'" oninput="P.mgr.c[\''+k[0]+'\']=this.value;sv()"><label class="mu" style="flex:0;white-space:nowrap"><input type="checkbox"'+(off?'':' checked')+' onchange="P.mgr.off[\''+k[0]+'\']=!P.mgr.off[\''+k[0]+'\'];sv();render()"> فعال</label></div>'}).join("");
 return box("",'<p class="mu">سالن‌ها از این راه‌ها برایت پیام می‌فرستند. فقط ردیف‌های پرشده و «فعال» به سالن نشان داده می‌شود.</p>'+rows+'<p class="mu">بعد از هر تغییر، plans.json را دوباره دانلود و آپلود کن.</p>');
}
function aTpl(){
 var ks=[["code","پیام ارسال کد فعال‌سازی","{name} {plan} {days} {code} {exp}"],["remind","پیام یادآوری تمدید","{name} {left} {exp} {plan}"],["pay","پیام تأیید دریافت پرداخت","{name}"]];
 return box("",ks.map(function(k){return '<span class="mu">'+k[1]+' — جای‌نگهدار: '+k[2]+'</span><textarea rows="3" oninput="P.tpl.'+k[0]+'=this.value;sv()">'+esc(tplT(k[0]))+'</textarea>'}).join("")+'<button class="g" onclick="if(confirm(\'متن‌ها به حالت اول برگردد؟\')){P.tpl={};sv();render()}">بازگشت به متن پیش‌فرض</button>');
}

/* ---------- تنظیمات ---------- */
function aKey(){
 return box("",(K?'<p class="ok">کلید آماده است.</p><button class="g" onclick="bk()">دانلود پشتیبان کلید</button> <button class="g" onclick="$(\'kf\').click()">بازیابی از فایل</button>':'<p class="er">هنوز کلید نساخته‌ای.</p><p class="mu">اگر قبلاً روی دستگاه دیگری ساخته‌ای، «بازیابی از فایل» را بزن و دکمه ساخت کلید را نزن.</p><button onclick="gk()">ساخت کلید</button> <button class="g" onclick="$(\'kf\').click()">بازیابی از فایل</button>')+'<input type="file" id="kf" accept=".json" style="display:none" onchange="rk(this)"><p class="mu">فایل پشتیبان کلید را فقط در جای امن نگه دار؛ هرگز کنار فایل‌های منتشرشده (GitHub، هاست) نگذار.</p>');
}
function gk(){if(!confirm("اگر قبلاً روی دستگاه دیگری کلید ساخته‌ای، این کار کلید جدید می‌سازد و همه کدها و سالن‌های فعال‌شده باطل می‌شوند. فقط اگر اولین‌بار است ادامه بده."))return;crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]).then(function(p){return Promise.all([crypto.subtle.exportKey("jwk",p.privateKey),crypto.subtle.exportKey("jwk",p.publicKey)])}).then(function(r){K={priv:r[0],pub:r[1]};svk();render();bk()})}
function bk(){dl("PRIVATE-KEY-BACKUP.json",JSON.stringify(K))}
function rk(el){var f=el.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);if(o.priv&&o.pub){K=o;svk();render()}else alert("فایل معتبر نیست.")}catch(e){alert("فایل معتبر نیست.")}};r.readAsText(f)}
function aCards(){
 return box("",'<p class="mu">کارت‌هایی که سالن‌ها برای پرداخت اشتراک می‌بینند (تا ۳ کارت).</p>'+P.mgr.cards.map(function(k,i){return '<div class="row"><div><b>'+esc(k.h)+'</b> · '+esc(k.b)+'<small class="ltr">'+esc(k.num)+(k.on===false?' (غیرفعال)':'')+'</small></div><div><label class="mu"><input type="checkbox"'+(k.on===false?'':' checked')+' onchange="P.mgr.cards['+i+'].on=(P.mgr.cards['+i+'].on===false);sv();render()"> فعال</label> <button class="d" onclick="P.mgr.cards.splice('+i+',1);sv();render()">حذف</button></div></div>'}).join("")+(P.mgr.cards.length<3?'<input id="mh" placeholder="نام صاحب کارت"><input id="mb" placeholder="نام بانک"><input id="mn" inputmode="numeric" placeholder="شماره کارت"><button onclick="amc()">افزودن کارت</button>':''));
}
function amc(){var h=$("mh").value.trim(),b=$("mb").value.trim(),n=en($("mn").value);if(!h||!b||n.length<16){alert("همه فیلدها و شماره کارت ۱۶ رقمی را وارد کن.");return}P.mgr.cards.push({h:h,b:b,num:n.replace(/(\d{4})(?=\d)/g,"$1 ")});sv();render()}
function aTrial(){var t=P.trial;return box("",'<label class="mu"><input type="checkbox"'+(t.on?' checked':'')+' onchange="P.trial.on=!P.trial.on;sv();render()"> دوره رایگان فعال باشد</label><br><span class="mu">تعداد روز رایگان</span><input id="td" inputmode="numeric" value="'+(t.days||"")+'" oninput="P.trial.days=nu(\'td\');sv()"><p class="mu">هر دستگاه فقط یک بار می‌تواند استفاده کند. بعد از هر تغییر، plans.json را دوباره دانلود و آپلود کن.</p>')}
function mgOut(){var c={};Object.keys(P.mgr.c).forEach(function(k){if(P.mgr.c[k]&&!(P.mgr.off||{})[k])c[k]=P.mgr.c[k]});return{cards:P.mgr.cards.filter(function(k){return k.on!==false}),c:c}}
function aPub(){
 return box("",'<p class="mu">فایل plans.json شامل پلن‌های فعال، کارت‌ها، راه‌های تماس، دوره رایگان و کلید عمومی است. بعد از هر تغییر در این بخش‌ها دانلود کن و کنار برنامه آپلود کن (جایگزین فایل قبلی).</p><button onclick="ex()">دانلود plans.json</button><p class="mu">فقط plans.json، index.html، sw.js و پوشه‌ی app و آیکون‌ها را آپلود کن؛ PRIVATE-KEY-BACKUP.json هرگز.</p>');
}
function ex(){if(!K){alert("اول کلید بساز.");return}
 var o={v:2,updated:td(),pub:K.pub,mgr:mgOut(),plans:P.plans.filter(function(x){return x.on}).map(xp)};
 if(P.trial.on&&P.trial.days>0){signMsg("T|"+P.trial.days+"|"+dstamp(),function(code){o.trial={days:P.trial.days,code:code};dl("plans.json",JSON.stringify(o))})}else dl("plans.json",JSON.stringify(o))}
function aBk(){
 return box("",'<button onclick="dl(\'admin-backup.json\',JSON.stringify(P))">دانلود پشتیبان پلن‌ها و فروش‌ها</button> <button class="g" onclick="$(\'bf\').click()">بازیابی از فایل</button><input type="file" id="bf" accept=".json" style="display:none" onchange="rb(this)"><br><button class="g" onclick="$(\'bm\').click()">ادغام با پشتیبان دستگاه دیگر</button><input type="file" id="bm" accept=".json" style="display:none" onchange="mg(this)"><p class="mu">هفته‌ای یک‌بار پشتیبان بگیر؛ فروش‌ها فقط روی همین دستگاه است.</p>');
}
function mergeP(o){
 var key=function(x){return [x.t,x.dev,x.plan,x.paid,x.days,x.name||""].join("|")},seen={},add=0;
 P.sales.forEach(function(x){seen[key(x)]=1});
 (o.sales||[]).forEach(function(x){if(!seen[key(x)]){P.sales.push(x);seen[key(x)]=1;add++}});
 P.sales.sort(function(a,b){return a.t<b.t?-1:a.t>b.t?1:0});
 var ids={},np=0;P.plans.forEach(function(x){ids[x.id]=1});
 (o.plans||[]).forEach(function(x){if(!ids[x.id]){P.plans.push(x);np++}});
 var nums={},nc=0;P.mgr.cards.forEach(function(c){nums[c.num]=1});
 ((o.mgr||{}).cards||[]).forEach(function(c){if(!nums[c.num]&&P.mgr.cards.length<3){P.mgr.cards.push(c);nc++}});
 var oc=(o.mgr||{}).c||{};Object.keys(oc).forEach(function(k){if(!P.mgr.c[k])P.mgr.c[k]=oc[k]});
 if(!P.base&&o.base)P.base=o.base;if(!P.appUrl&&o.appUrl)P.appUrl=o.appUrl;
 sv();render();alert("ادغام شد: "+add+" فروش جدید، "+np+" پلن جدید، "+nc+" کارت جدید اضافه شد.");
}
function mg(el){var f=el.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);if(o.plans&&o.sales)mergeP(o);else alert("فایل معتبر نیست.")}catch(e){alert("فایل معتبر نیست.")}};r.readAsText(f);el.value=""}
function rb(el){var f=el.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);if(o.plans&&o.sales){if(!confirm("اطلاعات فعلی با فایل جایگزین شود؟"))return;P=o;P.mgr=P.mgr||{cards:[],c:{}};P.tpl=P.tpl||{};P.trial=P.trial||{on:false,days:7};sv();render()}else alert("فایل معتبر نیست.")}catch(e){alert("فایل معتبر نیست.")}};r.readAsText(f)}

/* ---------- درخت منو ---------- */
NAV.tree=[
 {k:"d",t:"داشبورد",ic:"🏠",v:aDash,ch:[{k:"intro",t:"معرفی برنامه به سالن‌ها",v:aIntro}]},
 {k:"s",t:"سالن‌ها",ic:"💇",ch:[{k:"code",t:"ساخت کد فعال‌سازی",v:aCode},{k:"reis",t:"صدور مجدد",v:aReis},{k:"list",t:"فهرست سالن‌ها",v:aSalons}]},
 {k:"a",t:"حسابداری",ic:"💰",ch:[{k:"plans",t:"پلن‌ها و قیمت",v:aPlans},{k:"sales",t:"فروش‌ها",v:aSales},{k:"rep",t:"گزارش ماهانه",v:aRep}]},
 {k:"p",t:"پشتیبانی",ic:"💬",ch:[{k:"ct",t:"راه‌های تماس",v:aContact},{k:"tpl",t:"پیام‌های آماده",v:aTpl}]},
 {k:"t",t:"تنظیمات",ic:"⚙️",ch:[{k:"key",t:"کلید امضا",v:aKey},{k:"cards",t:"کارت‌های بانکی مدیر",v:aCards},{k:"trial",t:"دوره‌ی رایگان",v:aTrial},{k:"pub",t:"انتشار plans.json",v:aPub},{k:"bk",t:"بکاپ و ادغام",v:aBk}]}
];
decorNav(NAV.tree,{"t/key":1,"t/cards":2,"t/trial":3,"t/pub":4,"a/plans":1,"a/sales":2,"a/rep":3},{
 "d":"خلاصه‌ی سالن‌ها و درآمد. «رو به پایان» را یادآوری کن.",
 "d/intro":"لینک عمومی برنامه را برای سالن‌ها بفرست.",
 "s/code":"کد ۸ رقمی دستگاه را از سالن بگیر، پلن را انتخاب کن و کد را بساز؛ بعد با دکمه‌ها بفرست.",
 "s/reis":"وقتی سالن گوشی عوض کرد، برای روزهای باقی‌مانده کد تازه بساز.",
 "s/list":"سالن‌ها بر اساس نزدیکی به پایان اشتراک. با «یادآوری» پیام تمدید بساز.",
 "a/plans":"اول قیمت پایه ۳۰ روزه، بعد پلن‌ها؛ تخفیف اختیاری است.",
 "a/sales":"همه‌ی کدهای صادرشده و مبلغ‌ها.",
 "a/rep":"فروش به تفکیک ماه شمسی.",
 "p/ct":"راه‌هایی که سالن‌ها برای پیام‌دادن به تو می‌بینند. بعد از تغییر، plans.json را دوباره منتشر کن.",
 "p/tpl":"متن آماده‌ی پیام‌ها برای سالن‌ها.",
 "t/key":"یک‌بار کلید بساز و پشتیبانش را جای امن نگه دار.",
 "t/cards":"کارتی که سالن‌ها برای پرداخت اشتراک می‌بینند.",
 "t/trial":"روشن و خاموش کردن دوره رایگان و تعداد روزش.",
 "t/pub":"بعد از هر تغییر در پلن‌ها، کارت‌ها، تماس یا دوره رایگان، plans.json را دانلود و جایگزین کن.",
 "t/bk":"هفته‌ای یک‌بار پشتیبان بگیر."
});
NAV.path=["d"];NAV.draw=function(){render()};
function render(){
 var nv=navHtml(),n=nv.last,body=n&&n.v?n.v():"";
 app.innerHTML='<div class="hd"><h1>ابزار مدیر</h1></div><p class="mu">این فایل را فقط روی گوشی یا کامپیوتر خودت نگه دار؛ آنلاین نگذار.</p>'+nv.nav+nv.menu+nv.tip+body;
 pvw();
}
render();
