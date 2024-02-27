const database = require("../../database");

const getUsers = (req, res) => {
  let initialSql = "SELECT * FROM users";
  // const sqlValues = [];
  const where = [];

  if (req.query.language != null) {
    where.push({
      column: "language",
      value: req.query.language,
      operator: "=",
    });
  }
  if (req.query.city != null) {
    where.push({
      column: "city",
      value: req.query.city,
      operator: "=",
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
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
  // if (req.query.language != null) {
  //   initialSql += " where language = ?";
  //   sqlValues.push(req.query.language);

  //   if (req.query.city != null) {
  //     initialSql += " and city = ?";
  //     sqlValues.push(req.query.city);
  //   }
  // } else if (req.query.city != null) {
  //   initialSql += " where city = ?";
  //   sqlValues.push(req.query.city);
  // }
  // database
  //   .query(initialSql, sqlValues)
  //   .then(([users]) => {
  //     res.status(200).json(users);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.sendStatus(500);
  //   });
};

const getUserId = (req, res) => {
  const id = parseInt(req.params.id);
  database
    .query("SELECT * FROM users WHERE id = ? ", [id])
    .then(([users]) => {
      if (users[0] != null) {
        res.status(200).json(users[0]);
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const postUser = (req, res) => {
  const { firstname, lastname, email, city, language } = req.body;

  database
    .query(
      "INSERT INTO users (firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language]
    )
    .then(([result]) => {
      res.status(201).send({ id: result.insertId });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const updateUser = (req, res) => {
  const id = parseInt(req.params.body);
  const { firstname, lastname, email, city, language } = req.body;
  database
    .query(
      "UPDATE INTO users firstname = ?, lastname = ?, email = ?, city = ?, language =? WHERE id = ? "[
        (firstname, lastname, email, city, language, id)
      ]
    )
    .then(([result]) => {
      res.status(204).sent({ id: result.insertId });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("DELETE FROM users WHERE id = ?", [id])
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
  getUsers,
  getUserId,
  postUser,
  updateUser,
  deleteUser,
};
