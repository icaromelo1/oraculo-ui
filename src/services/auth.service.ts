import type { StatusCapacidade } from '@/types/oraculo';
import { apiFetch } from './http';

export interface PerfilAutenticado {
  id: string;
  nome: string;
}

export interface UsuarioAutenticado {
  id: string;
  login: string;
  perfil: PerfilAutenticado;
}

export interface SessaoAutenticada {
  token: string;
  usuario: UsuarioAutenticado;
}

export interface CapacidadeConcedida {
  capacidade: string;
  status: StatusCapacidade;
  escopo: Record<string, unknown> | null;
}

export interface EuResposta {
  usuario: UsuarioAutenticado;
  capacidades: CapacidadeConcedida[];
}

export function entrar(login: string, senha: string): Promise<SessaoAutenticada> {
  return apiFetch('/auth/entrar', { metodo: 'POST', corpo: { login, senha } });
}

export function eu(): Promise<EuResposta> {
  return apiFetch('/auth/eu');
}
