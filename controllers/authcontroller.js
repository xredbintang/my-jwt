const jwt = require('jsonwebtoken');

exports.login = (req,res)=>{
  const {username,password} = req.body;

  if(username === 'admin' && password === 'adminnigga'){
    const accessToken = jwt.sign({username}, process.env.JWT_SECRET_KEY, {expiresIn:'5m'});
    const refreshToken = jwt.sign({username}, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn:'7d'});
    res.json({
      accessToken,
      refreshToken
    })
  }else{
    res.status(401).json({message:"username atau password salah"});
  }
};