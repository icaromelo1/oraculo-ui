import type { RegistroAuditoria } from '@/types/oraculo';
import { apiFetch } from './http';

export interface CartaoResumo {
  rotulo: string;
  valor: string;
  tom: 'ok' | 'aviso' | 'erro' | 'neutro';
}

export interface ListaAuditoria {
  registros: RegistroAuditoria[];
  total: number;
  pagina: number;
  porPagina: number;
}

export interface FiltroAuditoria {
  busca?: string;
  pagina?: number;
  porPagina?: number;
}

function montarQuery(filtro: FiltroAuditoria): string {
  const parametros = new URLSearchParams();

  if (filtro.busca) parametros.set('busca', filtro.busca);
  if (filtro.pagina) parametros.set('pagina', String(filtro.pagina));
  if (filtro.porPagina) parametros.set('porPagina', String(filtro.porPagina));

  const texto = parametros.toString();

  return texto ? `?${texto}` : '';
}

export function listarAuditoria(filtro: FiltroAuditoria = {}): Promise<ListaAuditoria> {
  return apiFetch(`/auditoria${montarQuery(filtro)}`);
}

export function resumoAuditoria(): Promise<CartaoResumo[]> {
  return apiFetch('/auditoria/resumo');
}

export function obterAuditoria(id: string): Promise<RegistroAuditoria> {
  return apiFetch(`/auditoria/${id}`);
}
