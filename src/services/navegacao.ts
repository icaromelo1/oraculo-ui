import type { Router } from 'vue-router';

let instancia: Router | null = null;

export function registrarRouter(router: Router): void {
  instancia = router;
}

export function irParaLogin(): void {
  if (!instancia) return;
  void instancia.push({ name: 'login' });
}
