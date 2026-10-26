# Domingos Tech — site institucional

Página de uma tela (sem scroll) da **Domingos Tech**, empresa de criação de sites, páginas, aplicativos e soluções tecnológicas. Arquivo único, HTML + CSS + JS puro, sem build e sem dependências. A fonte (Sora variável) e a logo do cabeçalho estão embutidas no próprio `index.html`.

Na prévia da Vercel fica em `/domingostech/`.

## Design

Segue o design system enviado pelo cliente:

- **Escala por unidade única** (`--u`): no desktop (>= 1200px) a composição de 1536x1024 é travada e só escala; abaixo disso vira fluxo em coluna, com o menu atrás do hambúrguer (checkbox + CSS, sem JS).
- **Fundo**: vídeo em loop + véu de legibilidade; no celular o véu é reapontado para o texto.
- **CTA de vidro** com borda em gradiente (pseudo-elemento com máscara), entrada animada de ~2,1s e `prefers-reduced-motion` respeitado (inclusive pausando o vídeo).
- **Cores medidas na logo**: preto `#020202` e marfim `#F8ECDE` (tokens no topo do `<style>`). O vídeo original é dourado/azul, então recebe `filter: grayscale(1) sepia(.38)` na classe `.art` para ficar no mesmo tom da marca. Para ver as cores originais do vídeo, apague essa linha.

Diferenças em relação à spec original (que tinha o texto de outra marca):

- Marca no cabeçalho: medalhão da logo (WebP embutido) + `DOMINGOS TECH`.
- Textos em português; as posições à esquerda (menu, itens inferiores, CTA) foram recalculadas para o novo tamanho dos textos.
- Fonte: Sora variável, subconjunto latino embutido em base64 (eixo de peso 100–800).
- Correção: no desktop o `main.hero` cobria a barra e bloqueava os cliques de "Falar no WhatsApp" e "Fale conosco"; agora só o CTA recebe clique no hero.
- O espaçamento negativo dos itens inferiores foi relaxado (os valores originais eram do texto em inglês).

## Falta preencher

O botão **Pedir orçamento**, o **Falar no WhatsApp** e o **Fale conosco** estão com `href="#"` até você informar o contato. No fim do `index.html`, no último `<script>`, preencha:

```js
var WA='5569XXXXXXXXX', MAIL='';   // WhatsApp só com dígitos (55 + DDD) e/ou e-mail
```

Com o WhatsApp preenchido, os três botões abrem a conversa com a mensagem pronta; só com e-mail, abrem o e-mail.

Os links **Sobre**, **Serviços** e **Soluções** ainda não apontam para nada: a spec define uma tela única sem scroll.

## Vídeo e pôster

Usa as URLs remotas da spec, exatamente como enviadas (CloudFront), sem baixar nem hospedar aqui. Se um dia os links saírem do ar, o fundo cai no preto da marca.

## Arquivos

```
index.html                       página completa (CSS, JS, fonte e logo do cabeçalho embutidos)
assets/logo-domingos-tech.png    logo recortada em 1024x1024 (para uso futuro; a página não carrega este arquivo)
```
