export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface Item {
  id: number;
  title: string;
  category: string;
  price: number;
  description: string;
  in_stock: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Дискриминированный union для состояний запроса. */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };
