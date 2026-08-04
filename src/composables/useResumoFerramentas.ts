import { formatarSegundos } from '@/composables/useFormato';
import { rotuloFerramenta } from '@/composables/useRotuloFerramenta';
import type { Ferramenta } from '@/types/oraculo';

export interface ResumoFerramentas {
  principal: Ferramenta | null;
  nomeAmigavel: string;
  detalhe: string;
  restantes: number;
}

export function resumirFerramentas(ferramentas: Ferramenta[]): ResumoFerramentas {
  const principal =
    ferramentas.find((item) => item.nome === 'buscar_conhecimento') ?? ferramentas[0] ?? null;

  if (!principal) {
    return { principal: null, nomeAmigavel: '', detalhe: '', restantes: 0 };
  }

  return {
    principal,
    nomeAmigavel: rotuloFerramenta(principal.nome),
    detalhe: principal.metrica || principal.argumento,
    restantes: Math.max(0, ferramentas.length - 1),
  };
}

export function resumoBusca(
  ferramentas: Ferramenta[],
  duracaoMs: number | null,
  semTexto = 'respondi direto',
): string {
  const { nomeAmigavel, detalhe, restantes } = resumirFerramentas(ferramentas);

  if (!nomeAmigavel) {
    return duracaoMs === null ? semTexto : `${semTexto} · ${formatarSegundos(duracaoMs)}`;
  }

  const extra = restantes > 0 ? ` e mais ${restantes} etapa(s)` : '';
  const meio = detalhe ? ` — ${detalhe}` : '';
  const sufixo = duracaoMs === null ? '' : ` · ${formatarSegundos(duracaoMs)}`;

  return `${nomeAmigavel}${meio}${extra}${sufixo}`;
}
