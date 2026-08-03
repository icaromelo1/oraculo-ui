<template>
  <div class="pagina">
    <div class="pagina__coluna">
      <div class="titulo">
        <h1>Auditoria</h1>
        <span>instalação DSG · retenção 180 dias · exportação assinada</span>
      </div>

      <div class="resumo">
        <div v-for="cartao in resumo" :key="cartao.rotulo" class="resumo__cartao">
          <div class="resumo__rotulo">{{ cartao.rotulo }}</div>
          <div class="resumo__valor" :class="`resumo__valor--${cartao.tom}`">
            {{ cartao.valor }}
          </div>
        </div>
      </div>

      <div class="filtros">
        <input
          v-model="busca"
          class="filtros__busca"
          placeholder="buscar por usuário, pergunta, tabela, comando…"
        />
        <button class="o-btn" type="button">instalação: DSG ▾</button>
        <button class="o-btn" type="button">ferramenta: todas ▾</button>
        <button class="filtros__ativo" type="button">resultado: bloqueado ×</button>
        <button class="o-btn" type="button">03 ago · 00:00–14:40 ▾</button>
        <div class="filtros__espacador" />
        <button class="o-btn o-btn--neutral" type="button">exportar csv</button>
      </div>

      <div class="o-panel">
        <div class="tabela">
          <table>
            <thead>
              <tr>
                <th>hora</th>
                <th>usuário · perfil</th>
                <th>inst.</th>
                <th class="tabela__pergunta">pergunta</th>
                <th>ferramentas</th>
                <th class="ao-fim">fontes</th>
                <th>resultado</th>
                <th class="ao-fim">dur.</th>
                <th>modelo</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="registro in registrosVisiveis" :key="registro.id">
                <tr
                  class="linha"
                  :class="{ 'linha--aberta': registro.id === expandido }"
                  @click="alternar(registro)"
                >
                  <td class="sem-quebra">{{ registro.hora }}</td>
                  <td class="forte">
                    {{ registro.usuario }} <span class="fraco">{{ registro.perfil }}</span>
                  </td>
                  <td>{{ registro.instalacao }}</td>
                  <td>{{ registro.pergunta }}</td>
                  <td>
                    <span
                      v-for="ferramenta in registro.ferramentas"
                      :key="ferramenta.sigla"
                      class="sigla"
                      :class="[
                        `sigla--${ferramenta.tipo}`,
                        { 'sigla--bloqueada': ferramenta.bloqueada },
                      ]"
                    >
                      {{ ferramenta.sigla }}
                    </span>
                  </td>
                  <td class="ao-fim" :class="{ fraco: registro.fontes === 0 }">
                    {{ registro.fontes }}
                  </td>
                  <td :class="`tom-${registro.tomResultado}`">{{ registro.resultado }}</td>
                  <td class="ao-fim">{{ registro.duracao }}</td>
                  <td class="fraco">{{ registro.modelo }}</td>
                </tr>

                <tr v-if="registro.id === expandido && registro.trilha" class="linha--aberta">
                  <td colspan="9" class="detalhe">
                    <div class="detalhe__grade">
                      <div class="o-panel">
                        <div class="detalhe__titulo">trilha de execução</div>
                        <div class="detalhe__trilha">
                          <div v-for="(passo, indice) in registro.trilha" :key="indice">
                            {{ passo }}
                          </div>
                        </div>
                      </div>
                      <div class="o-panel">
                        <div class="detalhe__titulo">sql literal executado</div>
                        <pre class="detalhe__sql">{{ registro.sqlExecutado }}</pre>
                        <div class="detalhe__nota">{{ registro.notaSql }}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="paginacao">
          <span>{{ registrosVisiveis.length }} de 1 284 registros</span>
          <div class="filtros__espacador" />
          <button class="o-btn o-btn--ghost" type="button">← anteriores</button>
          <button class="o-btn o-btn--ghost" type="button">próximos →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { REGISTROS, RESUMO_AUDITORIA } from '@/mocks/auditoria';
import type { RegistroAuditoria } from '@/types/oraculo';

const resumo = RESUMO_AUDITORIA;
const busca = ref('');
const expandido = ref<string | null>('a1');

const registrosVisiveis = computed(() => {
  const alvo = busca.value.trim().toLowerCase();
  if (!alvo) return REGISTROS;
  return REGISTROS.filter((registro) =>
    [registro.usuario, registro.pergunta, registro.resultado, registro.perfil]
      .join(' ')
      .toLowerCase()
      .includes(alvo),
  );
});

function alternar(registro: RegistroAuditoria) {
  if (!registro.trilha) return;
  expandido.value = expandido.value === registro.id ? null : registro.id;
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.pagina {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 20px;

  &__coluna {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.titulo {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;

  h1 {
    margin: 0;
    font: 600 16px/1 $sans;
  }

  span {
    @include mono(11.5px, 400);
    color: var(--txt3);
  }
}

.resumo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;

  &__cartao {
    background: var(--panel);
    padding: 11px 13px;
  }

  &__rotulo {
    @include mono(10px, 400);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--txt3);
    margin-bottom: 6px;
  }

  &__valor {
    @include mono(20px, 600);
    color: var(--txt);

    &--erro {
      color: var(--err);
    }

    &--aviso {
      color: var(--warn);
    }
  }
}

.filtros {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  &__busca {
    @include mono(12px, 400, 1.2);
    flex: 1;
    min-width: 240px;
    background: var(--panel);
    border: 1px solid var(--line2);
    border-radius: 3px;
    padding: 6px 9px;
    color: var(--txt);
    outline: none;

    &:focus {
      border-color: var(--acc);
    }

    &::placeholder {
      color: var(--txt3);
    }
  }

  &__ativo {
    @include mono(11.5px, 500);
    background: var(--err-b);
    border: 1px solid var(--err-l);
    border-radius: 3px;
    color: var(--err);
    padding: 6px 9px;
    cursor: pointer;
  }

  &__espacador {
    flex: 1;
  }
}

.tabela {
  overflow-x: auto;

  table {
    @include mono(11.5px, 400, 1.4);
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    padding: 7px 10px;
    font-weight: 500;
    color: var(--txt3);
    border-bottom: 1px solid var(--line);
    background: var(--panel2);
    white-space: nowrap;
  }

  td {
    padding: 7px 10px;
    color: var(--txt2);
    border-bottom: 1px solid var(--line);
  }

  &__pergunta {
    min-width: 280px;
  }
}

.linha {
  cursor: pointer;

  &:hover {
    background: var(--panel2);
  }

  &--aberta {
    background: var(--sel);
  }
}

.ao-fim {
  text-align: right;
  color: var(--txt);
}

.forte {
  color: var(--txt);
}

.fraco {
  color: var(--txt3);
}

.sem-quebra {
  white-space: nowrap;
}

.sigla {
  margin-right: 5px;

  &--doc {
    color: var(--blue);
  }

  &--codigo {
    color: var(--green);
  }

  &--banco {
    color: var(--gold);
  }

  &--curado {
    color: var(--gray);
  }

  &--shell {
    color: var(--warn);
  }

  &--bloqueada {
    color: var(--err);
  }
}

.tom-ok {
  color: var(--green);
}

.tom-aviso {
  color: var(--warn);
}

.tom-erro {
  color: var(--err);
}

.tom-neutro {
  color: var(--txt2);
}

.detalhe {
  padding: 0 10px 10px;

  &__grade {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 10px;
  }

  &__titulo {
    @include caps;
    padding: 6px 9px;
    border-bottom: 1px solid var(--line);
  }

  &__trilha {
    @include mono(11px, 400, 1.5);
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    color: var(--txt2);
  }

  &__sql {
    @include mono(11px, 400, 1.6);
    margin: 0;
    padding: 7px 9px;
    color: var(--txt2);
    overflow-x: auto;
  }

  &__nota {
    @include mono(10.5px, 400);
    padding: 6px 9px;
    border-top: 1px solid var(--line);
    color: var(--txt3);
  }
}

.paginacao {
  @include mono(11px, 400);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-top: 1px solid var(--line);
  background: var(--panel2);
  color: var(--txt3);
}
</style>
