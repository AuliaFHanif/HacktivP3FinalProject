"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Loader2, 
  X,
  DollarSign,
  Coins,
  LayoutGrid,
  HelpCircle,
  Settings,
  LogOut,
  PlusCircle,
  Star,
  Layers
} from "lucide-react";

interface PackageType {
  _id: string;
  name: string;
  type: string;
  tokens: number;
  price: number;
  description: string;
  features: string[];
  popular: boolean;
}

export default function PackageManagement() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("Packages");
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "",
    tokens: "",
    price: "",
    description: "",
    features: "", // Handled as comma-separated string for the form
    popular: false
  });

  const menuItems = [
    { name: "Categories", icon: LayoutGrid, path: "/create/categories" },
    { name: "Questions", icon: HelpCircle, path: "/create/questions" },
    { name: "Tiers", icon: Layers, path: "/create/tiers" },
    { name: "Create Questions", icon: PlusCircle, path: "/create/createQuestions" },
    { name: "Packages", icon: Package, path: "/create/packages" },

  ];

  const handleNavigation = (path: string, name: string) => {
    setActiveTab(name);
    router.push(path);
  };

  // 1. Fetch Packages (GET)
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/packages/read"); 
      const data = await res.json();
      if (data.success && data.data) setPackages(data.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  // 2. Handle Create/Update (POST/PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = new FormData();
    body.append("name", formData.name);
    body.append("type", formData.type);
    body.append("tokens", formData.tokens);
    body.append("price", formData.price);
    body.append("description", formData.description);
    body.append("features", formData.features); // Backend handles .split(",")
    body.append("popular", formData.popular.toString());
    if (formData.id) body.append("id", formData.id);

    const endpoint = formData.id ? "/api/packages/update" : "/api/packages/create";
    const method = formData.id ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, { method, body });
      if (res.ok) {
        setFormData({ id: "", name: "", type: "", tokens: "", price: "", description: "", features: "", popular: false });
        setIsAdding(false);
        fetchPackages();
      }
    } catch (error) {
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Delete (DELETE)
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    
    const body = new FormData();
    body.append("id", id);

    try {
      const res = await fetch("/api/packages/delete", { method: "DELETE", body });
      if (res.ok) fetchPackages();
    } catch (error) {
      alert("Delete failed");
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Token Packages</h1>
              <p className="text-slate-500 text-sm">Manage pricing packages, token allocations, and features for your platform.</p>
            </div>
            <button 
              onClick={() => {
                setFormData({ id: "", name: "", type: "", tokens: "", price: "", description: "", features: "", popular: false });
                setIsAdding(!isAdding);
              }}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              {isAdding ? <X size={18} /> : <Plus size={18} />}
              {isAdding ? "Cancel" : "Create New Package"}
            </button>
          </div>

          {/* Entry Form */}
          {isAdding && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-12 animate-in fade-in zoom-in-95 duration-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Basic Info</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                      placeholder="Package Name (e.g. Premium Package)"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                      placeholder="Type (e.g. Premium, Basic, Pro)"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    />
                    <div className="relative">
                      <Coins className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                      <input 
                        required
                        type="number"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                        placeholder="Tokens"
                        value={formData.tokens}
                        onChange={(e) => setFormData({...formData, tokens: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                      <input 
                        required
                        type="number"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                        placeholder="Price (IDR)"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.popular}
                        onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Mark as Popular</span>
                    </label>
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Features & Details</label>
                    <textarea 
                      required
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" 
                      placeholder="Short Description..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                    <textarea 
                      required
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" 
                      placeholder="Features (separated by commas: Valid for 1 year, AI Interview Practice, CV Analysis)"
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                    />
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:bg-slate-300 flex justify-center items-center"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : formData.id ? "Update Package" : "Save Package"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg._id} className={`relative bg-white rounded-[2rem] border ${pkg.popular ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'} p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} fill="white" />
                    POPULAR
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`${pkg.popular ? 'bg-blue-50' : 'bg-slate-50'} p-3 rounded-2xl ${pkg.popular ? 'text-blue-600' : 'text-slate-600'}`}>
                    <Package size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setFormData({ 
                          id: pkg._id, 
                          name: pkg.name, 
                          type: pkg.type,
                          tokens: pkg.tokens.toString(),
                          price: pkg.price.toString(), 
                          description: pkg.description,
                          features: pkg.features.join(","), 
                          popular: pkg.popular
                        });
                        setIsAdding(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(pkg._id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{pkg.name}</h3>
                  <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-lg mt-1">{pkg.type}</span>
                </div>
                <p className="text-slate-500 text-sm mb-6 flex-grow">{pkg.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">Rp {(pkg.price / 1000).toFixed(0)}K</span>
                  <div className="flex items-center gap-2 mt-2 text-sm font-bold text-blue-600">
                    <Coins size={16} />
                    {pkg.tokens} Tokens
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                      <span>{feature.trim()}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-3 rounded-2xl font-bold text-sm transition ${
                  pkg.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}>
                  Preview Package
                </button>
              </div>
            ))}
          </div>

          {!loading && packages.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <Package className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">No packages configured yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}