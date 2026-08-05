<template>
  <div class="pagina">
    <div class="pagina__coluna">
      <h1 class="titulo">Ambiente</h1>
      <p class="subtitulo">
        O que eu sei, o que eu alcanço e o que esta instalação me deixa fazer.
      </p>

      <p v-if="carregando" class="aviso">carregando…</p>
      <p v-else-if="erro" class="aviso aviso--erro">{{ erro }}</p>

      <template v-else-if="estado">
        <section class="secao">
          <div class="secao__cabecalho">
            <h2 class="secao__titulo">Conhecimento</h2>
            <span class="secao__nota">
              {{ estado.corpus.total }} documentos · última indexação {{ ultimaIndexacao }}
            </span>
            <span class="secao__espacador" />
            <button class="o-btn" type="button" disabled>reindexar</button>
            <span class="secao__nota">roda por cron às 04:30</span>
          </div>

          <p v-if="avisoAtualizacao" class="aviso aviso--erro">{{ avisoAtualizacao }}</p>

          <div class="cartoes">
            <div v-for="grupo in porAutoridade" :key="grupo.autoridade" class="cartao-fonte">
              <div class="cartao-fonte__topo">
                <i class="ponto" :class="`ponto--${grupo.tom}`" aria-hidden="true" />
                <span class="cartao-fonte__rotulo">{{ grupo.rotulo }}</span>
                <span class="cartao-fonte__total">{{ grupo.documentos }}</span>
              </div>
              <div class="cartao-fonte__detalhe">
                <span v-for="item in grupo.itens" :key="item.fonte" class="etiqueta">
                  {{ item.fonte }} · {{ item.documentos }}
                </span>
              </div>
            </div>
          </div>

          <div class="lista-fontes">
            <div class="rotulo-secao">de onde vem</div>
            <div v-for="fonte in estado.fontes" :key="fonte.caminho" class="linha">
              <span class="linha__nome">{{ fonte.rotulo }}</span>
              <span class="linha__caminho">{{ fonte.caminho }}</span>
              <span class="selo" :class="`selo--${fonte.origem}`">
                {{ fonte.origem === 'env' ? 'fixa no .env' : 'cadastrada aqui' }}
              </span>
              <button
                v-if="fonte.removivel && fonte.id"
                class="o-btn o-btn--ghost"
                type="button"
                :disabled="removendoFonte !== null"
                @click="void removerFonteCadastrada(fonte.id)"
              >
                {{ removendoFonte === fonte.id ? 'removendo…' : 'remover' }}
              </button>
            </div>
            <p v-if="erroFonte" class="aviso aviso--erro" role="alert">{{ erroFonte }}</p>
          </div>

          <div class="anexar">
            <div class="rotulo-secao">anexar conhecimento</div>

            <div class="abas">
              <button
                v-for="opcao in ABAS"
                :key="opcao.chave"
                class="abas__item"
                type="button"
                :class="{ 'abas__item--ativa': aba === opcao.chave }"
                :aria-pressed="aba === opcao.chave"
                @click="aba = opcao.chave"
              >
                {{ opcao.rotulo }}
              </button>
            </div>

            <EscritorDeNota v-if="aba === 'nota'" @gravada="void aoMudarConhecimento()" />
            <EnvioDeArquivo v-else-if="aba === 'arquivo'" @enviado="void aoMudarConhecimento()" />
            <CadastroDeFonte v-else @cadastrada="void aoMudarConhecimento()" />
          </div>

          <NotasAnexadas
            :notas="notas"
            :carregando="carregandoNotas"
            :erro="erroNotas"
            @removida="void aoMudarConhecimento()"
          />
        </section>

        <section class="secao">
          <div class="secao__cabecalho">
            <h2 class="secao__titulo">Capacidades</h2>
            <span class="secao__nota">
              o <code>.env</code> define o teto — aqui você recorta dentro dele
            </span>
          </div>

          <div class="capacidades">
            <div
              v-for="capacidade in estado.capacidades"
              :key="capacidade.capacidade"
              class="capacidade"
              :class="{ 'capacidade--indisponivel': !capacidade.tetoDoEnv }"
            >
              <div class="capacidade__texto">
                <span class="capacidade__nome">{{ rotuloCapacidade(capacidade.capacidade) }}</span>
                <span class="capacidade__descricao">
                  {{ descricaoCapacidade(capacidade.capacidade) }}
                </span>
                <span v-if="!capacidade.tetoDoEnv" class="capacidade__motivo">
                  indisponível nesta instalação — {{ capacidade.motivoIndisponivel }}
                </span>
              </div>

              <button
                class="chave"
                type="button"
                :class="{ 'chave--ligada': capacidade.ligada }"
                :disabled="!capacidade.tetoDoEnv || salvando === capacidade.capacidade"
                @click="void alternar(capacidade)"
              >
                <span class="chave__bolinha" />
              </button>
            </div>
          </div>

          <p v-if="erroCapacidade" class="aviso aviso--erro" role="alert">{{ erroCapacidade }}</p>
        </section>

        <section class="secao">
          <div class="secao__cabecalho">
            <h2 class="secao__titulo">Modelo</h2>
            <span class="secao__nota">somente leitura — muda no <code>.env</code> do servidor</span>
          </div>

          <div class="linha linha--simples">
            <span class="linha__nome">provedor</span>
            <span class="linha__caminho">{{ estado.provedor.tipo }}</span>
          </div>
          <div class="linha linha--simples">
            <span class="linha__nome">modelo</span>
            <span class="linha__caminho">{{ estado.provedor.modelo }}</span>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import CadastroDeFonte from '@/components/ambiente/CadastroDeFonte.vue';
import EnvioDeArquivo from '@/components/ambiente/EnvioDeArquivo.vue';
import EscritorDeNota from '@/components/ambiente/EscritorDeNota.vue';
import NotasAnexadas from '@/components/ambiente/NotasAnexadas.vue';
import {
  definirCapacidade,
  obterAmbiente,
  removerFonte,
  type CapacidadeEfetiva,
  type EstadoDoAmbiente,
  type NomeCapacidade,
} from '@/services/ambiente.service';
import { listarNotas, type NotaListada } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

type AbaDeAnexo = 'nota' | 'arquivo' | 'pasta';

const ABAS: { chave: AbaDeAnexo; rotulo: string }[] = [
  { chave: 'nota', rotulo: 'escrever nota' },
  { chave: 'arquivo', rotulo: 'enviar arquivo' },
  { chave: 'pasta', rotulo: 'cadastrar pasta do servidor' },
];

const estado = ref<EstadoDoAmbiente | null>(null);
const carregando = ref(true);
const erro = ref('');
const avisoAtualizacao = ref('');
const salvando = ref<NomeCapacidade | null>(null);
const erroCapacidade = ref('');
const removendoFonte = ref<string | null>(null);
const erroFonte = ref('');
const aba = ref<AbaDeAnexo>('nota');
const notas = ref<NotaListada[]>([]);
const carregandoNotas = ref(true);
const erroNotas = ref('');

const ROTULOS: Record<NomeCapacidade, string> = {
  conhecimento: 'Buscar no conhecimento',
  codigo: 'Ler código dos projetos',
  estado: 'Diagnosticar o servidor',
  banco: 'Consultar banco de dados',
};

const DESCRICOES: Record<NomeCapacidade, string> = {
  conhecimento: 'notas, documentação e memória indexadas',
  codigo: 'busca e leitura nos repositórios do workspace',
  estado: 'catálogo fechado de comandos de debug, somente leitura',
  banco: 'consultas SELECT em alvos cadastrados, com colunas mascaradas',
};

const AUTORIDADES = [
  { autoridade: 1, tom: 'amber', rotulo: 'Suas notas, memória e agentes' },
  { autoridade: 2, tom: 'slate', rotulo: 'Documentação' },
  { autoridade: 3, tom: 'neutro', rotulo: 'Código e configuração' },
] as const;

function rotuloCapacidade(nome: NomeCapacidade): string {
  return ROTULOS[nome] ?? nome;
}

function descricaoCapacidade(nome: NomeCapacidade): string {
  return DESCRICOES[nome] ?? '';
}

const porAutoridade = computed(() => {
  const corpus = estado.value?.corpus.porFonte ?? [];

  return AUTORIDADES.map((nivel) => {
    const itens = corpus.filter((item) => item.autoridade === nivel.autoridade);

    return {
      autoridade: nivel.autoridade,
      tom: nivel.tom,
      rotulo: nivel.rotulo,
      itens,
      documentos: itens.reduce((soma, item) => soma + item.documentos, 0),
    };
  }).filter((nivel) => nivel.documentos > 0);
});

const ultimaIndexacao = computed(() => {
  const valor = estado.value?.ultimaIndexacao;

  if (!valor) return 'nunca';

  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
});

async function carregar(): Promise<void> {
  carregando.value = true;
  erro.value = '';

  try {
    estado.value = await obterAmbiente();
  } catch (falha) {
    erro.value = mensagemDoErro(falha, 'não consegui ler o ambiente');
  } finally {
    carregando.value = false;
  }
}

async function atualizar(): Promise<void> {
  avisoAtualizacao.value = '';

  try {
    estado.value = await obterAmbiente();
  } catch (falha) {
    avisoAtualizacao.value = mensagemDoErro(falha, 'não consegui reler o ambiente agora');
  }
}

async function carregarNotas(): Promise<void> {
  carregandoNotas.value = true;
  erroNotas.value = '';

  try {
    notas.value = await listarNotas();
  } catch (falha) {
    erroNotas.value = mensagemDoErro(falha, 'não consegui listar as notas');
  } finally {
    carregandoNotas.value = false;
  }
}

async function aoMudarConhecimento(): Promise<void> {
  await Promise.all([atualizar(), carregarNotas()]);
}

async function alternar(capacidade: CapacidadeEfetiva): Promise<void> {
  if (!capacidade.tetoDoEnv) return;

  salvando.value = capacidade.capacidade;
  erroCapacidade.value = '';

  try {
    const atualizada = await definirCapacidade(capacidade.capacidade, !capacidade.ligada);
    capacidade.ligada = atualizada.ligada;
  } catch (falha) {
    erroCapacidade.value = mensagemDoErro(falha, 'não consegui salvar');
  } finally {
    salvando.value = null;
  }
}

async function removerFonteCadastrada(id: string): Promise<void> {
  if (removendoFonte.value) return;

  removendoFonte.value = id;
  erroFonte.value = '';

  try {
    await removerFonte(id);
    await atualizar();
  } catch (falha) {
    erroFonte.value = mensagemDoErro(falha, 'não consegui remover essa fonte');
  } finally {
    removendoFonte.value = null;
  }
}

onMounted(() => {
  void carregar();
  void carregarNotas();
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.pagina {
  flex: 1;
  overflow-y: auto;
  padding: 26px 20px 60px;

  &__coluna {
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.titulo {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.015em;
  margin: 0;
}

.subtitulo {
  font-size: 13.5px;
  color: var(--ink3);
  margin: 0 0 12px;
}

.aviso {
  font-size: 13px;
  color: var(--ink3);

  &--erro {
    color: var(--clay);
  }
}

.secao {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 18px;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__cabecalho {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__titulo {
    font-size: 15.5px;
    font-weight: 600;
    margin: 0;
  }

  &__nota {
    font-size: 12.5px;
    color: var(--ink3);

    code {
      font: 400 11.5px/1 $mono;
    }
  }

  &__espacador {
    flex: 1;
  }
}

.anexar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--line);

  .rotulo-secao {
    margin-bottom: 0;
  }
}

.abas {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;

  &__item {
    font: 500 12.5px/1 $sans;
    background: none;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--ink3);
    padding: 6px 10px;
    cursor: pointer;

    &:hover {
      color: var(--ink);
    }

    &--ativa {
      background: var(--panel3);
      border-color: var(--line);
      color: var(--ink);
    }
  }
}

.rotulo-secao {
  font-size: 12.5px;
  color: var(--ink3);
  margin-bottom: 6px;
}

.cartoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.cartao-fonte {
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 11px 13px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__rotulo {
    font-size: 13px;
    color: var(--ink2);
    flex: 1;
  }

  &__total {
    font-size: 15px;
    font-weight: 600;
  }

  &__detalhe {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
}

.etiqueta {
  font: 400 11px/1.6 $mono;
  color: var(--ink3);
  background: var(--panel3);
  border-radius: 5px;
  padding: 1px 6px;
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

  &--slate {
    background: var(--slate);
  }

  &--neutro {
    background: var(--line2);
  }
}

.linha {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;

  &--simples {
    border-top: none;
    padding: 3px 0;
  }

  &__nome {
    font-size: 13px;
    font-weight: 500;
    min-width: 130px;
  }

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    flex: 1;
    word-break: break-all;
  }
}

.selo {
  font-size: 11px;
  border-radius: 20px;
  padding: 2px 9px;
  white-space: nowrap;

  &--env {
    background: var(--slate-s);
    color: var(--slate);
  }

  &--banco {
    background: var(--amber-s);
    color: var(--amber);
  }
}

.capacidades {
  display: flex;
  flex-direction: column;
}

.capacidade {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 0;

  &:not(:first-child) {
    border-top: 1px solid var(--line);
  }

  &--indisponivel {
    opacity: 0.62;
  }

  &__texto {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__nome {
    font-size: 13.5px;
    font-weight: 500;
  }

  &__descricao {
    font-size: 12.5px;
    color: var(--ink3);
  }

  &__motivo {
    font-size: 12px;
    color: var(--clay);
    margin-top: 2px;
  }
}

.chave {
  width: 40px;
  height: 23px;
  border-radius: 20px;
  border: 1px solid var(--line2);
  background: var(--panel3);
  padding: 2px;
  cursor: pointer;
  flex: none;
  display: flex;
  justify-content: flex-start;

  &--ligada {
    background: var(--sage);
    border-color: var(--sage);
    justify-content: flex-end;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &__bolinha {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: var(--panel);
    box-shadow: var(--shadow);
  }
}
</style>
