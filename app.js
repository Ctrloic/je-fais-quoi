/* Je fais quoi ? — appli de tirage au sort, données gardées sur le téléphone (IndexedDB). */
(function(){
  "use strict";
  var J = window.JFQ, ART = J.ART, INK = '#221A33';
  var PALETTE = ['#3E7CB1','#8C2F39','#F2C230','#E4572E','#E86A92','#F08A24','#D7263D','#4A7C6B','#EDE7DA','#2B4162','#7A4EAB',
                 '#238276','#5E6B7D','#5C2751','#C7D0D9','#A1C349','#5BC0EB','#2A7F39','#B08D57','#3346A8','#C2477A','#0FA3B1'];

  /* ---------- Helpers ---------- */
  var $ = function(id){ return document.getElementById(id); };
  function lum(hex){ var n=parseInt(hex.slice(1),16); var c=[(n>>16)&255,(n>>8)&255,n&255].map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);}); return .2126*c[0]+.7152*c[1]+.0722*c[2]; }
  var INK_L = lum(INK);
  function inkFor(hex){ var L=lum(hex); return (1.05/(L+.05)) >= ((L+.05)/(INK_L+.05)) ? '#FFFFFF' : INK; }
  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function rand(){ try{ var a=new Uint32Array(1); crypto.getRandomValues(a); return a[0]/4294967296; }catch(e){ return Math.random(); } }
  function randInt(n){ return Math.floor(rand()*n); }
  function shortLabel(t){ t=String(t||'').trim(); return t.length>16 ? t.slice(0,15).trim()+'…' : t; }
  var mqReduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : {matches:false};
  var toastTimer=null;
  function toast(msg){ var t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(function(){ t.classList.remove('show'); },3200); }

  /* ---------- Storage (IndexedDB) ---------- */
  var db=null, memOnly=false;
  function openDB(){
    return new Promise(function(res,rej){
      if(!window.indexedDB){ rej(new Error('indexedDB indisponible')); return; }
      var r=indexedDB.open('je-fais-quoi',1);
      r.onupgradeneeded=function(){ var d=r.result;
        if(!d.objectStoreNames.contains('activities')) d.createObjectStore('activities',{keyPath:'id'});
        if(!d.objectStoreNames.contains('meta')) d.createObjectStore('meta'); };
      r.onsuccess=function(){ res(r.result); };
      r.onerror=function(){ rej(r.error); };
      r.onblocked=function(){ rej(new Error('blocked')); };
    });
  }
  function tx(store,mode,fn){
    return new Promise(function(res,rej){
      if(!db){ res(undefined); return; }
      var t=db.transaction(store,mode), req=fn(t.objectStore(store));
      t.oncomplete=function(){ res(req && typeof req==='object' && 'readyState' in req ? req.result : undefined); };
      t.onerror=function(){ rej(t.error); };
      t.onabort=function(){ rej(t.error); };
    });
  }
  function dbAll(){ return tx('activities','readonly',function(s){ return s.getAll(); }); }
  function dbPut(a){ return tx('activities','readwrite',function(s){ s.put(a); }); }
  function dbDel(id){ return tx('activities','readwrite',function(s){ s.delete(id); }); }
  function metaGet(k){ return tx('meta','readonly',function(s){ return s.get(k); }); }
  function metaSet(k,v){ return tx('meta','readwrite',function(s){ s.put(v,k); }); }
  function persist(a){
    return dbPut(a).catch(function(){ toast('Plus assez de place sur le téléphone pour enregistrer ce changement.'); });
  }
  var askedPersist=false;
  function requestPersist(){ if(askedPersist) return; askedPersist=true; try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist(); }catch(e){} }

  /* ---------- State ---------- */
  var acts=[];
  var settings={sound:true,vibrate:true};
  function seedList(){
    return J.DEFAULTS.map(function(d,i){
      return {id:d.id,title:d.title,label:d.label,cat:d.cat,note:d.note,color:d.color,art:d.art||d.id,on:true,order:i,image:null};
    });
  }
  function sortActs(){ acts.sort(function(a,b){ return (a.order||0)-(b.order||0); }); }
  function byId(id){ for(var i=0;i<acts.length;i++){ if(acts[i].id===id) return acts[i]; } return null; }
  function active(){ return acts.filter(function(a){ return a.on; }); }
  function saveSettings(){ metaSet('settings',{sound:settings.sound,vibrate:settings.vibrate}).catch(function(){}); }

  /* ---------- Images ---------- */
  var urlCache={};
  function imgURL(a){
    if(!a.image) return null;
    var c=urlCache[a.id];
    if(c && c.blob===a.image) return c.url;
    if(c) URL.revokeObjectURL(c.url);
    var u=URL.createObjectURL(a.image); urlCache[a.id]={blob:a.image,url:u}; return u;
  }
  function dropURL(id){ var c=urlCache[id]; if(c){ URL.revokeObjectURL(c.url); delete urlCache[id]; } }
  function artFor(a){ var f=ART[a.art]||ART.generic; return f(a.color); }
  function mediaFromURL(u){ return '<div class="media"><img class="blur" src="'+u+'" alt="" aria-hidden="true"><img class="fg" src="'+u+'" alt=""></div>'; }
  function mediaHTML(a){ var u=imgURL(a); return u ? mediaFromURL(u) : artFor(a); }
  function prepareImage(file){
    return new Promise(function(res,rej){
      if(!file || (file.type && !/^image\//.test(file.type))){ rej(new Error('bad')); return; }
      var url=URL.createObjectURL(file), im=new Image();
      im.onload=function(){
        var s=Math.min(1,1200/Math.max(im.naturalWidth,im.naturalHeight)), c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(im.naturalWidth*s)); c.height=Math.max(1,Math.round(im.naturalHeight*s));
        var g=c.getContext('2d'); g.fillStyle='#ffffff'; g.fillRect(0,0,c.width,c.height); g.drawImage(im,0,0,c.width,c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function(b){ b ? res(b) : rej(new Error('encode')); },'image/jpeg',.85);
      };
      im.onerror=function(){ URL.revokeObjectURL(url); rej(new Error('bad')); };
      im.src=url;
    });
  }
  function blobToDataURL(b){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){ res(r.result); }; r.onerror=function(){ rej(r.error); }; r.readAsDataURL(b); }); }
  function dataURLToBlob(d){ return fetch(d).then(function(r){ return r.blob(); }); }

  /* ---------- Wheel ---------- */
  var stage=$('stage'), wheel=$('wheel'), rotor=$('rotor'), emptyG=$('empty'), pointer=$('pointer'), hub=$('hub'), hint=$('hint');
  var rotation=0, spinning=false, wheelList=[];
  (function(){ var h=''; for(var k=0;k<24;k++){ var a=k*15*Math.PI/180; h+='<circle class="bulb'+(k%2?' alt':'')+'" cx="'+(250+235*Math.sin(a)).toFixed(2)+'" cy="'+(250-235*Math.cos(a)).toFixed(2)+'" r="5.2"/>'; } $('bulbs').innerHTML=h; })();
  function pt(a,r){ var rad=a*Math.PI/180; return [(250+r*Math.sin(rad)).toFixed(2),(250-r*Math.cos(rad)).toFixed(2)]; }
  function fsFor(n,label){
    var fs = n>=13?15.5 : n>=10?17 : n>=7?19 : n>=4?21 : 23;
    if(label.length*fs*.56>134) fs=Math.max(10.5,134/(label.length*.56));
    return fs.toFixed(1);
  }
  function wheelLabel(a){ return a.label || shortLabel(a.title); }
  function setRotation(){ rotor.setAttribute('transform','rotate('+rotation.toFixed(3)+' 250 250)'); }
  function renderWheel(){
    wheelList=active();
    var n=wheelList.length, h='';
    stage.classList.remove('has-winner');
    if(n===0) emptyG.removeAttribute('hidden'); else emptyG.setAttribute('hidden','');
    if(n===1){
      var a=wheelList[0];
      h='<circle class="seg" data-i="0" cx="250" cy="250" r="222" fill="'+a.color+'"/><text class="lbl" data-i="0" x="250" y="140" text-anchor="middle" dominant-baseline="central" fill="'+inkFor(a.color)+'" font-size="24">'+esc(wheelLabel(a))+'</text>';
    } else if(n>1){
      var seg=360/n, labels='';
      wheelList.forEach(function(a,i){
        var p0=pt(i*seg,222), p1=pt((i+1)*seg,222), c=(i+.5)*seg, l=wheelLabel(a);
        h+='<path class="seg" data-i="'+i+'" d="M250 250 L'+p0[0]+' '+p0[1]+' A222 222 0 '+(seg>180?1:0)+' 1 '+p1[0]+' '+p1[1]+' Z" fill="'+a.color+'"/>';
        labels+='<text class="lbl" data-i="'+i+'" transform="rotate('+(c-90).toFixed(3)+' 250 250)" x="452" y="250" text-anchor="end" dominant-baseline="central" fill="'+inkFor(a.color)+'" font-size="'+fsFor(n,l)+'">'+esc(l)+'</text>';
      });
      h+=labels;
    }
    rotor.innerHTML=h; setRotation();
    hub.disabled = spinning || n===0;
    hint.textContent = n===0 ? 'Ouvre « Mes activités » pour en remettre dans la roue.' : 'Touche la roue pour lancer';
    $('count').textContent = n+' / '+acts.length;
  }

  /* Sound + vibration */
  var ac=null, lastTick=0, lastBuzz=0;
  function audio(){
    if(!settings.sound) return null;
    try{ if(!ac){ var C=window.AudioContext||window.webkitAudioContext; if(!C) return null; ac=new C(); } if(ac.state==='suspended') ac.resume(); return ac; }catch(e){ return null; }
  }
  function tick(){
    if(!mqReduce.matches && pointer.animate){ try{ pointer.animate([{transform:'rotate(0deg)'},{transform:'rotate(-18deg)'},{transform:'rotate(0deg)'}],{duration:130,easing:'ease-out'}); }catch(e){} }
    var now=performance.now();
    if(settings.vibrate && navigator.vibrate && now-lastBuzz>45){ lastBuzz=now; try{ navigator.vibrate(6); }catch(e){} }
    if(!settings.sound||!ac) return;
    try{
      var t=ac.currentTime; if(t-lastTick<.035) return; lastTick=t;
      var o=ac.createOscillator(), g=ac.createGain();
      o.type='square'; o.frequency.setValueAtTime(1700,t); o.frequency.exponentialRampToValueAtTime(850,t+.03);
      g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.05,t+.003); g.gain.exponentialRampToValueAtTime(.0001,t+.045);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t+.05);
    }catch(e){}
  }
  function ding(){
    if(settings.vibrate && navigator.vibrate){ try{ navigator.vibrate([30,50,70]); }catch(e){} }
    if(!settings.sound||!ac) return;
    try{
      var t=ac.currentTime;
      [[784,0],[1046.5,.09],[1318.5,.18]].forEach(function(q){
        var o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=q[0];
        g.gain.setValueAtTime(.0001,t+q[1]); g.gain.exponentialRampToValueAtTime(.14,t+q[1]+.01); g.gain.exponentialRampToValueAtTime(.0001,t+q[1]+.6);
        o.connect(g); g.connect(ac.destination); o.start(t+q[1]); o.stop(t+q[1]+.65);
      });
    }catch(e){}
  }

  function segAt(rot,n){ var a=((360-(rot%360))%360+360)%360; return Math.floor(a/(360/n))%n; }
  function spin(){
    var list=wheelList, n=list.length;
    if(spinning || n===0 || stack.length) return;
    audio();
    spinning=true; hub.disabled=true;
    stage.classList.remove('has-winner','flash');
    stage.classList.add('is-spinning');
    var seg=360/n, w=randInt(n), a=w*seg+seg*(.14+.72*rand());
    var base=(((-a-rotation)%360)+360)%360, reduce=mqReduce.matches;
    var start=rotation, target=rotation+(reduce?1:5+randInt(3))*360+base;
    var dur=reduce?1300:4600+rand()*1400, t0=performance.now(), last=segAt(start,n);
    function step(now){
      var t=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-t,4);
      rotation=start+(target-start)*e; setRotation();
      var s=segAt(rotation,n); if(s!==last){ last=s; tick(); }
      if(t<1) requestAnimationFrame(step); else finish(list[w],w);
    }
    requestAnimationFrame(step);
  }
  function finish(a,w){
    rotation=((rotation%360)+360)%360; setRotation();
    spinning=false; hub.disabled=false;
    stage.classList.remove('is-spinning');
    rotor.querySelectorAll('[data-i="'+w+'"]').forEach(function(el){ el.classList.add('win'); });
    stage.classList.add('has-winner');
    if(!mqReduce.matches){ stage.classList.add('flash'); setTimeout(function(){ stage.classList.remove('flash'); },1000); }
    ding();
    setTimeout(function(){ showResult(a); }, mqReduce.matches?0:450);
  }

  /* ---------- Overlays (the Android back button closes the top one) ---------- */
  var stack=[];
  function openOverlay(id){
    if(stack.indexOf(id)>=0) return;
    var el=$(id); stack.push(id); el.hidden=false;
    void el.offsetWidth; el.classList.add('open');
    try{ history.pushState({ov:id},''); }catch(e){}
  }
  function closeTop(){
    var id=stack.pop(); if(!id) return;
    var el=$(id); el.classList.remove('open');
    setTimeout(function(){ if(stack.indexOf(id)<0) el.hidden=true; }, mqReduce.matches?0:300);
    if(id==='result') stage.classList.remove('has-winner');
  }
  function closeOverlay(){ if(stack.length){ history.back(); } }
  window.addEventListener('popstate',function(){ closeTop(); });
  document.addEventListener('click',function(e){ if(e.target.closest('[data-close]')) closeOverlay(); });

  /* ---------- Result ---------- */
  var current=null;
  function renderResultToggle(){ if(current) $('r-toggle').textContent = current.on ? 'Retirer de la roue' : 'Remettre dans la roue'; }
  function showResult(a){
    current=a;
    $('r-art').innerHTML=mediaHTML(a);
    $('r-cat').innerHTML='<span class="dot" style="--c:'+a.color+'"></span>'+esc(a.cat||'Perso');
    $('r-title').textContent=a.title;
    $('r-note').textContent=a.note||'';
    renderResultToggle();
    openOverlay('result');
  }
  $('r-again').addEventListener('click',function(){ closeOverlay(); setTimeout(spin, mqReduce.matches?50:340); });
  $('r-toggle').addEventListener('click',function(){
    if(!current) return;
    current.on=!current.on; persist(current);
    renderWheel(); renderList(); renderResultToggle();
    toast(current.on ? '« '+wheelLabel(current)+' » est de retour dans la roue.' : '« '+wheelLabel(current)+' » est retiré de la roue.');
  });

  /* ---------- Activities list ---------- */
  var rowsEl=$('rows');
  function renderList(){
    var on=active().length;
    $('list-count').textContent=on+' sur '+acts.length+' dans la roue';
    rowsEl.innerHTML=acts.map(function(a){
      return '<li class="row'+(a.on?'':' off')+'">'+
        '<button type="button" class="row-main" data-edit="'+esc(a.id)+'"><span class="row-thumb">'+mediaHTML(a)+'</span>'+
        '<span class="row-text"><span class="row-title">'+esc(a.title)+'</span><span class="row-sub">'+esc((a.cat||'Perso')+(a.image?' · ta photo':''))+'</span></span></button>'+
        '<label class="switch"><input type="checkbox" role="switch" data-toggle="'+esc(a.id)+'"'+(a.on?' checked':'')+' aria-label="'+esc(a.title)+' dans la roue"><span class="track"></span></label></li>';
    }).join('');
  }
  rowsEl.addEventListener('click',function(e){
    var b=e.target.closest('[data-edit]'); if(b) openEdit(b.getAttribute('data-edit'));
  });
  rowsEl.addEventListener('change',function(e){
    var id=e.target.getAttribute && e.target.getAttribute('data-toggle'); if(!id) return;
    var a=byId(id); if(!a) return;
    a.on=e.target.checked; persist(a);
    e.target.closest('.row').classList.toggle('off',!a.on);
    $('list-count').textContent=active().length+' sur '+acts.length+' dans la roue';
    renderWheel();
  });
  $('open-list').addEventListener('click',function(){ if(!spinning){ renderList(); openOverlay('list'); } });
  $('add').addEventListener('click',function(){ openEdit(null); });

  /* ---------- Edit ---------- */
  var editing=null, nameIn=$('e-name'), labelIn=$('e-label'), onIn=$('e-on'), delBtn=$('e-delete'), errEl=$('e-err');
  var previewURL=null;
  $('e-colors').innerHTML=PALETTE.map(function(c,i){ return '<label class="sw" style="--c:'+c+'"><input type="radio" name="e-color" value="'+c+'" aria-label="Couleur '+(i+1)+'"><span></span></label>'; }).join('');
  function nextColor(){
    var used={}; acts.forEach(function(a){ used[a.color]=(used[a.color]||0)+1; });
    var best=PALETTE[0], min=1e9; PALETTE.forEach(function(c){ var u=used[c]||0; if(u<min){ min=u; best=c; } });
    return best;
  }
  function renderPreview(){
    if(previewURL){ URL.revokeObjectURL(previewURL); previewURL=null; }
    if(editing.image){ previewURL=URL.createObjectURL(editing.image); $('e-preview').innerHTML=mediaFromURL(previewURL); }
    else $('e-preview').innerHTML=artFor({art:editing.art,color:editing.color});
    $('e-unphoto').hidden=!editing.image;
    $('e-photo-l').textContent = editing.image ? 'Changer la photo' : 'Choisir une photo';
  }
  function openEdit(id){
    var a=id?byId(id):null;
    editing = a ? {isNew:false,id:a.id,color:a.color,image:a.image||null,art:a.art||'generic'}
                : {isNew:true,id:'c'+Date.now().toString(36)+randInt(1e6).toString(36),color:nextColor(),image:null,art:'generic'};
    $('edit-h').textContent = a ? 'Modifier' : 'Nouvelle activité';
    nameIn.value = a ? a.title : '';
    labelIn.value = a ? (a.label||'') : '';
    labelIn.placeholder = 'Comme le nom';
    onIn.checked = a ? !!a.on : true;
    var r=document.querySelector('input[name="e-color"][value="'+editing.color+'"]'); if(r) r.checked=true;
    errEl.textContent='';
    delBtn.hidden=!a; delBtn.classList.remove('armed'); delBtn.textContent='Supprimer l’activité';
    renderPreview();
    openOverlay('edit');
  }
  $('e-colors').addEventListener('change',function(e){ if(e.target.name==='e-color'){ editing.color=e.target.value; if(!editing.image) renderPreview(); } });
  nameIn.addEventListener('input',function(){ errEl.textContent=''; labelIn.placeholder = nameIn.value.trim() ? shortLabel(nameIn.value) : 'Comme le nom'; });
  nameIn.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); labelIn.focus(); } });
  labelIn.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); labelIn.blur(); } });

  var photoIn=$('photo-file');
  $('e-photo').addEventListener('click',function(){ photoIn.click(); });
  $('e-unphoto').addEventListener('click',function(){ editing.image=null; renderPreview(); });
  photoIn.addEventListener('change',function(){
    var f=photoIn.files && photoIn.files[0]; photoIn.value='';
    if(!f || !editing) return;
    $('e-photo-l').textContent='Chargement…';
    prepareImage(f).then(function(b){ if(editing){ editing.image=b; renderPreview(); } },
      function(){ toast('Cette image ne peut pas être lue. Essaie une autre photo.'); if(editing) renderPreview(); });
  });

  $('e-save').addEventListener('click',function(){
    if(!editing) return;
    var t=nameIn.value.trim().replace(/\s+/g,' ');
    if(!t){ errEl.textContent='Donne un nom à l’activité.'; nameIn.focus(); return; }
    var a=editing.isNew ? {id:editing.id,cat:'Perso',note:'',art:'generic',order:acts.reduce(function(m,x){ return Math.max(m,x.order||0); },-1)+1} : byId(editing.id);
    if(!a){ closeOverlay(); return; }
    a.title=t;
    var l=labelIn.value.trim().replace(/\s+/g,' ');
    a.label = l ? l.slice(0,18) : shortLabel(t);
    a.color=editing.color; a.on=onIn.checked;
    if(a.image!==editing.image) dropURL(a.id);
    a.image=editing.image||null;
    if(a.image) requestPersist();
    var isNew=editing.isNew;
    if(isNew) acts.push(a);
    persist(a); sortActs(); renderWheel(); renderList();
    if(current && current.id===a.id) renderResultToggle();
    closeOverlay();
    toast(isNew ? '« '+t+' » ajouté'+(a.on?' à la roue.':'.') : 'Modifications enregistrées.');
  });

  delBtn.addEventListener('click',function(){
    if(!editing || editing.isNew) return;
    if(!delBtn.classList.contains('armed')){ delBtn.classList.add('armed'); delBtn.textContent='Toucher encore pour supprimer'; return; }
    var a=byId(editing.id); if(!a) return;
    acts=acts.filter(function(x){ return x.id!==a.id; });
    dropURL(a.id); dbDel(a.id).catch(function(){});
    if(current && current.id===a.id) current=null;
    renderWheel(); renderList(); closeOverlay();
    toast('« '+a.title+' » supprimé.');
  });

  /* ---------- Settings, backup ---------- */
  var sndIn=$('set-sound'), vibIn=$('set-vibrate');
  sndIn.addEventListener('change',function(){ settings.sound=sndIn.checked; saveSettings(); if(settings.sound) audio(); });
  vibIn.addEventListener('change',function(){ settings.vibrate=vibIn.checked; saveSettings(); if(settings.vibrate && navigator.vibrate){ try{ navigator.vibrate(20); }catch(e){} } });
  $('all-on').addEventListener('click',function(){
    var changed=acts.filter(function(a){ return !a.on; });
    changed.forEach(function(a){ a.on=true; persist(a); });
    renderWheel(); renderList();
    toast(changed.length ? 'Toutes les activités sont dans la roue.' : 'Tout est déjà dans la roue.');
  });
  $('export').addEventListener('click',function(){
    toast('Préparation de la sauvegarde…');
    Promise.all(acts.map(function(a){
      var o={id:a.id,title:a.title,label:a.label,cat:a.cat,note:a.note,color:a.color,art:a.art,on:a.on,order:a.order,image:null};
      return a.image ? blobToDataURL(a.image).then(function(d){ o.image=d; return o; }) : o;
    })).then(function(list){
      var data={app:'je-fais-quoi',version:1,date:new Date().toISOString(),settings:settings,activities:list};
      var url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));
      var link=document.createElement('a'); link.href=url; link.download='je-fais-quoi-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); },15000);
      toast('Sauvegarde créée : regarde dans tes téléchargements.');
    }).catch(function(){ toast('La sauvegarde n’a pas pu être créée.'); });
  });
  var backupIn=$('backup-file');
  $('import').addEventListener('click',function(){ backupIn.click(); });
  backupIn.addEventListener('change',function(){
    var f=backupIn.files && backupIn.files[0]; backupIn.value=''; if(!f) return;
    f.text().then(function(txt){ return JSON.parse(txt); }).then(function(data){
      if(!data || data.app!=='je-fais-quoi' || !Array.isArray(data.activities)) throw new Error('format');
      return Promise.all(data.activities.map(function(x,i){
        var a={id:String(x.id||('c'+i+Date.now().toString(36))).slice(0,80),title:String(x.title||'Sans nom').slice(0,60),label:String(x.label||'').slice(0,18),
               cat:x.cat?String(x.cat).slice(0,40):'Perso',note:x.note?String(x.note).slice(0,200):'',
               color:/^#[0-9a-fA-F]{6}$/.test(x.color)?x.color:PALETTE[i%PALETTE.length],art:(x.art && ART[x.art])?x.art:'generic',
               on:x.on!==false,order:typeof x.order==='number'?x.order:i,image:null};
        if(!a.label) a.label=shortLabel(a.title);
        var p=(typeof x.image==='string' && x.image.indexOf('data:image/')===0) ? dataURLToBlob(x.image) : Promise.resolve(null);
        return p.then(function(b){ a.image=b; return a; });
      })).then(function(list){
        if(data.settings){ settings.sound=data.settings.sound!==false; settings.vibrate=data.settings.vibrate!==false; saveSettings(); renderSettings(); }
        Object.keys(urlCache).forEach(dropURL);
        acts=list; sortActs(); current=null;
        var done = memOnly ? Promise.resolve() : tx('activities','readwrite',function(s){ s.clear(); list.forEach(function(a){ s.put(a); }); });
        return done.then(function(){ renderWheel(); renderList(); requestPersist(); toast('Sauvegarde restaurée : '+list.length+' activités.'); });
      });
    }).catch(function(){ toast('Ce fichier n’est pas une sauvegarde de l’appli.'); });
  });
  function renderSettings(){ sndIn.checked=settings.sound; vibIn.checked=settings.vibrate; }

  /* ---------- Controls ---------- */
  hub.addEventListener('click',spin);
  wheel.addEventListener('click',spin);
  document.addEventListener('keydown',function(e){
    if((e.code!=='Space' && e.key!==' ') || stack.length) return;
    var t=e.target; if(t && t.closest && t.closest('input,textarea,select,button,a')) return;
    e.preventDefault(); spin();
  });

  /* Install button (Chrome on Android) */
  var deferred=null, installBtn=$('install');
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferred=e; installBtn.hidden=false; });
  installBtn.addEventListener('click',function(){
    if(!deferred) return; deferred.prompt();
    deferred.userChoice.then(function(){ deferred=null; installBtn.hidden=true; },function(){ deferred=null; installBtn.hidden=true; });
  });
  window.addEventListener('appinstalled',function(){ installBtn.hidden=true; toast('Appli installée sur ton écran d’accueil.'); });
  if('serviceWorker' in navigator && location.protocol!=='file:'){
    window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
  }

  /* ---------- Boot ---------- */
  openDB().then(function(d){ db=d; return metaGet('seeded'); }).then(function(seeded){
    if(seeded) return dbAll().then(function(list){ acts=list||[]; });
    acts=seedList();
    return tx('activities','readwrite',function(s){ acts.forEach(function(a){ s.put(a); }); }).then(function(){ return metaSet('seeded',true); });
  }).then(function(){ return metaGet('settings'); }).then(function(s){
    if(s){ settings.sound=s.sound!==false; settings.vibrate=s.vibrate!==false; }
  }).catch(function(){
    memOnly=true; db=null; acts=seedList();
    toast('Le stockage du téléphone est indisponible : tes changements ne seront pas gardés.');
  }).then(function(){
    sortActs(); renderSettings(); renderWheel(); renderList();
    if(wheelList.length) rotation=-180/wheelList.length;
    setRotation();
  });
})();
