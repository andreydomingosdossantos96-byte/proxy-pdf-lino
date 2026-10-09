/* Stampa — interações do site (sem dependências) */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

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
    if (typeof window.fbq === 'function') {
      // Meta: só WhatsApp conta como Contact e só o construtor como Lead; o resto vai como evento próprio
      if (event === 'generate_lead') window.fbq('track', 'Lead', data);
      else if (event === 'whatsapp_click') window.fbq('track', 'Contact', data);
      else window.fbq('trackCustom', event, data);
    }
  }

  // Links de WhatsApp com mensagem pronta (data-msg) e seção opcional (data-secao)
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-msg'), a.getAttribute('data-secao'));
    a.target = '_blank';
    a.rel = 'noopener';
    if (a.id === 'builder-send') return; // o construtor registra o próprio evento
    a.addEventListener('click', function () {
      track('whatsapp_click', { source: a.getAttribute('data-source') || 'desconhecido' });
    });
  });

  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () {
      track(a.getAttribute('data-track'), { source: a.getAttribute('data-source') || '' });
    });
  });

  // Cabeçalho com sombra ao rolar
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // CTA fixo (barra no celular, botão redondo no desktop): aparece quando o CTA do topo sai da tela;
  // some no construtor, no CTA final e com o teclado aberto
  var sticky = document.getElementById('sticky-cta');
  var floatBtn = document.querySelector('.wa-float');
  var hero = document.querySelector('.hero .cta-stack');
  var hideZones = [document.getElementById('consultora'), document.getElementById('final')].filter(Boolean);
  if (sticky && hero && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('has-io');
    var heroVisible = true, zonesVisible = {}, typing = false;
    var update = function () {
      var inZone = Object.keys(zonesVisible).some(function (k) { return zonesVisible[k]; });
      var show = !heroVisible && !inZone && !typing;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      sticky.querySelectorAll('a').forEach(function (a) { a.tabIndex = show ? 0 : -1; });
      if (floatBtn) floatBtn.classList.toggle('is-visible', show);
    };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); },
      { rootMargin: '-70px 0px 0px 0px' }).observe(hero);
    hideZones.forEach(function (z) {
      new IntersectionObserver(function (e) { zonesVisible[z.id] = e[0].isIntersecting; update(); }).observe(z);
    });
    document.addEventListener('focusin', function (e) { if (e.target.matches('input[type="text"]')) { typing = true; update(); } });
    document.addEventListener('focusout', function (e) { if (e.target.matches('input[type="text"]')) { typing = false; update(); } });
  }

  // Construtor "Monte seu pedido": monta a mensagem ao vivo e atualiza o link do botão
  var builder = document.getElementById('builder');
  if (builder) initBuilder(builder);

  function initBuilder(form) {
    var preview = document.getElementById('builder-preview');
    var status = document.getElementById('builder-status');
    var send = document.getElementById('builder-send');
    var GERAL = send.getAttribute('data-msg');
    var checked = function (name) { return form.querySelector('input[name="' + name + '"]:checked'); };

    function compose() {
      var secaoEl = checked('secao'), ocasiaoEl = checked('ocasiao'), paraEl = checked('para');
      var tamanhoEl = checked('tamanho'), estiloEl = checked('estilo');
      var detalhes = form.querySelector('#f-detalhes').value.trim();
      var partes = [];
      if (secaoEl || ocasiaoEl) {
        partes.push('Queria opções' + (secaoEl ? ' de ' + secaoEl.getAttribute('data-text') : '') +
          (ocasiaoEl ? ' para ' + ocasiaoEl.value : '') + '.');
      }
      if (paraEl) partes.push(paraEl.value);
      if (tamanhoEl && tamanhoEl.value) partes.push('Tamanho: ' + tamanhoEl.value + '.');
      if (estiloEl) partes.push('Estilo: ' + estiloEl.value + '.');
      var d = detalhes.replace(/[\s.!?…]+$/, '');
      if (d) partes.push('Detalhes: ' + d + '.');
      if (!partes.length) return { msg: GERAL, secao: '' };
      return {
        msg: 'Oi, Stampa! Vim pelo site. ' + partes.join(' ') + ' Pode me mandar algumas sugestões?',
        secao: secaoEl ? secaoEl.value : ''
      };
    }

    function refresh() {
      var r = compose();
      preview.textContent = r.msg;
      send.href = waUrl(r.msg, r.secao);
      send.setAttribute('data-secao', r.secao);
    }

    form.addEventListener('input', refresh);
    // Leitor de tela: avisa uma vez por escolha (não a cada tecla digitada)
    form.addEventListener('change', function () {
      refresh();
      if (status) status.textContent = 'Mensagem atualizada: ' + preview.textContent;
    });
    form.addEventListener('reset', function () { setTimeout(refresh, 0); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    send.addEventListener('click', function () {
      var r = compose();
      if (r.msg === GERAL) { track('whatsapp_click', { source: 'construtor' }); return; }
      track('generate_lead', {
        source: 'construtor',
        secao: r.secao,
        ocasiao: (checked('ocasiao') || {}).value || '',
        para: (checked('para') || {}).value || ''
      });
    });
    refresh();
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
