
import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RoadmapService } from '../../services/roadmap.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roadmap-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="h-full flex flex-col bg-gray-900 text-white">
      <!-- Header -->
      <div class="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800">
        <div>
          <h2 class="text-2xl font-bold text-white mb-1">Your Roadmap</h2>
          <p class="text-gray-400 text-sm">Drag to reorder, click text to edit</p>
        </div>
        <div class="flex gap-2">
            <button mat-icon-button (click)="close()" class="text-gray-400 hover:text-white">
                <mat-icon>close</mat-icon>
            </button>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-6" cdkDropList (cdkDropListDropped)="drop($event)">
        <div *ngFor="let topic of topics; let i = index" cdkDrag
             class="group flex items-center gap-4 bg-gray-800 p-4 mb-3 rounded-xl border border-gray-700 hover:border-blue-500 transition-all cursor-move shadow-sm hover:shadow-lg">
          
          <!-- Drag Handle -->
          <div class="text-gray-500 cursor-move">
            <mat-icon>drag_indicator</mat-icon>
          </div>

          <!-- Content (Editable) -->
          <div class="flex-1">
             <input [(ngModel)]="topics[i]" 
                    class="w-full bg-transparent border-none text-lg text-gray-200 focus:outline-none focus:ring-0 placeholder-gray-600"
                    placeholder="Topic content...">
          </div>

          <!-- Actions -->
          <button mat-icon-button color="warn" (click)="removeTopic(i)" class="opacity-0 group-hover:opacity-100 transition-opacity">
            <mat-icon>delete</mat-icon>
          </button>
        </div>

        <div *ngIf="topics.length === 0" class="text-center text-gray-500 py-10">
            No topics. Refine your query to generate new ones.
        </div>
      </div>

      <!-- Footer / Refine Section -->
      <div class="p-6 bg-gray-800 border-t border-gray-700">
        <label class="block text-gray-400 text-sm font-medium mb-2">Refine or Add new topics</label>
        <div class="flex gap-2">
          <div class="flex-1 relative">
            <input [(ngModel)]="refineInstruction" 
                   (keyup.enter)="refine()"
                   placeholder="e.g. 'Add a section on Performance Tuning' or 'Make it more beginner friendly'"
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

        <div class="flex justify-end mt-6 gap-3">
            <button mat-stroked-button color="warn" (click)="close()">Cancel</button>
            <button mat-flat-button color="accent" class="!bg-green-600 !text-white" (click)="save()">
                <mat-icon class="mr-2">save</mat-icon> Save Roadmap
            </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-icon-button {
        --mat-mdc-icon-button-icon-color: #9ca3af;
    }
  `]
})
export class RoadmapDialogComponent {
  topics: string[] = [];
  refineInstruction = '';
  loading = false;

  private roadmapService = inject(RoadmapService);
  private router = inject(Router);

  constructor(
    public dialogRef: MatDialogRef<RoadmapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { topics: string[], originalQuery: string }
  ) {
    this.topics = [...data.topics]; // Clone array
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
        this.dialogRef.close();
        this.router.navigate(['/roadmap', res.id]);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Failed to save roadmap.');
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
