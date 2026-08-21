# oraculo-ui

Front do Oráculo — assistente conversacional sobre a infraestrutura de desenvolvimento.

O front é apenas um cliente da API: fala com o [oraculo-api](https://github.com/icaroMelo1/oraculo-api)
por HTTP + SSE. Qualquer outro cliente (widget embutido em outro produto, CLI) usa a mesma
interface, sem tocar no backend.

## Stack

- Node.js 24 LTS (Krypton)
- Vue 3 + Quasar 2 (Vite), TypeScript, Pinia, SCSS

## O que a interface precisa comunicar

Três coisas separam este chat de um chatbot genérico, e o design gira em torno delas:

- **Procedência** — toda afirmação cita a origem (documento, arquivo e linha, registro de
  banco, nota de especialista), com o trecho exato a um clique.
- **Transparência de ação** — cada ferramenta executada aparece na conversa: o que rodou,
  com quais argumentos, quanto demorou.
- **Limites visíveis** — capacidade disponível, desligada nesta instalação, ou negada para
  o seu perfil são três estados distintos; ação sensível pede aprovação mostrando o comando
  literal antes de executar.

## Rodando

```bash
nvm use            # Node 24 (.nvmrc)
npm install
npm run dev
```

## Deploy na VM

O front é servido em `icaromelodev.com.br/oraculo/`, **não na raiz**. O build precisa do
caminho público, senão o `index.html` pede `/assets/...`, toma 404 e a tela fica branca:

```bash
PUBLIC_PATH=/oraculo/ npm run build
cd dist/spa && tar czf - . | ssh oracle-vm 'tar -C ~/projects/oraculo/site -xzf -'
```

Conferir o deploy pelos **assets**, não só pelo HTML — 200 no `index.html` não prova nada:

```bash
curl -su icaro:SENHA https://icaromelodev.com.br/oraculo/ | grep -o '/oraculo/assets/[^"]*'
```
