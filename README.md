# Domingos Tech — site de conversão

Landing page estática (HTML + CSS + JS puro, sem build) para captação de clientes
de desenvolvimento de aplicativos. Roda na Vercel junto com a função existente em
`/api/proxy-pdf.js`.

```
index.html              página inteira
assets/css/styles.css   estilos
assets/js/main.js       comportamento + BLOCO DE CONFIGURAÇÃO
assets/img/             logo, favicons e imagem de compartilhamento
robots.txt / sitemap.xml
api/proxy-pdf.js        função serverless que já existia (não foi alterada)
```

---

## 1. Antes de publicar — obrigatório

### 1.1 Número do WhatsApp

Abra `assets/js/main.js` e edite o bloco `CONFIG` no topo:

```js
const CONFIG = {
  whatsapp: "5511987654321",       // 55 + DDD + número, só dígitos
  whatsappLabel: "(11) 98765-4321",
  email: "contato@domingostech.com.br",
  ...
};
```

Enquanto o número estiver com zeros, **todos os botões de WhatsApp levam a lugar
nenhum** e o console do navegador mostra um aviso.

### 1.2 Preços

Os valores em `index.html` (seção "Investimento") são **exemplos, não são seus
preços**. Procure por `data-price=` e troque pelos números reais. Se decidir não
mostrar preço, troque o valor por "Sob consulta" — mas leia o item 4 antes.

### 1.3 Domínio

Se o domínio final não for `domingostech.com.br`, troque em três lugares do
`index.html`: `<link rel="canonical">`, as tags `og:url` / `og:image` e o
bloco JSON-LD. E também em `robots.txt` e `sitemap.xml`.

---

## 2. Publicar na Vercel

O projeto não precisa de build. Na Vercel:

- Framework Preset: **Other**
- Build Command: vazio
- Output Directory: vazio (raiz)

O `index.html` é servido em `/` e a função continua em `/api/proxy-pdf`.

---

## 3. Medir o que acontece (recomendado)

O site já dispara eventos; falta só instalar a ferramenta. Cole o script do
Google Analytics 4 e/ou do Meta Pixel antes de `</head>` e os eventos abaixo
passam a chegar sozinhos:

| Evento               | Quando dispara                          |
| -------------------- | --------------------------------------- |
| `clique_cta`         | qualquer botão (com a origem do clique) |
| `lead_enviado`       | formulário validado e enviado           |
| `form_erro_validacao`| pessoa tentou enviar com campo errado   |
| `faq_aberta`         | abriu uma pergunta                      |

Sem isso, você não vai saber qual seção está travando a conversão — vai chutar.

---

## 4. Buracos conhecidos (leia antes de rodar tráfego pago)

Estes pontos foram deixados de fora de propósito porque dependem de decisão
ou de dado que só você tem:

1. **O lead não é gravado em lugar nenhum.** O formulário monta a mensagem e
   abre o WhatsApp; se a pessoa não tocar em "enviar" na conversa, o contato se
   perde e você nunca fica sabendo. A correção é criar um `api/lead.js` (mesmo
   padrão do `proxy-pdf.js`) que salve o lead ou dispare um e-mail antes de
   redirecionar. Precisa de uma chave de serviço de e-mail (Resend, SendGrid) ou
   de um banco.

2. **Não existe prova social.** Nenhum depoimento, logo de cliente ou case foi
   inventado — inventar seria o jeito mais rápido de perder a venda quando o
   cliente checar. Assim que tiver o primeiro projeto entregue, peça: nome,
   empresa, foto, o número que melhorou e uma frase. Prova real é a alavanca
   que mais move conversão nesta página, mais que qualquer ajuste de design.

3. **Não há portfólio.** A seção "Ver o que construímos" leva para a lista de
   serviços porque ainda não há projeto para mostrar. Quando houver, o lugar
   natural é uma seção nova entre "Soluções" e "Como funciona".

4. **As promessas do texto viram contrato.** A página afirma código-fonte do
   cliente, escopo fechado, entrega a cada 15 dias e prazo de 4 a 12 semanas.
   Ou você cumpre isso, ou muda o texto — prometer e não entregar custa mais
   caro que não prometer.

---

## 5. Rodar localmente

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

Sem servidor os caminhos que começam com `/` não resolvem — abrir o arquivo
direto com duplo clique não funciona.
