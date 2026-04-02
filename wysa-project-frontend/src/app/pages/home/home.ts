import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { QaService } from '../../services/qa.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private qaService: QaService,
    private authService: AuthService,
    private router: Router
  ) {}

  startTest(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.qaService.clearState();

    this.qaService.startTest().subscribe({
      next: (res) => {
        this.qaService.setCurrentQuestion(res.question);
        this.router.navigate(['/test']);
      },
      error: () => {
        this.error.set('Could not start the test. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
