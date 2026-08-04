<template>
  <div class="redator">
    <div class="redator__coluna">
      <div class="caixa">
        <textarea
          v-model="chat.rascunho"
          rows="2"
          placeholder="Pergunte sobre seus servidores, projetos e anotações…"
          :disabled="chat.enviando"
          @keydown.enter.exact.prevent="enviar"
        />

        <div class="caixa__acoes">
          <span class="caixa__info">
            capacidades: {{ sessao.ferramentasDisponiveis }} de {{ sessao.ferramentasTotais }}
          </span>
          <p v-if="chat.erro" class="caixa__erro">{{ chat.erro }}</p>
          <div class="caixa__espacador" />
          <span class="caixa__atalho">Enter envia</span>
          <button
            v-if="chat.enviando"
            class="o-btn o-btn--neutral"
            type="button"
            @click="chat.interromper()"
          >
            interromper
          </button>
          <button
            v-else
            class="o-btn o-btn--primary"
            type="button"
            :disabled="!chat.rascunho.trim()"
            @click="enviar"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat';
import { useSessaoStore } from '@/stores/sessao';

const chat = useChatStore();
const sessao = useSessaoStore();

function enviar(): void {
  if (chat.enviando || !chat.rascunho.trim()) return;
  void chat.enviar();
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.redator {
  border-top: 1px solid var(--line);
  background: var(--panel);
  padding: 12px 20px 16px;

  &__coluna {
    max-width: 700px;
    margin: 0 auto;
  }
}

.caixa {
  border: 1px solid var(--line2);
  border-radius: 14px;
  background: var(--panel2);
  padding: 4px 6px 6px;

  &:focus-within {
    border-color: var(--sage);
  }

  textarea {
    width: 100%;
    background: none;
    border: none;
    resize: none;
    outline: none;
    color: var(--ink);
    font: 400 14.5px/1.5 $sans;
    padding: 9px 10px 2px;

    &::placeholder {
      color: var(--ink3);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  &__acoes {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 2px 4px 0;
    flex-wrap: wrap;
  }

  &__info,
  &__atalho {
    font-size: 12px;
    color: var(--ink3);
  }

  &__erro {
    font-size: 12px;
    margin: 0;
    color: var(--clay);
  }

  &__espacador {
    flex: 1;
  }
}
</style>
