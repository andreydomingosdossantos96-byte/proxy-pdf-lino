# Site Domingos Tech

Site de conversão da Domingos Tech — desenvolvimento de aplicativos e sistemas
sob medida. HTML, CSS e JavaScript puros: sem build, sem framework.

## ►► Antes de publicar: preencher o contato

Abra `assets/js/dt.js` e troque os valores de exemplo:

```js
var CONFIG = {
  whatsapp: '5500000000000',            // DDI + DDD + número, só dígitos
  telefone: '(00) 00000-0000',          // como aparece na tela
  email: 'contato@domingostech.com.br',
  paginaObrigado: 'obrigado.html'
};
```

Enquanto o número for o de exemplo, os botões **avisam em vez de abrir uma
conversa quebrada** — assim ninguém clica e cai no vazio. O telefone e o e-mail
da fita, da seção de contato e do rodapé são preenchidos automaticamente a
partir desse mesmo objeto.

Também precisam da sua revisão:

1. **Tecnologias** (`#stack`): a lista atual é a stack comum de projetos móveis.
   Deixe só o que você realmente usa — a seção vale como credibilidade, e vale
   ao contrário se listar algo que você não domina.
2. **Formatos** (`#formatos`): confira os itens de cada um e decida se quer
   exibir faixas de valor no lugar de "sob consulta".
3. **Prazos e garantias** citados nas dúvidas ("3 meses de garantia",
   "entregas a cada duas semanas", "resposta em 24h úteis"): são promessas de
   atendimento — mantenha só o que você cumpre.
4. **Domínio**: `domingostech.com.br` aparece como exemplo no canonical, no
   Open Graph, no `robots.txt` e no `sitemap.xml`.
5. **Portfólio**: não existe seção de trabalhos porque não recebi nenhum. É a
   maior alavanca de conversão que falta — assim que tiver 3 ou 4 projetos com
   print e link, dá para montar.

## Direção visual

Mesmo sistema usado no site da WK Films, com a paleta da sua marca:

- Herói com o símbolo da marca sangrando a tela, sobre azul-noite com brilho ciano
- Tipografia condensada e pesada em caixa alta (Archivo com eixo de largura em 72%)
- Título em duas cores: parte em branco, parte no ciano
- Seções alternando escuro e claro, abrindo com traço e rótulo em monoespaçada
- Listas numeradas com ícone e seta quadrada; geometria sem cantos arredondados
- JetBrains Mono nos rótulos técnicos — fonte de editor de código, coerente com o ramo

### Movimento

Tudo abaixo é desligado por completo quando o visitante tem "reduzir movimento"
ligado no sistema — a página fica estática e legível, sem nada invisível.

| Efeito | Onde |
| --- | --- |
| Sequência de abertura | rótulo, título, texto e botões do herói entram escalonados |
| Parallax | a arte do herói e a foto da faixa deslizam mais devagar que a rolagem |
| Barra de progresso | filete ciano no topo, acompanha a leitura da página |
| Título sob máscara | os títulos de seção sobem de trás de um recorte |
| Entrada em cascata | linhas, cartões, etapas e células entram uma após a outra |
| Filete que se desenha | a régua sob cada linha de serviço cresce da esquerda |
| Terminal | `npm run build` é digitado quando a seção aparece |
| Micro-interações | seta que gira, cartão que clareia, símbolo que brilha no hover |

O parallax e os reveals usam `IntersectionObserver` e `requestAnimationFrame`,
sem biblioteca externa.

### Sobre a foto de código

A imagem em `assets/img/codigo.jpg` tem texto que **não é código de verdade** —
são palavras inventadas que só parecem código de longe. Por isso ela entra
ampliada e desfocada, valendo como textura de fundo atrás do terminal, e nunca
em tamanho legível. Se um dia você quiser um print real de um projeto seu, é só
trocar o arquivo e reduzir o `blur` em `.stack__foto img`.

### A regra do ciano

`#3FDCE4` rende 10,6:1 de contraste sobre o azul-noite e apenas 1,5:1 sobre
fundo claro. Por isso o sistema tem dois valores do mesmo tom:

| Token | Valor | Onde |
| --- | --- | --- |
| `--cian` | `#3FDCE4` | textos e preenchimentos sobre fundo escuro |
| `--cian-tinta` | `#0A6C75` | títulos e rótulos nas seções claras (5,4:1) |
| `--cian-fundo` | `#2CC8D2` | hover dos botões |

Nunca use `--cian` como texto sobre `--claro`.

## Estrutura

```
index.html            Página principal (herói + 8 seções)
obrigado.html         Página de retorno do formulário
assets/css/dt.css     Sistema visual completo
assets/js/dt.js       Contato, menu, formulário, rolagem
assets/img/           Logo recortado, arte do herói, fotos e capa social
preview/              Saída do build (arquivo único para enviar)
robots.txt · sitemap.xml
```

## Rodar localmente

```bash
npx http-server -p 8080 -c-1 .
```

## Publicar

Site estático: sobe em Vercel, Netlify, GitHub Pages ou qualquer hospedagem.
Neste repositório ele vive em `/domingos-tech/`, ao lado do site da WK Films —
para colocar em domínio próprio, publique só o conteúdo desta pasta.

## Arquivo para enviar a um cliente

```bash
python3 ../tools/build-preview.py dt
```

Gera `preview/domingos-tech-preview.html`: a página inteira em um arquivo só,
com CSS, JS e imagens embutidos. Abre com dois toques no celular.
