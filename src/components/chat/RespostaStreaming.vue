<template>
  <div>
    <CabecalhoResposta pulsando meta="gerando · 2 ferramentas concluídas · 41 tok/s">
      <template #extra>
        <button class="interromper" type="button">interromper ⎋</button>
      </template>
    </CabecalhoResposta>

    <ListaFerramentas :ferramentas="ferramentas" />

    <div class="corpo">
      <p>
        Drenar a DLQ é seguro desde que nenhum consumidor esteja ativo na fila de origem. O
        procedimento homologado tem três etapas: confirmar que
        <code class="o-code">nfe.lote.retry</code> está pausado
        <ChipCitacao fonte-id="c2" tipo="doc" rotulo="doc · Barramento §4.2" />, exportar as
        mensagens para o bucket de quarentena e<span class="cursor" aria-hidden="true" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ChipCitacao from '@/components/chat/ChipCitacao.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import { FERRAMENTAS_STREAMING } from '@/mocks/conversa';

const ferramentas = FERRAMENTAS_STREAMING;
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.interromper {
  @include mono(10.5px, 400);
  background: none;
  border: 1px solid var(--line);
  border-radius: 3px;
  color: var(--txt3);
  padding: 2px 6px;
  cursor: pointer;

  &:hover {
    color: var(--err);
    border-color: var(--err-l);
  }
}

.corpo {
  font-size: 14px;
  color: var(--txt);
  max-width: 76ch;
  text-wrap: pretty;

  p {
    margin: 0;
  }
}

.cursor {
  display: inline-block;
  width: 7px;
  height: 15px;
  background: var(--acc);
  vertical-align: -3px;
  margin-left: 2px;
  animation: ocaret 1s step-end infinite;
}
</style>
