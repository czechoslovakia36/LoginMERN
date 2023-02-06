import {Router} from 'express'

const router = Router();

// Import all controller 


import * as controller from '../controllers/appController.js'

import Auth, {localVariables} from "../middleware/auth.js"

// Post Method

router.route("/register").post(controller.register)

router.route('/registerMail').post() //register email

router.route('/authenticate').post((req,res) => res.end()) //  authernticate user 

router.route('/login').post(controller.verifyUser,controller.login)

// Get Method

router.route('/user/:username').get(controller.getUser) //user with username
router.route('/generateOTP').get(controller.verifyUser,localVariables,controller.generateOTP) // to generate random OTP
router.route('/verifyOTP').get(controller.verifyOTP) // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession) //reset all the variables


// Put Method
router.route('/updateuser').put(Auth,controller.updateUser) //is use to update the user profile
router.route('/resetPassword').put(controller.resetPassword) //use to reset password 


export default  router ;