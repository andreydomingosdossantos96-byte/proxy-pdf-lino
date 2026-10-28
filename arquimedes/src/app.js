(function(){
'use strict';
var WA='5569992484874';
var d=document,root=d.documentElement;
function $(s,c){return (c||d).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function lerp(a,b,t){return a+(b-a)*t}
function waUrl(m){return 'https://wa.me/'+WA+(m?'?text='+encodeURIComponent(m):'')}
function track(n,p){try{var o={event:n};for(var k in (p||{}))o[k]=p[k];(window.dataLayer=window.dataLayer||[]).push(o)}catch(e){}}
var mqRM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)');
var RM=!!(mqRM&&mqRM.matches);
var FINE=!!(window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches);
var hdr=$('#hdr'),vid=$('.hero-video'),hero=$('#inicio');

/* ---------- vídeo: respeita movimento reduzido e pausa fora da tela ---------- */
(function(){
  if(!vid)return;
  function sync(){ if(mqRM&&mqRM.matches){vid.pause()}else{var p=vid.play();if(p&&p.catch)p.catch(function(){})} }
  sync();
  if(mqRM){mqRM.addEventListener?mqRM.addEventListener('change',sync):mqRM.addListener(sync)}
  if('IntersectionObserver' in window&&hero){
    new IntersectionObserver(function(es){
      if(mqRM&&mqRM.matches)return;
      if(es[0].isIntersecting){var p=vid.play();if(p&&p.catch)p.catch(function(){})}else{vid.pause()}
    },{threshold:0}).observe(hero);
  }
})();

/* ---------- links de WhatsApp ---------- */
$$('[data-wa]').forEach(function(a){
  a.href=waUrl(a.getAttribute('data-wa'));a.target='_blank';a.rel='noopener';
  a.addEventListener('click',function(){track('whatsapp_click',{origem:a.getAttribute('data-from')||''})});
});

/* ---------- títulos: separa em palavras para a revelação ---------- */
function splitNode(node,c){
  Array.prototype.slice.call(node.childNodes).forEach(function(n){
    if(n.nodeType===3){
      var frag=d.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function(p){
        if(!p)return;
        if(/^\s+$/.test(p)){frag.appendChild(d.createTextNode(' '));return}
        var w=d.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');
        var i=d.createElement('span');i.className='wi';i.style.setProperty('--i',c.n++);i.textContent=p;
        w.appendChild(i);frag.appendChild(w);
      });
      node.replaceChild(frag,n);
    }else if(n.nodeType===1){splitNode(n,c)}
  });
}
$$('[data-split]').forEach(function(h){
  try{ if(!RM){h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());splitNode(h,{n:0})} }catch(e){}
  h.classList.add('sp');
});

/* ---------- revelação no scroll ---------- */
(function(){
  var els=$$('[data-r],[data-split],.eyebrow');
  if(RM||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(e){io.observe(e)});
})();

/* ---------- palavra que gira no título ---------- */
(function(){
  var rot=$('#rot');if(!rot)return;
  var ws=$$('.rw',rot);if(ws.length<2)return;
  var i=0,widths=[];
  function measure(){widths=ws.map(function(w){return w.getBoundingClientRect().width});rot.style.width=widths[i]+'px'}
  rot.style.transition='none';measure();rot.offsetWidth;rot.style.transition='';
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){rot.style.transition='none';measure();rot.offsetWidth;rot.style.transition=''});
  window.addEventListener('resize',function(){rot.style.transition='none';measure();rot.offsetWidth;rot.style.transition=''});
  if(RM)return;
  setInterval(function(){
    if(d.hidden)return;
    var cur=ws[i],n=(i+1)%ws.length,nx=ws[n];
    cur.classList.remove('on');cur.classList.add('out');
    nx.classList.add('on');rot.style.width=widths[n]+'px';i=n;
    setTimeout(function(){cur.style.transition='none';cur.classList.remove('out');cur.offsetWidth;cur.style.transition=''},900);
  },2700);
})();

/* ---------- brilho que segue o cursor (hero) e nos cards ---------- */
if(FINE){
  d.addEventListener('pointermove',function(e){
    var t=e.target.closest&&e.target.closest('[data-spot]');
    if(t){var r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')}
  },{passive:true});
  if(hero&&!RM){
    var tx=50,ty=46,cx=50,cy=46,raf=0;
    var step=function(){
      cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
      hero.style.setProperty('--hx',cx.toFixed(2)+'%');hero.style.setProperty('--hy',cy.toFixed(2)+'%');
      raf=(Math.abs(tx-cx)+Math.abs(ty-cy)>.1)?requestAnimationFrame(step):0;
    };
    hero.addEventListener('pointermove',function(e){
      var r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*100;ty=(e.clientY-r.top)/r.height*100;
      if(!raf)raf=requestAnimationFrame(step);
    },{passive:true});
  }
  /* botões magnéticos */
  if(!RM)$$('[data-mag]').forEach(function(el){
    el.addEventListener('pointermove',function(e){
      var r=el.getBoundingClientRect();
      el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px)';
    });
    el.addEventListener('pointerleave',function(){el.style.transform=''});
  });
  /* retrato inclina de leve */
  var po=$('#portrait');
  if(po&&!RM){
    po.addEventListener('pointermove',function(e){
      var r=po.getBoundingClientRect();
      po.style.setProperty('--tx',((e.clientX-r.left-r.width/2)/r.width*16).toFixed(1)+'px');
      po.style.setProperty('--ty',((e.clientY-r.top-r.height/2)/r.height*16).toFixed(1)+'px');
    });
    po.addEventListener('pointerleave',function(){po.style.setProperty('--tx','0px');po.style.setProperty('--ty','0px')});
  }
}

/* ---------- scroll: progresso, cabeçalho, parallax, linha do método, alavanca ---------- */
(function(){
  var prog=$('.progress'),heroIn=$('#heroIn'),tl=$('#tl'),steps=$$('.step'),lever=$('#lever'),ticking=false;
  function frame(){
    ticking=false;
    var y=window.pageYOffset||root.scrollTop,vh=window.innerHeight,max=root.scrollHeight-vh;
    prog.style.setProperty('--sp',max>0?(y/max).toFixed(4):'0');
    hdr.classList.toggle('stuck',y>30);
    if(!RM&&y<vh*1.4&&vid&&heroIn){
      vid.style.setProperty('--py',(y*.3).toFixed(1)+'px');
      vid.style.setProperty('--ps',(1.02+y/vh*.06).toFixed(4));
      heroIn.style.opacity=clamp(1-y/(vh*.8),0,1).toFixed(3);
      heroIn.style.transform='translate3d(0,'+(y*.14).toFixed(1)+'px,0)';
    }
    if(tl){
      var r=tl.getBoundingClientRect();
      tl.style.setProperty('--p',clamp((vh*.62-r.top)/r.height,0,1).toFixed(4));
      steps.forEach(function(s){s.classList.toggle('on',s.getBoundingClientRect().top<vh*.62)});
    }
    if(lever){
      var lr=lever.getBoundingClientRect();
      lever.style.setProperty('--ang',(8-19*clamp((vh-lr.top)/(vh+lr.height),0,1)).toFixed(2)+'deg');   // o clique desce a ponta longa e o globo sobe
    }
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req);frame();
})();

/* ---------- link ativo no menu ---------- */
(function(){
  if(!('IntersectionObserver' in window))return;
  var links=$$('.nav a.lk');
  var so=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting)links.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id)});
  })},{rootMargin:'-45% 0px -50% 0px'});
  ['inicio','servicos','metodo','arquimedes','incluso','perguntas','contato'].forEach(function(id){var s=d.getElementById(id);if(s)so.observe(s)});
})();

/* ---------- polígono de Arquimedes: 6 → 96 lados, o π fica cercado ---------- */
(function(){
  var pin=$('#pIn'),pout=$('#pOut'),eN=$('#pN'),eLo=$('#pLo'),eHi=$('#pHi');
  if(!pin||!pout)return;
  var R=84,N=96,seq=[6,12,24,48,96];
  function vert(i,n,out){var th=2*Math.PI*i/n-Math.PI/2;if(out){th+=Math.PI/n;var r=R/Math.cos(Math.PI/n);return [r*Math.cos(th),r*Math.sin(th)]}return [R*Math.cos(th),R*Math.sin(th)]}
  function arr(n,out){var o=[];for(var i=0;i<N;i++){var t=i*n/N,j=Math.floor(t),f=t-j,a=vert(j,n,out),b=vert(j+1,n,out);o.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f])}return o}
  function pathOf(p){var s='M';for(var i=0;i<p.length;i++)s+=(i?'L':'')+p[i][0].toFixed(2)+' '+p[i][1].toFixed(2);return s+'Z'}
  function fmt(x){return x.toFixed(4).replace('.',',')}
  function lo(n){return n*Math.sin(Math.PI/n)}
  function hi(n){return n*Math.tan(Math.PI/n)}
  function snap(n){return {i:arr(n,false),o:arr(n,true),n:n,lo:lo(n),hi:hi(n)}}
  function render(s){pin.setAttribute('d',pathOf(s.i));pout.setAttribute('d',pathOf(s.o));eN.textContent=Math.round(s.n);eLo.textContent=fmt(s.lo);eHi.textContent=fmt(s.hi)}
  if(RM){render(snap(96));return}
  var disp=snap(6),A=disp,B=disp,idx=0,state='hold',until=0,ts=0,dur=1000,vis=false,raf=0;
  render(disp);
  function tick(now){
    if(!vis){raf=0;return}
    if(!until)until=now+700;
    if(state==='hold'&&now>=until){
      idx=(idx+1)%seq.length;A={i:disp.i.slice(),o:disp.o.slice(),n:disp.n,lo:disp.lo,hi:disp.hi};B=snap(seq[idx]);ts=now;dur=idx===0?900:1050;state='morph';
    }
    if(state==='morph'){
      var t=clamp((now-ts)/dur,0,1),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      for(var q=0;q<N;q++){
        disp.i[q]=[lerp(A.i[q][0],B.i[q][0],e),lerp(A.i[q][1],B.i[q][1],e)];
        disp.o[q]=[lerp(A.o[q][0],B.o[q][0],e),lerp(A.o[q][1],B.o[q][1],e)];
      }
      disp.n=lerp(A.n,B.n,e);disp.lo=lerp(A.lo,B.lo,e);disp.hi=lerp(A.hi,B.hi,e);render(disp);
      if(t>=1){state='hold';until=now+(idx===seq.length-1?2800:1000)}
    }
    raf=requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!raf)raf=requestAnimationFrame(tick)},{threshold:.2}).observe(pin.ownerSVGElement);
  }else{render(snap(96))}
})();

/* ---------- perguntas ---------- */
$$('.faq-q').forEach(function(b){
  b.addEventListener('click',function(){
    var it=b.parentNode,open=!it.classList.contains('open');
    it.classList.toggle('open',open);b.setAttribute('aria-expanded',open?'true':'false');
  });
});

/* ---------- menu no celular ---------- */
(function(){
  var burger=$('#burger');if(!burger)return;
  function setMenu(o){hdr.classList.toggle('open',o);burger.setAttribute('aria-expanded',o?'true':'false');burger.setAttribute('aria-label',o?'Fechar menu':'Abrir menu');d.body.classList.toggle('lock',o)}
  burger.addEventListener('click',function(){setMenu(!hdr.classList.contains('open'))});
  $$('#nav a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
  window.addEventListener('resize',function(){if(window.innerWidth>900)setMenu(false)});
})();

/* ---------- "Quero isso" escolhe o serviço no formulário ---------- */
$$('[data-service]').forEach(function(a){
  a.addEventListener('click',function(){
    var v=a.getAttribute('data-service'),sel=$('#tipo');
    if(sel)sel.value=v;
    track('service_select',{servico:v});
    setTimeout(function(){var n=$('#nome');if(n&&!RM)n.focus({preventScroll:true})},900);
  });
});

/* ---------- formulário: valida e abre o WhatsApp com a mensagem pronta ---------- */
(function(){
  var form=$('#form');if(!form)return;
  var sent=$('#sent');
  function digits(s){return s.replace(/\D/g,'')}
  function mask(v){
    v=digits(v).slice(0,11);
    if(v.length>6){var cut=v.length>10?7:6;return '('+v.slice(0,2)+') '+v.slice(2,cut)+'-'+v.slice(cut)}
    if(v.length>2)return '('+v.slice(0,2)+') '+v.slice(2);
    return v;
  }
  function bad(id,on){var f=$('#f-'+id);f.classList.toggle('bad',on);var i=$('#'+id);i.setAttribute('aria-invalid',on?'true':'false');if(on){f.classList.remove('bad');f.offsetWidth;f.classList.add('bad')}}
  form.fone.addEventListener('input',function(){form.fone.value=mask(form.fone.value);$('#f-fone').classList.remove('bad')});
  form.nome.addEventListener('input',function(){$('#f-nome').classList.remove('bad')});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var nome=form.nome.value.trim(),fone=form.fone.value;
    var badNome=nome.length<2,badFone=digits(fone).length<10;
    bad('nome',badNome);bad('fone',badFone);
    if(badNome){form.nome.focus();return}
    if(badFone){form.fone.focus();return}
    var tipo=form.tipo.value,ideia=form.ideia.value.trim();
    var msg='Olá! Meu nome é '+nome+'.\nQuero um orçamento de: '+tipo+'.'+(ideia?'\n\n'+ideia:'')+'\n\nMeu WhatsApp: '+fone;
    var url=waUrl(msg);
    track('form_submit',{servico:tipo});
    window.open(url,'_blank','noopener');
    $('#sentLink').href=url;sent.classList.add('show');form.reset();
  });
  $('#sentClose').addEventListener('click',function(){sent.classList.remove('show');form.nome.focus()});
})();

var y=$('#year');if(y)y.textContent=new Date().getFullYear();
})();
