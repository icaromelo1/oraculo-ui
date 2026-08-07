import { nomeArquivoFonte, rotuloTipoFonte } from '@/composables/useRotuloFonte';
import type { Fonte } from '@/types/oraculo';

const PADRAO_CITACAO = /\[\[F:([^\]]+)\]\]/g;
const PADRAO_FENCE = /^```(\w*)\s*$/;
const LIMITE_TITULO = 80;
const TITULO_ALTERNATIVO = 'resposta do oráculo';

export interface DadosDaNota {
  pergunta: string;
  textoVisivel: string;
  fontes: Fonte[];
}

function trocarCitacoes(linha: string): string {
  let resultado = '';
  let ultimoIndice = 0;

  for (const casamento of linha.matchAll(PADRAO_CITACAO)) {
    const indice = casamento.index ?? 0;
    resultado += linha.slice(ultimoIndice, indice);
    ultimoIndice = indice + casamento[0].length;
  }

  const RETICENCIAS = '\u0000R\u0000';

  return (resultado + linha.slice(ultimoIndice))
    .replace(/\.\.\./g, RETICENCIAS)
    .replace(/(?:\s*[,;:.]){2,}/g, (trecho) => trecho.trim().slice(-1))
    .replace(new RegExp(RETICENCIAS, 'g'), '...')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([,.;:!?)\]])/g, '$1')
    .trimEnd();
}

export function textoVisivelDaResposta(texto: string): string {
  let dentroDeCodigo = false;

  const linhas = texto.split('\n').map((linha) => {
    if (PADRAO_FENCE.test(linha)) {
      dentroDeCodigo = !dentroDeCodigo;
      return linha;
    }

    return dentroDeCodigo ? linha : trocarCitacoes(linha);
  });

  return linhas.join('\n').trim();
}

function colapsar(valor: string): string {
  return valor.replace(/\s+/g, ' ').trim();
}

function normalizar(valor: string): string {
  return colapsar(valor.replace(/[#*`>]/g, ' '));
}

function truncar(valor: string): string {
  if (valor.length <= LIMITE_TITULO) return valor;

  const corte = valor.slice(0, LIMITE_TITULO);
  const espaco = corte.lastIndexOf(' ');
  const base = espaco > LIMITE_TITULO / 2 ? corte.slice(0, espaco) : corte;

  return `${base.replace(/[\s,;:.-]+$/, '')}…`;
}

function inicioDaResposta(textoVisivel: string): string {
  for (const linha of textoVisivel.split('\n')) {
    if (PADRAO_FENCE.test(linha)) continue;

    const limpa = normalizar(linha.replace(PADRAO_CITACAO, ''));
    if (limpa.length > 0) return limpa;
  }

  return '';
}

export function tituloDaNota(pergunta: string, textoVisivel: string): string {
  const base = normalizar(pergunta) || inicioDaResposta(textoVisivel);

  return base ? truncar(base) : TITULO_ALTERNATIVO;
}

function linhaDeFonte(fonte: Fonte): string {
  const titulo = fonte.titulo.trim() || nomeArquivoFonte(fonte);
  const caminho = fonte.caminho.trim();

  return caminho ? `- ${titulo} — \`${caminho}\`` : `- ${titulo} (${rotuloTipoFonte(fonte.tipo)})`;
}

export function conteudoDaNota(dados: DadosDaNota): string {
  const pergunta = colapsar(dados.pergunta);
  const quando = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  const contexto = [`- salva do chat do oráculo em ${quando}`];
  if (pergunta) contexto.unshift(`- pergunta original: ${pergunta}`);

  const fontes = dados.fontes.length
    ? dados.fontes.map(linhaDeFonte).join('\n')
    : 'nenhuma fonte foi citada nesta resposta.';

  const blocos = [
    dados.textoVisivel.trim(),
    '---',
    '**referência**',
    contexto.join('\n'),
    '**fontes citadas**',
    fontes,
  ];

  return `${blocos.join('\n\n')}\n`;
}
