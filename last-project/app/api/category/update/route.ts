import CategoryModel from "@/db/models/CategoryModels";

export async function PUT(request: Request) {
    const { id, title, description } = await request.json();
    await CategoryModel.updateCategory(id, { title, description });
    return new Response(`Category with ID '${id}' updated successfully!`);
}