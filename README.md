# Site WK Films · WK AgroMarketing

Site de conversão da WK — produtora audiovisual e agência de marketing em Vilhena–RO.
HTML, CSS e JavaScript puros: sem build, sem framework, sem dependência externa
além das fontes do Google.

## Direção visual — "Press Kit"

O site é montado como um material impresso de produtora:

- **Papel e tinta.** Fundo claro (`#F5F6F2`) com tinta quase preta (`#0F1310`).
- **O verde da marca (`#05D702`) é marca-texto, não texto.** Esse verde tem luminância
  alta demais para ser lido sobre papel, então ele só aparece como bloco preenchido
  (com tinta preta em cima), régua ou fundo de botão. Sobre os blocos escuros ele
  vira texto normalmente.
- **Tipografia:** Archivo Black nos títulos de cartaz, Archivo no texto corrido e
  Courier Prime — a fonte de roteiro — em legendas, numeração e etiquetas.
- **Estrutura de roteiro.** Cada seção é uma cena numerada com slugline
  (`01 · DIAGNÓSTICO`), os serviços viram um bloco de créditos que abre linha a
  linha, o método é uma ordem de produção em tabela, a equipe é uma ficha técnica
  e o formulário é uma folha de chamada.

## Estrutura

```
index.html            Página principal (abertura + 9 cenas)
obrigado.html         Página de retorno do formulário
assets/css/wk.css     Sistema visual completo
assets/js/wk.js       WhatsApp, menu, vídeos, situação, formulário
assets/img/           Logo, fotos, pôsteres, favicon e capa de compartilhamento
assets/video/         Vídeos do portfólio em MP4 (H.264)
tools/build-preview.py  Gera as versões auto-contidas para enviar ao cliente
preview/              Saída do script acima
robots.txt · sitemap.xml · vercel.json
api/proxy-pdf.js      Função serverless que já existia no repositório
```

## Rodar localmente

```bash
npx http-server -p 8080 -c-1 .
```

## Publicar

Formato Vercel (`api/` + estáticos na raiz): importe o repositório, sem comando de
build, diretório de saída `.`. Funciona igual em Netlify, GitHub Pages ou qualquer
hospedagem estática. Depois troque `https://wkfilms.com.br/` pela URL real em
`index.html` (canonical e Open Graph), `robots.txt` e `sitemap.xml`.

## Vídeos do portfólio

| Arquivo | Conteúdo | Duração | Tamanho |
| --- | --- | --- | --- |
| `wk-institucional.mp4` | Filme institucional da WK | 1min30 | 4,3 MB |
| `wk-agro.mp4` | Filme de campo para o agronegócio | 1min51 | 7,8 MB |
| `wk-making-of.mp4` | Bastidores de set (vertical) | 21s | 1,7 MB |

Usam `preload="none"`: **nada é baixado até o visitante tocar no play**, então a
página abre leve no 4G. Ao clicar, o player ganha os controles nativos e os outros
vídeos pausam.

Trocar um vídeo e gerar o pôster novo:

```bash
ffmpeg -i original.mov -vf "scale=960:-2" -c:v libx264 -crf 30 -maxrate 700k \
  -bufsize 1400k -preset slow -movflags +faststart -c:a aac -b:a 64k -ac 1 \
  assets/video/wk-agro.mp4
ffmpeg -i assets/video/wk-agro.mp4 -ss 12 -frames:v 1 -vf "scale=640:-2" -q:v 5 \
  assets/img/poster-agro.jpg
```

Se o vídeo aparecer deitado, o conteúdo está girado dentro do contêiner: acrescente
`transpose=2` (90° anti-horário) ou `transpose=1` (horário) antes do `scale`.

## Arquivo para enviar ao cliente

```bash
python3 tools/build-preview.py
```

- `preview/wk-site-preview.html` — **arquivo único**, com CSS, JS e imagens embutidos.
  Abre com dois toques no celular, não depende de mais nada. Os vídeos não viajam
  dentro dele (seriam 14 MB): no lugar ficam as capas com aviso.
- `preview/artifact.html` — a mesma página sem as tags de documento, usada para
  publicar o link de aprovação.

Nas duas versões o formulário abre o WhatsApp com a mensagem pronta, mas não
redireciona para a página de obrigado.

## Dados reais já configurados

- WhatsApp e telefone: **(69) 98463-8776** (`5569984638776`)
- Endereço: R. São Luiz, 350 — Quinto BEC, Vilhena–RO, 76988-070
- Horários: seg–sex 08h–18h · sáb 08h–11h30 · dom fechado
- A fita do topo mostra "Gravando / Fora do ar" em tempo real, no fuso de Rondônia
- Instagram: @wkfilms.ro · 10,8 mil seguidores · 352 publicações
- Verde extraído do logo oficial: `#05D702`
- Dados estruturados JSON-LD (`ProfessionalService`) para busca local

## O que ainda precisa da sua revisão

1. **Depoimentos** (cena 06): os três textos são modelos. Troque por depoimentos
   reais, com autorização.
2. **Pacotes** (cena 07): confira os itens e defina se quer exibir valores.
3. **Domínio**: `wkfilms.com.br` está como exemplo em quatro lugares.
4. **Redes**: YouTube e Facebook não estão no rodapé — se quiser, me passe os links.

## Personalizações rápidas

Contato e destino pós-formulário, no topo de `assets/js/wk.js`:

```js
var CONFIG = {
  whatsapp: '5569984638776',
  paginaObrigado: 'obrigado.html'   // '' para só limpar o formulário
};
```

Qualquer elemento com `data-zap="..."` vira link do WhatsApp com aquele texto pronto.
Cores e fontes ficam nas variáveis do topo de `assets/css/wk.css`.
O expediente fica no objeto `EXPEDIENTE` de `assets/js/wk.js` (minutos desde a
meia-noite; `null` = fechado).

Pixel do Meta ou GA4: cole o script no `<head>`. O site já dispara `whatsapp_clique`,
`lead_folha`, `video_play`, `servico_abrir` e `duvida_abrir` quando eles existem.
