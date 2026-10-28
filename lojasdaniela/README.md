# Lojas Daniela Vilhena — site de conversão (modelo Stampa)

Página única da **Lojas Daniela** (Vilhena-RO), pensada primeiro para o celular e construída sobre o mesmo modelo editorial do site da Stampa: letreiro gigante na capa, faixa vermelha, passo a passo com celular, trilho de departamentos, "Monte seu pedido", marcas, loja e dúvidas.

Ideia central: **"Faz por você o que ninguém faz."** (o slogan da loja) com a oferta na frente: **cartão em até 10x** e **Pula-Pula (1ª parcela em até 90 dias)**. O caminho principal é o **pré-cadastro pelo WhatsApp do Financeiro**; o secundário é falar com uma das duplas de vendedoras. Cada botão abre o WhatsApp com a mensagem pronta.

Visual: vermelho da marca, papel claro e tipografia editorial (Instrument Serif + Inter Tight). **Nenhuma foto da loja é usada**: tudo é ilustração vetorial própria (SVG), no mesmo estilo do site da Stampa.

HTML/CSS/JS puro, sem build e sem dependências. A pasta é autocontida.

## Estrutura

```
index.html             página (textos, seções, SEO, schema ClothingStore com horário)
assets/css/site.css    todo o visual (cores e fontes no topo, em :root)
assets/js/main.js      equipes de WhatsApp, horário e "aberto agora", montador de pedido, animações, CTA fixo, mapa, eventos
assets/illus/          ilustrações em SVG (peças, cartão, sacola, fachada e estampas)
assets/img/            logo (vetor), favicons e imagem de compartilhamento
```

## Rodar localmente

```bash
npx serve .
# ou: python3 -m http.server 8000
```

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| **Números de WhatsApp** | `EQUIPES` em `assets/js/main.js` (Financeiro e cada dupla), **e** o número `5569992655308` nos links de `index.html` (usados sem JavaScript) |
| Distribuição entre as duplas | `VENDAS` em `main.js`: nos botões "falar com uma vendedora" o site sorteia uma dupla a cada abertura da página |
| **Horário** | `HORARIO` (em minutos) em `main.js`, a tabela em `#loja`, o FAQ e o schema no `<head>` |
| Horário especial / feriados | `HORARIO_ESPECIAL` e `FERIADOS_FIXOS` em `main.js` |
| Mensagem pronta de cada botão | atributo `data-msg` de cada link `.js-wa` |
| Equipe de cada botão | atributo `data-equipe` (`financeiro` ou o nome da dupla; sem o atributo = sorteia uma dupla de vendas) |
| Cores e fontes | variáveis no topo de `assets/css/site.css` |
| Marcas | lista `#marcas`, legenda do rodapé |

## Pendências antes de publicar

1. **WhatsApp (o mais importante)**: hoje **todas** as equipes usam o (69) 99265-5308, que é o telefone da ficha do Google, só como palpite. Informe o número do Financeiro e de cada dupla (Glória e Evilyn, Marilza e Aline, Ozeni e Ana, Rayssa e Emily). Diretórios online listam outro WhatsApp, (69) 99901-9504, e um fixo, (69) 3322-2385: confirme qual é o oficial.
2. **Endereço**: Av. Major Amarante, 3447, Centro, veio de diretórios online (não aparece nas imagens enviadas). Confirme, e se houver mais de uma unidade ("Lojas" no nome), o site precisa mostrar todas.
3. **Logo**: o vetor foi **redesenhado a partir de capturas de tela** (a marca em risco e o letreiro DANIELA no traço da marca). Peça o arquivo original (SVG, PDF ou AI) e troque `assets/img/logo-daniela.svg`.
4. **Condições de crédito**: o site repete o que está na página de pré-cadastro atual ("até 10x no cartão", "Pula-Pula: primeira parcela em até 90 dias") e acrescenta "condições sujeitas à análise". Confirme os termos exatos e se há exigência legal de informar juros ou prazos.
5. **"Dinheiro"** (bio do Instagram): não ficou claro se significa empréstimo ou pagamento à vista. O site só diz "Cartões, dinheiro e crediário próprio" no FAQ e no rodapé. Detalhe, se for um produto.
6. **Marcas**: Vizzano, Viamarte, Malwee e Carinhoso foram vistas nas postagens. Confirme a lista e inclua outras.
7. **Departamentos**: confirme infantil, academia, perfumaria, relógios e bolsas.
8. **Link da loja online**: o site usa `links.lojasdaniela.com.br` (o da bio do Instagram). Se existir um endereço direto da loja virtual, troque `SITE` nos links.
9. **Ilustrações x fotos**: são representações artísticas (o rodapé avisa). Fotos reais dos produtos convertem mais e podem entrar nos cards sem mudar o layout.
10. **Domínio**: ao publicar, troque `canonical`, `og:image` e o schema para URLs absolutas.

## Medição

`main.js` envia eventos para `dataLayer` (GTM), `gtag` (GA4) e `fbq` (Meta Pixel), se estiverem instalados:

- `whatsapp_click`: qualquer botão de WhatsApp (`source` diz qual)
- `generate_lead`: envio pelo "Monte seu pedido" (`equipe`, `secao`, `pagamento`)
- `rota_click`, `ligar`, `instagram_click`, `site_click`, `google_reviews`, `map_open`

Todas as mensagens começam com "Vim pelo site". Assim a loja consegue contar, no próprio WhatsApp, quantas conversas vieram do site.
