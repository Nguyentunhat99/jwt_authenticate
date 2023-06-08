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

    return res.status(200).json({
        message: userData.message,
        user: userData.user ? userData.user : {}, 
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken
    })
}

let handlerefreshToken = async (req, res) => {
    let dataToken = await authService.refreshToken(req.body)
    return res.status(200).json({
        accessToken: dataToken.accessToken,
        refreshToken: dataToken.refreshToken
    })
};
module.exports = {
    handleRegister,
    handleLogin,
    handlerefreshToken
} 
