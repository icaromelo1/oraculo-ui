<template>
  <div>
    <CabecalhoResposta :meta="`${sessao.modelo.nome} · 4 ferramentas · 3,8 s · 6 fontes`" />

    <ListaFerramentas :ferramentas="ferramentas" />

    <div class="corpo">
      <p>
        Os lotes não estão falhando por erro de negócio: eles estão sendo
        <b>reenfileirados indefinidamente</b> porque o contador de tentativas nunca é gravado quando
        o worker morre por timeout de conexão.
      </p>

      <p>
        O <code class="o-code">LoteWorker</code> incrementa <code class="o-code">tentativas</code>
        dentro da mesma transação que o processamento, então o rollback desfaz o incremento junto
        <ChipCitacao fonte-id="c1" tipo="codigo" rotulo="código · LoteWorker.java:112" />. O limite
        de 5 tentativas do barramento, por isso, nunca é atingido
        <ChipCitacao fonte-id="c2" tipo="doc" rotulo="doc · Barramento §4.2" />.
      </p>

      <p>
        O lote 884213 já acumulou 147 execuções reais contra 0 tentativas registradas
        <ChipCitacao fonte-id="c3" tipo="banco" rotulo="banco · fiscal_prod.lote" />. O padrão bate
        com o caso que a Tereza documentou em maio: o gatilho é sempre uma queda de conexão com a
        SEFAZ acima de 30 s <ChipCitacao fonte-id="c4" tipo="curado" rotulo="nota · t.aguiar" />.
      </p>

      <p class="corpo__intro">Contenção sugerida, na ordem em que a Tereza aplicou:</p>

      <ol class="corpo__passos">
        <li>pausar o consumidor <code class="o-code">nfe.lote.retry</code>;</li>
        <li>mover os 3 lotes presos para a DLQ manualmente;</li>
        <li>
          subir o incremento de tentativas para uma transação própria (commit antes do
          processamento).
        </li>
      </ol>

      <p class="corpo__inferencia">
        A causa da queda de conexão com a SEFAZ não está em nenhuma fonte consultada — isto é
        <b>inferência</b> por correlação de horário entre os eventos de lote e os erros de socket no
        log do gateway.
      </p>
    </div>

    <RodapeResposta />
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ChipCitacao from '@/components/chat/ChipCitacao.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import RodapeResposta from '@/components/chat/RodapeResposta.vue';
import { FERRAMENTAS_RESOLVIDA } from '@/mocks/conversa';
import { useSessaoStore } from '@/stores/sessao';

const sessao = useSessaoStore();
const ferramentas = FERRAMENTAS_RESOLVIDA;
</script>

<style scoped lang="scss">
.corpo {
  font-size: 14px;
  color: var(--txt);
  max-width: 76ch;
  text-wrap: pretty;

  p {
    margin: 0 0 11px;
  }

  b {
    font-weight: 600;
  }

  &__intro {
    color: var(--txt2);
    margin-bottom: 6px;
  }

  &__passos {
    margin: 0 0 11px;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__inferencia {
    margin: 0;
    padding: 8px 10px;
    border: 1px dashed var(--gray-l);
    border-radius: 3px;
    color: var(--txt2);
    font-size: 13px;

    b {
      color: var(--gray);
    }
  }
}
</style>
