/* =============================================================================
   Domingos Tech — comportamento da landing

   >>> EDITE APENAS O BLOCO CONFIG ABAIXO. Nada mais precisa ser mexido. <<<
   ========================================================================== */

const CONFIG = {
  // Telefone do WhatsApp com código do país e DDD, só números.
  // Ex.: 5511987654321  (55 = Brasil, 11 = DDD)
  whatsapp: "5500000000000",

  // Como o número aparece escrito no rodapé
  whatsappLabel: "(00) 00000-0000",

  // E-mail comercial
  email: "contato@domingostech.com.br",

  // Mensagem usada quando a pessoa clica direto no WhatsApp (sem preencher o form)
  whatsappMensagemPadrao:
    "Olá! Vim pelo site da Domingos Tech e quero conversar sobre um aplicativo para o meu negócio.",
};

/* ========================================================================== */

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const waLink = (texto) =>
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

  /* --- envia evento para GA4 / Meta Pixel se estiverem instalados --------- */
  function track(evento, dados = {}) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: evento, ...dados });
      if (typeof window.gtag === "function") window.gtag("event", evento, dados);
      if (typeof window.fbq === "function") window.fbq("trackCustom", evento, dados);
    } catch (_) {
      /* analytics nunca pode quebrar a página */
    }
  }

  /* --- preenche contatos vindos do CONFIG -------------------------------- */
  function aplicarContatos() {
    $$("[data-wa]").forEach((el) => {
      el.href = waLink(CONFIG.whatsappMensagemPadrao);
      el.target = "_blank";
      el.rel = "noopener";
      if (el.hasAttribute("data-wa-label")) el.textContent = CONFIG.whatsappLabel;
    });

    $$("[data-mail]").forEach((el) => {
      el.href = `mailto:${CONFIG.email}`;
      if (el.hasAttribute("data-mail-label")) el.textContent = CONFIG.email;
    });

    const ano = $("#ano");
    if (ano) ano.textContent = String(new Date().getFullYear());
  }

  /* --- navbar: fundo ao rolar + menu mobile ------------------------------ */
  function navbar() {
    const nav = $("#nav");
    const toggle = $("#navToggle");
    const drawer = $("#navDrawer");

    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const fechar = () => {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    };

    toggle.addEventListener("click", () => {
      const aberto = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(aberto));
      toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });

    $$("a", drawer).forEach((a) => a.addEventListener("click", fechar));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fechar();
    });
  }

  /* --- animação de entrada das seções ------------------------------------ */
  function reveal() {
    const alvos = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      alvos.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("is-in");
          io.unobserve(entrada.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px" }
    );

    alvos.forEach((el) => io.observe(el));
  }

  /* --- FAQ acordeão ------------------------------------------------------ */
  function faq() {
    $$(".faq__q").forEach((botao) => {
      botao.addEventListener("click", () => {
        const item = botao.closest(".faq__item");
        const abrindo = !item.classList.contains("is-open");

        $$(".faq__item.is-open").forEach((outro) => {
          outro.classList.remove("is-open");
          $(".faq__q", outro).setAttribute("aria-expanded", "false");
        });

        if (abrindo) {
          item.classList.add("is-open");
          botao.setAttribute("aria-expanded", "true");
          track("faq_aberta", { pergunta: botao.textContent.trim().slice(0, 70) });
        }
      });
    });
  }

  /* --- CTAs fixos aparecem depois do hero -------------------------------- */
  function ctasFixos() {
    const barra = $("#mobileBar");
    const flutuante = $("#waFloat");

    const secaoForm = document.getElementById("diagnostico");

    // não cobrir o próprio formulário com a barra fixa
    const formNaTela = () => {
      if (!secaoForm) return false;
      const r = secaoForm.getBoundingClientRect();
      return r.top < window.innerHeight * 0.75 && r.bottom > 0;
    };

    const onScroll = () => {
      const passou = window.scrollY > window.innerHeight * 0.55 && !formNaTela();
      barra.classList.toggle("is-visible", passou);
      flutuante.classList.toggle("is-visible", passou);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- rastreio de cliques nos CTAs -------------------------------------- */
  function rastrearCTAs() {
    $$("[data-cta]").forEach((el) => {
      el.addEventListener("click", () =>
        track("clique_cta", { origem: el.dataset.cta })
      );
    });
  }

  /* --- máscara simples de telefone --------------------------------------- */
  function mascaraTelefone() {
    const campo = $("#whatsapp");
    if (!campo) return;

    campo.addEventListener("input", () => {
      const d = campo.value.replace(/\D/g, "").slice(0, 11);
      let saida = d;
      if (d.length > 2) saida = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 6) {
        const corte = d.length > 10 ? 7 : 6;
        saida = `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
      }
      campo.value = saida;
    });
  }

  /* --- formulário: valida e abre o WhatsApp com tudo preenchido ---------- */
  function formulario() {
    const form = $("#leadForm");
    if (!form) return;

    const marcarErro = (campo, tem) =>
      campo.closest(".field").classList.toggle("has-error", tem);

    const validar = () => {
      let ok = true;

      const nome = $("#nome");
      marcarErro(nome, nome.value.trim().length < 2);
      if (nome.value.trim().length < 2) ok = false;

      const tel = $("#whatsapp");
      const digitos = tel.value.replace(/\D/g, "");
      marcarErro(tel, digitos.length < 10);
      if (digitos.length < 10) ok = false;

      const email = $("#email");
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      marcarErro(email, !emailOk);
      if (!emailOk) ok = false;

      ["#tipo", "#prazo"].forEach((sel) => {
        const campo = $(sel);
        marcarErro(campo, !campo.value);
        if (!campo.value) ok = false;
      });

      return ok;
    };

    // tira o estado de erro assim que a pessoa corrige
    $$("input, select, textarea", form).forEach((campo) => {
      campo.addEventListener("input", () => marcarErro(campo, false));
      campo.addEventListener("change", () => marcarErro(campo, false));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validar()) {
        const primeiro = $(".has-error input, .has-error select", form);
        if (primeiro) primeiro.focus();
        track("form_erro_validacao");
        return;
      }

      const v = (sel) => ($(sel).value || "").trim();

      const linhas = [
        "Olá! Vim pelo site da Domingos Tech e quero um diagnóstico.",
        "",
        `Nome: ${v("#nome")}`,
        `WhatsApp: ${v("#whatsapp")}`,
        `E-mail: ${v("#email")}`,
        v("#empresa") ? `Empresa/segmento: ${v("#empresa")}` : null,
        `Preciso de: ${v("#tipo")}`,
        `Quero começar: ${v("#prazo")}`,
        v("#orcamento") ? `Investimento previsto: ${v("#orcamento")}` : null,
        v("#mensagem") ? `\nProblema a resolver: ${v("#mensagem")}` : null,
      ].filter(Boolean);

      const url = waLink(linhas.join("\n"));

      track("lead_enviado", {
        tipo: v("#tipo"),
        prazo: v("#prazo"),
        orcamento: v("#orcamento") || "nao_informado",
      });

      const fallback = $("#fallbackLink");
      if (fallback) {
        fallback.href = url;
        fallback.target = "_blank";
        fallback.rel = "noopener";
      }

      window.open(url, "_blank", "noopener");
      form.classList.add("is-sent");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* --- avisa no console se o WhatsApp ainda não foi configurado ---------- */
  function checarConfig() {
    if (/^5500{6,}/.test(CONFIG.whatsapp) || CONFIG.whatsapp.includes("00000000")) {
      console.warn(
        "[Domingos Tech] Configure o número do WhatsApp em assets/js/main.js (CONFIG.whatsapp) antes de publicar."
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    aplicarContatos();
    navbar();
    reveal();
    faq();
    ctasFixos();
    rastrearCTAs();
    mascaraTelefone();
    formulario();
    checarConfig();
  });
})();
