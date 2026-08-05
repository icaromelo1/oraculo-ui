const UNIDADES = ['B', 'KB', 'MB', 'GB'];

export function formatarBytes(bytes: number): string {
  let valor = bytes;
  let indice = 0;

  while (valor >= 1024 && indice < UNIDADES.length - 1) {
    valor /= 1024;
    indice += 1;
  }

  const casas = indice === 0 || valor >= 100 ? 0 : 1;

  return `${valor.toFixed(casas).replace('.', ',')} ${UNIDADES[indice]}`;
}

export function formatarQuando(iso: string): string {
  const data = new Date(iso);

  if (Number.isNaN(data.getTime())) return '—';

  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
