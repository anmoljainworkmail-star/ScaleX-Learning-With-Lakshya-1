import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RoadmapViewComponent } from './components/roadmap-view/roadmap-view.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'roadmap/:id', component: RoadmapViewComponent }
];
