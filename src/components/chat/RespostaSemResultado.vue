<template>
  <div>
    <CabecalhoResposta tom="neutro" :meta="resumo">
      <template v-if="mensagem.ferramentas.length" #extra>
        <button class="ver-detalhe" type="button" @click="detalheAberto = !detalheAberto">
          {{ detalheAberto ? 'ocultar detalhe' : 'onde eu procurei' }}
        </button>
      </template>
    </CabecalhoResposta>

    <ListaFerramentas
      v-if="detalheAberto && mensagem.ferramentas.length"
      :ferramentas="mensagem.ferramentas"
      titulo="Onde eu procurei"
    />

    <p class="intro">
      Não encontrei nada relevante na base para essa pergunta.
      <span>Prefiro dizer isso a inferir um procedimento sem fonte — o palpite sairia caro.</span>
    </p>

    <RespostaMarkdown v-if="mensagem.texto" :texto="mensagem.texto" :fontes="mensagem.fontes" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import RespostaMarkdown from '@/components/chat/RespostaMarkdown.vue';
import { formatarSegundos } from '@/composables/useFormato';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();

const detalheAberto = ref(false);

const resumo = computed(
  () =>
    `busquei no conhecimento — nenhum trecho relevante · ${formatarSegundos(props.mensagem.duracaoMs)}`,
);
</script>

<style scoped lang="scss">
.intro {
  font-size: 15px;
  color: var(--ink);
  max-width: 68ch;
  margin: 0 0 12px;
  text-wrap: pretty;

  span {
    color: var(--ink2);
  }
}

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
