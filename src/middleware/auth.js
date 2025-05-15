const {verifyAccessToken} = require('../utils/jwt')
const isAuthenticated = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message: 'No token provided!'});
        } 

        const token = authHeader.split(' ')[1];

        const decoded = verifyAccessToken(token);

        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({message: error.message});
    }
};

module.exports = {
    isAuthenticated
}