#!/bin/sh
# Gera o site pronto para hospedar em ../public (Vercel serve essa pasta).
# Uso: SITE_URL=https://seu-dominio.com.br ./build.sh
set -e
cd "$(dirname "$0")"
SITE_URL="${SITE_URL:-https://proxy-pdf-lino.vercel.app}"
OUT=../public
mkdir -p "$OUT"
FAVICON='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2218%22 fill=%22%2322123A%22/%3E%3Cg transform=%22translate(9 9) scale(.72) rotate(-12 32 32)%22%3E%3Cpath d=%22M10 32 L24 16 H52 a4 4 0 0 1 4 4 V44 a4 4 0 0 1 -4 4 H24 Z%22 fill=%22%23FF5B2E%22 stroke=%22%23FF5B2E%22 stroke-width=%224%22 stroke-linejoin=%22round%22/%3E%3Ccircle cx=%2223%22 cy=%2232%22 r=%224.5%22 fill=%22%2322123A%22/%3E%3C/g%3E%3C/svg%3E'
{
  echo '<!doctype html>'
  echo '<html lang="pt-BR">'
  echo '<head>'
  echo '<meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  echo '<meta name="description" content="Lista de presentes em Pix para casamento, chá de bebê e aniversário. O dinheiro cai direto na sua conta, sem taxa.">'
  echo '<meta property="og:title" content="Lista de presentes em Pix · presentinho">'
  echo '<meta property="og:description" content="Escolha um presente e pague pelo Pix. Direto para a conta de quem organizou, sem taxa.">'
  echo '<meta property="og:type" content="website">'
  echo "<meta property=\"og:url\" content=\"$SITE_URL/\">"
  echo "<meta property=\"og:image\" content=\"$SITE_URL/og.png\">"
  echo '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
  echo '<meta property="og:locale" content="pt_BR">'
  echo '<meta name="twitter:card" content="summary_large_image">'
  echo '<meta name="theme-color" content="#22123A">'
  echo "<link rel=\"icon\" href=\"$FAVICON\">"
  echo '<link rel="apple-touch-icon" href="icone.png">'
  echo '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>'
  echo '</head>'
  echo '<body>'
  echo '<noscript><p style="padding:24px;font-family:sans-serif">O presentinho precisa de JavaScript ligado para funcionar.</p></noscript>'
  sed "s|https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js|qrcode.js|" app.html
  echo '</body>'
  echo '</html>'
} > "$OUT/index.html"
cp qrcode.js termos.html "$OUT/"
cp logo/presentinho-icone.png "$OUT/icone.png"
[ -f og.png ] && cp og.png "$OUT/og.png"
printf 'User-agent: *\nAllow: /\n' > "$OUT/robots.txt"
# cópia local de conveniência
cp "$OUT/index.html" index.html
echo "site gerado em $(cd "$OUT" && pwd) para $SITE_URL"
