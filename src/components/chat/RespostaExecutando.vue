<template>
  <div>
    <CabecalhoResposta meta="reunindo evidências · etapa 3 de 4">
      <template #extra>
        <button class="interromper" type="button">interromper ⎋</button>
      </template>
    </CabecalhoResposta>

    <ListaFerramentas :ferramentas="ferramentas" />
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import { FERRAMENTAS_EXECUTANDO } from '@/mocks/conversa';

const ferramentas = FERRAMENTAS_EXECUTANDO;
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
</style>
