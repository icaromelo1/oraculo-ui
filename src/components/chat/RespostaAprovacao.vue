<template>
  <div>
    <CabecalhoResposta tom="neutro" meta="avaliando política de acesso" />

    <p class="intro">Esta ação é sensível e passou por uma checagem de política antes de rodar.</p>

    <div v-if="pedido" class="cartao">
      <div class="cartao__topo">
        <i class="cartao__ponto" aria-hidden="true" />
        <span class="cartao__selo">aprovação necessária</span>
        <span class="cartao__alvo">{{ pedido.comando }} · {{ pedido.alvo }}</span>
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
  font-size: 15px;
  color: var(--ink);
  max-width: 68ch;
  margin: 0 0 14px;
}

.cartao {
  border: 1px solid var(--amber-l);
  border-radius: 12px;
  background: var(--panel);
  overflow: hidden;
  max-width: 560px;

  &__topo {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    padding: 11px 14px;
    background: var(--amber-s);
    border-bottom: 1px solid var(--amber-l);
  }

  &__ponto {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--amber);
    flex: none;
  }

  &__selo {
    font-size: 13px;
    font-weight: 600;
    color: var(--amber);
  }

  &__alvo {
    font: 400 12.5px/1 $mono;
    color: var(--ink2);
  }

  &__prazo {
    font-size: 12px;
    color: var(--ink3);
    margin-left: auto;
  }

  &__corpo {
    padding: 14px;
  }
}

.grade {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 9px;
  overflow: hidden;
  margin-bottom: 14px;

  &__celula {
    background: var(--panel2);
    padding: 9px 11px;
  }

  &__chave {
    font-size: 11.5px;
    color: var(--ink3);
    margin-bottom: 3px;
  }

  &__valor {
    font-size: 12.5px;
    color: var(--ink2);
  }
}

.acoes {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  &__aprovar {
    font: 600 13px/1 $sans;
    background: var(--amber);
    color: var(--onaccent);
    border: none;
    border-radius: 8px;
    padding: 8px 14px;
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__nota {
    font-size: 12px;
    line-height: 1.5;
    color: var(--ink3);
  }
}
</style>
