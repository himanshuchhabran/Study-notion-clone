const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
//resetPasswordToken

exports.resetPasswordToken = async (req, res) => {
	try {
        //req ki body se email fetch
		const email = req.body.email;
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
		 		message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
			});
		}

        //generate token
		const token = crypto.randomUUID;
        //update user by adding token and expiration time
		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				resetPasswordExpires: Date.now() + 3600000,
				token: token,
			},
			{ new: true }
		);
		console.log("DETAILS", updatedDetails);
        //create url
		const url = `http://localhost:3000/update-password/${token}`;

        //send url on mail
		await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);

		res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
	}
};


//resetPassword

exports.resetPassword = async (req, res) => {
	try {

        //data fetch 
		const { password, confirmPassword, token } = req.body;
        //validation
		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}
        //get user details from db using token 
		const userDetails = await User.findOne({ token: token });
		//if no entry invalid token 
        if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}

        //token time Check
		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}
        //hash password
		const encryptedPassword = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true }
		);
		res.status(200).json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};