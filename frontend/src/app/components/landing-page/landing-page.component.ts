import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router, RouterModule } from '@angular/router';
import { RoadmapService } from '../../services/roadmap.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DragDropModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-start p-4 relative overflow-y-auto">
      <div class="absolute top-4 right-4 z-10 flex gap-2">
          <button *ngIf="isManager" mat-flat-button [routerLink]="['/progress']" class="!bg-indigo-600 !text-white hover:!bg-indigo-700 transition-colors">
            All Roadmaps
          </button>
          <button mat-flat-button (click)="logout()" class="!bg-red-600 !text-white hover:!bg-red-700 transition-colors">
            Logout
          </button>
      </div>

      <div class="max-w-4xl w-full text-center space-y-8 mt-10">
        <div *ngIf="!isGenerated" class="space-y-8 transition-all duration-500">
            <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Roadmap Generator
            </h1>
            <p class="text-gray-400 text-lg">
              Enter a topic to generate a personalized learning path powered by AI.
            </p>
        </div>

        <div class="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 transition-all duration-500" [ngClass]="{'mt-0': isGenerated, 'mt-8': !isGenerated}">
          <div class="flex gap-4 items-center">
              <mat-form-field appearance="outline" class="w-full text-gray-200">
                <mat-label>What do you want to learn?</mat-label>
                <input matInput [(ngModel)]="query" (keyup.enter)="generate()" placeholder="e.g. Angular Advanced Patterns" [disabled]="loading || isGenerated">
              </mat-form-field>

              <button *ngIf="!isGenerated" mat-flat-button color="primary" 
                      class="!h-[56px] !text-lg !rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all" 
                      (click)="generate()" 
                      [disabled]="loading || !query">
                <span *ngIf="!loading">Generate</span>
                <span *ngIf="loading"><mat-spinner diameter="20"></mat-spinner></span>
              </button>

              <button *ngIf="isGenerated" mat-stroked-button color="warn" class="!h-[56px]" (click)="reset()">
                Reset
              </button>
          </div>
        </div>

        <!-- Integrated Roadmap Editor -->
        <div *ngIf="isGenerated" class="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 text-left animate-fade-in-up">
            <div class="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <div>
                    <h2 class="text-2xl font-bold text-white mb-1">Your Roadmap: {{ query }}</h2>
                    <p class="text-gray-400 text-sm">Drag to reorder, click text to edit</p>
                </div>
                <button mat-flat-button color="accent" class="!bg-green-600 !text-white" (click)="save()">
                    <mat-icon class="mr-2">save</mat-icon> Save Roadmap
                </button>
            </div>

            <div cdkDropList (cdkDropListDropped)="drop($event)" class="space-y-3">
                <div *ngFor="let topic of topics; let i = index" cdkDrag
                     class="group flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition-all cursor-move shadow-sm hover:shadow-lg">
                    
                    <div class="text-gray-500 cursor-move">
                        <mat-icon>drag_indicator</mat-icon>
                    </div>

                    <div class="flex-1">
                        <input [(ngModel)]="topics[i]" 
                               class="w-full bg-transparent border-none text-lg text-gray-200 focus:outline-none focus:ring-0 placeholder-gray-600"
                               placeholder="Topic content...">
                    </div>

                    <button mat-icon-button color="warn" (click)="removeTopic(i)" class="opacity-0 group-hover:opacity-100 transition-opacity">
                        <mat-icon>delete</mat-icon>
                    </button>
                </div>
            </div>

            <!-- Refine Section -->
            <div class="mt-8 pt-6 border-t border-gray-700">
                <label class="block text-gray-400 text-sm font-medium mb-2">Refine or Add new topics</label>
                <div class="flex gap-2">
                    <div class="flex-1 relative">
                        <input [(ngModel)]="refineInstruction" 
                               (keyup.enter)="refine()"
                               placeholder="e.g. 'Add a section on Performance Tuning'"
                               class="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none transition-colors">
                        
                        <button *ngIf="refineInstruction" mat-icon-button (click)="refineInstruction = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                            <mat-icon>close</mat-icon>
                        </button>
                    </div>
                    
                    <button mat-flat-button color="primary" 
                            class="!h-auto !px-6 !rounded-lg bg-blue-600 hover:bg-blue-500" 
                            (click)="refine()" 
                            [disabled]="loading || !refineInstruction">
                         <mat-icon *ngIf="!loading">auto_awesome</mat-icon>
                         <mat-spinner *ngIf="loading" diameter="20" class="mr-2"></mat-spinner>
                         Refine
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* Override Material styles */
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #1f2937 !important; /* bg-gray-800 */
    }
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: #4b5563 !important; /* border-gray-600 */
    }
    ::ng-deep input.mat-mdc-input-element {
      color: white !important;
    }
    ::ng-deep .mat-mdc-form-field-label {
      color: #9ca3af !important; /* text-gray-400 */
    }
    ::ng-deep .mat-mdc-icon-button {
        --mat-mdc-icon-button-icon-color: #9ca3af;
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LandingPageComponent {
  query = '';
  loading = false;
  isGenerated = false;
  topics: string[] = [];
  refineInstruction = '';

  private roadmapService = inject(RoadmapService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get isManager(): boolean {
    return this.authService.currentUserValue?.role === 'Manager';
  }

  generate() {
    if (!this.query.trim()) return;

    this.loading = true;
    this.roadmapService.generate(this.query).subscribe({
      next: (res) => {
        this.loading = false;
        this.topics = res.topics;
        this.isGenerated = true;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Failed to generate roadmap. Please check backend configuration.');
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.topics, event.previousIndex, event.currentIndex);
  }

  removeTopic(index: number) {
    this.topics.splice(index, 1);
  }

  refine() {
    if (!this.refineInstruction) return;

    this.loading = true;
    this.roadmapService.refine(this.topics, this.refineInstruction).subscribe({
      next: (res) => {
        this.topics = res.topics;
        this.refineInstruction = '';
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Refinement failed.');
      }
    });
  }

  save() {
    this.loading = true;
    this.roadmapService.save(this.topics).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/roadmap', res.id]);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Failed to save roadmap.');
      }
    });
  }

  reset() {
    this.isGenerated = false;
    this.topics = [];
    this.query = '';
  }

  logout() {
    this.authService.logout();
  }
}

