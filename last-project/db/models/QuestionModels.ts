import {database} from "../config/mongodb";
import { ObjectId } from "mongodb";
import * as Z from "zod";

export const QuestionSchema = Z.object({
  _id: Z.instanceof(ObjectId).optional(),
  categoryID: Z.instanceof(ObjectId),
  level: Z.string().min(1, "Level is required"),
  type: Z.string().min(1, "Type is required"),
  content: Z.string().min(1, "Content is required").max(1000, "Content cannot exceed 1000 characters"),
  followUp: Z.boolean().default(false),
  audioUrl: Z.string().min(1, "Audio URL is required").optional(),
});

export type Question = Z.infer<typeof QuestionSchema>;

export const QuestionCollection = database.collection<Question>("questions");

class QuestionModel {
  static async createQuestion(
    categoryID: string,
    level: string,
    type: string,
    content: string,
    followUp: boolean = false,
    audioUrl?: string
  ): Promise<Question> {
    try {
      // Validate categoryID
      if (!ObjectId.isValid(categoryID)) {
        throw new Error("Invalid category ID format");
      }

      const questionData = QuestionSchema.parse({
        categoryID: new ObjectId(categoryID),
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
  
  static async getQuestionsByCategory(categoryID: string): Promise<Question[]> {
    try {
      if (!ObjectId.isValid(categoryID)) {
        throw new Error("Invalid category ID format");
      }
      
      const questions = await QuestionCollection.find({ 
        categoryID: new ObjectId(categoryID) 
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
      
      // If categoryID is being updated, validate and convert it
      if (updateData.categoryID && typeof updateData.categoryID === 'string') {
        if (!ObjectId.isValid(updateData.categoryID as any)) {
          throw new Error("Invalid category ID format");
        }
        updateData.categoryID = new ObjectId(updateData.categoryID as any);
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
}

export default QuestionModel;