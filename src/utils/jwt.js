const jwt = require("jsonwebtoken");
const {v4:uuidv4} = require("uuid");

function generateAccessToken(userId){
    return jwt.sign(
        {userId},process.env.JWT_ACCESS_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN}
    );
};

function generateRefreshToken(){
    return{
        token : jwt.sign({id: uuidv4()},
        process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN}
    ),
    expiresAt: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRES_IN)),
    familyId: uuidv4()
    };
                        }

function verifyAccessToken(token){
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
        throw new Error('Invalid access token !');
    }
}

function verifyRefreshToken(token){
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid refresh token !');
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};