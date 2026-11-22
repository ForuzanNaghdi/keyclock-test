import Keycloak from 'keycloak-js';

export const auth = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT,
});

export function initAuth() {
  return auth.init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    redirectUri: location.origin + '/',
    silentCheckSsoRedirectUri: location.origin + '/silent-check-sso.html',
  });
}

export async function askBackend(withToken: boolean) {
  const headers = new Headers();
  if (withToken) {
    await auth.updateToken(30);
    if (!auth.token) throw new Error('دوباره وارد شو.');
    headers.set('Authorization', 'Bearer ' + auth.token);
  }
  const response = await fetch('/api/me', { headers, cache: 'no-store' });
  if (response.status === 401) throw new Error('401 · بک‌اند هویت این درخواست را تأیید نکرد.');
  if (!response.ok) throw new Error('خطای بک‌اند · ' + response.status);
  return await response.json() as { username: string | null; sub: string };
}
