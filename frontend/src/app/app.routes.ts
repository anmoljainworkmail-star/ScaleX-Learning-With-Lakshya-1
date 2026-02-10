import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RoadmapViewComponent } from './components/roadmap-view/roadmap-view.component';
import { LoginComponent } from './components/login/login.component';
import { EmployeeRoadmapComponent } from './components/employee-roadmap/employee-roadmap.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'generate-roadmap', component: LandingPageComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'progress', component: EmployeeRoadmapComponent, canActivate: [authGuard] },
    { path: 'roadmap/:id', component: RoadmapViewComponent, canActivate: [authGuard] }
];
