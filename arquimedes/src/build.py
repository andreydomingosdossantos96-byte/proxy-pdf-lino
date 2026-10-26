#!/usr/bin/env python3
"""Monta o index.html de uma peça só (CSS, JS, fonte e imagens embutidos).
uso: python3 src/build.py      (rode dentro da pasta arquimedes/)"""
import base64, os
d = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(d)
txt = lambda f: open(f'{d}/{f}', encoding='utf-8').read().strip()
b64 = lambda f: base64.b64encode(open(f'{root}/assets/{f}', 'rb').read()).decode()
css = txt('style.css').replace('[[FONT]]', b64('sora-latin-wght-normal.woff2'))
body = txt('body.html').replace('[[MARK]]', b64('mark-132.webp')).replace('[[PORTRAIT]]', b64('portrait-560.webp')).replace('[[WA]]', txt('wa-path.txt'))
js = txt('app.js')
ld = '{"@context":"https://schema.org","@type":"ProfessionalService","name":"Arquimedes","description":"Criação de sites, landing pages, aplicativos, sistemas e automações sob medida.","telephone":"+55 69 99248-4874","serviceType":["Criação de sites","Landing pages","Aplicativos","Sistemas sob medida","Automações e integrações"]}'
html = f'''<!doctype html>
<html lang="pt-BR" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Arquimedes — Sites, Apps e Sistemas sob medida</title>
<meta name="description" content="A Arquimedes cria sites, landing pages, aplicativos, sistemas e automações sob medida para o seu negócio vender mais. Peça um orçamento pelo WhatsApp.">
<meta name="theme-color" content="#020202">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="Arquimedes — Sites, Apps e Sistemas sob medida">
<meta property="og:description" content="Tecnologia como alavanca para o seu negócio: sites, landing pages, aplicativos e sistemas.">
<link rel="icon" type="image/png" href="data:image/png;base64,{b64('favicon-64.png')}">
<script>document.documentElement.className='js'</script>
<script type="application/ld+json">{ld}</script>
<style>
{css}
</style>
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
'''
assert '[[' not in html
open(f'{root}/index.html', 'w', encoding='utf-8').write(html); print('index.html', round(len(html.encode()) / 1024), 'KB')
