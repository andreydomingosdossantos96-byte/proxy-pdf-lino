/* Múltiplos Atacado — interações do site (sem dependências) */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  // ===== CONFIGURAÇÃO =====
  // WhatsApp: DDI + DDD + número, só dígitos.
  // TROCAR se preciso: (69) 3322-1007 aparece com o ícone do WhatsApp no cartaz oficial da loja. Confirmar.
  var WHATSAPP = '556933221007';

  // Horário normal (0 = domingo … 6 = sábado), em horas cheias [abre, fecha]. Fonte: Google e bio do Instagram.
  var HORARIO = { 0: [8, 13], 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [8, 18] };

  // Datas com horário diferente (AAAA-MM-DD). null = fechado. Fonte: cartaz "Final de semana das crianças".
  var HORARIO_ESPECIAL = {
    '2026-10-10': [8, 18],
    '2026-10-11': [8, 18],
    '2026-10-12': [8, 18]
  };

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
  function horarioDo(t) {
    var k = chave(t);
    return Object.prototype.hasOwnProperty.call(HORARIO_ESPECIAL, k) ? HORARIO_ESPECIAL[k] : HORARIO[t.dow];
  }
  function hh(h) { return h + 'h'; }

  function statusLoja() {
    var t = agoraVilhena();
    var hoje = horarioDo(t);
    if (hoje && t.min >= hoje[0] * 60 && t.min < hoje[1] * 60) {
      var falta = hoje[1] * 60 - t.min;
      return { aberto: true, texto: falta <= 60 ? 'Aberto agora · fecha em ' + falta + ' min' : 'Aberto agora · fecha às ' + hh(hoje[1]) };
    }
    if (hoje && t.min < hoje[0] * 60) return { aberto: false, texto: 'Fechado agora · abre hoje às ' + hh(hoje[0]) };
    for (var i = 1; i <= 7; i++) {
      var dia = somaDias(t, i), h = horarioDo(dia);
      if (h) return { aberto: false, texto: 'Fechado agora · abre ' + (i === 1 ? 'amanhã' : DIAS[dia.dow]) + ' às ' + hh(h[0]) };
    }
    return { aberto: false, texto: 'Fechado agora' };
  }

  // ===== Links de WhatsApp com mensagem pronta =====
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-msg'));
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () {
      track('whatsapp_click', { source: a.getAttribute('data-source') || 'desconhecido' });
    });
  });
  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () {
      track(a.getAttribute('data-track'), { source: a.getAttribute('data-source') || '' });
    });
  });

  // ===== Aberto agora / horário de hoje =====
  function pintaStatus() {
    var s = statusLoja();
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.classList.toggle('is-open', s.aberto);
      el.classList.toggle('is-closed', !s.aberto);
      var txt = el.querySelector('.status-text');
      if (txt) txt.textContent = s.texto;
    });
    var t = agoraVilhena();
    document.querySelectorAll('[data-dow]').forEach(function (row) {
      row.classList.toggle('is-today', Number(row.getAttribute('data-dow')) === t.dow);
    });
    // Linha "hoje" mostra o horário especial quando houver
    var hojeEl = document.getElementById('horario-hoje');
    if (hojeEl) {
      var h = horarioDo(t);
      hojeEl.textContent = h ? 'Hoje: ' + hh(h[0]) + ' às ' + hh(h[1]) : 'Hoje: fechado';
      hojeEl.hidden = false;
    }
  }
  pintaStatus();
  setInterval(pintaStatus, 60 * 1000);

  // ===== Faixas de campanha com data de validade =====
  // Cada faixa tem data-inicio e data-fim (AAAA-MM-DD, inclusive). Fora do período ela continua escondida.
  (function () {
    var hoje = chave(agoraVilhena());
    document.querySelectorAll('[data-campanha]').forEach(function (el) {
      var ini = el.getAttribute('data-inicio'), fim = el.getAttribute('data-fim');
      if ((!ini || hoje >= ini) && (!fim || hoje <= fim)) el.hidden = false;
    });
  })();

  // ===== Cabeçalho com sombra ao rolar =====
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ===== CTA fixo (barra no celular, botão redondo no desktop) =====
  // Aparece quando o CTA do topo sai da tela; some no CTA final
  var sticky = document.getElementById('sticky-cta');
  var floatBtn = document.querySelector('.wa-float');
  var heroCta = document.querySelector('.hero .hero-actions');
  var finalCta = document.getElementById('final');
  if (sticky && heroCta && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('has-io');
    var heroVisible = true, finalVisible = false;
    var update = function () {
      var show = !heroVisible && !finalVisible;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      sticky.querySelectorAll('a').forEach(function (a) { a.tabIndex = show ? 0 : -1; });
      if (floatBtn) floatBtn.classList.toggle('is-visible', show);
    };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); },
      { rootMargin: '-70px 0px 0px 0px' }).observe(heroCta);
    if (finalCta) new IntersectionObserver(function (e) { finalVisible = e[0].isIntersecting; update(); }).observe(finalCta);
  }

  // ===== "Procurando algo?" — monta a pergunta do produto =====
  var busca = document.getElementById('busca-form');
  if (busca) {
    var campo = busca.querySelector('#busca-produto');
    var enviar = document.getElementById('busca-enviar');
    var BASE = enviar.getAttribute('data-msg');
    var montar = function () {
      var p = campo.value.trim().replace(/[\s.!?…]+$/, '');
      return p ? 'Oi, Múltiplos! Vim pelo site. Vocês têm ' + p + '? Qual o preço?' : BASE;
    };
    var refresh = function () { enviar.href = waUrl(montar()); };
    campo.addEventListener('input', refresh);
    busca.querySelectorAll('[data-sugestao]').forEach(function (b) {
      b.addEventListener('click', function () { campo.value = b.getAttribute('data-sugestao'); refresh(); campo.focus(); });
    });
    busca.addEventListener('submit', function (ev) {
      ev.preventDefault();
      track('whatsapp_click', { source: 'busca', produto: campo.value.trim() });
      var url = waUrl(montar());
      var win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
    });
    // O clique no link já registra 'whatsapp_click' pelo laço acima; aqui só atualiza o href
    refresh();
  }

  // ===== Mapa só carrega quando a pessoa pede =====
  var mapBtn = document.getElementById('map-load');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = mapBtn.getAttribute('data-src');
      iframe.title = 'Mapa: Multiplos Atacado, Av. Marechal Rondon, 4500, Centro, Vilhena-RO';
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
