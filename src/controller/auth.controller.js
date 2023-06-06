import authService from '../services/auth.services'; 

let handleRegister = async (req, res) => {
    let message = await authService.createAccount(req.body)
    return res.status(200).json(message)
};

let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
        return res.status(400).json({
            message: 'missing inputs parameter !',
        })
    }
    let userData = await authService.handleAuthLogin(email, password);
    console.log(userData);

    return res.status(200).json({
        message: userData.message,
        user: userData.user ? userData.user : {}, 
        accessToken: userData.accessToken,
    })
}

// let refreshToken = async (req, res) => {
//     const { refreshToken: requestToken } = req.body;

//     if (requestToken == null) {
//         return res.status(403).json({ message: "Refresh Token is required!" });
//     }   
//   try {
//     let refreshToken = await db.RefreshToken.findOne({ 
//         where: { 
//             token: requestToken 
//             } 
//         });

//     console.log(refreshToken)

//     if (!refreshToken) {
//          res.status(403).json({ message: "Refresh token is not in database!" });
//           return;
//     }

//     if (RefreshToken.verifyExpiration(refreshToken)) {
//         RefreshToken.destroy({ where: { id: refreshToken.id } });
      
//         res.status(403).json({
//             message: "Refresh token was expired. Please make a new signin request",
//         });
//         return;
//     }

//     const user = await refreshToken.getUser();
//     let newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
//         expiresIn: 3600,
//     });

//     return res.status(200).json({
//         accessToken: newAccessToken,
//         refreshToken: refreshToken.token,
//     });
//   } catch (err) {
//         return res.status(500).send({ message: err });
//   }
// };
module.exports = {
    handleRegister,
    handleLogin,
    // refreshToken
} 
