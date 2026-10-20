/* Lojas Daniela — interações do site (sem dependências) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  // ===== CONFIGURAÇÃO =====
  // WhatsApp: DDI + DDD + número, só dígitos.
  // TROCAR: cada equipe tem o seu número. Hoje TODAS usam o (69) 99265-5308 (o da ficha do Google) só como PALPITE:
  // o WhatsApp do Financeiro e o de cada dupla de vendedoras ainda precisam ser informados.
  // Em 'vendas', o site sorteia uma dupla a cada abertura da página (distribui os atendimentos).
  var PADRAO = '5569992655308';
  var EQUIPES = {
    'financeiro':    { nome: 'Financeiro',      numero: PADRAO },
    'gloria-evilyn': { nome: 'Glória e Evilyn', numero: PADRAO },
    'marilza-aline': { nome: 'Marilza e Aline', numero: PADRAO },
    'ozeni-ana':     { nome: 'Ozeni e Ana',     numero: PADRAO },
    'rayssa-emily':  { nome: 'Rayssa e Emily',  numero: PADRAO }
  };
  var VENDAS = ['gloria-evilyn', 'marilza-aline', 'ozeni-ana', 'rayssa-emily'];

  // Horário normal (0 = domingo … 6 = sábado), em minutos desde 0h [abre, fecha]. Fonte: ficha do Google da loja.
  var HORARIO = { 0: null, 1: [480, 1110], 2: [480, 1110], 3: [480, 1110], 4: [480, 1110], 5: [480, 1110], 6: [480, 990] };
  // Datas com horário diferente (AAAA-MM-DD): [abre, fecha] em minutos, ou null = fechado.
  var HORARIO_ESPECIAL = {
    // '2026-12-24': [480, 960],
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
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Dupla de vendas sorteada uma vez por abertura da página (o mesmo cliente fala sempre com a mesma dupla)
  var duplaDaSessao = VENDAS[Math.floor(Math.random() * VENDAS.length)];
  function numeroPara(equipe) {
    var e = EQUIPES[equipe === 'financeiro' || EQUIPES[equipe] ? equipe : duplaDaSessao];
    return (e && e.numero) || PADRAO;
  }
  function waUrl(msg, equipe) { return 'https://wa.me/' + numeroPara(equipe) + (msg ? '?text=' + encodeURIComponent(msg) : ''); }

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
    a.href = waUrl(a.getAttribute('data-msg'), a.getAttribute('data-equipe'));
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

  // ===== Horário e "aberto agora" (hora de Vilhena: UTC-4 o ano todo) =====
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
  function pascoa(y) { // Meeus/Jones/Butcher, em ms UTC
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
  function hh(m) { var h = Math.floor(m / 60), r = m % 60; return h + 'h' + (r ? pad(r) : ''); }

  // estado: 'aberto' | 'fechando' | 'fechado' | 'feriado'
  function statusLoja() {
    var t = agoraVilhena();
    if (feriadoIncerto(t)) return { estado: 'feriado', texto: 'Feriado · confirme o horário no WhatsApp' };
    var hoje = horarioDo(t);
    if (hoje && t.min >= hoje[0] && t.min < hoje[1]) {
      var falta = hoje[1] - t.min;
      if (falta <= 60) return { estado: 'fechando', texto: 'Aberto · fecha em ' + falta + ' min' };
      return { estado: 'aberto', texto: 'Aberto agora · fecha às ' + hh(hoje[1]) };
    }
    if (hoje && t.min < hoje[0]) return { estado: 'fechado', texto: 'Fechado agora · abre hoje às ' + hh(hoje[0]) };
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
  var hideZones = [document.getElementById('pedido'), document.getElementById('final')].filter(Boolean);
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
    var PRE = 'Oi, Lojas Daniela! Vim pelo site e quero fazer meu pré-cadastro.';
    var checked = function (name) { return form.querySelector('input[name="' + name + '"]:checked'); };

    function compose() {
      var equipeEl = checked('equipe'), secaoEl = checked('secao'), paraEl = checked('para');
      var pagEl = checked('pagamento'), tamEl = checked('tamanho');
      var detalhes = form.querySelector('#f-detalhes').value.trim();
      var equipe = equipeEl ? equipeEl.value : 'vendas';
      var partes = [];
      if (secaoEl) partes.push('Queria ver ' + secaoEl.value + '.');
      if (paraEl) partes.push(paraEl.value);
      if (tamEl && tamEl.value) partes.push('Tamanho: ' + tamEl.value + '.');
      if (pagEl && pagEl.value) partes.push('Forma de pagamento: ' + pagEl.value + '.');
      var d = detalhes.replace(/[\s.!?…]+$/, '');
      if (d) partes.push('Detalhes: ' + d + '.');
      if (!partes.length) return { msg: equipe === 'financeiro' ? PRE : GERAL, equipe: equipe, vazio: true };
      var abre = equipe === 'financeiro' ? 'Oi, Lojas Daniela! Vim pelo site e quero falar com o Financeiro. ' : 'Oi, Lojas Daniela! Vim pelo site. ';
      return { msg: abre + partes.join(' ') + (equipe === 'financeiro' ? ' Pode me ajudar?' : ' Pode me mandar algumas opções?'), equipe: equipe, vazio: false };
    }

    function refresh() {
      var r = compose();
      preview.textContent = r.msg;
      send.href = waUrl(r.msg, r.equipe);
      send.setAttribute('data-equipe', r.equipe);
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
      if (r.vazio) { track('whatsapp_click', { source: 'construtor' }); return; }
      track('generate_lead', {
        source: 'construtor',
        equipe: r.equipe,
        secao: (checked('secao') || {}).value || '',
        pagamento: (checked('pagamento') || {}).value || ''
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
      iframe.title = 'Mapa: Lojas Daniela, Av. Major Amarante, 3447, Centro, Vilhena-RO';
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
