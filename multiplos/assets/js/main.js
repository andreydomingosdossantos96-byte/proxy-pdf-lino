/* Múltiplos Atacado — interações (sem bibliotecas) */
(function () {
  'use strict';

  // ===== CONFIGURAÇÃO =====
  // WhatsApp: DDI + DDD + número, só dígitos.
  // TROCAR se preciso: (69) 3322-1007 aparece com o ícone do WhatsApp no cartaz oficial da loja. Confirmar.
  var WHATSAPP = '556933221007';

  // Horário normal (0 = domingo … 6 = sábado), em horas cheias [abre, fecha]. Fonte: Google e bio do Instagram.
  var HORARIO = { 0: [8, 13], 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [8, 18] };

  // Datas com horário diferente (AAAA-MM-DD): [abre, fecha] ou null = fechado.
  var HORARIO_ESPECIAL = {
    '2026-10-12': [8, 18], // Dia das Crianças (cartaz da loja)
    // '2026-12-24': [8, 16],
  };

  // Feriados sem horário confirmado: nesses dias o site não diz "aberto/fechado", pede para confirmar no WhatsApp.
  // Valem para todos os anos. Quando a loja informar o horário de uma data, ponha a data em HORARIO_ESPECIAL.
  var FERIADOS_FIXOS = {
    '01-01': 'Ano Novo', '01-04': 'Criação de Rondônia', '04-21': 'Tiradentes', '05-01': 'Dia do Trabalho',
    '06-18': 'Dia do Evangélico (RO)', '09-07': 'Independência', '10-12': 'Nossa Senhora Aparecida',
    '11-02': 'Finados', '11-15': 'Proclamação da República', '11-20': 'Consciência Negra',
    '11-23': 'Aniversário de Vilhena', // confirmar se é feriado municipal
    '12-25': 'Natal'
  };
  // Dias em relação à Páscoa: Carnaval (segunda e terça), Sexta-feira Santa, Corpus Christi
  var FERIADOS_MOVEIS = { '-48': 'Carnaval', '-47': 'Carnaval', '-2': 'Sexta-feira Santa', '60': 'Corpus Christi' };

  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  // ===== Utilidades =====
  function waUrl(msg) {
    return 'https://wa.me/' + WHATSAPP + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }

  // Envia eventos para GTM/GA4/Meta Pixel se estiverem instalados. Sem eles, não faz nada.
  function track(event, data) {
    data = data || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data));
    if (typeof window.gtag === 'function') window.gtag('event', event, data);
    if (typeof window.fbq === 'function') {
      if (event === 'whatsapp_click') window.fbq('track', 'Contact', data);
      else window.fbq('trackCustom', event, data);
    }
  }

  // Hora local de Vilhena (Rondônia: UTC-4 o ano todo, sem horário de verão)
  function agoraVilhena() {
    var d = new Date(Date.now() - 4 * 3600 * 1000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), dow: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function chave(t) { return t.y + '-' + pad(t.m) + '-' + pad(t.d); }
  function somaDias(t, n) {
    var d = new Date(Date.UTC(t.y, t.m - 1, t.d + n));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), dow: d.getUTCDay(), min: 0 };
  }
  var tem = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  function horarioDo(t) {
    var k = chave(t);
    return tem(HORARIO_ESPECIAL, k) ? HORARIO_ESPECIAL[k] : HORARIO[t.dow];
  }
  // Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher), em ms UTC
  function pascoa(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      n = h + l - 7 * m + 114;
    return Date.UTC(y, Math.floor(n / 31) - 1, (n % 31) + 1);
  }
  function ehFeriado(t) {
    if (tem(FERIADOS_FIXOS, pad(t.m) + '-' + pad(t.d))) return true;
    var dif = Math.round((Date.UTC(t.y, t.m - 1, t.d) - pascoa(t.y)) / 864e5);
    return tem(FERIADOS_MOVEIS, String(dif));
  }
  // Feriado sem horário confirmado pela loja
  function feriadoIncerto(t) { return !tem(HORARIO_ESPECIAL, chave(t)) && ehFeriado(t); }
  function hh(h) { return h + 'h'; }

  // estado: 'aberto' | 'fechando' | 'fechado' | 'feriado'
  function statusLoja() {
    var t = agoraVilhena();
    if (feriadoIncerto(t)) {
      return { estado: 'feriado', texto: 'Feriado · horário pode mudar', curto: 'Feriado · confirme' };
    }
    var hoje = horarioDo(t);
    if (hoje && t.min >= hoje[0] * 60 && t.min < hoje[1] * 60) {
      var falta = hoje[1] * 60 - t.min;
      if (falta <= 60) return { estado: 'fechando', fecha: hh(hoje[1]), texto: 'Aberto · fecha em ' + falta + ' min', curto: 'Fecha em ' + falta + ' min' };
      return { estado: 'aberto', fecha: hh(hoje[1]), texto: 'Aberto agora · fecha às ' + hh(hoje[1]), curto: 'Aberto · fecha ' + hh(hoje[1]) };
    }
    if (hoje && t.min < hoje[0] * 60) {
      return { estado: 'fechado', abre: 'hoje às ' + hh(hoje[0]), texto: 'Fechado agora · abre hoje às ' + hh(hoje[0]), curto: 'Fechado · abre ' + hh(hoje[0]) };
    }
    var amanha = somaDias(t, 1);
    if (feriadoIncerto(amanha)) {
      return { estado: 'fechado', vespera: true, abre: null, texto: 'Fechado agora · amanhã é feriado: confirme o horário', curto: 'Fechado · amanhã é feriado' };
    }
    for (var i = 1; i <= 7; i++) {
      var dia = somaDias(t, i), h = horarioDo(dia);
      if (h) {
        var quando = (i === 1 ? 'amanhã' : DIAS[dia.dow]) + ' às ' + hh(h[0]);
        return { estado: 'fechado', abre: quando, texto: 'Fechado agora · abre ' + quando, curto: 'Fechado · abre ' + hh(h[0]) };
      }
    }
    return { estado: 'fechado', abre: 'em breve', texto: 'Fechado agora', curto: 'Fechado' };
  }


  // ===== WhatsApp: no máximo 4 pontos (cabeçalho, busca do topo, revenda, final) =====
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-msg'));
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () { track('whatsapp_click', { source: a.getAttribute('data-cta') || '' }); });
  });
  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { track(a.getAttribute('data-track'), {}); });
  });

  // Busca do topo: monta "Vocês têm X?" (sem JS o formulário envia o texto direto para o wa.me)
  var ask = document.getElementById('ask');
  if (ask) {
    ask.action = 'https://wa.me/' + WHATSAPP;
    var campo = ask.querySelector('input');
    ask.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var p = campo.value.trim().replace(/[\s.!?…]+$/, '')
        .replace(/^(oi[\s,!.]*)?((voc[eê]s|vcs|vc)\s+)?(tem\s+a[ií]|t[eê]m)\s+/i, '').replace(/^[¿?\s]+/, '');
      if (p && !/^[A-ZÀ-Ý]{2}/.test(p)) p = p.charAt(0).toLowerCase() + p.slice(1);
      var msg = p ? 'Oi, Múltiplos! Vi o site. Vocês têm ' + p + '? Se tiver, qual o preço?' : ask.getAttribute('data-msg');
      track('whatsapp_click', { source: 'hero', preenchido: p ? 'sim' : 'nao' });
      burst(ask.querySelector('button'));
      var url = waUrl(msg), win = window.open(url, '_blank');
      if (win) win.opener = null; else window.location.href = url;
    });
  }

  // ===== Status "aberto agora" + tabela de horários =====
  function pintaStatus() {
    var s = statusLoja(), aberto = s.estado === 'aberto' || s.estado === 'fechando';
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.classList.toggle('is-open', aberto);
      el.classList.toggle('is-closed', s.estado === 'fechado');
      el.classList.toggle('is-holiday', s.estado === 'feriado');
      el.querySelector('.status-text').textContent = el.hasAttribute('data-curto') ? s.curto : s.texto;
    });
    var t = agoraVilhena(), k = chave(t), especial = tem(HORARIO_ESPECIAL, k), incerto = feriadoIncerto(t);
    document.querySelectorAll('[data-dow]').forEach(function (row) {
      row.classList.toggle('is-today', !especial && !incerto && row.getAttribute('data-dow').split(',').map(Number).indexOf(t.dow) !== -1);
    });
    var linha = document.getElementById('hours-hoje');
    if (linha) {
      linha.hidden = !(especial || incerto);
      if (especial || incerto) {
        var he = HORARIO_ESPECIAL[k];
        linha.querySelector('th').textContent = incerto ? 'Hoje (feriado)' : 'Hoje (horário especial)';
        linha.querySelector('td').textContent = incerto ? 'confirme antes' : (he ? hh(he[0]) + ' às ' + hh(he[1]) : 'Fechado');
      }
    }
    var curto = document.getElementById('hoje-curto');
    if (curto) {
      var h = horarioDo(t);
      curto.textContent = incerto ? 'Hoje é feriado: confirme o horário' : (h ? 'Hoje: ' + hh(h[0]) + ' às ' + hh(h[1]) : 'Hoje: fechado');
    }
  }
  pintaStatus();
  setInterval(pintaStatus, 60 * 1000);

  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Botão-brinquedo: estrelinhas ao clicar (só decorativo) =====
  function burst(el) {
    if (reduz || !el || !el.animate) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 6; i++) {
      var s = document.createElement('span'), ang = (i / 6) * Math.PI * 2, d = 46 + (i % 2) * 18;
      s.className = 'spark'; s.style.left = cx + 'px'; s.style.top = cy + 'px';
      document.body.appendChild(s);
      s.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
                 { transform: 'translate(calc(-50% + ' + Math.cos(ang) * d + 'px), calc(-50% + ' + Math.sin(ang) * d + 'px)) scale(1) rotate(90deg)', opacity: 0 }],
                { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = (function (n) { return function () { n.remove(); }; })(s);
    }
  }
  document.querySelectorAll('a.toy').forEach(function (a) { a.addEventListener('click', function () { burst(a); }); });

  // ===== Cabeçalho some ao descer e volta ao subir =====
  var header = document.querySelector('.header'), lastY = window.scrollY, ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      var esconder = y > lastY && y > 160 && !header.contains(document.activeElement);
      header.classList.toggle('is-hidden', esconder && !reduz);
      lastY = y; ticking = false;
    });
  }, { passive: true });

  // ===== Um IntersectionObserver para tudo que entra na tela =====
  function conta(el) {
    var alvo = parseFloat(el.getAttribute('data-count')), casas = Number(el.getAttribute('data-decimals') || 0);
    var fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    if (reduz) return;
    var t0 = null;
    function passo(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 900), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(alvo * e);
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (el.matches('.hero, .marquee, .world')) { el.classList.toggle('is-paused', !e.isIntersecting); return; }
        if (!e.isIntersecting) return;
        el.classList.add('is-in');
        if (el.matches('.stats')) el.querySelectorAll('[data-count]').forEach(conta);
        io.unobserve(el);
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.reveal, .arch, .map, .stats, .jumble, .hero, .marquee, .world').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .arch, .map, .jumble').forEach(function (el) { el.classList.add('is-in'); });
  }

  // ===== Rodapé: toque num objeto e ele pula =====
  document.querySelectorAll('.jumble img').forEach(function (img) {
    img.addEventListener('click', function () {
      if (reduz || !img.animate) return;
      var r = getComputedStyle(img).getPropertyValue('--r').trim() || '0deg';
      img.animate([{ transform: 'translateY(0) rotate(' + r + ')' }, { transform: 'translateY(-26px) rotate(calc(' + r + ' + 10deg))' }, { transform: 'translateY(0) rotate(' + r + ')' }],
        { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    });
  });

  // ===== Caixa-surpresa dos achadinhos (sem preço, só para mostrar a variedade) =====
  var caixa = document.getElementById('surprise');
  if (caixa) {
    var achados = caixa.querySelectorAll('[data-find]'), n = -1, live = document.getElementById('surprise-live');
    var fechada = caixa.querySelector('.surprise-box:not(.surprise-box--open)'), aberta = caixa.querySelector('.surprise-box--open');
    var tag = caixa.querySelector('.surprise-tag');
    caixa.addEventListener('click', function () {
      if (n >= 0) achados[n].hidden = true;
      n = (n + 1) % achados.length;
      caixa.classList.add('is-open');
      fechada.hidden = true; aberta.hidden = false;
      var item = achados[n];
      item.hidden = false;
      live.textContent = 'Achado: ' + item.getAttribute('data-find');
      if (tag) tag.textContent = 'De novo!';
      track('caixa_surpresa', { item: item.getAttribute('data-find') });
    });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
