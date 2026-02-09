import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" class="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autocomplete="email" required [(ngModel)]="email"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address">
            </div>
            <div>
              <label htmlFor="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required [(ngModel)]="password"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password">
            </div>
          </div>

          <div>
            <button type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign in
            </button>
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-center text-sm">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        if (user.role === 'Manager') {
          this.router.navigate(['/generate-roadmap']); // Roadmap Generator
        } else if (user.role === 'Employee') {
          this.router.navigate(['/my-progress']); // Employee Roadmap
        } else {
          this.router.navigate(['/']); // Fallback
        }
      },
      error: (err) => {
        this.errorMessage = 'Invalid login credentials';
        console.error(err);
      }
    });
  }
}
