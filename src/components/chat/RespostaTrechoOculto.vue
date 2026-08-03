<template>
  <div>
    <CabecalhoResposta meta="2 ferramentas · 1,4 s · 3 fontes">
      <template #extra>
        <span class="selo">1 trecho ocultado</span>
      </template>
    </CabecalhoResposta>

    <div class="corpo">
      <p>
        A conexão do worker com a SEFAZ é montada a partir do segredo
        <code class="o-code">fiscal/sefaz-mtls</code> no Vault, lido no boot do serviço
        <ChipCitacao fonte-id="c1" tipo="codigo" rotulo="código · SefazClient.java:41" />.
      </p>

      <p>
        O certificado em uso vence em 12/09/2026 e a senha do keystore está no bloco abaixo do
        arquivo de configuração:
      </p>

      <div class="oculto">
        <pre class="oculto__trecho">sefaz.keystore.path=/etc/dsg/sefaz/keystore.p12
sefaz.keystore.pass=<span class="oculto__mascara">████████████</span>
sefaz.timeout.ms=30000</pre>
        <div class="oculto__nota">
          <span>1 valor ocultado pela política <b>mascarar-credenciais</b> (LGPD/SEC-04)</span>
          <div class="oculto__espacador" />
          <button type="button">solicitar liberação</button>
        </div>
      </div>

      <p>
        O timeout de 30 s configurado aqui é exatamente o limite que aparece nas quedas de conexão
        <ChipCitacao fonte-id="c3" tipo="banco" rotulo="banco · fiscal_prod.lote" /> — provavelmente
        é aí que os lotes começam a reprocessar.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ChipCitacao from '@/components/chat/ChipCitacao.vue';
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.selo {
  @include mono(10.5px, 500);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 7px;
  border-radius: 3px;
  border: 1px solid var(--gold-l);
  background: var(--gold-b);
  color: var(--gold);
}

.corpo {
  font-size: 14px;
  color: var(--txt);
  max-width: 76ch;
  text-wrap: pretty;

  p {
    margin: 0 0 11px;
  }
}

.oculto {
  border: 1px solid var(--gold-l);
  border-radius: 3px;
  background: var(--panel);
  overflow: hidden;
  margin-bottom: 11px;

  &__trecho {
    @include mono(12px, 400, 1.7);
    margin: 0;
    padding: 9px 11px;
    color: var(--txt2);
    background: var(--bg);
    white-space: pre-wrap;
  }

  &__mascara {
    background: var(--gold-b);
    border: 1px solid var(--gold-l);
    border-radius: 2px;
    color: var(--gold);
    padding: 0 5px;
    letter-spacing: 0.16em;
  }

  &__nota {
    @include mono(11px, 400, 1.4);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 6px 11px;
    background: var(--gold-b);
    border-top: 1px solid var(--gold-l);
    color: var(--gold);

    b {
      font-weight: 600;
    }

    button {
      background: none;
      border: 1px solid var(--gold-l);
      border-radius: 3px;
      color: var(--gold);
      padding: 3px 8px;
      font: inherit;
      cursor: pointer;

      &:hover {
        filter: brightness(1.25);
      }
    }
  }

  &__espacador {
    flex: 1;
  }
}
</style>
