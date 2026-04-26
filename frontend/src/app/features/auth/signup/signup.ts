import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  termsAccepted = false;
  showPassword = false;
  errorMessage = '';
  loading = false;

  constructor(private router: Router, private auth: AuthService) {}

  onSignup(): void {
    if (!this.termsAccepted) return;
    this.loading = true;
    this.errorMessage = '';
    const fullName = `${this.firstName} ${this.lastName}`.trim();
    this.auth.signup(fullName, this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
