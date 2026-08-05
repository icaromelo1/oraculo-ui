<template>
  <div>
    <CabecalhoResposta tom="sage-suave" :meta="resumo">
      <template v-if="mensagem.ferramentas.length" #extra>
        <button class="ver-detalhe" type="button" @click="detalheAberto = !detalheAberto">
          {{ detalheAberto ? 'ocultar detalhe' : 'ver detalhe' }}
        </button>
      </template>
    </CabecalhoResposta>

    <ListaFerramentas v-if="detalheAberto" :ferramentas="mensagem.ferramentas" />

    <RespostaMarkdown :texto="mensagem.texto" :fontes="mensagem.fontes" />

    <RodapeResposta
      :mensagem-id="mensagem.id"
      :tokens="mensagem.tokens"
      :duracao-ms="mensagem.duracaoMs"
      :fontes="mensagem.fontes"
      :texto="mensagem.texto"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import RespostaMarkdown from '@/components/chat/RespostaMarkdown.vue';
import RodapeResposta from '@/components/chat/RodapeResposta.vue';
import { resumoBusca } from '@/composables/useResumoFerramentas';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();

const detalheAberto = ref(false);

const resumo = computed(() => resumoBusca(props.mensagem.ferramentas, props.mensagem.duracaoMs));
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.ver-detalhe {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--sage);
  text-decoration: underline;
  cursor: pointer;
}
</style>
