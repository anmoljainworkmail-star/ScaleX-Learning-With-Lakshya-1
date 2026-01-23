
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RoadmapService } from '../../services/roadmap.service';
import { RoadmapDialogComponent } from '../roadmap-dialog/roadmap-dialog.component';

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
        MatDialogModule
    ],
    template: `
    <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div class="max-w-xl w-full text-center space-y-8">
        <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Roadmap Generator
        </h1>
        <p class="text-gray-400 text-lg">
          Enter a topic to generate a personalized learning path powered by AI.
        </p>

        <div class="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
          <mat-form-field appearance="outline" class="w-full text-gray-200">
            <mat-label>What do you want to learn?</mat-label>
            <input matInput [(ngModel)]="query" (keyup.enter)="generate()" placeholder="e.g. Angular Advanced Patterns" [disabled]="loading">
          </mat-form-field>

          <button mat-flat-button color="primary" 
                  class="w-full mt-4 !h-12 !text-lg !rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-[1.02]" 
                  (click)="generate()" 
                  [disabled]="loading || !query">
            <span *ngIf="!loading">Generate Roadmap</span>
            <span *ngIf="loading" class="flex items-center justify-center gap-2">
              <mat-spinner diameter="20"></mat-spinner> Generating...
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    /* Override Material styles for dark theme look */
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
  `]
})
export class LandingPageComponent {
    query = '';
    loading = false;

    private roadmapService = inject(RoadmapService);
    private dialog = inject(MatDialog);

    generate() {
        if (!this.query.trim()) return;

        this.loading = true;
        this.roadmapService.generate(this.query).subscribe({
            next: (res) => {
                this.loading = false;
                this.openDialog(res.topics);
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                alert('Failed to generate roadmap. Please check backend configuration.');
            }
        });
    }

    openDialog(topics: string[]) {
        this.dialog.open(RoadmapDialogComponent, {
            data: { topics, originalQuery: this.query },
            width: '800px',
            height: '90vh',
            maxWidth: '95vw',
            panelClass: 'custom-dialog-container',
            disableClose: true
        });
    }
}
