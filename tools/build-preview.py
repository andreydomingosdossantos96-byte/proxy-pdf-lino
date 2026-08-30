#!/usr/bin/env python3
"""
Gera versões auto-contidas do site (CSS, JS e imagens embutidos no HTML).

    python3 tools/build-preview.py

Saídas:
  preview/wk-site-preview.html   arquivo único para enviar ao cliente
  preview/artifact.html          mesma página sem <html>/<head>/<body>,
                                 usada para publicar o link de aprovação
"""
import base64, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def ler(caminho, binario=False):
    with open(os.path.join(RAIZ, caminho), 'rb' if binario else 'r',
              encoding=None if binario else 'utf-8') as f:
        return f.read()

MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml'}

def data_uri(caminho):
    ext = os.path.splitext(caminho)[1].lower()
    b64 = base64.b64encode(ler(caminho, binario=True)).decode('ascii')
    return 'data:%s;base64,%s' % (MIME[ext], b64)

html = ler('index.html')
css  = ler('assets/css/styles.css')
js   = ler('assets/js/main.js')

# sem obrigado.html ao lado, o formulário apenas limpa os campos
js = js.replace("paginaObrigado: 'obrigado.html'", "paginaObrigado: ''")

# CSS e JS embutidos
html = html.replace('<link rel="stylesheet" href="assets/css/styles.css">',
                    '<style>\n' + css + '\n</style>')
html = html.replace('<script src="assets/js/main.js" defer></script>',
                    '<script>\n' + js + '\n</script>')

# imagens viram data URI
for img in ['assets/img/logo-wk.png', 'assets/img/equipe-bastidores.jpg', 'assets/img/favicon.png']:
    html = html.replace('"' + img + '"', '"' + data_uri(img) + '"')

os.makedirs(os.path.join(RAIZ, 'preview'), exist_ok=True)
with open(os.path.join(RAIZ, 'preview/wk-site-preview.html'), 'w', encoding='utf-8') as f:
    f.write(html)

# ---- versão para publicação como link (sem head/body, sem iframe externo) ----
art = html
art = re.sub(r'(?s)^.*?<title>.*?</title>', '<title>WK Films</title>', art)   # nome curto na galeria
art = re.sub(r'(?s)</title>.*?<style>', '</title>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap">\n<style>', art)
art = re.sub(r'(?s)</style>\s*<script type="application/ld\+json">.*?</script>\s*</head>\s*<body>', '</style>', art)
art = art.replace('</body>\n</html>', '').replace('</body>', '').replace('</html>', '')

# o mapa incorporado é bloqueado na publicação: vira cartão com link
art = re.sub(r'(?s)<iframe\s+title="Mapa.*?</iframe>',
             '<a class="mapcard__static" href="https://www.google.com/maps/search/?api=1&query=R.+S%C3%A3o+Luiz,+350+-+Quinto+BEC,+Vilhena+-+RO,+76988-070" target="_blank" rel="noopener">'
             '<span class="mapcard__pin" aria-hidden="true">'
             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
             '<path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg></span>'
             '<strong>R. São Luiz, 350 — Quinto BEC</strong><span>Vilhena – RO, 76988-070</span>'
             '<em>Abrir no Google Maps</em></a>', art)
art = art.replace('</style>', """
.mapcard__static{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.55rem;min-height:380px;text-align:center;padding:2rem;
  background:radial-gradient(ellipse 70% 70% at 50% 40%,rgba(5,215,2,.10),transparent 65%),repeating-linear-gradient(45deg,rgba(255,255,255,.02) 0 12px,transparent 12px 24px),var(--bg-2)}
.mapcard__pin{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;color:var(--verde);background:rgba(5,215,2,.10);border:1px solid rgba(5,215,2,.35);margin-bottom:.3rem}
.mapcard__pin svg{width:28px;height:28px}
.mapcard__static strong{font-family:var(--f-head);font-size:1.02rem}
.mapcard__static span{font-size:.88rem;color:var(--txt-suave)}
.mapcard__static em{font-style:normal;font-size:.85rem;font-weight:650;color:var(--verde);border-bottom:1px solid rgba(5,215,2,.45);padding-bottom:2px;margin-top:.4rem}
</style>""")

with open(os.path.join(RAIZ, 'preview/artifact.html'), 'w', encoding='utf-8') as f:
    f.write(art)

for nome in ['preview/wk-site-preview.html', 'preview/artifact.html']:
    print('%-32s %6.0f KB' % (nome, os.path.getsize(os.path.join(RAIZ, nome)) / 1024))
