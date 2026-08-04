<template>
  <div>
    <CabecalhoResposta tom-erro :meta="meta" />

    <div class="cartao">
      <div class="cartao__topo">
        <span class="cartao__selo">modelo indisponível</span>
        <span class="cartao__alvo">código {{ mensagem.erro?.codigo ?? '—' }}</span>
      </div>

      <div class="cartao__corpo">
        <p class="cartao__texto">{{ mensagem.erro?.mensagem }}</p>

        <div class="acoes">
          <button
            v-if="mensagem.erro?.retomavel"
            class="o-btn o-btn--primary"
            type="button"
            @click="$emit('tentar-novamente')"
          >
            tentar novamente
          </button>
          <span v-else class="acoes__nota">este erro não é retomável automaticamente.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();
defineEmits<{ 'tentar-novamente': [] }>();

const meta = computed(() => `erro do modelo · código ${props.mensagem.erro?.codigo ?? '—'}`);
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.cartao {
  border: 1px solid var(--err-l);
  border-radius: 4px;
  background: var(--panel);
  overflow: hidden;

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px 11px;
    background: var(--err-b);
    border-bottom: 1px solid var(--err-l);
  }

  &__selo {
    @include mono(10.5px, 600);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--err);
  }

  &__alvo {
    @include mono(11px, 400);
    color: var(--txt2);
  }

  &__corpo {
    padding: 11px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__texto {
    margin: 0;
    font-size: 13px;
    color: var(--txt2);
    text-wrap: pretty;
  }
}

.acoes {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  align-items: center;

  &__nota {
    @include mono(11px, 400);
    color: var(--txt3);
  }
}
</style>
