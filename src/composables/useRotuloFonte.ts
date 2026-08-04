import type { Fonte, TipoFonte } from '@/types/oraculo';

const ROTULOS_TIPO: Record<TipoFonte, string> = {
  curado: 'curado',
  doc: 'doc',
  codigo: 'código',
  banco: 'banco',
  inferencia: 'inferência',
};

export function rotuloTipoFonte(tipo: TipoFonte): string {
  return ROTULOS_TIPO[tipo];
}

export function rotuloCitacao(fonte: Fonte): string {
  const detalhe = fonte.detalhe || fonte.etiqueta || fonte.titulo;
  return `${rotuloTipoFonte(fonte.tipo)} · ${detalhe}`;
}
