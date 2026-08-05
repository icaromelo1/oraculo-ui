import type { PastaIndexada } from '@/services/conhecimento.service';

export interface NoDePasta {
  caminho: string;
  nome: string;
  diretos: number;
  total: number;
  filhos: NoDePasta[];
}

export interface ArvoreDePastas {
  raizes: NoDePasta[];
  porCaminho: Map<string, NoDePasta>;
}

export interface PastaExibida {
  caminho: string;
  rotulo: string;
  total: number;
  subpastas: number;
}

export interface MigalhaDePasta {
  caminho: string;
  rotulo: string;
}

function segmentosDe(caminho: string): string[] {
  return caminho.split('/').filter(Boolean);
}

function ehPassagem(no: NoDePasta): boolean {
  return no.diretos === 0 && no.filhos.length === 1;
}

function ordenar(nos: NoDePasta[]): void {
  nos.sort((um, outro) => um.nome.localeCompare(outro.nome, 'pt-BR'));
  nos.forEach((no) => {
    ordenar(no.filhos);
  });
}

function acumular(no: NoDePasta): number {
  no.total = no.diretos + no.filhos.reduce((soma, filho) => soma + acumular(filho), 0);

  return no.total;
}

export function construirArvore(pastas: PastaIndexada[]): ArvoreDePastas {
  const porCaminho = new Map<string, NoDePasta>();
  const raizes: NoDePasta[] = [];

  function garantir(segmentos: string[]): NoDePasta {
    const caminho = `/${segmentos.join('/')}`;
    const existente = porCaminho.get(caminho);

    if (existente) return existente;

    const no: NoDePasta = {
      caminho,
      nome: segmentos[segmentos.length - 1] ?? '',
      diretos: 0,
      total: 0,
      filhos: [],
    };

    porCaminho.set(caminho, no);

    if (segmentos.length === 1) {
      raizes.push(no);
    } else {
      garantir(segmentos.slice(0, -1)).filhos.push(no);
    }

    return no;
  }

  for (const pasta of pastas) {
    const segmentos = segmentosDe(pasta.caminho);

    if (segmentos.length === 0) continue;

    garantir(segmentos).diretos += pasta.documentos;
  }

  raizes.forEach((raiz) => {
    acumular(raiz);
  });
  ordenar(raizes);

  return { raizes, porCaminho };
}

export function colapsar(no: NoDePasta): PastaExibida {
  const partes = [no.nome];
  let atual = no;

  while (ehPassagem(atual)) {
    const unico = atual.filhos[0];

    if (!unico) break;

    atual = unico;
    partes.push(unico.nome);
  }

  return {
    caminho: atual.caminho,
    rotulo: partes.join('/'),
    total: no.total,
    subpastas: atual.filhos.length,
  };
}

export function migalhasDaPasta(
  caminho: string,
  porCaminho: Map<string, NoDePasta>,
): MigalhaDePasta[] {
  const segmentos = segmentosDe(caminho);
  const migalhas: MigalhaDePasta[] = [];
  let acumulado = '';
  let pendentes: string[] = [];

  segmentos.forEach((segmento, indice) => {
    acumulado += `/${segmento}`;

    const no = porCaminho.get(acumulado);
    const ultimo = indice === segmentos.length - 1;

    if (!ultimo && no !== undefined && ehPassagem(no)) {
      pendentes.push(segmento);
      return;
    }

    const rotulo = [...pendentes, segmento].join('/');

    migalhas.push({
      caminho: acumulado,
      rotulo: migalhas.length === 0 ? `/${rotulo}` : rotulo,
    });
    pendentes = [];
  });

  return migalhas;
}
