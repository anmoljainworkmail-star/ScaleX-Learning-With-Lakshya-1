
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

export interface User {
    id: number;
    email: string;
}

export interface Topic {
    id: string;
    roadmapId: string;
    content: string;
    orderIndex: number;
}

export interface Roadmap {
    id: string;
    title: string;
    createdAt: string;
    assignedToUserId?: number;
    topics: Topic[];
}
