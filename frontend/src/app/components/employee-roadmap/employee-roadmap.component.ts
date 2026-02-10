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

        <!-- Manager View: Grouped by Employee -->
        <div *ngIf="!loading && isManager" class="space-y-8">
            <div *ngFor="let group of groupedRoadmaps" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span class="material-icons text-slate-400 text-base">person</span>
                        {{ group.user ? group.user.email : 'Unassigned' }}
                    </h2>
                    <span class="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">
                        {{ group.roadmaps.length }} Roadmaps
                    </span>
                </div>
                
                <div class="divide-y divide-slate-100">
                    <div *ngFor="let roadmap of group.roadmaps" class="p-6 hover:bg-slate-50 transition-colors">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-xl font-semibold text-slate-800 mb-1">{{ roadmap.title }}</h3>
                                <p class="text-slate-500 text-xs">Created on {{ roadmap.createdAt | date:'mediumDate' }}</p>
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
                        
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                            <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-500" [style.width.%]="getProgress(roadmap)"></div>
                        </div>

                        <div class="flex justify-between items-center">
                            <p class="text-slate-500 text-xs">{{ roadmap.topics.length }} topics</p>
                            <a [routerLink]="['/roadmap', roadmap.id]" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition">
                                View Details →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Employee View: Simple List -->
        <div *ngIf="!loading && !isManager && roadmaps.length > 0" class="space-y-4">
          <div *ngFor="let roadmap of roadmaps" class="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-xl font-semibold text-slate-800 mb-1">{{ roadmap.title }}</h2>
                    <p class="text-slate-500 text-sm">Created on {{ roadmap.createdAt | date:'mediumDate' }}</p>
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
  groupedRoadmaps: { user: any, roadmaps: Roadmap[] }[] = [];
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
        this.groupRoadmaps();
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

  groupRoadmaps() {
    const groups = new Map<number | string, { user: any, roadmaps: Roadmap[] }>();

    // Initialize Unassigned Group
    groups.set('unassigned', { user: null, roadmaps: [] });

    this.roadmaps.forEach(roadmap => {
      if (roadmap.assignedToUser) {
        if (!groups.has(roadmap.assignedToUser.id)) {
          groups.set(roadmap.assignedToUser.id, { user: roadmap.assignedToUser, roadmaps: [] });
        }
        groups.get(roadmap.assignedToUser.id)!.roadmaps.push(roadmap);
      } else {
        groups.get('unassigned')!.roadmaps.push(roadmap);
      }
    });

    // Convert map to array, filtered to remove empty groups if desired (keeping them for now)
    // Sort: Unassigned first, then by email
    this.groupedRoadmaps = Array.from(groups.values()).sort((a, b) => {
      if (!a.user) return -1;
      if (!b.user) return 1;
      return a.user.email.localeCompare(b.user.email);
    });

    // Filter out empty groups if needed, though seeing empty might be useful? 
    // Let's filter out empty groups EXCEPT unassigned if it has items?
    // Actually, showing all involved users is good.
    this.groupedRoadmaps = this.groupedRoadmaps.filter(g => g.roadmaps.length > 0);
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
