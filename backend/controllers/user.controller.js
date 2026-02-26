import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, role } = req.body;
    if (!username || !email || !password || !phoneNumber || !role) {
      return res.status(401).json({
        message: "something is missing",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "User already registerd",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashPassword,
      phoneNumber,
      role,
    });

    return res.status(200).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const login = async () => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(401).json({
        message: "something is missing",
        success: false,
      });
    }
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    const encodedPasword = await bcrypt.compare(password, user.password);
    if (!encodedPasword) {
      return res.status(401).json({
        message: "Password or email is incorrect",
        success: false,
      });
    }

    if (role != user.role) {
      return res.status(401).json({
        message: "Account does not exist with current role",
        success: false,
      });
    }

    const token = await jwt.sign(
      {
        userId: user._id,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      },
    );

    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `welcome back ${user.fullname}`,
        success: true,
      });
  } catch (error) {
    console.log(error);
  }
};

export { register, login };
