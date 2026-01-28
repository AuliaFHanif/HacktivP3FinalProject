import {database} from "../config/mongodb";
import { ObjectId } from "mongodb";
import * as Z from "zod";

export const QuestionSchema = Z.object({
  _id: Z.instanceof(ObjectId).optional(),
  categoryId: Z.instanceof(ObjectId),
  level: Z.string().min(1, "Level is required"),
  type: Z.string().min(1, "Type is required"),
  content: Z.string().min(1, "Content is required").max(1000, "Content cannot exceed 1000 characters"),
  followUp: Z.boolean().default(false),
  audioUrl: Z.string().optional(),
});

export type Question = Z.infer<typeof QuestionSchema>;

export const QuestionCollection = database.collection<Question>("questions");

class QuestionModel {
  static async createQuestion(
    categoryId: string,
    level: string,
    type: string,
    content: string,
    followUp: boolean = false,
    audioUrl?: string | null
  ): Promise<Question> {
    try {
      // Validate categoryId
      if (!ObjectId.isValid(categoryId)) {
        throw new Error("Invalid category ID format");
      }

      const questionData = QuestionSchema.parse({
        categoryId: new ObjectId(categoryId),
        level,
        type,
        content,
        followUp,
        audioUrl,
      });
      
      const result = await QuestionCollection.insertOne(questionData);
      
      if (!result.acknowledged) {
        throw new Error("Failed to insert question into database");
      }
      
      return { ...questionData, _id: result.insertedId };
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(`Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async getQuestions(): Promise<Question[]> {
    try {
      const questions = await QuestionCollection.find({}).toArray();
      return questions;
    } catch (error) {
      throw new Error(`Failed to fetch questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async getQuestionsByCategory(categoryId: string): Promise<Question[]> {
    try {
      if (!ObjectId.isValid(categoryId)) {
        throw new Error("Invalid category ID format");
      }
      
      const questions = await QuestionCollection.find({ 
        categoryId: new ObjectId(categoryId) 
      }).toArray();
      
      return questions;
    } catch (error) {
      throw new Error(`Failed to fetch questions by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async updateQuestion(id: string, question: Partial<Question>): Promise<Question | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid question ID format");
      }
      
      const { _id, ...updateData } = question;
      
      // If categoryId is being updated, validate and convert it
      if (updateData.categoryId && typeof updateData.categoryId === 'string') {
        if (!ObjectId.isValid(updateData.categoryId as any)) {
          throw new Error("Invalid category ID format");
        }
        updateData.categoryId = new ObjectId(updateData.categoryId as any);
      }
      
      const validatedData = QuestionSchema.partial().parse(updateData);
      
      const result = await QuestionCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: validatedData },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        throw new Error("Question not found");
      }
      
      return result;
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(`Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async deleteQuestion(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid question ID format");
      }
      
      const result = await QuestionCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        throw new Error("Question not found");
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async getQuestionById(id: string): Promise<Question | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid question ID format");
      }
      
      const question = await QuestionCollection.findOne({ _id: new ObjectId(id) });
      
      if (!question) {
        return null;
      }
      
      return question;
    } catch (error) {
      throw new Error(`Failed to fetch question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async countQuestionsByCategoryAndLevel(categoryId: string, level: string): Promise<number> {
    try {
      if (!ObjectId.isValid(categoryId)) {
        throw new Error("Invalid category ID format");
      }
      
      const count = await QuestionCollection.countDocuments({
        categoryId: new ObjectId(categoryId),
        level: level
      });
      
      return count;
    } catch (error) {
      throw new Error(`Failed to count questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default QuestionModel;