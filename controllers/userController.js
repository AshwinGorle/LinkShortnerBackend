import UserModel from "../models/User.js";
import bcrypt from 'bcrypt';
import Jwt  from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController{
    static userRegistration = async(req, res)=>{
        const {name, email, password, password_confirmation, tc} = req.body;
        const user = await UserModel.findOne({email : email});
        if(user){
            res.send({status : "failed", message : "Email already exists"});
        }else{
            if(name && email && password && password_confirmation && tc){
                if(password === password_confirmation){
                    try{
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassowrd = await bcrypt.hash(password, salt)    
                    const doc = new UserModel({
                        name,
                        email,
                        password : hashedPassowrd,
                        tc : Boolean(tc)
                    })
                    await doc.save();
                    const savedUser = await UserModel.findOne({email : email});
                    const token =  Jwt.sign({userId : savedUser._id, userEmail : savedUser.email}, process.env.JWT_SECRET_KEY, {expiresIn : '5d'});
                    res.status(201).send({status : "success", message : "User Created Successfully", token : token })
                    }catch(err){
                        res.send({status : "failed", message : "User not created", err : err})
                    }
                }else{
                    res.send({status : "failed", message : "Confirmation msg does not match"});     
                }
            }else{
                res.send({status : "failed", message : "All fields are required"});     
            }
        }
    } 

    static userLogin = async (req, res)=>{
        const {password, email} = req.body
        if(password && email){
            try{
                const user = await UserModel.findOne({email : email});
                if(user){
                  const isMatch = await bcrypt.compare(password, user.password);
                  if(isMatch && user.email === email){
                    const token  = Jwt.sign({userId : user._id, email : user.email}, process.env.JWT_SECRET_KEY);
                    console.log("user loged in")
                    res.send({status : "success", token : token, message : "Loged in successfully"});
                  }else{
                    res.send({status : "failed", message : "Email or Passowrd is wrong"})
                  }
                }else{
                    res.send({status : "failed", message : "Email does not exists"})
                }
            }catch(err){
               res.send({starus : "failed", message : "something went wrong", error : err})
            }
        }else{
            res.send({status : "failed", message : "All fields are required"})
        }
        
    }

    static resetUserPassword = async (req, res)=>{
        const {password,  password_confirmation} = req.body;
        if(password && password_confirmation){
           if(password === password_confirmation){
              try{
                const salt = await bcrypt.genSalt(10);
                const hashedPassowrd = await bcrypt.hash(password, salt);
                await UserModel.findByIdAndUpdate(req.user._id, {password : hashedPassowrd});
                res.send({status : "success", message : "Password changed successfully" })
              }catch(err){
                  res.send({status : "failed", message : "something went wrong try again"})
              }
           }else{
               res.send({status : "failed", message : "both password does not match"})
           }
        }else{
            res.send({status : "failed", message : "All fields are required"})
        }
    }

    static sendResetPasswordEmail = async(req, res)=>{
         const {email} = req.body;
         if(!email){
            res.send({status : "failed", message : "All fields are required"});
         }else{
            const user = await UserModel.findOne({email, email});
            if(user){
                const secret_key = user._id + process.env.JWT_SECRET_KEY;
                const token = Jwt.sign({userId : user._id}, secret_key, {expiresIn : '15m'});
                const link = `http://localhost:3001/api/user/reset/${user._id}/${token}`
                let info = await transporter.sendMail({
                    from : process.env.EMAIL_FROM,
                    to : user.email,
                    subject : "Gymsteering Password Resset Link ",
                    html : `<a href=${link}>click Here to reset yourt password </a>`
                })
                res.send({status : "success", message : "Password Reset Email sent.... Please check your email!" , info : info})
            }else{
                res.send({status : "failed", message : "Email not valid"});
            }
         }
    } 

    static resetUserPasswordWithLink = async(req, res)=>{
        const {password, password_confirmation} = req.body;
        const {token , userId} = req.params;
        console.log("token " , token)
        console.log("userId " , userId)
        if(password && password_confirmation){
           const user = await UserModel.findOne({_id : userId});
           console.log(user);
           if(user){
            try{
              const new_secret = userId + process.env.JWT_SECRET_KEY;
              Jwt.verify(token, new_secret);
              const salt = await bcrypt.genSalt(10);
              const newHashedPassowrd = await bcrypt.hash(password, salt);
              const updatedUser = await UserModel.findByIdAndUpdate(userId, {$set : {password : newHashedPassowrd}});
              res.send({status : "success", message : "Passowrd changed Successfully"});

            }catch{
                res.send({status : "failed", message : "Invalid token!"});
            }
           }else{
             res.send({status : "failed", message : "Invalid User"});
           }  
        }else{
             res.send({status : "failed", message : "All fields are required"});
        }
    }
}

export default UserController;