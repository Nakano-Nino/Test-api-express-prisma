import { Request, Response, NextFunction } from "express";
import { prisma } from "..";
import { v4 as uuidv4 } from "uuid";
import Joi from "joi";
import createError from "http-errors";

export default new (class TodoController {
  async getTodoByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.loginSession.userId;
      const todo = await prisma.todo.findMany({
        select: {
          id: true,
          name: true,
          amount: true,
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        where: {
          userId: userId,
        },
      });

      if (todo.length === 0) throw createError(404, "Todo not found");

      return res.status(200).json({
        status: 200,
        message: "Todo Found",
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodoByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.body;

      const result = await prisma.todo.findMany({
        select: {
          id: true,
          name: true,
          amount: true,
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        where: {
          categoryId: categoryId,
        },
      });

      if (result.length === 0) throw createError(404, "Todo not found");

      return res.status(200).json({
        status: 200,
        message: "Todo Found",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const todos = await prisma.todo.findMany({
        select: {
          id: true,
          name: true,
          amount: true,
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (todos.length === 0) throw createError(404, "Todos not found");

      return res.status(200).json({
        status: 200,
        message: "Todos found",
        data: todos,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.loginSession.id;

      const input = req.body;

      const schema = Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().required(),
        categoryId: Joi.required(),
      });

      const { error } = schema.validate(input);

      if (error) throw createError(400, error.details[0].message);

      const newTodo = await prisma.todo.create({
        data: {
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          name: input.name,
          amount: input.amount,
          category: { connect: { id: input.categoryId } },
          user: { connect: { id: userId } },
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Todo Created Successfully",
        data: newTodo,
      });
    } catch (error) {
      next(error);

      // if (error instanceof Prisma.PrismaClientValidationError) {
      //   return res.status(400).json({
      //     status: 400,
      //     message: error.message,
      //     data: null,
      //   });
      // }
    }
  }

  async updateTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const todoId = req.params.id;
      const userId = res.locals.loginSession.id;

      const input = req.body;

      const schema = Joi.object({
        name: Joi.string(),
        amount: Joi.number(),
      });

      const { error } = schema.validate(input);

      if (error) throw createError(400, error.details[0].message);

      const check = await prisma.todo.findFirst({
        where: {
          id: String(todoId),
        },
      });

      if (!check) throw createError(404, "Todo not found");

      if (check.userId !== userId)
        throw createError(401, "Unauthorized, user not allowed");

      const result = await prisma.todo.update({
        where: {
          id: String(todoId),
        },
        data: {
          updatedAt: new Date(),
          name: input.name,
          amount: input.amount,
          categoryId: input.categoryId,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Todo Updated Successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const todoId = req.params.id;
      const userId = res.locals.loginSession.id;

      const check = await prisma.todo.findFirst({
        where: {
          id: todoId,
        },
      });

      if (!check) throw createError(404, "Todo not found");

      if (check.userId !== userId)
        throw createError(401, "Unauthorized, user not allowed");

      await prisma.todo.delete({
        where: {
          id: String(todoId),
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Todo Deleted Successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
})();
