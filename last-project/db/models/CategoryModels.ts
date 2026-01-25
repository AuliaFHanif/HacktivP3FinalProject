
import {database} from "../config/mongodb";
import * as Z from "zod";

export const CategorySchema = Z.object({
  _id: Z.string().optional(),
  title: Z.string().min(1).max(100),
  description: Z.string().min(1).max(500),
});

export type Category = Z.infer<typeof CategorySchema>;

export const CategoryCollection = database.collection<Category>("categories");

class CategoryModel {
  static async createCategory(category: Category): Promise<void> {
    await CategoryCollection.insertOne(category);
  }
    static async getCategories(): Promise<Category[]> {
    return await CategoryCollection.find({}).toArray();
  }
    static async updateCategory(id: string, category: Partial<Category>): Promise<void> {
    await CategoryCollection.updateOne({ _id: id }, { $set: category });
  }
    static async deleteCategory(id: string): Promise<void> {
    await CategoryCollection.deleteOne({ _id: id });
  }
}

export default CategoryModel;