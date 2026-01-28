"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  LayoutGrid, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Loader2, 
  X,
  FileText,
  HelpCircle,
  Layers,
  Settings,
  LogOut,
  PlusCircle
} from "lucide-react";

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
  const router = useRouter();
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

  const menuItems = [
    { name: "Categories", icon: LayoutGrid, path: "/create/categories" },
    { name: "Questions", icon: HelpCircle, path: "/create/questions" },
    { name: "Tiers", icon: Layers, path: "/create/tiers" },
    { name: "Create Questions", icon: PlusCircle, path: "/create/createQuestions" },
    { name: "Packages", icon: Plus, path: "/create/packages" },
    
  ];

  const handleNavigation = (path: string, name: string) => {
    setActiveTab(name);
    router.push(path);
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Seekers.</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">
            Main Menu
          </div>
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path, item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.name
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.name ? "text-blue-600" : "text-slate-400"}`} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition">
            <Settings className="w-5 h-5 text-slate-400" /> Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-64 p-8">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm">Organize your interview questions by industry or role.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: "", title: "", description: "", imgUrl: "", level: { junior: false, middle: false, senior: false }, published: false });
            setIsAdding(!isAdding);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Add Category"}
        </button>
      </div>

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
          <div key={cat._id} className="group bg-white rounded-3xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden">
                {cat.imgUrl ? (
                  <img src={cat.imgUrl} alt={cat.title} className="w-full h-full object-cover" />
                ) : (
                  <LayoutGrid className="text-blue-500" />
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button 
                  onClick={() => {
                    setFormData({ 
                      id: cat._id, 
                      title: cat.title, 
                      description: cat.description, 
                      imgUrl: cat.imgUrl,
                      level: cat.level || { junior: false, middle: false, senior: false },
                      published: cat.published || false
                    });
                    setIsAdding(true);
                  }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(cat._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{cat.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
              {cat.description}
            </p>
            
            {/* Levels Section */}
            {cat.level && (
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Levels</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${cat.level.junior ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      Junior
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {cat.level.junior ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${cat.level.middle ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      Middle
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {cat.level.middle ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${cat.level.senior ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      Senior
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {cat.level.senior ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Publish Status */}
            <button
              onClick={() => handlePublishToggle(cat)}
              className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition ${
                cat.published 
                  ? "bg-green-100 text-green-700 hover:bg-green-200" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.published ? "Published" : "Publish"}
            </button>
          </div>
        ))}
      </div>

      {!loading && categories.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-400">No categories found. Create your first one!</p>
        </div>
      )}
    </div>      </main>
    </div>  );
}