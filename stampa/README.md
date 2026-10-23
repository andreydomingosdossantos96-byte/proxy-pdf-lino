# Stampa Vilhena — site de conversão (versão editorial)

Página única da loja **Stampa** (Vilhena-RO), pensada primeiro para o celular. A ideia central continua a mesma: **"Sua consultora de moda no WhatsApp"**. Cada botão abre uma conversa com uma consultora, já com uma mensagem pronta para aquele contexto (ocasião, presente, marca, departamento, visita à loja).

O visual é de **revista de moda**: letreiro STAMPA gigante na capa, tipografia editorial (Instrument Serif + Inter Tight) e **ilustrações vetoriais próprias** no lugar das fotos. São *flat lays* de roupas e acessórios, estampas e cenas da loja. O site não usa nenhuma foto da loja.

HTML/CSS/JS puro, sem build e sem dependências. A pasta é autocontida: pode ir para outro repositório ou domínio (ex.: `lojastampa.com.br`) do jeito que está.

## Estrutura

```
index.html             página (textos, seções, SEO, schema ClothingStore)
assets/css/site.css    todo o visual (cores e fontes no topo, em :root)
assets/js/main.js      WhatsApp (config), montador de pedido, animações, CTA fixo, mapa, eventos
assets/illus/          ilustrações em SVG (peças, acessórios, estampas e cenas)
assets/img/            logo em vetor (logo-stampa.svg), favicons e imagem de compartilhamento
```

## Rodar localmente

```bash
npx serve .
# ou: python3 -m http.server 8000
```

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| **Número do WhatsApp** | `WHATSAPP.principal` em `assets/js/main.js` **e** o número `556933212158` nos links de `index.html` (usados quando o JavaScript não carrega). Hoje é o fixo, só como **palpite**. |
| Consultoras por departamento | `WHATSAPP.feminino` / `WHATSAPP.masculino` em `main.js` (vazio = usa o principal) |
| Mensagem pronta de cada botão | atributo `data-msg` de cada link `.js-wa` em `index.html` |
| Cores e fontes | variáveis no topo de `assets/css/site.css` |
| Marcas | faixa vermelha (`.ticker`), lista `#marcas`, legenda da capa, FAQ e o aviso no rodapé |
| Ilustração de cada marca (prévia que segue o mouse) | atributo `data-art` de cada `.brand-row` |
| Logo | `assets/img/logo-stampa.svg` (vetor). O letreiro grande da capa e do rodapé usa o mesmo desenho de letras |

## Pendências antes de publicar

1. **WhatsApp**: confirmar o número oficial (e se há números diferentes para feminino e masculino).
2. **Logo**: o vetor foi redesenhado a partir de um recorte de 146 px. Se existir o arquivo original (AI, PDF, SVG ou PNG grande), compare e substitua `logo-stampa.svg`.
3. **Ilustrações x fotos**: as ilustrações são representações artísticas, não as peças reais da loja (isso está dito no rodapé). Para vender roupa, foto real do produto converte mais. Quando houver fotos profissionais, elas podem entrar nos cards de ocasião sem mudar o layout.
4. **Marcas**: confirmar que Farm Rio, Animale, Aramis, Calvin Klein e Shoulder continuam na loja, e se há outras.
5. **Acessórios**: confirmar bolsas, cintos, calçados e bonés. A ilustração de chapéu e bota aparece no card "Rodeio & feira agro": se a loja não vende esses itens, troque a ilustração do card.
6. **Horário**: o site não mostra horário (só se sabe "fecha 19:00" num dia útil e que existe um "novo horário de sábado"). Com o horário completo, dá para pôr na página e no schema.
7. **Grupo Whats**: se houver link de convite fixo, ele pode substituir a mensagem "quero entrar no Grupo Whats".
8. **Domínio**: ao publicar (ex.: na raiz de `lojastampa.com.br`), troque `canonical`, `og:image` e o schema para URLs absolutas e atualize o link da bio.
9. **Números**: revisar periodicamente "36 anos", "4,9 com 54 avaliações" e "11,9 mil seguidores".

## Medição

`main.js` envia eventos para `dataLayer` (GTM), `gtag` (GA4) e `fbq` (Meta Pixel), se estiverem instalados:

- `whatsapp_click`: qualquer botão de WhatsApp (`source` diz qual)
- `generate_lead`: envio pelo montador "Monte seu pedido" (`secao`, `ocasiao`, `para`)
- `rota_click`, `ligar`, `instagram_click`, `google_reviews`, `map_open`

Todas as mensagens começam com "Vim pelo site". Assim a loja consegue contar, no próprio WhatsApp, quantas conversas vieram do site, mesmo sem nenhuma ferramenta instalada.
