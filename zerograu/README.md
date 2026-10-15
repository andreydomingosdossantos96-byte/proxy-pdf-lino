# Zero Grau Frios & Cortes — site de conversão

Página única da **Zero Grau Frios & Cortes** (açougue gourmet em Vilhena-RO), pensada primeiro para o celular. Ideia central: **"Cortes nobres, do jeito que você pede."** O cliente monta a encomenda (corte, quantidade, como prefere e para quando) e a mensagem chega pronta no WhatsApp da loja. A equipe só confirma preço e disponibilidade.

Visual escuro e dourado, no padrão da logo, com fotografia de alimentos em destaque. As imagens foram **geradas com a IA do Figma** (arquivo "Zero Grau — imagens do site" na conta da DOMINGOS TECH). São **ilustrativas**, não fotos dos produtos da loja, e o rodapé avisa isso.

HTML/CSS/JS puro, sem build e sem dependências. A pasta é autocontida.

## Estrutura

```
index.html             página (textos, seções, SEO, schema ButcherShop com horários)
assets/css/site.css    visual (cores e fontes no topo, em :root)
assets/js/main.js      WhatsApp, horário e "aberto agora", encomenda, calculadora de churrasco, CTA fixo, mapa, eventos
assets/img/            fotos em WebP (2 tamanhos cada), logo, favicons e imagem de compartilhamento
```

## Rodar localmente

```bash
npx serve .
# ou: python3 -m http.server 8000
```

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| **Número do WhatsApp** | `WHATSAPP` em `assets/js/main.js` **e** o número `556933213901` nos links de `index.html` (usados sem JavaScript) |
| **Horário** | `HORARIO` em `main.js`, a tabela em `#visite`, o rodapé, a pergunta do FAQ e o schema no `<head>` |
| **Horário especial / feriados** | `HORARIO_ESPECIAL` e `FERIADOS_FIXOS` em `main.js` |
| Cortes, quantidades e preparos da encomenda | opções do formulário `#builder` em `index.html` |
| Gramas por pessoa no churrasco | `G_ADULTO` e `G_CRIANCA` em `main.js` (hoje 400 g e 200 g) |
| Mensagem pronta de cada botão | atributo `data-msg` de cada link `.js-wa` |
| Cores e fontes | variáveis no topo de `assets/css/site.css` |

## Pendências antes de publicar

1. **WhatsApp**: o número usado é o fixo do Google, (69) 3321-3901, como **palpite**. Confirme qual número atende no WhatsApp (o Instagram leva a um linktr.ee).
2. **Horário (conflito)**: o Google diz seg. a sáb. das 8h às 20h e dom. das 8h às 13h. A bio do Instagram diz seg. a sáb. das 7h às 22h e dom. das 7h às 13h. O site usa o do Google. Confirme qual vale e corrija o outro canal.
3. **Unidades**: no Google a loja aparece como "Zero Grau Frios e Cortes **Centro**", mas o endereço é no Jardim Eldorado. Se houver mais de uma unidade, o site precisa mostrar as duas.
4. **Logo**: o arquivo recebido tem 145 px. Peça a logo em vetor (SVG, PDF ou AI) ou em PNG grande e troque `assets/img/logo-zerograu.png`.
5. **Cortes da encomenda**: confirme a lista (picanha, ancho, contrafilé, fraldinha, alcatra, maminha, filé mignon, cupim, costela, suíno, frango, linguiça).
6. **Entrega**: o site só afirma delivery para o Sushi Grau (como nos posts). Se houver entrega de carnes e mercado, vira argumento na página.
7. **Fotos reais**: quando a loja tiver fotos profissionais dos próprios cortes e do balcão, elas convertem mais que as ilustrativas e podem substituir as atuais com o mesmo nome de arquivo.
8. **Domínio**: ao publicar, troque `canonical`, `og:image` e o schema para URLs absolutas.

## Medição

`main.js` envia eventos para `dataLayer` (GTM), `gtag` (GA4) e `fbq` (Meta Pixel), se estiverem instalados:

- `whatsapp_click`: qualquer botão de WhatsApp (`source` diz qual)
- `generate_lead`: envio da encomenda (`corte`, `qtd`) ou da calculadora de churrasco (`adultos`, `criancas`)
- `rota_click`, `ligar`, `instagram_click`, `google_reviews`, `map_open`

Todas as mensagens começam com "Vim pelo site". Assim a loja consegue contar, no próprio WhatsApp, quantos pedidos vieram do site.
