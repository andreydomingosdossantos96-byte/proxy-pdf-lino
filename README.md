# Projeto Ágape — site de conversão

Site de uma página da escola de música **Projeto Ágape** (Vilhena-RO). O objetivo é um só: levar o visitante para o WhatsApp com a mensagem pronta.

HTML/CSS/JS puro, sem build e sem dependências. Funciona em qualquer hospedagem estática (Vercel, Netlify, GitHub Pages).

> A pasta `api/` é o proxy de PDF que já existia neste repositório e não foi alterada.
>
> A pasta `stampa/` tem outro site, independente deste: o da loja **Stampa Vilhena** (veja `stampa/README.md`). Na prévia da Vercel ele fica em `/stampa/`.
>
> A pasta `multiplos/` tem o site do **Multiplos Atacado** (veja `multiplos/README.md`), em `/multiplos/` na prévia.

## Estrutura

```
index.html            página única (textos, seções, SEO, schema.org)
assets/css/styles.css estilos (cores no topo, em :root)
assets/js/main.js     links do WhatsApp, formulário, CTA fixo no celular, mapa, eventos
assets/img/           logo, favicons e fotos
```

## Rodar localmente

```bash
npx serve .
# ou: python3 -m http.server 8000
```

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| Número do WhatsApp | `WHATSAPP` em `assets/js/main.js` **e** troque `5569984027232` em `index.html` (fallback sem JS) |
| Mensagem pronta de cada botão | atributo `data-msg` de cada link `.js-wa` em `index.html` |
| Cores | variáveis no topo de `assets/css/styles.css` |
| Cursos on-line (aviso no formulário) | `ONLINE_COURSES` em `assets/js/main.js` |

## Antes de publicar (pendências)

1. **Fotos**: as imagens em `assets/img/` foram recortadas de capturas de tela do Instagram e do Google, por isso estão em baixa resolução (~240 px). Troque pelos originais mantendo os mesmos nomes de arquivo (de preferência com 1200 px ou mais de largura, em `.webp`).
2. **Uso de imagem de menores**: confirme que há autorização dos responsáveis para usar as fotos das crianças no site.
3. **Aula experimental**: o site inteiro oferece "aula experimental". Se a escola não oferece, ajuste os textos (procure por "experimental").
4. **Instrumentos**: a seção descreve violões, teclados e outros instrumentos com orientação de professor. Confirme o que de fato é vendido.
5. **Domínio**: quando houver domínio próprio, troque `canonical`, `og:image` e o `image`/`logo` do schema para URLs absolutas (`https://seudominio.com.br/...`). Sem isso, o link compartilhado no WhatsApp não mostra a foto.
6. **Depoimentos**: o 4º depoimento está cortado ("minha filha ama…"). Copie o texto completo do Google.

## Medição

`main.js` envia eventos para `dataLayer` (Google Tag Manager), `gtag` (GA4) e `fbq` (Meta Pixel), se algum estiver instalado:

- `whatsapp_click`: clique em qualquer botão de WhatsApp (`source` diz qual botão foi)
- `generate_lead`: envio do formulário (`curso`, `modalidade`)
- `map_open`: abriu o mapa

Sem nenhuma dessas ferramentas instaladas, nada é enviado.
