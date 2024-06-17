import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "..";

class AuthMiddleware {
  Authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies.accessToken;

      if (!accessToken) {
        return res.status(401).json({
          status: 401,
          message: "Access Denied, No Access Token Provided",
          data: null,
        });
      }

      jwt.verify(
        accessToken,
        `${process.env.ACCESS_TOKEN_KEY}`,
        async (err: any, result: any) => {
          if (err) {
            return res.status(401).json({
              status: 401,
              message: "Access Denied, Access Token Invalid",
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
              message: "Access Denied, User Not Found",
              data: null,
            });
          }

          res.locals.loginSession = user;
          next();
        }
      );
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
      });
    }
  }
}

export default new AuthMiddleware().Authenticate;
