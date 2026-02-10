
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateRequest, RefineRequest, RoadmapResponse, Roadmap } from '../models/roadmap-types';

@Injectable({
    providedIn: 'root'
})
export class RoadmapService {
    private apiUrl = 'https://localhost:7088/api/roadmap'; // Adjust port if needed

    constructor(private http: HttpClient) { }

    generate(query: string): Observable<RoadmapResponse> {
        const request: GenerateRequest = { query };
        return this.http.post<RoadmapResponse>(`${this.apiUrl}/generate`, request);
    }

    refine(currentList: string[], instruction: string): Observable<RoadmapResponse> {
        const request: RefineRequest = { currentList, instruction };
        return this.http.post<RoadmapResponse>(`${this.apiUrl}/refine`, request);
    }

    save(title: string, topics: string[]): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}`, { title, topics });
    }

    get(id: string): Observable<Roadmap> {
        return this.http.get<Roadmap>(`${this.apiUrl}/${id}`);
    }

    getAll(): Observable<Roadmap[]> {
        return this.http.get<Roadmap[]>(`${this.apiUrl}`);
    }

    assignRoadmap(roadmapId: string, userId: number | null): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${roadmapId}/assign`, { userId });
    }

    getAssignedRoadmaps(userId: number): Observable<Roadmap[]> {
        return this.http.get<Roadmap[]>(`${this.apiUrl}/assigned/${userId}`);
    }

    updateTopicCompletion(roadmapId: string, topicId: string, isCompleted: boolean): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${roadmapId}/topic/${topicId}/complete`, { isCompleted });
    }
}
