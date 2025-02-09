import type { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import type { User } from "../types/user-type.js";
import { UserModel } from "../models/user-model.js";
import bcrypt from 'bcrypt';
import { logger } from "../utils/logger.js";

export const signIn = async (req: Request, res: Response): Promise<Response> => {
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

export const logIn = async (req: Request, res: Response): Promise<Response> => {
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

    const token = await Jwt.sign({ userId: user._id }, process.env.SECRET_KEY!, {
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