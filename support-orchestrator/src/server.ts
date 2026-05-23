import express from "express";
import { runPipeline } from "./runPipeline";

const app = express();
app.use(express.json());
const PORT = 6969;

app.post("/query", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    // Invoke runPipeline function => returns me a state
    const response = await runPipeline(query);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// The user query has to go in the pipeline

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
