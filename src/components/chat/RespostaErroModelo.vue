<template>
  <div>
    <CabecalhoResposta v-if="!compacto" tom="sage-suave" :meta="resumo" />

    <div class="cartao">
      <div class="cartao__topo">
        <i class="cartao__ponto" aria-hidden="true" />
        <span class="cartao__selo">{{
          compacto ? 'A resposta ficou incompleta' : 'O modelo não respondeu'
        }}</span>
        <span class="cartao__modelo">{{ mensagem.modelo || '—' }}</span>
      </div>

      <div class="cartao__corpo">
        <p class="cartao__texto">{{ mensagem.erro?.mensagem }}</p>
        <div class="cartao__tecnico">código {{ mensagem.erro?.codigo ?? '—' }}</div>

        <div class="acoes">
          <button
            v-if="mensagem.erro?.retomavel"
            class="o-btn o-btn--primary"
            type="button"
            @click="$emit('tentar-novamente')"
          >
            Tentar de novo
          </button>
          <button
            v-if="mensagem.fontes.length"
            class="o-btn o-btn--neutral"
            type="button"
            @click="chat.alternarPainelFontes()"
          >
            Ver as {{ mensagem.fontes.length }} fontes encontradas
          </button>
          <span v-if="!mensagem.erro?.retomavel" class="acoes__nota">
            este erro não é retomável automaticamente.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import { resumoBusca } from '@/composables/useResumoFerramentas';
import { useChatStore } from '@/stores/chat';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = withDefaults(
  defineProps<{ mensagem: MensagemAssistenteChat; compacto?: boolean }>(),
  { compacto: false },
);
defineEmits<{ 'tentar-novamente': [] }>();

const chat = useChatStore();

const resumo = computed(() => resumoBusca(props.mensagem.ferramentas, props.mensagem.duracaoMs));
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.cartao {
  border: 1px solid var(--clay-l);
  border-radius: 12px;
  background: var(--panel);
  overflow: hidden;
  max-width: 560px;

  &__topo {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 12px 14px;
    background: var(--clay-s);
    border-bottom: 1px solid var(--clay-l);
    flex-wrap: wrap;
  }

  &__ponto {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--clay);
    flex: none;
  }

  &__selo {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--clay);
  }

  &__modelo {
    font: 400 12.5px/1 $mono;
    color: var(--ink3);
    margin-left: auto;
  }

  &__corpo {
    padding: 14px;
  }

  &__texto {
    margin: 0 0 6px;
    font-size: 14px;
    color: var(--ink);
  }

  &__tecnico {
    font: 400 12.5px/1.6 $mono;
    color: var(--ink3);
    margin-bottom: 14px;
  }
}

.acoes {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  &__nota {
    font-size: 12px;
    color: var(--ink3);
  }
}
</style>
