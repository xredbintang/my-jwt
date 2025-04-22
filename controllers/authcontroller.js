const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.register = async (req,res)=>{
  try{
    const {name, email, password} = req.body;
    const hash = await bcrypt.hash(password,10);

    if(!name||!email||!password){
      return res.status(400).json({
        error:'All fields are required!'
      });
    }
    const existingemail = await prisma.user.findUnique({
      where:{email}
    });

    if(existingemail){
      return res.status(400).json({error:"The email has been taken"});
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password:hash
      },
    });
    res.status(201).json({ message: 'User created', account : user });
  }catch(err){
    console.error(err);
    res.status(500).json({
      error: 'Internal server error'
    }) 
  }

}

const generateToken = (user) =>{
  const accesstoken = jwt.sign({userId: user.id}, process.env.JWT_SECRET_KEY,{expiresIn:"2h"});
  const refreshToken = jwt.sign({userId: user.id}, process.env.JWT_REFRESH_SECRET_KEY,{expiresIn:"7d"});

  return {
    accesstoken, refreshToken
  };
}

exports.login = async(req,res)=>{
  const {email,password} = req.body;
  try {
    const user = await prisma.user.findUnique({
      where:{email}
    });
    if(!user){
      return res.status(401).json({message:"User not found"});
    }

    const passwordvalid = await bcrypt.compare(password, user.password);
    if(!passwordvalid){
      return res.status(401).json({message:"Invalid pass or email"});
    }

    const tokens = generateToken(user.id);
    res.json({
      message:"Login succesful",
      ...tokens,
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Internal server error"});
  }
};