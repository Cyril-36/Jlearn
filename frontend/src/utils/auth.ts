export interface StoredUser {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  is_admin?: boolean;
}

export interface AuthSessionPayload {
  access_token: string;
  refresh_token?: string;
  user: StoredUser;
  is_admin?: boolean;
}

export function persistAuthSession(payload: AuthSessionPayload) {
  localStorage.setItem('jlearn_token', payload.access_token);
  localStorage.setItem('jlearn_user', JSON.stringify(payload.user));

  if (payload.refresh_token) {
    localStorage.setItem('jlearn_refresh', payload.refresh_token);
  } else {
    localStorage.removeItem('jlearn_refresh');
  }

  const isAdmin = payload.user.is_admin ?? payload.is_admin;
  if (isAdmin != null) {
    localStorage.setItem('jlearn_is_admin', String(isAdmin));
  }
}

export function clearAuthSession() {
  ['jlearn_token', 'jlearn_user', 'jlearn_refresh', 'jlearn_is_admin'].forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function readStoredUser(): StoredUser | null {
  const raw = localStorage.getItem('jlearn_user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
