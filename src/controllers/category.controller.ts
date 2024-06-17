import { Request, Response } from "express";
import { prisma } from "..";
import { v4 as uuidv4 } from "uuid";
import Joi from "joi";
import { Prisma } from "@prisma/client";

export default new (class CategoryController {
  async getCategory(req: Request, res: Response) {
    try {
      const categoryId = req.params.id;

      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Category Not Found",
          data: null,
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Category Found",
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error: error,
      });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany();

      if (!categories) {
        return res.status(404).json({
          status: 404,
          message: "Categories Not Found",
          data: null,
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Categories Found",
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        data: null,
      });
    }
  }

  async createCategories(req: Request, res: Response) {
    try {
      const newCategories = req.body;

      const schema = Joi.object({
        name: Joi.string().required(),
      });

      const { error } = schema.validate(newCategories);

      if (error)
        return res.status(400).json({
          status: 400,
          message: "Parameter Invalid",
          data: null,
        });

      await prisma.category.create({
        data: {
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          name: newCategories.name,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Category Created",
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        errror: error,
      });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const categoryId = req.params.id;
      const newCategory = req.body;

      const schema = Joi.object({
        name: Joi.string(),
      });

      const { error } = schema.validate(newCategory);

      if (error)
        return res.status(400).json({
          status: 400,
          message: "Parameter Invalid",
          data: null,
        });

      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Category Not Found",
          data: null,
        });
      }

      const result = await prisma.category.update({
        where: {
          id: String(categoryId),
        },
        data: {
          updatedAt: new Date(),
          name: newCategory.name,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Category Updated Successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error: error,
      });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const categoryId = req.params.id;

      const check = await prisma.category.findFirst({
        where: {
          id: categoryId,
        },
      });

      if (!check) {
        return res.status(404).json({
          status: 404,
          message: "category Not Found",
          data: null,
        });
      }

      await prisma.category.delete({
        
        where: {
          id: String(categoryId),
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Category Deleted Successfully",
        data: null,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          return res.status(404).json({
            status: 404,
            message: error.message,
            data: null,
          });
        }
      }
    }
  }
})();
