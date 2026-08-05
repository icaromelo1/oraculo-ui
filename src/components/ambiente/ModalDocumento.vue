<template>
  <Teleport to="body">
    <div v-if="documento" class="modal-fundo" @mousedown="fecharSeForaClique">
      <div
        ref="caixaRef"
        class="modal-caixa"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-labelledby="tituloId"
        @keydown.esc="aoEsc"
        @keydown.tab="aoTab"
      >
        <div class="modal-topo">
          <i class="ponto" :class="`ponto--${tom}`" aria-hidden="true" />
          <div class="modal-topo__info">
            <div class="modal-topo__nivel" :class="`modal-topo__nivel--${tom}`">
              {{ rotuloDaAutoridade(documento.autoridade) }}
            </div>
            <div :id="tituloId" class="modal-topo__titulo">{{ documento.titulo }}</div>
            <div class="modal-topo__caminho">{{ documento.caminho }}</div>
          </div>
          <button
            ref="fecharRef"
            class="modal-topo__fechar"
            type="button"
            aria-label="fechar"
            @click="fechar"
          >
            ×
          </button>
        </div>

        <div class="modal-corpo">
          <p v-if="carregando" class="mensagem">abrindo…</p>

          <p v-else-if="erro" class="mensagem mensagem--erro" role="alert">
            {{ erro }}
            <button class="o-btn o-btn--ghost" type="button" @click="void recarregar()">
              tentar de novo
            </button>
          </p>

          <template v-else-if="detalhe">
            <div class="visor__topo">
              <span class="visor__caminho">{{ detalhe.caminhoReal }}</span>
              <span v-if="detalhe.truncado" class="selo">conteúdo cortado</span>
              <span class="visor__espacador" />
              <span class="visor__meta">
                {{ documento.trechos }} {{ documento.trechos === 1 ? 'trecho' : 'trechos' }} ·
                {{ formatarBytes(detalhe.bytes || documento.bytes) }} ·
                {{ formatarQuando(documento.atualizadoEm) }}
              </span>
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
                <button
                  class="o-btn o-btn--ghost"
                  type="button"
                  :disabled="salvando"
                  @click="cancelar"
                >
                  cancelar
                </button>
                <span class="visor__dica">
                  grava em <code>{{ detalhe.caminho }}</code> e reindexa na hora
                </span>
              </div>

              <p v-if="erroSalvar" class="mensagem mensagem--erro" role="alert">{{ erroSalvar }}</p>
            </template>

            <template v-else>
              <p v-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>

              <pre v-if="detalhe.conteudo" class="visor__texto">{{ detalhe.conteudo }}</pre>
              <p v-else class="mensagem">
                o servidor não devolveu o conteúdo deste documento — só os metadados dele.
              </p>

              <p v-if="!detalhe.editavel" class="mensagem">
                somente leitura: este arquivo vive num diretório que o servidor monta sem escrita.
                para mudar o texto, edite direto em <code>{{ detalhe.caminhoReal }}</code> — a
                próxima indexação traz a versão nova.
              </p>
              <p v-else-if="motivoSemEdicao" class="mensagem mensagem--aviso">
                {{ motivoSemEdicao }}
              </p>
            </template>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { rotuloDaAutoridade, tomDaAutoridade } from './autoridade';
import { formatarBytes, formatarQuando } from './formato';
import {
  obterDocumento,
  salvarNota,
  slugDoCaminho,
  TAMANHO_MAXIMO_BYTES,
  type DocumentoAberto,
  type DocumentoIndexado,
} from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const props = defineProps<{ documento: DocumentoIndexado | null }>();

const emit = defineEmits<{ fechar: []; salvo: [trechos: number] }>();

const tituloId = 'modal-documento-titulo';

const detalhe = ref<DocumentoAberto | null>(null);
const carregando = ref(false);
const erro = ref('');
const editando = ref(false);
const rascunho = ref('');
const salvando = ref(false);
const erroSalvar = ref('');
const feito = ref('');
const caixaRef = ref<HTMLElement | null>(null);
const fecharRef = ref<HTMLButtonElement | null>(null);

let elementoQueAbriu: HTMLElement | null = null;
let referencia = 0;

const tom = computed(() => tomDaAutoridade(props.documento?.autoridade ?? 0));

const slug = computed(() =>
  slugDoCaminho(detalhe.value?.caminho ?? props.documento?.caminho ?? ''),
);

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

function reiniciar(): void {
  detalhe.value = null;
  carregando.value = false;
  erro.value = '';
  editando.value = false;
  rascunho.value = '';
  salvando.value = false;
  erroSalvar.value = '';
  feito.value = '';
}

async function carregar(id: string): Promise<void> {
  const atual = ++referencia;

  carregando.value = true;
  erro.value = '';

  try {
    const aberto = await obterDocumento(id);

    if (atual !== referencia) return;

    detalhe.value = aberto;
  } catch (falha) {
    if (atual !== referencia) return;

    detalhe.value = null;
    erro.value = mensagemDoErro(falha, 'não consegui abrir este documento');
  } finally {
    if (atual === referencia) carregando.value = false;
  }
}

async function recarregar(): Promise<void> {
  const documento = props.documento;

  if (!documento) return;

  await carregar(documento.id);
}

function fechar(): void {
  emit('fechar');
}

function aoEsc(): void {
  if (editando.value && !salvando.value) {
    cancelar();
    return;
  }

  if (!salvando.value) fechar();
}

function fecharSeForaClique(evento: MouseEvent): void {
  if (evento.target !== evento.currentTarget) return;
  if (editando.value) return;

  fechar();
}

function aoTab(evento: KeyboardEvent): void {
  const caixa = caixaRef.value;
  if (!caixa) return;

  const focaveis = caixa.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (focaveis.length === 0) return;

  const primeiro = focaveis[0] as HTMLElement;
  const ultimo = focaveis[focaveis.length - 1] as HTMLElement;

  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  }
}

function entrarEmEdicao(): void {
  if (!podeEditar.value) return;

  rascunho.value = detalhe.value?.conteudo ?? '';
  erroSalvar.value = '';
  feito.value = '';
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

    const trechos = gravada.trechosIndexados;

    detalhe.value = { ...documento, conteudo: rascunho.value };
    editando.value = false;
    rascunho.value = '';
    feito.value =
      trechos > 0
        ? `salvo — ${trechos} ${trechos === 1 ? 'trecho reindexado' : 'trechos reindexados'}`
        : 'salvo, mas nada foi reindexado agora — a próxima varredura do corpus recupera';
    emit('salvo', trechos);
  } catch (falha) {
    erroSalvar.value = mensagemDoErro(falha, 'não consegui salvar este arquivo');
  } finally {
    salvando.value = false;
  }
}

watch(
  () => props.documento,
  (novo, anterior) => {
    if (novo) {
      if (!anterior) elementoQueAbriu = document.activeElement as HTMLElement | null;

      reiniciar();
      void carregar(novo.id);
      void nextTick(() => fecharRef.value?.focus());
      return;
    }

    if (anterior) {
      referencia += 1;
      reiniciar();
      elementoQueAbriu?.focus();
      elementoQueAbriu = null;
    }
  },
);
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.modal-fundo {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(30 26 22 / 42%);
}

.modal-caixa {
  position: relative;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 24px 64px -24px rgba(30, 26, 22, 0.5);
  width: min(880px, 100%);
  max-height: min(720px, 88vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-topo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__nivel {
    font-size: 12.5px;
    margin-bottom: 3px;

    &--amber {
      color: var(--amber);
    }

    &--slate {
      color: var(--slate);
    }

    &--neutro {
      color: var(--ink3);
    }
  }

  &__titulo {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
    color: var(--ink);
  }

  &__caminho {
    font: 400 12px/1.6 $mono;
    color: var(--ink3);
    word-break: break-all;
  }

  &__fechar {
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--ink2);
    font-size: 15px;
    cursor: pointer;
    line-height: 1;
    padding: 5px 9px;
    flex: none;

    &:hover {
      color: var(--ink);
      border-color: var(--line2);
    }
  }
}

.ponto {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-top: 7px;
  border-radius: 50%;
  flex: none;

  &--amber {
    background: var(--amber);
  }

  &--slate {
    background: var(--slate);
  }

  &--neutro {
    background: var(--line2);
  }
}

.modal-corpo {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.visor {
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

  &__meta {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
  }

  &__texto {
    @include mono(12.5px, 400, 1.65);
    margin: 0;
    padding: 11px 13px;
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: 9px;
    color: var(--ink2);
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__editor {
    @include mono(12.5px, 400, 1.65);
    resize: vertical;
    min-height: 300px;
    background: var(--panel2);
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
