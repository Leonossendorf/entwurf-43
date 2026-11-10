(function(){
  var root=document.documentElement;
  var KEY='mh-a11y';
  var st={};
  try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}

  /* Barrierefreiheit */
  var knopf=document.querySelector('.a11y-knopf'), panel=document.getElementById('a11y-panel');
  if(knopf&&panel){
    knopf.addEventListener('click',function(){
      var auf=knopf.getAttribute('aria-expanded')==='true';
      knopf.setAttribute('aria-expanded',String(!auf)); panel.hidden=auf;
      if(!auf){var b=panel.querySelector('button');if(b)b.focus();}
    });
    panel.querySelector('.a11y-zu').addEventListener('click',function(){knopf.setAttribute('aria-expanded','false');panel.hidden=true;knopf.focus();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){knopf.setAttribute('aria-expanded','false');panel.hidden=true;knopf.focus();}});
    var sizeBtns=panel.querySelectorAll('[data-size]');
    function setSize(v){root.classList.remove('fs-1','fs-2');if(v)root.classList.add('fs-'+v);st.size=v||'';save();
      sizeBtns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.size===(v||'')))});}
    sizeBtns.forEach(function(b){b.addEventListener('click',function(){setSize(b.dataset.size)})});
    setSize(st.size||'');
    var map={contrast:'hc',spacing:'ls',motion:'nomotion'};
    panel.querySelectorAll('[data-toggle]').forEach(function(b){
      var k=b.dataset.toggle; b.setAttribute('aria-pressed',String(!!st[k]));
      b.addEventListener('click',function(){st[k]=!st[k];root.classList.toggle(map[k],!!st[k]);b.setAttribute('aria-pressed',String(!!st[k]));save();});
    });
    var vor=document.getElementById('vorlesen');
    if(vor){
      if(!('speechSynthesis' in window)){vor.hidden=true}
      vor.addEventListener('click',function(){
        var s=window.speechSynthesis;
        if(s.speaking){s.cancel();vor.setAttribute('aria-pressed','false');vor.textContent='Seite vorlesen';return;}
        var main=document.querySelector('main');
        var txt=Array.prototype.map.call(main.querySelectorAll('h1,h2,h3,p,li'),function(n){return n.innerText}).join('. ');
        var u=new SpeechSynthesisUtterance(txt); u.lang='de-DE'; u.rate=.95;
        u.onend=function(){vor.setAttribute('aria-pressed','false');vor.textContent='Seite vorlesen'};
        s.speak(u); vor.setAttribute('aria-pressed','true'); vor.textContent='Vorlesen stoppen';
      });
    }
  }

  /* Einblenden */
  var els=document.querySelectorAll('.zeige');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('ist-da');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el)});
  } else els.forEach(function(el){el.classList.add('ist-da')});

  /* Formular */
  var form=document.getElementById('formular');
  if(!form)return;
  var zweige=form.querySelectorAll('.zweig');
  function zeigeZweig(w){zweige.forEach(function(z){z.hidden=z.dataset.zweig!==w})}
  form.querySelectorAll('input[name=weiche]').forEach(function(r){r.addEventListener('change',function(){zeigeZweig(r.value)})});

  document.querySelectorAll('[data-weiche]').forEach(function(a){
    a.addEventListener('click',function(){
      var w=a.dataset.weiche, wahl=a.dataset.wahl;
      var r=form.querySelector('input[name=weiche][value="'+w+'"]'); if(r){r.checked=true;zeigeZweig(w)}
      if(wahl){
        var feldName={wohnen:'angebot',bewerbung:'stelle',ehrenamt:'interesse'}[w];
        var inp=form.querySelector('input[name="'+feldName+'"][value="'+wahl+'"]');
        if(inp){ if(inp.type==='checkbox'){form.querySelectorAll('input[name="'+feldName+'"]').forEach(function(c){c.checked=false})} inp.checked=true; }
      }
      setTimeout(function(){var f=form.querySelector('input[name=weiche]:checked');if(f)f.focus({preventScroll:true})},500);
    });
  });

  var danke=document.getElementById('danke'), fehler=document.getElementById('fehler');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var tel=form.tel.value.trim(), mail=form.mail.value.trim();
    if(!tel&&!mail){fehler.hidden=false;form.tel.closest('.feld').classList.add('ist-fehler');form.mail.closest('.feld').classList.add('ist-fehler');form.tel.focus();return;}
    fehler.hidden=true;form.querySelectorAll('.ist-fehler').forEach(function(f){f.classList.remove('ist-fehler')});
    var w=form.querySelector('input[name=weiche]:checked').value;
    var weg=tel?'Wir rufen Sie unter '+tel+' zurück':'Wir antworten Ihnen an '+mail;
    var text={
      wohnen:'In der fertigen Website ginge Ihre Anfrage direkt an Heimleiter Rüdiger Böckenfeld. '+weg+'.',
      bewerbung:'In der fertigen Website ginge Ihre Bewerbung direkt an jobs@marienheim-wettringen.de, Sie bekämen sofort eine Eingangsbestätigung. '+weg+'.',
      ehrenamt:'In der fertigen Website ginge Ihre Nachricht direkt an Ehrenamtskoordinator Klaus Altehenger. '+weg+'.',
      anderes:'In der fertigen Website ginge Ihre Nachricht an info@marienheim-wettringen.de. '+weg+'.'
    }[w];
    document.getElementById('danke-text').textContent=text;
    form.hidden=true; danke.hidden=false; danke.focus();
  });
  document.getElementById('nochmal').addEventListener('click',function(){form.reset();zeigeZweig('wohnen');danke.hidden=true;form.hidden=false;form.querySelector('input[name=weiche]').focus();});
})();
