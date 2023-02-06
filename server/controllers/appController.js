

import jwt from 'jsonwebtoken'
import ENV from '../config.js'
import Users from "../model/User.model.js"
import bcrypt from 'bcrypt'

import otpGenerator from "otp-generator"
// import UserModel from '../model/User.model.js'




/*
POST http://localhost:5000/api/register
@param : {
    "username": "example123",
    "password": "admin123",
    "email":"example@gmail.com",
    "firstName": "bill",
    "lastName":"william",
    "mobile": "8219434320",
    "address": "Apt. 556,Kulas Light,Gwenborough",
    "profile":""
}
*/

// middleware for verify user ..

export async function verifyUser(req,res,next){
    try {
        
        const {username} = req.method == "GET" ? req.query : req.body

        // check the user existance

        let exist = await Users.findOne({username})
        if(!exist) return res.status(404).send({error: "Can't find User!"});
        next();



    } catch (error) {
        return res.status(404).send({error:"Authentication Error"});
    }
}



export async function register(req,res){
  
try {
    const {username,password,email,profile} = req.body;
    // check the existing user 
    const existUsername= new Promise((resolve,reject)=>{
        Users.findOne({username}, function(err,user){
            if(err) reject (new Error(err))
            if(user) reject ({error: "Please use unique username"});
            resolve();
        })
    })

    const existEmail= new Promise((resolve,reject)=>{
       
        Users.findOne({email}, function(err,email){
            if(err) reject (new Error(err))
            if(email) reject ({error: "Please use unique Email"});
            resolve();
        })
    })
    Promise.all([existUsername,existEmail])
        .then(()=>{
            if(password){
                bcrypt.hash(password,10)
                .then(hashedPassword=> {
                            const user = new Users({
                                username,
                                password: hashedPassword,
                                profile:profile || '',
                                email
                            });
                            //  return save result as a response
                            user.save()
                            
                            .then(result => res.status(201).send({msg:"User Registerd Succesfully"}))
                            .catch (error => res.status(500).send({error}))
                            // .catch(error => console.log(error))
                    }).catch(error => {
                        return res.status(500).send({
                            error:"Enable to hashed password"
                        })
                    })
            }
        }).catch(error => {
            return res.status(500).send({ error})
        })


} catch (error) {
    return res.status(500).send(error)
}

}

/*
POST : http://localhost:8080/api/login
@param :{
    "username" : "example123",
    "password":"admin123"
}
*/
export async function login(req,res){
    // res.json('login route')
    const {username ,password}= req.body
    console.log(password)

    try {

        
        Users.findOne({username})
            .then( user => {
                console.log(user.password)
                bcrypt.compare(password,user.password)
                .then(passwordCheck => {
                    console.log("password check is ", passwordCheck)
                    if(!passwordCheck)  return res.status(400).send({error:"Don't have Password"})
                    // Create jwt token
               const token = jwt.sign(
                         {
                            userID : user._id,
                            username: user.username,
                         },
                         ENV.JWT_SECRET,
                         {expiresIn:"24h"}
                          )


                        return res.status(200).send({
                            msg:"Login Successful..!",
                            username:user.username,
                            token
                      
                        })
                })
                .catch(error => {
                    return res.status(400).send({error : "Password does not Match"})
                })
            })
            .catch(error => {
                return res.status(404).send({error: "Username not found"})
            })
    } catch (error) {
        return res.status(500).send({error})
    }
 
}

/*
GET: http://localhost:8080/api/user/example123
*/
export async function getUser(req,res){
    // res.json('getUser route')
    const {username}= req.params;

    try {
        if(!username) return res.status(501).send({error:"Invalid username"});
        Users.findOne({username},function(err,user){
            if(err) return res.status(500).send({err});
            if(!user) return res.status(501).send({error:"Couldn't Find the User"})

               /** remove password from user */
            // mongoose return unnecessary data with object so convert it into json

            const {password, ...rest }= Object.assign({},user.toJSON())

            return res.status(201).send(rest)
        })

    } catch (error) {
        return res.status(404).send({error:"Can not Find User Data"})
    }
}



/*
PUT: http://localhost:8080/api/updateUser
@param: {
    "id" : "<userid>"
}
body :{
    firstName :'',
    addrees : '',
    profile:'',
}
*/
export async function updateUser(req,res){
    // res.json('updateUser route')
    try {
        // const id= req.query.id;

        const {userID}= req.user;

        if(userID){
            const body= req.body;

            Users.updateOne({_id:userID},body,function(err,data){
                if(err) throw err;

                return res.status(201).send({msg:"Record Updated!"})
            })
        }
        else{
            return res.status(401).send({error:"User not found."})
        }


    } catch (error) {
        return res.status(401).send({error})
    }

   
}


// GET: http://localhost:8080/api/generateOTP
export async function generateOTP(req,res){
    // res.json('generateOTP route')
   req.app.locals.OTP= await otpGenerator.generate(6,{lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false})
    res.status(201).send({code: req.app.locals.OTP}) 
}
//GET : http://localhost:8080/api/verifyOTP
export async function verifyOTP(req,res){
    // res.json('verifyOTP route')
    const {code } =req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP= null; //reset the OTP values 
        req.app.locals.resetSession = true; // start session for reset password 
        return res.status(201).send({msg:"Verify Successfully!"})
    }

    return res.status(400).send({error:"Invalid OTP"});

}


//Successfully redirect user when OTP is valid 
// GET http://localhost:8080/api/createResetSession
export async function createResetSession(req,res){
    // res.json('createResetSession route')
    if(req.app.locals.resetSession){
        req.app.locals.resetSession= false; // allow access to this route only once 
        return res.status(201).send({msg:"access "})
    }
    return res.status(440).send({error:"Session Expired!"})
}
// Reset Password
// PUT: http://localhost:8080/api/resetPassword
export async function resetPassword(req,res){
    // res.json('resetPassword route')
    try {
    
        const {username,password} = req.body;
        try {
            Users.findOne({username})
            .then(
                user => {
                    bcrypt.hash(password,10)
                    .then(hashedPassword =>{
                        Users.updateOne({username:user.username},
                            {password:hashedPassword},function(err,data){
                                if(err) throw  err;
                                return res.status(201).send({msg:"Record Updated!"})
                            })
                    })
                    .catch(e=> {
                        return res.status(500).send({
                            error:"Enable to hashed password"
                        })
                    })
                }
            )
            .catch(error=> {
                return res.status(404).send({error:"Username not Found!"})
            } )
        } catch (error) {
            return res.status(500).send({error})
        }
    } catch (error) {
        return res.status(401).send({error})
    }
}