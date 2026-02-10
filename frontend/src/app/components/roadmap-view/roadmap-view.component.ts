
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoadmapService } from '../../services/roadmap.service';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Roadmap, User, Topic } from '../../models/roadmap-types';

@Component({
    selector: 'app-roadmap-view',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule, FormsModule, MatCheckboxModule],
    template: `
    <div class="min-h-screen bg-gray-900 text-white p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <button *ngIf="isManager" mat-button color="primary" routerLink="/generate-roadmap">
                <mat-icon>arrow_back</mat-icon> Create New
            </button>
             <button *ngIf="isEmployee" mat-button color="primary" routerLink="/progress">
                <mat-icon>arrow_back</mat-icon> Back to Dashboard
            </button>
        </div>

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

            <!-- Progress Section -->
            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
                <div class="flex justify-between text-sm mb-2 text-gray-400">
                    <span>Progress</span>
                    <span>{{ progress }}%</span>
                </div>
                <div class="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-500" [style.width.%]="progress"></div>
                </div>
            </div>

            <!-- Assignment Section (Managers Only) -->
            <div *ngIf="isManager" class="mb-6">
                <!-- If Unassigned: Show Assignment Dropdown -->
                <div *ngIf="!roadmap.assignedToUserId" class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 class="text-lg font-semibold mb-4">Assign to Employee</h3>
                    <div class="flex gap-4 items-center">
                        <mat-form-field appearance="outline" class="flex-1">
                            <mat-label>Select Employee</mat-label>
                            <mat-select [(ngModel)]="selectedEmployeeId">
                                <mat-option [value]="null">-- Unassign --</mat-option>
                                <mat-option *ngFor="let employee of employees" [value]="employee.id">
                                    {{ employee.email }}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                        <button mat-raised-button color="primary" (click)="assignRoadmap()" [disabled]="assigning">
                            {{ assigning ? 'Assigning...' : 'Assign' }}
                        </button>
                    </div>
                </div>

                <!-- If Assigned: Show Read-only Label (or nothing if desired, but label is good context) -->
                <div *ngIf="roadmap.assignedToUserId" class="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center gap-3">
                    <mat-icon class="text-green-400">check_circle</mat-icon>
                    <div>
                        <span class="text-gray-400 text-sm">Assigned to:</span>
                        <!-- We might need to find the email from ID since roadmap.assignedToUser might be null if not loaded correctly, but we try to use loaded employees list -->
                        <span class="text-white font-medium ml-2">{{ getEmployeeEmail(roadmap.assignedToUserId) }}</span>
                    </div>
                </div>

                <div *ngIf="assignmentSuccess" class="text-green-400 mt-2">
                    ✓ Roadmap assigned successfully!
                </div>
                <div *ngIf="assignmentError" class="text-red-400 mt-2">
                    {{ assignmentError }}
                </div>
            </div>

            <div class="space-y-4 relative pl-8 border-l-2 border-gray-700 ml-4">
                <div *ngFor="let topic of roadmap.topics; let last = last" class="relative">
                    <!-- Timeline Checkbox -->
                    <div class="absolute -left-[50px] top-4 bg-gray-900 rounded-full z-10">
                        <div *ngIf="isEmployee">
                            <mat-checkbox [checked]="topic.isCompleted" 
                                      [disabled]="!isEmployee"
                                      (change)="toggleTopic(topic, $event)" 
                                      color="primary">
                        </mat-checkbox>
                        </div>
                        <div *ngIf="isManager" >
                            <div *ngIf="!topic.isCompleted" class="w-6 h-6 rounded-full bg-red-300"></div>
                            <div *ngIf="topic.isCompleted" class="w-6 h-6 rounded-full bg-green-300"></div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm transition-all duration-300"
                         [ngClass]="{'border-green-500 bg-gray-800/80': topic.isCompleted, 'hover:border-blue-500': !topic.isCompleted}">
                        <h3 class="text-xl font-medium" [ngClass]="{'text-green-400 line-through decoration-green-500/50': topic.isCompleted, 'text-gray-200': !topic.isCompleted}">
                            {{ topic.content }}
                        </h3>
                    </div>
                </div>
            </div>
        </div>
        
        <div *ngIf="error" class="text-red-400 p-4 border border-red-900 rounded bg-red-900/10">
            {{ error }}
        </div>
      </div>
    </div>
  `,
    styles: [`
    ::ng-deep .mat-mdc-form-field {
      --mdc-outlined-text-field-label-text-color: #9ca3af;
      --mdc-outlined-text-field-input-text-color: white;
      --mdc-outlined-text-field-outline-color: #4b5563;
    }
    ::ng-deep .mat-mdc-select-value {
      color: white;
    }
    /* Customize checkbox to fit dark theme better if needed */
    ::ng-deep .mat-mdc-checkbox .mdc-checkbox .mdc-checkbox__background {
        border-color: #6b7280 !important; 
    }
    ::ng-deep .mat-mdc-checkbox.mat-primary.mat-mdc-checkbox-checked .mdc-checkbox .mdc-checkbox__background {
        background-color: #22c55e !important;
        border-color: #22c55e !important;
    }
  `]
})
export class RoadmapViewComponent implements OnInit {
    roadmap: Roadmap | null = null;
    employees: User[] = [];
    selectedEmployeeId: number | null = null;
    currentUser: User | null = null;
    loading = true;
    error = '';
    assigning = false;
    assignmentSuccess = false;
    assignmentError = '';

    private route = inject(ActivatedRoute);
    private roadmapService = inject(RoadmapService);
    private authService = inject(AuthService);

    get progress(): number {
        if (!this.roadmap || !this.roadmap.topics || this.roadmap.topics.length === 0) return 0;
        const completedCount = this.roadmap.topics.filter(t => t.isCompleted).length;
        return Math.round((completedCount / this.roadmap.topics.length) * 100);
    }

    get isManager(): boolean {
        return this.currentUser?.role === 'Manager';
    }

    get isEmployee(): boolean {
        return this.currentUser?.role === 'Employee';
    }

    ngOnInit() {
        this.currentUser = this.authService.currentUserValue;

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadRoadmap(id);
            if (this.isManager) {
                this.loadEmployees();
            }
        } else {
            this.error = 'Invalid ID';
            this.loading = false;
        }
    }

    loadRoadmap(id: string) {
        this.roadmapService.get(id).subscribe({
            next: (res) => {
                this.roadmap = res;
                this.selectedEmployeeId = res.assignedToUserId || null;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Roadmap not found.';
                this.loading = false;
            }
        });
    }

    loadEmployees() {
        this.authService.getEmployees().subscribe({
            next: (employees) => {
                this.employees = employees;
            },
            error: (err) => {
                console.error('Failed to load employees', err);
            }
        });
    }

    assignRoadmap() {
        if (!this.roadmap) return;

        this.assigning = true;
        this.assignmentSuccess = false;
        this.assignmentError = '';

        this.roadmapService.assignRoadmap(this.roadmap.id, this.selectedEmployeeId).subscribe({
            next: () => {
                this.assigning = false;
                this.assignmentSuccess = true;
                if (this.roadmap) {
                    this.roadmap.assignedToUserId = this.selectedEmployeeId || undefined;
                }
                setTimeout(() => this.assignmentSuccess = false, 3000);
            },
            error: (err) => {
                this.assigning = false;
                this.assignmentError = 'Failed to assign roadmap. Please try again.';
                console.error(err);
            }
        });
    }

    getEmployeeEmail(userId: number): string {
        const emp = this.employees.find(e => e.id === userId);
        return emp ? emp.email : `User #${userId}`;
    }

    toggleTopic(topic: Topic, event: any) {
        if (!this.roadmap) return;

        const isCompleted = event.checked;
        const targetIndex = topic.orderIndex;

        // Optimistic UI update
        // We need to create a new array or update existing one to trigger change detection if needed, 
        // simplifies logic to just iterate.
        this.roadmap.topics.forEach(t => {
            if (isCompleted) {
                if (t.orderIndex <= targetIndex) t.isCompleted = true;
            } else {
                if (t.orderIndex >= targetIndex) t.isCompleted = false;
            }
        });

        this.roadmapService.updateTopicCompletion(this.roadmap.id, topic.id, isCompleted).subscribe({
            error: (err) => {
                console.error('Failed to update topic completion', err);
                // Ideally revert validation here, but keeping simple for now
            }
        });
    }
}
