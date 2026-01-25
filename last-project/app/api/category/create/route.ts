import  CategoryModel  from "@/db/models/CategoryModels";

export async function POST(request: Request) {
    const { title, description } = await request.json();
    await CategoryModel.createCategory({ title, description });
    return new Response(`Category '${title}' created successfully!`);

}