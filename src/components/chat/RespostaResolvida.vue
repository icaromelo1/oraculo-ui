<template>
  <div>
    <CabecalhoResposta :meta="meta" />

    <ListaFerramentas :ferramentas="mensagem.ferramentas" />

    <RespostaMarkdown :texto="mensagem.texto" :fontes="mensagem.fontes" />

    <RodapeResposta
      :tokens="mensagem.tokens"
      :duracao-ms="mensagem.duracaoMs"
      :fontes="mensagem.fontes"
      :texto="mensagem.texto"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import RespostaMarkdown from '@/components/chat/RespostaMarkdown.vue';
import RodapeResposta from '@/components/chat/RodapeResposta.vue';
import { formatarSegundos } from '@/composables/useFormato';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();

const meta = computed(() => {
  const partes = [props.mensagem.modelo || 'oráculo'];

  if (props.mensagem.ferramentas.length) {
    partes.push(`${props.mensagem.ferramentas.length} ferramenta(s)`);
  }

  partes.push(formatarSegundos(props.mensagem.duracaoMs));
  partes.push(`${props.mensagem.fontes.length} fonte(s)`);

  return partes.join(' · ');
});
</script>
