import {Router} from 'express'

const router = Router();

// Import all controller 


import * as controller from '../controllers/appController.js'

import { registerMail } from '../controllers/mailer.js';


import Auth, {localVariables} from "../middleware/auth.js"


// Post Method

router.route("/register").post(controller.register)

router.route('/registerMail').post(registerMail) //register email

router.route('/authenticate').post(controller.verifyUser,(req,res) => res.end()) //  authenticate user 

router.route('/login').post(controller.verifyUser,controller.login)

// Get Method

router.route('/user/:username').get(controller.getUser) //user with username
router.route('/generateOTP').get(controller.verifyUser,localVariables,controller.generateOTP) // to generate random OTP
// router.route("/generateOTP").get(controller.generateOTP)

router.route('/verifyOTP').get(controller.verifyUser,controller.verifyOTP) // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession) //reset all the variables


// Put Method
router.route('/updateuser').put(Auth,controller.updateUser) //is use to update the user profile
router.route('/resetPassword').put(controller.verifyUser,controller.resetPassword) //use to reset password 


export default  router ;