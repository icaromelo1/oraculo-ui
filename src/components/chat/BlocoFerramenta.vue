<template>
  <div class="bloco" :class="classesBloco">
    <div class="bloco__topo" :class="{ 'bloco__topo--separado': temCorpo }">
      <i v-if="ferramenta.status === 'executando'" class="bloco__giro" aria-hidden="true" />
      <span v-else class="bloco__marcador" :class="`bloco__marcador--${ferramenta.status}`">
        {{ marcador }}
      </span>

      <span class="bloco__nome" :class="`bloco__nome--${ferramenta.nome}`">{{
        ferramenta.nome
      }}</span>
      <span class="bloco__arg">{{ ferramenta.argumento }}</span>

      <div class="bloco__espacador" />

      <span v-if="ferramenta.aprovadaPor" class="bloco__aprovacao">
        aprovado por {{ ferramenta.aprovadaPor }}
      </span>
      <span v-if="ferramenta.metrica" class="bloco__metrica" :class="metricaClasse">
        {{ ferramenta.metrica }}
      </span>
    </div>

    <div v-if="ferramenta.status === 'executando'" class="bloco__progresso" aria-hidden="true">
      <span />
    </div>

    <div v-if="ferramenta.progresso" class="bloco__detalhe">{{ ferramenta.progresso }}</div>

    <template v-if="ferramenta.resultadoSql">
      <pre class="bloco__sql">{{ ferramenta.resultadoSql.sql }}</pre>

      <div class="bloco__tabela">
        <table>
          <thead>
            <tr>
              <th
                v-for="coluna in ferramenta.resultadoSql.colunas"
                :key="coluna.campo"
                :class="{ 'ao-fim': coluna.alinhar === 'direita' }"
              >
                {{ coluna.titulo }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(linha, indice) in ferramenta.resultadoSql.linhas" :key="indice">
              <td
                v-for="coluna in ferramenta.resultadoSql.colunas"
                :key="coluna.campo"
                :class="[
                  { 'ao-fim': coluna.alinhar === 'direita' },
                  classeValor(coluna.campo, linha[coluna.campo] ?? ''),
                ]"
              >
                {{ linha[coluna.campo] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bloco__rodape">{{ ferramenta.resultadoSql.rodape }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Ferramenta } from '@/types/oraculo';

const props = defineProps<{ ferramenta: Ferramenta }>();

const temCorpo = computed(
  () => Boolean(props.ferramenta.resultadoSql) || Boolean(props.ferramenta.progresso),
);

const marcador = computed(() => {
  switch (props.ferramenta.status) {
    case 'concluida':
      return props.ferramenta.resultadoSql ? '▾' : '▸';
    case 'na_fila':
      return '·';
    case 'bloqueada':
      return '✕';
    default:
      return '▸';
  }
});

const classesBloco = computed(() => ({
  'bloco--aviso': Boolean(props.ferramenta.aprovadaPor),
  'bloco--ativo': props.ferramenta.status === 'executando',
  'bloco--fila': props.ferramenta.status === 'na_fila',
}));

const metricaClasse = computed(() => ({
  'bloco__metrica--ativo': props.ferramenta.status === 'executando',
}));

function classeValor(campo: string, valor: string) {
  if (campo !== 'status') return '';
  if (valor === 'RETRY') return 'tom-aviso';
  if (valor === 'ERRO') return 'tom-erro';
  return '';
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.bloco {
  border: 1px solid var(--line);
  border-radius: 3px;
  background: var(--panel);
  overflow: hidden;

  &--aviso {
    border-color: var(--warn-l);
  }

  &--ativo {
    border-color: var(--acc-l);
  }

  &--fila {
    border-style: dashed;
    opacity: 0.55;
  }

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 9px;
    cursor: pointer;

    &--separado {
      border-bottom: 1px solid var(--line);
    }
  }

  &__marcador {
    color: var(--txt3);
    font-size: 10px;

    &--concluida {
      color: var(--txt3);
    }
  }

  &__giro {
    width: 10px;
    height: 10px;
    border: 1.5px solid var(--acc);
    border-top-color: transparent;
    border-radius: 50%;
    animation: ospin 0.7s linear infinite;
    flex: none;
  }

  &__nome {
    @include mono(11.5px, 500);

    &--buscar_conhecimento {
      color: var(--blue);
    }

    &--ler_arquivo {
      color: var(--green);
    }

    &--consultar_banco {
      color: var(--gold);
    }

    &--ler_documento {
      color: var(--gray);
    }

    &--estado_servicos {
      color: var(--warn);
    }
  }

  &__arg {
    @include mono(11.5px, 400);
    color: var(--txt2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__espacador {
    flex: 1;
  }

  &__aprovacao {
    @include mono(10.5px, 400);
    color: var(--warn);
  }

  &__metrica {
    @include mono(10.5px, 400);
    color: var(--txt3);

    &--ativo {
      color: var(--acc);
    }
  }

  &__progresso {
    height: 2px;
    background: var(--panel3);
    overflow: hidden;

    span {
      display: block;
      width: 33%;
      height: 100%;
      background: var(--acc);
      animation: obar 1.4s ease-in-out infinite;
    }
  }

  &__detalhe {
    @include mono(11px, 400, 1.7);
    padding: 6px 9px;
    color: var(--txt3);
  }

  &__sql {
    @include mono(11.5px, 400, 1.65);
    margin: 0;
    padding: 9px 11px;
    background: var(--bg);
    color: var(--txt2);
    overflow-x: auto;
    border-bottom: 1px solid var(--line);
    white-space: pre-wrap;
  }

  &__tabela {
    overflow-x: auto;

    table {
      @include mono(11.5px, 400);
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 5px 11px;
      color: var(--txt3);
      font-weight: 500;
      border-bottom: 1px solid var(--line);
      background: var(--panel2);
    }

    td {
      padding: 5px 11px;
      color: var(--txt2);
    }

    .ao-fim {
      text-align: right;
      color: var(--txt);
    }

    .tom-aviso {
      color: var(--warn);
    }

    .tom-erro {
      color: var(--err);
    }
  }

  &__rodape {
    @include mono(10.5px, 400);
    padding: 5px 11px;
    color: var(--txt3);
    background: var(--panel2);
  }
}
</style>
