<template>
  <div class="redator">
    <div class="redator__coluna">
      <div class="caixa">
        <textarea
          v-model="chat.rascunho"
          rows="2"
          placeholder="pergunte sobre documentação, código, banco ou estado dos serviços…"
          @keydown.enter.exact.prevent="enviar"
        />

        <div class="caixa__acoes">
          <button class="o-btn" type="button">escopo: 41 repos + fiscal_prod ▾</button>
          <button class="o-btn" type="button">
            ferramentas: {{ sessao.ferramentasDisponiveis }} de {{ sessao.ferramentasTotais }} ▾
          </button>
          <span class="caixa__aviso">shell desligada nesta instalação</span>
          <div class="caixa__espacador" />
          <span class="caixa__atalho">⏎ envia · ⇧⏎ nova linha</span>
          <button class="o-btn o-btn--primary" type="button" @click="enviar">enviar</button>
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

function enviar() {
  if (!chat.rascunho.trim()) return;
  chat.rascunho = '';
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
  }

  &__acoes {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 9px 7px;
    flex-wrap: wrap;
  }

  &__aviso,
  &__atalho {
    @include mono(10.5px, 400);
    color: var(--txt3);
  }

  &__espacador {
    flex: 1;
  }
}
</style>
