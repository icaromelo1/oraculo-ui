<template>
  <div>
    <CabecalhoResposta :meta="meta" />

    <div v-for="ferramenta in bloqueadas" :key="ferramenta.id" class="cartao">
      <div class="cartao__topo">
        <span class="cartao__selo">ação bloqueada</span>
        <span class="cartao__alvo">{{ ferramenta.nome }} · {{ ferramenta.argumento }}</span>
        <div class="cartao__espacador" />
        <span class="cartao__estado">não executada</span>
      </div>

      <div class="cartao__corpo">
        <div class="explicacao">
          {{ ferramenta.resultado || 'bloqueada pela política de acesso do perfil.' }}
        </div>
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
import type { MensagemAssistenteChat } from '@/stores/chat';

const props = defineProps<{ mensagem: MensagemAssistenteChat }>();

const bloqueadas = computed(() =>
  props.mensagem.ferramentas.filter((f) => f.status === 'bloqueada'),
);

const meta = computed(
  () =>
    `${bloqueadas.value.length} ferramenta(s) bloqueada(s) · ${formatarSegundos(props.mensagem.duracaoMs)}`,
);
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.cartao {
  border: 1px solid var(--err-l);
  border-radius: 4px;
  background: var(--panel);
  overflow: hidden;
  margin-bottom: 14px;

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

  &__espacador {
    flex: 1;
  }

  &__estado {
    @include mono(11px, 400);
    color: var(--txt3);
  }

  &__corpo {
    padding: 11px;
  }
}

.explicacao {
  @include mono(11.5px, 400, 1.6);
  color: var(--txt2);
}
</style>
