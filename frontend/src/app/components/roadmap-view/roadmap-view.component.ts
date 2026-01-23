
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoadmapService } from '../../services/roadmap.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-roadmap-view',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
    template: `
    <div class="min-h-screen bg-gray-900 text-white p-8">
      <div class="max-w-4xl mx-auto">
        <button mat-button color="primary" routerLink="/" class="mb-6">
            <mat-icon>arrow_back</mat-icon> Create New
        </button>

        <div *ngIf="loading" class="flex justify-center py-20">
            <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="roadmap" class="space-y-6 animate-fade-in">
            <div class="border-b border-gray-700 pb-4 mb-6">
                <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    {{ roadmap.title }}
                </h1>
                <p class="text-gray-400 mt-2">Created on {{ roadmap.createdAt | date:'mediumDate' }}</p>
            </div>

            <div class="space-y-4 relative pl-8 border-l-2 border-gray-700 ml-4">
                <div *ngFor="let topic of roadmap.topics; let last = last" class="relative">
                    <!-- Timeline dot -->
                    <div class="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-blue-600 border-4 border-gray-900 shadow-lg"></div>
                    
                    <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm hover:border-blue-500 transition-colors">
                        <h3 class="text-xl font-medium text-gray-200">{{ topic.content }}</h3>
                    </div>
                </div>
            </div>
        </div>
        
        <div *ngIf="error" class="text-red-400 p-4 border border-red-900 rounded bg-red-900/10">
            {{ error }}
        </div>
      </div>
    </div>
  `
})
export class RoadmapViewComponent implements OnInit {
    roadmap: any;
    loading = true;
    error = '';

    private route = inject(ActivatedRoute);
    private roadmapService = inject(RoadmapService);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.roadmapService.get(id).subscribe({
                next: (res) => {
                    this.roadmap = res;
                    this.loading = false;
                },
                error: (err) => {
                    this.error = 'Roadmap not found.';
                    this.loading = false;
                }
            });
        } else {
            this.error = 'Invalid ID';
            this.loading = false;
        }
    }
}
