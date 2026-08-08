import type { NotaGravada } from './conhecimento.service';
import { apiFetch } from './http';

export type StatusDaProposta = 'pendente' | 'aprovada' | 'descartada';

export interface PropostaResumida {
  id: string;
  titulo: string;
  conteudo: string;
  justificativa: string;
  origemCaminho: string | null;
  moduloId: string | null;
  status: StatusDaProposta;
  criadaEm: string;
  decididaEm: string | null;
  decididaPorId: string | null;
  observacaoDaDecisao: string | null;
  notaSlug: string | null;
}

export interface PropostaAprovada {
  proposta: PropostaResumida;
  nota: NotaGravada;
}

export interface DecisaoDeAprovacao {
  titulo?: string;
  conteudo?: string;
  moduloId?: string | null;
  observacao?: string;
}

export function listarPropostas(status?: StatusDaProposta): Promise<PropostaResumida[]> {
  const consulta = status ? `?status=${encodeURIComponent(status)}` : '';

  return apiFetch(`/propostas${consulta}`);
}

export function aprovarProposta(
  id: string,
  decisao: DecisaoDeAprovacao,
): Promise<PropostaAprovada> {
  return apiFetch(`/propostas/${encodeURIComponent(id)}/aprovar`, {
    metodo: 'POST',
    corpo: decisao,
  });
}

export function descartarProposta(id: string, observacao?: string): Promise<PropostaResumida> {
  const limpa = observacao?.trim();

  return apiFetch(`/propostas/${encodeURIComponent(id)}/descartar`, {
    metodo: 'POST',
    corpo: limpa ? { observacao: limpa } : {},
  });
}
