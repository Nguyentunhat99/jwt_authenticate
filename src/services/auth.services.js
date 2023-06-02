import bcrypt from 'bcryptjs';

import db, { sequelize } from '../models/index';
import jwt  from 'jsonwebtoken';
// import config from '../config/auth.config'

const salt = bcrypt.genSaltSync(10);
require('dotenv').config()


let createAcc = (data) => {
    console.log('data:',data);
    return new Promise(async(resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password.trim());
            await db.Users.create({
                username: data.username.trim(), 
                email: data.email.trim(), 
                password: hashPasswordFromBcrypt,
                roleId: data.roleId
                })
                resolve({
                    status: "Success",
                    message: 'Added user successfully!'
                }); 
            
        } catch (error) {
            reject(error)
        }
    })
}

let checkUserEmail = (email) => {
    return new Promise(async(resolve, reject) => {
        try {
            let user = await db.Users.findOne({
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

let handleAuthLogin = (email, password) => {
    return new Promise(async(resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if (isExist) {
                let user = await db.Users.findOne({
                    where: {
                        email: email,
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
                if (user) {
                    let token = jwt.sign({id:user.id}, process.env.JWT_SECRET_KEY, {
                        expiresIn: 120
                    })   
                    let check = bcrypt.compareSync(password, user.password);//kiem tra password
                    if (check){
                        userData.message = 'Ok';
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


module.exports = {
    createAcc,
    handleAuthLogin
}
