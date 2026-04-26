import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../../shared/navbar/navbar';

@Component({
  selector: 'app-global-config',
  imports: [RouterLink, FormsModule, Navbar],
  templateUrl: './global-config.html',
  styleUrl: './global-config.css',
})
export class GlobalConfig {
  saved = signal(false);

  platform = {
    name: 'CHRONOS',
    supportEmail: 'support@chronos.com',
    defaultCurrency: 'USD',
    defaultLanguage: 'English',
    maintenanceMode: false,
    registrationOpen: true,
  };

  payments = {
    taxRate: '8.5',
    stripeEnabled: true,
    cryptoEnabled: true,
    invoicePrefix: 'ORD',
  };

  security = {
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    requireEmailVerification: true,
    twoFactorForAdmin: true,
    auditLogging: true,
  };

  notifications = {
    systemAlerts: true,
    dailyReport: true,
    weeklyReport: true,
    errorAlerts: true,
  };

  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
