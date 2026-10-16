#!/bin/sh
# Gera index.html (site completo para hospedar) a partir de app.html.
cd "$(dirname "$0")"
{
  echo '<!doctype html>'
  echo '<html lang="pt-BR">'
  echo '<head>'
  echo '<meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  echo '<meta name="description" content="Lista de presentes em Pix para casamento, chá de bebê e aniversário. O dinheiro cai direto na sua conta, sem taxa.">'
  echo '<meta property="og:title" content="Lista de presentes em Pix">'
  echo '<meta property="og:description" content="Escolha um presente e pague pelo Pix. Direto para a conta de quem organizou, sem taxa.">'
  echo '<meta property="og:type" content="website">'
  echo '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>'
  echo '</head>'
  echo '<body>'
  sed "s|https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js|qrcode.js|" app.html
  echo '</body>'
  echo '</html>'
} > index.html
