import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, Observable} from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

const AUTH_API = 'http://localhost:8089/api/auth/';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(request: AuthenticationRequest): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(AUTH_API + 'login', request, { headers, responseType: 'text' })
      .pipe(
        map(token => {
          console.log('Token received:', token);
          this.saveToken(token);
          return { token };
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(AUTH_API + 'register', request);
  }

  logout(): void {
    window.sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  saveToken(token: string): void {
    console.log('Saving token:', token);
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  getUserInfo(): Observable<any> {
    return this.http.get<User>(AUTH_API + 'user-info')
      .pipe(
        tap(user => {
          this.saveUser(user);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
}
