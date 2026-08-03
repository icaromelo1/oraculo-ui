<template>
  <div>
    <CabecalhoResposta tom-erro meta="interrompido em 68 % da resposta" />

    <div class="cartao">
      <div class="cartao__topo">
        <span class="cartao__selo">modelo indisponível</span>
        <span class="cartao__alvo">{{ sessao.modelo.nome }} · gpu-02</span>
        <div class="cartao__espacador" />
        <span class="cartao__hora">14:31:07</span>
      </div>

      <pre class="cartao__log">
POST /v1/chat/completions → 503 upstream_unavailable
trace 9f2c-41ab · cuda oom após 2 480 tok · tentativa 2 de 2</pre>

      <div class="cartao__corpo">
        <p class="cartao__texto">
          As 4 ferramentas já executaram e as evidências estão preservadas — só a redação da
          resposta caiu. Retomar não vai repetir a consulta ao banco.
        </p>

        <div class="acoes">
          <button class="o-btn o-btn--primary" type="button">retomar do ponto</button>
          <button class="o-btn o-btn--neutral" type="button">usar oraculo-8b (gpu-01)</button>
          <button class="o-btn o-btn--ghost" type="button">ver evidências coletadas</button>
          <span class="acoes__fila">fila do gpu-02: 3 sessões</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import { useSessaoStore } from '@/stores/sessao';

const sessao = useSessaoStore();
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

  &__espacador {
    flex: 1;
  }

  &__hora {
    @include mono(11px, 400);
    color: var(--txt3);
  }

  &__log {
    @include mono(11.5px, 400, 1.65);
    margin: 0;
    padding: 9px 11px;
    background: var(--bg);
    border-bottom: 1px solid var(--line);
    color: var(--txt2);
    overflow-x: auto;
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

  &__fila {
    @include mono(11px, 400);
    color: var(--txt3);
    margin-left: auto;
  }
}
</style>
