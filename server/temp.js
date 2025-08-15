const axios = require("axios");

(async () => {
  const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
    language: "python",
    version: "3.10.0",
    files: [{ content: "print(2+3)" }],
    stdin: "",
    run_timeout: 5000,
    run_memory_limit: 128 * 1024 * 1024,
  });
  console.log(res.data.run.output); // -> "5\n"
})();