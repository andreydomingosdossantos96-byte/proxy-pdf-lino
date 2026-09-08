/* ==========================================================================
   DOMINGOS TECH — comportamento do site

   ►► PREENCHA OS DADOS ABAIXO ANTES DE PUBLICAR ◄◄
   Enquanto o whatsapp estiver com o valor de exemplo, os botões avisam em vez
   de abrir uma conversa com um número inexistente.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    whatsapp: '5500000000000',            // DDI + DDD + número, só dígitos. Ex.: '5569984638776'
    telefone: '(00) 00000-0000',          // como aparece na tela
    email: 'contato@domingostech.com.br',
    paginaObrigado: 'obrigado.html'       // '' para apenas limpar o formulário
  };

  var SEM_NUMERO = /^5?500+0*$/.test(CONFIG.whatsapp) || CONFIG.whatsapp.indexOf('00000000') > -1;

  var d = document;
  var $  = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  function marcar(evento, dados) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', evento, dados || {});
      if (typeof window.fbq === 'function') window.fbq('trackCustom', evento, dados || {});
      if (window.dataLayer && window.dataLayer.push) window.dataLayer.push(Object.assign({ event: evento }, dados || {}));
    } catch (e) { /* rastreio nunca derruba o site */ }
  }

  /* ---------- 1. WhatsApp, telefone e e-mail ---------- */
  function zap(msg) {
    return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || 'Olá! Vim pelo site da Domingos Tech.');
  }

  $$('[data-zap]').forEach(function (el) {
    if (SEM_NUMERO) {
      el.setAttribute('href', '#contato');
      el.addEventListener('click', function (e) {
        e.preventDefault();
        alert('Configure o número de WhatsApp em assets/js/dt.js (CONFIG.whatsapp) para ativar este botão.');
      });
      return;
    }
    el.setAttribute('href', zap(el.getAttribute('data-zap')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.addEventListener('click', function () {
      marcar('whatsapp_clique', { onde: el.getAttribute('data-onde') || 'link' });
    });
  });

  $$('[data-contato="tel"]').forEach(function (el) {
    el.textContent = CONFIG.telefone;
    el.setAttribute('href', 'tel:+' + CONFIG.whatsapp);
  });
  $$('[data-contato="email"]').forEach(function (el) {
    el.textContent = CONFIG.email;
    el.setAttribute('href', 'mailto:' + CONFIG.email);
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

  /* ---------- 3. rolagem ---------- */
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

  /* ---------- 5. um bloco aberto por vez ---------- */
  [['.linha', 'servico_abrir'], ['.duvida', 'duvida_abrir']].forEach(function (par) {
    var grupo = $$(par[0]);
    grupo.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        grupo.forEach(function (outro) { if (outro !== item) outro.open = false; });
        var titulo = ($('.linha__nome, summary', item) || {}).textContent || '';
        marcar(par[1], { titulo: titulo.trim().split('\n')[0] });
      });
    });
  });

  /* ---------- 6. data do briefing ---------- */
  var dataHoje = $('#dataHoje');
  if (dataHoje) dataHoje.textContent = new Date().toLocaleDateString('pt-BR');

  /* ---------- 7. formulário → WhatsApp ---------- */
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
      if ($('#site2').value) return;                       // isca: robô preencheu

      var regras = [
        { el: $('#nome'),   msg: 'Informe seu nome.',            ok: function (v) { return v.trim().length >= 2; } },
        { el: $('#zap'),    msg: 'WhatsApp com DDD, por favor.', ok: function (v) { return v.replace(/\D/g, '').length >= 10; } },
        { el: $('#tipo'),   msg: 'Escolha o tipo de projeto.',   ok: function (v) { return v !== ''; } },
        { el: $('#recado'), msg: 'Conte em poucas linhas o que precisa.', ok: function (v) { return v.trim().length >= 10; } }
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
        '*Briefing — site Domingos Tech*\n\n' +
        'Nome: ' + $('#nome').value.trim() + '\n' +
        'WhatsApp: ' + $('#zap').value.trim() + '\n' +
        ($('#empresa').value.trim() ? 'Empresa: ' + $('#empresa').value.trim() + '\n' : '') +
        'Projeto: ' + $('#tipo').value + '\n' +
        ($('#prazo').value ? 'Prazo: ' + $('#prazo').value + '\n' : '') +
        ($('#verba').value ? 'Investimento: ' + $('#verba').value + '\n' : '') +
        '\n' + $('#recado').value.trim() + '\n' +
        '\n(enviado em ' + new Date().toLocaleString('pt-BR') + ')';

      marcar('lead_briefing', { tipo: $('#tipo').value, verba: $('#verba').value || 'nao-informado' });

      if (SEM_NUMERO) {
        alert('Configure o número de WhatsApp em assets/js/dt.js (CONFIG.whatsapp) para receber os briefings.');
        return;
      }
      window.open(zap(msg), '_blank', 'noopener');

      if (CONFIG.paginaObrigado) {
        setTimeout(function () { window.location.href = CONFIG.paginaObrigado; }, 700);
      } else {
        folha.reset();
      }
    });
  }

  /* ---------- 8. ano do rodapé ---------- */
  var ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

})();
