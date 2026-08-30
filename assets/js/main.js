/* =========================================================
   WK Films — comportamento do site
   Edite as constantes abaixo para atualizar contato/rastreio.
   ========================================================= */
(function () {
  'use strict';

  var CONFIG = {
    whatsapp: '5569984638776',          // número com DDI + DDD, só dígitos
    origem: 'site-wk',                  // parâmetro utm_source enviado ao WhatsApp
    paginaObrigado: 'obrigado.html'     // deixe '' para não redirecionar após o envio
  };

  var d = document;
  var $  = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- 1. Links de WhatsApp ----------
     Qualquer elemento com data-wa vira um link wa.me com a mensagem. */
  function waLink(msg) {
    return 'https://wa.me/' + CONFIG.whatsapp +
           '?text=' + encodeURIComponent(msg || 'Olá! Vim pelo site da WK.');
  }
  $$('[data-wa]').forEach(function (el) {
    el.setAttribute('href', waLink(el.getAttribute('data-wa')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.addEventListener('click', function () {
      track('whatsapp_click', { local: el.getAttribute('data-track') || 'link' });
    });
  });

  /* ---------- 2. Rastreamento (Meta Pixel / GA4 se existirem) ---------- */
  function track(evento, dados) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', evento, dados || {});
      if (typeof window.fbq === 'function') window.fbq('trackCustom', evento, dados || {});
      if (window.dataLayer && window.dataLayer.push) {
        window.dataLayer.push(Object.assign({ event: evento }, dados || {}));
      }
    } catch (e) { /* rastreio nunca deve quebrar o site */ }
  }

  /* ---------- 3. Header fixo + menu mobile ---------- */
  var header = $('#header');
  var burger = $('#burger');
  var nav    = $('#nav');

  function fecharMenu() {
    if (!nav) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    d.body.style.overflow = '';
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var aberto = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(aberto));
      burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      d.body.style.overflow = aberto ? 'hidden' : '';
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', fecharMenu); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenu(); });
    d.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !burger.contains(e.target)) fecharMenu();
    });
  }

  /* ---------- 4. Scroll: progresso, header, botões flutuantes, link ativo ---------- */
  var barra     = $('#scrollBar');
  var toTop     = $('#toTop');
  var mobileCta = $('#mobileCta');
  var secoes    = $$('main section[id]');
  var navLinks  = $$('.nav a[href^="#"]');
  var tickando  = false;

  function aoRolar() {
    var y   = window.scrollY || d.documentElement.scrollTop;
    var alt = d.documentElement.scrollHeight - window.innerHeight;

    if (barra) barra.style.width = (alt > 0 ? (y / alt) * 100 : 0) + '%';
    if (header) header.classList.toggle('is-stuck', y > 12);
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
    if (mobileCta) mobileCta.classList.toggle('is-visible', y > 520);

    var atual = '';
    secoes.forEach(function (s) {
      if (y >= s.offsetTop - 140) atual = s.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + atual);
    });
    tickando = false;
  }

  window.addEventListener('scroll', function () {
    if (!tickando) { tickando = true; window.requestAnimationFrame(aoRolar); }
  }, { passive: true });
  aoRolar();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 5. Animações de entrada ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('is-in'); }, Math.min(i * 70, 280));
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 6. Contadores da prova social ---------- */
  var contadores = $$('[data-count]');
  if (contadores.length && 'IntersectionObserver' in window) {
    var ioNum = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        animarNumero(e.target);
        ioNum.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    contadores.forEach(function (el) { ioNum.observe(el); });
  } else {
    contadores.forEach(animarNumero);
  }

  function animarNumero(el) {
    var alvo    = parseFloat(el.getAttribute('data-count'));
    var sufixo  = el.getAttribute('data-suffix') || '';
    var decimal = (el.getAttribute('data-count').indexOf('.') > -1) ? 1 : 0;
    var inicio  = null;
    var dur     = 1400;

    function passo(ts) {
      if (!inicio) inicio = ts;
      var p = Math.min((ts - inicio) / dur, 1);
      var v = alvo * (1 - Math.pow(1 - p, 3));           // ease-out cubic
      el.textContent = v.toFixed(decimal).replace('.', ',') + sufixo;
      if (p < 1) window.requestAnimationFrame(passo);
    }
    window.requestAnimationFrame(passo);
  }

  /* ---------- 7. Filtro do portfólio ---------- */
  var chips = $$('.chip[data-filter]');
  var works = $$('.work');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filtro = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var ativo = c === chip;
        c.classList.toggle('is-active', ativo);
        c.setAttribute('aria-selected', String(ativo));
      });
      works.forEach(function (w) {
        var mostra = filtro === 'all' || w.getAttribute('data-cat') === filtro;
        w.classList.toggle('is-hidden', !mostra);
      });
      track('filtro_portfolio', { filtro: filtro });
    });
  });

  /* ---------- 8. FAQ: abre um de cada vez ---------- */
  var faqs = $$('.faq__item');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqs.forEach(function (o) { if (o !== item) o.open = false; });
      track('faq_abrir', { pergunta: ($('summary', item) || {}).textContent });
    });
  });

  /* ---------- 9. Status aberto/fechado em tempo real ---------- */
  var HORARIOS = {            // 0 = domingo … 6 = sábado (minutos do dia)
    0: null,
    1: [480, 1080], 2: [480, 1080], 3: [480, 1080], 4: [480, 1080], 5: [480, 1080],
    6: [480, 690]
  };
  var NOMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  function agoraEmVilhena() {
    // Vilhena–RO usa o fuso America/Porto_Velho (UTC-4), sem horário de verão.
    var utc = Date.now() + (new Date().getTimezoneOffset() * 60000);
    return new Date(utc - 4 * 3600000);
  }

  function atualizarStatus() {
    var box      = $('.topbar__status');
    var txt      = $('#statusText');
    var txtCurto = $('#statusTextShort');
    if (!box || !txt) return;

    var agora = agoraEmVilhena();
    var dia   = agora.getDay();
    var min   = agora.getHours() * 60 + agora.getMinutes();
    var faixa = HORARIOS[dia];

    // dois rótulos: o CSS escolhe o completo (desktop) ou o curto (celular)
    if (faixa && min >= faixa[0] && min < faixa[1]) {
      box.classList.add('is-open'); box.classList.remove('is-closed');
      txt.textContent = 'Aberto agora · atendemos até ' + hhmm(faixa[1]);
      if (txtCurto) txtCurto.textContent = 'Aberto até ' + hhmm(faixa[1]);
    } else {
      box.classList.add('is-closed'); box.classList.remove('is-open');
      var prox = proximaAbertura(dia, min);
      txt.textContent = 'Fechado agora · abrimos ' + prox + ' (deixe sua mensagem)';
      if (txtCurto) txtCurto.textContent = 'Fechado · abrimos ' + prox;
    }

    var hoje = $('#hoursTable tr[data-day="' + dia + '"]');
    $$('#hoursTable tr').forEach(function (tr) { tr.classList.remove('is-today'); });
    if (hoje) hoje.classList.add('is-today');
  }

  function hhmm(m) {
    return ('0' + Math.floor(m / 60)).slice(-2) + 'h' + (m % 60 ? ('0' + (m % 60)).slice(-2) : '');
  }

  function proximaAbertura(dia, min) {
    if (HORARIOS[dia] && min < HORARIOS[dia][0]) return 'hoje às ' + hhmm(HORARIOS[dia][0]);
    for (var i = 1; i <= 7; i++) {
      var d2 = (dia + i) % 7;
      if (HORARIOS[d2]) {
        var quando = (i === 1) ? 'amanhã' : NOMES[d2];
        return quando + ' às ' + hhmm(HORARIOS[d2][0]);
      }
    }
    return 'em breve';
  }

  atualizarStatus();
  setInterval(atualizarStatus, 60000);

  /* ---------- 10. Formulário → WhatsApp ---------- */
  var form = $('#leadForm');
  if (form) {
    var mascara = $('#whats');
    if (mascara) {
      mascara.addEventListener('input', function () {
        var v = mascara.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 6)      v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
        else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
        else if (v.length)     v = '(' + v;
        mascara.value = v;
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if ($('#empresa2').value) return;             // honeypot: robô preencheu

      var campos = [
        { el: $('#nome'),    msg: 'Por favor, informe seu nome.',    ok: function (v) { return v.trim().length >= 2; } },
        { el: $('#whats'),   msg: 'Informe um WhatsApp válido com DDD.', ok: function (v) { return v.replace(/\D/g, '').length >= 10; } },
        { el: $('#servico'), msg: 'Escolha o que você procura.',     ok: function (v) { return v !== ''; } }
      ];

      var primeiroInvalido = null;
      campos.forEach(function (c) {
        var wrap = c.el.closest('.field');
        var erro = $('[data-err="' + c.el.id + '"]');
        if (!c.ok(c.el.value)) {
          if (!primeiroInvalido) primeiroInvalido = c.el;
          wrap.classList.add('is-invalid');
          if (erro) erro.textContent = c.msg;
        } else {
          wrap.classList.remove('is-invalid');
          if (erro) erro.textContent = '';
        }
      });
      if (primeiroInvalido) { primeiroInvalido.focus(); return; }

      var msg =
        '*Novo contato pelo site WK*\n\n' +
        '👤 Nome: ' + $('#nome').value.trim() + '\n' +
        '📱 WhatsApp: ' + $('#whats').value.trim() + '\n' +
        (($('#empresa').value.trim()) ? '🏢 Empresa/segmento: ' + $('#empresa').value.trim() + '\n' : '') +
        '🎯 Interesse: ' + $('#servico').value + '\n' +
        (($('#verba').value) ? '💰 Investimento previsto: ' + $('#verba').value + '\n' : '') +
        (($('#msg').value.trim()) ? '\n📝 ' + $('#msg').value.trim() + '\n' : '') +
        '\n(enviado em ' + new Date().toLocaleString('pt-BR') + ')';

      track('lead_formulario', {
        servico: $('#servico').value,
        verba: $('#verba').value || 'nao-informado'
      });

      window.open(waLink(msg), '_blank', 'noopener');

      if (CONFIG.paginaObrigado) {
        setTimeout(function () { window.location.href = CONFIG.paginaObrigado; }, 700);
      } else {
        form.reset();
      }
    });
  }

  /* ---------- 11. Ano do rodapé ---------- */
  var ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

})();
