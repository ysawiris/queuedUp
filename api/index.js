// Vercel serverless entrypoint. The Express app is itself a (req, res)
// handler, so Vercel's Node runtime can invoke it directly. vercel.json
// rewrites every path here.
module.exports = require("../app");
