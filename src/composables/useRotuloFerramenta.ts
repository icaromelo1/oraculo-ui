import type { NomeFerramenta } from '@/types/oraculo';

const ROTULOS_FERRAMENTA: Record<NomeFerramenta, string> = {
  buscar_conhecimento: 'Busca no conhecimento',
  buscar_codigo: 'Busca no código',
  ler_arquivo: 'Leitura de arquivo',
  consultar_banco: 'Consulta ao banco',
  ler_documento: 'Leitura de documento',
  estado_servicos: 'Estado dos serviços',
};

export function rotuloFerramenta(nome: NomeFerramenta): string {
  return ROTULOS_FERRAMENTA[nome] ?? nome;
}
