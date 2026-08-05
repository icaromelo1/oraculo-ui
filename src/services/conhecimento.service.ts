import { apiFetch, cabecalhosAutenticados, ErroApi, tratarNaoAutorizado, urlBase } from './http';

export const TAMANHO_MAXIMO_BYTES = 2 * 1024 * 1024;
export const EXTENSOES_ACEITAS: readonly string[] = ['.md', '.txt'];

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

function extensaoDe(nome: string): string {
  const ponto = nome.lastIndexOf('.');

  return ponto === -1 ? '' : nome.slice(ponto).toLowerCase();
}

export function recusaDoArquivo(arquivo: File): string | null {
  const extensao = extensaoDe(arquivo.name);

  if (extensao === '.pdf' || arquivo.type === 'application/pdf') {
    return `PDF não é suportado pelo Oráculo — converta "${arquivo.name}" para .md ou .txt, ou cole o texto como nota`;
  }

  if (!EXTENSOES_ACEITAS.includes(extensao)) {
    return `"${arquivo.name}" não é aceito — só ${EXTENSOES_ACEITAS.join(' e ')}`;
  }

  if (arquivo.size === 0) {
    return `"${arquivo.name}" está vazio`;
  }

  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    return `"${arquivo.name}" passou do teto de 2 MB por arquivo`;
  }

  return null;
}

export async function enviarArquivo(arquivo: File): Promise<NotaGravada> {
  const dados = new FormData();
  dados.append('arquivo', arquivo);

  let resposta: Response;

  try {
    resposta = await fetch(`${urlBase()}/conhecimento/arquivos`, {
      method: 'POST',
      headers: cabecalhosAutenticados(false),
      body: dados,
    });
  } catch {
    throw new ErroApi(0, 'falha de rede ao enviar o arquivo');
  }

  if (resposta.status === 401) {
    tratarNaoAutorizado();
    throw new ErroApi(401, 'sessão expirada');
  }

  if (resposta.status === 413) {
    throw new ErroApi(413, `"${arquivo.name}" passou do teto de 2 MB por arquivo`);
  }

  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => '');
    throw new ErroApi(resposta.status, texto || `erro ${resposta.status} ao enviar o arquivo`);
  }

  return (await resposta.json()) as NotaGravada;
}
