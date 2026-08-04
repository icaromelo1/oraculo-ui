<template>
  <div class="barra">
    <button
      v-if="mostrarBotaoLista"
      class="o-btn"
      type="button"
      @click="chat.alternarListaConversas()"
    >
      ☰
    </button>

    <div class="titulo">
      <div class="titulo__texto">{{ chat.conversa?.titulo || 'Nova conversa' }}</div>
      <div class="titulo__modelo">
        <i class="titulo__estado" aria-hidden="true" />
        <span>{{ sessao.modelo.nome }}</span>
      </div>
    </div>

    <div class="espacador" />

    <button
      v-if="mostrarBotaoFontes"
      class="o-btn"
      type="button"
      @click="chat.alternarPainelFontes()"
    >
      {{ rotuloFontes }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat';
import { useSessaoStore } from '@/stores/sessao';

defineProps<{
  mostrarBotaoLista: boolean;
  mostrarBotaoFontes: boolean;
  rotuloFontes: string;
}>();

const chat = useChatStore();
const sessao = useSessaoStore();
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.barra {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 18px;
  border-bottom: 1px solid var(--line);
  background: var(--panel);
}

.titulo {
  min-width: 0;
  flex: 1;

  &__texto {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__modelo {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: var(--ink3);
  }

  &__estado {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--sage);
    flex: none;
  }
}

.espacador {
  flex: 1;
}
</style>
