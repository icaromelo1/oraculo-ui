<template>
  <div class="bloco">
    <div class="bloco__topo">
      <span class="rotulo-secao">alvos de banco</span>
      <span class="bloco__nota">
        cada alvo é uma conexão que eu posso consultar. a string de conexão fica cifrada no servidor
        e nunca volta para esta tela — só este resumo volta.
      </span>
    </div>

    <p v-if="!ligada" class="mensagem mensagem--aviso">
      a capacidade <strong>Consultar banco de dados</strong> está desligada — por isso a lista vem
      vazia. ligue a capacidade acima para ver e cadastrar alvos.
    </p>

    <template v-else>
      <p v-if="alvos.length === 0" class="mensagem">
        nenhum alvo cadastrado — nenhuma consulta a banco é possível hoje.
      </p>

      <div v-else class="lista">
        <div v-for="alvo in alvos" :key="alvo.id" class="item">
          <div class="item__texto">
            <span class="item__nome">{{ alvo.nome }}</span>
            <span class="item__conexao">{{ descreverConexao(alvo.conexao) }}</span>
            <div class="item__etiquetas">
              <span v-for="schema in alvo.schemas" :key="`s-${schema}`" class="etiqueta">
                schema {{ schema }}
              </span>
              <span v-if="alvo.schemas.length === 0" class="etiqueta"> sem recorte de schema </span>
              <span
                v-for="coluna in alvo.colunasMascaradas"
                :key="`c-${coluna}`"
                class="etiqueta etiqueta--mascarada"
              >
                mascara {{ coluna }}
              </span>
            </div>
          </div>

          <span class="item__meta">desde {{ formatarQuando(alvo.criadoEm) }}</span>

          <button
            v-if="confirmando === alvo.id"
            class="o-btn o-btn--ghost item__perigo"
            type="button"
            :disabled="removendo === alvo.id"
            @click="void remover(alvo.id)"
          >
            {{ removendo === alvo.id ? 'removendo…' : 'confirmar' }}
          </button>
          <button
            v-else
            class="o-btn o-btn--ghost"
            type="button"
            :disabled="removendo !== null"
            @click="pedirConfirmacao(alvo.id)"
          >
            remover
          </button>
        </div>
      </div>

      <p v-if="erroRemocao" class="mensagem mensagem--erro" role="alert">{{ erroRemocao }}</p>

      <form class="formulario" @submit.prevent="void cadastrar()">
        <p class="mensagem mensagem--forte">
          aponte para um usuário Postgres somente-leitura, com <code>GRANT SELECT</code> e nada além
          disso. essa é a defesa que vale — o resto é segunda linha.
        </p>

        <div class="formulario__linha">
          <input
            v-model="nome"
            class="o-field formulario__mono"
            type="text"
            maxlength="120"
            placeholder="nome do alvo — precisa estar em BANCO_ALVOS no .env"
            :disabled="cadastrando"
          />
        </div>

        <div class="formulario__linha">
          <input
            v-model="url"
            class="o-field formulario__mono"
            type="password"
            autocomplete="off"
            placeholder="postgres://leitor:senha@host:5432/base"
            :disabled="cadastrando"
          />
        </div>

        <div class="formulario__linha">
          <input
            v-model="schemas"
            class="o-field formulario__mono"
            type="text"
            placeholder="schemas separados por vírgula (opcional)"
            :disabled="cadastrando"
          />
          <input
            v-model="colunasMascaradas"
            class="o-field formulario__mono"
            type="text"
            placeholder="colunas a mascarar, separadas por vírgula (opcional)"
            :disabled="cadastrando"
          />
        </div>

        <div class="formulario__rodape">
          <button class="o-btn o-btn--primary" type="submit" :disabled="cadastrando || !preenchido">
            {{ cadastrando ? 'cadastrando…' : 'cadastrar alvo' }}
          </button>
          <span class="mensagem">a string de conexão some daqui assim que é enviada</span>
        </div>

        <p v-if="erroCadastro" class="mensagem mensagem--erro" role="alert">{{ erroCadastro }}</p>
        <p v-else-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatarQuando } from './formato';
import {
  criarAlvoBanco,
  removerAlvoBanco,
  type AlvoBancoResumido,
  type NovoAlvoBanco,
  type ResumoConexao,
} from '@/services/ambiente.service';
import { mensagemDoErro } from '@/services/http';

defineProps<{
  alvos: AlvoBancoResumido[];
  ligada: boolean;
}>();

const emit = defineEmits<{ mudou: [] }>();

const nome = ref('');
const url = ref('');
const schemas = ref('');
const colunasMascaradas = ref('');
const cadastrando = ref(false);
const erroCadastro = ref('');
const feito = ref('');
const confirmando = ref<string | null>(null);
const removendo = ref<string | null>(null);
const erroRemocao = ref('');

const preenchido = computed(() => nome.value.trim().length > 0 && url.value.trim().length > 0);

function separarPorVirgula(bruto: string): string[] {
  return bruto
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function descreverConexao(conexao: ResumoConexao): string {
  const alvo = conexao.porta ? `${conexao.host}:${conexao.porta}` : conexao.host;

  return `${conexao.usuario}@${alvo}/${conexao.base}`;
}

function pedirConfirmacao(id: string): void {
  erroRemocao.value = '';
  confirmando.value = id;
}

async function cadastrar(): Promise<void> {
  if (cadastrando.value || !preenchido.value) return;

  cadastrando.value = true;
  erroCadastro.value = '';
  feito.value = '';

  const listaDeSchemas = separarPorVirgula(schemas.value);
  const listaDeColunas = separarPorVirgula(colunasMascaradas.value);

  const novo: NovoAlvoBanco = {
    nome: nome.value.trim(),
    url: url.value.trim(),
    ...(listaDeSchemas.length > 0 ? { schemas: listaDeSchemas } : {}),
    ...(listaDeColunas.length > 0 ? { colunasMascaradas: listaDeColunas } : {}),
  };

  try {
    const alvo = await criarAlvoBanco(novo);

    feito.value = `alvo "${alvo.nome}" cadastrado — a string de conexão foi cifrada no servidor`;
    nome.value = '';
    url.value = '';
    schemas.value = '';
    colunasMascaradas.value = '';
    emit('mudou');
  } catch (falha) {
    erroCadastro.value = mensagemDoErro(falha, 'não consegui cadastrar esse alvo');
  } finally {
    cadastrando.value = false;
  }
}

async function remover(id: string): Promise<void> {
  if (removendo.value) return;

  removendo.value = id;
  erroRemocao.value = '';

  try {
    await removerAlvoBanco(id);
    confirmando.value = null;
    emit('mudou');
  } catch (falha) {
    erroRemocao.value = mensagemDoErro(falha, 'não consegui remover esse alvo');
  } finally {
    removendo.value = null;
  }
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.bloco {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__topo {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__nota {
    font-size: 12.5px;
    color: var(--ink3);
  }
}

.rotulo-secao {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink2);
}

.lista {
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;

  &__texto {
    flex: 1;
    min-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__nome {
    font-size: 13px;
    font-weight: 500;
  }

  &__conexao {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    word-break: break-all;
  }

  &__etiquetas {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  &__meta {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
  }

  &__perigo {
    color: var(--clay);

    &:hover {
      color: var(--clay);
      border-color: var(--clay-l);
    }
  }
}

.etiqueta {
  font: 400 11px/1.6 $mono;
  color: var(--ink3);
  background: var(--panel3);
  border-radius: 5px;
  padding: 1px 6px;

  &--mascarada {
    color: var(--amber);
    background: var(--amber-s);
  }
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-top: 9px;
  border-top: 1px solid var(--line);

  &__linha {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;

    .o-field {
      flex: 1;
      min-width: 220px;
    }
  }

  &__mono {
    font: 400 12.5px/1.5 $mono;
  }

  &__rodape {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  code {
    font: 400 11.5px/1 $mono;
  }

  &--forte {
    color: var(--ink2);
    background: var(--amber-s);
    border-radius: 8px;
    padding: 8px 10px;
  }

  &--erro {
    color: var(--clay);
  }

  &--aviso {
    color: var(--amber);
  }

  &--ok {
    color: var(--sage);
  }
}
</style>
