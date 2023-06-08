import bcrypt from "bcryptjs";

import db, { sequelize } from "../models/index";
import jwt from "jsonwebtoken";
import config from "../config/auth.config";

const salt = bcrypt.genSaltSync(10);
const Op = db.Sequelize.Op;
require("dotenv").config();

let response = {};

let createAccount = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPasswordFromBcrypt = await hashUserPassword(data.password.trim());
      await db.users.create({
        username: data.username.trim(),
        email: data.email.trim(),
        password: hashPasswordFromBcrypt,
      });
      resolve({
        status: "Success",
        message: "Added user successfully!",
      });
      let userFind = await db.users.findOne({
        where: {
          email: data.email,
        },
      });
      let roles = await db.roles.findAll({
        where: {
          name: {
            [Op.or]: data.roles,
          },
        },
        attributes: {
          exclude: ["name", "createdAt", "updatedAt"],
        },
      });
      roles.map((role) => {
        role.userId = userFind.id;
        role.roleId = role.id;
        delete role.id;
        return role;
      });
      let userRoles = roles;
      await db.User_Roles.bulkCreate(userRoles);
    } catch (error) {
      reject(error);
    }
  });
};

let handleAuthLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.users.findOne({
          where: {
            email: email,
          },
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        });
        if (user) {
          let userRoles = await db.User_Roles.findAll({
            where: {
              userId: user.id,
            },
            attributes: {
              exclude: ["userId", "createdAt", "updatedAt"],
            },
          });

          let roleId = [];
          userRoles.map((userRole) => {
            roleId.push(userRole.roleId);
          });

          let rolesDB = await db.roles.findAll({
            where: {
              id: {
                [Op.or]: roleId,
              },
            },
            attributes: {
              exclude: ["id", "createdAt", "updatedAt"],
            },
          });

          let roles = [];
          rolesDB.map((role) => {
            roles.push("role_" + role.name);
          });

          let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
            expiresIn: config.jwtExpiration,
          });
          let refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET_REFRESH_KEY,
            {
              expiresIn: config.jwtRefreshExpiration,
            }
          );

          let check = bcrypt.compareSync(password, user.password);
          if (check) {
            response.message = "Ok";
            user.roles = roles;
            delete user.password;
            response.user = user;
            (response.accessToken = token),
              (response.refreshToken = refreshToken);
          } else {
            (response.accessToken = null),
              (response.message = "Wrong password");
          }
        } else {
          response.message = `User does not exist`;
          resolve(response);
        }
      } else {
        response.message = `Your email does not exist. Please re-enter!`;
      }
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};
let refreshToken = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let dataToken = {};
      let { refreshToken } = data;
      let refreshTokenCompare = response.refreshToken;
      let userId = response.user.id;
      if (refreshToken && refreshToken === refreshTokenCompare) {
        let token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
          expiresIn: config.jwtExpiration,
        });

        (dataToken.accessToken = token),
          (dataToken.refreshToken = refreshToken);
      } else {
        dataToken.message = `Invalid request`;
      }
      resolve(dataToken);
    } catch (error) {
      reject(error);
    }
  });
};
let checkUserEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.users.findOne({
        where: {
          email: email,
        },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      var hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createAccount,
  handleAuthLogin,
  refreshToken,
};
