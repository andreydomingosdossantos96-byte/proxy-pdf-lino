#!/usr/bin/env python3
"""
Gera versões auto-contidas de um site (CSS, JS e imagens embutidos no HTML).

    python3 tools/build-preview.py            # WK Films (raiz do repositório)
    python3 tools/build-preview.py dt         # Domingos Tech

Saídas (dentro da pasta do site):
  preview/<site>-preview.html   arquivo único para enviar ao cliente
  preview/artifact.html         mesma página sem <html>/<head>/<body>,
                                usada para publicar o link de aprovação
"""
import base64, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SITES = {
    'wk': {
        'base': '',
        'css': 'assets/css/wk.css',
        'js': 'assets/js/wk.js',
        'saida': 'preview/wk-site-preview.html',
        'artefato': 'preview/artifact.html',
        'titulo': 'WK Films',
        'fontes': 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Courier+Prime:wght@400;700&display=swap',
        'imagens': ['assets/img/logo-wk.png', 'assets/img/equipe-bastidores.jpg',
                    'assets/img/equipe-wk.jpg', 'assets/img/poster-making-of.jpg',
                    'assets/img/poster-agro.jpg', 'assets/img/poster-institucional.jpg',
                    'assets/img/favicon.png'],
        'troca_video': True,
        'aviso': ('Toque no play — o vídeo só baixa nessa hora.',
                  'Nesta prévia aparecem só as capas: no site publicado eles tocam com som.'),
    },
    'dt': {
        'base': 'domingos-tech',
        'css': 'assets/css/dt.css',
        'js': 'assets/js/dt.js',
        'saida': 'preview/domingos-tech-preview.html',
        'artefato': 'preview/artifact.html',
        'titulo': 'Domingos Tech',
        'fontes': 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap',
        'imagens': ['assets/img/logo-dt.png', 'assets/img/favicon.png'],
        'troca_video': False,
        'aviso': None,
    },
}

chave = (sys.argv[1] if len(sys.argv) > 1 else 'wk').lower()
if chave not in SITES:
    sys.exit('Site desconhecido: %s (use %s)' % (chave, ' ou '.join(SITES)))
S = SITES[chave]
DIR = os.path.join(RAIZ, S['base'])

MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml'}

def ler(caminho, binario=False):
    modo = 'rb' if binario else 'r'
    with open(os.path.join(DIR, caminho), modo, encoding=None if binario else 'utf-8') as f:
        return f.read()

def data_uri(caminho):
    ext = os.path.splitext(caminho)[1].lower()
    return 'data:%s;base64,%s' % (MIME[ext], base64.b64encode(ler(caminho, True)).decode('ascii'))

html = ler('index.html')
css  = ler(S['css'])
js   = ler(S['js'])

# sem obrigado.html ao lado, o formulário apenas limpa os campos
js = js.replace("paginaObrigado: 'obrigado.html'", "paginaObrigado: ''")

html = html.replace('<link rel="stylesheet" href="%s">' % S['css'], '<style>\n' + css + '\n</style>')
html = html.replace('<script src="%s" defer></script>' % S['js'], '<script>\n' + js + '\n</script>')

# os vídeos não viajam no arquivo único: viram pôster com aviso
if S['troca_video']:
    def poster_no_lugar_do_video(m):
        poster = re.search(r'poster="([^"]+)"', m.group(0)).group(1)
        return ('<img class="quadro__capa" src="%s" alt="" loading="lazy">'
                '<span class="quadro__aviso">Vídeo completo no site publicado</span>') % data_uri(poster)
    html = re.sub(r'(?s)<video .*?</video>\s*<button class="quadro__bt".*?</button>',
                  poster_no_lugar_do_video, html)
    html = html.replace('</style>', """
.quadro__capa{width:100%;height:100%;object-fit:cover;display:block}
.quadro__aviso{position:absolute;left:0;bottom:0;background:var(--verde);color:var(--carvao);
  font-size:.66rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.4rem .75rem}
</style>""")
if S['aviso']:
    html = html.replace(S['aviso'][0], S['aviso'][1])

for img in S['imagens']:
    html = html.replace('"' + img + '"', '"' + data_uri(img) + '"')

os.makedirs(os.path.join(DIR, 'preview'), exist_ok=True)
with open(os.path.join(DIR, S['saida']), 'w', encoding='utf-8') as f:
    f.write(html)

# ---- versão para publicação como link (sem as tags de documento) ----
art = re.sub(r'(?s)^.*?<title>.*?</title>', '<title>%s</title>' % S['titulo'], html)
art = re.sub(r'(?s)</title>.*?<style>',
             '</title>\n<link rel="stylesheet" href="%s">\n<style>' % S['fontes'], art)
art = re.sub(r'(?s)</style>\s*<script type="application/ld\+json">.*?</script>\s*</head>\s*<body>', '</style>', art)
art = art.replace('</body>\n</html>', '').replace('</body>', '').replace('</html>', '')

with open(os.path.join(DIR, S['artefato']), 'w', encoding='utf-8') as f:
    f.write(art)

for nome in (S['saida'], S['artefato']):
    caminho = os.path.join(DIR, nome)
    print('%-42s %6.0f KB' % (os.path.join(S['base'], nome), os.path.getsize(caminho) / 1024))
