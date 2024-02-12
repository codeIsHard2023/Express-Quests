//on import ici dotenv afin de pouvoir ensuite utiliser les clés de .env
require("dotenv").config();

//ici on importe le package mysql
const mysql = require("mysql2/promise");

//ici on va créer un objet qui contient les clés de connexion à la BDD à l'aide des variables d'environnement qui viennent de .env et sont ensuite utiliser grâce à process.env
const database = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

database
  .getConnection()
  .then(() => {
    console.log("Can reach database");
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = database;
