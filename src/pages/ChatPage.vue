<template>
  <div class="chat" :style="{ gridTemplateColumns: colunas }">
    <ListaConversas v-if="mostrarLista" class="chat__lateral" />

    <main class="chat__principal">
      <BarraConversa
        :mostrar-botao-lista="!telaLarga"
        :mostrar-botao-fontes="mostrarBotaoFontes"
        :rotulo-fontes="rotuloBotaoFontes"
      />

      <div ref="areaRolagem" class="chat__rolagem">
        <div class="chat__coluna">
          <p v-if="chat.carregandoMensagens" class="aviso">carregando conversa…</p>

          <template v-for="mensagem in chat.mensagens" :key="mensagem.id">
            <MensagemUsuario
              v-if="mensagem.papel === 'usuario'"
              :hora="mensagem.hora"
              :texto="mensagem.texto"
            />
            <RespostaAssistente
              v-else
              :mensagem="mensagem"
              @interromper="chat.interromper()"
              @tentar-novamente="void chat.reenviarUltima()"
            />
          </template>

          <p v-if="mostrarVazio" class="aviso">faça uma pergunta para começar.</p>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import BarraConversa from '@/components/chat/BarraConversa.vue';
import ListaConversas from '@/components/chat/ListaConversas.vue';
import MensagemUsuario from '@/components/chat/MensagemUsuario.vue';
import PainelFontes from '@/components/chat/PainelFontes.vue';
import RedatorPergunta from '@/components/chat/RedatorPergunta.vue';
import RespostaAssistente from '@/components/chat/RespostaAssistente.vue';
import { useLarguraJanela } from '@/composables/useLarguraJanela';
import { useChatStore } from '@/stores/chat';

const chat = useChatStore();
const { largura } = useLarguraJanela();

const areaRolagem = ref<HTMLElement | null>(null);

const telaLarga = computed(() => largura.value >= 1080);
const painelFlutuante = computed(() => largura.value < 1400);
const mostrarLista = computed(() => telaLarga.value || chat.listaConversasAberta);
const painelAberto = computed(() => chat.painelFontesAberto);
const escurecerFundo = computed(() => painelAberto.value && painelFlutuante.value);
const mostrarBotaoFontes = computed(() => !escurecerFundo.value);
const mostrarVazio = computed(() => !chat.carregandoMensagens && chat.mensagens.length === 0);

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

function rolarParaFinal(): void {
  const elemento = areaRolagem.value;
  if (elemento) elemento.scrollTop = elemento.scrollHeight;
}

watch(
  () => [chat.mensagens.length, chat.mensagens.at(-1)?.texto],
  () => {
    void nextTick(() => rolarParaFinal());
  },
);

onMounted(() => {
  void chat.carregarConversas().then(() => {
    const primeira = chat.conversas[0];
    if (primeira) void chat.selecionarConversa(primeira.id);
  });
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

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

.aviso {
  @include mono(12px, 400);
  color: var(--txt3);
  text-align: center;
  padding: 24px 0;
}
</style>
