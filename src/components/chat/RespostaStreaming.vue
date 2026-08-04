<template>
  <div>
    <CabecalhoResposta pulsando :meta="meta">
      <template #extra>
        <button class="interromper" type="button" @click="$emit('interromper')">
          interromper ⎋
        </button>
      </template>
    </CabecalhoResposta>

    <ListaFerramentas :ferramentas="mensagem.ferramentas" />

    <RespostaMarkdown :texto="mensagem.texto" :fontes="mensagem.fontes" cursor />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import RespostaMarkdown from '@/components/chat/RespostaMarkdown.vue';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();
defineEmits<{ interromper: [] }>();

const meta = computed(() => {
  const concluidas = props.mensagem.ferramentas.filter((f) => f.status !== 'executando').length;
  return concluidas > 0 ? `gerando · ${concluidas} ferramenta(s) concluída(s)` : 'gerando';
});
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
