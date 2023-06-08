import db, { sequelize } from "../models/index";

let checkEmail = (req, res, next) => {
  let email = req.body.email;
  return new Promise(async (resolve, reject) => {
    try {
      if (!email) return res.status(400).json({ message: "Invalid email" });
      let user = await db.users.findOne({
        where: {
          email: email,
        },
      });
      if (user) {
        resolve(
          res.status(400).json({
            status: "Error",
            message: "Failed! Email is already in use!",
          })
        );
        return;
      } else {
        next();
      }
    } catch (error) {
      reject(error);
    }
  });
};

let checkPassword = async (req, res, next) => {
  let password = req.body.password;
  let repassword = req.body.repassword;
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password needs to be at least 8 characters long",
    });
  } else if (password != repassword) {
    res.status(400).json({
      message: "Re-entered password is incorrect !",
    });
    return;
  } else {
    next();
  }
};
let checkRolesExisted = async (req, res, next) => {
  let arrRoles = [];
  let roles = req.body.roles;
  let rolesDB = await db.roles.findAll({
    attributes: {
      exclude: ["id", "createdAt", "updatedAt"],
    },
  });
  rolesDB.map((roles) => {
    arrRoles.push(roles.name);
  });
  if (roles) {
    for (let i = 0; i < roles.length; i++) {
      if (!arrRoles.includes(roles[i].toLowerCase())) {
        return res.status(400).json({
          message: "Failed! Role does not exist = " + req.body.roles[i],
        });
      }
    }
    next();
  } else {
    return res.status(400).json({
      message: "Invalid roles ",
    });
  }
};

module.exports = {
  checkEmail,
  checkPassword,
  checkRolesExisted,
};
