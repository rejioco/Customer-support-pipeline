export type SupportState = {
  query: string;
  intent?: string;
  sentiment?: string;
  confidence?: string;
  retrievedDocs?: string[];
  currentNode?: string;
  finalResponse?:string;
  escalationNeeded?: boolean;
};
