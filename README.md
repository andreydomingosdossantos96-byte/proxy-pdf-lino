# Taykan Barbearia — Landing Page

Landing page de conversão para a **Taykan Barbearia** (Vilhena — RO, Edifício Capra).
HTML, CSS e JavaScript puros: sem build, sem dependências, sem framework.

```
index.html               a página
assets/styles.css        estilos
assets/main.js           comportamento + CONFIG (WhatsApp, endereço)
assets/logo-taykan*.png  logo em 3 versões (original, branca, escura)
assets/fotos/            onde entram as fotos (veja LEIA-ME.txt)
api/proxy-pdf.js         função serverless que já existia no projeto
```

## 1. O que você PRECISA editar antes de publicar

### a) Número do WhatsApp  ⚠️ obrigatório
Abra `assets/main.js` e troque o número no bloco `CONFIG`:

```js
whatsapp: '5569000000000',   // 55 + DDD + número, só dígitos
```

Esse é o único lugar onde o número aparece. Todos os botões da página
(header, hero, cada serviço, cada barbeiro, rodapé e barra fixa do celular)
são montados a partir dele, já com a mensagem preenchida — ex.: *"Olá! Quero
agendar o combo Corte + Barba (R$ 65)."*

### b) Endereço completo
No mesmo bloco `CONFIG`:

```js
endereco:   'Edifício Capra — Vilhena/RO',            // texto exibido
mapsQuery:  'Taykan Barbearia Edifício Capra Vilhena RO',  // busca do "Como chegar"
```

Coloque rua, número e bairro para o botão “Como chegar” abrir a rota certa.
Ajuste também o endereço no `<iframe>` do mapa e no `JSON-LD` no fim do `index.html`.

### c) Preços, horários e tempos
Conferir e ajustar em `index.html`:
- cards da seção **Serviços** (valores e duração);
- **Horário** na seção “Onde estamos”;
- bloco `application/ld+json` no fim do arquivo (mesmos preços e horários —
  é o que o Google usa para exibir no resultado de busca).

Os valores que estão lá são uma sugestão de partida, não os seus preços reais.

### d) Depoimentos  ⚠️ importante
A seção de depoimentos vem com **textos de exemplo marcados como espaço reservado**.
Troque por comentários reais de clientes (WhatsApp, Google, Instagram), com o
primeiro nome e autorização. Não publique avaliação inventada.

### e) Fotos
Coloque as imagens em `assets/fotos/` com os nomes listados em
`assets/fotos/LEIA-ME.txt`. Enquanto não existirem, a página mostra um espaço
estilizado no lugar — nada quebra.

## 2. Recursos de conversão já embutidos

- **CTA de WhatsApp em todos os pontos de decisão** com mensagem pré-escrita por serviço e por barbeiro (menos atrito = mais agendamento).
- **Barra fixa de agendamento no celular**, que sobe depois que o CTA do topo sai da tela.
- **Botão flutuante do WhatsApp** no desktop.
- **Preços visíveis** — reduz a desistência de quem não quer perguntar “quanto custa?”.
- **Escolha do barbeiro** (João, Kelvin, Gabriel) direto no botão.
- **FAQ** respondendo as objeções que travam o agendamento.
- **Prova social e diferenciais** logo abaixo do topo.
- **SEO local**: título, descrição, Open Graph e dados estruturados `HairSalon`
  com endereço, horários e catálogo de serviços.
- **Acessibilidade**: contraste alto, foco visível, `skip link`, `aria-label`,
  e respeito a `prefers-reduced-motion`.
- **Rápida**: zero JS de terceiros, imagens com `lazy loading`, uma folha de estilo.

## 3. Medir os cliques (opcional)

Cada CTA tem um `data-track` (`cta_hero`, `servico_combo`, `barbeiro_joao`…).
Ao clicar, a página dispara o evento `clique_cta` para o **Google Analytics**
(`gtag`), o **Meta Pixel** (`fbq`) e o `dataLayer` do GTM — o que estiver
instalado. Basta colar o script da ferramenta no `<head>` do `index.html`;
não precisa mexer no `main.js`.

## 4. Publicar

**Ver no computador antes:**

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

**Vercel** (o projeto já está pronto para isso): a página é servida na raiz e a
função em `api/proxy-pdf.js` continua funcionando em `/api/proxy-pdf`. Basta
importar o repositório na Vercel — não há build.

Também funciona em qualquer hospedagem estática (Netlify, GitHub Pages,
Hostinger): é só subir os arquivos.

Depois de publicar, coloque o link na bio do Instagram
[@taykan_barbearia](https://instagram.com/taykan_barbearia) — é de lá que vem
a maior parte do tráfego.
