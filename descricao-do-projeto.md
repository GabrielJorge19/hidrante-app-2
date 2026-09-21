# Descrição do projeto para a IA gerar a página web

> Este documento descreve o projeto **Hidrante App** com detalhe suficiente para que uma IA possa criar uma página web (landing page / página de portfólio) fiel ao produto. Use este arquivo **junto com o `README.md`** da raiz do repositório, que contém as informações técnicas e a estrutura exata do projeto.

---

## 1. Objetivo desta página

Crie uma página web profissional de apresentação do produto, que sirva **ao mesmo tempo** como:

- Página de divulgação do aplicativo ("conheça o Hidrante App");
- Vitrine de portfólio do desenvolvedor.

A página deve comunicar com clareza **qual problema o aplicativo resolve** e **como ele é feito por dentro**, sem inventar funcionalidades. Deve parecer a página oficial de um produto real.

## 2. Sobre o produto (fatos, não invente nada além disso)

- **Nome:** Hidrante App.
- **O que é:** um aplicativo web (PWA — Progressive Web App) de apoio às equipes de manutenção que trabalham com **hidrantes urbanos na cidade de São Paulo**.
- **Problema que resolve:** quem executa reparos e vistorias de hidrantes precisa saber exatamente onde cada equipamento está e conseguir chegar até ele. O app encurta esse caminho: o colaborador busca o hidrante pelo número de identificação, vê a localização no mapa, consulta os dados cadastrais e inicia a navegação até o local pelo Google Maps — incluindo **sem conexão com a internet**.
- **Base de dados:** cerca de **5.500 hidrantes** espalhados por São Paulo.
- **Público-alvo:** equipes técnicas de campo (manutenção, vistorias e atendimento de hidrantes) fora de escritório.

### O que o aplicativo faz (funcionalidades reais)

- **Busca de hidrantes por identificação** — o colaborador digita o número e o app sugere até 6 resultados conforme digita.
- **Mapa dos hidrantes** — todos os hidrantes são exibidos em um mapa; em zoom aproximado eles se agrupam em "clusters" (conjuntos numerados) para não poluir a tela; em zoom alto, cada hidrante mostra uma **etiqueta com o seu número** acima do ícone.
- **Ficha do hidrante** — ao tocar em um hidrante, o mapa centraliza automaticamente nele e uma folha inferior (bottom sheet) mostra os dados cadastrais: tipo, endereço, bairro, distrito, subprefeitura, região, status.
- **Navegação pelo Google Maps** — botão **"Ir para"** que abre o Google Maps traçando a rota até a coordenada do hidrante.
- **Marcadores de campo** — o colaborador pode criar marcadores no mapa (por exemplo: ponto de apoio, obra, hidrante reservado, em manutenção, ponto de risco ou tipo personalizado com cor própria), com nome e observações, e depois editar ou excluir. Os marcadores são criados **a partir da ficha de um hidrante** (ancorados na posição dele) — não é possível criar um marcador em qualquer lugar do mapa.
- **Funciona offline** — o app é instalável (PWA), os dados ficam salvos no dispositivo e o mapa base é cacheado; dá para buscar e consultar sem internet.
- **Sincronização da base** — na primeira abertura o app baixa a base completa do hidrante; depois, atualiza apenas o que mudou (sincronização incremental). Há sincronização automática e um botão manual "Atualizar agora".
- **Indicador de status** — o menu mostra se o app está sincronizado, sincronizando ou offline, e o horário da última sincronização.

## 3. Tom e linguagem

- **Português do Brasil.**
- Tom profissional e objetivo, **sem exagero de marketing** e **sem jargões desnecessários** para a audiência não técnica (mas com detalhes técnicos quando a seção é destinada a desenvolvedores).
- Sem emojis em excesso.
- Dê sensação de confiabilidade: é uma ferramenta para trabalho real em campo, então transmita seriedade e utilidade prática.

## 4. Sugestões visuais (baseadas no produto real)

- **Paleta:** o aplicativo usa verde como cor principal — `#2e7d32` (verde do "pin" do hidrante, dos botões e do tema do PWA). Use verdes (idealmente derivados de `#2e7d32`, com variações como `#1b5e20` e `#43a047`) como cor de destaque, com fundo claro e tipografia limpa.
- **Elemento visual identitário recomendado:** o ícone de "pin" (alfinete/gomark) usado no mapa, que representa um hidrante — pode ser usado como símbolo/logo da página.
- **Mockups:** se for mencionar o mapa, descreva-o como um mapa de ruas de São Paulo com marcadores verdes.
- **Layout sugerido:** uma página longa (single page) com seções bem definidas, hero na abertura, e responsiva para celular e desktop (o público real usa o app no celular em campo).

## 5. Seções sugeridas para a página

Estrutura recomendada (adapte com bom senso):

1. **Hero** — Nome do produto, frase curta do que ele faz ("Localize hidrantes, chegue até eles e trabalhe em campo com confiança — mesmo offline"), e um call-to-action (ex.: "Conheça o aplicativo" / "Como funciona").
2. **Problema / Contexto** — Explicar o dia a dia das equipes de manutenção de hidrantes em São Paulo e por que localizar e navegar até o equipamento é essencial.
3. **Solução / Funcionalidades** — Apresentar cada funcionalidade real (busca por identificação, mapa com clusters e etiquetas, ficha do hidrante, navegação pelo Google Maps, marcadores de campo, funcionamento offline e sincronização). Layout de cards ou alternância de blocos com títulos + 1-2 frases cada.
4. **Tecnologias** — Seção técnica (pode ser em blocos/ícones): React, TypeScript, Vite, PWA, Leaflet + leaflet.markercluster, CARTO basemaps, Supabase, IndexedDB/Dexie, GitHub Actions + GitHub Pages.
5. **Arquitetura (breve)** — Explicar de forma simples: o **Supabase** é a fonte oficial dos dados; o **IndexedDB (Dexie)** guarda os dados no dispositivo para funcionar offline; o **mapa (Leaflet)** usa tiles da **CARTO** com cache offline; a sincronização é incremental por data de atualização, com recarga completa quando necessário. Um diagrama simples de fluxo pode ajudar (ex.: Servidor → IndexedDB → Interface).
6. **Para quem é** — Equipes de manutenção em campo.
7. **Roadmap / Próximos passos** — Deixar claro o que **já é real** e o que é **futuro/planejado** (ver seção 7 abaixo).
8. **Rodapé** — Autor (GabrielJorge19) e link para o repositório no GitHub.

## 6. Informações para a seção de tecnologias (funcionamento técnico real)

- **Frontend:** React 19 + TypeScript, empacotado com Vite 8.
- **Mapa:** Leaflet com a extensão leaflet.markercluster (agrupamento em clusters). Base cartográfica do **CARTO** (estilo Positron — sem ícones de comércio). Tiles cacheados para uso offline.
- **Dados remotos:** Supabase (Postgres/PostgREST), acesso somente leitura (RLS com permissão de SELECT para a role anônima), ~5.500 registros na tabela `hidrantes`.
- **Dados locais:** IndexedDB gerenciado pelo Dexie (tabelas: `hidrantes`, `markers`, `meta`).
- **Sincronização:** busca em lotes de 1.000 registros; modo incremental por `updated_at`; recarga completa automática quando a contagem local difere da remota (ex.: primeira instalação); re-sincroniza ao reabrir o app, a cada 60s, ao reconectar e pelo botão "Atualizar agora".
- **PWA:** instalável, atualização automática do service worker, aviso de "nova versão disponível", cache de app e de tiles.
- **Deploy:** GitHub Actions publica o app no GitHub Pages a cada push na branch `main`.
- **Integração externa:** navegação via link do Google Maps ("Ir para") com a coordenada como destino.

## 7. Roadmap — separar implementado de planejado

**IMPORTANTE: só o que está no roadmap abaixo; não invente nada além.**

- **Implementado:** busca por identificação; mapa com clusters e etiquetas; ficha detalhada do hidrante; navegação pelo Google Maps; marcadores de campo (criar/editar/excluir); uso offline; sincronização incremental e manual; status de sincronização.
- **Planejado (futuro):** integração com o **sistema de manutenção**, para que os colaboradores vejam no app quais manutenções/ordens de serviço precisam executar; navegação direta a partir das atividades (de uma ordem de serviço para o hidrante correspondente); expansão das funcionalidades de campo.

Nunca apresente os itens planejados como se já existissem — marque-os claramente como "em desenvolvimento / futuros".

## 8. Sobre o autor

- **Autor/desenvolvedor:** GabrielJorge19.
- Perfil no GitHub: `https://github.com/GabrielJorge19`.
- O projeto é um **aplicativo de portfólio/desenvolvimento próprio**, sem licença definida até o momento.

## 9. Restrições gerais para a IA que for gerar a página

- **Não inventar** funcionalidades, integrações, números ou estatísticas que não estejam neste documento ou no README.md.
- Não colocar chaves, tokens, senhas ou credenciais em lugar nenhum da página.
- Não usar a API do Google Maps (não existe chave de Maps no projeto — a integração é apenas um link para o aplicativo/Google Maps do usuário).
- Se quiser citar o número de hidrantes, use "cerca de 5.500 hidrantes".
- Preferir markdown/HTML+CSS simples ou qualquer stack de landing page, mantendo o foco em clareza e boa apresentação.