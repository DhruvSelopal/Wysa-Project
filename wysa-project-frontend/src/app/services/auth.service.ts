import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, UserModel } from '../models/auth.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'wysa_auth_token';

  private isAuthSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(req: LoginRequest): Observable<string> {
    return this.http
      .post(`${environment.apiBaseUrl}/user/login`, req, { responseType: 'text' })
      .pipe(
        tap((token: string) => {
          this.storeToken(token.trim());
          this.isAuthSubject.next(true);
        })
      );
  }

  register(req: RegisterRequest): Observable<UserModel> {
    return this.http.post<UserModel>(`${environment.apiBaseUrl}/user/register`, req);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
