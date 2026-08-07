export type ParteTexto =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'codigo'; valor: string }
  | { tipo: 'negrito'; valor: string };

export type BlocoTexto =
  | { tipo: 'paragrafo'; chave: string; partes: ParteTexto[] }
  | { tipo: 'titulo'; chave: string; nivel: 1 | 2 | 3; partes: ParteTexto[] }
  | { tipo: 'lista'; chave: string; ordenada: boolean; itens: ParteTexto[][] }
  | { tipo: 'codigo_bloco'; chave: string; linguagem: string; conteudo: string };

const PADRAO_INLINE = /\[\[F:([^\]]+)\]\]|`([^`]+)`|\*\*([^*]+)\*\*/g;
const PADRAO_LISTA = /^(\s*)([-*]|\d+[.)])\s+(.*)$/;
const PADRAO_TITULO = /^(#{1,3})\s+(.*)$/;
const PADRAO_FENCE = /^```(\w*)\s*$/;

function interpretarLinha(linha: string): ParteTexto[] {
  const partes: ParteTexto[] = [];
  let ultimoIndice = 0;

  for (const casamento of linha.matchAll(PADRAO_INLINE)) {
    const indice = casamento.index ?? 0;

    if (indice > ultimoIndice) {
      partes.push({ tipo: 'texto', valor: linha.slice(ultimoIndice, indice) });
    }

    const [, idCitacao, codigo, negrito] = casamento;

    if (idCitacao === undefined && codigo !== undefined) {
      partes.push({ tipo: 'codigo', valor: codigo });
    } else if (idCitacao === undefined && negrito !== undefined) {
      partes.push({ tipo: 'negrito', valor: negrito });
    }

    ultimoIndice = indice + casamento[0].length;
  }

  if (ultimoIndice < linha.length) {
    partes.push({ tipo: 'texto', valor: linha.slice(ultimoIndice) });
  }

  return ajustarEspacos(partes);
}

const RETICENCIAS = '\u0000R\u0000';

function normalizarTexto(bruto: string): string {
  return bruto
    .replace(/\.\.\./g, RETICENCIAS)
    .replace(/(?:\s*[,;:.]){2,}/g, (trecho) => trecho.trim().slice(-1))
    .replace(new RegExp(RETICENCIAS, 'g'), '...')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([,.;:!?)\]])/g, '$1');
}

function ajustarEspacos(partes: ParteTexto[]): ParteTexto[] {
  const juntas: ParteTexto[] = [];

  for (const parte of partes) {
    const anterior = juntas[juntas.length - 1];

    if (parte.tipo === 'texto' && anterior && anterior.tipo === 'texto') {
      juntas[juntas.length - 1] = {
        tipo: 'texto',
        valor: anterior.valor + parte.valor,
      };

      continue;
    }

    juntas.push(parte);
  }

  const limpas = juntas.map((parte) =>
    parte.tipo === 'texto' ? { ...parte, valor: normalizarTexto(parte.valor) } : parte,
  );

  const primeira = limpas[0];

  if (primeira && primeira.tipo === 'texto') {
    limpas[0] = { ...primeira, valor: primeira.valor.replace(/^ +/, '') };
  }

  const ultima = limpas[limpas.length - 1];

  if (ultima && ultima.tipo === 'texto') {
    limpas[limpas.length - 1] = {
      ...ultima,
      valor: ultima.valor.replace(/ +$/, ''),
    };
  }

  return limpas.filter((parte) => parte.tipo !== 'texto' || parte.valor.length > 0);
}

export function interpretarTexto(texto: string): BlocoTexto[] {
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
        partes: interpretarLinha(conteudo),
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
      itens: listaAtual.itens.map((item) => interpretarLinha(item)),
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
        partes: interpretarLinha(casamentoTitulo[2] ?? ''),
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
