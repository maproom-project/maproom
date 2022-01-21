const path = require("path");
const express = require("express");
const router = express.Router();

// page mappings
const routes = {
  "index.html": "/",
  "upload.html": "/upload",
  "update.html": "/update",
  "help.html": "/help"
};

// delivers html files to client
for (let filename in routes)
  router.get(routes[filename], (req, res) => {
    res.sendFile(filename, {
      root: path.join(__dirname, "../views")
    });
  });

module.exports = router;
