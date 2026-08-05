<template>
  <div class="visor">
    <p v-if="carregando" class="mensagem">abrindo…</p>

    <p v-else-if="erro" class="mensagem mensagem--erro" role="alert">
      {{ erro }}
      <button class="o-btn o-btn--ghost" type="button" @click="void carregar()">
        tentar de novo
      </button>
    </p>

    <template v-else-if="detalhe">
      <div class="visor__topo">
        <span class="visor__caminho">{{ detalhe.caminhoReal }}</span>
        <span v-if="detalhe.truncado" class="selo">conteúdo cortado</span>
        <span class="visor__espacador" />
        <button
          v-if="podeEditar && !editando"
          class="o-btn o-btn--ghost"
          type="button"
          @click="entrarEmEdicao"
        >
          editar
        </button>
      </div>

      <p v-if="detalhe.aviso" class="mensagem mensagem--aviso">{{ detalhe.aviso }}</p>

      <p v-if="detalhe.truncado" class="mensagem mensagem--aviso">
        o servidor mandou só o começo deste arquivo — o resto continua em disco, em
        <code>{{ detalhe.caminhoReal }}</code
        >.
      </p>

      <template v-if="editando">
        <textarea
          v-model="rascunho"
          class="o-field visor__editor"
          rows="18"
          spellcheck="false"
          aria-label="Conteúdo do documento"
          :disabled="salvando"
        ></textarea>

        <div class="visor__acoes">
          <button
            class="o-btn o-btn--primary"
            type="button"
            :disabled="salvando || !mudou"
            @click="void salvar()"
          >
            {{ salvando ? 'salvando…' : 'salvar' }}
          </button>
          <button class="o-btn o-btn--ghost" type="button" :disabled="salvando" @click="cancelar">
            cancelar
          </button>
          <span class="visor__dica">
            grava em <code>{{ detalhe.caminho }}</code> e reindexa na hora
          </span>
        </div>

        <p v-if="erroSalvar" class="mensagem mensagem--erro" role="alert">{{ erroSalvar }}</p>
      </template>

      <template v-else>
        <pre v-if="detalhe.conteudo" class="visor__texto">{{ detalhe.conteudo }}</pre>
        <p v-else class="mensagem">
          o servidor não devolveu o conteúdo deste documento — só os metadados dele.
        </p>

        <p v-if="!detalhe.editavel" class="mensagem">
          somente leitura: este arquivo vive num diretório que o servidor monta sem escrita. para
          mudar o texto, edite direto em <code>{{ detalhe.caminhoReal }}</code> — a próxima
          indexação traz a versão nova.
        </p>
        <p v-else-if="motivoSemEdicao" class="mensagem mensagem--aviso">{{ motivoSemEdicao }}</p>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  obterDocumento,
  salvarNota,
  slugDoCaminho,
  TAMANHO_MAXIMO_BYTES,
  type DocumentoAberto,
  type DocumentoIndexado,
} from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const props = defineProps<{ documento: DocumentoIndexado }>();

const emit = defineEmits<{ salvo: [trechos: number] }>();

const detalhe = ref<DocumentoAberto | null>(null);
const carregando = ref(true);
const erro = ref('');
const editando = ref(false);
const rascunho = ref('');
const salvando = ref(false);
const erroSalvar = ref('');

const slug = computed(() => slugDoCaminho(detalhe.value?.caminho ?? props.documento.caminho));

const podeEditar = computed(() => {
  const documento = detalhe.value;

  if (!documento?.editavel) return false;
  if (documento.truncado) return false;
  if (documento.conteudo === null) return false;

  return slug.value.length > 0;
});

const motivoSemEdicao = computed(() => {
  const documento = detalhe.value;

  if (!documento?.editavel || podeEditar.value) return '';

  if (documento.truncado) {
    return `não dá para editar por aqui: o conteúdo veio cortado e salvar apagaria o resto do arquivo. edite direto em ${documento.caminhoReal}.`;
  }

  if (documento.conteudo === null) {
    return 'não dá para editar por aqui: sem o conteúdo inteiro, salvar sobrescreveria o arquivo com texto vazio.';
  }

  return `não dá para editar por aqui: não consegui derivar o nome da nota a partir de ${documento.caminho}.`;
});

const mudou = computed(() => rascunho.value !== (detalhe.value?.conteudo ?? ''));

async function carregar(): Promise<void> {
  carregando.value = true;
  erro.value = '';

  try {
    detalhe.value = await obterDocumento(props.documento.id);
  } catch (falha) {
    detalhe.value = null;
    erro.value = mensagemDoErro(falha, 'não consegui abrir este documento');
  } finally {
    carregando.value = false;
  }
}

function entrarEmEdicao(): void {
  if (!podeEditar.value) return;

  rascunho.value = detalhe.value?.conteudo ?? '';
  erroSalvar.value = '';
  editando.value = true;
}

function cancelar(): void {
  editando.value = false;
  rascunho.value = '';
  erroSalvar.value = '';
}

async function salvar(): Promise<void> {
  const documento = detalhe.value;

  if (!documento || salvando.value || !podeEditar.value || !mudou.value) return;

  erroSalvar.value = '';

  if (new Blob([rascunho.value]).size > TAMANHO_MAXIMO_BYTES) {
    erroSalvar.value = 'o texto passou do teto de 2 MB por arquivo';
    return;
  }

  salvando.value = true;

  try {
    const gravada = await salvarNota(slug.value, rascunho.value);

    detalhe.value = { ...documento, conteudo: rascunho.value };
    editando.value = false;
    rascunho.value = '';
    emit('salvo', gravada.trechosIndexados);
  } catch (falha) {
    erroSalvar.value = mensagemDoErro(falha, 'não consegui salvar este arquivo');
  } finally {
    salvando.value = false;
  }
}

onMounted(() => {
  void carregar();
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.visor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px 12px;
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 10px;
  margin: 2px 0 8px;

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink2);
    word-break: break-all;
  }

  &__espacador {
    flex: 1;
  }

  &__texto {
    @include mono(12.5px, 400, 1.65);
    margin: 0;
    padding: 11px 13px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 9px;
    color: var(--ink2);
    max-height: 460px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__editor {
    @include mono(12.5px, 400, 1.65);
    resize: vertical;
    min-height: 240px;
    background: var(--panel);
  }

  &__acoes {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__dica {
    font-size: 12.5px;
    color: var(--ink3);

    code {
      font: 400 11.5px/1 $mono;
    }
  }
}

.selo {
  font-size: 11px;
  border-radius: 20px;
  padding: 2px 9px;
  white-space: nowrap;
  background: var(--amber-s);
  color: var(--amber);
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  code {
    font: 400 11.5px/1 $mono;
    word-break: break-all;
  }

  &--erro {
    color: var(--clay);
  }

  &--aviso {
    color: var(--amber);
  }
}
</style>
