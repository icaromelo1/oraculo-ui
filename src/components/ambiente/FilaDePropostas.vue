<template>
  <div class="propostas">
    <div class="rotulo-secao">ele propõe, você decide — nada entra no conhecimento sem aprovação</div>

    <div class="filtros" role="group" aria-label="Filtrar propostas">
      <button
        v-for="opcao in FILTROS"
        :key="opcao.chave"
        class="filtros__item"
        type="button"
        :class="{ 'filtros__item--ativo': filtro === opcao.chave }"
        :aria-pressed="filtro === opcao.chave"
        @click="filtro = opcao.chave"
      >
        {{ opcao.rotulo }} · {{ contagem(opcao.chave) }}
      </button>
    </div>

    <p v-if="carregando && todas.length === 0" class="mensagem">carregando…</p>
    <p v-else-if="erroLista" class="mensagem mensagem--erro" role="alert">{{ erroLista }}</p>

    <template v-else>
      <p v-if="visiveis.length === 0" class="vazio">
        <span class="vazio__titulo">{{ vazio.titulo }}</span>
        <span class="vazio__detalhe">{{ vazio.detalhe }}</span>
      </p>

      <div v-for="proposta in visiveis" :key="proposta.id" class="proposta">
        <template v-if="proposta.status === 'pendente'">
          <button
            class="proposta__topo"
            type="button"
            :aria-expanded="abertaId === proposta.id"
            @click="alternar(proposta)"
          >
            <i class="ponto ponto--sage" aria-hidden="true" />
            <span class="proposta__texto">
              <span class="proposta__titulo">{{ proposta.titulo }}</span>
              <span class="proposta__justificativa">{{ proposta.justificativa }}</span>
              <span class="proposta__origem">{{ origemDe(proposta) }}</span>
            </span>
            <span class="proposta__status">
              {{ abertaId === proposta.id ? 'fechar' : 'pendente' }}
            </span>
          </button>

          <div v-if="abertaId === proposta.id" class="editor">
            <label class="rotulo" :for="`titulo-${proposta.id}`">
              Título — pode editar antes de aprovar
            </label>
            <input
              :id="`titulo-${proposta.id}`"
              v-model="tituloEmEdicao"
              class="o-field"
              type="text"
              :disabled="ocupado"
            />

            <label class="rotulo" :for="`conteudo-${proposta.id}`">Conteúdo</label>
            <textarea
              :id="`conteudo-${proposta.id}`"
              v-model="conteudoEmEdicao"
              class="o-field editor__conteudo"
              rows="5"
              :disabled="ocupado"
            ></textarea>

            <div class="editor__campos">
              <div class="editor__campo">
                <label class="rotulo" :for="`modulo-${proposta.id}`">Entra no módulo</label>
                <select
                  :id="`modulo-${proposta.id}`"
                  v-model="moduloEmEdicao"
                  class="o-field"
                  :disabled="ocupado"
                >
                  <option value="">sem módulo</option>
                  <option v-for="modulo in modulos" :key="modulo.id" :value="modulo.id">
                    {{ modulo.nome }}
                  </option>
                </select>
              </div>

              <div class="editor__campo editor__campo--largo">
                <label class="rotulo" :for="`obs-${proposta.id}`">Observação (opcional)</label>
                <input
                  :id="`obs-${proposta.id}`"
                  v-model="observacaoEmEdicao"
                  class="o-field"
                  type="text"
                  placeholder="ex.: conferido com o log de produção"
                  :disabled="ocupado"
                />
              </div>
            </div>

            <div class="editor__acoes">
              <button
                class="o-btn o-btn--primary"
                type="button"
                :disabled="ocupado || !edicaoValida"
                @click="void aprovar(proposta)"
              >
                {{ decidindo === 'aprovar' ? 'aprovando…' : 'Aprovar' }}
              </button>
              <button
                class="o-btn o-btn--ghost editor__descartar"
                type="button"
                :disabled="ocupado"
                @click="void descartar(proposta)"
              >
                {{ decidindo === 'descartar' ? 'descartando…' : 'Descartar' }}
              </button>
              <span class="editor__dica">
                aprovar grava uma nota nova com autoridade 1 — a observação fica no registro
              </span>
            </div>

            <p v-if="erroDecisao" class="mensagem mensagem--erro" role="alert">{{ erroDecisao }}</p>
          </div>
        </template>

        <div v-else class="proposta__decidida">
          <i
            class="ponto"
            :class="proposta.status === 'aprovada' ? 'ponto--sage-claro' : 'ponto--vazio'"
            aria-hidden="true"
          />
          <span class="proposta__texto">
            <span
              class="proposta__titulo proposta__titulo--decidida"
              :class="{ 'proposta__titulo--riscada': proposta.status === 'descartada' }"
            >
              {{ proposta.titulo }}
            </span>
            <span class="proposta__origem">{{ resumoDaDecisao(proposta) }}</span>
          </span>
          <span
            class="proposta__status"
            :class="proposta.status === 'aprovada' ? 'proposta__status--ok' : ''"
          >
            {{ proposta.status }}
          </span>
        </div>
      </div>
    </template>

    <p v-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { ModuloResumido } from '@/services/ambiente.service';
import { mensagemDoErro } from '@/services/http';
import {
  aprovarProposta,
  descartarProposta,
  listarPropostas,
  type PropostaResumida,
  type StatusDaProposta,
} from '@/services/propostas.service';

type ChaveDeFiltro = 'todas' | StatusDaProposta;

const FILTROS: { chave: ChaveDeFiltro; rotulo: string }[] = [
  { chave: 'todas', rotulo: 'todas' },
  { chave: 'pendente', rotulo: 'pendentes' },
  { chave: 'aprovada', rotulo: 'aprovadas' },
  { chave: 'descartada', rotulo: 'descartadas' },
];

defineProps<{ modulos: ModuloResumido[] }>();

const emit = defineEmits<{ mudou: [] }>();

const todas = ref<PropostaResumida[]>([]);
const carregando = ref(true);
const erroLista = ref('');
const filtro = ref<ChaveDeFiltro>('todas');
const feito = ref('');

const abertaId = ref<string | null>(null);
const tituloEmEdicao = ref('');
const conteudoEmEdicao = ref('');
const moduloEmEdicao = ref('');
const observacaoEmEdicao = ref('');
const decidindo = ref<'aprovar' | 'descartar' | null>(null);
const erroDecisao = ref('');

const ocupado = computed(() => decidindo.value !== null);

const edicaoValida = computed(
  () => tituloEmEdicao.value.trim().length > 0 && conteudoEmEdicao.value.trim().length > 0,
);

const visiveis = computed(() =>
  filtro.value === 'todas'
    ? todas.value
    : todas.value.filter((proposta) => proposta.status === filtro.value),
);

const vazio = computed(() => {
  if (todas.value.length === 0) {
    return {
      titulo: 'O assistente ainda não propôs nada.',
      detalhe:
        'quando ele descobrir algo novo nas conversas ou no código, aparece aqui para você aprovar.',
    };
  }

  if (filtro.value === 'pendente' || filtro.value === 'todas') {
    return {
      titulo: 'Nenhuma proposta pendente.',
      detalhe: 'você já decidiu todas — as antigas estão nos filtros acima.',
    };
  }

  return {
    titulo: `Nenhuma proposta ${filtro.value}.`,
    detalhe: 'troque o filtro para ver as outras.',
  };
});

function contagem(chave: ChaveDeFiltro): number {
  if (chave === 'todas') return todas.value.length;

  return todas.value.filter((proposta) => proposta.status === chave).length;
}

function quando(valor: string): string {
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function origemDe(proposta: PropostaResumida): string {
  const partes = [proposta.origemCaminho, `proposta em ${quando(proposta.criadaEm)}`];

  return partes.filter(Boolean).join(' · ');
}

function resumoDaDecisao(proposta: PropostaResumida): string {
  const partes = [
    proposta.decididaEm ? `${proposta.status} em ${quando(proposta.decididaEm)}` : proposta.status,
  ];

  if (proposta.observacaoDaDecisao) partes.push(`obs.: "${proposta.observacaoDaDecisao}"`);

  return partes.join(' · ');
}

function alternar(proposta: PropostaResumida): void {
  erroDecisao.value = '';
  feito.value = '';

  if (abertaId.value === proposta.id) {
    abertaId.value = null;
    return;
  }

  abertaId.value = proposta.id;
  tituloEmEdicao.value = proposta.titulo;
  conteudoEmEdicao.value = proposta.conteudo;
  moduloEmEdicao.value = proposta.moduloId ?? '';
  observacaoEmEdicao.value = '';
}

function trocar(atualizada: PropostaResumida): void {
  todas.value = todas.value.map((item) => (item.id === atualizada.id ? atualizada : item));
  abertaId.value = null;
}

async function carregar(): Promise<void> {
  carregando.value = true;
  erroLista.value = '';

  try {
    todas.value = await listarPropostas();
  } catch (falha) {
    erroLista.value = mensagemDoErro(falha, 'não consegui listar as propostas');
  } finally {
    carregando.value = false;
  }
}

async function aprovar(proposta: PropostaResumida): Promise<void> {
  if (ocupado.value || !edicaoValida.value) return;

  decidindo.value = 'aprovar';
  erroDecisao.value = '';

  const observacao = observacaoEmEdicao.value.trim();

  try {
    const resposta = await aprovarProposta(proposta.id, {
      titulo: tituloEmEdicao.value.trim(),
      conteudo: conteudoEmEdicao.value.trim(),
      moduloId: moduloEmEdicao.value || null,
      ...(observacao ? { observacao } : {}),
    });

    trocar(resposta.proposta);

    const trechos = resposta.nota.trechosIndexados;

    feito.value =
      trechos > 0
        ? `aprovada — ${trechos} ${trechos === 1 ? 'trecho indexado' : 'trechos indexados'}`
        : 'aprovada e gravada — a próxima varredura indexa o texto';

    emit('mudou');
  } catch (falha) {
    erroDecisao.value = mensagemDoErro(falha, 'não consegui aprovar esta proposta');
  } finally {
    decidindo.value = null;
  }
}

async function descartar(proposta: PropostaResumida): Promise<void> {
  if (ocupado.value) return;

  decidindo.value = 'descartar';
  erroDecisao.value = '';

  try {
    trocar(await descartarProposta(proposta.id, observacaoEmEdicao.value));
    feito.value = 'proposta descartada — nada entrou no conhecimento';
    emit('mudou');
  } catch (falha) {
    erroDecisao.value = mensagemDoErro(falha, 'não consegui descartar esta proposta');
  } finally {
    decidindo.value = null;
  }
}

onMounted(() => {
  void carregar();
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.propostas {
  display: flex;
  flex-direction: column;
  gap: 9px;
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

.filtros {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;

  &__item {
    font: 400 12.5px/1 $sans;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 20px;
    color: var(--ink3);
    padding: 6px 13px;
    cursor: pointer;

    &:hover {
      color: var(--ink);
    }

    &--ativo {
      background: var(--sage-s);
      border-color: var(--sage-l);
      color: var(--sage);
    }
  }
}

.vazio {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 0;
  border: 1px dashed var(--line2);
  border-radius: 12px;
  padding: 20px 18px;
  text-align: center;

  &__titulo {
    font-size: 13.5px;
    color: var(--ink2);
  }

  &__detalhe {
    font-size: 12.5px;
    color: var(--ink3);
  }
}

.proposta {
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;

  &__topo {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    width: 100%;
    text-align: left;
    background: var(--panel);
    border: none;
    padding: 12px 14px;
    cursor: pointer;

    &:hover {
      background: var(--panel2);
    }
  }

  &__decidida {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    background: var(--panel2);
    padding: 11px 14px;
  }

  &__texto {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__titulo {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--ink);

    &--decidida {
      color: var(--ink2);
    }

    &--riscada {
      color: var(--ink3);
      text-decoration: line-through;
    }
  }

  &__justificativa {
    font-size: 12.5px;
    color: var(--ink2);
  }

  &__origem {
    font: 400 11.5px/1.6 $mono;
    color: var(--ink3);
    word-break: break-all;
  }

  &__status {
    font-size: 12.5px;
    color: var(--ink3);
    white-space: nowrap;

    &--ok {
      color: var(--sage);
    }
  }
}

.ponto {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-top: 6px;
  border-radius: 50%;
  flex: none;

  &--sage {
    background: var(--sage);
  }

  &--sage-claro {
    background: var(--sage-l);
  }

  &--vazio {
    border: 1.5px solid var(--line2);
  }
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-top: 1px solid var(--line);
  padding: 12px 14px 14px;

  &__conteudo {
    resize: vertical;
    font-size: 13.5px;
    line-height: 1.55;
  }

  &__campos {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__campo {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 180px;

    &--largo {
      flex: 1;
    }
  }

  &__acoes {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    margin-top: 3px;
  }

  &__descartar:hover {
    color: var(--clay);
    border-color: var(--clay-l);
  }

  &__dica {
    font-size: 12px;
    color: var(--ink3);
    flex: 1;
    min-width: 200px;
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  &--erro {
    color: var(--clay);
  }

  &--ok {
    color: var(--sage);
  }
}
</style>
