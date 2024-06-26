import { Request, Response, NextFunction } from "express";
import { prisma } from "..";
import { v4 as uuidv4 } from "uuid";
import Joi from "joi";
import { Prisma } from "@prisma/client";
import createError from "http-errors";

export default new (class CategoryController {
  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.params.id;

      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
        },
      });

      if (!category) throw createError(404, "Category Not Found");

      return res.status(200).json({
        status: 200,
        message: "Category Found",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany();

      if (!categories) throw createError(404, "Categories Not Found");

      return res.status(200).json({
        status: 200,
        message: "Categories Found",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const newCategories = req.body;

      const schema = Joi.object({
        name: Joi.string().required(),
      });

      const { error } = schema.validate(newCategories);

      if (error) throw createError(400, error.details[0].message);

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
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.params.id;
      const newCategory = req.body;

      const schema = Joi.object({
        name: Joi.string(),
      });

      const { error } = schema.validate(newCategory);

      if (error) throw createError(400, error.details[0].message);

      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
        },
      });

      if (!category) throw createError(404, "Category Not Found");

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
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.params.id;

      const check = await prisma.category.findFirst({
        where: {
          id: categoryId,
        },
      });

      if (!check) throw createError(404, "Category Not Found");

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
      next(error);
    }
  }
})();
