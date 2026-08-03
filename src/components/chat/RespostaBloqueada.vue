<template>
  <div>
    <CabecalhoResposta meta="1 ferramenta bloqueada · 0,3 s" />

    <p class="intro">
      Consigo responder a parte técnica, mas a pergunta pede o contato do responsável de plantão —
      isso vem de um dado que seu perfil não alcança.
    </p>

    <div class="cartao">
      <div class="cartao__topo">
        <span class="cartao__selo">ação bloqueada</span>
        <span class="cartao__alvo">consultar_banco · rh_prod.plantao</span>
        <div class="cartao__espacador" />
        <span class="cartao__estado">não executada</span>
      </div>

      <div class="cartao__corpo">
        <div class="explicacao">
          capacidade <b>dados de pessoal</b> está <b class="explicacao--negada">negada</b> para o
          perfil <b>{{ sessao.perfil }}</b> nesta instalação (DSG).
        </div>

        <div class="grade">
          <div class="grade__celula">
            <div class="grade__chave">regra</div>
            <div class="grade__valor">perfil.suporte_n2 → deny(dados_pessoal)</div>
          </div>
          <div class="grade__celula">
            <div class="grade__chave">quem libera</div>
            <div class="grade__valor">admin da instalação · t.aguiar</div>
          </div>
        </div>

        <div class="acoes">
          <button class="o-btn o-btn--neutral" type="button">solicitar acesso</button>
          <button class="o-btn o-btn--ghost" type="button">ver política do perfil</button>
        </div>
      </div>
    </div>

    <p class="fecho">
      O que eu <b>posso</b> dizer: a escala de plantão do barramento é publicada no calendário da
      equipe de plataforma e o canal de acionamento é
      <code class="o-code">#plantao-plataforma</code>
      <ChipCitacao fonte-id="c2" tipo="doc" rotulo="doc · Plantão §1" />.
    </p>
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ChipCitacao from '@/components/chat/ChipCitacao.vue';
import { useSessaoStore } from '@/stores/sessao';

const sessao = useSessaoStore();
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
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
}

.explicacao {
  @include mono(11.5px, 400, 1.6);
  color: var(--txt2);

  b {
    color: var(--txt);
    font-weight: 600;
  }

  &--negada {
    color: var(--err);
  }
}

.grade {
  display: flex;
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 3px;
  overflow: hidden;
  flex-wrap: wrap;

  &__celula {
    background: var(--panel2);
    padding: 7px 10px;
    flex: 1;
    min-width: 150px;
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
  gap: 7px;
}

.fecho {
  font-size: 14px;
  color: var(--txt);
  max-width: 76ch;
  margin: 0;
  text-wrap: pretty;

  b {
    font-weight: 600;
  }
}
</style>
