const express = require("express");
const axios   = require("axios");
const router  = express.Router();

// Public Piston endpoint
const PISTON_URL = "https://emkc.org/api/v2/piston";

/* ---------- fetch supported runtimes ---------- */
router.get("/runtimes", async (_req, res) => {
  try {
    const { data } = await axios.get(`${PISTON_URL}/runtimes`);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Unable to fetch runtimes" });
  }
});

/* ---------- execute code ---------- */
router.post("/", async (req, res) => {
  const { language, code, input = "", args = [] } = req.body;

  /* basic validation */
  if (!code || code.length > 256 * 1024)
    return res.status(413).json({ error: "Code too large" });
  if ((input || "").length > 64 * 1024)
    return res.status(413).json({ error: "Input too large" });

  try {
    /* find matching runtime */
    const { data: runtimes } = await axios.get(`${PISTON_URL}/runtimes`);
    const matched = runtimes.find(
      (rt) => rt.language === language || (rt.aliases || []).includes(language)
    );
    if (!matched)
      return res.status(400).json({ error: "Language not supported" });

    /* build payload */
    const payload = {
      language: matched.language,
      version:  matched.version,
      files:    [{ content: code }],
      stdin:    input,
      args:     args,
      run_timeout: 5000,
      run_memory_limit: 128 * 1024 * 1024,
    };

    /* run code */
    const { data } = await axios.post(`${PISTON_URL}/execute`, payload, {
      timeout: 6000,
    });

    res.json({
      output:   data.run.output,
      code:     data.run.code,
      language: data.language,
      version:  data.version,
    });
  } catch (err) {
    console.error("[/api/run] error:", err.message);
    res.status(500).json({ error: "Execution failed" });
  }
});

module.exports = router;