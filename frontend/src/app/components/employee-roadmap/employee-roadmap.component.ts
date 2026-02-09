import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoadmapService } from '../../services/roadmap.service';
import { Roadmap } from '../../models/roadmap-types';

@Component({
  selector: 'app-employee-roadmap',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 p-8 relative">
      <button (click)="logout()" class="absolute top-4 right-4 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded transition-colors">
        Logout
      </button>

      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-slate-800 mb-6">Your Assigned Roadmaps</h1>
        
        <div *ngIf="loading" class="text-center py-8">
          <p class="text-slate-600">Loading...</p>
        </div>

        <div *ngIf="!loading && roadmaps.length === 0" class="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <p class="text-slate-600">No roadmaps assigned yet. Check back later!</p>
        </div>

        <div *ngIf="!loading && roadmaps.length > 0" class="space-y-4">
          <div *ngFor="let roadmap of roadmaps" class="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <h2 class="text-xl font-semibold text-slate-800 mb-2">{{ roadmap.title }}</h2>
            <p class="text-slate-600 mb-4">Created on {{ roadmap.createdAt | date:'mediumDate' }}</p>
            <p class="text-slate-600 mb-4">{{ roadmap.topics.length }} topics</p>
            <a [routerLink]="['/roadmap', roadmap.id]" class="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
              View Roadmap
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmployeeRoadmapComponent implements OnInit {
  private authService = inject(AuthService);
  private roadmapService = inject(RoadmapService);

  roadmaps: Roadmap[] = [];
  loading = true;

  ngOnInit() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.id) {
      this.roadmapService.getAssignedRoadmaps(currentUser.id).subscribe({
        next: (roadmaps) => {
          this.roadmaps = roadmaps;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load assigned roadmaps', err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}
