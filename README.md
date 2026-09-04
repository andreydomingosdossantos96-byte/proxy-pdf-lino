# Site WK Films · WK AgroMarketing

Landing page de alta conversão para a WK — produtora audiovisual e agência de marketing
em Vilhena–RO. Site estático (HTML + CSS + JS puro), sem build, sem dependências.

## Estrutura

```
index.html            Página principal (todas as seções)
obrigado.html         Página de agradecimento pós-envio do formulário
assets/css/styles.css Estilo completo (tema escuro + verde da marca #05D702)
assets/js/main.js     Comportamento: WhatsApp, menu, filtros, FAQ, formulário, horário
assets/img/           Logo (recortado e com fundo transparente), fotos da equipe,
                      pôsteres dos vídeos, favicon e capa de compartilhamento
assets/video/         Vídeos do portfólio em MP4 (H.264), otimizados para web
robots.txt / sitemap.xml / vercel.json
api/proxy-pdf.js      Função serverless já existente no repositório (mantida)
```

## Rodar localmente

```bash
npx http-server -p 8080 -c-1 .
# abra http://localhost:8080
```

## Publicar

O repositório já está no formato Vercel (`api/` + arquivos estáticos na raiz).
Basta importar o repositório na Vercel — sem comando de build, diretório de saída `.`.
Funciona igual em Netlify, GitHub Pages ou qualquer hospedagem estática.

Depois de publicar, aponte o domínio e troque `https://wkfilms.com.br/` pela URL real
em `index.html` (canonical + Open Graph), `robots.txt` e `sitemap.xml`.

## Vídeos do portfólio

Três produções reais ficam na seção Portfólio (`assets/video/`):

| Arquivo | Conteúdo | Duração | Tamanho |
| --- | --- | --- | --- |
| `wk-institucional.mp4` | Filme institucional da WK | 1min30 | 4,3 MB |
| `wk-agro.mp4` | Filme de campo para o agronegócio | 1min51 | 7,8 MB |
| `wk-making-of.mp4` | Bastidores de set (vertical) | 21s | 1,7 MB |

Eles usam `preload="none"`: **nada é baixado até o visitante tocar no play**, então
a página abre leve mesmo no 4G. Ao clicar, o player ganha os controles nativos e
os outros vídeos pausam automaticamente.

Para trocar um vídeo, substitua o arquivo em `assets/video/` e gere um novo pôster:

```bash
ffmpeg -i assets/video/wk-agro.mp4 -ss 12 -frames:v 1 -vf "scale=640:-2" -q:v 5 assets/img/poster-agro.jpg
```

Para comprimir um vídeo novo no mesmo padrão (960px de largura, ~700 kbps):

```bash
ffmpeg -i original.mov -vf "scale=960:-2" -c:v libx264 -crf 30 -maxrate 700k \
  -bufsize 1400k -preset slow -movflags +faststart -c:a aac -b:a 64k -ac 1 saida.mp4
```

## O que já está configurado com dados reais

- WhatsApp/telefone: **(69) 98463-8776** (`5569984638776`)
- Endereço: R. São Luiz, 350 — Quinto BEC, Vilhena–RO, 76988-070 (com mapa embutido)
- Horários: seg–sex 08h–18h · sáb 08h–11h30 · dom fechado
  (a barra do topo mostra "aberto/fechado agora" em tempo real, no fuso de Rondônia)
- Instagram: @wkfilms.ro · 10,8 mil seguidores · 352 publicações
- Cor da marca extraída do logo oficial: `#05D702`
- Dados estruturados (JSON-LD `ProfessionalService`) para aparecer melhor no Google

## O que você precisa revisar antes de divulgar

1. **Depoimentos** (`#depoimentos`): os três textos são **modelos de exemplo**.
   Substitua por depoimentos reais de clientes, com autorização, de preferência
   com nome e empresa.
2. **Portfólio** (`#portfolio`): os seis cards são espaços reservados com fundo
   colorido. Troque por thumbnails reais (`<img>` dentro de `.work__thumb`) e pelos
   links dos posts/YouTube de cada projeto.
3. **Planos** (`#planos`): os itens de cada pacote e os valores ("sob consulta")
   devem refletir exatamente o que você entrega e cobra.
4. **Links sociais**: YouTube e Facebook no rodapé e no JSON-LD estão com URLs
   genéricas — coloque as suas.
5. **Números do rodapé/estatísticas**: "100% dos projetos com contrato" e demais
   afirmações — confirme se descrevem sua operação.
6. **Domínio**: substituir `wkfilms.com.br` onde aparece (ver seção acima).

## Personalizações rápidas

**Número do WhatsApp e destino pós-formulário** — topo de `assets/js/main.js`:

```js
var CONFIG = {
  whatsapp: '5569984638776',
  origem: 'site-wk',
  paginaObrigado: 'obrigado.html'   // '' para não redirecionar
};
```

**Mensagem de cada botão** — qualquer elemento com `data-wa="..."` vira um link
do WhatsApp com aquele texto já preenchido:

```html
<a class="btn btn--wa" href="#" data-wa="Olá! Quero um orçamento de vídeo.">Orçamento</a>
```

**Cores** — variáveis no topo de `assets/css/styles.css` (`--verde`, `--bg`, `--surface`…).

**Horário de funcionamento** — objeto `HORARIOS` em `assets/js/main.js`
(minutos desde a meia-noite; `null` = fechado) e a tabela `#hoursTable` no HTML.

**Pixel do Meta / Google Analytics** — basta colar o script de instalação no `<head>`.
O site já dispara eventos automaticamente quando os scripts existem:
`whatsapp_click`, `lead_formulario`, `filtro_portfolio`, `faq_abrir`.

## Recursos de conversão implementados

- CTA de WhatsApp em todas as dobras + botão flutuante + barra fixa no celular
- Formulário que monta a mensagem pronta e abre o WhatsApp (com validação,
  máscara de telefone e proteção contra robô)
- Prova social: contadores animados, depoimentos e barra de números
- Seção de dores antes da oferta, método em 5 etapas e FAQ com objeções
- Status "aberto agora" ao vivo, mapa, rota e horários com o dia atual destacado
- SEO local: title/description, Open Graph, sitemap, robots e dados estruturados
- Acessibilidade: navegação por teclado, foco visível, `prefers-reduced-motion`,
  rótulos ARIA e link de pular para o conteúdo

## Arquivo para enviar ao cliente

```bash
python3 tools/build-preview.py
```

Gera duas versões auto-contidas (CSS, JS e imagens embutidos no próprio HTML):

- `preview/wk-site-preview.html` — **arquivo único para enviar ao cliente.**
  Abre com dois toques no celular ou no computador, funciona sem internet
  (só as fontes e o mapa precisam de conexão) e não depende de mais nenhum arquivo.
  Os vídeos **não** viajam dentro dele (ficariam 14 MB): no lugar aparecem as capas
  com o aviso "vídeo completo no site publicado". Para o cliente assistir de fato,
  publique o site ou envie os MP4 junto.
- `preview/artifact.html` — mesma página sem as tags de documento, usada para
  publicar o link de aprovação online.

Nessas versões o formulário não redireciona para a página de obrigado (ela não
viaja junto): ao enviar, a mensagem abre no WhatsApp e os campos são limpos.
Rode o comando de novo sempre que alterar o site para atualizar os dois arquivos.
