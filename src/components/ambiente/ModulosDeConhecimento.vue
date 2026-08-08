<template>
  <div class="modulos">
    <div class="rotulo-secao">módulos — o mapa que eu leio antes de procurar</div>

    <div class="quadro">
      <p v-if="props.modulos.length === 0" class="vazio">
        nenhum módulo ainda — todo documento indexado está solto. crie o primeiro abaixo.
      </p>

      <div v-for="(modulo, indice) in props.modulos" :key="modulo.id" class="modulo">
        <div class="modulo__linha">
          <i class="ponto" :class="`ponto--${tomDoIndice(indice)}`" aria-hidden="true" />

          <div class="modulo__texto">
            <span class="modulo__nome">{{ modulo.nome }}</span>
            <span class="modulo__descricao">{{ modulo.descricao }}</span>
            <span v-if="modulo.especialistaDocumentoId" class="modulo__especialista">
              especialista: {{ nomeDoEspecialista(modulo) }}
            </span>
          </div>

          <span class="modulo__total">
            {{ modulo.documentos }} {{ modulo.documentos === 1 ? 'documento' : 'documentos' }}
          </span>

          <button
            class="o-btn o-btn--ghost"
            type="button"
            :aria-expanded="editandoId === modulo.id"
            @click="alternarEdicao(modulo)"
          >
            {{ editandoId === modulo.id ? 'fechar' : 'editar' }}
          </button>

          <button
            class="o-btn o-btn--ghost modulo__remover"
            type="button"
            :class="{ 'modulo__remover--confirmando': confirmandoId === modulo.id }"
            :disabled="removendoId === modulo.id"
            @click="void remover(modulo)"
          >
            <template v-if="removendoId === modulo.id">removendo…</template>
            <template v-else-if="confirmandoId === modulo.id">confirmar exclusão</template>
            <template v-else>remover</template>
          </button>
        </div>

        <p v-if="confirmandoId === modulo.id" class="modulo__aviso">
          os {{ modulo.documentos }}
          {{ modulo.documentos === 1 ? 'documento continua' : 'documentos continuam' }} indexados —
          só deixam de pertencer a este módulo.
        </p>

        <p v-if="erroPorModulo[modulo.id]" class="mensagem mensagem--erro" role="alert">
          {{ erroPorModulo[modulo.id] }}
        </p>

        <div v-if="editandoId === modulo.id" class="edicao">
          <label class="rotulo" :for="`nome-${modulo.id}`">Nome</label>
          <input
            :id="`nome-${modulo.id}`"
            v-model="nomeEmEdicao"
            class="o-field"
            type="text"
            :disabled="salvandoId === modulo.id"
          />

          <label class="rotulo">Descrição — é ela que me diz quando abrir este módulo</label>
          <CampoDeDescricao
            v-model="descricaoEmEdicao"
            :origem-conteudo="origemDaSugestao(nomeEmEdicao, descricaoEmEdicao)"
            :origem-titulo="nomeEmEdicao"
            placeholder="O que este módulo guarda e quando vale abri-lo…"
            dica-sem-origem="escreva o nome do módulo primeiro — é dele que eu parto para sugerir"
            rotulo="Descrição do módulo"
            :desabilitado="salvandoId === modulo.id"
          />

          <div class="edicao__acoes">
            <button
              class="o-btn o-btn--primary"
              type="button"
              :disabled="salvandoId === modulo.id || !edicaoValida"
              @click="void salvarEdicao(modulo)"
            >
              {{ salvandoId === modulo.id ? 'salvando…' : 'salvar' }}
            </button>
            <button
              class="o-btn o-btn--ghost"
              type="button"
              :disabled="salvandoId === modulo.id"
              @click="editandoId = null"
            >
              cancelar
            </button>
          </div>

          <div class="especialista">
            <div class="rotulo">
              Documento especialista — a capa do módulo, lida antes dos outros
            </div>
            <p v-if="modulo.especialistaDocumentoId" class="especialista__atual">
              hoje: {{ nomeDoEspecialista(modulo) }}
              <button
                class="o-btn o-btn--ghost"
                type="button"
                :disabled="definindoId === modulo.id"
                @click="void definir(modulo, null)"
              >
                remover especialista
              </button>
            </p>
            <SeletorDeDocumento
              placeholder="Procurar documento para ser o especialista…"
              :escolhido-id="modulo.especialistaDocumentoId"
              :desabilitado="definindoId === modulo.id"
              @escolhido="void definir(modulo, $event.id)"
            />
          </div>
        </div>
      </div>

      <div v-if="soltos > 0" class="modulo modulo--soltos">
        <div class="modulo__linha">
          <i class="ponto ponto--vazio" aria-hidden="true" />
          <div class="modulo__texto">
            <span class="modulo__nome modulo__nome--apagado">sem módulo</span>
            <span class="modulo__descricao">
              abra o documento na biblioteca abaixo para escolher o módulo dele
            </span>
          </div>
          <span class="modulo__total">
            {{ soltos }} {{ soltos === 1 ? 'documento' : 'documentos' }}
          </span>
        </div>
      </div>
    </div>

    <div class="cadastro">
      <div class="rotulo-secao">criar módulo</div>

      <input
        v-model="nomeNovo"
        class="o-field"
        type="text"
        placeholder="Nome do módulo — ex.: operação do servidor"
        aria-label="Nome do novo módulo"
        :disabled="criando"
      />

      <CampoDeDescricao
        v-model="descricaoNova"
        :origem-conteudo="origemDaSugestao(nomeNovo, descricaoNova)"
        :origem-titulo="nomeNovo"
        placeholder="O que este módulo guarda e quando vale abri-lo…"
        dica-sem-origem="escreva o nome do módulo primeiro — é dele que eu parto para sugerir"
        rotulo="Descrição do novo módulo"
        :desabilitado="criando"
      />

      <div class="cadastro__acoes">
        <button
          class="o-btn o-btn--primary"
          type="button"
          :disabled="criando || !cadastroValido"
          @click="void criar()"
        >
          {{ criando ? 'criando…' : 'criar módulo' }}
        </button>
        <span class="cadastro__dica">
          a descrição é obrigatória — sem ela eu não sei quando abrir o módulo
        </span>
      </div>

      <p v-if="erroCadastro" class="mensagem mensagem--erro" role="alert">{{ erroCadastro }}</p>
      <p v-else-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import CampoDeDescricao from './CampoDeDescricao.vue';
import SeletorDeDocumento from './SeletorDeDocumento.vue';
import {
  atualizarModulo,
  criarModulo,
  definirEspecialista,
  removerModulo,
  type ModuloResumido,
} from '@/services/ambiente.service';
import { obterDocumento } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const TONS = ['amber', 'sage', 'slate'] as const;

const props = defineProps<{ modulos: ModuloResumido[]; totalDeDocumentos: number }>();

const emit = defineEmits<{ mudou: [] }>();

const erroPorModulo = ref<Record<string, string>>({});
const especialistas = ref<Record<string, string>>({});

const editandoId = ref<string | null>(null);
const nomeEmEdicao = ref('');
const descricaoEmEdicao = ref('');
const salvandoId = ref<string | null>(null);
const definindoId = ref<string | null>(null);
const confirmandoId = ref<string | null>(null);
const removendoId = ref<string | null>(null);

const nomeNovo = ref('');
const descricaoNova = ref('');
const criando = ref(false);
const erroCadastro = ref('');
const feito = ref('');

const soltos = computed(() => {
  const classificados = props.modulos.reduce((soma, item) => soma + item.documentos, 0);

  return Math.max(0, props.totalDeDocumentos - classificados);
});

const cadastroValido = computed(
  () => nomeNovo.value.trim().length > 0 && descricaoNova.value.trim().length > 0,
);

const edicaoValida = computed(
  () => nomeEmEdicao.value.trim().length > 0 && descricaoEmEdicao.value.trim().length > 0,
);

function tomDoIndice(indice: number): string {
  return TONS[indice % TONS.length] ?? 'slate';
}

function origemDaSugestao(nome: string, descricao: string): string {
  const partes = [nome.trim(), descricao.trim()].filter(Boolean);

  return partes.join('\n\n');
}

function nomeDoEspecialista(modulo: ModuloResumido): string {
  const id = modulo.especialistaDocumentoId;

  if (!id) return '';

  return especialistas.value[id] ?? id;
}

function registrarErro(id: string, texto: string): void {
  erroPorModulo.value = { ...erroPorModulo.value, [id]: texto };
}

function limparErro(id: string): void {
  erroPorModulo.value = Object.fromEntries(
    Object.entries(erroPorModulo.value).filter(([chave]) => chave !== id),
  );
}

async function carregarEspecialistas(lista: readonly ModuloResumido[]): Promise<void> {
  const pendentes = lista
    .map((modulo) => modulo.especialistaDocumentoId)
    .filter((id): id is string => id !== null && especialistas.value[id] === undefined);

  if (pendentes.length === 0) return;

  const titulos = await Promise.all(
    pendentes.map(async (id) => {
      try {
        return [id, (await obterDocumento(id)).titulo] as const;
      } catch {
        // o id cru já identifica o especialista — não vale travar a lista pelo rótulo
        return [id, id] as const;
      }
    }),
  );

  especialistas.value = { ...especialistas.value, ...Object.fromEntries(titulos) };
}

function alternarEdicao(modulo: ModuloResumido): void {
  limparErro(modulo.id);
  confirmandoId.value = null;

  if (editandoId.value === modulo.id) {
    editandoId.value = null;
    return;
  }

  editandoId.value = modulo.id;
  nomeEmEdicao.value = modulo.nome;
  descricaoEmEdicao.value = modulo.descricao;
}

async function salvarEdicao(modulo: ModuloResumido): Promise<void> {
  if (salvandoId.value || !edicaoValida.value) return;

  salvandoId.value = modulo.id;
  limparErro(modulo.id);

  try {
    await atualizarModulo(modulo.id, {
      nome: nomeEmEdicao.value.trim(),
      descricao: descricaoEmEdicao.value.trim(),
    });
    editandoId.value = null;
    emit('mudou');
  } catch (falha) {
    registrarErro(modulo.id, mensagemDoErro(falha, 'não consegui salvar este módulo'));
  } finally {
    salvandoId.value = null;
  }
}

async function definir(modulo: ModuloResumido, documentoId: string | null): Promise<void> {
  if (definindoId.value) return;

  definindoId.value = modulo.id;
  limparErro(modulo.id);

  try {
    await definirEspecialista(modulo.id, documentoId);
    emit('mudou');
  } catch (falha) {
    registrarErro(modulo.id, mensagemDoErro(falha, 'não consegui definir o especialista'));
  } finally {
    definindoId.value = null;
  }
}

async function remover(modulo: ModuloResumido): Promise<void> {
  if (removendoId.value) return;

  limparErro(modulo.id);

  if (confirmandoId.value !== modulo.id) {
    confirmandoId.value = modulo.id;
    return;
  }

  removendoId.value = modulo.id;

  try {
    await removerModulo(modulo.id);

    confirmandoId.value = null;

    if (editandoId.value === modulo.id) editandoId.value = null;

    emit('mudou');
  } catch (falha) {
    registrarErro(modulo.id, mensagemDoErro(falha, 'não consegui remover este módulo'));
    confirmandoId.value = null;
  } finally {
    removendoId.value = null;
  }
}

async function criar(): Promise<void> {
  if (criando.value || !cadastroValido.value) return;

  criando.value = true;
  erroCadastro.value = '';
  feito.value = '';

  try {
    const novo = await criarModulo(nomeNovo.value.trim(), descricaoNova.value.trim());

    feito.value = `módulo "${novo.nome}" criado`;
    nomeNovo.value = '';
    descricaoNova.value = '';
    emit('mudou');
  } catch (falha) {
    erroCadastro.value = mensagemDoErro(falha, 'não consegui criar o módulo');
  } finally {
    criando.value = false;
  }
}

watch(
  () => props.modulos,
  (lista) => {
    void carregarEspecialistas(lista);
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.modulos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rotulo-secao {
  font-size: 12.5px;
  color: var(--ink3);
}

.rotulo {
  display: block;
  font-size: 12.5px;
  color: var(--ink2);
}

.quadro {
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}

.vazio {
  margin: 0;
  padding: 14px 14px;
  font-size: 12.5px;
  color: var(--ink3);
  background: var(--panel2);
}

.modulo {
  &:not(:first-child) {
    border-top: 1px solid var(--line);
  }

  &--soltos {
    background: var(--panel2);
  }

  &__linha {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    flex-wrap: wrap;
  }

  &__texto {
    flex: 1;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__nome {
    font-size: 13.5px;
    font-weight: 500;

    &--apagado {
      color: var(--ink2);
      font-weight: 400;
    }
  }

  &__descricao {
    font-size: 12.5px;
    color: var(--ink3);
  }

  &__especialista {
    font-size: 12px;
    color: var(--sage);
  }

  &__total {
    font-size: 12.5px;
    color: var(--ink2);
    white-space: nowrap;
  }

  &__remover--confirmando {
    color: var(--clay);
    border-color: var(--clay-l);
  }

  &__aviso {
    margin: 0;
    padding: 0 14px 10px;
    font-size: 12.5px;
    color: var(--amber);
  }
}

.ponto {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;

  &--amber {
    background: var(--amber);
  }

  &--sage {
    background: var(--sage);
  }

  &--slate {
    background: var(--slate);
  }

  &--vazio {
    border: 1.5px solid var(--line2);
  }
}

.edicao {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 0 14px 14px;

  &__acoes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.especialista {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid var(--line);
  padding-top: 10px;
  margin-top: 3px;

  &__atual {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    margin: 0;
    font-size: 12.5px;
    color: var(--ink2);
  }
}

.cadastro {
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-top: 1px solid var(--line);
  padding-top: 11px;

  &__acoes {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__dica {
    font-size: 12px;
    color: var(--ink3);
  }
}

.mensagem {
  margin: 0;
  padding: 2px 14px;
  font-size: 12.5px;
  color: var(--ink3);

  &--erro {
    color: var(--clay);
  }

  &--ok {
    color: var(--sage);
  }
}

.cadastro .mensagem {
  padding: 0;
}
</style>
