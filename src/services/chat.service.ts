import type { EventoOraculo, PedidoChat } from '@/types/eventos';
import { cabecalhosAutenticados, tratarNaoAutorizado, urlBase } from './http';

interface OpcoesEnvio {
  onEvento: (evento: EventoOraculo) => void;
  signal?: AbortSignal;
}

function interpretarFrame(bloco: string): EventoOraculo | null {
  let tipo = '';
  const linhasDados: string[] = [];

  for (const linha of bloco.split('\n')) {
    if (linha.startsWith('event:')) {
      tipo = linha.slice('event:'.length).trim();
    } else if (linha.startsWith('data:')) {
      linhasDados.push(linha.slice('data:'.length).trim());
    }
  }

  if (!tipo || linhasDados.length === 0) return null;

  try {
    return JSON.parse(linhasDados.join('\n')) as EventoOraculo;
  } catch {
    return null;
  }
}

export async function enviarPergunta(pedido: PedidoChat, opcoes: OpcoesEnvio): Promise<void> {
  let resposta: Response;

  try {
    resposta = await fetch(`${urlBase()}/chat`, {
      method: 'POST',
      headers: cabecalhosAutenticados(true),
      body: JSON.stringify(pedido),
      ...(opcoes.signal ? { signal: opcoes.signal } : {}),
    });
  } catch (falha) {
    if (falha instanceof DOMException && falha.name === 'AbortError') throw falha;
    throw new Error('falha de rede ao falar com o oráculo');
  }

  if (resposta.status === 401) {
    tratarNaoAutorizado();
    throw new Error('sessão expirada');
  }

  if (!resposta.ok || !resposta.body) {
    throw new Error(`o oráculo respondeu com erro (${resposta.status})`);
  }

  const leitor = resposta.body.getReader();
  const decodificador = new TextDecoder('utf-8');
  let bufer = '';

  while (true) {
    const { value, done } = await leitor.read();

    if (done) break;

    bufer += decodificador.decode(value, { stream: true });

    let indice = bufer.indexOf('\n\n');

    while (indice !== -1) {
      const bloco = bufer.slice(0, indice);
      bufer = bufer.slice(indice + 2);

      const evento = interpretarFrame(bloco);
      if (evento) opcoes.onEvento(evento);

      indice = bufer.indexOf('\n\n');
    }
  }

  const restante = interpretarFrame(bufer);
  if (restante) opcoes.onEvento(restante);
}
