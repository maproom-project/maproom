const fs = require("fs");
const express = require("express");
const application = express();

// external routing
const pageRoutes = require("./routes/pages");
application.use("/", pageRoutes);

fs.readdir("routes/api", (err, files) => {
  files.forEach(filename => {
    const name = filename.split(".")[0];
    const route = require(`./routes/api/${name}`);
    application.use("/api", route);
  });
});

// other middlewares
application.use(express.static("public"));
application.use(express.urlencoded({ extended: true }));
application.use(express.json());

application.listen(8081);
