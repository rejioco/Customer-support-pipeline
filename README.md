# Support Orchestrator

An intelligent customer support agent orchestration system built with Node.js, TypeScript, Express, Redis, Qdrant, and Ollama (running local LLMs). 

The system routes, validates, retrieves, and processes user queries through a multi-node pipeline, deciding dynamically when to answer using local documentation (RAG), when to call operational APIs/tools, and when to escalate to human support.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript (`tsx` for direct execution)
- **Local LLM Orchestrator**: [Ollama](https://ollama.com/) running `llama3.1:latest`
- **Embedding Model**: `nomic-embed-text`
- **Vector Database**: [Qdrant](https://qdrant.tech/) (running locally at port `6333`)
- **Key-Value Store / Caching**: [Redis](https://redis.io/) (for session & conversation history)
- **Web Framework**: Express.js
- **Validation**: Zod (for strict JSON schema validation of LLM outputs)

---

## 🏗️ Pipeline Architecture

The orchestration engine processes every incoming query through a structured sequence of stateful nodes:

```mermaid
graph TD
    Start([User Query]) --> Classify[1. Classification Node]
    Classify --> Router1{Confidence >= 0.5?}
    
    %% Escalation Flow
    Router1 -- No / Failures --> Escalate[Escalation Node]
    Escalate --> Human([Human Support / Agent Ticket])
    
    %% RAG Flow
    Router1 -- Yes --> Retrieve[2. Retrieval Node]
    Retrieve --> Validate[3. Retrieval Validator Node]
    Validate --> Router2{Valid Context?}
    
    Router2 -- No --> Escalate
    Router2 -- Yes --> ToolDecide[4. Tool Decision Node]
    
    ToolDecide --> Router3{Tool Needed?}
    Router3 -- Yes --> ToolCall[5. Tool Call Node]
    ToolCall --> Generate[6. Generation Node]
    Router3 -- No --> Generate
    
    Generate --> Response[7. Response Node]
    Response --> End([Final Response])
```

### Node Descriptions

1. **Classification Node** ([classifier.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/nodes/classifier.ts)): 
   Uses `llama3.1` to classify the query's intent (e.g., `billing`, `shipping`, `after_sales`, `technical`, `account`, `miscellaneous`), sentiment (e.g., `positive`, `neutral`, `negative`), and computes a confidence score. If LLM output fails schema validation, it retries up to 2 times before auto-escalating.
2. **Router** ([router.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/router.ts)):
   Determines the next step. If confidence is below `0.5`, it routes to the Escalation Node. Otherwise, it routes to Retrieval.
3. **Retrieval Node** ([retrieval.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/nodes/retrieval.ts)):
   Generates a vector embedding for the query using `nomic-embed-text` and retrieves the top 3 most relevant documents from the Qdrant `support-docs` collection.
4. **Retrieval Validator Node** ([retrievalValidator.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/nodes/retrievalValidator.ts)):
   Validates if the retrieved documents actually contain sufficient information to address the query. If no relevant docs match (score > `0.6`), it bypasses LLM and routes straight to Escalation.
5. **Tool Decision Node** ([toolDecide.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/nodes/toolDecide.ts)):
   Determines if the request requires real-time operations (e.g., order tracking, refund status, live account details).
6. **Tool Call Node** ([toolCall.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/nodes/toolCall.ts)):
   Selects the correct tool (e.g., `getOrderStatus`, `getRefundStatus`) and extracts the required inputs (like `orderId`) from the query/history to execute the action.
7. **Generation Node** ([generation.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/nodes/generation.ts)):
   Combines conversation history (from Redis), retrieved document context, and tool execution results to generate a concise, professional response.
8. **Response Node** ([response.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/nodes/response.ts)):
   Prepares the final response state to return to the caller.
9. **Escalation Node** ([escalation.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/nodes/escalation.ts)):
   Gracefully flags the ticket for human intervention when the LLM is unconfident, validation fails, or appropriate resources are missing.

---

## 🚦 Prerequisites

Ensure you have the following running on your local machine:

1. **Redis**: Running on `localhost:6379`
   ```bash
   # Run via Docker
   docker run -d --name support-redis -p 6379:6379 redis
   ```
2. **Qdrant**: Running on `localhost:6333`
   ```bash
   # Run via Docker
   docker run -d --name support-qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant
   ```
3. **Ollama**: Running on `localhost:11434`
   - Download and install [Ollama](https://ollama.com/).
   - Pull the required models:
     ```bash
     ollama pull llama3.1
     ollama pull nomic-embed-text
     ```

---

## 🚀 Getting Started

### 1. Install Dependencies
Navigate to the project folder and install dependencies:
```bash
npm install
```

### 2. Set Up Qdrant Collection
Create the required `support-docs` vector collection (configured for 768-dimensional cosine similarity vectors):
```bash
npx tsx src/setupQdrant.ts
```

### 3. Index Knowledge Base Documents
Index the local markdown-based company policies ([docs.ts](file:///Users/ayush/Orchestrator/support-orchestrator/src/data/docs.ts)) into Qdrant:
```bash
npx tsx src/indexDocs.ts
```

### 4. Start the Server
Run the Express API server (runs on port `6969`):
```bash
npx tsx src/server.ts
```

---

## 📡 API Endpoints

### `POST /query`
Submits a query to the support orchestrator. Conversations are tracked and stored in Redis using the `sessionId`.

#### Request Headers
`Content-Type: application/json`

#### Request Body
```json
{
  "query": "Where is my order ORD123?",
  "sessionId": "session_user_99"
}
```

#### Example Response (Successful Tool Call)
```json
{
  "query": "Where is my order ORD123?",
  "currentNode": "response",
  "retryCount": 0,
  "messages": [],
  "intent": "shipping",
  "sentiment": "neutral",
  "confidence": 0.95,
  "retrievedDocs": [
    {
      "score": 0.82,
      "content": "\nShipping & Delivery Policy\n\nOrders are processed within..."
    }
  ],
  "retrievalValid": true,
  "retrievalConfidence": 0.95,
  "reason": "Retrieved documents contain shipping and delivery policy information.",
  "toolNeeded": true,
  "toolName": "getOrderStatus",
  "toolInput": "ORD123",
  "toolResponse": {
    "status": "Out for delivery",
    "eta": "Tomorrow"
  },
  "finalResponse": "Your order ORD123 is currently out for delivery and is expected to arrive tomorrow."
}
```

#### Example Response (Escalated Query)
```json
{
  "query": "Can I get a discount because the moon is blue?",
  "currentNode": "escalation",
  "retryCount": 0,
  "messages": [],
  "intent": "miscelleneous",
  "sentiment": "neutral",
  "confidence": 0.2,
  "escalationNeeded": true,
  "finalResponse": "You have been escalated to human support agent"
}
```

---

## 📂 Project Structure

```
support-orchestrator/
├── src/
│   ├── config/
│   │   └── redis.ts                     # Redis connection settings
│   ├── data/
│   │   └── docs.ts                      # Local knowledge base documentation
│   ├── nodes/
│   │   ├── classifier.ts                # Intent & sentiment classification node
│   │   ├── escalation.ts                # Human agent escalation node
│   │   ├── generation.ts                # LLM response generation node
│   │   ├── response.ts                  # Final response formatter node
│   │   ├── retrieval.ts                 # Document retrieval (Qdrant search) node
│   │   ├── retrievalValidator.ts        # Retrieved document relevance checker node
│   │   ├── toolCall.ts                  # Target tool execution node
│   │   └── toolDecide.ts                # Tool vs. Policy selector node
│   ├── tools/
│   │   └── orderTools.ts                # Hardcoded/mock APIs for orders/refunds
│   ├── customer-sentiment-classifier.ts # Standalone classification example script
│   ├── embed.ts                         # Embedding generation helper (nomic-embed-text)
│   ├── indexDocs.ts                     # Document indexing script
│   ├── qdrant.ts                        # Qdrant client connection
│   ├── router.ts                        # Pipeline routing helper functions
│   ├── runPipeline.ts                   # Core orchestrator pipeline manager
│   ├── server.ts                        # Express API server setup
│   ├── setupQdrant.ts                   # Vector DB collection setup script
│   └── state.ts                         # SupportState type definition
├── package.json
└── README.md
```