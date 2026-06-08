import express from "express";
import { executePipeline } from "./pipeline.js";

const app = express();
app.use(express.json());
const PORT = 6969;

app.post("/query", async (req, res) => {
  try {
    const { query} = req.body;
    if (!query) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    // Invoke runPipeline function => returns me a state
    const response = await executePipeline()
    //
    
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// The user query has to go in the pipeline

await connectRedis(); // calling the function that is used to connect with redis

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
