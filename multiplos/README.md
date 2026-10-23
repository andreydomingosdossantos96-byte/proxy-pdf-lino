# Multiplos Atacado — site de conversão

Página única, pensada para o celular, da loja **Multiplos Atacado** (Vilhena-RO). A ideia central é: **"Tem no Múltiplos? Pergunta no Whats!"**. Numa loja de variedades, o que o cliente quer saber é "tem?" e "quanto está?". O site manda essa pergunta pronta para o WhatsApp e depois leva a pessoa até a loja com o status **aberto/fechado ao vivo**.

HTML/CSS/JS puro, sem build e sem dependências. A pasta é autocontida: pode ir para outro repositório ou domínio do jeito que está.

## Estrutura

```
index.html               página (textos, seções, SEO, schema Store com horários)
assets/css/site.css      todo o visual (cores, tipografia, seções, animações)
assets/illus/            ilustrações em vetor (SVG): objetos usados como <img>; cena-*.svg são as cenas da fachada, prateleira e equipe, que vão embutidas no index.html
assets/js/main.js        WhatsApp, horários/feriados, "aberto agora", busca, caixa-surpresa, animações, eventos
assets/img/              logo, favicons, imagem de compartilhamento e fotos
```

## Rodar localmente

```bash
npx serve .
# ou: python3 -m http.server 8000
```

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| **Número do WhatsApp** | `WHATSAPP` em `assets/js/main.js` **e** o número `556933221007` nos links de `index.html` (usados quando o JavaScript não carrega) |
| **Horário normal** | `HORARIO` em `main.js` (0 = domingo … 6 = sábado) e a tabela/rodapé/schema em `index.html` |
| **Horário especial** (feriado, balanço, Natal, Black Friday) | `HORARIO_ESPECIAL` em `main.js`: `'AAAA-MM-DD': [abre, fecha]` ou `null` para fechado |
| **Feriados sem horário definido** | `FERIADOS` em `main.js`. Nesses dias o site não diz "aberto/fechado"; pede para confirmar no WhatsApp |
| Mensagem pronta de cada botão | atributo `data-msg` de cada link `.js-wa` |
| Cores e fontes | variáveis no topo de `assets/css/site.css` |

> O indicador "Aberto agora" só segue a agenda escrita no código. Se a loja fechar de surpresa ou mudar de horário, alguém precisa atualizar `HORARIO_ESPECIAL`. Senão, o site diz "aberto" com a porta fechada.

## Pendências antes de publicar

1. **WhatsApp**: o número `(69) 3322-1007` aparece com o ícone do WhatsApp no cartaz oficial da loja, mas confirme e teste `wa.me/556933221007`.
2. **Ilustrações**: todas são desenhos vetoriais (SVG), nítidos em qualquer tela. O site não usa mais fotos da loja; a fachada, a prateleira e a equipe também são ilustrações. Para trocar uma cena, edite `assets/illus/cena-*.svg` e cole o conteúdo no lugar correspondente do `index.html`.
3. **Feriados**: confirme a lista em `FERIADOS` (inclusive se 23/11, aniversário de Vilhena, é feriado municipal) e informe o horário de fim de ano.
4. **Atacado/revenda**: o site só convida a perguntar sobre compras em quantidade. Se houver condição real (pedido mínimo, preço por quantidade), ela vira argumento na página.
5. **Caixa-surpresa**: os achadinhos mostrados são ilustrações de produtos que já apareceram nos stories, sem preço. Troque a lista em `main.js` quando quiser.
6. **Preços**: o site não publica preço de propósito (Código de Defesa do Consumidor, art. 30: preço anunciado obriga a loja). Se quiser publicar, alguém precisa manter atualizado.
7. **Domínio**: ao publicar, troque `canonical`, `og:image` e o schema para URLs absolutas e atualize o link da bio e o botão "Site" do Google.

## Medição

`main.js` envia eventos para `dataLayer` (GTM), `gtag` (GA4) e `fbq` (Meta Pixel), se estiverem instalados:

- `whatsapp_click`: qualquer botão de WhatsApp (`source` diz qual; a busca envia `preenchido: sim/nao`)
- `rota_click`, `ligar`, `copiar_endereco`, `instagram_click`, `google_reviews`, `map_open`

Todas as mensagens começam com "Vim pelo site". Assim a loja consegue contar no próprio WhatsApp quantas conversas vieram do site.
