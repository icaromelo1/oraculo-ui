<template>
  <div class="fonte">
    <div class="fonte__linha">
      <input
        v-model="caminho"
        class="o-field"
        type="text"
        placeholder="/caminho/absoluto/da/pasta/no/servidor"
        :disabled="olhando"
        @keydown.enter.prevent="void verPrevia()"
      />
      <button
        class="o-btn o-btn--neutral"
        type="button"
        :disabled="olhando || caminho.trim().length === 0"
        @click="void verPrevia()"
      >
        {{ olhando ? 'olhando…' : 'ver prévia' }}
      </button>
    </div>

    <p class="fonte__dica">
      a pasta precisa estar dentro das raízes de leitura do <code>.env</code> desta instalação — a
      prévia mostra o que entraria antes de cadastrar qualquer coisa.
    </p>

    <p v-if="erroPrevia" class="mensagem mensagem--erro" role="alert">{{ erroPrevia }}</p>

    <div v-if="previa" class="previa">
      <div class="previa__caminho">{{ previa.caminho }}</div>

      <p v-if="!previa.existe" class="mensagem mensagem--erro">
        essa pasta não existe no servidor.
      </p>
      <p v-else-if="!previa.legivel" class="mensagem mensagem--erro">
        a pasta existe, mas o Oráculo não tem permissão para ler o conteúdo dela.
      </p>

      <template v-else>
        <div class="numeros">
          <div class="numeros__item">
            <span class="numeros__valor">{{ previa.arquivosElegiveis }}</span>
            <span class="numeros__rotulo">arquivos entram</span>
          </div>
          <div class="numeros__item">
            <span class="numeros__valor">{{ previa.arquivosRecusados }}</span>
            <span class="numeros__rotulo">ficam de fora</span>
          </div>
          <div class="numeros__item">
            <span class="numeros__valor">{{ formatarBytes(previa.bytesTotais) }}</span>
            <span class="numeros__rotulo">de texto</span>
          </div>
        </div>

        <div v-if="extensoes.length > 0" class="grupo">
          <span class="rotulo-secao">por extensão</span>
          <div class="grupo__itens">
            <span v-for="item in extensoes" :key="item.chave" class="etiqueta">
              {{ item.chave }} · {{ item.total }}
            </span>
          </div>
        </div>

        <div v-if="motivos.length > 0" class="grupo">
          <span class="rotulo-secao">por que ficam de fora</span>
          <div class="grupo__itens">
            <span v-for="item in motivos" :key="item.chave" class="etiqueta etiqueta--fora">
              {{ item.rotulo }} · {{ item.total }}
            </span>
          </div>
        </div>

        <div v-if="previa.amostra.length > 0" class="grupo">
          <span class="rotulo-secao">amostra do que a varredura viu</span>
          <div class="amostra">
            <div v-for="item in previa.amostra" :key="item.caminho" class="amostra__item">
              <span class="amostra__caminho" :class="{ 'amostra__caminho--fora': item.motivo }">
                {{ item.caminho }}
              </span>
              <span class="amostra__meta">
                {{ formatarBytes(item.bytes) }}
                <template v-if="item.motivo"> · {{ rotuloMotivo(item.motivo) }}</template>
              </span>
            </div>
          </div>
        </div>

        <p v-if="previa.truncada" class="mensagem">
          a prévia parou no teto da varredura — a pasta tem mais arquivos do que os contados aqui.
        </p>

        <p v-if="previa.arquivosElegiveis === 0" class="mensagem mensagem--aviso">
          nenhum arquivo dessa pasta seria indexado — cadastrar não mudaria nada no conhecimento.
        </p>

        <div class="fonte__linha">
          <input
            v-model="rotulo"
            class="o-field"
            type="text"
            maxlength="120"
            placeholder="Rótulo (opcional — sem isso, uso o nome da pasta)"
            :disabled="cadastrando"
          />
          <button
            class="o-btn o-btn--primary"
            type="button"
            :disabled="cadastrando"
            @click="void cadastrar()"
          >
            {{ cadastrando ? 'cadastrando…' : 'cadastrar como fonte' }}
          </button>
        </div>

        <p v-if="erroCadastro" class="mensagem mensagem--erro" role="alert">{{ erroCadastro }}</p>
        <p v-else-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { formatarBytes } from './formato';
import {
  criarFonte,
  obterPreviaDeFonte,
  type MotivoDeRecusa,
  type PreviaDeFonte,
} from '@/services/ambiente.service';
import { mensagemDoErro } from '@/services/http';

const emit = defineEmits<{ cadastrada: [] }>();

const ROTULOS_DE_MOTIVO: Record<MotivoDeRecusa, string> = {
  denylist: 'na denylist do corpus',
  extensao: 'extensão não indexável',
  binario: 'conteúdo binário',
  vazio: 'arquivo vazio',
  permissao: 'sem permissão de leitura',
  link_simbolico: 'link simbólico',
};

const caminho = ref('');
const rotulo = ref('');
const previa = ref<PreviaDeFonte | null>(null);
const olhando = ref(false);
const cadastrando = ref(false);
const erroPrevia = ref('');
const erroCadastro = ref('');
const feito = ref('');

const extensoes = computed(() =>
  Object.entries(previa.value?.porExtensao ?? {})
    .map(([chave, total]) => ({ chave: chave || '(sem extensão)', total }))
    .sort((a, b) => b.total - a.total),
);

const motivos = computed(() =>
  Object.entries(previa.value?.motivosDeRecusa ?? {})
    .filter(([, total]) => total > 0)
    .map(([chave, total]) => ({ chave, rotulo: rotuloMotivo(chave), total }))
    .sort((a, b) => b.total - a.total),
);

function rotuloMotivo(chave: string): string {
  return ROTULOS_DE_MOTIVO[chave as MotivoDeRecusa] ?? chave;
}

async function verPrevia(): Promise<void> {
  const alvo = caminho.value.trim();

  if (olhando.value || alvo.length === 0) return;

  olhando.value = true;
  erroPrevia.value = '';
  erroCadastro.value = '';
  feito.value = '';

  try {
    previa.value = await obterPreviaDeFonte(alvo);
  } catch (falha) {
    previa.value = null;
    erroPrevia.value = mensagemDoErro(falha, 'não consegui olhar essa pasta');
  } finally {
    olhando.value = false;
  }
}

async function cadastrar(): Promise<void> {
  const confirmada = previa.value;

  if (!confirmada || cadastrando.value) return;

  cadastrando.value = true;
  erroCadastro.value = '';
  feito.value = '';

  try {
    const fonte = await criarFonte(confirmada.caminho, rotulo.value);

    feito.value = `"${fonte.rotulo}" cadastrada — os arquivos entram no conhecimento na próxima indexação`;
    caminho.value = '';
    rotulo.value = '';
    previa.value = null;
    emit('cadastrada');
  } catch (falha) {
    erroCadastro.value = mensagemDoErro(falha, 'não consegui cadastrar essa pasta');
  } finally {
    cadastrando.value = false;
  }
}

watch(caminho, () => {
  previa.value = null;
  erroPrevia.value = '';
  erroCadastro.value = '';
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.fonte {
  display: flex;
  flex-direction: column;
  gap: 8px;

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

  &__dica {
    margin: 0;
    font-size: 12.5px;
    color: var(--ink3);

    code {
      font: 400 11.5px/1 $mono;
    }
  }
}

.previa {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel2);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink2);
    word-break: break-all;
  }
}

.numeros {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;

  &__item {
    display: flex;
    flex-direction: column;
  }

  &__valor {
    font-size: 17px;
    font-weight: 600;
    color: var(--ink);
  }

  &__rotulo {
    font-size: 12px;
    color: var(--ink3);
  }
}

.grupo {
  display: flex;
  flex-direction: column;
  gap: 5px;

  &__itens {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
}

.rotulo-secao {
  font-size: 12.5px;
  color: var(--ink3);
}

.etiqueta {
  font: 400 11px/1.6 $mono;
  color: var(--ink3);
  background: var(--panel3);
  border-radius: 5px;
  padding: 1px 6px;

  &--fora {
    color: var(--clay);
    background: var(--clay-s);
  }
}

.amostra {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 190px;
  overflow-y: auto;

  &__item {
    display: flex;
    gap: 10px;
    align-items: baseline;
  }

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink2);
    flex: 1;
    word-break: break-all;

    &--fora {
      color: var(--ink3);
      text-decoration: line-through;
    }
  }

  &__meta {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
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
