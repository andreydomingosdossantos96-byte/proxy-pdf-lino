# Stampa Vilhena — site de conversão

Página única, pensada para o celular, da loja **Stampa** (Vilhena-RO). A ideia central é: **"Sua consultora de moda no WhatsApp"**. Cada botão abre uma conversa com uma consultora, já com uma mensagem pronta para aquele contexto (ocasião, presente, marca, departamento, visita à loja).

HTML/CSS/JS puro, sem build e sem dependências. A pasta é autocontida: pode ir para outro repositório ou domínio (ex.: `lojastampa.com.br`) do jeito que está.

## Estrutura

```
index.html               página (textos, seções, SEO, schema ClothingStore)
assets/css/base.css      cores, tipografia, botões, cabeçalho, rodapé, CTA fixo
assets/css/sections.css  estilos de cada seção
assets/js/main.js        WhatsApp (config), construtor de mensagem, CTA fixo, mapa, eventos
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
| **Número do WhatsApp** | `WHATSAPP.principal` em `assets/js/main.js`. Hoje está o fixo `556933212158` só como **palpite**. |
| Consultoras por departamento | `WHATSAPP.feminino` / `WHATSAPP.masculino` em `main.js` (vazio = usa o principal) |
| Mensagem pronta de cada botão | atributo `data-msg` de cada link `.js-wa` em `index.html` |
| Cores e fontes | variáveis no topo de `assets/css/base.css` |
| Marcas | chips em `#marcas`, faixa do hero (`.brand-strip`), FAQ, `<title>` e o aviso no rodapé |

## Pendências antes de publicar

1. **WhatsApp**: confirmar o número oficial (e se há números diferentes para feminino e masculino).
2. **Fotos**: as imagens foram recortadas de prints do Instagram e do Google (~210–240 px). Troque pelos originais mantendo os nomes dos arquivos.
3. **Logo**: mandar o logo em vetor (SVG) ou PNG grande. O atual é um recorte de 146 px.
4. **Direito de imagem**: confirmar autorização das pessoas que aparecem em `clientes-aramis*.webp`, `consultora-blazer.webp` e nos ensaios.
5. **Marcas**: confirmar que Farm Rio, Animale, Aramis, Calvin Klein e Shoulder continuam na loja, e se há outras.
6. **Acessórios**: confirmar bolsas, cintos, calçados e bonés.
7. **Horário**: o site não mostra horário (só se sabe "fecha 19:00" num dia útil e que existe um "novo horário de sábado"). Com o horário completo, dá para pôr na página e no schema.
8. **Grupo Whats**: se houver link de convite fixo, ele pode substituir a mensagem "quero entrar no grupo".
9. **Domínio**: ao publicar (ex.: na raiz de `lojastampa.com.br`), troque `canonical`, `og:image` e o schema para URLs absolutas e atualize o link da bio.
10. **Números**: revisar periodicamente "36 anos", "4,9 com 54 avaliações" e "11,9 mil seguidores".

## Medição

`main.js` envia eventos para `dataLayer` (GTM), `gtag` (GA4) e `fbq` (Meta Pixel), se estiverem instalados:

- `whatsapp_click`: qualquer botão de WhatsApp (`source` diz qual)
- `generate_lead`: envio pelo construtor "Monte seu pedido" (`secao`, `ocasiao`, `para`)
- `rota_click`, `ligar`, `instagram_click`, `google_reviews`, `map_open`

Todas as mensagens começam com "Vim pelo site". Assim a loja consegue contar, no próprio WhatsApp, quantas conversas vieram do site, mesmo sem nenhuma ferramenta instalada.
