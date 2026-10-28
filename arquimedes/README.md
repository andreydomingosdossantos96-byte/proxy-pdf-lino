# Arquimedes — site institucional

Site completo da **Arquimedes**, empresa de criação de sites, landing pages, aplicativos, sistemas e automações. Arquivo único (`index.html`), HTML + CSS + JS puro, sem dependências: fonte, logo e ícone estão embutidos. Na prévia da Vercel fica em `/arquimedes/`.

O nome vem de Arquimedes de Siracusa. A logo principal é a alavanca: um clique (o cursor) aperta a alavanca sobre o ponto de apoio e levanta o globo, o negócio do cliente. A gravura do retrato continua como selo de origem. O site usa essa história na marca (alavanca, polígono de 96 lados, "Eureka").

## Seções

Início (hero com vídeo) · faixa em movimento · Serviços (6) · Método (4 etapas) · Por que Arquimedes · Em todo projeto + Para quem · Perguntas frequentes · Contato (formulário) · Rodapé.

## O que funciona

- **WhatsApp**: todos os botões abrem `wa.me/5569992484874` com mensagem pronta.
- **Formulário**: valida nome e telefone (máscara `(69) 99999-9999`), monta a mensagem e abre o WhatsApp. Não há servidor; nada é guardado. A tela de sucesso tem um link de reserva caso o navegador bloqueie a janela.
- **"Quero isso"** nos cards escolhe o serviço no formulário e rola até ele.
- Menu hambúrguer no celular, perguntas em acordeão, link ativo no menu conforme a seção, barra de progresso de leitura.
- Eventos para `dataLayer` (`whatsapp_click`, `form_submit`, `service_select`), caso você ligue o Google Tag Manager.

## Animações

Entrada do hero (título que se revela, palavra final que gira), título das seções que se revela palavra por palavra, cartões que aparecem em sequência com ícones que se desenham, brilho que segue o cursor (hero e cards), botões magnéticos, faixa em movimento, linha do método que acende com a rolagem, alavanca que gira com a rolagem, polígono de Arquimedes (6 → 96 lados, com os limites do π ao vivo), gotas do "Eureka", luz dourada girando na moldura do retrato, parallax do vídeo e borda giratória no contato. Com `prefers-reduced-motion` tudo aparece parado e o vídeo pausa.

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
| Imagens e fonte | `assets/` (Sora variável, símbolo da alavanca no menu e no rodapé (`simbolo.svg`), favicon, gravura do compasso da seção "Por que Arquimedes") |

## Vídeo e pôster

URLs remotas (CloudFront), exatamente como enviadas, sem baixar nem hospedar aqui. Se os links saírem do ar, o fundo cai no preto da marca. O ideal é hospedar o vídeo você mesmo.

## Atenção

- Os textos de serviços, método e perguntas foram escritos como rascunho: confira se descrevem como você realmente trabalha (prazos, aprovação, suporte).
- Já existe um software brasileiro chamado "Arquimedes" (orçamento de obras). Consulte o INPI (classes 9, 35 e 42) antes de investir na marca.
- `assets/simbolo.svg` é o símbolo da logo principal (alavanca), embutido no menu e no rodapé; `assets/favicon-64.png` é o ícone da aba.
- `assets/logo-arquimedes.png` é a gravura antiga (retrato no medalhão), mantida como selo de origem; a página não usa mais.
