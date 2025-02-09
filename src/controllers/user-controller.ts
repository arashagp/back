import Jwt, {type JwtPayload} from 'jsonwebtoken';
import type { Request, Response } from "express";
import type { User } from "../types/user-type.js";
import { UserModel } from "../models/user-model.js";
import bcrypt from 'bcrypt';
import { logger } from "../utils/logger.js";
import nodemailer from 'nodemailer';

const { NotBeforeError, TokenExpiredError } = Jwt;

export async function signIn (req: Request, res: Response): Promise<Response> {
  try {
    const { username, email, password } = req.body as User;

    if (!username || !email || !password) {
      logger.error('Some of fields is empty.');

      return res.status(500).json({
        success: false,
        message: "All Fields are required."
      });
    }

    if (await UserModel.findOne({ email })) {
      logger.error('User email has exists.');

      return res.status(409).json({
        success: false,
        message: "User email has exists.."
      });
    }

    if (await UserModel.findOne({ username })) {
      logger.error('User username has exists.');

      return res.status(409).json({
        success: false,
        message: "User username has exists."
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      password: encryptedPassword,
      username
    });

    if (user == null) throw new Error("User not created please try again.");

    logger.info('User successfully created.');

    return res.status(201).json({
      success: true,
      message: "User successfully created."
    });
  }
  catch (error) {
    logger.error(`signIn has an error: ${(error as Error).message}`);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export async function logIn (req: Request, res: Response): Promise<Response> {
  try {
    const { username, password, email } = req.body as User;

    let user;

    if (password == null || email == null && username == null) {
      return res.status(500).json({
        success: false,
        message: "All Fields are required."
      });
    }

    if (username && email == null)
      user = await UserModel.findOne({ username });
    else if (username == null && email)
      user = await UserModel.findOne({ email });
    else {
      return res.status(500).json({
        success: false,
        message: "for login must use for username or email not both of them."
      });
    }

    if (user == null) {
      return res.status(403).json({
        success: false,
        message: "User Password Or email is incorrect."
      });
    }

    const comparedPassword = await bcrypt.compare(password, user.password);

    if (comparedPassword != true) {
      return res.status(403).json({
        success: false,
        message: "User Password Or email is incorrect."
      });
    }

    const token = Jwt.sign({ userId: user._id }, process.env.SECRET_KEY!, {
      expiresIn: 120 * 60 * 1000 // 2 hr
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 120 * 60 * 1000, // 2 hr
    });

    return res.status(200).json({
      success: true,
      data: user,
      message: "User successfully Login."
    });
  }
  catch (error) {
    logger.error(`logIn has an error: ${(error as Error).message}`);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export async function forgetPasswordRequest (req: Request, res: Response): Promise<Response> {
  try {
    const { email, username } = req.body as User;

    if (email == null && username == null) {
      return res.status(500).json({
        success: false,
        message: "All Fields are required."
      });
    }

    let user;

    if (username != null && email == null)
      user = await UserModel.findOne({ username });
    else if (username == null && email != null)
      user = await UserModel.findOne({ email });

    if (user == null) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const token = Jwt.sign({ userId: user._id }, process.env.SECRET_KEY!, {
      expiresIn: 120 * 60 * 1000 // 2 hr
    });

    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // Configure the mailoptions object
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: 'Forget Password.',
      text: `
        If you saw this email, it means you requested to reset your password.
        However, if this request wasn't made by you, please change your password as soon as possible.
        Click the following link to reset your password: http://localhost:3000/reset-password/${token}
      `
    };

    transporter.verify(function(error, success) {
      if (error != null) {
        logger.error(error.message);

        return res.status(500).json({
          success: false,
          message: "Internal Error."
        });
      }
      else {
        logger.info(success);

        return;
      }
    });

    // Send the email
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        logger.error(error.message);

        return res.status(500).json({
          success: false,
          message: "Internal Error."
        });
      }
      else {
        logger.info(info);

        return;
      }
    });

    return res.status(200).json({
      success: false,
      message: "Email sending successfully."
    });
  }
  catch (error) {
    logger.error(`ForgetPasswordRequest: ${(error as Error).message}`);

    return res.status(500).json({
      success: false,
      message: "All Fields are required."
    });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<Response> {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password == null || confirmPassword == null) {
      return res.status(500).json({
        success: false,
        message: "All Fields are required."
      });
    }

    const decodedToken = Jwt.verify(token, process.env.SECRET_KEY!) as JwtPayload; // Verifies and decodes in one step

    const user = await UserModel.findById(decodedToken.userId); // Directly use the verified payload

    if (user == null) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    user.password = encryptedPassword;

    user.save();

    return res.status(200).json({
      success: true,
      message: 'User password reset successfully.'
    });
  }
  catch (error) {
    logger.error(`resetPassword: ${(error as Error).message}`);

    let errorMessage;

    if (error instanceof TokenExpiredError) {
      errorMessage = "Token has expired";
    }
    else if (error instanceof NotBeforeError) {
      errorMessage = "Token is not active yet";
    }
    else {
      errorMessage = "Internal Error";
    }

    return res.status(404).json({
      success: false,
      message: errorMessage
    });
  }
}