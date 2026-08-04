<template>
  <div>
    <CabecalhoResposta meta="avaliando política de acesso" />

    <p class="intro">Esta ação é sensível e passou por uma checagem de política antes de rodar.</p>

    <div v-if="pedido" class="cartao">
      <div class="cartao__topo">
        <span class="cartao__selo">aprovação necessária</span>
        <span class="cartao__alvo">{{ pedido.comando }} · {{ pedido.alvo }}</span>
        <div class="cartao__espacador" />
        <span class="cartao__prazo">expira {{ formatarHora(pedido.expiraEm) }}</span>
      </div>

      <div class="cartao__corpo">
        <div class="grade">
          <div class="grade__celula">
            <div class="grade__chave">efeito colateral</div>
            <div class="grade__valor">{{ pedido.efeitoColateral }}</div>
          </div>
          <div class="grade__celula">
            <div class="grade__chave">política</div>
            <div class="grade__valor">{{ pedido.politica }}</div>
          </div>
        </div>

        <div class="acoes">
          <button class="acoes__aprovar" type="button" disabled>aprovar e executar</button>
          <button class="o-btn o-btn--neutral" type="button" disabled>recusar</button>
          <span class="acoes__nota">
            aprovação interativa ainda não existe nesta fase do oráculo — a política decide sozinha
            e a ferramenta não roda.
          </span>
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

const pedido = computed(() => props.mensagem.aprovacaoPedido);

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.intro {
  font-size: 14px;
  color: var(--txt);
  max-width: 76ch;
  margin: 0 0 12px;
}

.cartao {
  border: 1px solid var(--warn-l);
  border-radius: 4px;
  background: var(--panel);
  overflow: hidden;

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px 11px;
    background: var(--warn-b);
    border-bottom: 1px solid var(--warn-l);
  }

  &__selo {
    @include mono(10.5px, 600);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--warn);
  }

  &__alvo {
    @include mono(11px, 400);
    color: var(--txt2);
  }

  &__espacador {
    flex: 1;
  }

  &__prazo {
    @include mono(11px, 400);
    color: var(--txt3);
  }

  &__corpo {
    padding: 11px;
  }
}

.grade {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;

  &__celula {
    background: var(--panel2);
    padding: 7px 10px;
  }

  &__chave {
    @include mono(10px, 400);
    color: var(--txt3);
    margin-bottom: 3px;
  }

  &__valor {
    @include mono(11.5px, 400);
    color: var(--txt2);
  }
}

.acoes {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  &__aprovar {
    @include mono(11.5px, 600);
    background: var(--warn);
    color: var(--warn-on);
    border: none;
    border-radius: 3px;
    padding: 7px 12px;
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__nota {
    @include mono(10.5px, 400, 1.5);
    color: var(--txt3);
  }
}
</style>
