/* Zero Grau Frios & Cortes — interações do site (sem dependências) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  // ===== CONFIGURAÇÃO =====
  // WhatsApp: DDI + DDD + número, só dígitos.
  // TROCAR: o número abaixo é o telefone fixo do Google, (69) 3321-3901, usado como PALPITE.
  // Confirme qual número atende no WhatsApp (o link do Instagram leva ao linktr.ee da loja).
  var WHATSAPP = '556933213901';

  // Horário normal (0 = domingo … 6 = sábado), em horas cheias [abre, fecha]. Fonte: Google.
  // ATENÇÃO: a bio do Instagram diz "segunda a sábado das 7h às 22h, domingo das 7h às 13h". Confirmar qual vale.
  var HORARIO = { 0: [8, 13], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [8, 20] };

  // Datas com horário diferente (AAAA-MM-DD): [abre, fecha] ou null = fechado.
  var HORARIO_ESPECIAL = {
    // '2026-12-24': [8, 16],
    // '2026-12-25': null,
  };

  // Feriados sem horário confirmado: nesses dias o site não diz "aberto/fechado", pede para confirmar.
  var FERIADOS_FIXOS = {
    '01-01': 'Ano Novo', '01-04': 'Criação de Rondônia', '04-21': 'Tiradentes', '05-01': 'Dia do Trabalho',
    '06-18': 'Dia do Evangélico (RO)', '09-07': 'Independência', '10-12': 'Nossa Senhora Aparecida',
    '11-02': 'Finados', '11-15': 'Proclamação da República', '11-20': 'Consciência Negra',
    '11-23': 'Aniversário de Vilhena', // confirmar se é feriado municipal
    '12-25': 'Natal'
  };
  // Dias em relação à Páscoa: Carnaval (segunda e terça), Sexta-feira Santa, Corpus Christi
  var FERIADOS_MOVEIS = { '-48': 'Carnaval', '-47': 'Carnaval', '-2': 'Sexta-feira Santa', '60': 'Corpus Christi' };

  // Churrasco: gramas de carne por pessoa (estimativa média)
  var G_ADULTO = 400, G_CRIANCA = 200;

  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Utilidades =====
  function waUrl(msg) { return 'https://wa.me/' + WHATSAPP + (msg ? '?text=' + encodeURIComponent(msg) : ''); }

  // Envia eventos para GTM/GA4/Meta Pixel se estiverem instalados. Sem eles, não faz nada.
  function track(event, data) {
    data = data || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data));
    if (typeof window.gtag === 'function') window.gtag('event', event, data);
    if (typeof window.fbq === 'function') {
      if (event === 'generate_lead') window.fbq('track', 'Lead', data);
      else if (event === 'whatsapp_click') window.fbq('track', 'Contact', data);
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
  function horarioDo(t) { var k = chave(t); return tem(HORARIO_ESPECIAL, k) ? HORARIO_ESPECIAL[k] : HORARIO[t.dow]; }
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
  function feriadoIncerto(t) { return !tem(HORARIO_ESPECIAL, chave(t)) && ehFeriado(t); }
  function hh(h) { return h + 'h'; }

  // estado: 'aberto' | 'fechando' | 'fechado' | 'feriado'
  function statusLoja() {
    var t = agoraVilhena();
    if (feriadoIncerto(t)) return { estado: 'feriado', texto: 'Feriado · confirme o horário no WhatsApp' };
    var hoje = horarioDo(t);
    if (hoje && t.min >= hoje[0] * 60 && t.min < hoje[1] * 60) {
      var falta = hoje[1] * 60 - t.min;
      if (falta <= 60) return { estado: 'fechando', texto: 'Aberto · fecha em ' + falta + ' min' };
      return { estado: 'aberto', texto: 'Aberto agora · fecha às ' + hh(hoje[1]) };
    }
    if (hoje && t.min < hoje[0] * 60) return { estado: 'fechado', texto: 'Fechado agora · abre hoje às ' + hh(hoje[0]) };
    if (feriadoIncerto(somaDias(t, 1))) return { estado: 'fechado', texto: 'Fechado agora · amanhã é feriado: confirme o horário' };
    for (var i = 1; i <= 7; i++) {
      var dia = somaDias(t, i), h = horarioDo(dia);
      if (h) return { estado: 'fechado', texto: 'Fechado agora · abre ' + (i === 1 ? 'amanhã' : DIAS[dia.dow]) + ' às ' + hh(h[0]) };
    }
    return { estado: 'fechado', texto: 'Fechado agora' };
  }

  function pintaStatus() {
    var s = statusLoja(), aberto = s.estado === 'aberto' || s.estado === 'fechando';
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.classList.toggle('is-open', aberto);
      el.classList.toggle('is-closed', s.estado === 'fechado');
      el.classList.toggle('is-holiday', s.estado === 'feriado');
      el.querySelector('.status-text').textContent = s.texto;
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
  }
  pintaStatus();
  setInterval(pintaStatus, 60 * 1000);

  // ===== Links de WhatsApp com mensagem pronta =====
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-msg'));
    a.target = '_blank';
    a.rel = 'noopener';
    if (a.id === 'builder-send' || a.id === 'calc-send') return; // registram o próprio evento
    a.addEventListener('click', function () { track('whatsapp_click', { source: a.getAttribute('data-source') || '' }); });
  });
  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { track(a.getAttribute('data-track'), { source: a.getAttribute('data-source') || '' }); });
  });

  // ===== Entrada, cabeçalho, revelar ao rolar =====
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); });

  var header = document.querySelector('.site-header');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (Math.abs(y - lastY) > 6) {
      header.classList.toggle('is-hidden', y > lastY && y > 500 && !header.contains(document.activeElement));
      lastY = y;
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  document.querySelectorAll('.reveal').forEach(function (el) { if (io && !reduce) io.observe(el); else el.classList.add('is-in'); });

  // Números contando (o valor real fica no HTML; a contagem começa junto com a entrada)
  var fmt = function (v, dec) { return v.toFixed(dec).replace('.', ','); };
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    var nio = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return;
      nio.disconnect();
      var t0 = performance.now(), dur = 1300;
      el.textContent = fmt(0, dec);
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(end * k, dec);
        if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end, dec);
      })(t0);
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nio.observe(el);
  });

  // ===== Monte sua encomenda =====
  var form = document.getElementById('builder');
  if (form) {
    var preview = document.getElementById('builder-preview');
    var status = document.getElementById('builder-status');
    var send = document.getElementById('builder-send');
    var GERAL = send.getAttribute('data-msg');
    var val = function (name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; };

    var compose = function () {
      var corte = val('corte'), qtd = val('qtd'), preparo = val('preparo'), quando = val('quando');
      var obs = form.querySelector('#f-obs').value.trim().replace(/[\s.!?…]+$/, '');
      if (!corte && !qtd && !preparo && !quando && !obs) return GERAL;
      var pedido = '';
      if (corte || qtd) pedido = 'Quero encomendar ' + (qtd ? qtd + ' de ' : '') + (corte || 'carne') + (preparo ? ', ' + preparo : '') + '.';
      else if (preparo) pedido = 'Quero a carne ' + preparo + '.';
      var partes = ['Olá, Zero Grau! Vim pelo site.'];
      if (pedido) partes.push(pedido);
      if (quando) partes.push('É para ' + quando + '.');
      if (obs) partes.push('Obs.: ' + obs + '.');
      partes.push('Podem confirmar o preço e a disponibilidade?');
      return partes.join(' ');
    };
    var refresh = function () { var m = compose(); preview.textContent = m; send.href = waUrl(m); };
    form.addEventListener('input', refresh);
    form.addEventListener('change', function () { refresh(); if (status) status.textContent = 'Mensagem atualizada: ' + preview.textContent; });
    form.addEventListener('reset', function () { setTimeout(refresh, 0); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    send.addEventListener('click', function () {
      var m = compose();
      if (m === GERAL) { track('whatsapp_click', { source: 'encomenda' }); return; }
      track('generate_lead', { source: 'encomenda', corte: val('corte'), qtd: val('qtd') });
    });
    refresh();
  }

  // ===== Calculadora de churrasco =====
  var calc = document.getElementById('calc');
  if (calc) {
    var n = { adultos: 10, criancas: 2 };
    var calcSend = document.getElementById('calc-send');
    var pinta = function () {
      document.getElementById('n-adultos').textContent = n.adultos;
      document.getElementById('n-criancas').textContent = n.criancas;
      var kg = (n.adultos * G_ADULTO + n.criancas * G_CRIANCA) / 1000;
      var kgTxt = fmt(kg, kg % 1 === 0 ? 0 : 1);
      document.getElementById('kg').textContent = kgTxt;
      var quem = n.adultos + (n.adultos === 1 ? ' adulto' : ' adultos') + (n.criancas ? ' e ' + n.criancas + (n.criancas === 1 ? ' criança' : ' crianças') : '');
      var msg = 'Olá, Zero Grau! Vim pelo site. Vou fazer um churrasco para ' + quem + ' (cerca de ' + kgTxt + ' kg de carne). Me ajudam a escolher os cortes?';
      calcSend.href = waUrl(msg);
      calcSend.setAttribute('data-msg', msg);
    };
    calc.querySelectorAll('[data-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-step');
        n[k] = Math.max(k === 'adultos' ? 1 : 0, Math.min(200, n[k] + parseInt(b.getAttribute('data-d'), 10)));
        pinta();
      });
    });
    calcSend.addEventListener('click', function () { track('generate_lead', { source: 'churrasco', adultos: n.adultos, criancas: n.criancas }); });
    pinta();
  }

  // ===== CTA fixo: aparece quando o botão do topo sai da tela; some na encomenda, no churrasco e no final =====
  var sticky = document.getElementById('sticky-cta');
  var heroCta = document.getElementById('hero-cta');
  var zonas = ['acougue', 'churrasco', 'final'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (sticky && heroCta && 'IntersectionObserver' in window) {
    var heroVis = true, zonaVis = {}, digitando = false;
    var update = function () {
      var emZona = Object.keys(zonaVis).some(function (k) { return zonaVis[k]; });
      var show = !heroVis && !emZona && !digitando;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      sticky.querySelectorAll('a').forEach(function (a) { a.tabIndex = show ? 0 : -1; });
    };
    new IntersectionObserver(function (e) { heroVis = e[0].isIntersecting; update(); }, { rootMargin: '-70px 0px 0px 0px' }).observe(heroCta);
    zonas.forEach(function (z) { new IntersectionObserver(function (e) { zonaVis[z.id] = e[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(z); });
    document.addEventListener('focusin', function (e) { if (e.target.matches('input[type="text"]')) { digitando = true; update(); } });
    document.addEventListener('focusout', function (e) { if (e.target.matches('input[type="text"]')) { digitando = false; update(); } });
  }

  // Mapa só carrega quando a pessoa pede
  var mapBtn = document.getElementById('map-load');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = mapBtn.getAttribute('data-src');
      iframe.title = 'Mapa: Zero Grau Frios e Cortes, Av. Brg. Eduardo Gomes, 530, Vilhena-RO';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      mapBtn.replaceWith(iframe);
      track('map_open', {});
    });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
