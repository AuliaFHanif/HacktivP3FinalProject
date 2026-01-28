"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  LayoutGrid, 
  Image as ImageIcon, 
  Loader2, 
  FileText
} from "lucide-react";
import AdminProtection from "@/components/AdminProtection";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import CategoryCard from "@/components/admin/CategoryCard";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface Category {
  _id: string;
  title: string;
  description: string;
  imgUrl: string;
  level?: {
    junior: boolean;
    middle: boolean;
    senior: boolean;
  };
  published?: boolean;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("Categories");
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    imgUrl: "",
    level: {
      junior: false,
      middle: false,
      senior: false
    },
    published: false
  });

  const handleNavigation = (path: string, name: string) => {
    setActiveTab(name);
  };

  // 1. Fetch Categories (GET)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/category/read");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // 2. Handle Create/Update (POST/PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = new FormData();
    body.append("title", formData.title);
    body.append("description", formData.description);
    body.append("imgUrl", formData.imgUrl);
    body.append("level", JSON.stringify(formData.level));
    body.append("published", formData.published.toString());
    if (formData.id) body.append("id", formData.id);

    const endpoint = formData.id ? "/api/category/update" : "/api/category/create";
    const method = formData.id ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, { method, body });
      if (res.ok) {
        setFormData({ id: "", title: "", description: "", imgUrl: "", level: { junior: false, middle: false, senior: false }, published: false });
        setIsAdding(false);
        fetchCategories();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: formData.id ? "Category updated successfully!" : "Category created successfully!",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to save category");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text: error instanceof Error ? error.message : "Failed to save category",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Delete (DELETE)
const handleDelete = async (id: string) => {
  try {
    // Check if any questions have this category
    const questionsRes = await fetch("/api/questions/read");
    
    if (!questionsRes.ok) {
      throw new Error("Failed to fetch questions");
    }
    
    const questionsData = await questionsRes.json();
    
    if (!questionsData.questions) {
      throw new Error("Failed to fetch questions");
    }

    // Compare categoryId - handle both string and ObjectId formats
    const questionsWithCategory = questionsData.questions.filter((q: any) => {
      // Handle different possible formats of categoryId
      let qCategoryId: string;
      
      if (typeof q.categoryId === 'string') {
        qCategoryId = q.categoryId;
      } else if (q.categoryId?.$oid) {
        // MongoDB extended JSON format
        qCategoryId = q.categoryId.$oid;
      } else if (q.categoryId?._id) {
        // ObjectId with _id property
        qCategoryId = typeof q.categoryId._id === 'string' 
          ? q.categoryId._id 
          : q.categoryId._id.toString();
      } else if (typeof q.categoryId?.toString === 'function') {
        // ObjectId with toString method
        qCategoryId = q.categoryId.toString();
      } else {
        return false;
      }
      
      return qCategoryId === id;
    });

    if (questionsWithCategory.length > 0) {
      Swal.fire({
        title: "Cannot Delete Category",
        html: `
          <p>This category has <strong>${questionsWithCategory.length}</strong> question(s) associated with it.</p>
          <p class="mt-2">Please delete or reassign these questions first.</p>
        `,
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    Swal.fire({
      title: "Delete Category",
      text: "Are you sure you want to delete this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const body = new FormData();
          body.append("id", id);
          const res = await fetch("/api/category/delete", { method: "DELETE", body });
          if (res.ok) {
            fetchCategories();
            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "Category deleted successfully!",
              confirmButtonColor: "#3b82f6",
              timer: 1500,
              showConfirmButton: false,
            });
          } else {
            throw new Error("Failed to delete category");
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: error instanceof Error ? error.message : "Failed to delete category",
            confirmButtonColor: "#3b82f6",
          });
        }
      }
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text: error instanceof Error ? error.message : "Failed to check questions",
      confirmButtonColor: "#3b82f6",
    });
  }
};
  // 4. Handle Publish/Unpublish
  const handlePublishToggle = async (cat: Category) => {
    try {
      const body = new FormData();
      body.append("id", cat._id);
      body.append("title", cat.title);
      body.append("description", cat.description);
      body.append("imgUrl", cat.imgUrl);
      body.append("level", JSON.stringify(cat.level || { junior: false, middle: false, senior: false }));
      body.append("published", (!cat.published).toString());

      const res = await fetch("/api/category/update", { method: "PUT", body });
      if (res.ok) {
        fetchCategories();
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: `Category ${!cat.published ? "published" : "unpublished"} successfully!`,
          confirmButtonColor: "#3b82f6",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to update published status");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error instanceof Error ? error.message : "Failed to update published status",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  return (
    <AdminProtection>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <AdminSidebar activeTab={activeTab} onNavigate={handleNavigation} />

        <main className="flex-1 ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            <AdminHeader
              title="Categories"
              description="Organize your interview questions by industry or role."
              isAdding={isAdding}
              onToggleAdd={() => {
                setFormData({ id: "", title: "", description: "", imgUrl: "", level: { junior: false, middle: false, senior: false }, published: false });
                setIsAdding(!isAdding);
              }}
            />

            {/* Entry Form */}
            {isAdding && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10 animate-in fade-in slide-in-from-top-4">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Category Title</label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-blue-400 transition">
                        <LayoutGrid className="text-slate-400 w-5 h-5" />
                        <input 
                          required
                          className="bg-transparent outline-none w-full text-sm" 
                          placeholder="e.g. Frontend Developer"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Image URL</label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-blue-400 transition">
                        <ImageIcon className="text-slate-400 w-5 h-5" />
                        <input 
                        required
                          className="bg-transparent outline-none w-full text-sm" 
                          placeholder="https://..." 
                          value={formData.imgUrl}
                          onChange={(e) => setFormData({...formData, imgUrl: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Description</label>
                      <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-blue-400 transition">
                        <FileText className="text-slate-400 w-5 h-5 mt-1" />
                        <textarea 
                          required
                          rows={4}
                          className="bg-transparent outline-none w-full text-sm resize-none" 
                          placeholder="Describe this category..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Levels</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-400 transition cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={formData.level.junior}
                            onChange={(e) => setFormData({...formData, level: {...formData.level, junior: e.target.checked}})}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm font-medium text-slate-700">Junior</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-400 transition cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={formData.level.middle}
                            onChange={(e) => setFormData({...formData, level: {...formData.level, middle: e.target.checked}})}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm font-medium text-slate-700">Middle</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-400 transition cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={formData.level.senior}
                            onChange={(e) => setFormData({...formData, level: {...formData.level, senior: e.target.checked}})}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm font-medium text-slate-700">Senior</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Status</label>
                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-400 transition cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={formData.published}
                          onChange={(e) => setFormData({...formData, published: e.target.checked})}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium text-slate-700">Published</span>
                      </label>
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:bg-slate-300"
                    >
                      {loading ? <Loader2 className="animate-spin mx-auto" /> : formData.id ? "Update Category" : "Save Category"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat._id}
                  id={cat._id}
                  title={cat.title}
                  description={cat.description}
                  imgUrl={cat.imgUrl}
                  level={cat.level}
                  published={cat.published}
                  onEdit={() => {
                    setFormData({ 
                      id: cat._id, 
                      title: cat.title, 
                      description: cat.description, 
                      imgUrl: cat.imgUrl,
                      level: cat.level || { junior: false, middle: false, senior: false },
                      published: cat.published || false
                    });
                    setIsAdding(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onDelete={() => handleDelete(cat._id)}
                  onTogglePublish={() => handlePublishToggle(cat)}
                />
              ))}
            </div>

            {!loading && categories.length === 0 && (
              <EmptyState message="No categories found. Create your first one!" />
            )}
          </div>
        </main>
      </div>
    </AdminProtection>
  );
}