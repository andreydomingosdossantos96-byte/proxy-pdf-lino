/* ==========================================================================
   WK FILMS — comportamento do site
   Ajuste as constantes abaixo para mudar contato e destino pós-formulário.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    whatsapp: '5569984638776',        // DDI + DDD + número, só dígitos
    paginaObrigado: 'obrigado.html'   // '' para apenas limpar o formulário
  };

  var d = document;
  var $  = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- rastreio (dispara se houver Pixel/GA4 na página) ---------- */
  function marcar(evento, dados) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', evento, dados || {});
      if (typeof window.fbq === 'function') window.fbq('trackCustom', evento, dados || {});
      if (window.dataLayer && window.dataLayer.push) window.dataLayer.push(Object.assign({ event: evento }, dados || {}));
    } catch (e) { /* rastreio nunca derruba o site */ }
  }

  /* ---------- 1. links de WhatsApp ---------- */
  function zap(msg) {
    return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || 'Olá! Vim pelo site da WK.');
  }
  $$('[data-zap]').forEach(function (el) {
    el.setAttribute('href', zap(el.getAttribute('data-zap')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.addEventListener('click', function () {
      marcar('whatsapp_clique', { onde: el.getAttribute('data-onde') || 'link' });
    });
  });

  /* ---------- 2. menu ---------- */
  var hamb = $('#hamb');
  var menu = $('#menu');

  function fechaMenu() {
    if (!menu) return;
    menu.classList.remove('aberto');
    hamb.setAttribute('aria-expanded', 'false');
    hamb.setAttribute('aria-label', 'Abrir menu');
    d.body.style.overflow = '';
  }

  if (hamb && menu) {
    hamb.addEventListener('click', function () {
      var aberto = menu.classList.toggle('aberto');
      hamb.setAttribute('aria-expanded', String(aberto));
      hamb.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      d.body.style.overflow = aberto ? 'hidden' : '';
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', fechaMenu); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechaMenu(); });
    d.addEventListener('click', function (e) {
      if (menu.classList.contains('aberto') && !menu.contains(e.target) && !hamb.contains(e.target)) fechaMenu();
    });
  }

  /* ---------- 3. rolagem: cabeçalho, barra, topo, link ativo ---------- */
  var cab   = $('#cab');
  var barra = $('#barra');
  var topo  = $('#topo');
  var cenas = $$('main section[id]');
  var links = $$('.menu a[href^="#"]');
  var agendado = false;

  function aoRolar() {
    var y = window.scrollY || d.documentElement.scrollTop;
    if (cab) cab.classList.toggle('fixo', y > 10);
    if (barra) barra.classList.toggle('visivel', y > 560);
    if (topo) topo.classList.toggle('visivel', y > 760);

    var atual = '';
    cenas.forEach(function (s) { if (y >= s.offsetTop - 150) atual = s.id; });
    links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('href') === '#' + atual); });
    agendado = false;
  }

  window.addEventListener('scroll', function () {
    if (!agendado) { agendado = true; window.requestAnimationFrame(aoRolar); }
  }, { passive: true });
  aoRolar();

  if (topo) topo.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- 4. entrada em cena ---------- */
  var entradas = $$('.entra');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (item, i) {
        if (!item.isIntersecting) return;
        var el = item.target;
        setTimeout(function () { el.classList.add('dentro'); }, Math.min(i * 60, 240));
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    entradas.forEach(function (el) { obs.observe(el); });
  } else {
    entradas.forEach(function (el) { el.classList.add('dentro'); });
  }

  /* ---------- 5. números da ficha ---------- */
  var numeros = $$('[data-conta]');
  function anima(el) {
    var alvo   = parseFloat(el.getAttribute('data-conta'));
    var sufixo = el.getAttribute('data-sufixo') || '';
    var casas  = el.getAttribute('data-conta').indexOf('.') > -1 ? 1 : 0;
    var inicio = null;

    function passo(t) {
      if (!inicio) inicio = t;
      var p = Math.min((t - inicio) / 1300, 1);
      var v = alvo * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(casas).replace('.', ',') + sufixo;
      if (p < 1) window.requestAnimationFrame(passo);
    }
    window.requestAnimationFrame(passo);
  }
  if (numeros.length && 'IntersectionObserver' in window) {
    var obsNum = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (!item.isIntersecting) return;
        anima(item.target);
        obsNum.unobserve(item.target);
      });
    }, { threshold: 0.6 });
    numeros.forEach(function (el) { obsNum.observe(el); });
  } else {
    numeros.forEach(anima);
  }

  /* ---------- 6. um bloco aberto por vez (serviços e dúvidas) ---------- */
  [['.servico', 'servico_abrir'], ['.duvida', 'duvida_abrir']].forEach(function (par) {
    var grupo = $$(par[0]);
    grupo.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        grupo.forEach(function (outro) { if (outro !== item) outro.open = false; });
        marcar(par[1], { titulo: ($('summary', item) || {}).textContent.trim() });
      });
    });
  });

  /* ---------- 7. vídeos: só baixam quando o visitante pede ---------- */
  $$('.filme').forEach(function (filme) {
    var video = $('video', filme);
    var play  = $('.quadro__bt', filme);
    if (!video || !play) return;

    play.addEventListener('click', function () {
      filme.classList.add('tocando');
      video.setAttribute('controls', '');
      video.load();
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* o visitante usa os controles */ });
      marcar('video_play', { titulo: ($('.filme__nome', filme) || {}).textContent });
    });

    video.addEventListener('play', function () {
      $$('.filme video').forEach(function (outro) { if (outro !== video) outro.pause(); });
    });
  });

  /* ---------- 8. situação (aberto/fechado) no fuso de Rondônia ---------- */
  var EXPEDIENTE = {                    // 0 = domingo … 6 = sábado, em minutos
    0: null,
    1: [480, 1080], 2: [480, 1080], 3: [480, 1080], 4: [480, 1080], 5: [480, 1080],
    6: [480, 690]
  };
  var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  function agoraVilhena() {              // America/Porto_Velho, UTC-4, sem horário de verão
    var utc = Date.now() + (new Date().getTimezoneOffset() * 60000);
    return new Date(utc - 4 * 3600000);
  }
  function hm(min) {
    return ('0' + Math.floor(min / 60)).slice(-2) + 'h' + (min % 60 ? ('0' + (min % 60)).slice(-2) : '');
  }
  function proximaAbertura(dia) {
    for (var i = 1; i <= 7; i++) {
      var d2 = (dia + i) % 7;
      if (EXPEDIENTE[d2]) return (i === 1 ? 'amanhã' : DIAS[d2]) + ' ' + hm(EXPEDIENTE[d2][0]);
    }
    return 'em breve';
  }

  function situacao() {
    var fita  = $('#fita');
    var texto = $('#situacao');
    if (!fita || !texto) return;

    var agora = agoraVilhena();
    var dia   = agora.getDay();
    var min   = agora.getHours() * 60 + agora.getMinutes();
    var faixa = EXPEDIENTE[dia];

    if (faixa && min >= faixa[0] && min < faixa[1]) {
      fita.classList.add('aberto'); fita.classList.remove('fechado');
      texto.textContent = 'Gravando · aberto até ' + hm(faixa[1]);
    } else {
      fita.classList.add('fechado'); fita.classList.remove('aberto');
      texto.textContent = 'Fora do ar · abrimos ' + proximaAbertura(dia);
    }
  }
  situacao();
  setInterval(situacao, 60000);

  /* ---------- 9. data na folha de chamada ---------- */
  var dataHoje = $('#dataHoje');
  if (dataHoje) {
    dataHoje.textContent = agoraVilhena().toLocaleDateString('pt-BR');
  }

  /* ---------- 10. formulário → WhatsApp ---------- */
  var folha = $('#folha');
  if (folha) {
    var campoZap = $('#zap');
    if (campoZap) {
      campoZap.addEventListener('input', function () {
        var v = campoZap.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 6)      v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
        else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
        else if (v.length)     v = '(' + v;
        campoZap.value = v;
      });
    }

    folha.addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('#site2').value) return;                    // isca: robô preencheu

      var regras = [
        { el: $('#nome'),    msg: 'Informe seu nome.',            ok: function (v) { return v.trim().length >= 2; } },
        { el: $('#zap'),     msg: 'WhatsApp com DDD, por favor.', ok: function (v) { return v.replace(/\D/g, '').length >= 10; } },
        { el: $('#servico'), msg: 'Escolha uma opção.',           ok: function (v) { return v !== ''; } }
      ];

      var primeiroErro = null;
      regras.forEach(function (r) {
        var campo = r.el.closest('.campo');
        var aviso = $('[data-erro="' + r.el.id + '"]');
        if (!r.ok(r.el.value)) {
          if (!primeiroErro) primeiroErro = r.el;
          campo.classList.add('campo--erro');
          if (aviso) aviso.textContent = r.msg;
        } else {
          campo.classList.remove('campo--erro');
          if (aviso) aviso.textContent = '';
        }
      });
      if (primeiroErro) { primeiroErro.focus(); return; }

      var msg =
        '*Folha de chamada — site WK*\n\n' +
        'Nome: ' + $('#nome').value.trim() + '\n' +
        'WhatsApp: ' + $('#zap').value.trim() + '\n' +
        ($('#empresa').value.trim() ? 'Empresa/segmento: ' + $('#empresa').value.trim() + '\n' : '') +
        'Procura: ' + $('#servico').value + '\n' +
        ($('#verba').value ? 'Investimento: ' + $('#verba').value + '\n' : '') +
        ($('#recado').value.trim() ? '\n' + $('#recado').value.trim() + '\n' : '') +
        '\n(enviado em ' + new Date().toLocaleString('pt-BR') + ')';

      marcar('lead_folha', { servico: $('#servico').value, verba: $('#verba').value || 'nao-informado' });
      window.open(zap(msg), '_blank', 'noopener');

      if (CONFIG.paginaObrigado) {
        setTimeout(function () { window.location.href = CONFIG.paginaObrigado; }, 700);
      } else {
        folha.reset();
      }
    });
  }

  /* ---------- 11. ano do rodapé ---------- */
  var ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

})();
