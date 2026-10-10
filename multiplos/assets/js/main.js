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

  // Feriados sem horário confirmado: o site não diz "aberto/fechado", pede para confirmar no WhatsApp.
  // Quando a loja informar o horário, mova a data para HORARIO_ESPECIAL.
  var FERIADOS = {
    '2026-11-02': 'Finados', '2026-11-15': 'Proclamação da República', '2026-11-20': 'Consciência Negra',
    '2026-11-23': 'Aniversário de Vilhena', // confirmar se é feriado municipal
    '2026-12-25': 'Natal', '2027-01-01': 'Ano Novo', '2027-01-04': 'Criação de Rondônia',
    '2027-02-08': 'Carnaval', '2027-02-09': 'Carnaval', '2027-03-26': 'Sexta-feira Santa',
    '2027-04-21': 'Tiradentes', '2027-05-01': 'Dia do Trabalho', '2027-05-27': 'Corpus Christi',
    '2027-06-18': 'Dia do Evangélico (RO)', '2027-09-07': 'Independência', '2027-10-12': 'Nossa Senhora Aparecida'
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
  var tem = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  function horarioDo(t) {
    var k = chave(t);
    return tem(HORARIO_ESPECIAL, k) ? HORARIO_ESPECIAL[k] : HORARIO[t.dow];
  }
  // Feriado sem horário confirmado pela loja
  function feriadoIncerto(t) { var k = chave(t); return tem(FERIADOS, k) && !tem(HORARIO_ESPECIAL, k); }
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
      if (falta <= 60) return { estado: 'fechando', fecha: hh(hoje[1]), texto: 'Fecha em ' + falta + ' min · ainda dá tempo!', curto: 'Fecha em ' + falta + ' min' };
      return { estado: 'aberto', fecha: hh(hoje[1]), texto: 'Aberto agora · fecha às ' + hh(hoje[1]), curto: 'Aberto · fecha ' + hh(hoje[1]) };
    }
    if (hoje && t.min < hoje[0] * 60) {
      return { estado: 'fechado', abre: 'hoje às ' + hh(hoje[0]), texto: 'Fechado agora · abre hoje às ' + hh(hoje[0]), curto: 'Fechado · abre ' + hh(hoje[0]) };
    }
    var amanha = somaDias(t, 1);
    if (feriadoIncerto(amanha)) {
      return { estado: 'fechado', abre: null, texto: 'Fechado agora · amanhã é feriado: confirme o horário', curto: 'Fechado · amanhã é feriado' };
    }
    for (var i = 1; i <= 7; i++) {
      var dia = somaDias(t, i), h = horarioDo(dia);
      if (h) {
        var quando = (i === 1 ? 'amanhã' : DIAS[dia.dow]) + ' às ' + hh(h[0]);
        return { estado: 'fechado', abre: quando, texto: 'Fechado agora · abre ' + quando, curto: 'Fechado · abre ' + hh(h[0]) };
      }
    }
    return { estado: 'fechado', abre: null, texto: 'Fechado agora', curto: 'Fechado' };
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
    var aberto = s.estado === 'aberto' || s.estado === 'fechando';
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.classList.toggle('is-open', aberto);
      el.classList.toggle('is-closed', s.estado === 'fechado');
      el.classList.toggle('is-holiday', s.estado === 'feriado');
      var txt = el.querySelector('.status-text');
      if (txt) txt.textContent = el.hasAttribute('data-curto') ? s.curto : s.texto;
    });
    // Textos que mudam com o status (microcopy do hero e CTA final)
    document.querySelectorAll('[data-status-copy]').forEach(function (el) {
      var tpl = el.getAttribute('data-' + s.estado);
      if (s.estado === 'fechado' && !s.abre) tpl = el.getAttribute('data-feriado') || tpl;
      if (!tpl) return;
      el.textContent = tpl.replace('{fecha}', s.fecha || '').replace('{abre}', s.abre || '');
    });
    var t = agoraVilhena();
    document.querySelectorAll('[data-dow]').forEach(function (row) {
      row.classList.toggle('is-today', row.getAttribute('data-dow').split(',').map(Number).indexOf(t.dow) !== -1);
    });
    // Ingressos do fim de semana especial: marca HOJE e apaga os dias que já passaram
    var k = chave(t);
    document.querySelectorAll('[data-date]').forEach(function (el) {
      var d = el.getAttribute('data-date');
      el.classList.toggle('is-today', d === k);
      el.classList.toggle('is-past', d < k);
    });
  }
  pintaStatus();
  setInterval(pintaStatus, 60 * 1000);

  // ===== Blocos de campanha com data de validade =====
  // data-inicio / data-fim no formato AAAA-MM-DD ou AAAA-MM-DDTHH:MM (hora de Vilhena).
  // Começam escondidos no HTML: fora do período (ou sem JS) não aparecem.
  function campanhas() {
    var t = agoraVilhena();
    var agora = chave(t) + 'T' + pad(Math.floor(t.min / 60)) + ':' + pad(t.min % 60);
    document.querySelectorAll('[data-campanha]').forEach(function (el) {
      var ini = el.getAttribute('data-inicio') || '', fim = el.getAttribute('data-fim') || '';
      if (ini && ini.length === 10) ini += 'T00:00';
      if (fim && fim.length === 10) fim += 'T23:59';
      el.hidden = !((!ini || agora >= ini) && (!fim || agora < fim));
    });
  }
  campanhas();
  setInterval(campanhas, 60 * 1000);

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

  // ===== "O que você está procurando?" — monta a pergunta do produto =====
  // Sem JS o formulário envia direto para wa.me com o texto digitado (campo name="text").
  var busca = document.getElementById('busca-form');
  if (busca) {
    busca.action = 'https://wa.me/' + WHATSAPP;
    var campo = busca.querySelector('#busca-produto');
    var BASE = busca.getAttribute('data-msg');
    busca.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var p = campo.value.trim().replace(/[\s.!?…]+$/, '');
      var msg = p ? 'Oi, Múltiplos! Vim pelo site. Vocês têm ' + p + '? Se tiver, qual o preço?' : BASE;
      track('whatsapp_click', { source: 'busca', preenchido: p ? 'sim' : 'nao' });
      var url = waUrl(msg);
      var win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
    });
  }

  // ===== Copiar endereço =====
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.hidden = !(navigator.clipboard && window.isSecureContext);
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () {
        var label = b.querySelector('.copy-label'), old = label.textContent;
        label.textContent = 'Endereço copiado!';
        setTimeout(function () { label.textContent = old; }, 2500);
        track('copiar_endereco', {});
      });
    });
  });

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
