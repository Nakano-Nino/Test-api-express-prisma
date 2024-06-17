import { Router } from "express";
import Auth from "../middlewares/auth.middleware";
import userController from "../controllers/user.controller";
import categoryController from "../controllers/category.controller";
import todoController from "../controllers/todo.controller";

const router = Router();

// User Router
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/refresh", userController.refreshToken);

// Category Router
router.get("/categories", categoryController.getCategories);
router.get("/category/:id", categoryController.getCategory);
router.post("/category", Auth, categoryController.createCategories);
router.put("/category/:id", Auth, categoryController.updateCategory);
router.delete("/category/:id", Auth, categoryController.deleteCategory);

// Todo Router
router.get("/todos", todoController.getTodos);
router.get("/todouser", Auth, todoController.getTodoByUser);
router.get("/todocategory", Auth, todoController.getTodoByCategory);
router.post("/todo", Auth, todoController.createTodo);
router.put("/todo/:id", Auth, todoController.updateTodo);
router.delete("/todo/:id", Auth, todoController.deleteTodo);

export default router;
