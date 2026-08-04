<template>
  <div>
    <CabecalhoResposta tom="sage-suave" :meta="resumo">
      <template #extra>
        <button class="parar" type="button" @click="$emit('interromper')">parar</button>
      </template>
    </CabecalhoResposta>

    <RespostaMarkdown :texto="mensagem.texto" :fontes="mensagem.fontes" cursor />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import RespostaMarkdown from '@/components/chat/RespostaMarkdown.vue';
import { resumoBusca } from '@/composables/useResumoFerramentas';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();
defineEmits<{ interromper: [] }>();

const resumo = computed(() =>
  resumoBusca(props.mensagem.ferramentas, props.mensagem.duracaoMs, 'gerando a resposta'),
);
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
