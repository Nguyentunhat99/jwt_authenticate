import bcrypt from 'bcryptjs';

import db, { sequelize } from '../models/index';
import jwt  from 'jsonwebtoken';
// import config from '../config/auth.config'

const salt = bcrypt.genSaltSync(10);
const Op = db.Sequelize.Op;
require('dotenv').config()
const { v4: uuidv4 } = require("uuid");



let createAccount = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password.trim());
            await db.users.create({
                username: data.username.trim(), 
                email: data.email.trim(), 
                password: hashPasswordFromBcrypt                
            })
            resolve({
                status: "Success",
                message: 'Added user successfully!'
            }); 
            let userFind = await db.users.findOne({
                where: {
                    email: data.email
                }
            })
            if(data.role){
                let roles = await db.roles.findAll({
                    where: {
                        name: {
                          [Op.or]: data.role
                        }
                    },
                    attributes: {
                        exclude: ["name","createdAt", "updatedAt"],
                    },
                })
                roles.map(role => {
                    role.userId = userFind.id
                    role.roleId = role.id
                    delete role.id
                    return role
                })
                let userRoles = roles;
                await db.User_Roles.bulkCreate(userRoles)
            }else{
                await db.User_Roles.create({
                    userId: userFind.id,
                    roleId: 3
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}


let handleAuthLogin = (email, password) => {
    return new Promise(async(resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if (isExist) {
                let user = await db.users.findOne({
                    where: {
                        email: email,
                    },
                    attributes: {
                        exclude: ['createdAt','updatedAt'],
                    },
                })

                if (user) {
                    let userRoles = await db.User_Roles.findAll({
                        where: {
                            userId: user.id
                        },
                        attributes: {
                            exclude: ["userId",'createdAt','updatedAt'],
                        },
                    })
                    
                    let roles = [];
                    for(let i=0;i<userRoles.length;i++) {
                        if(userRoles[i].roleId === 1){
                            roles.push("role_admin");
                        }
                        if(userRoles[i].roleId === 2){
                            roles.push("role_moderator");
                        }
                        if(userRoles[i].roleId === 3){
                            roles.push("role_user");
                        }                                                
                    }
                    console.log(roles);
                    let token = jwt.sign({id:user.id}, process.env.JWT_SECRET_KEY, {
                        expiresIn: 86400
                    })                       
                    let check = bcrypt.compareSync(password, user.password);//kiem tra password
                    if (check){
                        userData.message = 'Ok';
                        user.roles = roles
                        delete user.password;
                        userData.user = user;
                        userData.accessToken = token
                    } else {
                        userData.accessToken = null,
                        userData.message = 'Wrong password';
                    }
                } else {
                    userData.message = `User does not exist`;
                    resolve(userData)
                }
            } else {
                userData.errmessage = `Your email does not exist. Please re-enter!`;
            }
            resolve(userData)
        } catch (error) {
            reject(error);
        }
    });
 
};

let checkUserEmail = (email) => {
    return new Promise(async(resolve, reject) => {
        try {
            let user = await db.users.findOne({
                where:{
                    email: email,
                }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (error) {
            reject(error);
        }
    })
}

let hashUserPassword = (password) => {
    return new Promise(async(resolve, reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword)
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    createAccount,
    handleAuthLogin
}
