import {database} from "../config/mongodb";
import { ObjectId } from "mongodb";
import * as Z from "zod";

export const CategorySchema = Z.object({
  _id: Z.instanceof(ObjectId).optional(),
  title: Z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: Z.string().min(1, "Description is required").max(500, "Description cannot exceed 500 characters"),
  imgUrl: Z.string().min(1, "Image URL is required").max(300, "Image URL cannot exceed 300 characters"),
  level: Z.object({
    junior: Z.boolean().default(false),
    mid: Z.boolean().default(false),
    senior: Z.boolean().default(false)
  }),
  published: Z.boolean().default(false),
});

export type Category = Z.infer<typeof CategorySchema>;

export const CategoryCollection = database.collection<Category>("categories");

class CategoryModel {
  static async createCategory(title: string, description: string, imgUrl: string): Promise<Category> {
    try {
      const categoryData = CategorySchema.parse({
        title,
        description,
        imgUrl,
        level: { junior: false, mid: false, senior: false },
        published: false
      });
      
      const result = await CategoryCollection.insertOne(categoryData);
      
      if (!result.acknowledged) {
        throw new Error("Failed to insert category into database");
      }
      
      return { ...categoryData, _id: result.insertedId };
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async getCategories(): Promise<Category[]> {
    try {
      const categories = await CategoryCollection.find({}).toArray();
      return categories;
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async updateCategory(id: string, category: Partial<Category>): Promise<Category | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid category ID format");
      }
      
      const { _id, ...updateData } = category;
      
      const validatedData = CategorySchema.partial().parse(updateData);
      
      const result = await CategoryCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: validatedData },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        throw new Error("Category not found");
      }
      
      return result;
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(`Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid category ID format");
      }

      
      const result = await CategoryCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        throw new Error("Category not found");
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid category ID format");
      }
      
      const category = await CategoryCollection.findOne({ _id: new ObjectId(id) });
      
      if (!category) {
        return null;
      }
      
      return category;
    } catch (error) {
      throw new Error(`Failed to fetch category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default CategoryModel;