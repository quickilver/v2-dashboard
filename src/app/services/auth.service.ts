import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthLoginResponse } from '../models/responses/auth/auth-login.response';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly apiUrl: string = `${environment.apiUrl}/login`;
    private readonly tokenKey = 'auth_token';
    private readonly userKey = 'auth_user';

    readonly isAuthenticated = signal<boolean>(false);
    readonly user = signal<User | null>(null);

    constructor(private http: HttpClient) {
        this.loadFromStorage();
    }

    async login(email: string, password: string): Promise<AuthLoginResponse> {
        const response = await firstValueFrom(
            this.http.post<AuthLoginResponse>(this.apiUrl, { email, password }),
        );

        this.setSession(response);

        return response;
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.isAuthenticated.set(false);
        this.user.set(null);
    }

    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.tokenKey);
    }

    private setSession(response: AuthLoginResponse): void {
        const token = `${response.token_type} ${response.access_token}`;
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.isAuthenticated.set(true);
        this.user.set(response.user);
    }

    private loadFromStorage(): void {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem(this.tokenKey);
        const userData = localStorage.getItem(this.userKey);

        if (token && userData) {
            try {
                const user = JSON.parse(userData) as User;
                this.isAuthenticated.set(true);
                this.user.set(user);
            } catch {
                this.logout();
            }
        }
    }
}
