<template>
  <div>
    <CabecalhoResposta tom="sage" pulsando :meta="resumo">
      <template #extra>
        <button class="parar" type="button" @click="$emit('interromper')">parar</button>
      </template>
    </CabecalhoResposta>

    <ListaFerramentas
      v-if="mensagem.ferramentas.length"
      :ferramentas="mensagem.ferramentas"
      titulo="O que estou fazendo"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import { resumirFerramentas } from '@/composables/useResumoFerramentas';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();
defineEmits<{ interromper: [] }>();

const resumo = computed(() => {
  const total = props.mensagem.ferramentas.length;
  if (total === 0) return 'iniciando…';

  const { nomeAmigavel, principal } = resumirFerramentas(props.mensagem.ferramentas);
  if (principal?.status === 'executando') return `${nomeAmigavel}…`;

  const concluidas = props.mensagem.ferramentas.filter(
    (f) => f.status !== 'executando' && f.status !== 'na_fila',
  ).length;

  return `reunindo evidências · ${concluidas} de ${total}`;
});
</script>

<style scoped lang="scss">
.parar {
  background: none;
  border: 1px solid var(--line);
  border-radius: 7px;
  color: var(--ink3);
  padding: 3px 9px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    color: var(--clay);
    border-color: var(--clay-l);
  }
}
</style>
