<template>
  <div class="barra">
    <button
      v-if="mostrarBotaoLista"
      class="o-btn"
      type="button"
      @click="chat.alternarListaConversas()"
    >
      ☰ conversas
    </button>

    <div class="instalacoes">
      <button
        v-for="opcao in instalacoes"
        :key="opcao.valor"
        class="instalacoes__item"
        :class="{ 'instalacoes__item--ativa': sessao.instalacao === opcao.valor }"
        type="button"
        @click="sessao.instalacao = opcao.valor"
      >
        {{ opcao.rotulo }}
      </button>
    </div>

    <span class="divisor">|</span>

    <div class="modelo">
      <i class="modelo__estado" aria-hidden="true" />
      <span class="modelo__nome">{{ sessao.modelo.nome }}</span>
      <span class="modelo__meta">
        {{ sessao.modelo.local ? 'local' : 'remoto' }} · {{ sessao.modelo.contexto }} ·
        {{ sessao.modelo.repositorios }} repos
      </span>
    </div>

    <div class="espacador" />

    <span class="titulo">{{ chat.conversa?.titulo }}</span>

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
import type { Instalacao } from '@/types/oraculo';

defineProps<{
  mostrarBotaoLista: boolean;
  mostrarBotaoFontes: boolean;
  rotuloFontes: string;
}>();

const chat = useChatStore();
const sessao = useSessaoStore();

const instalacoes: { valor: Instalacao; rotulo: string }[] = [
  { valor: 'pessoal', rotulo: 'Pessoal' },
  { valor: 'dsg', rotulo: 'DSG' },
  { valor: 'cast', rotulo: 'CAST' },
];
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.barra {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  height: 40px;
  min-height: 40px;
  border-bottom: 1px solid var(--line);
  background: var(--panel);
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.instalacoes {
  display: flex;
  border: 1px solid var(--line2);
  border-radius: 3px;
  overflow: hidden;
  flex: none;

  &__item {
    @include mono(11px, 400);
    background: var(--panel2);
    color: var(--txt3);
    border: none;
    padding: 5px 9px;
    cursor: pointer;

    & + & {
      border-left: 1px solid var(--line2);
    }

    &--ativa {
      @include mono(11px, 500);
      background: var(--acc-b);
      color: var(--acc);
    }
  }
}

.divisor {
  color: var(--line2);
  flex: none;
}

.modelo {
  @include mono(11px, 400);
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--txt2);
  flex: none;

  &__estado {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    flex: none;
  }

  &__nome {
    color: var(--txt);
  }

  &__meta {
    color: var(--txt3);
  }
}

.espacador {
  flex: 1 0 12px;
}

.titulo {
  @include mono(11px, 400);
  color: var(--txt3);
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
