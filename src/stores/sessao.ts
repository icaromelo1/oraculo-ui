import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { CAPACIDADES } from '@/mocks/conversa';
import type { EstadoModelo, Instalacao } from '@/types/oraculo';

type Tema = 'dark' | 'light';

const CHAVE_TEMA = 'oraculo:tema';

export const useSessaoStore = defineStore('sessao', () => {
  const tema = ref<Tema>((localStorage.getItem(CHAVE_TEMA) as Tema | null) ?? 'dark');
  const usuario = ref('r.mendes');
  const perfil = ref('suporte n2');
  const autenticado = ref(false);
  const instalacao = ref<Instalacao>('dsg');
  const capacidades = ref([...CAPACIDADES]);

  const modelo = ref<EstadoModelo>({
    nome: 'oraculo-32b',
    local: true,
    contexto: 'ctx 32k',
    repositorios: 41,
  });

  const ferramentasDisponiveis = computed(
    () => capacidades.value.filter((c) => c.status !== 'desligada' && c.status !== 'negada').length,
  );

  const ferramentasTotais = computed(() => capacidades.value.length);

  function aplicarTema() {
    document.documentElement.setAttribute('data-theme', tema.value);
  }

  function alternarTema() {
    tema.value = tema.value === 'dark' ? 'light' : 'dark';
  }

  function entrar() {
    autenticado.value = true;
  }

  function sair() {
    autenticado.value = false;
  }

  watch(
    tema,
    (valor) => {
      localStorage.setItem(CHAVE_TEMA, valor);
      aplicarTema();
    },
    { immediate: true },
  );

  return {
    tema,
    usuario,
    perfil,
    autenticado,
    instalacao,
    capacidades,
    modelo,
    ferramentasDisponiveis,
    ferramentasTotais,
    alternarTema,
    aplicarTema,
    entrar,
    sair,
  };
});
