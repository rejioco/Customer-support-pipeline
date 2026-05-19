export type SupportState = {
  query: string;
  intent?: string;
  sentiment?: string;
  confidence?: number;
  retrievedDocs?: { score: number; content: unknown; }[];
  currentNode?: string;
  finalResponse?:string;
  escalationNeeded?: boolean;
};
