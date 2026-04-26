import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  name = '';
  email = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  saving = false;
  savingPassword = false;
  saved = false;
  passwordSaved = false;
  errorMessage = '';
  passwordError = '';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (p) => { this.name = p.name; this.email = p.email; },
      error: () => {
        const user = this.authService.getCurrentUser();
        if (user) { this.name = user.name; this.email = user.email; }
      }
    });
  }

  saveProfile(): void {
    this.saving = true;
    this.errorMessage = '';
    this.userService.updateProfile({ name: this.name, email: this.email }).subscribe({
      next: (profile) => {
        this.saving = false;
        this.saved = true;
        
        // Update AuthService with new user info
        this.authService.updateUserInfo({
          name: profile.name,
          email: profile.email
        });
        
        setTimeout(() => this.saved = false, 3000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Failed to save changes.';
      }
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }
    this.savingPassword = true;
    this.passwordError = '';
    this.userService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordSaved = true;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.passwordSaved = false, 3000);
      },
      error: (err) => {
        this.savingPassword = false;
        this.passwordError = err.error?.message || 'Failed to change password.';
      }
    });
  }
}
