import jwt from 'jsonwebtoken'

import db, { sequelize } from '../models/index';

let { TokenExpiredError } = jwt;
let catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
    }
    return res.sendStatus(401).send({ message: "Unauthorized!" });
}

let verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
}

let isAdmin = async (req, res, next) => {
    console.log(req.body);
    let user = await db.Users.findOne({
        where: {
            email: req.body.email
        },
        attributes: {
            exclude: ['roleId','createdAt','updatedAt'],
        },
        include: [
            {model: db.Roles, as: 'role', attributes: ['id','name']}
        ],
        raw: true,
        nest: true
    })
    if(user.role.name === 'admin') {
        next();
    }else{
      return res.status(403).json({
        message: "Require Admin Role!"
      });
      
    }
}

let isModerator = async (req, res, next) => {
    console.log(req.body);
    let user = await db.Users.findOne({
        where: {
            email: req.body.email
        },
        attributes: {
            exclude: ['roleId','createdAt','updatedAt'],
        },
        include: [
            {model: db.Roles, as: 'role', attributes: ['id','name']}
        ],
        raw: true,
        nest: true
    })
    if(user.role.name === 'moderator') {
        next();
    }else{
      return res.status(403).json({
        message: "Require moderator Role!"
      });
      
    }
}

let isUser = async (req, res, next) => {
    console.log(req.body);
    let user = await db.Users.findOne({
        where: {
            email: req.body.email
        },
        attributes: {
            exclude: ['roleId','createdAt','updatedAt'],
        },
        include: [
            {model: db.Roles, as: 'role', attributes: ['id','name']}
        ],
        raw: true,
        nest: true
    })
    console.log(user);
    if(user.role.name === 'user') {
        next();
    }else{
      return res.status(403).json({
        message: "Require User Role!"
      });
      
    }
}


module.exports = {
    verifyToken,
    isAdmin,
    isModerator,
    isUser
}