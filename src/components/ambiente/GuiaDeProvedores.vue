<template>
  <section class="guia">
    <button class="guia__topo" type="button" :aria-expanded="aberto" @click="aberto = !aberto">
      <span class="guia__seta" aria-hidden="true">{{ aberto ? '▾' : '▸' }}</span>
      Como conectar cada serviço
      <span class="guia__dica">{{ aberto ? 'esconder' : 'ver exemplos' }}</span>
    </button>

    <div v-if="aberto" class="guia__corpo">
      <p class="guia__intro">
        Cadastre acima escolhendo o serviço e colando a chave. O endereço já vem preenchido — você
        só precisa da chave e do nome do modelo.
      </p>

      <div v-for="item in exemplos" :key="item.id" class="exemplo">
        <div class="exemplo__cabecalho">
          <span class="exemplo__nome">{{ item.rotulo }}</span>
          <span v-if="item.gratuito" class="selo-livre">tem opção gratuita</span>
        </div>

        <p v-if="item.observacao" class="exemplo__nota">{{ item.observacao }}</p>

        <dl class="exemplo__campos">
          <template v-if="item.baseUrl">
            <dt>endereço</dt>
            <dd>
              <code>{{ item.baseUrl }}</code>
            </dd>
          </template>

          <template v-if="item.modelosSugeridos.length">
            <dt>modelo</dt>
            <dd>
              <code v-for="modelo in item.modelosSugeridos" :key="modelo" class="modelo">
                {{ modelo }}
              </code>
            </dd>
          </template>

          <template v-if="item.ondeObterChave">
            <dt>chave</dt>
            <dd>
              <a :href="item.ondeObterChave" target="_blank" rel="noopener noreferrer">
                {{ semProtocolo(item.ondeObterChave) }}
              </a>
            </dd>
          </template>

          <template v-if="!item.exigeChave">
            <dt>chave</dt>
            <dd class="exemplo__sem-chave">não precisa</dd>
          </template>
        </dl>
      </div>

      <div class="exemplo">
        <div class="exemplo__cabecalho">
          <span class="exemplo__nome">Um programa de linha de comando</span>
        </div>
        <p class="exemplo__nota">
          Para usar um CLI instalado no servidor, escolha o tipo “programa de linha de comando”:
          informe o caminho do executável e, em dialeto,
          <code>claude</code> ou <code>agy</code>. Qualquer outro programa exige descrever como ele
          é chamado — e isso equivale a dar acesso ao terminal da máquina.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PresetDeProvedor } from '@/services/ambiente.service';

const props = defineProps<{ presets: PresetDeProvedor[] }>();

const aberto = ref(false);

const exemplos = computed(() => props.presets.filter((preset) => preset.id !== 'manual'));

function semProtocolo(url: string): string {
  return url.replace(/^https?:\/\//, '');
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.guia {
  border-top: 1px solid var(--line);
  padding-top: 12px;
  margin-top: 4px;
}

.guia__topo {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink2);
}

.guia__seta {
  color: var(--ink3);
  font-size: 11px;
}

.guia__dica {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: var(--ink3);
}

.guia__corpo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.guia__intro {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);
  max-width: 62ch;
}

.exemplo {
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.exemplo__cabecalho {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.exemplo__nome {
  font-size: 13px;
  font-weight: 600;
}

.selo-livre {
  font-size: 11px;
  background: var(--sage-s);
  color: var(--sage);
  border-radius: 20px;
  padding: 1px 8px;
}

.exemplo__nota {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);
  max-width: 64ch;
}

.exemplo__campos {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  gap: 4px 10px;
  margin: 2px 0 0;
  font-size: 12.5px;
  align-items: baseline;
}

.exemplo__campos dt {
  color: var(--ink3);
}

.exemplo__campos dd {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.exemplo__campos code {
  font: 400 11.5px/1.6 $mono;
  background: var(--panel3);
  border-radius: 5px;
  padding: 1px 6px;
  word-break: break-all;
}

.exemplo__campos a {
  color: var(--slate);
  text-underline-offset: 3px;
  word-break: break-all;
}

.exemplo__sem-chave {
  color: var(--ink3);
}
</style>
