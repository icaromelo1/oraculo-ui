<template>
  <div>
    <CabecalhoResposta tom="neutro" :meta="meta" />

    <div v-for="ferramenta in bloqueadas" :key="ferramenta.id" class="cartao">
      <div class="cartao__topo">
        <i class="cartao__ponto" aria-hidden="true" />
        <span class="cartao__nome">{{ rotuloFerramenta(ferramenta.nome) }} — desligada</span>
      </div>

      <div v-if="ferramenta.argumento" class="cartao__comando">{{ ferramenta.argumento }}</div>

      <div class="cartao__explicacao">
        {{
          ferramenta.resultado ||
          'Esta ação foi bloqueada pela política de acesso desta instalação.'
        }}
      </div>
    </div>

    <RespostaMarkdown v-if="mensagem.texto" :texto="mensagem.texto" :fontes="mensagem.fontes" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import RespostaMarkdown from '@/components/chat/RespostaMarkdown.vue';
import { formatarSegundos } from '@/composables/useFormato';
import { rotuloFerramenta } from '@/composables/useRotuloFerramenta';
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();

const bloqueadas = computed(() =>
  props.mensagem.ferramentas.filter((f) => f.status === 'bloqueada'),
);

const meta = computed(
  () =>
    `precisei de uma capacidade que está desligada · ${formatarSegundos(props.mensagem.duracaoMs)}`,
);
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.cartao {
  border: 1px solid var(--line2);
  border-radius: 12px;
  background: var(--panel2);
  padding: 14px;
  max-width: 520px;
  margin-bottom: 16px;

  &__topo {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 9px;
  }

  &__ponto {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: 1.5px solid var(--line2);
    flex: none;
  }

  &__nome {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
  }

  &__comando {
    font: 400 12.5px/1.7 $mono;
    color: var(--ink2);
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 9px 11px;
    margin-bottom: 11px;
    overflow-x: auto;
  }

  &__explicacao {
    font-size: 13px;
    color: var(--ink2);
  }
}
</style>
