import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import * as authService from '@/services/auth.service';
import { EVENTO_SESSAO_EXPIRADA, definirToken, limparToken, obterToken } from '@/services/token';
import type { Capacidade, EstadoModelo, StatusCapacidade } from '@/types/oraculo';

type Tema = 'dark' | 'light';

const CHAVE_TEMA = 'oraculo:tema';

const ROTULOS_CAPACIDADE: Record<string, string> = {
  conhecimento: 'busca documental e conhecimento curado',
  codigo: 'leitura de código',
  banco: 'sql somente-leitura',
  estado: 'estado dos serviços',
};

const NOTA_POR_STATUS: Partial<Record<StatusCapacidade, string>> = {
  aprovacao: 'requer aprovação',
};

function paraCapacidade(item: { capacidade: string; status: StatusCapacidade }): Capacidade {
  const nota = NOTA_POR_STATUS[item.status];

  return {
    id: item.capacidade,
    rotulo: ROTULOS_CAPACIDADE[item.capacidade] ?? item.capacidade,
    status: item.status,
    ...(nota ? { nota } : {}),
  };
}

export const useSessaoStore = defineStore('sessao', () => {
  const tema = ref<Tema>((localStorage.getItem(CHAVE_TEMA) as Tema | null) ?? 'dark');
  const usuario = ref('');
  const perfil = ref('');
  const autenticado = ref(Boolean(obterToken()));
  const capacidades = ref<Capacidade[]>([]);
  const carregandoSessao = ref(false);
  const erroLogin = ref('');

  const modelo = ref<EstadoModelo>({
    nome: 'oráculo',
    local: true,
    contexto: '—',
    repositorios: 0,
  });

  const ferramentasDisponiveis = computed(
    () =>
      capacidades.value.filter((c) => c.status === 'permitida' || c.status === 'aprovacao').length,
  );

  const ferramentasTotais = computed(() => capacidades.value.length);

  function aplicarTema(): void {
    document.documentElement.setAttribute('data-theme', tema.value);
  }

  function alternarTema(): void {
    tema.value = tema.value === 'dark' ? 'light' : 'dark';
  }

  async function carregarPerfil(): Promise<void> {
    const resposta = await authService.eu();
    usuario.value = resposta.usuario.login;
    perfil.value = resposta.usuario.perfil.nome;
    capacidades.value = resposta.capacidades.map(paraCapacidade);
  }

  async function entrar(login: string, senha: string): Promise<void> {
    carregandoSessao.value = true;
    erroLogin.value = '';

    try {
      const sessao = await authService.entrar(login, senha);
      definirToken(sessao.token);
      usuario.value = sessao.usuario.login;
      perfil.value = sessao.usuario.perfil.nome;
      autenticado.value = true;
      await carregarPerfil();
    } catch (falha) {
      limparToken();
      autenticado.value = false;
      erroLogin.value = falha instanceof Error ? falha.message : 'não foi possível entrar';
      throw falha;
    } finally {
      carregandoSessao.value = false;
    }
  }

  function sair(): void {
    limparToken();
    autenticado.value = false;
    usuario.value = '';
    perfil.value = '';
    capacidades.value = [];
  }

  window.addEventListener(EVENTO_SESSAO_EXPIRADA, () => sair());

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
    capacidades,
    modelo,
    carregandoSessao,
    erroLogin,
    ferramentasDisponiveis,
    ferramentasTotais,
    alternarTema,
    aplicarTema,
    entrar,
    sair,
    carregarPerfil,
  };
});
