import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import * as Z from "zod";

export const UserSchema = Z.object({
  _id: Z.instanceof(ObjectId).optional(),
  email: Z.string().email("Invalid email format"),
  password: Z.string().min(8, "Password must be at least 8 characters"),
  name: Z.string().min(1, "Name is required").optional(),
  role: Z.enum(["user", "admin"]).default("user"),
  token: Z.number().optional(),
});

export type User = Z.infer<typeof UserSchema>;

export const UserCollection = database.collection<User>("users");

class UserModel {
  static async createUser(
    email: string,
    password: string,
    name?: string
  ): Promise<User> {
    try {
      const userData = UserSchema.parse({
        email,
        password, // Already hashed before passing here
        name,
        role: "user",
        token: 0,
      });

      const result = await UserCollection.insertOne(userData);

      if (!result.acknowledged) {
        throw new Error("Failed to insert user into database");
      }

      return { ...userData, _id: result.insertedId };
    } catch (error) {
      if (error instanceof Z.ZodError) {
        const errorMessages = error.issues.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ).join(", ");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(
        `Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserCollection.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(
        `Failed to fetch user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid user ID format");
      }

      const user = await UserCollection.findOne({ _id: new ObjectId(id) });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw new Error(
        `Failed to fetch user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async updateUser(
    id: string,
    user: Partial<User>
  ): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid user ID format");
      }

      const { _id, ...updateData } = user;

      const validatedData = UserSchema.partial().parse(updateData);

      const result = await UserCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: validatedData },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("User not found");
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
        `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid user ID format");
      }

      const result = await UserCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        throw new Error("User not found");
      }

      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default UserModel;