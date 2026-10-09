/* Stampa — interações do site (sem dependências) */
(function () {
  'use strict';

  // ===== CONFIGURAÇÃO =====
  // WhatsApp: DDI + DDD + número, só dígitos.
  // TROCAR: confirmar o número de WhatsApp da loja. O fixo (69) 3321-2158 está aqui só como palpite.
  // Se houver consultoras diferentes para feminino e masculino, preencha os números delas;
  // vazio = usa o número principal.
  var WHATSAPP = {
    principal: '556933212158',
    feminino: '',
    masculino: ''
  };

  function numeroPara(secao) {
    return (secao && WHATSAPP[secao]) || WHATSAPP.principal;
  }
  function waUrl(msg, secao) {
    return 'https://wa.me/' + numeroPara(secao) + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }

  // Envia eventos para GTM/GA4/Meta Pixel se estiverem instalados. Sem eles, não faz nada.
  function track(event, data) {
    data = data || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data));
    if (typeof window.gtag === 'function') window.gtag('event', event, data);
    if (typeof window.fbq === 'function') window.fbq('track', event === 'generate_lead' ? 'Lead' : 'Contact', data);
  }

  // Links de WhatsApp com mensagem pronta (data-msg) e seção opcional (data-secao)
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-msg'), a.getAttribute('data-secao'));
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () {
      track('whatsapp_click', { source: a.getAttribute('data-source') || 'desconhecido' });
    });
  });

  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { track(a.getAttribute('data-track'), {}); });
  });

  // Cabeçalho com sombra ao rolar
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // CTA fixo no celular: aparece depois do topo e some quando o formulário está na tela
  var sticky = document.getElementById('sticky-cta');
  var hero = document.querySelector('.hero');
  var formSection = document.getElementById('consultora');
  if (sticky && hero && formSection && 'IntersectionObserver' in window) {
    var heroVisible = true, formVisible = false;
    var update = function () {
      var show = !heroVisible && !formVisible;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      sticky.querySelector('a').tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (e) { formVisible = e[0].isIntersecting; update(); }).observe(formSection);
  }

  // Formulário → WhatsApp (preenchido em index.html; ver initForm abaixo)
  var form = document.getElementById('lead-form');
  if (form) initForm(form);

  function initForm(form) {
    var nome = form.querySelector('#f-nome');
    var nomeErr = form.querySelector('#f-nome-err');
    var radio = function (name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : '';
    };
    var val = function (sel) { var el = form.querySelector(sel); return el ? el.value.trim() : ''; };

    nome.addEventListener('input', function () {
      if (nome.value.trim()) { nome.removeAttribute('aria-invalid'); nomeErr.hidden = true; }
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var n = nome.value.trim();
      if (!n) {
        nome.setAttribute('aria-invalid', 'true');
        nomeErr.hidden = false;
        nome.focus();
        return;
      }
      var secao = radio('secao');            // 'feminino' | 'masculino' | ''
      var linhas = ['Olá! Vim pelo site da Stampa e quero ajuda de uma consultora.', '', 'Nome: ' + n];
      var procura = val('#f-procura');
      var para = radio('para');
      var tamanho = val('#f-tamanho');
      if (secao) linhas.push('Seção: ' + (secao === 'feminino' ? 'Feminino' : 'Masculino'));
      if (procura) linhas.push('Procuro: ' + procura);
      if (para) linhas.push('É para: ' + para);
      if (tamanho) linhas.push('Tamanho: ' + tamanho);

      track('generate_lead', { secao: secao, procura: procura, para: para });
      var url = waUrl(linhas.join('\n'), secao);
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
      iframe.title = 'Mapa: Stampa, Av. Maj. Amarante, 4239, Centro, Vilhena-RO';
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
