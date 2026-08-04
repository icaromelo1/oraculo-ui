import type { Cobertura, Fonte } from '@/types/oraculo';
import { apiFetch } from './http';

export interface ResumoConversaApi {
  id: string;
  titulo: string;
  hora: string;
  fontes: number;
  ferramentas: number;
  aprovacoes: number;
  bloqueios: number;
}

export interface FerramentaDaMensagemApi {
  id: string;
  nome: string;
  status: string;
  argumento: Record<string, unknown> | null;
  metrica: Record<string, unknown> | null;
  duracaoMs: number | null;
  aprovadaPor: string | null;
  resultado: Record<string, unknown> | null;
}

export interface MensagemDaConversaApi {
  id: string;
  papel: string;
  texto: string;
  ordem: number;
  criadaEm: string;
  tokens: number | null;
  duracaoMs: number | null;
  cobertura: Cobertura | null;
  fontes: Fonte[];
  ferramentas: FerramentaDaMensagemApi[];
}

export interface ConversaCompletaApi {
  id: string;
  titulo: string;
  criadaEm: string;
  atualizadaEm: string;
  mensagens: MensagemDaConversaApi[];
}

export function listarConversas(): Promise<ResumoConversaApi[]> {
  return apiFetch('/conversas');
}

export function obterConversa(id: string): Promise<ConversaCompletaApi> {
  return apiFetch(`/conversas/${id}`);
}
