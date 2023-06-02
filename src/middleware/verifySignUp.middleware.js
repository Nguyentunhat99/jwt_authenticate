import db, { sequelize } from '../models/index';
import bcrypt from 'bcryptjs';


const salt = bcrypt.genSaltSync(10);

let checkEmail = (req, res, next) => {
    let email = req.body.email
    return new Promise(async(resolve, reject) => {
        try {
            if(!email) return res.status(400).json({ message: "Invalid email"})
            let user = await db.Users.findOne({
                where:{
                    email: email,
                }
            })
            if(user){
                resolve(
                    res.status(400).json({
                        status: "Error",
                        message: "Failed! Email is already in use!"
                    })
                )
                return
            }else{
                next()
            }
        } catch (error) {
            reject(error);
        }
    })
}

let checkPassword = async (req, res, next) => {
    let password = req.body.password;
    let repassword = req.body.repassword;
    if(password.length <8) {
        return res.status(400).json({
            message: 'Password needs to be at least 8 characters long',
        });
    }else if(password != repassword) {
        res.status(400).json({
            message: 'Re-entered password is incorrect !',
        });
        return;
    }else{
        next();
    }

}

module.exports = {
    checkEmail,
    checkPassword
}

