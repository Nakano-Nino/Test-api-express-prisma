import { Request, Response } from "express";
import { prisma } from "..";
import { v4 as uuidv4 } from "uuid";
import Joi from "joi";
import { Prisma } from "@prisma/client";

export default new (class TodoController {
  async getTodoByUser(req: Request, res: Response) {
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

      if (todo.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Todo not found",
          data: null,
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Todo Found",
        data: todo,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
      });
    }
  }

  async getTodoByCategory(req: Request, res: Response) {
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

      if (result.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Todo not found",
          data: null,
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Todo Found",
        data: result,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
          status: 400,
          message: error.message,
          data: null,
        });
      }
    }
  }

  async getTodos(req: Request, res: Response) {
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

      if (todos.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Todos not found",
          data: null,
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Todos found",
        data: todos,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
      });
    }
  }

  async createTodo(req: Request, res: Response) {
    try {
      const userId = res.locals.loginSession.id;

      const input = req.body;

      const schema = Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().required(),
        categoryId: Joi.required(),
      });

      const { error } = schema.validate(input);

      if (error) {
        return res.status(400).json({
          status: 400,
          message: "Parameter Invalid",
          data: null,
        });
      }

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
      return res.status(500).json({
        status: 500,
        message: error,
      });

      // if (error instanceof Prisma.PrismaClientValidationError) {
      //   return res.status(400).json({
      //     status: 400,
      //     message: error.message,
      //     data: null,
      //   });
      // }
    }
  }

  async updateTodo(req: Request, res: Response) {
    try {
      const todoId = req.params.id;
      const userId = res.locals.loginSession.id;

      const input = req.body;

      const schema = Joi.object({
        name: Joi.string(),
        amount: Joi.number(),
      });

      const { error } = schema.validate(input);

      if (error) {
        return res.status(400).json({
          status: 400,
          message: "Parameter Invalid",
          data: null,
        });
      }

      const check = await prisma.todo.findFirst({
        where: {
          id: String(todoId),
        },
      });

      if (!check) {
        return res.status(404).json({
          status: 404,
          message: "Todo Not Found",
          data: null,
        });
      }

      if (check.userId !== userId) {
        return res.status(403).json({
          status: 403,
          message: "Access Denied, User Not Allowed",
          data: null,
        });
      }

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
      return res.status(500).json({
        status: 500,
        message: error,
      });
    }
  }

  async deleteTodo(req: Request, res: Response) {
    try {
      const todoId = req.params.id;
      const userId = res.locals.loginSession.id;

      const check = await prisma.todo.findFirst({
        where: {
          id: todoId,
        },
      });

      if (!check) {
        return res.status(404).json({
          status: 404,
          message: "Todo Not Found",
          data: null,
        });
      }

      if (check.userId !== userId) {
        return res.status(403).json({
          status: 403,
          message: "Access Denied, User Not Allowed",
          data: null,
        });
      }

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
      return res.status(500).json({
        status: 500,
        message: error,
      });
    }
  }
})();
