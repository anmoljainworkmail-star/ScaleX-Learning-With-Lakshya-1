
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateRequest, RefineRequest, RoadmapResponse } from '../models/roadmap-types';

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

    save(topics: string[]): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}`, { topics });
    }

    get(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
}
