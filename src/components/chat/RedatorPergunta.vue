<template>
  <div class="redator">
    <div class="redator__coluna">
      <div class="caixa">
        <textarea
          v-model="chat.rascunho"
          rows="2"
          placeholder="pergunte sobre documentação, código, banco ou estado dos serviços…"
          :disabled="chat.enviando"
          @keydown.enter.exact.prevent="enviar"
        />

        <div class="caixa__acoes">
          <span class="caixa__info">
            ferramentas: {{ sessao.ferramentasDisponiveis }} de {{ sessao.ferramentasTotais }}
          </span>
          <p v-if="chat.erro" class="caixa__erro">{{ chat.erro }}</p>
          <div class="caixa__espacador" />
          <span class="caixa__atalho">⏎ envia · ⇧⏎ nova linha</span>
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
            enviar
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
  padding: 10px 24px 12px;

  &__coluna {
    max-width: 820px;
    margin: 0 auto;
  }
}

.caixa {
  border: 1px solid var(--line2);
  border-radius: 4px;
  background: var(--bg);

  textarea {
    width: 100%;
    background: none;
    border: none;
    resize: none;
    outline: none;
    color: var(--txt);
    font: 400 13.5px/1.5 $sans;
    padding: 10px 12px 4px;

    &::placeholder {
      color: var(--txt3);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  &__acoes {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 9px 7px;
    flex-wrap: wrap;
  }

  &__info,
  &__atalho {
    @include mono(10.5px, 400);
    color: var(--txt3);
  }

  &__erro {
    @include mono(10.5px, 400);
    margin: 0;
    color: var(--err);
  }

  &__espacador {
    flex: 1;
  }
}
</style>
