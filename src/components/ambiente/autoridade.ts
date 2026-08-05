export interface NivelDeAutoridade {
  autoridade: number;
  tom: string;
  rotulo: string;
}

export const AUTORIDADES: readonly NivelDeAutoridade[] = [
  { autoridade: 1, tom: 'amber', rotulo: 'suas notas, memória e agentes' },
  { autoridade: 2, tom: 'slate', rotulo: 'documentação' },
  { autoridade: 3, tom: 'neutro', rotulo: 'código e configuração' },
];

function nivelDaAutoridade(valor: number): NivelDeAutoridade | undefined {
  return AUTORIDADES.find((nivel) => nivel.autoridade === valor);
}

export function tomDaAutoridade(valor: number): string {
  return nivelDaAutoridade(valor)?.tom ?? 'neutro';
}

export function rotuloDaAutoridade(valor: number): string {
  return nivelDaAutoridade(valor)?.rotulo ?? 'origem não classificada';
}
