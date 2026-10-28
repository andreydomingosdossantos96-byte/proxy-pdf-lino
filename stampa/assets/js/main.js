/* Stampa — interações do site (sem dependências) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

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

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function numeroPara(secao) { return (secao && WHATSAPP[secao]) || WHATSAPP.principal; }
  function waUrl(msg, secao) { return 'https://wa.me/' + numeroPara(secao) + (msg ? '?text=' + encodeURIComponent(msg) : ''); }

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

  // Entrada da capa
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); });

  // Cabeçalho: fundo ao rolar, some ao descer e volta ao subir
  var header = document.querySelector('.site-header');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (Math.abs(y - lastY) > 6) {
      header.classList.toggle('is-hidden', y > lastY && y > 400 && !header.contains(document.activeElement));
      lastY = y;
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Revelar ao entrar na tela (um observador para tudo)
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  document.querySelectorAll('.reveal').forEach(function (el) {
    if (io && !reduce) io.observe(el); else el.classList.add('is-in');
  });

  // Conversa de exemplo: as mensagens aparecem em sequência quando o celular entra na tela
  var chat = document.getElementById('chat-demo');
  if (chat) {
    var steps = chat.querySelectorAll('[data-step]');
    var playChat = function () {
      if (reduce) { steps.forEach(function (s) { if (!s.classList.contains('typing')) s.classList.add('show'); }); return; }
      var at = [300, 1300, 2600, 4300];
      steps.forEach(function (s, i) {
        setTimeout(function () {
          s.classList.add('show');
          if (i === 2) chat.querySelector('.typing').classList.remove('show');
        }, at[i]);
      });
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { playChat(); cio.disconnect(); } }, { threshold: 0.35 });
      cio.observe(chat);
    } else playChat();
  }

  // Mesa da capa: as peças se movem em velocidades diferentes ao rolar (paralaxe leve)
  var flatlay = document.querySelector('.flatlay');
  if (flatlay && !reduce) {
    var pieces = Array.prototype.slice.call(flatlay.querySelectorAll('[data-depth]'));
    var ticking = false, visible = true;
    var paint = function () {
      ticking = false;
      var r = flatlay.getBoundingClientRect();
      var c = r.top + r.height / 2 - window.innerHeight / 2;
      pieces.forEach(function (p) { p.style.setProperty('translate', '0 ' + (c * parseFloat(p.getAttribute('data-depth'))).toFixed(1) + 'px'); });
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(flatlay);
    window.addEventListener('scroll', function () { if (visible && !ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    // espera a entrada da capa terminar antes de assumir o "translate"
    setTimeout(function () { pieces.forEach(function (p) { p.style.transition = 'opacity .9s, transform .8s'; }); paint(); }, 1600);
  }

  // Trilho de ocasiões: botões no desktop
  var rail = document.getElementById('rail');
  if (rail) {
    document.querySelectorAll('.rail-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = rail.querySelector('.look');
        var step = card ? card.getBoundingClientRect().width + 18 : 380;
        rail.scrollBy({ left: step * parseInt(b.getAttribute('data-dir'), 10), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  // Marcas: no computador, a peça ilustrada segue o mouse sobre a lista
  var peek = document.getElementById('brand-peek');
  if (peek && finePointer && !reduce) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, on = false;
    var loop = function () {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      var rot = Math.max(-12, Math.min(12, (tx - cx) * 0.08));
      peek.style.transform = 'translate3d(' + (cx - 115).toFixed(1) + 'px,' + (cy - 170).toFixed(1) + 'px,0) rotate(' + rot.toFixed(1) + 'deg)';
      raf = on || Math.abs(tx - cx) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    document.querySelectorAll('.brand-row[data-art]').forEach(function (row) {
      row.addEventListener('mouseenter', function (e) {
        if (peek.getAttribute('src') !== row.getAttribute('data-art')) peek.src = row.getAttribute('data-art');
        if (!on) { cx = tx = e.clientX + 40; cy = ty = e.clientY; }
        on = true; peek.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener('mousemove', function (e) { tx = e.clientX + 40; ty = e.clientY; });
      row.addEventListener('mouseleave', function () { on = false; peek.classList.remove('is-on'); });
    });
  }

  // Botões "magnéticos" (só no computador)
  if (finePointer && !reduce) {
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  // Números contando
  var fmt = function (v, dec) { return v.toFixed(dec).replace('.', ','); };
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    // O número real fica no HTML; a contagem começa junto com o "fade" de entrada, então o zero nunca aparece parado
    var nio = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return;
      nio.disconnect();
      el.textContent = fmt(0, dec);
      var t0 = performance.now(), dur = 1400;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(end * k, dec);
        if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end, dec);
      })(t0);
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nio.observe(el);
  });

  // CTA fixo: aparece quando o CTA da capa sai da tela; some no construtor, no CTA final e com o teclado aberto
  var sticky = document.getElementById('sticky-cta');
  var heroCta = document.getElementById('hero-cta');
  var hideZones = [document.getElementById('consultora'), document.getElementById('final')].filter(Boolean);
  if (sticky && heroCta && 'IntersectionObserver' in window) {
    var heroVisible = true, zonesVisible = {}, typing = false;
    var update = function () {
      var inZone = Object.keys(zonesVisible).some(function (k) { return zonesVisible[k]; });
      var show = !heroVisible && !inZone && !typing;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      sticky.querySelectorAll('a').forEach(function (a) { a.tabIndex = show ? 0 : -1; });
    };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }, { rootMargin: '-70px 0px 0px 0px' }).observe(heroCta);
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
