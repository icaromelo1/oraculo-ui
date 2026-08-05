import type { Fonte, TipoFonte } from '@/types/oraculo';

const ROTULOS_TIPO: Record<TipoFonte, string> = {
  curado: 'sua nota',
  doc: 'documentação',
  codigo: 'config',
  banco: 'banco',
  inferencia: 'inferência',
};

const TONS_TIPO: Record<TipoFonte, 'amber' | 'slate' | 'neutro'> = {
  curado: 'amber',
  doc: 'slate',
  codigo: 'slate',
  banco: 'slate',
  inferencia: 'neutro',
};

export function rotuloTipoFonte(tipo: TipoFonte): string {
  return ROTULOS_TIPO[tipo];
}

export function tomTipoFonte(tipo: TipoFonte): 'amber' | 'slate' | 'neutro' {
  return TONS_TIPO[tipo];
}

export function nomeArquivoFonte(fonte: Fonte): string {
  if (fonte.tipo === 'curado') return 'sua nota';

  const caminho = fonte.caminho.trim();
  if (!caminho) return fonte.titulo;

  const segmentos = caminho.split('/').filter(Boolean);
  return segmentos.at(-1) || fonte.titulo;
}
