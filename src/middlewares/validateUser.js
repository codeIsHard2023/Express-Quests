const Joi = require("joi");

const userSchema = Joi.object({
  firstname: Joi.string().max(255).required(),
  lastname: Joi.string().max(255).required(),
  email: Joi.string()
    .max(255)
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/)
    .required(),
});

const validateUser = (req, res, next) => {
  const { firstname, lastname, email } = req.body;

  const { error } = userSchema.validate(
    { firstname, lastname, email },
    { abortEarly: false }
  );

  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    next();
  }
};

/*Manual validation*/
// const validateUser = (req, res, next) => {
//   const { firstname, lastname, email } = req.body;
//   const errors = [];

//   const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;

//   if (firstname == null) {
//     errors.push({
//       field: "firstname",
//       message: "The field 'firstname' is required",
//     });
//   } else if (firstname.length >= 255) {
//     errors.push({
//       field: "firstname",
//       message: "Should contain less than 255 characters",
//     });
//   }
//   if (lastname == null) {
//     errors.push({
//       field: "lastname",
//       message: "The field 'lastname' is required",
//     });
//   } else if (lastname.length >= 255) {
//     errors.push({
//       field: "lastname",
//       message: "Should contain less than 255 characters",
//     });
//   }
//   if (!emailRegex.test(email)) {
//     errors.push({ field: "email", message: "Invalid email" });
//   }

//   if (errors.length) {
//     res.status(422).json({ validationErros: errors });
//   } else {
//     next();
//   }
// };

module.exports = validateUser;
