export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  birthdate: string;
}

export interface UserModel {
  id: string;
  name: string;
  email: string;
  age: number;
  birthdate: string;
}
