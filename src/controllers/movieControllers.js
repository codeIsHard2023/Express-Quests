const database = require("../../database");

const getMovies = (req, res) => {
  // let sql = "SELECT * FROM movies";
  // const sqlValues = [];

  // if (req.query.color != null) {
  //   sql += " WHERE color = ?";
  //   sqlValues.push(req.query.color);
  //   console.info(sqlValues);

  //   if (req.query.max_duration != null) {
  //     sql += " AND duration <= ?";
  //     sqlValues.push(req.query.max_duration);
  //   }
  // } else if (req.query.max_duration != null) {
  //   sql += " WHERE duration <= ?";
  //   sqlValues.push(req.query.max_duration);
  // }
  const initialSql = "select * from movies";
  const where = [];

  if (req.query.color != null) {
    where.push({
      column: "color",
      value: req.query.color,
      operator: "=",
    });
  }
  if (req.query.max_duration != null) {
    where.push({
      column: "duration",
      value: req.query.max_duration,
      operator: "<=",
    });
  }

  database
    .query(
      where.reduce(
        (sql, { column, operator }, index) =>
          `${sql} ${index === 0 ? "where" : "and"} ${column} ${operator} ?`,
        initialSql
      ),
      where.map(({ value }) => value)
    )
    .then(([movies]) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
  // database
  //   .query(sql, sqlValues)
  //   .then(([movies]) => {
  //     res.status(200).json(movies);
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     res.sendStatus(500);
  //   });
};

const getMovieById = (req, res) => {
  const id = parseInt(req.params.id);
  database
    .query("SELECT * FROM movies WHERE id = ?", [id]) //id sera lu à partir de l'adresse url, ensuite transformé en INT et enfin vérifié si existe dans le tableau movies
    .then(([movies]) => {
      if (movies[0] != null) {
        res.status(200).json(movies[0]);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const postMovie = (req, res) => {
  const { title, director, year, color, duration } = req.body;

  database
    .query(
      "INSERT INTO movies (title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
      [title, director, year, color, duration]
    )
    .then(([result]) => {
      res.status(201).send({ id: result.insertId });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const updateMovie = (req, res) => {
  const id = parseInt(req.params.id);
  const { title, director, year, color, duration } = req.body;
  database
    .query(
      "UPDATE movies SET title = ?, director = ?, year = ?, color = ?, duration = ? WHERE id = ?",
      [title, director, year, color, duration, id]
    )
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const deleteMovie = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("DELETE FROM movies WHERE id = ? ", [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

module.exports = {
  getMovies,
  getMovieById,
  postMovie,
  updateMovie,
  deleteMovie,
};
