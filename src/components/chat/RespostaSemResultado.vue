<template>
  <div>
    <CabecalhoResposta :meta="meta" />

    <p class="intro">
      Não encontrei nada relevante na base para essa pergunta.
      <span>Prefiro dizer isso a inferir um procedimento sem fonte.</span>
    </p>

    <ListaFerramentas v-if="mensagem.ferramentas.length" :ferramentas="mensagem.ferramentas" />

    <RespostaMarkdown v-if="mensagem.texto" :texto="mensagem.texto" :fontes="mensagem.fontes" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import RespostaMarkdown from '@/components/chat/RespostaMarkdown.vue';
import { formatarSegundos } from '@/composables/useFormato';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();

const meta = computed(
  () =>
    `${props.mensagem.ferramentas.length} ferramenta(s) · ${formatarSegundos(props.mensagem.duracaoMs)} · 0 fontes`,
);
</script>

<style scoped lang="scss">
.intro {
  font-size: 14px;
  color: var(--txt);
  max-width: 76ch;
  margin: 0 0 12px;
  text-wrap: pretty;

  span {
    color: var(--txt2);
  }
}
</style>
