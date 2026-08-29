# EXECUTA Marcenaria — Landing page

Página de captação de clientes (alta conversão) para a **EXECUTA Marcenaria**, de Vilhena/RO.
É um site estático de arquivo único: `index.html` + a pasta `assets/`. Não precisa de build,
banco de dados nem servidor — pode ser publicado na Vercel (junto com a função existente em
`api/`), Netlify, GitHub Pages ou qualquer hospedagem comum.

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Página inteira: HTML, CSS e JavaScript embutidos |
| `assets/simbolo.png`, `assets/wordmark.png`, `assets/logo.png` | Marca (símbolo, logotipo horizontal e versão empilhada) |
| `assets/*.jpg` | Fotos de projetos, da loja e da produção |
| `api/proxy-pdf.js` | Função já existente no repositório (não faz parte da landing page) |

## Seções da página

1. Barra de aviso + cabeçalho fixo com CTA de WhatsApp
2. Hero com proposta de valor, provas rápidas (4,8 no Google, fábrica própria, CNC, Instagram) e dois CTAs
3. Faixa de destaques
4. Ambientes atendidos (6 cards, cada um com CTA de WhatsApp com mensagem própria)
5. Galeria de projetos com ampliação da foto ao clicar
6. Diferenciais (fábrica própria, projeto 3D, medição, CNC, equipe própria, loja física)
7. Como funciona, em 4 passos
8. Prova social (nota do Google e Instagram)
9. Formulário de orçamento que monta a mensagem e abre o WhatsApp já preenchido
10. Perguntas frequentes (com dados estruturados de FAQ para o Google)
11. Endereço, horários e mapa
12. Chamada final, rodapé, botão flutuante de WhatsApp e barra fixa de CTA no celular

## Como alterar as informações

Tudo está em `index.html`:

- **Número de WhatsApp:** constante `FONE` no script, no fim do arquivo (formato `55` + DDD + número).
  Troque também os links `tel:+5569993006667` e o telefone exibido no texto.
- **Endereço, horários e redes:** seção `#contato` e o bloco `application/ld+json` (dados
  estruturados para o Google) no fim do arquivo.
- **Textos e perguntas frequentes:** direto no HTML da seção correspondente. Ao mudar uma
  pergunta, atualize também o bloco `FAQPage` do JSON-LD.
- **Fotos:** substitua os arquivos em `assets/` mantendo os nomes, ou aponte novos nomes nas
  tags `<img>` (mantenha `width`/`height` iguais aos da imagem para não deslocar o layout).

## Medição de resultados

Todos os cliques em WhatsApp, envios do formulário e cliques em Instagram/Google disparam
eventos (`clique_whatsapp`, `orcamento_enviado`, etc.) no `dataLayer`, no `gtag` e no `fbq`,
quando existirem. Basta colar a tag do Google Analytics/Ads ou do Meta Pixel no `<head>` que
os eventos passam a ser registrados, sem nenhuma outra alteração.

## Observações sobre os dados usados

Nota do Google (4,8), número de avaliações, seguidores do Instagram, endereço, telefone e
horários vieram das informações públicas do perfil da empresa. Não foram inventados
depoimentos, prazos fixos, anos de mercado nem quantidade de obras entregues — se quiser
incluir esses números, é só informar os valores reais.
