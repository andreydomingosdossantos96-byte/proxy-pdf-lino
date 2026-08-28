/* =========================================================
   Taykan Barbearia — comportamento da landing page
   ---------------------------------------------------------
   >>> EDITE APENAS O BLOCO CONFIG ABAIXO <<<
   ========================================================= */

const CONFIG = {
  // Número do WhatsApp no formato internacional, só dígitos: 55 + DDD + número.
  // TROQUE pelo número real da barbearia (exemplo: '5569999998888').
  whatsapp: '5569000000000',

  // Endereço completo — usado no texto da página e no botão "Como chegar".
  endereco: 'Edifício Capra — Vilhena/RO',

  // Busca usada no Google Maps. Ideal: cole aqui o endereço completo com número e bairro.
  mapsQuery: 'Taykan Barbearia Edifício Capra Vilhena RO',

  instagram: 'https://instagram.com/taykan_barbearia'
};

/* ---------------------------------------------------------
   1) Monta todos os links de WhatsApp a partir do CONFIG
   Qualquer elemento com data-wa="mensagem" vira um link
   wa.me com a mensagem já preenchida.
--------------------------------------------------------- */
function montarLinksWhatsApp() {
  const numero = CONFIG.whatsapp.replace(/\D/g, '');

  document.querySelectorAll('[data-wa]').forEach((el) => {
    const texto = el.getAttribute('data-wa') || 'Olá! Quero agendar um horário na Taykan.';
    el.setAttribute('href', `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
}

/* ---------------------------------------------------------
   2) Endereço e link do mapa
--------------------------------------------------------- */
function aplicarEndereco() {
  const endereco = document.getElementById('endereco');
  if (endereco) endereco.textContent = CONFIG.endereco;

  const maps = document.getElementById('maps-link');
  if (maps) {
    maps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
  }
}

/* ---------------------------------------------------------
   3) Header ganha fundo ao rolar + barra fixa de CTA no mobile
--------------------------------------------------------- */
function ligarScroll() {
  const header = document.querySelector('.site-header');
  const barra = document.getElementById('mobile-bar');
  const hero = document.querySelector('.hero');

  const atualizar = () => {
    const y = window.scrollY;
    header.classList.toggle('is-stuck', y > 40);

    // a barra só aparece depois que o CTA do hero sai da tela
    const limite = hero ? hero.offsetHeight * 0.75 : 500;
    if (barra) barra.classList.toggle('is-visible', y > limite);
  };

  atualizar();
  window.addEventListener('scroll', atualizar, { passive: true });
}

/* ---------------------------------------------------------
   4) Animação de entrada das seções
--------------------------------------------------------- */
function ligarRevelacao() {
  const alvos = document.querySelectorAll('.reveal');
  const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (semAnimacao || !('IntersectionObserver' in window)) {
    alvos.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada, i) => {
      if (!entrada.isIntersecting) return;
      setTimeout(() => entrada.target.classList.add('is-in'), i * 70);
      obs.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  alvos.forEach((el) => obs.observe(el));
}

/* ---------------------------------------------------------
   5) Medição de conversão
   Dispara evento para Google Analytics (gtag) e Meta Pixel (fbq),
   se algum deles estiver instalado. Sem eles, não faz nada.
--------------------------------------------------------- */
function ligarRastreamento() {
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const nome = el.getAttribute('data-track');

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'clique_cta', { cta: nome });
      }
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', 'CliqueCTA', { cta: nome });
      }
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: 'clique_cta', cta: nome });
      }
    });
  });
}

/* ---------------------------------------------------------
   6) Ano do rodapé
--------------------------------------------------------- */
function aplicarAno() {
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------- */
function iniciar() {
  montarLinksWhatsApp();
  aplicarEndereco();
  ligarScroll();
  ligarRevelacao();
  ligarRastreamento();
  aplicarAno();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
