# Site WK Films · WK AgroMarketing

Site de conversão da WK — produtora audiovisual e agência de marketing em Vilhena–RO.
HTML, CSS e JavaScript puros: sem build, sem framework, sem dependência externa
além das fontes do Google.

## Direção visual

Referência de partida: o site da Alfa Diesel, indicado pelo cliente. O que foi
trazido de lá — e adaptado à marca WK:

- **Herói com foto sangrando a tela**, em preto e branco, com véu escuro por cima:
  o texto vive dentro da imagem.
- **Tipografia condensada e pesada em caixa alta** (Archivo com o eixo de largura
  em 72%), com peso de cartaz.
- **Título em duas cores**: uma parte na cor do texto, a outra inteira no verde.
- **Seções alternando escuro e claro**, cada uma abrindo com um traço + rótulo
  pequeno na cor da marca.
- **Listas numeradas** (01, 02, 03) com filete fino, ícone e seta quadrada.
- **Geometria dura**, sem cantos arredondados, e a seta ↗ como assinatura.

### A regra do verde

`#05D702` tem luminância alta: sobre fundo escuro rende 9,4:1 de contraste
(ótimo), sobre fundo claro rende 1,8:1 (ilegível). Por isso o sistema tem dois
valores do mesmo tom:

| Token | Valor | Onde |
| --- | --- | --- |
| `--verde` | `#05D702` | textos, rótulos e preenchimentos sobre fundo escuro |
| `--verde-tinta` | `#0A7D00` | títulos e rótulos sobre as seções claras (4,7:1) |
| `--verde-fundo` | `#04A802` | estado de hover dos botões verdes |

Nunca use `--verde` como texto sobre `--osso`.

> Este repositório também abriga o site da **Domingos Tech** em `/domingos-tech/`,
> construído no mesmo sistema visual. Instruções próprias em
> [`domingos-tech/README.md`](domingos-tech/README.md).

## Estrutura

```
index.html            Página principal (herói + 9 seções)
obrigado.html         Página de retorno do formulário
assets/css/wk.css     Sistema visual completo
assets/js/wk.js       WhatsApp, menu, vídeos, situação, formulário
assets/img/           Logo, fotos, pôsteres, favicon e capa de compartilhamento
assets/video/         Vídeos do portfólio em MP4 (H.264)
tools/build-preview.py  Gera as versões auto-contidas (aceita 'wk' ou 'dt')
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
python3 tools/build-preview.py       # WK Films
python3 tools/build-preview.py dt    # Domingos Tech
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
- A fita do topo mostra a situação em tempo real, no fuso de Rondônia
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
