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
        <h1 class="text-3xl font-bold text-slate-800 mb-6">
            {{ isManager ? 'All Employee Roadmaps' : 'Your Assigned Roadmaps' }}
        </h1>
        
        <div *ngIf="loading" class="text-center py-8">
          <p class="text-slate-600">Loading...</p>
        </div>

        <div *ngIf="!loading && roadmaps.length === 0" class="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <p class="text-slate-600">No roadmaps found.</p>
        </div>

        <div *ngIf="!loading && roadmaps.length > 0" class="space-y-4">
          <div *ngFor="let roadmap of roadmaps" class="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-xl font-semibold text-slate-800 mb-1">{{ roadmap.title }}</h2>
                    <p class="text-slate-500 text-sm">Created on {{ roadmap.createdAt | date:'mediumDate' }}</p>
                    <p *ngIf="isManager && roadmap.assignedToUserId" class="text-indigo-600 text-sm font-medium mt-1">
                        Assigned to User ID: {{ roadmap.assignedToUserId }}
                    </p>
                     <p *ngIf="isManager && !roadmap.assignedToUserId" class="text-gray-400 text-sm italic mt-1">
                        Unassigned
                    </p>
                </div>
                <div class="text-right">
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold" 
                          [ngClass]="{
                            'bg-green-100 text-green-800': getProgress(roadmap) === 100,
                            'bg-blue-100 text-blue-800': getProgress(roadmap) > 0 && getProgress(roadmap) < 100,
                            'bg-gray-100 text-gray-800': getProgress(roadmap) === 0
                          }">
                        {{ getProgress(roadmap) }}% Complete
                    </span>
                </div>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" [style.width.%]="getProgress(roadmap)"></div>
            </div>

            <div class="flex justify-between items-center">
                <p class="text-slate-600">{{ roadmap.topics.length }} topics</p>
                <a [routerLink]="['/roadmap', roadmap.id]" class="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
                  View Roadmap
                </a>
            </div>
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
  currentUser: any = null;

  get isManager(): boolean {
      return this.currentUser?.role === 'Manager';
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser && this.currentUser.id) {
      if (this.isManager) {
          this.loadAllRoadmaps();
      } else {
          this.loadAssignedRoadmaps(this.currentUser.id);
      }
    } else {
      this.loading = false;
    }
  }

  loadAllRoadmaps() {
      this.roadmapService.getAll().subscribe({
        next: (roadmaps) => {
          this.roadmaps = roadmaps;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load all roadmaps', err);
          this.loading = false;
        }
      });
  }

  loadAssignedRoadmaps(userId: number) {
      this.roadmapService.getAssignedRoadmaps(userId).subscribe({
        next: (roadmaps) => {
          this.roadmaps = roadmaps;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load assigned roadmaps', err);
          this.loading = false;
        }
      });
  }

  getProgress(roadmap: Roadmap): number {
      if (!roadmap.topics || roadmap.topics.length === 0) return 0;
      const completedCount = roadmap.topics.filter(t => t.isCompleted).length;
      return Math.round((completedCount / roadmap.topics.length) * 100);
  }

  logout() {
    this.authService.logout();
  }
}
