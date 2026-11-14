/* پنل سالن + صفحه مشتری (نسخه ۳). داده‌ها فقط در مرورگر همین دستگاه (localStorage، کلید sal) می‌ماند. */
var app=$("app");
var DEF_MSG={
 ok:"سلام {name} عزیز\nنوبت شما برای «{service}» در {date} ساعت {time} تأیید شد.{addr}\n{salon}",
 rej:"سلام {name} عزیز\nمتأسفانه زمان درخواستی شما ({date} ساعت {time}) در دسترس نیست. لطفاً یک زمان دیگر از لینک رزرو انتخاب کنید.\n{salon}",
 rem:"سلام {name} عزیز\nیادآوری: نوبت «{service}» شما {date} ساعت {time} است.\n{salon}"
};
var THEMES=["#b4456b","#8e44ad","#2f6fb5","#1f8a5b","#c0392b","#d35400","#34495e","#00838f"];
var D={name:"",fn:"",ln:"",nick:"",addrs:[],phone:"",services:[],cards:[],links:[],days:{},dev:rnd8(),codes:[],trial:null,last:td(),used:[],
 ap:[],cu:[],cn:{},closed:[],msg:{},theme:"",hs:{from:"09:00",to:"18:00",step:60,n:14,wd:[1,1,1,1,1,1,0]}};
try{var s0=localStorage.getItem("sal");if(s0)D=Object.assign(D,JSON.parse(s0))}catch(e){}
D.msg=D.msg||{};D.hs=Object.assign({from:"09:00",to:"18:00",step:60,n:14,wd:[1,1,1,1,1,1,0]},D.hs||{});
function sv(){try{localStorage.setItem("sal",JSON.stringify(D))}catch(e){}}
var PL=null,PUB=null,MG={},SP=null,PV={},TR=null,IP=null,ST={exp:"",kind:""},PK=null,AM=null,CM=null,CV={},C0=null;
try{PUB=JSON.parse(localStorage.getItem("pub"))}catch(e){}
var mode="a",sel={s:null,d:null,t:null,pt:"dep"};
var hh=location.hash.slice(1);
if(hh.length>10){try{C0=dec(hh);mode="c"}catch(e){}}
if(D.last<td())D.last=td();
function dname(){return D.nick||((D.fn||"")+" "+(D.ln||"")).trim()}
if(dname()&&!D.fn&&!D.nick)D.nick=dname();
function msgT(k){return D.msg[k]||DEF_MSG[k]}
function setTheme(c){var s=document.documentElement.style;if(c){s.setProperty("--ac",c);s.setProperty("--acx","#fff");var m=document.querySelector('meta[name=theme-color]');if(m)m.content=c}else{s.removeProperty("--ac");s.removeProperty("--acx")}}
setTheme(mode==="c"?(C0&&C0.th):D.theme);

/* ================= اشتراک (امضای ECDSA؛ قالب کد با نسخه‌ی قبلی یکی است) ================= */
function eff(){return td()>D.last?td():D.last}
function left(){return ST.exp?dayLeft(eff(),ST.exp):0}
function actv(){return left()>0}
function pkey(){return PK?Promise.resolve(PK):crypto.subtle.importKey("jwk",PUB,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]).then(function(k){PK=k;return k})}
function vc(code){
 var c=String(code).split(".");if(c.length!==2||!PUB)return Promise.resolve(null);
 var raw,msg,sig;try{raw=u2b(c[0]);msg=new TextDecoder().decode(raw);sig=u2b(c[1])}catch(e){return Promise.resolve(null)}
 return pkey().then(function(k){return crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},k,sig,raw)}).then(function(ok){if(!ok)return null;var p=msg.split("|");if(!p[2]||p[2].length!==8)return null;return{who:p[0],days:+p[1],issue:p[2].slice(0,4)+"-"+p[2].slice(4,6)+"-"+p[2].slice(6,8)}}).catch(function(){return null})
}
function verifyAll(){
 return Promise.all([Promise.all(D.codes.map(vc)),D.trial?vc(D.trial.code):Promise.resolve(null)]).then(function(r){
  var es=r[0].filter(function(e){return e&&e.who===D.dev&&e.days>0}).sort(function(a,b){return a.issue<b.issue?-1:1}),cur="",tx="",t=r[1];
  es.forEach(function(e){var b=cur&&cur>e.issue?cur:e.issue;cur=addD(b,e.days)});
  if(t&&t.who==="T"&&t.days>0&&D.trial)tx=addD(D.trial.start,t.days);
  ST=(cur||tx)?(cur>=tx?{exp:cur,kind:"paid"}:{exp:tx,kind:"trial"}):{exp:"",kind:""};
 })
}
function loadPlans(){fetch("plans.json?"+Date.now()).then(function(r){return r.json()}).then(function(j){PL=j.plans||[];MG=j.mgr||{};TR=j.trial||null;if(j.pub&&!PUB){PUB=j.pub;try{localStorage.setItem("pub",JSON.stringify(PUB))}catch(e){}}A()}).catch(function(){PL=[];A()})}
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();IP=e});

/* ================= نوبت‌ها ================= */
function stName(s){return{new:"منتظر تأیید",ok:"تأییدشده",done:"انجام‌شده",rej:"رد/لغو"}[s]||s}
function apOf(f){
 var t=td();
 return D.ap.filter(function(a){
  if(f==="today")return a.date===t&&a.st!=="rej";
  if(f==="new")return a.st==="new";
  if(f==="ok")return a.st==="ok";
  if(f==="done")return a.st==="done";
  return true}).sort(function(a,b){return a.date===b.date?(a.time<b.time?-1:1):(a.date<b.date?-1:1)});
}
function cntNew(){return D.ap.filter(function(a){return a.st==="new"}).length}
function apRow(a){
 var b="";
 if(a.st==="new")b='<button class="ok2" onclick="apOk(\''+a.id+'\')">تأیید</button> <button class="d" onclick="apRej(\''+a.id+'\')">رد / زمان دیگر</button>';
 else if(a.st==="ok")b='<button onclick="apDone(\''+a.id+'\')">انجام شد</button> <button class="g" onclick="apMsg(\''+a.id+'\',\'rem\')">یادآوری</button> <button class="d" onclick="apCancel(\''+a.id+'\')">لغو نوبت</button>';
 else b='<button class="g" onclick="apMsg(\''+a.id+'\',\''+(a.st==="rej"?"rej":"ok")+'\')">پیام</button> <button class="d" onclick="apDel(\''+a.id+'\')">حذف</button>';
 var pay=a.amt?' · واریز '+fm(en(a.amt)*1||0):'';
 return '<div class="row" style="align-items:flex-start"><div><b>'+esc(a.name||"—")+'</b> · '+esc(a.sn)+' <span class="st-'+a.st+'">('+stName(a.st)+')</span><small>'+fd(a.date)+' · '+esc(a.time)+(a.phone?' · <span class="ltr">'+esc(a.phone)+'</span>':'')+pay+(a.pd?' · '+esc(a.pd)+' '+esc(a.ptm||""):'')+'</small><div class="ch" style="margin:4px 0">'+b+'</div></div></div>';
}
function msgBox(){
 if(!AM)return"";
 var a=D.ap.filter(function(x){return x.id===AM.id})[0];if(!a){AM=null;return""}
 var txt=fillMsg(a,AM.t);window._mtx=txt;window._mph=a.phone||"";
 return '<div class="c" style="border-color:var(--ac)"><h2>پیام برای '+esc(a.name||"مشتری")+'</h2><textarea id="mtx" rows="5" oninput="window._mtx=this.value">'+esc(txt)+'</textarea>'+(a.phone?'':'<p class="er">شماره موبایل مشتری ثبت نشده؛ از «کپی» استفاده کن.</p>')+shareBtns("window._mtx","window._mph")+'<button class="g" onclick="AM=null;A()">بستن</button></div>';
}
function fillMsg(a,t){
 var ad=(a.addr||[]).length?"\nآدرس: "+a.addr.join(" | "):"";
 return J.fill(msgT(t),{name:a.name||"",service:a.sn||"",date:fdw(a.date),time:a.time,salon:dname(),addr:ad});
}
function listFor(f,empty){
 var ls=apOf(f);
 return msgBox()+box("",ls.map(apRow).join("")||'<p class="mu">'+(empty||"موردی نیست.")+'</p>');
}
function apMsg(id,t){AM={id:id,t:t};A()}
function covers(a){return Math.max(1,a.min||0)}
function rmSlots(date,time,min){
 var L=D.days[date];if(!L)return;var st=D.hs.step||60,t0=J.hm(time),m=Math.max(1,min||0);
 D.days[date]=L.filter(function(x){var s=J.hm(x);return !(s<t0+m&&s+st>t0)});
 if(!D.days[date].length)delete D.days[date];
}
function addSlots(date,time,min){
 if(date<td()||D.closed.indexOf(date)>-1)return;
 var st=D.hs.step||60,t0=J.hm(time),m=Math.max(1,min||0),L=D.days[date]||[],s,end=t0+Math.ceil(m/st)*st;
 /* فقط اگر روز اصلاً ساعت‌کاری داشته یا قبلاً ساخته شده بود برگردان */
 if(!D.days[date]&&!D.hs.wd[J.wd(date)])return;
 for(s=t0;s<end;s+=st){var t=J.mm(s);if(L.indexOf(t)<0)L.push(t)}
 D.days[date]=L.sort();
}
function overlap(a){
 return D.ap.filter(function(x){return x.id!==a.id&&x.st==="ok"&&x.date===a.date&&J.hm(x.time)<J.hm(a.time)+covers(a)&&J.hm(a.time)<J.hm(x.time)+covers(x)})[0];
}
function apOk(id){
 var a=D.ap.filter(function(x){return x.id===id})[0];if(!a)return;
 var o=overlap(a);if(o&&!confirm("این زمان با نوبت «"+o.name+"» ("+o.time+") هم‌پوشانی دارد. باز هم تأیید شود؟"))return;
 a.st="ok";rmSlots(a.date,a.time,a.min);sv();AM={id:id,t:"ok"};A();
}
function apRej(id){var a=D.ap.filter(function(x){return x.id===id})[0];if(!a)return;a.st="rej";sv();AM={id:id,t:"rej"};A()}
function apDone(id){D.ap.forEach(function(a){if(a.id===id)a.st="done"});sv();A()}
function apCancel(id){if(!confirm("نوبت لغو شود و ساعتش دوباره خالی شود؟"))return;var a=D.ap.filter(function(x){return x.id===id})[0];if(!a)return;a.st="rej";addSlots(a.date,a.time,a.min);sv();AM={id:id,t:"rej"};A()}
function apDel(id){if(!confirm("حذف شود؟"))return;D.ap=D.ap.filter(function(a){return a.id!==id});sv();A()}
function svcByName(n,i){return D.services.filter(function(x){return x.id===i})[0]||D.services.filter(function(x){return x.n===n})[0]}
function newAp(o){
 var x=svcByName(o.sn,o.sid);
 var a={id:J.uid(),sid:x?x.id:"",sn:o.sn||(x?x.n:""),date:o.date,time:o.time,min:x?x.min:(o.min||0),name:o.name||"",phone:J.phone(o.phone||""),pt:o.pt||"",amt:o.amt||"",pd:o.pd||"",ptm:o.ptm||"",st:o.st||"new",src:o.src||"",created:td(),addr:o.addr||[]};
 if(x&&!a.addr.length)a.addr=(x.addrs||[]).map(function(i){return D.addrs[i]}).filter(Boolean).map(function(y){return(y.t?y.t+": ":"")+y.a});
 D.ap.push(a);return a;
}
/* خواندن پیام مشتری: اول کد SB1، وگرنه از روی خط‌های متن */
function parseReq(t){
 t=J.en(t);
 var m=t.match(/SB1:([A-Za-z0-9+\/=_-]+)/);
 if(m){try{var o=dec(m[1].replace(/-/g,"+").replace(/_/g,"/"));if(o&&o.d&&o.t)return{sn:o.s,sid:o.i,date:o.d,time:o.t,name:o.n,phone:o.p,pt:o.k,amt:o.a,pd:o.pd,ptm:o.pt}}catch(e){}}
 var g=function(k){var r=t.match(new RegExp(k+"\\s*[:：]\\s*(.+)"));return r?r[1].trim():""};
 if(!g("خدمت")||!g("ساعت"))return null;
 return{sn:g("خدمت"),date:"",time:g("ساعت"),name:g("نام"),phone:g("موبایل"),amt:g("واریز[^:：]*")};
}
function aptAdd(){
 var x=D.services.filter(function(s){return s.on}).map(function(s){return'<option value="'+s.id+'">'+esc(s.n)+'</option>'}).join("");
 return box("",'<h2>وارد کردن پیام مشتری</h2><textarea id="aptx" rows="4" placeholder="پیام درخواست نوبت را اینجا بچسبان"></textarea><button onclick="apPaste()">خواندن و افزودن به «منتظر تأیید»</button><p class="mu" id="apm"></p>')+
 box("",'<h2>ثبت دستی نوبت</h2><select id="ms">'+(x||'<option value="">اول خدمت ثبت کن</option>')+'</select><span class="mu">تاریخ</span>'+jd("md",td(),{empty:false})+'<div class="r"><input id="mt" type="time" value="10:00"><input id="mn" placeholder="نام مشتری"></div><input id="mp" class="ltr" inputmode="tel" placeholder="موبایل مشتری"><button onclick="apManual()">ثبت و تأیید</button>');
}
function apPaste(){
 var o=parseReq($("aptx").value),m=$("apm");
 if(!o){m.textContent="پیام شناخته نشد؛ از «ثبت دستی نوبت» استفاده کن.";return}
 if(!o.date){m.textContent="تاریخ در پیام نیست؛ از «ثبت دستی نوبت» استفاده کن.";return}
 if(D.ap.some(function(a){return a.date===o.date&&a.time===o.time&&J.phone(o.phone)===a.phone&&a.st!=="rej"})){m.textContent="این درخواست قبلاً ثبت شده.";return}
 o.src="msg";newAp(o);sv();go("d","ap","new");
}
function apManual(){
 var id=$("ms").value,x=D.services.filter(function(s){return s.id===id})[0],d=jv("md"),t=$("mt").value;
 if(!x||!d||!t){alert("خدمت، تاریخ و ساعت را کامل کن.");return}
 var a=newAp({sid:x.id,sn:x.n,date:d,time:t,name:$("mn").value.trim(),phone:$("mp").value,st:"ok",src:"manual"});
 var o=overlap(a);if(o&&!confirm("با نوبت «"+o.name+"» هم‌پوشانی دارد. ثبت شود؟")){D.ap.pop();return}
 rmSlots(d,t,a.min);sv();AM={id:a.id,t:"ok"};go("d","ap","ok");
}

/* ================= تقویم شمسی ================= */
function tCal(){
 var now=J.jOf(td());if(!CM)CM={y:now.y,m:now.m,sel:td()};
 var len=J.jLen(CM.y,CM.m),first=J.isoOfJ(CM.y,CM.m,1),off=J.wd(first),cells="",i;
 ["ش","ی","د","س","چ","پ","ج"].forEach(function(w){cells+='<div class="h">'+w+'</div>'});
 for(i=0;i<off;i++)cells+='<div></div>';
 for(i=1;i<=len;i++){
  var iso=J.isoOfJ(CM.y,CM.m,i),n=D.ap.filter(function(a){return a.date===iso&&(a.st==="ok"||a.st==="new")}).length,cl=D.closed.indexOf(iso)>-1;
  cells+='<button class="'+(iso===td()?'today ':'')+(iso===CM.sel?'sel ':'')+(cl?'off':'')+'" onclick="CM.sel=\''+iso+'\';A()">'+J.fa(i)+(n?'<i>'+J.fa(n)+' نوبت</i>':cl?'<i>تعطیل</i>':'')+'</button>';
 }
 var s=CM.sel,ls=D.ap.filter(function(a){return a.date===s&&a.st!=="rej"}).sort(function(a,b){return a.time<b.time?-1:1}),free=(D.days[s]||[]).length,cl=D.closed.indexOf(s)>-1;
 return box("",'<div class="r" style="align-items:center"><button class="g" onclick="cmv(-1)">‹ قبلی</button><b style="text-align:center">'+J.JM[CM.m-1]+' '+J.fa(CM.y)+'</b><button class="g" onclick="cmv(1)">بعدی ›</button></div><div class="cal" style="margin-top:8px">'+cells+'</div>')+
 msgBox()+box("",'<h2>'+fdw(s)+'</h2><p class="mu">'+(cl?'روز تعطیل است':'ساعت خالی: '+fn(free))+'</p>'+(ls.map(apRow).join("")||'<p class="mu">نوبتی نیست.</p>')+'<button class="g" onclick="'+(cl?"openDay":"closeDay")+'(\''+s+'\')">'+(cl?'باز کردن این روز':'تعطیل کردن این روز')+'</button>');
}
function cmv(n){CM.m+=n;if(CM.m>12){CM.m=1;CM.y++}if(CM.m<1){CM.m=12;CM.y--}A()}
function closeDay(d){
 var n=D.ap.filter(function(a){return a.date===d&&(a.st==="ok"||a.st==="new")}).length;
 if(n&&!confirm(n+" نوبت در این روز ثبت است. فقط ساعت‌های خالی بسته می‌شود؛ نوبت‌ها را خودت لغو کن. ادامه؟"))return;
 if(D.closed.indexOf(d)<0)D.closed.push(d);delete D.days[d];sv();A();
}
function openDay(d){D.closed=D.closed.filter(function(x){return x!==d});sv();A()}

/* ================= خدمات ================= */
function tSvList(){
 var ls=D.services.map(function(x){return '<div class="row"><div><b>'+esc(x.n)+'</b>'+(x.on?'':' <span class="er">(غیرفعال)</span>')+'<small>'+fm(x.price)+' · '+fn(x.min||0)+' دقیقه · بیعانه '+fm(x.dep||0)+(dtx(x)?' · '+dtx(x):'')+'</small></div><div><button class="g" onclick="eS(\''+x.id+'\')">ویرایش</button> <label class="mu"><input type="checkbox"'+(x.on?' checked':'')+' onchange="tgS(\''+x.id+'\')"> فعال</label> <button class="d" onclick="dS(\''+x.id+'\')">حذف</button></div></div>'}).join("")||'<p class="mu">خدمتی ثبت نشده.</p>';
 return box("",ls);
}
function tSvNew(){
 var f=F||{id:null,n:"",price:"",min:"",dep:"",note:"",dt:"none",dv:"",from:"",to:"",steps:[],cards:[],addrs:[],on:true};
 var st=f.steps.map(function(s,i){return '<div class="r"><input class="stp" value="'+esc(s)+'" placeholder="مرحله '+fn(i+1)+'"><button class="d" style="flex:0" onclick="rmSt('+i+')">✕</button></div>'}).join("");
 var cd=D.cards.map(function(c,i){return '<label class="mu"><input type="checkbox" class="cc" value="'+i+'"'+(f.cards.indexOf(i)>-1?' checked':'')+'> '+esc(c.b)+' · '+esc(c.num)+'</label><br>'}).join("")||'<span class="mu">اول در تنظیمات ← پرداخت از مشتری، کارت ثبت کن.</span>';
 return box("",'<h2>'+(f.id?'ویرایش خدمت':'ثبت خدمت')+'</h2><input id="sn" placeholder="عنوان خدمت" value="'+esc(f.n)+'"><div class="r"><input id="sp" inputmode="numeric" placeholder="مبلغ کل (ریال)" value="'+fv(f.price)+'" oninput="fi(this)"><input id="sm" inputmode="numeric" placeholder="زمان تقریبی (دقیقه)" value="'+(f.min||"")+'"></div><input id="sd" inputmode="numeric" placeholder="مبلغ بیعانه (ریال)" value="'+fv(f.dep)+'" oninput="fi(this)">'+
 '<h2 style="margin-top:8px">پلن کاری</h2>'+st+'<button class="g" onclick="adSt()">+ افزودن مرحله</button><textarea id="sx" rows="2" placeholder="توضیح تکمیلی (مثلاً حوله همراه داشته باشید)">'+esc(f.note)+'</textarea>'+
 '<h2>تخفیف</h2><div class="r"><select id="st"><option value="none">بدون تخفیف</option><option value="pct"'+(f.dt==="pct"?' selected':'')+'>درصدی</option><option value="fix"'+(f.dt==="fix"?' selected':'')+'>مبلغ ثابت (ریال)</option></select><input id="sv" inputmode="numeric" placeholder="مقدار (درصد یا ریال)" value="'+fv(f.dv)+'" oninput="fi(this)"></div><span class="mu">شروع تخفیف (اختیاری)</span>'+jd("sf",f.from)+'<span class="mu">پایان تخفیف (اختیاری)</span>'+jd("se",f.to)+
 '<h2 style="margin-top:8px">کارت‌های این خدمت</h2>'+cd+'<h2>آدرس‌های این خدمت</h2>'+adr(f)+'<button onclick="svS()">'+(f.id?'ذخیره تغییرات':'ثبت خدمت')+'</button>'+(f.id?' <button class="g" onclick="go(\'s\',\'sv\',\'svl\')">انصراف</button>':''));
}
function adr(f){return D.addrs.map(function(a,i){return '<label class="mu"><input type="checkbox" class="ca" value="'+i+'"'+((f.addrs||[]).indexOf(i)>-1?' checked':'')+'> '+esc(a.t||a.a.slice(0,30))+(a.on?'':' (غیرفعال)')+'</label><br>'}).join("")||'<span class="mu">اول در بخش آدرس‌ها آدرس ثبت کن.</span>'}
function rd(){return{id:F&&F.id,n:$("sn").value.trim(),price:nu("sp"),min:nu("sm"),dep:nu("sd"),note:$("sx").value,dt:$("st").value,dv:nu("sv"),from:jv("sf"),to:jv("se"),steps:[].map.call(document.querySelectorAll(".stp"),function(i){return i.value}),cards:[].filter.call(document.querySelectorAll(".cc"),function(i){return i.checked}).map(function(i){return+i.value}),addrs:[].filter.call(document.querySelectorAll(".ca"),function(i){return i.checked}).map(function(i){return+i.value}),on:F?F.on:true}}
function adSt(){F=rd();F.steps.push("");A()}
function rmSt(i){F=rd();F.steps.splice(i,1);A()}
function svS(){var o=rd();if(!o.n||!o.price){alert("عنوان و مبلغ کل را وارد کن.");return}o.steps=o.steps.filter(Boolean);
 if(o.id){D.services=D.services.map(function(x){return x.id===o.id?o:x})}else{o.id="s"+Date.now();D.services.push(o)}sv();go("s","sv","svl")}
function eS(i){F=JSON.parse(JSON.stringify(D.services.filter(function(x){return x.id===i})[0]));NAV.path=["s","sv","svn"];A();window.scrollTo(0,0)}
function tgS(i){D.services.forEach(function(x){if(x.id===i)x.on=!x.on});sv();A()}
function dS(i){if(confirm("حذف شود؟")){D.services=D.services.filter(function(x){return x.id!==i});sv();A()}}

/* ================= ساعت کاری ================= */
function tHrMake(){
 var h=D.hs,wd=J.WD.map(function(w,i){return '<label class="mu"><input type="checkbox" class="hw" value="'+i+'"'+(h.wd[i]?' checked':'')+'> '+w+'</label>'}).join(" ");
 return box("",'<div class="r"><div><span class="mu">شروع</span><input id="ha" type="time" value="'+h.from+'"></div><div><span class="mu">پایان</span><input id="hb" type="time" value="'+h.to+'"></div></div><div class="r"><div><span class="mu">فاصله‌ی ساعت‌ها (دقیقه)</span><input id="hs" inputmode="numeric" value="'+h.step+'"></div><div><span class="mu">برای چند روز آینده</span><input id="hdn" inputmode="numeric" value="'+h.n+'"></div></div><p class="mu">روزهای کاری:</p><div>'+wd+'</div><button onclick="gen()">ساخت ساعت‌ها</button><p class="mu">ساعت‌های روزهای ساخته‌شده جایگزین می‌شود؛ نوبت‌های تأییدشده و روزهای تعطیل دست‌نخورده می‌مانند. بعد از هر تغییر لینک مشتری را دوباره بفرست.</p>');
}
function gen(){
 var a=J.hm($("ha").value),b=J.hm($("hb").value),st=nu("hs")||60,n=Math.min(60,nu("hdn")||7),wd=[0,0,0,0,0,0,0];
 [].forEach.call(document.querySelectorAll(".hw"),function(c){wd[+c.value]=c.checked?1:0});
 if(b<=a||st<5){alert("ساعت پایان باید بعد از شروع باشد و فاصله حداقل ۵ دقیقه.");return}
 D.hs={from:$("ha").value,to:$("hb").value,step:st,n:n,wd:wd};
 var t=td(),now=new Date(),nm=now.getHours()*60+now.getMinutes(),i,m;
 Object.keys(D.days).forEach(function(d){if(d<t)delete D.days[d]});
 for(i=0;i<n;i++){
  var d=addD(t,i);delete D.days[d];
  if(!wd[J.wd(d)]||D.closed.indexOf(d)>-1)continue;
  var ts=[];for(m=a;m+st<=b;m+=st){if(d===t&&m<=nm)continue;ts.push(J.mm(m))}
  if(ts.length)D.days[d]=ts;
 }
 D.ap.forEach(function(x){if(x.st==="ok"&&x.date>=t)rmSlots(x.date,x.time,x.min)});
 sv();go("s","hr","hrl");
}
function tHrList(){
 var dk=Object.keys(D.days).filter(function(d){return d>=td()}).sort(),dv=dk.map(function(d){return '<div style="margin-bottom:6px"><b>'+fdw(d)+'</b> <button class="d" style="padding:2px 8px" onclick="closeDay(\''+d+'\')">تعطیل</button><div class="ch">'+D.days[d].map(function(t){return '<button onclick="clT(\''+d+'\',\''+t+'\')">'+t+' ✕</button>'}).join("")+'</div></div>'}).join("")||'<p class="mu">ساعتی ساخته نشده.</p>';
 return box("",dv+'<p class="mu">روی هر ساعت بزنی بسته می‌شود.</p>');
}
function clT(d,t){D.days[d]=D.days[d].filter(function(x){return x!==t});if(!D.days[d].length)delete D.days[d];sv();A()}
function tHrClosed(){
 var ls=D.closed.filter(function(d){return d>=td()}).sort().map(function(d){return '<div class="row"><b>'+fdw(d)+'</b><button class="g" onclick="openDay(\''+d+'\')">باز کردن</button></div>'}).join("")||'<p class="mu">روز تعطیلی ثبت نشده.</p>';
 return box("",ls+'<hr><span class="mu">افزودن روز تعطیل (مثلاً مسافرت یا مناسبت)</span>'+jd("cd",""," ")+'<button onclick="addCl()">افزودن تعطیلی</button>');
}
function addCl(){var d=jv("cd");if(!d){alert("تاریخ را انتخاب کن.");return}closeDay(d)}

/* ================= آدرس، لینک، کارت ================= */
function tAd(){
 var ls=D.addrs.map(function(a,i){return '<div class="row"><div><b>'+esc(a.t||"آدرس "+fn(i+1))+'</b>'+(a.on?'':' <span class="er">(غیرفعال)</span>')+'<small>'+esc(a.a)+'</small></div><div><label class="mu"><input type="checkbox"'+(a.on?' checked':'')+' onchange="D.addrs['+i+'].on=!D.addrs['+i+'].on;sv();A()"> فعال</label> <button class="d" onclick="dA('+i+')">حذف</button></div></div>'}).join("")||'<p class="mu">آدرسی ثبت نشده.</p>';
 return box("",ls+'<input id="at" placeholder="عنوان (مثلاً شعبه مرکزی) — اختیاری"><textarea id="aa" rows="2" placeholder="آدرس کامل"></textarea><button onclick="adA()">افزودن آدرس</button><p class="mu">بعد از ثبت، در ثبت هر خدمت انتخاب کن این خدمت در کدام آدرس‌ها انجام می‌شود.</p>');
}
function adA(){var a=$("aa").value.trim();if(!a){alert("آدرس را وارد کن.");return}D.addrs.push({t:$("at").value.trim(),a:a,on:true});sv();A()}
function dA(i){if(!confirm("حذف شود؟"))return;D.addrs.splice(i,1);D.services.forEach(function(x){x.addrs=(x.addrs||[]).filter(function(j){return j!==i}).map(function(j){return j>i?j-1:j})});sv();A()}
function dK(i){D.cards.splice(i,1);D.services.forEach(function(x){x.cards=(x.cards||[]).filter(function(j){return j!==i}).map(function(j){return j>i?j-1:j})});sv();A()}
function tK(){
 var ls=D.cards.map(function(c,i){return '<div class="row"><div><b>'+esc(c.h)+'</b> · '+esc(c.b)+'<small>'+esc(c.num)+(c.on?'':' (غیرفعال)')+'</small></div><div><label class="mu"><input type="checkbox"'+(c.on?' checked':'')+' onchange="D.cards['+i+'].on=!D.cards['+i+'].on;sv();A()"> فعال</label> <button class="d" onclick="dK('+i+')">حذف</button></div></div>'}).join("")||'<p class="mu">کارتی ثبت نشده.</p>';
 return box("",ls+(D.cards.length<3?'<input id="kh" placeholder="نام و نام خانوادگی صاحب کارت"><input id="kb" placeholder="نام بانک"><input id="kn" inputmode="numeric" placeholder="شماره کارت"><button onclick="adK()">افزودن کارت</button>':'')+'<p class="mu">تا ۳ کارت. در ثبت هر خدمت انتخاب می‌کنی کدام کارت‌ها نمایش داده شوند.</p>');
}
function adK(){var h=$("kh").value.trim(),b=$("kb").value.trim(),n=en($("kn").value);if(!h||!b||n.length<16){alert("همه فیلدها و شماره کارت ۱۶ رقمی را وارد کن.");return}D.cards.push({h:h,b:b,num:n.replace(/(\d{4})(?=\d)/g,"$1 "),on:true});sv();A()}
function tL(){
 var ls=D.links.map(function(l,i){return '<div class="row"><div><b>'+esc(l.t)+'</b> · '+plat(l.pl)+'<small class="ltr">'+esc(l.u)+'</small></div><button class="d" onclick="D.links.splice('+i+',1);sv();A()">حذف</button></div>'}).join("")||'<p class="mu">لینکی ثبت نشده.</p>';
 return box("",ls+'<input id="lt" placeholder="عنوان (مثلاً نمونه کار)"><select id="lp"><option value="rubika">روبیکا</option><option value="eitaa">ایتا</option><option value="wa">واتس‌اپ</option><option value="tg">تلگرام</option><option value="ig">اینستاگرام</option><option value="web">وب‌سایت</option></select><input id="lu" class="ltr" placeholder="لینک"><button onclick="adL()">افزودن لینک</button>');
}
function adL(){var t=$("lt").value.trim(),u=$("lu").value.trim();if(!t||!u){alert("عنوان و لینک را وارد کن.");return}if(!/^https?:\/\//.test(u))u="https://"+u;D.links.push({t:t,pl:$("lp").value,u:u});sv();A()}

/* ================= مشتری‌ها ================= */
function custs(){
 var m={};
 D.cu.forEach(function(c){var p=J.phone(c.phone)||c.name;m[p]={name:c.name,phone:J.phone(c.phone),n:0,last:"",paid:0}});
 D.ap.forEach(function(a){if(a.st==="rej")return;var p=a.phone||a.name;if(!p)return;var c=m[p]||(m[p]={name:a.name,phone:a.phone,n:0,last:"",paid:0});c.n++;if(a.date>c.last)c.last=a.date;if(!c.name)c.name=a.name});
 return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return a.last<b.last?1:-1});
}
function tCu(){
 var ls=custs().map(function(c){var nt=D.cn[c.phone]||"";return '<div class="row"><div><b>'+esc(c.name||"—")+'</b><small>'+(c.phone?'<span class="ltr">'+esc(c.phone)+'</span> · ':'')+fn(c.n)+' نوبت'+(c.last?' · آخرین: '+fd(c.last):'')+'</small>'+(nt?'<small>📝 '+esc(nt)+'</small>':'')+'</div><div><button class="g" onclick="cuNote(\''+esc(c.phone)+'\')">یادداشت</button>'+(c.phone?' <button class="g" onclick="location.href=\'tel:'+esc(c.phone)+'\'">تماس</button>':'')+'</div></div>'}).join("")||'<p class="mu">هنوز مشتری ثبت نشده. با اولین نوبت ساخته می‌شود.</p>';
 return box("",ls+'<hr><input id="cn1" placeholder="نام مشتری"><input id="cp1" class="ltr" inputmode="tel" placeholder="موبایل"><button onclick="cuAdd()">افزودن مشتری</button>');
}
function cuAdd(){var n=$("cn1").value.trim(),p=J.phone($("cp1").value);if(!n&&!p){alert("نام یا موبایل را وارد کن.");return}D.cu.push({name:n,phone:p});sv();A()}
function cuNote(p){var t=prompt("یادداشت درباره‌ی این مشتری:",D.cn[p]||"");if(t===null)return;D.cn[p]=t;sv();A()}

/* ================= داشبورد ================= */
function tDash(){
 var t=td(),wk=0,i,ap=D.ap;
 for(i=0;i<7;i++){var d=addD(t,i);wk+=ap.filter(function(a){return a.date===d&&(a.st==="ok"||a.st==="new")}).length}
 var tn=ap.filter(function(a){return a.date===t&&(a.st==="ok"||a.st==="done")}).length,nw=cntNew();
 var inc=ap.filter(function(a){return a.st==="done"||a.st==="ok"}).reduce(function(s,a){var x=svcByName(a.sn,a.sid);return s+(x&&a.date>=addD(t,-30)?fp(x):0)},0);
 var nx=ap.filter(function(a){return a.st==="ok"&&a.date>=t}).sort(function(a,b){return a.date===b.date?(a.time<b.time?-1:1):(a.date<b.date?-1:1)}).slice(0,5);
 return '<div class="stats">'+stat("نوبت امروز",fn(tn),"var(--ac)")+stat("منتظر تأیید",fn(nw),"var(--wn)")+stat("نوبت‌های ۷ روز آینده",fn(wk),"var(--in)")+stat("مشتری‌ها",fn(custs().length),"var(--ok)")+'</div>'+
 (nw?'<button class="ok2" style="width:100%" onclick="go(\'d\',\'ap\',\'new\')">'+fn(nw)+' درخواست منتظر تأیید است ←</button>':'')+
 box("",'<h2>نوبت‌های بعدی</h2>'+(nx.map(apRow).join("")||'<p class="mu">نوبت تأییدشده‌ای نیست.</p>'))+
 box("",'<p class="mu">درآمد تقریبی ۳۰ روز اخیر (بر اساس قیمت خدمت‌های تأییدشده/انجام‌شده)</p><b style="font-size:20px">'+fm(inc)+'</b>');
}

/* ================= لینک مشتری ================= */
function pub(){
 var days={};Object.keys(D.days).forEach(function(d){if(d>=td()&&D.closed.indexOf(d)<0)days[d]=D.days[d]});
 return{name:dname(),phone:D.phone,th:D.theme||"",st:D.hs.step||60,services:D.services.filter(function(x){return x.on}),cards:D.cards.map(function(c){return c.on?c:null}),addrs:D.addrs.map(function(c){return c.on?c:null}),links:D.links,days:days};
}
function lk(){return location.href.split("#")[0]+"#"+enc(pub())}
function tLk(){
 return box("",'<button onclick="mkL()">ساخت لینک و QR</button> <button class="g" onclick="preview()">پیش‌نمایش</button><div id="lo"></div><p class="mu">لینک عکسی از ساعت‌های خالی همین لحظه است. بعد از هر تأیید نوبت یا تغییر ساعت‌ها، دوباره بساز و بفرست.</p>');
}
function mkL(){var u=lk(),t=(dname()?dname()+": ":"")+"رزرو نوبت از این لینک:\n"+u,e=encodeURIComponent;
 window._lt=t;
 $("lo").innerHTML='<div class="ltr" style="max-height:60px;overflow:auto;margin:8px 0">'+esc(u)+'</div>'+shareBtns("window._lt","''")+'<div id="qr"></div><p class="mu" id="qm"></p><button class="g" onclick="dlq()">دانلود QR</button>';
 try{$("qr").innerHTML=qrSvg(u)}catch(x){$("qr").style.display="none";$("qm").textContent="اطلاعات برای QR زیاد است (خدمت یا ساعت زیاد)؛ لینک را به‌جای آن بفرست."}}
function dlq(){try{dl("salon-qr.svg",qrSvg(lk()),"image/svg+xml")}catch(e){alert("QR ساخته نشد.")}}
function preview(){mode="c";C0=pub();sel={s:null,d:null,t:null,pt:"dep"};C()}

/* ================= تنظیمات ================= */
function tPf(){
 return box("",'<div class="r"><input placeholder="نام" value="'+esc(D.fn)+'" oninput="D.fn=this.value;pf()"><input placeholder="نام خانوادگی" value="'+esc(D.ln)+'" oninput="D.ln=this.value;pf()"></div><input class="ltr" inputmode="tel" placeholder="شماره موبایل" value="'+esc(D.phone)+'" oninput="D.phone=this.value;pf()"><input placeholder="نام اختصاری (اختیاری): نام سالن یا هر کلمه‌ای" value="'+esc(D.nick)+'" oninput="D.nick=this.value;pf()"><p class="mu">اگر نام اختصاری بنویسی، همان بالای صفحه و در صفحه مشتری نمایش داده می‌شود؛ وگرنه نام و نام خانوادگی.</p>');
}
function pf(){sv();var e=$("hn");if(e)e.textContent=dname()||"پنل سالن"}
function tSt(){
 return box("",'<p class="mu">کد دستگاه (برای دریافت کد فعال‌سازی به مدیر بده)</p><p style="font-size:26px;letter-spacing:3px;margin:4px 0"><b>'+D.dev+'</b></p>'+(actv()?'<p class="ok"><b>● فعال'+(ST.kind==="trial"?" (رایگان)":"")+'</b></p><p>پایان: '+fdw(ST.exp)+' · '+fn(left())+' روز مانده</p>':'<p class="er"><b>غیرفعال</b></p>'))+(left()>0&&left()<=7?box("",'<p class="wn">اشتراک رو به پایان است؛ از بخش «پلن‌ها و پرداخت» تمدید کن.</p>'):"");
}
function tPl(){
 var x=SP&&(PL||[]).filter(function(p){return p.id===SP})[0],cs=MG.cards||[],c=MG.c||{};
 var pl=(PL||[]).map(function(p){var f=fp(p);return '<div class="row"><div><b>'+esc(p.n)+'</b><small>'+fn(p.days)+' روز'+(dtx(p)?' · '+dtx(p):'')+'</small></div><div style="text-align:center">'+(f<p.price?'<s class="mu">'+fm(p.price)+'</s><br>':'')+'<b>'+fm(f)+'</b><br><button class="'+(SP===p.id?'on':'')+'" onclick="selP(\''+p.id+'\')">انتخاب</button></div></div>'}).join("")||'<p class="mu">'+(PL?'پلنی در دسترس نیست.':'در حال دریافت پلن‌ها... (نیاز به اینترنت)')+'</p>';
 var ch=[["sms","پیامک"],["wa","واتس‌اپ"],["eitaa","ایتا"],["rubika","روبیکا"],["tg","تلگرام"]].filter(function(k){return c[k[0]]}).map(function(k,i){return '<button class="'+(i?'g':'')+'" onclick="sendP(\''+k[0]+'\')">ارسال با '+k[1]+'</button>'}).join("");
 var pay=x?box("",'<h2>پرداخت: '+esc(x.n)+'</h2><p>مبلغ قابل پرداخت: '+(fp(x)<x.price?'<s class="mu">'+fm(x.price)+'</s> ':'')+'<b>'+fm(fp(x))+'</b></p><p class="mu">مبلغ را کارت‌به‌کارت کن، سپس سه کادر پایین را پر کن.</p>'+
  (cs.map(function(k){return '<div class="row"><div><b>'+esc(k.h)+'</b> · '+esc(k.b)+'<small class="ltr">'+esc(k.num)+'</small></div><button class="g" onclick="cp(this)" data-t="'+esc(en(k.num))+'">کپی</button></div>'}).join("")||'<p class="er">مدیر هنوز کارتی ثبت نکرده.</p>')+
  '<div class="r"><input id="pa" inputmode="numeric" placeholder="مبلغ واریزی" value="'+esc(PV.pa||"")+'" oninput="fi(this);PV.pa=this.value"><input id="pd" placeholder="تاریخ واریز" value="'+esc(PV.pd||"")+'" oninput="PV.pd=this.value"><input id="ph2" placeholder="ساعت واریز" value="'+esc(PV.pt||"")+'" oninput="PV.pt=this.value"></div><p class="mu">کد دستگاه ('+D.dev+') خودکار همراه پیام ارسال می‌شود.</p><div class="ch">'+(ch||'<span class="er">مدیر راه تماسی تعریف نکرده.</span>')+'</div><p id="pm" class="mu"></p>'):'';
 var pend=D.pend?box("",'<h2 class="ok">درخواست ارسال شد</h2><p>پلن «'+esc(D.pend.plan)+'» · '+fm(D.pend.price)+'<br>منتظر تأیید مدیر و کد فعال‌سازی هستی. کد را در بخش «کد فعال‌سازی» وارد کن.</p><button class="g" onclick="D.pend=null;sv();A()">لغو / ارسال دوباره</button>'):'';
 return pend+box("",pl)+pay;
}
function selP(i){SP=i;A();window.scrollTo(0,document.body.scrollHeight/3)}
function sendP(t){
 var x=(PL||[]).filter(function(p){return p.id===SP})[0],m=$("pm"),c=MG.c||{};
 if(!x)return;
 if(!PV.pa||!PV.pd||!PV.pt){m.textContent="مبلغ، تاریخ و ساعت واریز را کامل کن.";return}
 var txt="درخواست اشتراک\nکد دستگاه: "+D.dev+"\nپلن: "+x.n+" ("+x.days+" روز)\nمبلغ پلن: "+fm(fp(x))+"\nمبلغ واریزی: "+PV.pa+"\nتاریخ واریز: "+PV.pd+"\nساعت واریز: "+PV.pt+(dname()?"\nسالن: "+dname():"");
 D.pend={plan:x.n,price:fp(x),t:td()};sv();
 if(t==="sms"||t==="wa")sendTo(t,txt,c[t]);
 else{try{navigator.clipboard.writeText(txt)}catch(x2){}alert("پیام کپی شد. در صفحه بعد آن را برای مدیر بچسبان و ارسال کن.");window.open(c[t])}
 A();
}
function tAc(){return box("",'<textarea id="ac" class="ltr" rows="3" placeholder="کد را اینجا بچسبان"></textarea><button onclick="act()">فعال‌سازی</button><p id="am" class="mu"></p>')}
function act(){
 var m=$("am"),code=$("ac").value.replace(/\s/g,"");
 if(!PUB){m.textContent="کلید عمومی در دسترس نیست. یک بار با اینترنت برنامه را از لینک اصلی باز کن.";return}
 if(D.codes.indexOf(code)>-1){m.textContent="این کد قبلاً استفاده شده.";return}
 vc(code).then(function(e){
  if(!e){m.textContent="کد جعلی یا اشتباه است.";return}
  if(e.who!==D.dev){m.textContent="این کد برای این دستگاه نیست.";return}
  if(addD(e.issue,e.days)<=eff()){m.textContent="این کد منقضی شده است.";return}
  if(dayLeft(e.issue,eff())>60){m.textContent="مهلت استفاده از این کد گذشته.";return}
  D.codes.push(code);D.pend=null;sv();return verifyAll().then(function(){go("t","sub","st")})
 })
}
function startTrial(){
 if(!TR||!TR.code||D.trial)return;
 vc(TR.code).then(function(e){if(!e||e.who!=="T"){alert("کد دوره رایگان معتبر نیست.");return}D.trial={start:eff(),code:TR.code};sv();return verifyAll().then(function(){go("t","sub","st")})})
}
function tTr(){
 if(D.trial)return box("",'<p class="mu">دوره رایگان این دستگاه استفاده شده است.</p>');
 if(!TR||!TR.code||!TR.days)return box("",'<p class="mu">'+(PL?'فعلاً دوره رایگان فعال نیست.':'در حال دریافت... (نیاز به اینترنت)')+'</p>');
 return box("",'<p>'+fn(TR.days)+' روز رایگان؛ فقط یک بار برای هر دستگاه.</p><button onclick="startTrial()">شروع دوره رایگان</button>');
}
function tMs(){
 var c=MG.c||{},ks=[["sms","پیامک"],["wa","واتس‌اپ"],["eitaa","ایتا"],["rubika","روبیکا"],["tg","تلگرام"]].filter(function(k){return c[k[0]]});
 window._ms=PV.ms||"";
 return box("",'<textarea id="msx" rows="4" placeholder="پیامت برای مدیر" oninput="window._ms=this.value;PV.ms=this.value">'+esc(PV.ms||"")+'</textarea><p class="mu">کد دستگاه ('+D.dev+') و نام سالن خودکار اضافه می‌شود.</p><div class="ch">'+(ks.map(function(k){return '<button class="g" onclick="msgAdm(\''+k[0]+'\')">'+k[1]+'</button>'}).join("")||'<span class="mu">'+(PL?'مدیر راه تماسی تعریف نکرده.':'در حال دریافت... (نیاز به اینترنت)')+'</span>')+'</div>');
}
function msgAdm(t){var c=MG.c||{},txt=(window._ms||"")+"\n\nکد دستگاه: "+D.dev+(dname()?"\nسالن: "+dname():"");if(t==="sms"||t==="wa")sendTo(t,txt,c[t]);else{try{navigator.clipboard.writeText(txt)}catch(x){}alert("پیام کپی شد. در صفحه بعد بچسبان.");window.open(c[t])}}
function tIns(){
 var u=location.href.split("#")[0];window._it="برنامه نوبت‌دهی سالن: "+u;
 return box("",'<h2>نصب روی گوشی</h2>'+(IP?'<button onclick="IP.prompt()">نصب برنامه</button>':'<p class="mu">اندروید (Chrome): منو ← Install app یا Add to Home screen.<br>آیفون (Safari): دکمه اشتراک‌گذاری ← Add to Home Screen.</p>'))+box("",'<h2>معرفی برنامه به دوستان</h2>'+shareBtns("window._it","''"));
}
function tBk(){return box("",'<p class="mu">اطلاعات فقط داخل مرورگر همین دستگاه است. هفته‌ای یک‌بار پشتیبان بگیر و فایل را در روبیکا یا ایتای خودت ذخیره کن.</p><button onclick="dl(\'salon-backup.json\',JSON.stringify(D))">دانلود پشتیبان</button> <button class="g" onclick="$(\'bf\').click()">بازیابی از فایل</button><input type="file" id="bf" accept=".json" style="display:none" onchange="rs(this)">')}
function rs(el){var f=el.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);["name","fn","ln","nick","phone","addrs","services","cards","links","days","ap","cu","cn","closed","msg","theme","hs"].forEach(function(k){if(o[k]!=null)D[k]=o[k]});if(o.dev===D.dev){if(o.codes)D.codes=o.codes;if(o.trial)D.trial=o.trial}sv();setTheme(D.theme);verifyAll().then(A)}catch(e){alert("فایل معتبر نیست.")}};r.readAsText(f)}
function tTx(){
 var ms=[["ok","پیام تأیید نوبت"],["rej","پیام رد / زمان دیگر"],["rem","پیام یادآوری"]].map(function(k){return '<span class="mu">'+k[1]+'</span><textarea rows="3" oninput="D.msg.'+k[0]+'=this.value;sv()">'+esc(msgT(k[0]))+'</textarea>'}).join("");
 return box("",ms+'<p class="mu">جای‌نگهدار: {name} نام مشتری، {service} خدمت، {date} تاریخ، {time} ساعت، {salon} نام سالن، {addr} آدرس.</p><button class="g" onclick="if(confirm(\'متن‌ها به حالت اول برگردد؟\')){D.msg={};sv();A()}">بازگشت به متن پیش‌فرض</button>')+
 box("",'<h2>رنگ برنامه</h2><div class="ch"><button class="g" onclick="D.theme=\'\';sv();setTheme(\'\');A()">پیش‌فرض</button>'+THEMES.map(function(c){return '<button style="background:'+c+';color:#fff;min-width:44px'+(D.theme===c?';outline:3px solid var(--tx)':'')+'" onclick="D.theme=\''+c+'\';sv();setTheme(\''+c+'\');A()">●</button>'}).join("")+'</div><p class="mu">رنگ انتخابی در صفحه مشتری هم دیده می‌شود (بعد از ساخت دوباره‌ی لینک).</p>');
}

/* ================= درخت منو (داده‌محور) ================= */
NAV.tree=[
 {k:"d",t:"داشبورد",ic:"🏠",v:tDash,ch:[
  {k:"ap",t:"نوبت‌ها",ic:"📅",badge:cntNew,ch:[
   {k:"today",t:"امروز",v:function(){return listFor("today","امروز نوبتی نیست.")}},
   {k:"new",t:"منتظر تأیید",badge:cntNew,v:function(){return listFor("new","درخواست جدیدی نیست.")}},
   {k:"ok",t:"تأییدشده",v:function(){return listFor("ok")}},
   {k:"done",t:"انجام‌شده",v:function(){return listFor("done")}},
   {k:"all",t:"همه",v:function(){return listFor("all")}},
   {k:"add",t:"ثبت نوبت جدید",v:aptAdd}]},
  {k:"lk",t:"لینک و QR مشتری",ic:"🔗",v:tLk},
  {k:"cal",t:"تقویم شمسی",ic:"🗓",v:tCal}]},
 {k:"s",t:"خدمات",ic:"💇",ch:[
  {k:"sv",t:"خدمات من",ch:[{k:"svl",t:"ثبت‌شده",v:tSvList},{k:"svn",t:"ثبت جدید",v:tSvNew}]},
  {k:"hr",t:"ساعت کاری",ch:[{k:"hrm",t:"ساخت ساعت‌ها",v:tHrMake},{k:"hrl",t:"ثبت‌شده",v:tHrList},{k:"hrc",t:"تعطیلی",v:tHrClosed}]},
  {k:"ad",t:"آدرس‌ها",v:tAd},
  {k:"ln",t:"لینک‌ها و کانال‌ها",v:tL},
  {k:"cu",t:"مشتری‌ها",v:tCu},
  {k:"pv",t:"دیدن صفحه‌ی مشتری",v:function(){return box("",'<p class="mu">صفحه‌ای که مشتری می‌بیند.</p><button onclick="preview()">باز کردن پیش‌نمایش</button>')}}]},
 {k:"t",t:"تنظیمات",ic:"⚙️",ch:[
  {k:"pf",t:"مشخصات",v:tPf},
  {k:"sub",t:"اشتراک",ch:[{k:"st",t:"وضعیت و کد دستگاه",v:tSt},{k:"pl",t:"پلن‌ها و پرداخت",v:tPl},{k:"ac",t:"کد فعال‌سازی",v:tAc},{k:"tr",t:"دوره‌ی رایگان",v:tTr}]},
  {k:"pay",t:"پرداخت از مشتری",v:tK},
  {k:"ms",t:"پیام به مدیر",v:tMs},
  {k:"ins",t:"نصب و معرفی برنامه",v:tIns},
  {k:"bk",t:"پشتیبان‌گیری",v:tBk},
  {k:"tx",t:"متن پیام‌ها و رنگ‌ها",v:tTx}]}
];
NAV.path=["d"];NAV.draw=function(){A()};
function head(){
 var st=actv()?'<span class="badge ok">● فعال'+(ST.kind==="trial"?" (رایگان)":"")+' · '+fn(left())+' روز</span>':'<span class="badge er">غیرفعال</span>';
 return '<div class="hd"><h1 id="hn">'+esc(dname()||"پنل سالن")+'</h1>'+st+'</div>';
}
function A(){
 var p=NAV.path,lock=!actv()&&!(p[0]==="t"&&(p[1]==="sub"||p[1]==="bk"));
 if(lock)NAV.path=["t","sub","st"];
 if(NAV.path[0]==="t"&&NAV.path[1]==="sub"&&!PL)loadPlans();
 if(NAV.path[1]==="ms"&&!PL)loadPlans();
 var nv=navHtml(),n=nv.last,body="";
 if(!actv()&&!D.trial&&!ST.exp)body='';
 body=n&&n.v?n.v():(n&&n.ch?'':'');
 var warn=!actv()?'<div class="c er">اشتراک فعال نیست. برای استفاده از بخش‌های دیگر، اشتراک را فعال کن (دوره رایگان، یا کد فعال‌سازی).</div>':"";
 app.innerHTML=head()+warn+nv.nav+(lock?'':nv.menu)+(lock?menuLocked():'')+body;
}
function menuLocked(){return '<div class="menu"><button class="mi" style="opacity:.9">'+'<span class="t">فقط اشتراک و پشتیبان‌گیری باز است</span></button></div>'+subMenu()}
function subMenu(){var sub=nfind(nfind(NAV.tree,"t").ch,"sub"),cur=NAV.path[2];return '<div class="menu lv1">'+sub.ch.map(function(c){return '<button class="mi'+(cur===c.k?' on':'')+'" onclick="go(\'t\',\'sub\',\''+c.k+'\')"><span class="t">'+c.t+'</span></button>'}).join("")+'</div>'}

/* ================= صفحه مشتری ================= */
function okSlot(d,t,x){
 var L=C0.days[d]||[],st=C0.st||60,need=Math.max(1,Math.ceil(((x&&x.min)||0)/st)),t0=J.hm(t),k;
 for(k=0;k<need;k++){if(L.indexOf(J.mm(t0+k*st))<0)return false}
 if(d===td()){var n=new Date();if(t0<=n.getHours()*60+n.getMinutes())return false}
 return true;
}
function adc(x){var a=(x.addrs||[]).map(function(i){return(C0.addrs||[])[i]}).filter(Boolean);return a.length?box("",'<h2>آدرس مراجعه</h2>'+a.map(function(y){return '<div class="row"><div>'+(y.t?'<b>'+esc(y.t)+'</b>':'')+'<small>'+esc(y.a)+'</small></div></div>'}).join("")):''}
function C(){
 var S=C0.services||[],dk=Object.keys(C0.days||{}).filter(function(d){return d>=td()}).sort(),x=sel.s!==null?S[sel.s]:null;
 if(x)dk=dk.filter(function(d){return C0.days[d].some(function(t){return okSlot(d,t,x)})});
 var cv=function(i){return CV[i]||""};
 var cd="";if(x){cd=(x.cards||[]).map(function(i){return(C0.cards||[])[i]}).filter(Boolean).map(function(c){return '<div class="row"><div><b>'+esc(c.h)+'</b> · '+esc(c.b)+'<small class="ltr">'+esc(c.num)+'</small></div><button class="g" onclick="cp(this)" data-t="'+esc(en(c.num))+'">کپی</button></div>'}).join("")}
 var tm=(x&&sel.d)?C0.days[sel.d].filter(function(t){return okSlot(sel.d,t,x)}):[];
 app.innerHTML=(location.hash.length<=10?'<button class="g" onclick="mode=\'a\';A()">← بازگشت به پنل</button>':'')+'<h1>'+esc(C0.name||"رزرو نوبت")+'</h1>'+
 (!S.length?box("","فعلاً خدمتی تعریف نشده."):
 box("",'<h2>۱. خدمت</h2><div class="ch">'+S.map(function(y,i){return '<button class="'+(sel.s===i?'on':'')+'" onclick="pk(\'s\','+i+')">'+esc(y.n)+'</button>'}).join("")+'</div>'+
 (x?'<p><b>'+fm(fp(x))+'</b>'+(fp(x)<x.price?' <s class="mu">'+fm(x.price)+'</s>':'')+' · '+fn(x.min||0)+' دقیقه · بیعانه '+fm(x.dep||0)+'</p>'+(dtx(x)?'<p class="ok">'+dtx(x)+'</p>':'')+(x.note?'<p class="mu">'+esc(x.note)+'</p>':'')+(x.steps&&x.steps.length?'<ol class="mu">'+x.steps.map(function(s){return '<li>'+esc(s)+'</li>'}).join("")+'</ol>':''):'')))+
 (x?adc(x):'')+(x?box("",'<h2>۲. روز و ساعت</h2>'+(dk.length?'<div class="ch">'+dk.map(function(d){return '<button class="'+(sel.d===d?'on':'')+'" onclick="pk(\'d\',\''+d+'\')">'+fd(d)+'</button>'}).join("")+'</div>':'<p class="er">فعلاً زمان خالی برای این خدمت نیست.</p>')+(sel.d?'<div class="ch">'+tm.map(function(t){return '<button class="'+(sel.t===t?'on':'')+'" onclick="pk(\'t\',\''+t+'\')">'+t+'</button>'}).join("")+'</div>':'')):'')+
 (x?box("",'<h2>۳. واریز</h2><div class="ch"><button class="'+(sel.pt==="dep"?'on':'')+'" onclick="pk(\'pt\',\'dep\')">بیعانه</button><button class="'+(sel.pt==="full"?'on':'')+'" onclick="pk(\'pt\',\'full\')">مبلغ کل</button></div><p>مبلغ: <b>'+fm(sel.pt==="dep"?(x.dep||0):fp(x))+'</b></p>'+(cd||'<p class="mu">کارتی نمایش داده نمی‌شود.</p>')+
 '<div class="r"><input id="pa" inputmode="numeric" placeholder="مبلغ واریزی" value="'+esc(cv("pa"))+'" oninput="fi(this);CV.pa=this.value"><input id="pd" placeholder="تاریخ واریز" value="'+esc(cv("pd"))+'" oninput="CV.pd=this.value"><input id="pt" placeholder="ساعت واریز" value="'+esc(cv("pt"))+'" oninput="CV.pt=this.value"></div>'):'')+
 (x?box("",'<h2>۴. مشخصات شما</h2><input id="cn" placeholder="نام شما" value="'+esc(cv("cn"))+'" oninput="CV.cn=this.value"><input id="cp" inputmode="tel" class="ltr" placeholder="موبایل شما" value="'+esc(cv("cp"))+'" oninput="CV.cp=this.value"><div class="ch"><button onclick="snd(\'sms\')">ارسال با پیامک</button><button onclick="snd(\'wa\')">واتس‌اپ</button><button class="g" onclick="snd(\'ei\')">ایتا</button><button class="g" onclick="snd(\'cp\')">کپی (روبیکا)</button></div><p class="mu" id="sm"></p><p class="mu">بعد از ارسال، منتظر تأیید نهایی سالن بمان.</p>'):'')+
 ((C0.links||[]).length?box("",'<h2>ما را دنبال کنید</h2>'+C0.links.map(function(l){return '<div class="row"><div><b>'+esc(l.t)+'</b><small>'+plat(l.pl)+'</small></div><button class="g" onclick="window.open(\''+esc(l.u)+'\',\'_blank\')">عضویت / مشاهده</button></div>'}).join("")):'');
}
function pk(k,v){sel[k]=v;if(k==="s"){sel.pt="dep";sel.d=null;sel.t=null}if(k==="d")sel.t=null;C()}
function snd(t){
 var x=sel.s!==null?C0.services[sel.s]:null,m=$("sm");
 if(!x||!sel.d||!sel.t||!CV.cn||!CV.cp){m.textContent="خدمت، روز، ساعت، نام و موبایل را کامل کن.";return}
 var ph=J.phone(CV.cp);if(!J.phoneOk(ph)){m.textContent="شماره موبایل درست نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹).";return}
 var pl={s:x.n,i:x.id,d:sel.d,t:sel.t,n:CV.cn,p:ph,k:sel.pt,a:CV.pa||"",pd:CV.pd||"",pt:CV.pt||""};
 var txt="درخواست نوبت\nخدمت: "+x.n+"\nتاریخ: "+fdw(sel.d)+"\nساعت: "+sel.t+"\nنام: "+CV.cn+"\nموبایل: "+ph+"\nواریز ("+(sel.pt==="dep"?"بیعانه":"مبلغ کل")+"): "+(CV.pa||"—")+"\nتاریخ واریز: "+(CV.pd||"—")+"\nساعت واریز: "+(CV.pt||"—")+"\n\nSB1:"+enc(pl).replace(/\+/g,"-").replace(/\//g,"_");
 var sp=(C0.phone||"").replace(/\D/g,"");
 if(t==="sms"||t==="wa")sendTo(t,txt,sp);else sendTo(t==="ei"?"ei":"cp",txt,sp,m);
}

/* ================= شروع ================= */
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();IP=e});
if(mode==="c")C();else{sv();A();if(PUB)verifyAll().then(A)}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js")}catch(e){}
