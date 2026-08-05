import { irParaLogin } from './navegacao';
import { EVENTO_SESSAO_EXPIRADA, limparToken, obterToken } from './token';

const BASE_URL: string = import.meta.env.VITE_API_URL ?? '/oraculo-api';

export class ErroApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

export function urlBase(): string {
  return BASE_URL;
}

export function cabecalhosAutenticados(comCorpo: boolean): HeadersInit {
  const cabecalho: Record<string, string> = {};
  const token = obterToken();

  if (token) cabecalho.Authorization = `Bearer ${token}`;
  if (comCorpo) cabecalho['Content-Type'] = 'application/json';

  return cabecalho;
}

interface CorpoDeErro {
  message?: unknown;
}

function textoLegivel(bruto: string): string | null {
  const texto = bruto.trim();

  if (!texto) return null;
  if (!texto.startsWith('{')) return texto;

  try {
    const corpo = JSON.parse(texto) as CorpoDeErro;

    if (typeof corpo.message === 'string' && corpo.message.trim()) return corpo.message;

    if (Array.isArray(corpo.message)) {
      const linhas = corpo.message.filter((item): item is string => typeof item === 'string');
      if (linhas.length > 0) return linhas.join(' · ');
    }

    return texto;
  } catch {
    return texto;
  }
}

export function mensagemDoErro(falha: unknown, alternativa: string): string {
  if (falha instanceof ErroApi) {
    return textoLegivel(falha.message) ?? alternativa;
  }

  if (falha instanceof Error && falha.message) {
    return falha.message;
  }

  return alternativa;
}

export function tratarNaoAutorizado(): void {
  limparToken();
  window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
  irParaLogin();
}

interface OpcoesApi {
  metodo?: string;
  corpo?: unknown;
  signal?: AbortSignal;
}

export async function apiFetch<T>(caminho: string, opcoes: OpcoesApi = {}): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: opcoes.metodo ?? 'GET',
      headers: cabecalhosAutenticados(opcoes.corpo !== undefined),
      ...(opcoes.corpo !== undefined ? { body: JSON.stringify(opcoes.corpo) } : {}),
      ...(opcoes.signal ? { signal: opcoes.signal } : {}),
    });
  } catch (falha) {
    if (falha instanceof DOMException && falha.name === 'AbortError') throw falha;
    throw new ErroApi(0, 'falha de rede ao falar com a api do oráculo');
  }

  if (resposta.status === 401) {
    tratarNaoAutorizado();
    throw new ErroApi(401, 'sessão expirada');
  }

  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => '');
    throw new ErroApi(resposta.status, texto || `erro ${resposta.status} na api do oráculo`);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  return (await resposta.json()) as T;
}
