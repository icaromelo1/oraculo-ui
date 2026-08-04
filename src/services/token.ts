const CHAVE_TOKEN = 'oraculo:token';

export const EVENTO_SESSAO_EXPIRADA = 'oraculo:sessao-expirada';

export function obterToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function definirToken(token: string): void {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function limparToken(): void {
  localStorage.removeItem(CHAVE_TOKEN);
}
