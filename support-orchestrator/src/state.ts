export type SupportState = {
  query: string;
  intent?: string;
  sentiment?: string;
  confidence?: number;
  retrievedDocs?: string[];
  currentNode?: string;
  finalResponse?:string;
  escalationNeeded?: boolean;
};
