# Arquimedes — site institucional

Site completo da **Arquimedes**, empresa de criação de sites, landing pages, aplicativos, sistemas e automações. Arquivo único (`index.html`), HTML + CSS + JS puro, sem dependências: fonte, logo e ícone estão embutidos. Na prévia da Vercel fica em `/arquimedes/`.

O nome vem do retrato da logo: é o próprio Arquimedes de Siracusa. O site usa isso na história da marca (alavanca, polígono de 96 lados, "Eureka").

## Seções

Início (hero com vídeo) · faixa em movimento · Serviços (6) · Método (4 etapas) · Por que Arquimedes · Em todo projeto + Para quem · Perguntas frequentes · Contato (formulário) · Rodapé. Botão flutuante de WhatsApp.

## O que funciona

- **WhatsApp**: todos os botões abrem `wa.me/5569992484874` com mensagem pronta.
- **Formulário**: valida nome e telefone (máscara `(69) 99999-9999`), monta a mensagem e abre o WhatsApp. Não há servidor; nada é guardado. A tela de sucesso tem um link de reserva caso o navegador bloqueie a janela.
- **"Quero isso"** nos cards escolhe o serviço no formulário e rola até ele.
- Menu hambúrguer no celular, perguntas em acordeão, link ativo no menu conforme a seção, barra de progresso de leitura.
- Eventos para `dataLayer` (`whatsapp_click`, `form_submit`, `service_select`), caso você ligue o Google Tag Manager.

## Animações

Entrada do hero (título que se revela, palavra final que gira), título das seções que se revela palavra por palavra, cartões que aparecem em sequência com ícones que se desenham, brilho que segue o cursor (hero e cards), botões magnéticos, faixa em movimento, linha do método que acende com a rolagem, alavanca que gira com a rolagem, polígono de Arquimedes (6 → 96 lados, com os limites do π ao vivo), gotas do "Eureka", anéis orbitando o retrato, parallax do vídeo, borda giratória no contato, botão de WhatsApp com pulso. Com `prefers-reduced-motion` tudo aparece parado e o vídeo pausa.

## Editar

Os fontes ficam em `src/`; o `index.html` é gerado:

```bash
python3 src/build.py
```

| O quê | Onde |
|---|---|
| Número do WhatsApp | `var WA` no começo de `src/app.js` **e** os textos `data-wa` em `src/body.html` (só a mensagem) |
| Textos, serviços, perguntas | `src/body.html` |
| Cores (marfim sobre preto, medidas na logo) e espaçamentos | topo de `src/style.css` (`:root`) |
| Tom do vídeo | `filter` em `.hero-video` (`src/style.css`); apague para ver as cores originais |
| Imagens e fonte | `assets/` (Sora variável, logo recortada em dois tamanhos, favicon) |

## Vídeo e pôster

URLs remotas (CloudFront), exatamente como enviadas, sem baixar nem hospedar aqui. Se os links saírem do ar, o fundo cai no preto da marca. O ideal é hospedar o vídeo você mesmo.

## Atenção

- Os textos de serviços, método e perguntas foram escritos como rascunho: confira se descrevem como você realmente trabalha (prazos, aprovação, suporte).
- Já existe um software brasileiro chamado "Arquimedes" (orçamento de obras). Consulte o INPI (classes 9, 35 e 42) antes de investir na marca.
- `assets/logo-arquimedes.png` é a logo recortada em 1024 px (a página usa versões menores, embutidas).
