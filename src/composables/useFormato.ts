export function formatarSegundos(duracaoMs: number | null): string {
  if (duracaoMs === null) return '—';
  return `${(duracaoMs / 1000).toFixed(1).replace('.', ',')} s`;
}

export function formatarTokens(tokens: number | null): string {
  if (tokens === null) return '—';
  return `${tokens.toLocaleString('pt-BR')} tok`;
}

export function formatarHoraCurta(data: Date): string {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
