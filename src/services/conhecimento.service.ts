import { apiFetch, cabecalhosAutenticados, ErroApi, tratarNaoAutorizado, urlBase } from './http';

export const TAMANHO_MAXIMO_BYTES = 2 * 1024 * 1024;
export const MAXIMO_DE_ARQUIVOS_POR_LOTE = 20;
const EXTENSOES_ACEITAS: readonly string[] = ['.md', '.txt', '.pdf'];

export interface NotaListada {
  slug: string;
  titulo: string;
  caminho: string;
  bytes: number;
  atualizadaEm: string;
}

export interface NotaGravada {
  id: string | null;
  slug: string;
  caminho: string;
  trechosIndexados: number;
}

export function listarNotas(): Promise<NotaListada[]> {
  return apiFetch('/conhecimento/notas');
}

export function criarNota(titulo: string, conteudo: string): Promise<NotaGravada> {
  return apiFetch('/conhecimento/notas', { metodo: 'POST', corpo: { titulo, conteudo } });
}

export function removerNota(slug: string): Promise<void> {
  return apiFetch(`/conhecimento/notas/${encodeURIComponent(slug)}`, { metodo: 'DELETE' });
}

export type FonteDocumento = 'nota' | 'memoria' | 'agente' | 'doc' | 'config' | 'codigo';

export interface DocumentoIndexado {
  id: string;
  caminho: string;
  caminhoReal: string;
  titulo: string;
  fonte: FonteDocumento;
  autoridade: number;
  atualizadoEm: string;
  trechos: number;
  bytes: number;
  editavel: boolean;
  moduloId?: string | null;
  descricao?: string | null;
}

export interface DocumentoAberto extends DocumentoIndexado {
  conteudo: string | null;
  truncado: boolean;
  aviso: string | null;
}

export interface PaginaDeDocumentos {
  documentos: DocumentoIndexado[];
  total: number;
  pagina: number;
  porPagina: number;
}

export interface PastaIndexada {
  caminho: string;
  caminhoReal: string;
  documentos: number;
}

export interface FiltroDeDocumentos {
  busca?: string;
  fonte?: FonteDocumento;
  autoridade?: number;
  pasta?: string;
  recursivo?: boolean;
  pagina?: number;
  porPagina?: number;
}

function queryDeDocumentos(filtro: FiltroDeDocumentos): string {
  const parametros = new URLSearchParams();

  if (filtro.busca) parametros.set('busca', filtro.busca);
  if (filtro.fonte) parametros.set('fonte', filtro.fonte);
  if (filtro.autoridade) parametros.set('autoridade', String(filtro.autoridade));
  if (filtro.pasta) parametros.set('pasta', filtro.pasta);
  if (filtro.recursivo === false) parametros.set('recursivo', 'false');
  if (filtro.pagina) parametros.set('pagina', String(filtro.pagina));
  if (filtro.porPagina) parametros.set('porPagina', String(filtro.porPagina));

  const texto = parametros.toString();

  return texto ? `?${texto}` : '';
}

export function listarDocumentos(filtro: FiltroDeDocumentos = {}): Promise<PaginaDeDocumentos> {
  return apiFetch(`/conhecimento/documentos${queryDeDocumentos(filtro)}`);
}

export function listarPastas(): Promise<PastaIndexada[]> {
  return apiFetch('/conhecimento/pastas');
}

export function obterDocumento(id: string): Promise<DocumentoAberto> {
  return apiFetch(`/conhecimento/documentos/${encodeURIComponent(id)}`);
}

export function salvarNota(slug: string, conteudo: string): Promise<NotaGravada> {
  return apiFetch(`/conhecimento/notas/${encodeURIComponent(slug)}`, {
    metodo: 'PUT',
    corpo: { conteudo },
  });
}

export function slugDoCaminho(caminho: string): string {
  const nome = caminho.split('/').filter(Boolean).at(-1) ?? '';

  return nome.replace(/\.md$/i, '');
}

function extensaoDe(nome: string): string {
  const ponto = nome.lastIndexOf('.');

  return ponto === -1 ? '' : nome.slice(ponto).toLowerCase();
}

export function recusaDoArquivo(arquivo: File): string | null {
  const extensao = extensaoDe(arquivo.name);

  if (!EXTENSOES_ACEITAS.includes(extensao)) {
    return `"${arquivo.name}" não é aceito — só ${EXTENSOES_ACEITAS.join(', ')}`;
  }

  if (arquivo.size === 0) {
    return `"${arquivo.name}" está vazio`;
  }

  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    return `"${arquivo.name}" passou do teto de 2 MB por arquivo`;
  }

  return null;
}

export interface ItemDoLote {
  arquivo: string;
  aceito: boolean;
  motivo: string | null;
  id: string | null;
  slug: string | null;
  caminho: string | null;
  trechosIndexados: number;
}

export interface LoteEnviado {
  total: number;
  aceitos: number;
  recusados: number;
  itens: ItemDoLote[];
}

export async function enviarArquivos(arquivos: readonly File[]): Promise<LoteEnviado> {
  const dados = new FormData();

  for (const arquivo of arquivos) {
    dados.append('arquivo', arquivo);
  }

  let resposta: Response;

  try {
    resposta = await fetch(`${urlBase()}/conhecimento/arquivos`, {
      method: 'POST',
      headers: cabecalhosAutenticados(false),
      body: dados,
    });
  } catch {
    throw new ErroApi(0, 'falha de rede ao enviar os arquivos');
  }

  if (resposta.status === 401) {
    tratarNaoAutorizado();
    throw new ErroApi(401, 'sessão expirada');
  }

  if (resposta.status === 413) {
    const texto = await resposta.text().catch(() => '');

    throw new ErroApi(413, texto || 'o envio passou do teto de 2 MB por arquivo');
  }

  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => '');
    throw new ErroApi(resposta.status, texto || `erro ${resposta.status} ao enviar os arquivos`);
  }

  return (await resposta.json()) as LoteEnviado;
}

export interface DescricaoDeDocumento {
  id: string;
  descricao: string | null;
}

export function descreverDocumento(id: string, descricao: string): Promise<DescricaoDeDocumento> {
  return apiFetch(`/conhecimento/documentos/${encodeURIComponent(id)}`, {
    metodo: 'PATCH',
    corpo: { descricao },
  });
}

export interface SugestaoDeDescricao {
  sugestao: string | null;
  motivo?: string;
}

export function sugerirDescricao(conteudo: string, titulo?: string): Promise<SugestaoDeDescricao> {
  const escolhido = titulo?.trim();

  return apiFetch('/conhecimento/sugerir-descricao', {
    metodo: 'POST',
    corpo: escolhido ? { conteudo, titulo: escolhido } : { conteudo },
  });
}
