/* Ludi's Biscoiteria — interações do site (sem dependências) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  // ===== CONFIGURAÇÃO =====
  // WhatsApp: DDI + DDD + número, só dígitos.
  // TROCAR: o número abaixo (69) 98107-8753 vem do link de encomenda da bio do Instagram (contate.me/5569981078753).
  // A etiqueta das caixas mostra outro número, (69) 98161-8085: confirme qual atende as encomendas.
  var WHATSAPP = '5569981078753';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function waUrl(msg) { return 'https://wa.me/' + WHATSAPP + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function brl(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

  // Envia eventos para GTM/GA4/Meta Pixel se estiverem instalados. Sem eles, não faz nada.
  function track(event, data) {
    data = data || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data));
    if (typeof window.gtag === 'function') window.gtag('event', event, data);
    if (typeof window.fbq === 'function') {
      if (event === 'generate_lead') window.fbq('track', 'Lead', data);
      else if (event === 'whatsapp_click') window.fbq('track', 'Contact', data);
      else if (event === 'add_to_cart') window.fbq('track', 'AddToCart', data);
      else window.fbq('trackCustom', event, data);
    }
  }

  // Links de WhatsApp com mensagem pronta (data-msg)
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-msg'));
    a.target = '_blank';
    a.rel = 'noopener';
    if (a.id === 'builder-send' || a.id === 'corp-send') return; // registram o próprio evento
    a.addEventListener('click', function () { track('whatsapp_click', { source: a.getAttribute('data-source') || '' }); });
  });
  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { track(a.getAttribute('data-track'), { source: a.getAttribute('data-source') || '' }); });
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

  // Revelar ao entrar na tela
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }) : null;
  document.querySelectorAll('.reveal').forEach(function (el) {
    if (io && !reduce) io.observe(el); else el.classList.add('is-in');
  });

  // Paralaxe leve na foto da capa
  var para = document.querySelector('.parallax');
  if (para && !reduce) {
    var ticking = false;
    var paint = function () {
      ticking = false;
      var r = para.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var c = r.top + r.height / 2 - window.innerHeight / 2;
      para.style.transform = 'translate3d(0,' + (-c * parseFloat(para.getAttribute('data-depth'))).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  }

  // Botões "magnéticos" (só no computador)
  if (finePointer && !reduce) {
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  // ===== Carrinho de encomenda =====
  var cards = Array.prototype.slice.call(document.querySelectorAll('.prod'));
  var items = {}; // id -> { nome, preco, unid, qtd }
  cards.forEach(function (c) {
    items[c.getAttribute('data-id')] = { nome: c.getAttribute('data-nome'), preco: parseFloat(c.getAttribute('data-preco')), unid: c.getAttribute('data-unid'), qtd: 0 };
  });

  var cartEmpty = document.getElementById('cart-empty');
  var cartList = document.getElementById('cart-list');
  var cartTotal = document.getElementById('cart-total');
  var cartTotalV = document.getElementById('cart-total-v');
  var dockWa = document.getElementById('dock-wa');
  var dockCart = document.getElementById('dock-cart');
  var form = document.getElementById('builder');
  var preview = document.getElementById('builder-preview');
  var statusEl = document.getElementById('builder-status');
  var send = document.getElementById('builder-send');
  var GERAL = send.getAttribute('data-msg');

  function totals() {
    var n = 0, t = 0;
    Object.keys(items).forEach(function (k) { n += items[k].qtd; t += items[k].qtd * items[k].preco; });
    return { n: n, t: t };
  }

  function setQty(id, q, from) {
    var it = items[id]; if (!it) return;
    q = Math.max(0, Math.min(99, q));
    var antes = it.qtd; it.qtd = q;
    if (q > antes) track('add_to_cart', { item: it.nome, quantidade: q, valor: it.preco, source: from || 'cardapio' });
    render();
  }

  function renderCards() {
    cards.forEach(function (c) {
      var it = items[c.getAttribute('data-id')];
      c.classList.toggle('has-qty', it.qtd > 0);
      c.querySelector('.st-qty').textContent = it.qtd;
      c.querySelector('.st-minus').disabled = it.qtd === 0;
    });
  }

  function renderCart() {
    var t = totals();
    cartEmpty.hidden = t.n > 0;
    cartList.hidden = t.n === 0;
    cartTotal.hidden = t.n === 0;
    cartList.innerHTML = '';
    Object.keys(items).forEach(function (id) {
      var it = items[id]; if (!it.qtd) return;
      var li = document.createElement('li');
      var name = document.createElement('div'); name.className = 'ci-name'; name.appendChild(document.createTextNode(it.nome));
      var sm = document.createElement('small'); sm.textContent = brl(it.preco) + ' / ' + it.unid; name.appendChild(sm);
      var ctl = document.createElement('div'); ctl.className = 'ci-ctl';
      ctl.innerHTML = '<div class="stepper" role="group" aria-label="Quantidade"><button type="button" class="st-minus" aria-label="Tirar um">&minus;</button><output class="st-qty"></output><button type="button" class="st-plus" aria-label="Adicionar um">+</button></div>';
      ctl.querySelector('.st-qty').textContent = it.qtd;
      ctl.querySelector('.st-minus').addEventListener('click', function () { setQty(id, it.qtd - 1, 'carrinho'); });
      ctl.querySelector('.st-plus').addEventListener('click', function () { setQty(id, it.qtd + 1, 'carrinho'); });
      var line = document.createElement('div'); line.className = 'ci-line'; line.textContent = brl(it.qtd * it.preco);
      li.appendChild(name); li.appendChild(ctl); li.appendChild(line);
      cartList.appendChild(li);
    });
    cartTotalV.textContent = brl(t.t);
  }

  var dockForcedVisible = false;
  function renderDock() {
    var t = totals();
    dockWa.hidden = t.n > 0;
    dockCart.hidden = t.n === 0;
    document.getElementById('dock-count').textContent = t.n + (t.n === 1 ? ' item' : ' itens');
    document.getElementById('dock-total').textContent = brl(t.t);
    updateDock();
  }

  function dataBR(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function checkedVal(name) { var e = form.querySelector('input[name="' + name + '"]:checked'); return e ? e.value : ''; }

  function compose() {
    var t = totals(), nome = val('f-nome'), data = dataBR(val('f-data')), receber = checkedVal('receber'), presente = checkedVal('presente'), obs = val('f-obs');
    var linhas = [];
    linhas.push(nome ? 'Oi, Ludi’s! Aqui é ' + nome + '. Vim pelo site e quero fazer uma encomenda:' : 'Oi, Ludi’s! Vim pelo site e quero fazer uma encomenda:');
    if (t.n > 0) {
      linhas.push('');
      Object.keys(items).forEach(function (id) {
        var it = items[id]; if (!it.qtd) return;
        linhas.push('• ' + it.qtd + 'x ' + it.nome + (it.unid === 'unidade' ? '' : ' (' + it.unid + ')') + ' = ' + brl(it.qtd * it.preco));
      });
      linhas.push('');
      linhas.push('Total estimado: ' + brl(t.t));
    }
    var extra = [];
    if (data) extra.push('Para o dia: ' + data);
    if (receber) extra.push('Recebimento: ' + receber);
    if (presente) extra.push(presente);
    if (obs) extra.push('Detalhes: ' + obs);
    if (extra.length) { if (t.n === 0) linhas.push(''); linhas = linhas.concat(extra); }
    if (t.n === 0 && !extra.length && !nome) return { msg: GERAL, vazio: true };
    linhas.push('');
    linhas.push('Pode confirmar a disponibilidade?');
    return { msg: linhas.join('\n'), vazio: false };
  }

  function refreshMsg() {
    var r = compose();
    preview.textContent = r.msg;
    send.href = waUrl(r.msg);
  }

  function render() { renderCards(); renderCart(); renderDock(); refreshMsg(); }

  cards.forEach(function (c) {
    var id = c.getAttribute('data-id');
    c.querySelector('.st-plus').addEventListener('click', function () { setQty(id, items[id].qtd + 1, 'cardapio'); });
    c.querySelector('.st-minus').addEventListener('click', function () { setQty(id, items[id].qtd - 1, 'cardapio'); });
  });

  form.addEventListener('input', refreshMsg);
  form.addEventListener('change', function () { refreshMsg(); if (statusEl) statusEl.textContent = 'Mensagem atualizada.'; });
  form.addEventListener('reset', function () {
    Object.keys(items).forEach(function (k) { items[k].qtd = 0; });
    setTimeout(render, 0);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  send.addEventListener('click', function () {
    var r = compose(), t = totals();
    if (r.vazio) { track('whatsapp_click', { source: 'encomenda' }); return; }
    track('generate_lead', { source: 'encomenda', itens: t.n, valor: Math.round(t.t * 100) / 100 });
  });

  // data mínima = hoje (hora de Vilhena, UTC-4)
  (function () {
    var d = new Date(Date.now() - 4 * 3600 * 1000), p = function (n) { return (n < 10 ? '0' : '') + n; };
    var hoje = d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate());
    ['f-data', 'c-data'].forEach(function (id) { var el = document.getElementById(id); if (el) el.min = hoje; });
  })();

  // Corporativo: monta a mensagem de orçamento
  var corp = document.getElementById('corp-form');
  var corpSend = document.getElementById('corp-send');
  if (corp && corpSend) {
    var corpMsg = function () {
      var q = val('c-qtd'), d = dataBR(val('c-data')), o = val('c-oc'), p = [];
      if (q) p.push('Quantidade aproximada: ' + q + '.');
      if (d) p.push('Para o dia: ' + d + '.');
      if (o) p.push('Ocasião: ' + o + '.');
      return 'Oi, Ludi’s! Vim pelo site e queria um orçamento de biscoitos personalizados/corporativos.' + (p.length ? ' ' + p.join(' ') : '') + ' Pode me ajudar?';
    };
    corp.addEventListener('input', function () { corpSend.href = waUrl(corpMsg()); });
    corp.addEventListener('submit', function (e) { e.preventDefault(); });
    corpSend.addEventListener('click', function () {
      corpSend.href = waUrl(corpMsg());
      track(val('c-qtd') || val('c-data') || val('c-oc') ? 'generate_lead' : 'whatsapp_click', { source: 'corporativo' });
    });
  }

  // Barra fixa: aparece quando o botão da capa sai da tela; some na encomenda e no CTA final
  var dock = document.getElementById('dock');
  var heroCta = document.getElementById('hero-cta');
  var hideZones = [document.getElementById('encomenda'), document.getElementById('final')].filter(Boolean);
  var heroVisible = true, zones = {}, typing = false;
  function updateDock() {
    if (!dock) return;
    var t = totals();
    var inZone = Object.keys(zones).some(function (k) { return zones[k]; });
    // com itens no carrinho a barra aparece sempre (menos na própria encomenda); sem itens, só depois da capa
    var show = !inZone && !typing && (t.n > 0 || !heroVisible);
    dock.classList.toggle('is-visible', show);
    dock.setAttribute('aria-hidden', show ? 'false' : 'true');
    dock.querySelectorAll('a').forEach(function (a) { a.tabIndex = show && !a.hidden ? 0 : -1; });
  }
  if (dock && heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; updateDock(); }, { rootMargin: '-70px 0px 0px 0px' }).observe(heroCta);
    hideZones.forEach(function (z) { new IntersectionObserver(function (e) { zones[z.id] = e[0].isIntersecting; updateDock(); }).observe(z); });
    document.addEventListener('focusin', function (e) { if (e.target.matches('input[type="text"], input[type="date"]')) { typing = true; updateDock(); } });
    document.addEventListener('focusout', function (e) { if (e.target.matches('input[type="text"], input[type="date"]')) { typing = false; updateDock(); } });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  render();
})();
