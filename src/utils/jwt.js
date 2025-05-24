const jwt = require("jsonwebtoken");
const {v4:uuidv4} = require("uuid");

function generateAccessToken(userId){
    return jwt.sign(
        {userId},process.env.JWT_ACCESS_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN}
    );
};

function generateRefreshToken(userId, existingFamilyId = null){
    const familyId = existingFamilyId || uuidv4();
    const tokenId = uuidv4();

    const token = jwt.sign({userId, familyId, tokenId},
        process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN}
    );

    return{
    token : token,
    expiresAt: new Date(Date.now()+ ms(process.env.REFRESH_TOKEN_EXPIRES_IN)),
    familyId:familyId
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