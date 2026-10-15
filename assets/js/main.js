/* Projeto Ágape — interações do site (sem dependências) */
(function () {
  'use strict';

  // Número único do WhatsApp (DDI + DDD + número, só dígitos).
  var WHATSAPP = '5569984027232';
  var ONLINE_COURSES = ['Violão', 'Teclado', 'Técnica Vocal (canto)', 'Ainda não sei'];

  function waUrl(msg) {
    return 'https://wa.me/' + WHATSAPP + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }

  // Envia eventos para GTM/GA4/Meta Pixel se estiverem instalados. Sem eles, não faz nada.
  function track(event, data) {
    data = data || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data));
    if (typeof window.gtag === 'function') window.gtag('event', event, data);
    if (typeof window.fbq === 'function') window.fbq('track', event === 'generate_lead' ? 'Lead' : 'Contact', data);
  }

  // Links de WhatsApp com mensagem pronta
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-msg'));
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () {
      track('whatsapp_click', { source: a.getAttribute('data-source') || 'desconhecido' });
    });
  });

  // Cabeçalho com sombra ao rolar
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // CTA fixo no celular: aparece depois do topo e some quando o formulário está na tela
  var sticky = document.getElementById('sticky-cta');
  var hero = document.querySelector('.hero');
  var form = document.getElementById('matricula');
  if (sticky && hero && form && 'IntersectionObserver' in window) {
    var heroVisible = true, formVisible = false;
    var update = function () {
      var show = !heroVisible && !formVisible;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      sticky.querySelector('a').tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (e) { formVisible = e[0].isIntersecting; update(); }).observe(form);
  }

  // Formulário → WhatsApp
  var leadForm = document.getElementById('lead-form');
  if (leadForm) {
    var nome = leadForm.querySelector('#f-nome');
    var nomeErr = leadForm.querySelector('#f-nome-err');
    var curso = leadForm.querySelector('#f-curso');
    var hint = leadForm.querySelector('#f-online-hint');

    var radio = function (name) {
      var el = leadForm.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : '';
    };

    var refreshHint = function () {
      var online = radio('modalidade') === 'On-line ao vivo';
      hint.hidden = !(online && ONLINE_COURSES.indexOf(curso.value) === -1);
    };

    curso.addEventListener('change', function () {
      if (curso.value === 'Musicalização Infantil') {
        leadForm.querySelector('input[name="para"][value="meu filho(a)"]').checked = true;
      }
      refreshHint();
    });
    leadForm.querySelectorAll('input[name="modalidade"]').forEach(function (r) {
      r.addEventListener('change', refreshHint);
    });
    nome.addEventListener('input', function () {
      if (nome.value.trim()) { nome.removeAttribute('aria-invalid'); nomeErr.hidden = true; }
    });

    leadForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var n = nome.value.trim();
      if (!n) {
        nome.setAttribute('aria-invalid', 'true');
        nomeErr.hidden = false;
        nome.focus();
        return;
      }
      var c = curso.value;
      var msg = [
        'Olá! Vim pelo site do Projeto Ágape e quero agendar uma aula experimental.',
        '',
        'Nome: ' + n,
        'Curso: ' + c,
        'Aulas para: ' + radio('para'),
        'Modalidade: ' + radio('modalidade')
      ].join('\n');

      track('generate_lead', { curso: c, modalidade: radio('modalidade') });
      var url = waUrl(msg);
      // 'noopener' faria window.open devolver null mesmo abrindo; por isso zera o opener na mão.
      var win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
    });
  }

  // Mapa só carrega quando a pessoa pede (deixa a página mais leve)
  var mapBtn = document.getElementById('map-load');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = mapBtn.getAttribute('data-src');
      iframe.title = 'Mapa: Projeto Ágape, Centro de Vilhena-RO';
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
