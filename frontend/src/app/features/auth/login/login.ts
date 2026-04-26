import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Footer } from '../../../shared/footer/footer';
import { Navbar } from '../../../shared/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Footer, Navbar],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private tokenStorage: TokenStorageService
  ) {}

  onLogin(): void {
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        const redirectUrl = this.tokenStorage.getRedirectUrl();
        if (redirectUrl) {
          this.tokenStorage.clearRedirectUrl();
          this.router.navigateByUrl(redirectUrl);
        } else {
          const dashboards: Record<string, string> = {
            INDIVIDUAL: '/dashboard',
            CORPORATE: '/corporate',
            ADMIN: '/admin'
          };
          this.router.navigate([dashboards[res.role] || '/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Invalid credentials. Please try again.';
      }
    });
  }

  onCreateAccount(): void {
    this.router.navigate(['/signup']);
  }
}
