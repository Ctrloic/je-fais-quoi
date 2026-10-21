/* Données par défaut et illustrations de la roue */
(function(){
  "use strict";
  var DEFAULTS = [
    {id:'office',     label:'The Office',     title:'Regarder The Office',        cat:'Série',              color:'#3E7CB1', note:'Un épisode de vingt minutes, puis on voit.'},
    {id:'serie',      label:'Série en cours', title:'Regarder la série en cours', cat:'Série',              color:'#8C2F39', note:'Reprends là où tu t’es arrêté. Un ou deux épisodes.'},
    {id:'film',       label:'Un film',        title:'Regarder un film',           cat:'Film',               color:'#F2C230', note:'Choisis-le en moins de dix minutes, sinon relance la roue.'},
    {id:'simpsons',   label:'Les Simpsons',   title:'Regarder Les Simpsons',      cat:'Série animée',       color:'#E4572E', note:'Deux ou trois épisodes, ça passe tout seul.'},
    {id:'anime',      label:'Un anime',       title:'Regarder un anime',          cat:'Anime',              color:'#E86A92', note:'Un épisode… ou la saison entière.'},
    {id:'overwatch',  label:'Overwatch',      title:'Tryhard Overwatch',          cat:'Jeu vidéo · ranked', color:'#F08A24', note:'Échauffement, puis ranked. Notifs coupées.'},
    {id:'valorant',   label:'Valorant',       title:'Tryhard Valorant',           cat:'Jeu vidéo · ranked', color:'#D7263D', note:'Un deathmatch d’échauffement avant la ranked.'},
    {id:'bouquin',    label:'Un bouquin',     title:'Lire un bouquin',            cat:'Lecture',            color:'#4A7C6B', note:'Au moins un chapitre, téléphone loin.'},
    {id:'manga',      label:'Un manga',       title:'Lire un manga',              cat:'Lecture',            color:'#EDE7DA', note:'Un tome, peut-être deux.'},
    {id:'nfs',        label:'Need for Speed', title:'Jouer à Need for Speed Payback', cat:'Jeu vidéo',      color:'#2B4162', note:'Quelques courses pour se vider la tête.'},
    {id:'musique',    label:'Musique',        title:'Écouter de la musique',      cat:'Musique',            color:'#7A4EAB', note:'Un album en entier, du début à la fin.'},
    {id:'spiritfarer',label:'Spiritfarer',    title:'Jouer à Spiritfarer',        cat:'Jeu vidéo',          color:'#238276', note:'Une session tranquille, sans se presser.'},
    {id:'lego',       label:'LEGO Star Wars', title:'Jouer à LEGO Star Wars : La Saga Skywalker', cat:'Jeu vidéo', color:'#5E6B7D', note:'Quelques niveaux, et on casse tout ce qui dépasse.'},
    {id:'hades',      label:'Hades',          title:'Jouer à Hades',              cat:'Jeu vidéo',          color:'#5C2751', note:'Une run. Puis une autre. Puis encore une.'},
    {id:'portal',     label:'Portal',         title:'Jouer à Portal',             cat:'Jeu vidéo',          color:'#C7D0D9', note:'Quelques salles de test, cerveau allumé.'},
    {id:'planetzoo',  label:'Planet Zoo',     title:'Jouer à Planet Zoo',         cat:'Jeu vidéo',          color:'#A1C349', note:'Attention, « juste un enclos » peut durer trois heures.'},
    {id:'zelda',      label:'Zelda',          title:'Jouer à Zelda : Tears of the Kingdom', cat:'Jeu vidéo', color:'#5BC0EB', note:'Choisis une direction et pars explorer.'},
    {id:'mariowonder',label:'Mario Wonder',   title:'Jouer à Super Mario Bros. Wonder', cat:'Jeu vidéo',    color:'#2A7F39', note:'Quelques niveaux, sans pression.', art:'platformer'},
    {id:'mouse',      label:'Mouse: P.I.',    title:'Jouer à Mouse: P.I. for Hire', cat:'Jeu vidéo',        color:'#B08D57', note:'Une affaire à résoudre, en noir et blanc.'},
    {id:'sonicorigins',label:'Sonic Origins', title:'Jouer à Sonic Origins',      cat:'Jeu vidéo',          color:'#3346A8', note:'Les classiques, un niveau après l’autre.'},
    {id:'soniccolors',label:'Sonic Colors',   title:'Jouer à Sonic Colors',       cat:'Jeu vidéo',          color:'#C2477A', note:'Quelques niveaux à toute vitesse.'},
    {id:'sonicmania', label:'Sonic Mania',    title:'Jouer à Sonic Mania',        cat:'Jeu vidéo',          color:'#0FA3B1', note:'Du pixel, du rétro et de la vitesse.'}
  ];
  var EXTRA_COLORS = ['#C2477A','#3B8EA5','#B8741A','#5E60CE','#0E8C6B','#8E5A3C'];

  /* ---------- Illustrations ---------- */
  function spark(x,y,r,fill,extra){
    return '<path '+(extra||'')+' d="M'+x+' '+(y-r)+' Q'+x+' '+y+' '+(x+r)+' '+y+' Q'+x+' '+y+' '+x+' '+(y+r)+' Q'+x+' '+y+' '+(x-r)+' '+y+' Q'+x+' '+y+' '+x+' '+(y-r)+' Z" fill="'+fill+'"/>';
  }
  function starPts(cx,cy,R,r,n){
    var p=[]; for(var i=0;i<n*2;i++){var a=Math.PI*i/n-Math.PI/2, rad=i%2?r:R; p.push((cx+rad*Math.cos(a)).toFixed(1)+','+(cy+rad*Math.sin(a)).toFixed(1));} return p.join(' ');
  }
  function gearPts(cx,cy,R,r,n){
    var step=Math.PI*2/n, p=[];
    for(var k=0;k<n;k++){var a=k*step;[[r,-.27],[R,-.13],[R,.13],[r,.27]].forEach(function(q){var aa=a+q[1]*step;p.push((cx+q[0]*Math.cos(aa)).toFixed(1)+','+(cy+q[0]*Math.sin(aa)).toFixed(1));});}
    return p.join(' ');
  }
  function pxStar(x,y,c){
    return [[0,-4],[-4,0],[0,0],[4,0],[0,4]].map(function(d){ return '<rect x="'+(x+d[0])+'" y="'+(y+d[1])+'" width="4" height="4" fill="'+(c||'#fff')+'"/>'; }).join('');
  }
  var clipN=0;
  function frame(bg,inner,shadow){
    return '<svg class="ill" viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
      '<rect width="240" height="160" fill="'+bg+'"/>'+
      '<circle cx="120" cy="80" r="66" fill="#fff" fill-opacity=".16"/>'+
      (shadow===false?'':'<ellipse cx="120" cy="140" rx="92" ry="7" fill="#000" fill-opacity=".16"/>')+
      inner+'</svg>';
  }

  var ART = {
    office: function(bg){ return frame(bg,
      '<rect class="o" x="40" y="118" width="10" height="22" fill="#A56E3F"/><rect class="o" x="190" y="118" width="10" height="22" fill="#A56E3F"/>'+
      '<rect class="o" x="28" y="108" width="184" height="12" rx="3" fill="#C98B55"/>'+
      '<rect class="o" x="113" y="94" width="14" height="12" fill="#8A8398"/><rect class="o" x="98" y="102" width="44" height="6" rx="3" fill="#8A8398"/>'+
      '<rect class="o" x="74" y="36" width="92" height="62" rx="7" fill="#E9E4F0"/><rect x="82" y="44" width="76" height="46" rx="3" fill="#BFE3F2"/>'+
      '<rect x="90" y="70" width="11" height="14" fill="#3E7CB1"/><rect x="106" y="62" width="11" height="22" fill="#3E7CB1"/><rect x="122" y="54" width="11" height="30" fill="#F2C230"/><rect x="138" y="66" width="11" height="18" fill="#3E7CB1"/>'+
      '<path d="M88 84 H152" stroke="#221A33" stroke-width="2"/>'+
      '<rect class="o" x="36" y="92" width="38" height="16" rx="1" fill="#fff"/><path d="M40 97.5 H70 M40 102.5 H70" stroke="#C9C3D6" stroke-width="2"/>'+
      '<rect class="o" x="40" y="82" width="34" height="10" rx="1" fill="#fff" transform="rotate(-5 57 87)"/>'+
      '<path class="o" d="M186 88 q11 0 11 9 q0 9 -11 9" fill="none"/><rect class="o" x="168" y="82" width="20" height="26" rx="4" fill="#fff"/>'+
      '<path d="M173 74 q4 -5 0 -10 M182 74 q4 -5 0 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".85"/>'
    );},
    serie: function(bg){ return frame(bg,
      '<path class="o" d="M82 118 L72 138 M158 118 L168 138" fill="none"/>'+
      '<path class="o" d="M120 36 L98 14 M120 36 L144 16" fill="none"/><circle class="o" cx="98" cy="14" r="3.5" fill="#E9E4F0"/><circle class="o" cx="144" cy="16" r="3.5" fill="#E9E4F0"/>'+
      '<rect class="o" x="58" y="34" width="124" height="86" rx="12" fill="#6B4B34"/>'+
      '<rect x="68" y="44" width="84" height="66" rx="9" fill="#1C1830"/>'+
      '<text x="77" y="58" font-family="Figtree, sans-serif" font-weight="800" font-size="8.5" fill="#C9C3D6" letter-spacing=".5">S2 · É6</text>'+
      '<circle class="o" cx="110" cy="72" r="14" fill="#fff"/><path d="M105.5 64.5 V79.5 L118 72 Z" fill="#221A33"/>'+
      '<rect x="77" y="94" width="66" height="5" rx="2.5" fill="#4A4060"/><rect x="77" y="94" width="42" height="5" rx="2.5" fill="#E4572E"/><circle cx="119" cy="96.5" r="4" fill="#fff"/>'+
      '<rect class="o" x="68" y="44" width="84" height="66" rx="9" fill="none"/>'+
      '<circle class="o" cx="166" cy="58" r="5" fill="#E9CF86"/><circle class="o" cx="166" cy="76" r="5" fill="#E9CF86"/>'+
      '<path d="M160 92 H172 M160 98 H172 M160 104 H172" stroke="#221A33" stroke-width="2"/>'+
      '<g fill="#F6D27A" stroke="#221A33" stroke-width="2"><ellipse cx="194" cy="116" rx="7" ry="4" transform="rotate(-20 194 116)"/><ellipse cx="204" cy="112" rx="7" ry="4" transform="rotate(15 204 112)"/><ellipse cx="212" cy="117" rx="6" ry="3.5" transform="rotate(-35 212 117)"/></g>'+
      '<path class="o" d="M184 118 H220 Q218 138 202 138 Q186 138 184 118 Z" fill="#3E7CB1"/>'
    );},
    film: function(bg){ return frame(bg,
      '<g class="o" fill="#FFF6D8"><circle cx="146" cy="72" r="8"/><circle cx="158" cy="64" r="10"/><circle cx="173" cy="62" r="10"/><circle cx="188" cy="66" r="9"/><circle cx="197" cy="73" r="7"/><circle cx="166" cy="72" r="8"/><circle cx="181" cy="73" r="8"/></g>'+
      '<path d="M138 76 H202 L193 138 H147 Z" fill="#fff"/>'+
      '<path d="M138 76 H150.8 L156.2 138 H147 Z M163.6 76 H176.4 L174.6 138 H165.4 Z M189.2 76 H202 L193 138 H183.8 Z" fill="#E4572E"/>'+
      '<path class="o" d="M138 76 H202 L193 138 H147 Z" fill="none"/><rect class="o" x="134" y="72" width="72" height="8" rx="3" fill="#fff"/>'+
      '<rect x="36" y="76" width="88" height="60" rx="4" fill="#2B2733"/><rect x="37.5" y="77.5" width="85" height="11" fill="#fff"/>'+
      '<path d="M42 77.5 h11 l7 11 h-11z M64 77.5 h11 l7 11 h-11z M86 77.5 h11 l7 11 h-11z M108 77.5 h11 l3.5 5.5 v5.5 h-7.5z" fill="#2B2733"/>'+
      '<rect class="o" x="36" y="76" width="88" height="60" rx="4" fill="none"/><path d="M36 88.5 H124" stroke="#221A33" stroke-width="3"/>'+
      '<path d="M46 102 H112 M46 114 H94 M46 125 H102" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-opacity=".7"/>'+
      '<g transform="rotate(-16 36 76)"><rect x="36" y="62" width="88" height="14" rx="2" fill="#fff"/>'+
      '<path d="M44 62 h11 l-7 14 h-11 z M66 62 h11 l-7 14 h-11 z M88 62 h11 l-7 14 h-11 z M110 62 h11 l-7 14 h-11 z" fill="#2B2733"/>'+
      '<rect class="o" x="36" y="62" width="88" height="14" rx="2" fill="none"/></g>'+
      '<circle class="o" cx="38" cy="76" r="3" fill="#C9C3D6"/>'
    );},
    simpsons: function(bg){ return frame(bg,
      '<path class="o" d="M84 120 L76 138 M156 120 L164 138" fill="none"/>'+
      '<rect class="o" x="54" y="36" width="132" height="86" rx="18" fill="#7A4EAB"/>'+
      '<rect x="64" y="46" width="92" height="66" rx="12" fill="#8FD6F2"/>'+
      '<path d="M64 96 H156 V100 Q156 112 144 112 H76 Q64 112 64 100 Z" fill="#6CC56F"/>'+
      '<path d="M76 94 Q88 56 106 70" stroke="#fff" stroke-width="3" stroke-dasharray="2 6" fill="none" stroke-linecap="round"/>'+
      '<ellipse cx="118" cy="97" rx="9" ry="2.5" fill="#000" fill-opacity=".2"/>'+
      '<circle class="o" cx="118" cy="76" r="11" fill="#F2C230"/><circle cx="114" cy="72" r="3" fill="#fff"/>'+
      spark(142,58,6,'#fff')+spark(82,58,4,'#fff')+
      '<rect class="o" x="64" y="46" width="92" height="66" rx="12" fill="none"/>'+
      '<circle class="o" cx="172" cy="62" r="5" fill="#F2C230"/><circle class="o" cx="172" cy="80" r="5" fill="#F2C230"/>'+
      '<g transform="rotate(-22 200 127)"><rect class="o" x="192" y="112" width="16" height="30" rx="5" fill="#2B2733"/><circle cx="200" cy="120" r="2.5" fill="#E4572E"/><rect x="196" y="127" width="8" height="2" fill="#fff"/><rect x="196" y="132" width="8" height="2" fill="#fff"/></g>'
    );},
    anime: function(bg){
      var sl=''; for(var k=0;k<20;k++){var a=k/20*Math.PI*2+.08,c=Math.cos(a),s=Math.sin(a),rm=Math.min(62/Math.max(Math.abs(c),1e-6),33/Math.max(Math.abs(s),1e-6)),r1=Math.max(26,rm*.5);
        sl+='<path d="M'+(120+c*r1).toFixed(1)+' '+(77+s*r1).toFixed(1)+' L'+(120+c*rm).toFixed(1)+' '+(77+s*rm).toFixed(1)+'"/>';}
      var petal=function(x,y,r){return '<ellipse cx="'+x+'" cy="'+y+'" rx="7" ry="4" fill="#FFD6E4" stroke="#221A33" stroke-width="2" transform="rotate('+r+' '+x+' '+y+')"/>';};
      return frame(bg,
        '<rect class="o" x="112" y="120" width="16" height="12" fill="#3A3354"/><rect class="o" x="92" y="130" width="56" height="7" rx="3" fill="#3A3354"/>'+
        '<rect x="46" y="32" width="148" height="90" rx="8" fill="#221A33"/><rect x="54" y="40" width="132" height="74" rx="3" fill="#FFE3EC"/>'+
        '<g stroke="#F59BBB" stroke-width="3" stroke-linecap="round">'+sl+'</g>'+
        spark(120,77,24,'#fff','class="o"')+spark(147,56,8,'#F2C230','class="o"')+spark(94,98,5,'#fff')+
        '<rect class="o" x="46" y="32" width="148" height="90" rx="8" fill="none"/>'+
        petal(28,40,-30)+petal(212,50,25)+petal(22,108,40)+petal(216,112,-20)+petal(200,20,60)
      );
    },
    overwatch: function(bg){ return frame(bg,
      '<path d="M66 98 V80 A54 54 0 0 1 174 80 V98" fill="none" stroke="#221A33" stroke-width="11" stroke-linecap="round"/>'+
      '<path d="M66 98 V80 A54 54 0 0 1 174 80 V98" fill="none" stroke="#4A4060" stroke-width="5" stroke-linecap="round"/>'+
      '<path class="o" d="M120 30 L158 44 Q158 88 120 116 Q82 88 82 44 Z" fill="#E9E4F0"/>'+
      '<path d="M120 40 L149 51 Q149 84 120 106 Q91 84 91 51 Z" fill="#7A4EAB"/>'+
      '<path d="M105 54 L120 64 L135 54 M105 67 L120 77 L135 67 M105 80 L120 90 L135 80" fill="none" stroke="#F2C230" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<rect class="o" x="55" y="84" width="22" height="36" rx="9" fill="#221A33"/><rect class="o" x="163" y="84" width="22" height="36" rx="9" fill="#221A33"/>'+
      '<rect x="60" y="92" width="4" height="20" rx="2" fill="#F2C230"/><rect x="176" y="92" width="4" height="20" rx="2" fill="#F2C230"/>'+
      '<path d="M66 119 Q70 133 92 131" fill="none" stroke="#221A33" stroke-width="4" stroke-linecap="round"/><circle class="o" cx="94" cy="131" r="4" fill="#4A4060"/>'+
      '<path class="o" d="M80 108 H160 L152 117 L160 126 H80 L88 117 Z" fill="#221A33"/>'+
      '<text x="120" y="121.5" text-anchor="middle" font-family="Bungee, Arial Black, sans-serif" font-size="11" fill="#fff" letter-spacing="1">RANKED</text>'
    );},
    valorant: function(bg){ return frame(bg,
      '<path d="M192 58 Q196 36 212 30" fill="none" stroke="#221A33" stroke-width="3" stroke-linecap="round"/>'+
      '<circle class="o" cx="100" cy="80" r="46" fill="#fff"/><circle cx="100" cy="80" r="34" fill="#221A33"/><circle cx="100" cy="80" r="22" fill="#fff"/><circle class="o" cx="100" cy="80" r="10" fill="#F2C230"/>'+
      '<path d="M100 50 V66 M100 94 V110 M70 80 H86 M114 80 H130" stroke="#221A33" stroke-width="9" stroke-linecap="round"/>'+
      '<path d="M100 50 V66 M100 94 V110 M70 80 H86 M114 80 H130" stroke="#5CF2B0" stroke-width="4" stroke-linecap="round"/>'+
      '<circle cx="100" cy="80" r="3.5" fill="#5CF2B0" stroke="#221A33" stroke-width="2"/>'+
      '<rect class="o" x="174" y="58" width="38" height="64" rx="19" fill="#2B2733"/>'+
      '<path d="M193 60 V84 M176 84 H210" stroke="#4A4458" stroke-width="2"/>'+
      '<rect x="190" y="65" width="6" height="12" rx="3" fill="#5CF2B0"/>'+
      '<path d="M179 102 Q193 110 207 102" stroke="#5CF2B0" stroke-width="2.5" fill="none" stroke-opacity=".85" stroke-linecap="round"/>'
    );},
    bouquin: function(bg){
      var ll='',rl=''; [84,92,100,108].forEach(function(y){ ll+='M38 '+y+' Q61 '+(y-8)+' 86 '+(y+3)+' '; rl+='M102 '+(y+3)+' Q127 '+(y-8)+' 150 '+y+' '; });
      return frame(bg,
        '<path class="o" d="M22 76 V130 Q58 120 94 134 Q130 120 166 130 V76 Z" fill="#8C2F39"/>'+
        '<path class="o" d="M28 70 Q61 58 94 74 V128 Q61 114 28 124 Z" fill="#FFF8EC"/>'+
        '<path class="o" d="M94 74 Q127 58 160 70 V124 Q127 114 94 128 Z" fill="#FFF8EC"/>'+
        '<path d="'+ll+rl+'" stroke="#CFC4B0" stroke-width="2" fill="none" stroke-linecap="round"/>'+
        '<path d="M140 64 V88 L145 83 L150 88 V63" fill="#F2C230" stroke="#221A33" stroke-width="2" stroke-linejoin="round"/>'+
        '<ellipse class="o" cx="195" cy="136" rx="24" ry="4.5" fill="#fff"/>'+
        '<path class="o" d="M211 108 q11 0 11 9 q0 9 -11 9" fill="none"/>'+
        '<path class="o" d="M178 104 H212 V118 Q212 134 195 134 Q178 134 178 118 Z" fill="#fff"/>'+
        '<ellipse cx="195" cy="104.5" rx="15.5" ry="2.6" fill="#B5652B"/>'+
        '<path d="M188 96 q-5 -6 0 -12 q5 -6 0 -12 M200 94 q-5 -6 0 -12 q5 -6 0 -12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".85"/>'
      );
    },
    manga: function(bg){
      var dots=''; for(var y=86;y<=126;y+=5){ for(var x=184;x<=200;x+=5){ dots+='<circle cx="'+x+'" cy="'+y+'" r="1.3"/>'; } }
      return frame(bg,
        '<rect class="o" x="30" y="50" width="22" height="86" rx="2" fill="#E4572E"/><rect class="o" x="52" y="58" width="20" height="78" rx="2" fill="#3E7CB1"/><rect class="o" x="72" y="44" width="24" height="92" rx="2" fill="#221A33"/>'+
        '<rect x="34" y="62" width="14" height="14" fill="#fff"/><rect x="55" y="70" width="14" height="12" fill="#fff"/><rect x="76" y="58" width="16" height="16" fill="#F2C230"/>'+
        '<path d="M35 120 H47 M56 122 H68 M77 124 H91" stroke="#fff" stroke-width="2" stroke-opacity=".75"/>'+
        '<g transform="rotate(5 160 86)">'+
          '<rect class="o" x="110" y="32" width="100" height="106" rx="2" fill="#fff"/>'+
          '<rect x="117" y="39" width="41" height="36" fill="#fff" stroke="#221A33" stroke-width="2"/>'+
          '<path d="M121 44 L154 70 M128 42 L156 62 M120 54 L146 72 M137 41 L157 54" stroke="#221A33" stroke-width="1.5"/>'+
          '<rect x="162" y="39" width="41" height="36" fill="#221A33" stroke="#221A33" stroke-width="2"/>'+
          '<polygon points="'+starPts(182.5,57,15,7,8)+'" fill="#fff" stroke="#221A33" stroke-width="1.5" stroke-linejoin="round"/>'+
          '<text x="182.5" y="62" text-anchor="middle" font-family="Bungee, Arial Black, sans-serif" font-size="13" fill="#221A33">!</text>'+
          '<rect x="117" y="79" width="86" height="52" fill="#fff" stroke="#221A33" stroke-width="2"/>'+
          '<g fill="#221A33" fill-opacity=".45">'+dots+'</g>'+
          '<path d="M140 110 L133 124 L151 112" fill="#fff" stroke="#221A33" stroke-width="2" stroke-linejoin="round"/>'+
          '<ellipse cx="150" cy="100" rx="26" ry="14" fill="#fff" stroke="#221A33" stroke-width="2"/>'+
          '<text x="150" y="105.5" text-anchor="middle" font-family="Bungee, Arial Black, sans-serif" font-size="14" fill="#221A33">?!</text>'+
        '</g>'
      );
    },
    platformer: function(bg){
      var plat=function(x,y,w){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="12" rx="3" fill="#C98B55"/><rect x="'+(x+1.5)+'" y="'+(y+1.5)+'" width="'+(w-3)+'" height="4" fill="#8FD14F"/><rect class="o" x="'+x+'" y="'+y+'" width="'+w+'" height="12" rx="3" fill="none"/>';};
      var coin=function(x,y){return '<ellipse class="o" cx="'+x+'" cy="'+y+'" rx="6" ry="8" fill="#F2C230"/><path d="M'+x+' '+(y-4)+' V'+(y+4)+'" stroke="#B8741A" stroke-width="2" stroke-linecap="round"/>';};
      return frame(bg,
        '<path d="M66 56 Q94 6 114 28" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" stroke-opacity=".9"/>'+
        plat(28,58,54)+plat(158,46,54)+coin(46,42)+coin(64,42)+coin(176,30)+coin(194,30)+
        '<polygon class="o" points="'+starPts(122,40,17,7.5,5)+'" fill="#F2C230"/>'+
        '<path class="o" d="M72 96 Q72 84 86 84 H154 Q168 84 168 96 L178 124 Q182 138 168 138 Q158 138 152 126 L148 120 H92 L88 126 Q82 138 72 138 Q58 138 62 124 Z" fill="#E9E4F0"/>'+
        '<path d="M88 98 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8 z" fill="#3A3354"/>'+
        '<g stroke="#221A33" stroke-width="2"><circle cx="150" cy="99" r="5.5" fill="#E4572E"/><circle cx="161" cy="110" r="5.5" fill="#F2C230"/><circle cx="139" cy="110" r="5.5" fill="#3E7CB1"/><circle cx="150" cy="121" r="5.5" fill="#6CC56F"/></g>'+
        '<rect x="110" y="96" width="8" height="4" rx="2" fill="#8A8398"/><rect x="122" y="96" width="8" height="4" rx="2" fill="#8A8398"/>'
      );
    },
    nfs: function(bg){
      var chk=''; for(var r=0;r<3;r++){ for(var c=0;c<4;c++){ if((r+c)%2===0){ chk+='<rect x="'+(207+c*7)+'" y="'+(20+r*6)+'" width="7" height="6" fill="#221A33"/>'; } } }
      return frame(bg,
        '<path d="M8 92 H34 M14 102 H38 M6 112 H28" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-opacity=".6"/>'+
        '<path d="M205 20 V62" stroke="#E9E4F0" stroke-width="3" stroke-linecap="round"/>'+
        '<rect x="207" y="20" width="28" height="18" fill="#fff"/>'+chk+'<rect class="o" x="207" y="20" width="28" height="18" fill="none" style="stroke-width:2"/>'+
        '<path class="o" d="M40 92 L34 80 H56 L52 90" fill="#221A33"/>'+
        '<path class="o" d="M36 116 L40 100 Q44 90 60 88 L90 86 Q108 68 136 68 L158 70 Q174 74 188 86 L204 90 Q214 92 214 104 L214 116 Z" fill="#F2C230"/>'+
        '<path class="o" d="M98 86 Q112 74 134 74 L154 76 Q166 80 174 88 Z" fill="#BFE3F2"/><path d="M138 74 V87" stroke="#221A33" stroke-width="3"/>'+
        '<path d="M44 104 H212" stroke="#221A33" stroke-width="5"/>'+
        '<path d="M203 93 L212 97 V100 L201 98 Z" fill="#fff"/>'+
        '<circle class="o" cx="72" cy="116" r="15" fill="#221A33"/><circle cx="72" cy="116" r="6" fill="#C9C3D6"/>'+
        '<circle class="o" cx="178" cy="116" r="15" fill="#221A33"/><circle cx="178" cy="116" r="6" fill="#C9C3D6"/>'
      );
    },
    planetzoo: function(bg){
      var spots=[[146,100,5,4],[160,97,6,4],[169,107,4,3],[151,110,4,3],[137,82,3,4],[131,66,3,3],[140,94,3,3]].map(function(s){return '<ellipse cx="'+s[0]+'" cy="'+s[1]+'" rx="'+s[2]+'" ry="'+s[3]+'"/>';}).join('');
      return frame(bg,
        '<circle class="o" cx="204" cy="30" r="13" fill="#F2C230"/>'+
        '<path class="o" d="M54 136 L58 92 L50 78 L56 76 L62 88 L70 76 L76 78 L64 94 L64 136 Z" fill="#8A5A36"/>'+
        '<ellipse class="o" cx="62" cy="72" rx="40" ry="12" fill="#4F8A2E"/><ellipse class="o" cx="68" cy="60" rx="26" ry="9" fill="#5FA036"/>'+
        '<g class="o" fill="#F2B544"><rect x="136" y="106" width="6" height="32"/><rect x="146" y="106" width="6" height="32"/><rect x="160" y="106" width="6" height="32"/><rect x="170" y="106" width="6" height="32"/></g>'+
        '<path d="M178 98 Q190 104 187 118" fill="none" stroke="#221A33" stroke-width="2.5" stroke-linecap="round"/>'+
        '<ellipse class="o" cx="156" cy="102" rx="26" ry="14" fill="#F2B544"/>'+
        '<path class="o" d="M134 100 L122 54 L134 50 L148 96 Z" fill="#F2B544"/>'+
        '<path d="M124 46 L122 36 M131 45 L131 35" stroke="#221A33" stroke-width="2.5" stroke-linecap="round"/><circle cx="122" cy="35" r="2.6" fill="#8A5A36" stroke="#221A33" stroke-width="1.5"/><circle cx="131" cy="34" r="2.6" fill="#8A5A36" stroke="#221A33" stroke-width="1.5"/>'+
        '<ellipse class="o" cx="120" cy="51" rx="13" ry="7.5" fill="#F2B544" transform="rotate(-12 120 51)"/>'+
        '<ellipse cx="136" cy="45" rx="5" ry="2.6" fill="#F2B544" stroke="#221A33" stroke-width="2" transform="rotate(25 136 45)"/>'+
        '<circle cx="115" cy="49" r="1.8" fill="#221A33"/>'+
        '<g fill="#B5652B">'+spots+'</g>'+
        '<path d="M14 116 H226 M14 128 H226" stroke="#221A33" stroke-width="8" stroke-linecap="round"/><path d="M14 116 H226 M14 128 H226" stroke="#B5803F" stroke-width="4" stroke-linecap="round"/>'+
        '<g class="o" fill="#C98B55"><rect x="22" y="108" width="7" height="30" rx="2"/><rect x="78" y="108" width="7" height="30" rx="2"/><rect x="134" y="108" width="7" height="30" rx="2"/><rect x="190" y="108" width="7" height="30" rx="2"/></g>'
      );
    },
    lego: function(bg){
      var brick=function(x,y,w,c){var s='',n=Math.round(w/12);for(var k=0;k<n;k++){s+='<rect class="o" x="'+(x+3+k*12)+'" y="'+(y-5)+'" width="7" height="6" rx="1.5" fill="'+c+'"/>';}return s+'<rect class="o" x="'+x+'" y="'+y+'" width="'+w+'" height="18" rx="2" fill="'+c+'"/>';};
      return frame(bg,
        spark(30,24,4,'#FFF6D8')+spark(116,16,3,'#FFF6D8')+spark(214,96,3.5,'#FFF6D8')+spark(20,92,3,'#FFF6D8')+spark(150,40,2.5,'#FFF6D8')+spark(88,46,2.5,'#FFF6D8')+
        '<circle class="o" cx="52" cy="48" r="15" fill="#E4572E"/><path d="M40 44 Q52 40 64 45" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>'+
        '<ellipse cx="52" cy="50" rx="27" ry="6" fill="none" stroke="#F2C230" stroke-width="3" transform="rotate(-18 52 50)"/>'+
        '<g transform="rotate(38 184 52)">'+
          '<path class="o" d="M176 66 Q184 86 192 66 Z" fill="#F2C230"/>'+
          '<path class="o" d="M176 56 L167 69 L176 66 Z M192 56 L201 69 L192 66 Z" fill="#D7263D"/>'+
          '<rect class="o" x="176" y="36" width="16" height="30" rx="3" fill="#E9E4F0"/>'+
          '<path class="o" d="M176 37 Q184 18 192 37 Z" fill="#D7263D"/>'+
          '<circle class="o" cx="184" cy="47" r="4" fill="#5BC0EB" style="stroke-width:2"/>'+
        '</g>'+
        brick(56,118,48,'#D7263D')+brick(104,118,48,'#3E7CB1')+brick(152,118,36,'#F2C230')+
        brick(80,100,48,'#F2C230')+brick(128,100,36,'#2A7F39')+
        brick(98,82,36,'#E9E4F0')
      );
    },
    hades: function(bg){
      var keys=''; for(var x=93;x<=141;x+=9){ keys+='M'+x+' 100 V94 H'+(x+6)+' V98 H'+(x+3)+' '; }
      return frame(bg,
        '<g fill="#F2C230"><circle cx="40" cy="52" r="2"/><circle cx="200" cy="38" r="2.4"/><circle cx="62" cy="92" r="1.8"/><circle cx="212" cy="84" r="2"/><circle cx="178" cy="22" r="1.6"/><circle cx="28" cy="110" r="1.6"/></g>'+
        '<path class="o" d="M120 18 Q140 46 152 38 Q158 70 170 64 Q172 100 152 132 H88 Q68 100 70 64 Q82 70 88 38 Q100 46 120 18 Z" fill="#E4572E"/>'+
        '<path d="M120 44 Q132 62 141 58 Q146 86 140 112 H100 Q94 86 99 58 Q108 62 120 44 Z" fill="#F2C230"/>'+
        '<path class="o" d="M108 72 Q90 70 92 88 M132 72 Q150 70 148 88" fill="none"/>'+
        '<path class="o" d="M104 56 H136 V62 Q136 66 132 68 Q154 80 152 106 Q150 128 132 136 H108 Q90 128 88 106 Q86 80 108 68 Q104 66 104 62 Z" fill="#C0703A"/>'+
        '<path d="M90.5 92 H149.5 L150.5 102 H89.5 Z" fill="#221A33"/>'+
        '<path d="'+keys+'" fill="none" stroke="#F2C230" stroke-width="1.5" stroke-linejoin="round"/>'+
        '<path d="M94 112 Q120 120 146 112" stroke="#221A33" stroke-width="2" fill="none" stroke-opacity=".5"/>'+
        '<rect class="o" x="106" y="134" width="28" height="6" rx="2" fill="#8A4A22"/>'+
        '<path class="o" d="M179 112 L181 104 L184 110 L187 104 L189 112 Z" fill="#B71F38"/>'+
        '<circle class="o" cx="184" cy="125" r="14" fill="#C2243C"/><path d="M176 120 Q180 115 186 116" stroke="#fff" stroke-opacity=".4" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
      );
    },
    portal: function(bg){
      var panels=''; [8,48,88].forEach(function(y){ [6,54,102,150,198].forEach(function(x){ panels+='<rect x="'+x+'" y="'+y+'" width="44" height="36" rx="2"/>'; }); });
      return frame(bg,
        '<g fill="#E3E8EE" stroke="#AEB8C3" stroke-width="1.5">'+panels+'</g>'+
        '<rect x="0" y="124" width="240" height="36" fill="#7E8894"/><path d="M0 124 H240" stroke="#221A33" stroke-width="2.5"/>'+
        '<rect class="o" x="164" y="82" width="34" height="42" rx="2" fill="#5A616B"/><path d="M181 82 V124" stroke="#221A33" stroke-width="2"/><circle cx="176" cy="104" r="1.8" fill="#E3E8EE"/><circle cx="186" cy="104" r="1.8" fill="#E3E8EE"/>'+
        '<rect class="o" x="156" y="50" width="50" height="24" rx="3" fill="#2A7F39"/>'+
        '<path d="M167 62 H192 M185 55.5 L192 62 L185 68.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+
        '<ellipse class="o" cx="88" cy="132" rx="32" ry="7" fill="#5A616B"/><ellipse class="o" cx="88" cy="127" rx="24" ry="5" fill="#D7263D"/>'+
        '<polygon class="o" points="70,92 80,82 116,82 106,92" fill="#C3CAD2"/>'+
        '<polygon class="o" points="106,92 116,82 116,116 106,126" fill="#7E8894"/>'+
        '<rect class="o" x="70" y="92" width="36" height="34" fill="#9AA3AE"/>'+
        '<rect x="80" y="101" width="16" height="16" rx="2" fill="none" stroke="#5A616B" stroke-width="2"/>'
      );
    },
    zelda: function(bg){ return frame(bg,
      '<path d="M4 134 L34 98 L50 116 L74 86 L104 132 Z" fill="#3E8FB8" fill-opacity=".55"/>'+
      '<path d="M150 134 L184 102 L200 118 L226 94 L244 134 Z" fill="#3E8FB8" fill-opacity=".45"/>'+
      '<path d="M186 58 H216 Q212 68 201 74 Q190 68 186 58 Z" fill="#8A7560" stroke="#221A33" stroke-width="2"/><path d="M184 56 Q201 51 218 56 Q218 60 214 60 H188 Q184 60 184 56 Z" fill="#8FD14F" stroke="#221A33" stroke-width="2"/>'+
      '<rect x="157" y="72" width="8" height="58" fill="#fff" fill-opacity=".85"/><path d="M159 80 V120 M163 86 V126" stroke="#BFE3F2" stroke-width="1.5"/>'+
      '<path class="o" d="M70 70 H170 Q166 86 152 92 Q140 112 124 116 Q118 126 112 116 Q98 108 92 94 Q76 86 70 70 Z" fill="#8A7560"/>'+
      '<path d="M96 90 Q110 98 128 92 M108 104 Q118 108 126 104" stroke="#221A33" stroke-width="2" fill="none" stroke-opacity=".35" stroke-linecap="round"/>'+
      '<path class="o" d="M66 68 Q120 58 174 68 Q174 74 170 74 H70 Q66 74 66 68 Z" fill="#8FD14F"/>'+
      '<rect class="o" x="100" y="44" width="7" height="22" fill="#6B4B34"/>'+
      '<g class="o" fill="#2A7F39"><circle cx="92" cy="46" r="9"/><circle cx="115" cy="46" r="9"/><circle cx="103.5" cy="38" r="13"/></g>'+
      '<rect class="o" x="138" y="52" width="7" height="16" fill="#D9D3C4"/><rect class="o" x="154" y="52" width="7" height="16" fill="#D9D3C4"/><rect class="o" x="134" y="46" width="31" height="7" rx="1" fill="#D9D3C4"/>'+
      '<path d="M0 132 Q20 120 40 130 Q60 116 84 128 Q104 118 124 130 Q146 116 168 128 Q190 118 212 130 Q228 122 240 128 V160 H0 Z" fill="#fff" fill-opacity=".92"/>'+
      '<path d="M184 32 l5 4 l5 -4 M200 24 l4 3 l4 -3" stroke="#221A33" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      false
    );},
    musique: function(bg){ return frame(bg,
      '<circle class="o" cx="150" cy="82" r="48" fill="#221A33"/>'+
      '<g fill="none" stroke="#3E3552" stroke-width="1.5"><circle cx="150" cy="82" r="40"/><circle cx="150" cy="82" r="32"/><circle cx="150" cy="82" r="24"/></g>'+
      '<path d="M118 56 A40 40 0 0 1 150 42" stroke="#fff" stroke-opacity=".28" stroke-width="3" fill="none" stroke-linecap="round"/>'+
      '<circle cx="150" cy="82" r="14" fill="#F2C230"/><circle cx="150" cy="82" r="2.5" fill="#221A33"/>'+
      '<path d="M44 106 V88 A36 36 0 0 1 116 88 V106" fill="none" stroke="#221A33" stroke-width="12" stroke-linecap="round"/>'+
      '<path d="M44 106 V88 A36 36 0 0 1 116 88 V106" fill="none" stroke="#E9E4F0" stroke-width="6" stroke-linecap="round"/>'+
      '<rect class="o" x="32" y="90" width="24" height="38" rx="10" fill="#E86A92"/><rect class="o" x="104" y="90" width="24" height="38" rx="10" fill="#E86A92"/>'+
      '<path d="M195 46 V20 M217 40 V14" stroke="#221A33" stroke-width="3"/>'+
      '<path class="o" d="M195 19 L217 13 V20 L195 26 Z" fill="#fff"/>'+
      '<ellipse class="o" cx="189" cy="48" rx="7" ry="5.5" fill="#fff" transform="rotate(-20 189 48)"/><ellipse class="o" cx="211" cy="42" rx="7" ry="5.5" fill="#fff" transform="rotate(-20 211 42)"/>'+
      '<path d="M34 42 V18 q10 4 9 15" fill="none" stroke="#221A33" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<ellipse class="o" cx="28" cy="44" rx="7" ry="5.5" fill="#fff" transform="rotate(-20 28 44)"/>'
    );},
    spiritfarer: function(bg){ return frame(bg,
      spark(40,30,5,'#FFF6D8')+spark(70,16,3.5,'#FFF6D8')+spark(104,34,3,'#FFF6D8')+spark(150,20,4,'#FFF6D8')+spark(218,70,3,'#FFF6D8')+spark(22,64,3,'#FFF6D8')+
      '<circle cx="190" cy="36" r="16" fill="#F6E7B0"/><circle cx="198" cy="30" r="14" fill="'+bg+'"/>'+
      '<circle cx="84" cy="82" r="22" fill="#F6E7B0" fill-opacity=".28"/>'+
      '<path d="M120 106 V38" stroke="#221A33" stroke-width="3.5" stroke-linecap="round"/>'+
      '<path class="o" d="M120 38 L134 42 L120 46 Z" fill="#E4572E"/>'+
      '<path class="o" d="M125 48 V98 H170 Z" fill="#FFF8EC"/>'+
      '<path d="M70 106 L66 70 H86" fill="none" stroke="#221A33" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<path d="M84 70 V75" stroke="#221A33" stroke-width="2"/><rect class="o" x="78" y="75" width="12" height="15" rx="3" fill="#F2C230"/>'+
      '<path class="o" d="M52 104 H188 L172 126 Q120 134 68 126 Z" fill="#C98B55"/><path d="M62 113 H180" stroke="#221A33" stroke-width="2" stroke-opacity=".5"/>'+
      '<path d="M0 122 Q15 116 30 122 T60 122 T90 122 T120 122 T150 122 T180 122 T210 122 T240 122 V160 H0 Z" fill="#1A5F57"/>'+
      '<path d="M78 134 H92 M82 142 H90 M140 136 H170 M58 150 H80 M180 146 H200" stroke="#F6E7B0" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>',
      false
    );},
    mouse: function(bg){
      var holes=''; for(var x=6;x<240;x+=16){ holes+='<rect x="'+x+'" y="3" width="8" height="6" rx="1.5"/><rect x="'+x+'" y="151" width="8" height="6" rx="1.5"/>'; }
      return frame(bg,
        '<rect width="240" height="12" fill="#221A33"/><rect y="148" width="240" height="12" fill="#221A33"/><g fill="#F4ECD8">'+holes+'</g>'+
        '<path class="o" d="M20 140 H62 V120 Z" fill="#F2C230"/><circle cx="50" cy="133" r="3" fill="#C9962A"/><circle cx="56" cy="127" r="2" fill="#C9962A"/><circle cx="40" cy="137" r="2" fill="#C9962A"/>'+
        '<ellipse class="o" cx="88" cy="114" rx="50" ry="11" fill="#2B2733"/>'+
        '<path class="o" d="M58 113 Q56 74 88 70 Q120 74 118 113 Z" fill="#2B2733"/>'+
        '<path d="M58.5 100 Q88 106 117.5 100 L118 110 Q88 116 58 110 Z" fill="#F4ECD8"/>'+
        '<path d="M76 78 Q88 88 100 78" stroke="#4A4458" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
        '<path d="M174 116 L200 140" stroke="#221A33" stroke-width="13" stroke-linecap="round"/><path d="M174 116 L200 140" stroke="#6B4B34" stroke-width="7" stroke-linecap="round"/>'+
        '<circle cx="158" cy="98" r="24" fill="#F4ECD8" fill-opacity=".45" stroke="#221A33" stroke-width="8"/><circle cx="158" cy="98" r="24" fill="none" stroke="#5A5266" stroke-width="3"/>'+
        '<path d="M144 88 Q150 80 160 80" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-opacity=".85"/>'
      );
    },
    sonicorigins: function(bg){ return frame(bg,
      pxStar(36,34)+pxStar(204,34)+pxStar(24,98)+pxStar(150,22,'#F2C230')+
      '<rect class="o" x="52" y="88" width="120" height="38" rx="7" fill="#2B2733"/>'+
      '<rect class="o" x="96" y="52" width="32" height="42" rx="3" fill="#3A3354"/>'+
      '<rect x="101" y="58" width="22" height="20" rx="1.5" fill="#F2C230"/><path d="M101 69 H123 M101 74 H123" stroke="#E4572E" stroke-width="2.5"/>'+
      '<rect x="90" y="90" width="44" height="6" rx="2" fill="#3A3354" stroke="#221A33" stroke-width="2"/>'+
      '<circle cx="64" cy="114" r="3" fill="#D7263D"/><rect x="72" y="100" width="14" height="6" rx="3" fill="#4A4458"/>'+
      '<path d="M140 104 H160 M140 110 H160 M140 116 H160" stroke="#4A4458" stroke-width="2.5" stroke-linecap="round"/>'+
      '<path d="M172 110 Q188 98 196 116" fill="none" stroke="#221A33" stroke-width="3" stroke-linecap="round"/>'+
      '<rect class="o" x="166" y="116" width="58" height="24" rx="12" fill="#2B2733"/>'+
      '<path d="M178 124 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="#C9C3D6"/>'+
      '<circle cx="202" cy="132" r="3" fill="#F2C230"/><circle cx="209" cy="128" r="3" fill="#E4572E"/><circle cx="216" cy="124" r="3" fill="#5BC0EB"/>'
    );},
    soniccolors: function(bg){
      var cx=120, cy=62, R=34, gond='', spokes='';
      var cols=['#F2C230','#5BC0EB','#E4572E','#8FD14F','#F08A24','#FFD6E4','#7A4EAB','#fff'];
      for(var k=0;k<8;k++){ var a=k*Math.PI/4, x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
        spokes+='M'+cx+' '+cy+' L'+x.toFixed(1)+' '+y.toFixed(1)+' ';
        gond+='<rect class="o" x="'+(x-6).toFixed(1)+'" y="'+(y-2).toFixed(1)+'" width="12" height="10" rx="3" fill="'+cols[k]+'" style="stroke-width:2"/>'; }
      return frame(bg,
        spark(28,26,4,'#FFF6D8')+spark(214,22,3.5,'#FFF6D8')+spark(206,84,3,'#FFF6D8')+spark(30,90,3,'#FFF6D8')+spark(176,16,2.5,'#FFF6D8')+
        '<circle class="o" cx="42" cy="50" r="9" fill="#5BC0EB"/><circle class="o" cx="200" cy="50" r="7" fill="#F2C230"/>'+
        '<path d="M120 62 L98 120 M120 62 L142 120" stroke="#221A33" stroke-width="5" stroke-linecap="round"/>'+
        '<circle cx="120" cy="62" r="34" fill="none" stroke="#221A33" stroke-width="7"/><circle cx="120" cy="62" r="34" fill="none" stroke="#fff" stroke-width="3"/>'+
        '<path d="'+spokes+'" stroke="#fff" stroke-width="2" stroke-opacity=".9"/>'+
        '<circle class="o" cx="120" cy="62" r="5" fill="#F2C230"/>'+gond+
        '<circle class="o" cx="120" cy="226" r="112" fill="#6A3FA0"/>'+
        '<ellipse cx="72" cy="132" rx="12" ry="4" fill="#4E2C7A"/><ellipse cx="164" cy="130" rx="9" ry="3" fill="#4E2C7A"/><ellipse cx="118" cy="146" rx="14" ry="4" fill="#4E2C7A"/>',
        false
      );
    },
    sonicmania: function(bg){
      var id='scr'+(++clipN), P=4, ox=62, oy=40, r='';
      var row=function(y,c0,c1,col){ r+='<rect x="'+(ox+c0*P)+'" y="'+(oy+y*P)+'" width="'+((c1-c0+1)*P)+'" height="'+P+'" fill="'+col+'"/>'; };
      [[0,3,'#2B2D6E'],[4,6,'#5B3B99'],[7,9,'#C2477A'],[10,11,'#F08A24'],[12,15,'#221A33']].forEach(function(b){ for(var y=b[0];y<=b[1];y++) row(y,0,25,b[2]); });
      [[7,11,15],[8,10,16],[9,9,17],[10,9,17],[11,9,17]].forEach(function(s){ row(s[0],s[1],s[2],'#F2C230'); });
      r+='<rect x="'+(ox+9*P)+'" y="'+(oy+9*P+3)+'" width="'+(9*P)+'" height="1.5" fill="#C2477A"/><rect x="'+(ox+9*P)+'" y="'+(oy+10*P+2)+'" width="'+(9*P)+'" height="1.5" fill="#F08A24"/>';
      [[8,3,4],[9,2,6],[10,1,8],[11,0,10],[9,20,21],[10,18,23],[11,16,25]].forEach(function(s){ row(s[0],s[1],s[2],'#3A2A5E'); });
      r+='<rect x="'+ox+'" y="'+(oy+13*P+1)+'" width="104" height="1.5" fill="#E86A92" fill-opacity=".7"/><rect x="'+ox+'" y="'+(oy+15*P)+'" width="104" height="1.5" fill="#E86A92" fill-opacity=".7"/>';
      return frame(bg,
        pxStar(30,36)+pxStar(206,30)+pxStar(210,96)+pxStar(22,104)+pxStar(196,62,'#F2C230')+
        '<path class="o" d="M100 118 L94 134 H134 L128 118 Z" fill="#B8B1A2"/>'+
        '<rect class="o" x="50" y="28" width="128" height="90" rx="14" fill="#D9D3C4"/>'+
        '<rect x="58" y="36" width="112" height="72" rx="10" fill="#221A33"/>'+
        '<clipPath id="'+id+'"><rect x="62" y="40" width="104" height="64" rx="8"/></clipPath>'+
        '<g clip-path="url(#'+id+')">'+r+'</g>'+
        '<path d="M70 48 Q92 43 116 45" stroke="#fff" stroke-opacity=".22" stroke-width="3" fill="none" stroke-linecap="round"/>'+
        '<circle cx="64" cy="112" r="2.5" fill="#6CC56F"/><rect x="140" y="110" width="10" height="4" rx="2" fill="#8A8398"/><rect x="154" y="110" width="10" height="4" rx="2" fill="#8A8398"/>'
      );
    },
    generic: function(bg){ return frame(bg,
      '<g stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-opacity=".85"><path d="M120 18 V8"/><path d="M160 34 L167 27"/><path d="M80 34 L73 27"/><path d="M176 64 H186"/><path d="M64 64 H54"/><path d="M162 92 L169 99"/><path d="M78 92 L71 99"/></g>'+
      '<path class="o" d="M120 32 A30 30 0 0 1 138 86 V96 H102 V86 A30 30 0 0 1 120 32 Z" fill="#FFF6D8"/>'+
      '<path d="M112 82 L116 68 L120 78 L124 68 L128 82" fill="none" stroke="#E4572E" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'+
      '<rect class="o" x="104" y="96" width="32" height="8" rx="2" fill="#C9C3D6"/><rect class="o" x="108" y="104" width="24" height="8" rx="3" fill="#C9C3D6"/>'+
      '<path class="o" d="M114 112 H126 L122 118 H118 Z" fill="#8A8398"/>',
      false
    );}
  };
  window.JFQ = { DEFAULTS: DEFAULTS, EXTRA_COLORS: EXTRA_COLORS, ART: ART };
})();
