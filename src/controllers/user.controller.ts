import { Request, Response, NextFunction } from "express";
import { prisma } from "..";
import * as argon2 from "argon2";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import createError from "http-errors";

export default new (class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
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
      if (error) throw createError(400, error.details[0].message);

      // Check if email already used by another user
      const emailCheck = await prisma.user.findUnique({
        where: {
          email: newUser.email,
        },
      });
      if (emailCheck) throw createError(409, "Email already used");

      // Check if phone number already used by another user
      const phoneCheck = await prisma.user.findUnique({
        where: {
          phone: newUser.phone,
        },
      });
      if (phoneCheck) throw createError(409, "Phone number already used");

      // Hash password using argon2
      const hashedPassword = await argon2.hash(newUser.password, {
        type: argon2.argon2id,
      });

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
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body;

      // Check if user input parameter is valid
      const schema = Joi.object({
        email_or_phone: Joi.string().required(),
        password: Joi.string().min(8).required(),
      });

      const { error } = schema.validate(input);
      if (error) {
        throw createError(400, error.details[0].message);
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: input.email_or_phone },
            { phone: input.email_or_phone },
          ],
        },
      });

      if (!user) {
        throw createError(404, "User not found");
      }

      // Compare inputted password with password saved in database
      // bcrypt.compare(input.password, user.password, (err, result) => {
      //   if (err) {
      //     return res.status(401).json({
      //       status: 401,
      //       message: "Wrong Password",
      //       data: null,
      //     });
      //   }

      //   // Create Access & Refresh token with userId then save them in cookie
      //   if (result) {
      //     const accessToken = jwt.sign(
      //       { id: user.id },
      //       `${process.env.ACCESS_TOKEN_KEY}`,
      //       {
      //         expiresIn: "15m",
      //       }
      //     );
      //     const refreshToken = jwt.sign(
      //       { id: user.id },
      //       `${process.env.REFRESH_TOKEN_KEY}`,
      //       { expiresIn: "15d" }
      //     );

      //     return res
      //       .status(200)
      //       .cookie("accessToken", accessToken, {
      //         httpOnly: true,
      //         secure: false,
      //         sameSite: "strict",
      //       })
      //       .cookie("refreshToken", refreshToken, {
      //         httpOnly: true,
      //         secure: false,
      //         sameSite: "strict",
      //       })
      //       .json({
      //         status: 200,
      //         message: "Logged in Successfully",
      //         data: null,
      //       });
      //   }
      // });

      const passwordMatch = await argon2.verify(user.password, input.password);
      if (!passwordMatch) {
        throw createError(401, "Wrong Password");
      } else {
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
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken)
        throw createError(401, "Unauthorized, no refresh token provided");

      jwt.verify(
        refreshToken,
        `${process.env.REFRESH_TOKEN_KEY}`,
        async (err: any, result: any) => {
          if (err)
            throw createError(401, "Unauthorized, invalid refresh token");

          const user = await prisma.user.findUnique({
            select: {
              id: true,
            },
            where: {
              id: result.id,
            },
          });

          if (!user) throw createError(404, "User not found");

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
      next(error);
    }
  }
})();
