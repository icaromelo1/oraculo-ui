import { apiFetch } from './http';

export interface EstadoSaude {
  status: string;
  ambiente: string;
  provedor: string;
  recuperacao: string;
  capacidades: Record<string, boolean>;
}

export function obterSaude(): Promise<EstadoSaude> {
  return apiFetch('/saude');
}
