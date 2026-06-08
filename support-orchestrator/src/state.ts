export type Metrics = {
  totalLatencyMs?:number;

  classificationLatencyMs?:number;
  retrievalLatencyMs?:number;
  retrievalValidationLatencyMs?:number;
  toolDecisionLatencyMs?:number;
  toolCallLatencyMs?:number;
  generationLatencyMs?:number;

  retrievalDocsCount?:number;
  retrievalTopScore?:number;
  toolInvoked?:boolean;
  escalated?:boolean;
}

export type Observations = {
  toolName:string;
  input:string;
  output:string;
}

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
  messages?:{role:"user"|"assistant",content:string}[];
  metrics?:Metrics;
  observations:Observations[];
};



export type CodingState = {
  query:string;
  toolNeeded?:boolean;
  toolName?:string;
  toolInput?:string;
  reason?:string;
  toolResponse?:string;
  observations:Observations[]
  messages?:{role:"user"|"assistant"|"tool",content:string}[];
}

