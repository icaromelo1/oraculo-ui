import type { Cobertura, Escopo, Fonte, NomeFerramenta, StatusFerramenta } from './oraculo';

export interface PedidoChat {
  conversaId?: string;
  pergunta: string;
  escopo?: Escopo;
}

export interface EventoMensagemInicio {
  tipo: 'mensagem.inicio';
  id: string;
  conversaId: string;
  modelo: string;
  escopo: Escopo;
}

export interface EventoFerramentaInicio {
  tipo: 'ferramenta.inicio';
  id: string;
  nome: NomeFerramenta;
  argumento: string;
  sensivel: boolean;
}

export interface EventoFerramentaFim {
  tipo: 'ferramenta.fim';
  id: string;
  status: StatusFerramenta;
  metrica: string;
  duracaoMs: number;
  plano?: string;
  aprovadaPor?: string;
  resultado: string;
}

export interface EventoTextoDelta {
  tipo: 'texto.delta';
  fragmento: string;
}

export interface EventoCitacao {
  tipo: 'citacao';
  fonte: Fonte;
  ferramentaId: string;
}

export interface EventoAprovacaoPedido {
  tipo: 'aprovacao.pedido';
  id: string;
  comando: string;
  alvo: string;
  efeitoColateral: string;
  politica: string;
  expiraEm: string;
}

export interface EventoMensagemFim {
  tipo: 'mensagem.fim';
  cobertura: Cobertura;
  tokens: number;
  duracaoMs: number;
}

export interface EventoErro {
  tipo: 'erro';
  codigo: string;
  mensagem: string;
  retomavel: boolean;
}

export type EventoOraculo =
  | EventoMensagemInicio
  | EventoFerramentaInicio
  | EventoFerramentaFim
  | EventoTextoDelta
  | EventoCitacao
  | EventoAprovacaoPedido
  | EventoMensagemFim
  | EventoErro;
