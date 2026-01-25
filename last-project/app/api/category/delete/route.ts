import CategoryModel  from "@/db/models/CategoryModels";

export async function DELETE(request: Request) {
    const { id } = await request.json();
    await CategoryModel.deleteCategory(id);
    return new Response(`Category with ID '${id}' deleted successfully!`);
}