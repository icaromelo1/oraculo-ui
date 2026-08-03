<template>
  <div>
    <CabecalhoResposta meta="pausado · aguardando você" />

    <p class="intro">
      Para confirmar se o consumidor já está pausado eu preciso ler o estado da fila no barramento
      de produção. Essa é uma ação sensível: revise o comando literal antes de liberar.
    </p>

    <div class="cartao">
      <div class="cartao__topo">
        <span class="cartao__selo">aprovação necessária</span>
        <span class="cartao__alvo">shell · alvo bus-prod-02</span>
        <div class="cartao__espacador" />
        <span class="cartao__prazo">expira em 04:38</span>
      </div>

      <div class="cartao__corpo">
        <div class="o-caps">comando literal</div>
        <pre class="comando">
ssh ops@bus-prod-02 \
  'rabbitmqctl list_consumers -p fiscal | grep nfe.lote.retry'</pre>

        <div class="grade">
          <div v-for="campo in campos" :key="campo.chave" class="grade__celula">
            <div class="grade__chave">{{ campo.chave }}</div>
            <div class="grade__valor">{{ campo.valor }}</div>
          </div>
        </div>

        <div class="acoes">
          <button class="acoes__aprovar" type="button">aprovar e executar</button>
          <button class="o-btn o-btn--neutral" type="button">recusar</button>
          <button class="o-btn o-btn--ghost" type="button">editar comando</button>
          <label class="acoes__persistir">
            <input type="checkbox" />
            liberar comandos de leitura nesta sessão
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';

const campos = [
  { chave: 'quem executa', valor: 'oráculo como ops (leitura)' },
  { chave: 'efeito colateral', valor: 'nenhum · comando de leitura' },
  { chave: 'política', valor: 'shell-prod · aprovação por sessão' },
  { chave: 'registro', valor: 'vai para a auditoria com seu usuário' },
];
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

.comando {
  @include mono(12.5px, 400, 1.6);
  margin: 6px 0 11px;
  padding: 9px 11px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 3px;
  color: var(--txt);
  overflow-x: auto;
  white-space: pre-wrap;
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
    cursor: pointer;

    &:hover {
      filter: brightness(1.1);
    }
  }

  &__persistir {
    @include mono(11.5px, 400);
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--txt3);
    cursor: pointer;
    margin-left: auto;

    input {
      accent-color: var(--warn);
      margin: 0;
    }
  }
}
</style>
