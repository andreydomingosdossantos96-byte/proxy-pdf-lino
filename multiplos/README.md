# Multiplos Atacado — site de conversão

Página única, pensada para o celular, da loja **Multiplos Atacado** (Vilhena-RO). A ideia central é: **"Tem no Múltiplos? Pergunta no Whats!"**. Numa loja de variedades, o que o cliente quer saber é "tem?" e "quanto está?". O site manda essa pergunta pronta para o WhatsApp e depois leva a pessoa até a loja com o status **aberto/fechado ao vivo**.

HTML/CSS/JS puro, sem build e sem dependências. A pasta é autocontida: pode ir para outro repositório ou domínio do jeito que está.

## Estrutura

```
index.html               página (textos, seções, SEO, schema Store com horários)
assets/css/base.css      cores, tipografia, botões, cabeçalho, rodapé, CTA fixo
assets/css/sections.css  estilos de cada seção
assets/js/main.js        WhatsApp, horários/feriados, "aberto agora", campanhas com data, busca, mapa, eventos
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
| **Faixas/seções de campanha** | elementos com `data-campanha data-fim="AAAA-MM-DDTHH:MM"` em `index.html`. Somem sozinhos depois do prazo |
| Mensagem pronta de cada botão | atributo `data-msg` de cada link `.js-wa` |
| Cores e fontes | variáveis no topo de `assets/css/base.css` |

> O indicador "Aberto agora" só segue a agenda escrita no código. Se a loja fechar de surpresa ou mudar de horário, alguém precisa atualizar `HORARIO_ESPECIAL`. Senão, o site diz "aberto" com a porta fechada.

## Pendências antes de publicar

1. **WhatsApp**: o número `(69) 3322-1007` aparece com o ícone do WhatsApp no cartaz oficial da loja, mas confirme e teste `wa.me/556933221007`.
2. **Horário do Dia das Crianças**: o site segue o cartaz (sáb, dom e seg 12/10 das 8h às 18h). O Google mostra domingo 8h–13h e segunda 8h–19h. Atualize o Google também. A faixa e a seção somem sozinhas em 12/10/2026 às 18h.
3. **Feriados**: confirme a lista em `FERIADOS` (inclusive se 23/11, aniversário de Vilhena, é feriado municipal) e informe o horário de fim de ano.
4. **Atacado/revenda**: o site só convida a perguntar sobre compras em quantidade. Se houver condição real (pedido mínimo, preço por quantidade), ela vira argumento na página.
5. **Vitrine**: os 8 produtos vieram de stories de maio/2026 e out/2025, sem preço. Troque por produtos atuais quando puder.
6. **Direito de imagem**: autorização por escrito das atendentes que aparecem nas fotos.
7. **Fotos**: as fotos da fachada e da prateleira vêm do Google Maps; confirme que são da loja. Fotos originais em boa resolução deixam o site bem melhor.
8. **Preços**: o site não publica preço de propósito (Código de Defesa do Consumidor, art. 30: preço anunciado obriga a loja). Se quiser publicar, alguém precisa manter atualizado.
9. **Domínio**: ao publicar, troque `canonical`, `og:image` e o schema para URLs absolutas e atualize o link da bio e o botão "Site" do Google.

## Medição

`main.js` envia eventos para `dataLayer` (GTM), `gtag` (GA4) e `fbq` (Meta Pixel), se estiverem instalados:

- `whatsapp_click`: qualquer botão de WhatsApp (`source` diz qual; a busca envia `preenchido: sim/nao`)
- `rota_click`, `ligar`, `copiar_endereco`, `instagram_click`, `google_reviews`, `map_open`

Todas as mensagens começam com "Vim pelo site". Assim a loja consegue contar no próprio WhatsApp quantas conversas vieram do site.
