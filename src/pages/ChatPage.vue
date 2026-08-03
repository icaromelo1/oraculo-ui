<template>
  <div class="chat" :style="{ gridTemplateColumns: colunas }">
    <ListaConversas v-if="mostrarLista" class="chat__lateral" />

    <main class="chat__principal">
      <BarraConversa
        :mostrar-botao-lista="!telaLarga"
        :mostrar-botao-fontes="mostrarBotaoFontes"
        :rotulo-fontes="rotuloBotaoFontes"
      />

      <div class="chat__rolagem">
        <div class="chat__coluna">
          <MensagemUsuario :hora="'14:22'" :texto="perguntaInicial" />

          <RespostaResolvida />

          <MensagemUsuario v-if="chat.seguimento" :hora="'14:26'" :texto="chat.seguimento" />

          <RespostaStreaming v-if="chat.estado === 'streaming'" />
          <RespostaExecutando v-else-if="chat.estado === 'executando'" />
          <RespostaAprovacao v-else-if="chat.estado === 'aprovacao'" />
          <RespostaSemResultado v-else-if="chat.estado === 'sem_resultado'" />
          <RespostaTrechoOculto v-else-if="chat.estado === 'trecho_oculto'" />
          <RespostaBloqueada v-else-if="chat.estado === 'bloqueada'" />
          <RespostaErroModelo v-else-if="chat.estado === 'erro_modelo'" />
        </div>
      </div>

      <RedatorPergunta />
    </main>

    <div v-if="escurecerFundo" class="chat__cortina" @click="chat.alternarPainelFontes()" />

    <PainelFontes
      v-if="painelAberto"
      class="chat__fontes"
      :flutuante="painelFlutuante"
      :style="estiloPainel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BarraConversa from '@/components/chat/BarraConversa.vue';
import ListaConversas from '@/components/chat/ListaConversas.vue';
import MensagemUsuario from '@/components/chat/MensagemUsuario.vue';
import PainelFontes from '@/components/chat/PainelFontes.vue';
import RedatorPergunta from '@/components/chat/RedatorPergunta.vue';
import RespostaAprovacao from '@/components/chat/RespostaAprovacao.vue';
import RespostaBloqueada from '@/components/chat/RespostaBloqueada.vue';
import RespostaErroModelo from '@/components/chat/RespostaErroModelo.vue';
import RespostaExecutando from '@/components/chat/RespostaExecutando.vue';
import RespostaResolvida from '@/components/chat/RespostaResolvida.vue';
import RespostaSemResultado from '@/components/chat/RespostaSemResultado.vue';
import RespostaStreaming from '@/components/chat/RespostaStreaming.vue';
import RespostaTrechoOculto from '@/components/chat/RespostaTrechoOculto.vue';
import { useLarguraJanela } from '@/composables/useLarguraJanela';
import { PERGUNTA_INICIAL } from '@/mocks/conversa';
import { useChatStore } from '@/stores/chat';

const chat = useChatStore();
const { largura } = useLarguraJanela();

const perguntaInicial = PERGUNTA_INICIAL;

const telaLarga = computed(() => largura.value >= 1080);
const painelFlutuante = computed(() => largura.value < 1400);
const mostrarLista = computed(() => telaLarga.value || chat.listaConversasAberta);
const painelAberto = computed(() => chat.painelFontesAberto);
const escurecerFundo = computed(() => painelAberto.value && painelFlutuante.value);
const mostrarBotaoFontes = computed(() => !escurecerFundo.value);

const rotuloBotaoFontes = computed(() =>
  painelAberto.value ? 'fechar fontes' : `painel de fontes · ${chat.fontes.length}`,
);

const colunas = computed(() => {
  const esquerda = mostrarLista.value ? '248px ' : '';
  const direita = painelAberto.value && !painelFlutuante.value ? ' 320px' : '';
  return `${esquerda}minmax(0,1fr)${direita}`;
});

const estiloPainel = computed(() =>
  painelFlutuante.value
    ? {
        position: 'absolute' as const,
        width: '340px',
        boxShadow: '-14px 0 28px rgba(0, 0, 0, 0.42)',
      }
    : {},
);
</script>

<style scoped lang="scss">
.chat {
  display: grid;
  flex: 1;
  min-height: 0;
  position: relative;

  &__lateral {
    overflow: hidden;
  }

  &__principal {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg);
  }

  &__rolagem {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px 8px;
  }

  &__coluna {
    max-width: 820px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding-bottom: 4px;
  }

  &__cortina {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 45%);
    z-index: 15;
  }

  &__fontes {
    top: 0;
    right: 0;
    bottom: 0;
    max-width: 100%;
    z-index: 20;
  }
}
</style>
