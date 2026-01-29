"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Loader2, 
  DollarSign,
  Users,
  Layers
} from "lucide-react";
import AdminProtection from "@/components/AdminProtection";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import TierCard from "@/components/admin/TierCard";
import EmptyState from "@/components/admin/EmptyState";

interface Tier {
  _id: string;
  title: string;
  price: number;
  benefits: string[];
  quota: number;
  description: string;
}

export default function TierManagement() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("Tiers");
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    price: "",
    benefits: "",
    quota: "",
    description: ""
  });

  const handleNavigation = (path: string, name: string) => {
    setActiveTab(name);
  };

  // 1. Fetch Tiers (GET)
  const fetchTiers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tiers/read"); 
      const data = await res.json();
      if (data.success && data.data) setTiers(data.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTiers(); }, []);

  // 2. Handle Create/Update (POST/PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = new FormData();
    body.append("title", formData.title);
    body.append("price", formData.price);
    body.append("benefits", formData.benefits); // Backend handles .split(",")
    body.append("quota", formData.quota);
    body.append("description", formData.description);
    if (formData.id) body.append("id", formData.id);

    const endpoint = formData.id ? "/api/tiers/update" : "/api/tiers/create";
    const method = formData.id ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, { method, body });
      if (res.ok) {
        setFormData({ id: "", title: "", price: "", benefits: "", quota: "", description: "" });
        setIsAdding(false);
        fetchTiers();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: formData.id ? "Tier updated successfully!" : "Tier created successfully!",
          confirmButtonColor: "#0F172A",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text: "Failed to save tier",
        confirmButtonColor: "#0F172A",
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Delete (DELETE)
  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Delete Tier",
      text: "Are you sure you want to delete this tier?",
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
          const res = await fetch("/api/tiers/delete", { method: "DELETE", body });
          if (res.ok) {
            fetchTiers();
            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "Tier deleted successfully!",
              confirmButtonColor: "#0F172A",
              timer: 1500,
              showConfirmButton: false,
            });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: "Failed to delete tier",
            confirmButtonColor: "#0F172A",
          });
        }
      }
    });
  };

  return (
    <AdminProtection>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <AdminSidebar activeTab={activeTab} onNavigate={handleNavigation} />

        <main className="flex-1 ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            <AdminHeader
              title="Subscription Tiers"
              description="Manage pricing, benefits, and user limits for your platform."
              isAdding={isAdding}
              onToggleAdd={() => {
                setFormData({ id: "", title: "", price: "", benefits: "", quota: "", description: "" });
                setIsAdding(!isAdding);
              }}
            />

            {/* Entry Form */}
            {isAdding && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-12 animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-4">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Basic Info
                      </label>
                      <input 
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                        placeholder="Tier Title (e.g. Pro Plan)"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <input 
                          required
                          type="number"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                          placeholder="Token Cost"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <input 
                          required
                          type="number"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                          placeholder="Question Quota"
                          value={formData.quota}
                          onChange={(e) => setFormData({...formData, quota: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Benefits & Details
                      </label>
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
                        placeholder="Benefits (separated by commas: Unlimited AI, 24/7 Support, No Ads)"
                        value={formData.benefits}
                        onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                      />
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:bg-slate-300 flex justify-center items-center"
                      >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : formData.id ? "Update Subscription Tier" : "Save Subscription Tier"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tiers.map((tier) => (
                <TierCard
                  key={tier._id}
                  id={tier._id}
                  title={tier.title}
                  description={tier.description}
                  price={tier.price}
                  quota={tier.quota}
                  benefits={tier.benefits}
                  onEdit={() => {
                    setFormData({ 
                      id: tier._id, 
                      title: tier.title, 
                      price: tier.price.toString(), 
                      benefits: tier.benefits.join(","), 
                      quota: tier.quota.toString(), 
                      description: tier.description 
                    });
                    setIsAdding(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onDelete={() => handleDelete(tier._id)}
                />
              ))}
            </div>

            {!loading && tiers.length === 0 && (
              <EmptyState 
                icon={Layers}
                message="No subscription tiers configured yet."
              />
            )}
          </div>
        </main>
      </div>
    </AdminProtection>
  );
}