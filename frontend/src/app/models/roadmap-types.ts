
export interface GenerateRequest {
    query: string;
}

export interface RefineRequest {
    currentList: string[];
    instruction: string;
}

export interface RoadmapResponse {
    topics: string[];
}
