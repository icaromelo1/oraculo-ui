<template>
  <div>
    <CabecalhoResposta meta="3 ferramentas · 1,9 s · 0 fontes relevantes" />

    <p class="intro">
      Não encontrei nada sobre isso na base.
      <span>Prefiro dizer isso a inferir um procedimento de produção.</span>
    </p>

    <div class="o-panel">
      <div class="cabecalho">onde eu procurei</div>

      <div class="varredura">
        <div v-for="linha in varredura" :key="linha.origem" class="varredura__linha">
          <span class="varredura__origem" :class="`varredura__origem--${linha.tom}`">
            {{ linha.origem }}
          </span>
          <span class="varredura__alvo">{{ linha.alvo }}</span>
          <span class="varredura__saldo">{{ linha.saldo }}</span>
        </div>
      </div>

      <div class="caminhos">
        <div class="o-caps">caminhos possíveis</div>
        <div class="caminhos__texto">
          <div>
            O tema mais próximo indexado é <a href="#">retenção de lotes por competência</a> — 3
            documentos, autoria da equipe fiscal.
          </div>
          <div>
            Quem mexeu em expurgo por último, pelo histórico de commits:
            <span class="caminhos__nome">t.aguiar</span>,
            <span class="caminhos__nome">l.freitas</span>.
          </div>
        </div>
        <div class="caminhos__acoes">
          <button class="o-btn o-btn--neutral" type="button">abrir pedido de curadoria</button>
          <button class="o-btn o-btn--ghost" type="button">buscar só em código</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';

const varredura = [
  {
    origem: 'documentação',
    tom: 'doc',
    alvo: '"rotina de expurgo lote fiscal 2019"',
    saldo: '0 de 4 210 docs',
  },
  {
    origem: 'conhecimento curado',
    tom: 'curado',
    alvo: 'tags: expurgo, fiscal, retenção',
    saldo: '0 de 318 notas',
  },
  {
    origem: 'código',
    tom: 'codigo',
    alvo: 'grep "expurgo|purge" em 41 repos',
    saldo: '2 falsos positivos',
  },
  {
    origem: 'banco',
    tom: 'nulo',
    alvo: 'não consultado — sem tabela candidata',
    saldo: '—',
  },
];
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.intro {
  font-size: 14px;
  color: var(--txt);
  max-width: 76ch;
  margin: 0 0 12px;
  text-wrap: pretty;

  span {
    color: var(--txt2);
  }
}

.cabecalho {
  @include caps;
  padding: 7px 11px;
  background: var(--panel2);
  border-bottom: 1px solid var(--line);
}

.varredura {
  display: flex;
  flex-direction: column;

  &__linha {
    @include mono(11.5px, 400);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 11px;

    & + & {
      border-top: 1px solid var(--line);
    }
  }

  &__origem {
    width: 150px;
    flex: none;

    &--doc {
      color: var(--blue);
    }

    &--curado {
      color: var(--gray);
    }

    &--codigo {
      color: var(--green);
    }

    &--nulo {
      color: var(--txt3);
    }
  }

  &__alvo {
    color: var(--txt2);
    flex: 1;
  }

  &__saldo {
    color: var(--txt3);
  }
}

.caminhos {
  padding: 10px 11px;
  border-top: 1px solid var(--line);
  background: var(--panel2);

  &__texto {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12.5px;
    color: var(--txt2);
    margin-top: 7px;
  }

  &__nome {
    @include mono(12px, 400);
    color: var(--txt);
  }

  &__acoes {
    display: flex;
    gap: 7px;
    margin-top: 10px;
  }
}
</style>
