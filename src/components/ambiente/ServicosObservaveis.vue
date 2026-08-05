<template>
  <div class="bloco">
    <div class="bloco__topo">
      <span class="rotulo-secao">serviços observáveis</span>
      <span class="bloco__nota">
        esta lista é o que eu enxergo ao diagnosticar: containers e portas em escuta que não
        estiverem aqui somem da resposta, e o dono de uma porta não cadastrada aparece como
        <code>[não cadastrado]</code>.
      </span>
    </div>

    <p v-if="!ligada" class="mensagem mensagem--aviso">
      a capacidade <strong>Diagnosticar o servidor</strong> está desligada — enquanto ela ficar
      assim, nenhum serviço é lido nem cadastrado.
    </p>

    <template v-else>
      <p v-if="servicos.length === 0" class="mensagem">
        nenhum serviço cadastrado — sem nada aqui, o inventário do servidor volta vazio.
      </p>

      <div v-else class="lista">
        <div v-for="servico in servicos" :key="servico.id" class="item">
          <span class="item__rotulo">{{ servico.rotulo }}</span>
          <span class="item__nome">{{ servico.nome }}</span>
          <span class="item__meta">desde {{ formatarQuando(servico.criadoEm) }}</span>

          <button
            v-if="confirmando === servico.id"
            class="o-btn o-btn--ghost item__perigo"
            type="button"
            :disabled="removendo === servico.id"
            @click="void remover(servico.id)"
          >
            {{ removendo === servico.id ? 'removendo…' : 'confirmar' }}
          </button>
          <button
            v-else
            class="o-btn o-btn--ghost"
            type="button"
            :disabled="removendo !== null"
            @click="pedirConfirmacao(servico.id)"
          >
            remover
          </button>
        </div>
      </div>

      <p v-if="erroRemocao" class="mensagem mensagem--erro" role="alert">{{ erroRemocao }}</p>

      <form class="formulario" @submit.prevent="void cadastrar()">
        <div class="formulario__linha">
          <input
            v-model="nome"
            class="o-field formulario__mono"
            type="text"
            maxlength="63"
            placeholder="nome do container ou processo — ex.: oraculo-api"
            :disabled="cadastrando"
          />
          <input
            v-model="rotulo"
            class="o-field"
            type="text"
            maxlength="120"
            placeholder="Como você chama esse serviço"
            :disabled="cadastrando"
          />
          <button class="o-btn o-btn--primary" type="submit" :disabled="cadastrando || !preenchido">
            {{ cadastrando ? 'cadastrando…' : 'cadastrar' }}
          </button>
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
import { criarServico, removerServico, type ServicoResumido } from '@/services/ambiente.service';
import { mensagemDoErro } from '@/services/http';

defineProps<{
  servicos: ServicoResumido[];
  ligada: boolean;
}>();

const emit = defineEmits<{ mudou: [] }>();

const nome = ref('');
const rotulo = ref('');
const cadastrando = ref(false);
const erroCadastro = ref('');
const feito = ref('');
const confirmando = ref<string | null>(null);
const removendo = ref<string | null>(null);
const erroRemocao = ref('');

const preenchido = computed(() => nome.value.trim().length > 0 && rotulo.value.trim().length > 0);

function pedirConfirmacao(id: string): void {
  erroRemocao.value = '';
  confirmando.value = id;
}

async function cadastrar(): Promise<void> {
  if (cadastrando.value || !preenchido.value) return;

  cadastrando.value = true;
  erroCadastro.value = '';
  feito.value = '';

  try {
    const servico = await criarServico(nome.value.trim(), rotulo.value.trim());

    feito.value = `"${servico.nome}" agora entra no inventário do diagnóstico`;
    nome.value = '';
    rotulo.value = '';
    emit('mudou');
  } catch (falha) {
    erroCadastro.value = mensagemDoErro(falha, 'não consegui cadastrar esse serviço');
  } finally {
    cadastrando.value = false;
  }
}

async function remover(id: string): Promise<void> {
  if (removendo.value) return;

  removendo.value = id;
  erroRemocao.value = '';

  try {
    await removerServico(id);
    confirmando.value = null;
    emit('mudou');
  } catch (falha) {
    erroRemocao.value = mensagemDoErro(falha, 'não consegui remover esse serviço');
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

    code {
      font: 400 11.5px/1 $mono;
    }
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
  padding: 8px 0;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;

  &__rotulo {
    font-size: 13px;
    font-weight: 500;
    min-width: 130px;
  }

  &__nome {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    flex: 1;
    word-break: break-all;
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

.formulario {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__linha {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;

    .o-field {
      flex: 1;
      min-width: 190px;
    }
  }

  &__mono {
    font: 400 12.5px/1.5 $mono;
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

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
