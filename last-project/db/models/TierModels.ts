import {database} from "../config/mongodb";
import { ObjectId } from "mongodb";
import * as Z from "zod";

export const TierSchema = Z.object({
  _id: Z.instanceof(ObjectId).optional(),
  title: Z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  price: Z.number().min(1, "Price must be greater than 0"),
  benefits: Z.array(Z.string().min(1, "Benefit cannot be empty")).min(1, "At least one benefit is required"),
  quota: Z.number().min(1, "Quota must be greater than 0"),
  description: Z.string().min(1, "Description is required").max(500, "Description cannot exceed 500 characters"),
});

export type Tier = Z.infer<typeof TierSchema>;

export const TierCollection = database.collection<Tier>("tiers");

class TierModel {
  static async createTier(
    title: string,
    price: number,
    benefits: string[],
    quota: number,
    description: string
  ): Promise<Tier> {
    try {
      const tierData = TierSchema.parse({
        title,
        price,
        benefits,
        quota,
        description,
      });
      
      const result = await TierCollection.insertOne(tierData);
      
      if (!result.acknowledged) {
        throw new Error("Failed to insert tier into database");
      }
      
      return { ...tierData, _id: result.insertedId };
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(`Failed to create tier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async getTiers(): Promise<Tier[]> {
    try {
      const tiers = await TierCollection.find({}).toArray();
      return tiers;
    } catch (error) {
      throw new Error(`Failed to fetch tiers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async updateTier(id: string, tier: Partial<Tier>): Promise<Tier | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid tier ID format");
      }
      
      const { _id, ...updateData } = tier;
      
      const validatedData = TierSchema.partial().parse(updateData);
      
      const result = await TierCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: validatedData },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        throw new Error("Tier not found");
      }
      
      return result;
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(`Failed to update tier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async deleteTier(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid tier ID format");
      }
      
      const result = await TierCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        throw new Error("Tier not found");
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete tier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  static async getTierById(id: string): Promise<Tier | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid tier ID format");
      }
      
      const tier = await TierCollection.findOne({ _id: new ObjectId(id) });
      
      if (!tier) {
        return null;
      }
      
      return tier;
    } catch (error) {
      throw new Error(`Failed to fetch tier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default TierModel;