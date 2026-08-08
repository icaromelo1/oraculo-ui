<template>
  <div class="envio">
    <label class="alvo">
      <input
        ref="campo"
        class="alvo__campo"
        type="file"
        multiple
        accept=".md,.txt,.pdf,text/markdown,text/plain,application/pdf"
        :disabled="enviando"
        @change="aoEscolher"
      />
      <span class="alvo__nome">{{ rotuloEscolha }}</span>
      <span class="alvo__meta">{{ rotuloMeta }}</span>
    </label>

    <div class="envio__rodape">
      <button
        class="o-btn o-btn--primary"
        type="button"
        :disabled="escolhidos.length === 0 || enviando"
        @click="void enviar()"
      >
        {{ enviando ? 'enviando…' : rotuloBotao }}
      </button>
      <span class="envio__dica">o conteúdo é copiado para as notas e indexado na hora</span>
    </div>

    <p v-if="erro" class="mensagem mensagem--erro" role="alert">{{ erro }}</p>

    <div v-if="lote" class="resultado" role="status">
      <p class="resultado__resumo">
        {{ lote.aceitos }} de {{ lote.total }} entraram<template v-if="lote.recusados > 0">
          · {{ lote.recusados }} recusado(s)</template
        >
      </p>

      <div v-for="item in lote.itens" :key="item.arquivo" class="item">
        <i class="item__ponto" :class="item.aceito ? 'item__ponto--ok' : 'item__ponto--erro'" />
        <span class="item__nome">{{ item.arquivo }}</span>
        <span class="item__detalhe">
          <template v-if="item.aceito">
            {{
              item.trechosIndexados > 0
                ? `${item.trechosIndexados} trecho(s) indexado(s)`
                : 'gravado, indexa na próxima varredura'
            }}
          </template>
          <template v-else>{{ item.motivo }}</template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { formatarBytes } from './formato';
import { enviarArquivos, recusaDoArquivo, type LoteEnviado } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const TETO_DE_ARQUIVOS = 20;

const emit = defineEmits<{ enviado: [] }>();

const campo = useTemplateRef<HTMLInputElement>('campo');
const escolhidos = ref<File[]>([]);
const enviando = ref(false);
const erro = ref('');
const lote = ref<LoteEnviado | null>(null);

const rotuloEscolha = computed(() => {
  if (escolhidos.value.length === 0) return 'escolher arquivos .md, .txt ou .pdf';
  if (escolhidos.value.length === 1) return escolhidos.value[0]?.name ?? '';

  return `${escolhidos.value.length} arquivos escolhidos`;
});

const rotuloMeta = computed(() => {
  if (escolhidos.value.length === 0) {
    return `até ${TETO_DE_ARQUIVOS} arquivos · 2 MB cada · PDF precisa ter texto`;
  }

  const total = escolhidos.value.reduce((soma, arquivo) => soma + arquivo.size, 0);

  return formatarBytes(total);
});

const rotuloBotao = computed(() =>
  escolhidos.value.length > 1 ? `enviar ${escolhidos.value.length} arquivos` : 'enviar arquivo',
);

function limparCampo(): void {
  escolhidos.value = [];
  if (campo.value) campo.value.value = '';
}

function aoEscolher(evento: Event): void {
  const entrada = evento.target as HTMLInputElement;
  const arquivos = [...(entrada.files ?? [])];

  erro.value = '';
  lote.value = null;

  if (arquivos.length === 0) {
    limparCampo();
    return;
  }

  if (arquivos.length > TETO_DE_ARQUIVOS) {
    erro.value = `são ${arquivos.length} arquivos — o teto por envio é ${TETO_DE_ARQUIVOS}`;
    limparCampo();
    return;
  }

  const recusado = arquivos
    .map((arquivo) => ({ arquivo, recusa: recusaDoArquivo(arquivo) }))
    .find((item) => item.recusa);

  if (recusado?.recusa) {
    erro.value = recusado.recusa;
    limparCampo();
    return;
  }

  escolhidos.value = arquivos;
}

async function enviar(): Promise<void> {
  if (escolhidos.value.length === 0 || enviando.value) return;

  enviando.value = true;
  erro.value = '';
  lote.value = null;

  try {
    lote.value = await enviarArquivos(escolhidos.value);
    limparCampo();
    emit('enviado');
  } catch (falha) {
    erro.value = mensagemDoErro(falha, 'não consegui enviar os arquivos');
  } finally {
    enviando.value = false;
  }
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.envio {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alvo {
  display: flex;
  flex-direction: column;
  gap: 3px;
  border: 1px dashed var(--line2);
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;

  &__campo {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &__nome {
    font-size: 13px;
    color: var(--ink);
  }

  &__meta {
    font-size: 12px;
    color: var(--ink3);
  }
}

.envio__rodape {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.envio__dica {
  font-size: 12px;
  color: var(--ink3);
}

.mensagem {
  margin: 0;
  font-size: 12.5px;

  &--erro {
    color: var(--clay);
  }
}

.resultado {
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-top: 1px solid var(--line);
  padding-top: 9px;

  &__resumo {
    margin: 0;
    font-size: 12.5px;
    color: var(--ink2);
  }
}

.item {
  display: grid;
  grid-template-columns: 0.55rem minmax(0, 12rem) 1fr;
  gap: 8px;
  align-items: baseline;
  font-size: 12.5px;

  &__ponto {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    align-self: center;

    &--ok {
      background: var(--sage);
    }

    &--erro {
      background: var(--clay);
    }
  }

  &__nome {
    font: 400 11.5px/1.6 $mono;
    color: var(--ink);
    word-break: break-all;
  }

  &__detalhe {
    color: var(--ink3);
  }
}
</style>
