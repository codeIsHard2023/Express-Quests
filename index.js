//import de "dotenv"
require("dotenv").config();
const app = require("./src/app");
//on consomme ici la variable APP_PORT
const port = process.env.APP_PORT;

app
  .listen(port, () => {
    console.log(`Server is listening on ${port}`);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });
