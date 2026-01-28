import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import * as Z from "zod";

export const PackageSchema = Z.object({
  _id: Z.instanceof(ObjectId).optional(),
  name: Z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  type: Z.string().min(1, "Type is required").max(50, "Type cannot exceed 50 characters"),
  tokens: Z.number().min(0, "Tokens must be 0 or greater"),
  price: Z.number().min(0, "Price must be 0 or greater"),
  description: Z.string().min(1, "Description is required").max(500, "Description cannot exceed 500 characters"),
  features: Z.array(Z.string().min(1, "Feature cannot be empty")).min(1, "At least one feature is required"),
  popular: Z.boolean().default(false),
});

export type Package = Z.infer<typeof PackageSchema>;

export const PackageCollection = database.collection<Package>("packages");

class PackageModel {
  static async createPackage(
    name: string,
    type: string,
    tokens: number,
    price: number,
    description: string,
    features: string[],
    popular: boolean = false
  ): Promise<Package> {
    try {
      const packageData = PackageSchema.parse({
        name,
        type,
        tokens,
        price,
        description,
        features,
        popular,
      });

      const result = await PackageCollection.insertOne(packageData);

      if (!result.acknowledged) {
        throw new Error("Failed to insert package into database");
      }

      return { ...packageData, _id: result.insertedId };
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ).join(", ");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(
        `Failed to create package: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async getPackages(): Promise<Package[]> {
    try {
      const packages = await PackageCollection.find({}).toArray();
      return packages;
    } catch (error) {
      throw new Error(
        `Failed to fetch packages: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async updatePackage(
    id: string,
    packageData: Partial<Package>
  ): Promise<Package | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid package ID format");
      }

      const { _id, ...updateData } = packageData;

      const validatedData = PackageSchema.partial().parse(updateData);

      const result = await PackageCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: validatedData },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Package not found");
      }

      return result;
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ).join(", ");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(
        `Failed to update package: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async deletePackage(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid package ID format");
      }

      const result = await PackageCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        throw new Error("Package not found");
      }

      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete package: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async getPackageById(id: string): Promise<Package | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid package ID format");
      }

      const packageData = await PackageCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!packageData) {
        return null;
      }

      return packageData;
    } catch (error) {
      throw new Error(
        `Failed to fetch package: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default PackageModel;