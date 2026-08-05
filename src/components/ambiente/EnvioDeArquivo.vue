<template>
  <div class="envio">
    <label class="alvo">
      <input
        ref="campo"
        class="alvo__campo"
        type="file"
        accept=".md,.txt,text/markdown,text/plain"
        :disabled="enviando"
        @change="aoEscolher"
      />
      <span class="alvo__nome">{{
        escolhido ? escolhido.name : 'escolher um arquivo .md ou .txt'
      }}</span>
      <span class="alvo__meta">
        {{ escolhido ? formatarBytes(escolhido.size) : 'até 2 MB · PDF não é suportado' }}
      </span>
    </label>

    <div class="envio__rodape">
      <button
        class="o-btn o-btn--primary"
        type="button"
        :disabled="!escolhido || enviando"
        @click="void enviar()"
      >
        {{ enviando ? 'enviando…' : 'enviar arquivo' }}
      </button>
      <span class="envio__dica">o conteúdo é copiado para as notas e indexado na hora</span>
    </div>

    <p v-if="erro" class="mensagem mensagem--erro" role="alert">{{ erro }}</p>
    <p v-else-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { formatarBytes } from './formato';
import { enviarArquivo, recusaDoArquivo } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const emit = defineEmits<{ enviado: [] }>();

const campo = useTemplateRef<HTMLInputElement>('campo');
const escolhido = ref<File | null>(null);
const enviando = ref(false);
const erro = ref('');
const feito = ref('');

function limparCampo(): void {
  escolhido.value = null;
  if (campo.value) campo.value.value = '';
}

function aoEscolher(evento: Event): void {
  const entrada = evento.target as HTMLInputElement;
  const arquivo = entrada.files?.[0] ?? null;

  erro.value = '';
  feito.value = '';

  if (!arquivo) {
    limparCampo();
    return;
  }

  const recusa = recusaDoArquivo(arquivo);

  if (recusa) {
    erro.value = recusa;
    limparCampo();
    return;
  }

  escolhido.value = arquivo;
}

async function enviar(): Promise<void> {
  const arquivo = escolhido.value;

  if (!arquivo || enviando.value) return;

  enviando.value = true;
  erro.value = '';
  feito.value = '';

  try {
    const nota = await enviarArquivo(arquivo);

    feito.value =
      nota.trechosIndexados > 0
        ? `"${arquivo.name}" virou a nota "${nota.slug}" — ${nota.trechosIndexados} trecho(s) indexado(s)`
        : `"${arquivo.name}" virou a nota "${nota.slug}", mas nada foi indexado agora — a próxima varredura do corpus recupera`;

    limparCampo();
    emit('enviado');
  } catch (falha) {
    erro.value = mensagemDoErro(falha, 'não consegui enviar o arquivo');
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
  gap: 8px;

  &__rodape {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__dica {
    font-size: 12.5px;
    color: var(--ink3);
  }
}

.alvo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  border: 1px dashed var(--line2);
  border-radius: 10px;
  background: var(--panel2);
  padding: 14px 15px;
  cursor: pointer;

  &:hover {
    border-color: var(--sage);
  }

  &:focus-within {
    border-color: var(--sage);
    background: var(--panel);
  }

  &__campo {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &__nome {
    font-size: 13.5px;
    color: var(--ink2);
    flex: 1;
    word-break: break-all;
  }

  &__meta {
    font: 400 11.5px/1.5 $mono;
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

  &--ok {
    color: var(--sage);
  }
}
</style>
