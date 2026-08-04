<template>
  <div class="pagina">
    <div class="pagina__coluna">
      <div class="titulo">
        <h1>Perfis e capacidades</h1>
        <span>{{ perfis.length }} perfis · {{ colunas.length }} capacidades · dados fixos</span>
      </div>

      <p class="explicacao">
        Esta tela ainda mostra dados fixos de exemplo — o backend não tem uma rota de perfis e
        matriz de capacidades. Uma capacidade desligada nesta instalação não pode ser concedida a
        nenhum perfil — a coluna aparece inteira em cinza.
      </p>

      <div class="legenda">
        <span><i class="tom-ok">✓</i>permitido</span>
        <span><i class="tom-aviso">⚠</i>requer aprovação humana</span>
        <span><i class="tom-erro">✕</i>negado ao perfil</span>
        <span class="fraco"><i>○</i>desligada nesta instalação</span>
        <div class="legenda__espacador" />
        <button class="o-btn o-btn--neutral" type="button">salvar alterações</button>
      </div>

      <div class="o-panel">
        <div class="tabela">
          <table>
            <thead>
              <tr>
                <th class="tabela__perfil">perfil</th>
                <th
                  v-for="coluna in colunas"
                  :key="coluna.id"
                  :class="`tabela__cap tabela__cap--${coluna.cor}`"
                >
                  {{ coluna.titulo }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="perfil in perfis"
                :key="perfil.id"
                :class="{ 'linha--voce': perfil.id === 'n2' }"
              >
                <td class="tabela__perfil">
                  <div class="tabela__nome">{{ perfil.nome }}</div>
                  <div class="tabela__usuarios">{{ perfil.descricao }}</div>
                </td>
                <td
                  v-for="coluna in colunas"
                  :key="coluna.id"
                  class="celula"
                  :class="[`celula--${status(coluna.id, perfil.id)}`]"
                >
                  {{ simbolo(status(coluna.id, perfil.id)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="cartoes">
        <div class="o-panel">
          <div class="cartoes__topo">
            <span class="o-caps">capacidade selecionada</span>
            <span class="cartoes__alvo">{{ detalhe.titulo }}</span>
          </div>
          <div class="cartoes__corpo">
            <label
              v-for="opcao in detalhe.opcoes"
              :key="opcao.id"
              class="opcao"
              :class="{ 'opcao--ativa': opcao.id === detalhe.escolhida }"
            >
              <input
                type="radio"
                name="capacidade"
                :value="opcao.id"
                :checked="opcao.id === detalhe.escolhida"
                :class="`opcao__radio opcao__radio--${opcao.tom}`"
              />
              {{ opcao.rotulo }}
            </label>

            <div class="detalhes">
              <div v-for="item in detalhe.detalhes" :key="item.chave">
                {{ item.chave }}:
                <span :class="item.destaque ? 'destaque' : 'valor'">{{ item.valor }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="o-panel">
          <div class="cartoes__topo">
            <span class="o-caps">capacidades desta instalação</span>
          </div>
          <div class="instalacao">
            <div v-for="item in capacidadesFixas" :key="item.rotulo" class="instalacao__linha">
              <span class="instalacao__rotulo">{{ item.rotulo }}</span>
              <span class="instalacao__estado" :class="{ 'tom-ok': item.ligada }">{{
                item.estado
              }}</span>
              <button v-if="item.acao" class="o-btn" type="button">{{ item.acao }}</button>
              <span v-else class="instalacao__travada">bloqueado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CAPACIDADES_FIXAS,
  COLUNAS_MATRIZ,
  DETALHE_CAPACIDADE,
  MATRIZ,
  PERFIS,
} from './perfis-fixos';
import type { StatusCapacidade } from '@/types/oraculo';

const perfis = PERFIS;
const colunas = COLUNAS_MATRIZ;
const detalhe = DETALHE_CAPACIDADE;
const capacidadesFixas = CAPACIDADES_FIXAS;

function status(capacidade: string, perfil: string): StatusCapacidade {
  const linha = MATRIZ.find((item) => item.capacidade === capacidade);
  if (!linha) return 'negada';
  if (linha.desligadaNaInstalacao) return 'desligada';
  return linha.porPerfil[perfil] ?? 'negada';
}

function simbolo(valor: StatusCapacidade) {
  switch (valor) {
    case 'permitida':
      return '✓';
    case 'aprovacao':
      return '⚠';
    case 'desligada':
      return '○';
    default:
      return '✕';
  }
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
    max-width: 1250px;
    margin: 0 auto;
  }
}

.titulo {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
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

.explicacao {
  margin: 0 0 14px;
  color: var(--txt2);
  font-size: 12.5px;
  max-width: 80ch;
  text-wrap: pretty;
}

.legenda {
  @include mono(11.5px, 400);
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 8px 11px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--panel);
  color: var(--txt2);

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  i {
    font-style: normal;
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
    padding: 8px 9px;
    font-weight: 500;
    border-bottom: 1px solid var(--line);
    background: var(--panel2);
    min-width: 96px;
  }

  &__perfil {
    text-align: left;
    padding: 8px 11px;
    border-right: 1px solid var(--line);
    min-width: 190px;
    color: var(--txt3);
  }

  &__cap {
    &--doc {
      color: var(--blue);
    }

    &--curado {
      color: var(--gray);
    }

    &--codigo {
      color: var(--green);
    }

    &--banco {
      color: var(--gold);
    }

    &--shell {
      color: var(--txt3);
    }

    &--servico {
      color: var(--txt2);
    }

    &--inferencia {
      color: var(--err);
    }
  }

  &__nome {
    color: var(--txt);
    font-weight: 500;
  }

  &__usuarios {
    color: var(--txt3);
    font-size: 10.5px;
  }

  td {
    border-bottom: 1px solid var(--line);
    padding: 9px;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.linha--voce {
  background: var(--sel);
}

.celula {
  text-align: center;

  &--permitida {
    color: var(--green);
  }

  &--aprovacao {
    color: var(--warn);
  }

  &--negada {
    color: var(--err);
  }

  &--desligada {
    color: var(--txt3);
    background: var(--panel2);
  }
}

.cartoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
  margin-top: 12px;

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 11px;
    border-bottom: 1px solid var(--line);
    background: var(--panel2);
  }

  &__alvo {
    @include mono(11.5px, 500);
    color: var(--gold);
  }

  &__corpo {
    padding: 11px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

.opcao {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--txt2);
  cursor: pointer;

  &--ativa {
    color: var(--txt);
  }

  &__radio {
    margin: 0;

    &--acc {
      accent-color: var(--acc);
    }

    &--warn {
      accent-color: var(--warn);
    }

    &--err {
      accent-color: var(--err);
    }
  }
}

.detalhes {
  @include mono(11.5px, 400, 1.5);
  border-top: 1px solid var(--line);
  margin-top: 3px;
  padding-top: 9px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--txt2);

  .valor {
    color: var(--txt);
  }

  .destaque {
    color: var(--gold);
  }
}

.instalacao {
  display: flex;
  flex-direction: column;

  &__linha {
    @include mono(11.5px, 400);
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 11px;

    & + & {
      border-top: 1px solid var(--line);
    }
  }

  &__rotulo {
    color: var(--txt);
    flex: 1;
  }

  &__estado {
    color: var(--txt3);
  }

  &__travada {
    color: var(--txt3);
    opacity: 0.6;
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

.fraco {
  color: var(--txt3);
}
</style>
