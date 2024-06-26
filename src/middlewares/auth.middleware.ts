import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "..";
import createError from "http-errors";

class AuthMiddleware {
  Authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies.accessToken;

      if (!accessToken)
        throw createError(401, "Access Denied, No Access Token");

      jwt.verify(
        accessToken,
        `${process.env.ACCESS_TOKEN_KEY}`,
        async (err: any, result: any) => {
          if (err)
            throw createError(401, "Access Denied, Invalid Access Token");

          const user = await prisma.user.findUnique({
            select: {
              id: true,
            },
            where: {
              id: result.id,
            },
          });

          if (!user) throw createError(404, "User Not Found");

          res.locals.loginSession = user;
          next();
        }
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthMiddleware().Authenticate;
