

import jwt from "jsonwebtoken"
import ENV from "../config.js"
// auth middleware 


export default async function Auth(req,res,next){
    try {

        // access authorize header to validate request 

        const token= req.headers.authorization.split(" ")[1];
        // req.headers.authorization will fetch the auth token from the header 

        // res.json(token)

        // retrive the user details of the logged in use r

        const decodedToken = await jwt.verify(token,ENV.JWT_SECRET)

        req.user= decodedToken;

        // res.json(decodedToken)
        next()
        
    } catch (error) {
        res.status(401).json({error:"Authentication Failed!"})
    }
}


export function localVariables(req,res,next){
    req.app.locals={
        OTP:null,
        resetSession : false
        
    }
    next()
}