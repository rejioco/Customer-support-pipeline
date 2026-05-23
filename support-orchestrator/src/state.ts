export type SupportState = {
  query: string;
  intent?: string;
  sentiment?: string;
  confidence?: number;
  retrievedDocs?: { score: number; content: unknown; }[];
  currentNode?: string;
  finalResponse?:string;
  escalationNeeded?: boolean;
  toolNeeded?:boolean;
  toolName?:string;
  toolInput?:string;
  toolResponse?:any;
  retryCount:number;
  lastFailure?:string;
  retrievalValid?:boolean;
  retrievalConfidence?:number;
  reason?:string;
};
