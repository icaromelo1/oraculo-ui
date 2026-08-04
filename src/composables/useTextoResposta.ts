import type { Fonte } from '@/types/oraculo';

export type ParteTexto =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'codigo'; valor: string }
  | { tipo: 'negrito'; valor: string }
  | { tipo: 'citacao'; fonte: Fonte };

export type BlocoTexto =
  | { tipo: 'paragrafo'; chave: string; partes: ParteTexto[] }
  | { tipo: 'titulo'; chave: string; nivel: 1 | 2 | 3; partes: ParteTexto[] }
  | { tipo: 'lista'; chave: string; ordenada: boolean; itens: ParteTexto[][] }
  | { tipo: 'codigo_bloco'; chave: string; linguagem: string; conteudo: string };

const PADRAO_INLINE = /\[\[F:([^\]]+)\]\]|`([^`]+)`|\*\*([^*]+)\*\*/g;
const PADRAO_LISTA = /^(\s*)([-*]|\d+[.)])\s+(.*)$/;
const PADRAO_TITULO = /^(#{1,3})\s+(.*)$/;
const PADRAO_FENCE = /^```(\w*)\s*$/;

function interpretarLinha(linha: string, fontes: Map<string, Fonte>): ParteTexto[] {
  const partes: ParteTexto[] = [];
  let ultimoIndice = 0;

  for (const casamento of linha.matchAll(PADRAO_INLINE)) {
    const indice = casamento.index ?? 0;

    if (indice > ultimoIndice) {
      partes.push({ tipo: 'texto', valor: linha.slice(ultimoIndice, indice) });
    }

    const [, idCitacao, codigo, negrito] = casamento;

    if (idCitacao !== undefined) {
      const fonte = fontes.get(idCitacao);
      if (fonte) partes.push({ tipo: 'citacao', fonte });
    } else if (codigo !== undefined) {
      partes.push({ tipo: 'codigo', valor: codigo });
    } else if (negrito !== undefined) {
      partes.push({ tipo: 'negrito', valor: negrito });
    }

    ultimoIndice = indice + casamento[0].length;
  }

  if (ultimoIndice < linha.length) {
    partes.push({ tipo: 'texto', valor: linha.slice(ultimoIndice) });
  }

  return partes;
}

export function interpretarTexto(texto: string, fontesLista: Fonte[]): BlocoTexto[] {
  const fontes = new Map(fontesLista.map((fonte) => [fonte.id, fonte]));
  const linhas = texto.split('\n');
  const blocos: BlocoTexto[] = [];

  let paragrafoAtual: string[] = [];
  let listaAtual: { ordenada: boolean; itens: string[] } | null = null;
  let indiceBloco = 0;

  function fecharParagrafo(): void {
    if (paragrafoAtual.length === 0) return;

    const conteudo = paragrafoAtual.join(' ').trim();

    if (conteudo.length > 0) {
      indiceBloco += 1;
      blocos.push({
        tipo: 'paragrafo',
        chave: `p-${indiceBloco}`,
        partes: interpretarLinha(conteudo, fontes),
      });
    }

    paragrafoAtual = [];
  }

  function fecharLista(): void {
    if (!listaAtual) return;

    indiceBloco += 1;
    blocos.push({
      tipo: 'lista',
      chave: `l-${indiceBloco}`,
      ordenada: listaAtual.ordenada,
      itens: listaAtual.itens.map((item) => interpretarLinha(item, fontes)),
    });

    listaAtual = null;
  }

  let indiceLinha = 0;

  while (indiceLinha < linhas.length) {
    const linha = linhas[indiceLinha] ?? '';
    const aberturaFence = PADRAO_FENCE.exec(linha);

    if (aberturaFence) {
      fecharParagrafo();
      fecharLista();

      const linguagem = aberturaFence[1] ?? '';
      const conteudo: string[] = [];
      indiceLinha += 1;

      while (indiceLinha < linhas.length && !PADRAO_FENCE.test(linhas[indiceLinha] ?? '')) {
        conteudo.push(linhas[indiceLinha] ?? '');
        indiceLinha += 1;
      }

      indiceLinha += 1;
      indiceBloco += 1;

      blocos.push({
        tipo: 'codigo_bloco',
        chave: `c-${indiceBloco}`,
        linguagem,
        conteudo: conteudo.join('\n'),
      });

      continue;
    }

    const casamentoTitulo = PADRAO_TITULO.exec(linha);

    if (casamentoTitulo) {
      fecharParagrafo();
      fecharLista();

      const nivel = Math.min(3, Math.max(1, (casamentoTitulo[1] ?? '#').length)) as 1 | 2 | 3;

      indiceBloco += 1;
      blocos.push({
        tipo: 'titulo',
        chave: `t-${indiceBloco}`,
        nivel,
        partes: interpretarLinha(casamentoTitulo[2] ?? '', fontes),
      });

      indiceLinha += 1;
      continue;
    }

    const casamentoLista = PADRAO_LISTA.exec(linha);

    if (casamentoLista) {
      fecharParagrafo();

      const ordenada = /\d/.test(casamentoLista[2] ?? '');

      if (!listaAtual || listaAtual.ordenada !== ordenada) {
        fecharLista();
        listaAtual = { ordenada, itens: [] };
      }

      listaAtual.itens.push(casamentoLista[3] ?? '');
      indiceLinha += 1;
      continue;
    }

    if (linha.trim().length === 0) {
      fecharParagrafo();
      fecharLista();
      indiceLinha += 1;
      continue;
    }

    fecharLista();
    paragrafoAtual.push(linha.trim());
    indiceLinha += 1;
  }

  fecharParagrafo();
  fecharLista();

  return blocos;
}
