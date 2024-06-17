import { Request, Response } from "express";
import { prisma } from "..";
import bcrypt from "bcrypt";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

export default new (class UserController {
  async register(req: Request, res: Response) {
    try {
      const newUser = req.body;

      // Validate user input
      const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.number().required(),
        password: Joi.string().min(8).required(),
      });

      const { error } = schema.validate(newUser);
      if (error)
        return res.status(400).json({
          status: 400,
          message: "Parameter invalid",
          data: null,
        });

      // Check if email already used by another user
      const emailCheck = await prisma.user.findUnique({
        where: {
          email: newUser.email,
        },
      });
      if (emailCheck)
        return res.status(409).json({
          status: 409,
          message: "Email already used",
          data: null,
        });

      // Check if phone number already used by another user
      const phoneCheck = await prisma.user.findUnique({
        where: {
          phone: newUser.phone,
        },
      });
      if (phoneCheck)
        return res.status(409).json({
          status: 409,
          message: "Phone already used",
          data: null,
        });

      // Hash password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newUser.password, salt);

      // Insert data to database
      await prisma.user.create({
        data: {
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          password: hashedPassword,
        },
      });
      res.status(200).json({
        status: 200,
        message: "Register Success",
        data: null,
      });
    } catch (error) {
      // return res.status(500).json({
      //   status: 500,
      //   message: "Internal Server Error",
      //   error: error,
      // });

      if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
          status: 400,
          message: error.message,
          data: null,
        });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const input = req.body;

      // Check if user input parameter is valid
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
      });

      const { error } = schema.validate(input);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: "Parameter Invalid",
          data: null,
        });
      }

      // Find user with email on database
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User Not Found",
          data: null,
        });
      }

      // Compare inputted password with password saved in database
      bcrypt.compare(input.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            status: 401,
            message: "Wrong Password",
            data: null,
          });
        }

        // Create Access & Refresh token with userId then save them in cookie
        if (result) {
          const accessToken = jwt.sign(
            { id: user.id },
            `${process.env.ACCESS_TOKEN_KEY}`,
            {
              expiresIn: "15m",
            }
          );
          const refreshToken = jwt.sign(
            { id: user.id },
            `${process.env.REFRESH_TOKEN_KEY}`,
            { expiresIn: "15d" }
          );

          return res
            .status(200)
            .cookie("accessToken", accessToken, {
              httpOnly: true,
              secure: false,
              sameSite: "strict",
            })
            .cookie("refreshToken", refreshToken, {
              httpOnly: true,
              secure: false,
              sameSite: "strict",
            })
            .json({
              status: 200,
              message: "Logged in Successfully",
              data: null,
            });
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized, no refresh token provided",
          data: null,
        });
      }

      jwt.verify(
        refreshToken,
        `${process.env.REFRESH_TOKEN_KEY}`,
        async (err: any, result: any) => {
          if (err) {
            return res.status(401).json({
              status: 401,
              message: "Unauthorized, refresh token invalid",
              data: null,
            });
          }

          const user = await prisma.user.findUnique({
            select: {
              id: true,
            },
            where: {
              id: result.id,
            },
          });

          if (!user) {
            return res.status(401).json({
              status: 401,
              message: "Unauthorized, user not found",
              data: null,
            });
          }

          const accessToken = jwt.sign(
            { id: user.id },
            `${process.env.ACCESS_TOKEN_KEY}`,
            { expiresIn: "15m" }
          );

          const newRefreshToken = jwt.sign(
            { id: user.id },
            `${process.env.REFRESH_TOKEN_KEY}`,
            { expiresIn: "15d" }
          );

          return res
            .status(200)
            .cookie("accessToken", accessToken, {
              httpOnly: true,
              secure: false,
              sameSite: "strict",
            })
            .cookie("refreshToken", newRefreshToken, {
              httpOnly: true,
              secure: false,
              sameSite: "strict",
            })
            .json({
              status: 200,
              message: "Access Token Refreshed",
              data: null,
            });
        }
      );
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
      });
    }
  }
})();
