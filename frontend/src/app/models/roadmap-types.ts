
export interface GenerateRequest {
    query: string;
}

export interface RefineRequest {
    currentList: string[];
    instruction: string;
}

export interface RoadmapResponse {
    title: string;
    topics: string[];
}

export interface User {
    id: number;
    email: string;
    role: string;
}

export interface Topic {
    id: string;
    roadmapId: string;
    content: string;
    orderIndex: number;
    isCompleted: boolean;
}

export interface Roadmap {
    id: string;
    title: string;
    createdAt: string;
    assignedToUserId?: number;
    assignedToUser?: User;
    topics: Topic[];
}
