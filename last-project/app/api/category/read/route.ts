import CategoryModel from "@/db/models/CategoryModels";

export async function GET() {
    const categories = await CategoryModel.getCategories();
    return new Response(JSON.stringify(categories), {
        headers: { 'Content-Type': 'application/json' }
    });
}