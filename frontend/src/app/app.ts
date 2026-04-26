import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicator } from './shared/loading-indicator/loading-indicator';
import { ErrorToast } from './shared/error-toast/error-toast';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingIndicator, ErrorToast, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
