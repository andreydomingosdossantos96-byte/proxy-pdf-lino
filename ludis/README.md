# Ludi's Biscoiteria — site de conversão

Página única da **Ludi's Biscoiteria** (biscoitos artesanais, personalizados e corporativos), pensada primeiro para o celular. Ideia central: **"Da nossa cozinha pra sua mesa, com amor."** (a frase da bio do Instagram). O cliente escolhe os itens no cardápio, monta a encomenda e a mensagem chega pronta no WhatsApp, com itens, quantidades, total estimado, data e recado.

Visual: creme, rosa e caramelo (as cores do logotipo), tipografia Fraunces + Nunito Sans + Caveat (letra de mão nos detalhes), recortes arredondados e a borda "de babado" que lembra o cardápio de cookies do Instagram.

As **fotos foram geradas com a IA do Figma** (arquivo "Ludi's Biscoiteria — imagens do site" na conta da DOMINGOS TECH). São **ilustrativas**, não fotos dos produtos reais, e o rodapé e o FAQ avisam isso. O **logotipo foi vetorizado a partir da foto de perfil do Instagram** (`assets/img/logo-ludis.svg` é o arquivo-mestre; a página usa as versões WebP).

HTML/CSS/JS puro, sem build e sem dependências. A pasta é autocontida.

## Estrutura

```
index.html             página (textos, seções, SEO, schema Bakery)
assets/css/site.css    todo o visual (cores e fontes no topo, em :root)
assets/js/main.js      WhatsApp (config), carrinho de encomenda, mensagem pronta, barra fixa, orçamento corporativo, eventos
assets/img/            fotos em WebP (640 e 1024 px), logo, favicons e imagem de compartilhamento
```

## Rodar localmente

```bash
npx serve .
# ou: python3 -m http.server 8000
```

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| **Número do WhatsApp** | `WHATSAPP` em `assets/js/main.js` **e** o número `5569981078753` nos links de `index.html` (usados sem JavaScript) e no rodapé |
| **Preços, nomes e descrições** | cada `<article class="prod">` do cardápio em `index.html` (`data-nome`, `data-preco`, `data-unid`). O carrinho lê esses atributos |
| Mensagem pronta de cada botão | atributo `data-msg` de cada link `.js-wa` |
| Cores e fontes | variáveis no topo de `assets/css/site.css` |
| Fotos | `assets/img/<nome>-640.webp` e `-1024.webp` (mesmo nome, troque os arquivos) |

## Pendências antes de publicar

1. **WhatsApp**: o número usado é **(69) 98107-8753**, do link de encomenda da bio (`contate.me/5569981078753`). A etiqueta das caixas mostra outro, **(69) 98161-8085**. Confirme qual atende as encomendas.
2. **Preço do Cookie Nutella**: o cardápio de cookies diz **R$ 18,00** (usado no site), mas o post de lançamento do Nutella parece dizer "R$ 16". Confirme o valor atual.
3. **Tamanho dos pacotes novos**: Mini Cookies (R$ 30) e Sequilho de Leite Ninho (R$ 32) aparecem no post de novidades **sem o peso**. O site mostra "/ pacote". Informe o peso para trocar.
4. **Cidade e área de atendimento**: o DDD é 69 (Rondônia), mas o perfil não diz a cidade. O site não promete entrega em lugar nenhum: o cliente escolhe "Retirar" ou "Entrega (a combinar)" e a loja confirma. Se houver área de entrega ou taxa, vale informar na página.
5. **Pagamento e antecedência**: o site diz só que são combinados pelo WhatsApp. Se houver Pix, cartão, sinal ou prazo mínimo, vale escrever no FAQ.
6. **Fotos reais**: as imagens são ilustrativas. Quando houver fotos profissionais dos próprios biscoitos, elas convertem mais e podem substituir as atuais com o mesmo nome de arquivo.
7. **Fotos que faltaram**: a cota de imagens da IA do Figma acabou antes das fotos de "corporativo" (linha de lembrancinhas) e "mãos na massa". Elas voltam a poder ser geradas depois das 00h (UTC) do dia seguinte.
8. **Prova social**: o site não tem depoimentos porque não encontramos nenhum para copiar. O destaque "Clientes" do Instagram é uma boa fonte: peça autorização e coloque 2 ou 3 depoimentos reais.
9. **Logo**: foi vetorizado de uma foto de perfil (mais de 95 KB no SVG-mestre). Se existir o arquivo original (AI, PDF ou SVG), troque.
10. **Domínio**: ao publicar, troque `canonical`, `og:image` e o schema para URLs absolutas.

## Medição

`main.js` envia eventos para `dataLayer` (GTM), `gtag` (GA4) e `fbq` (Meta Pixel), se estiverem instalados:

- `whatsapp_click`: qualquer botão de WhatsApp (`source` diz qual)
- `add_to_cart`: item adicionado (`item`, `quantidade`, `valor`)
- `generate_lead`: envio da encomenda (`itens`, `valor`) ou do pedido de orçamento corporativo
- `ver_cardapio`, `instagram_click`

Todas as mensagens começam com "Vim pelo site". Assim a loja consegue contar, no próprio WhatsApp, quantos pedidos vieram do site.
