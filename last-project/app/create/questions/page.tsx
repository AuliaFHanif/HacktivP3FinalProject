"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  Database, 
  CheckCircle, 
  Loader2,
  LayoutGrid,
  HelpCircle,
  Layers,
  Settings,
  LogOut,
  Trash2,
  RefreshCw,
  Plus
} from "lucide-react";

interface Question {
  _id?: string;
  categoryID: string;
  level: string;
  type: string;
  content: string;
  followUp: boolean;
  audioUrl?: string;
}

interface Category {
  _id: string;
  title: string;
  description: string;
  imgUrl: string;
  level: {
    junior: boolean;
    mid: boolean;
    senior: boolean;
  };
  published: boolean;
}

export default function QuestionsManagement() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Questions");
  const [currentPage, setCurrentPage] = useState(1);

  // Form inputs
  const [categoryID, setCategoryID] = useState("");
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");
  const [count, setCount] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const ITEMS_PER_PAGE = 50;

  // Pagination calculations
  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  // Reset to first page if all questions are deleted
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [questions.length, currentPage, totalPages]);

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

  // Fetch categories and questions on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category/read");
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/questions/read");
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  

  const handleEdit = (question: Question) => {
    setEditingId(question._id || null);
    setEditContent(question.content);
  };

  const handleSaveEdit = async (questionId: string) => {
    try {
      const response = await fetch("/api/questions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId, content: editContent }),
      });
      if (response.ok) {
        setQuestions(questions.map(q => 
          q._id === questionId ? { ...q, content: editContent } : q
        ));
        setEditingId(null);
        setEditContent("");
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Question updated successfully!",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to update question");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update question: " + (err instanceof Error ? err.message : "Unknown error"),
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleDelete = async (questionId: string) => {
    Swal.fire({
      title: "Delete Question",
      text: "Are you sure you want to delete this question?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const formData = new FormData();
          formData.append("id", questionId);
          
          const response = await fetch("/api/questions/delete", {
            method: "DELETE",
            body: formData,
          });
          if (response.ok) {
            setQuestions(questions.filter(q => q._id !== questionId));
            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "Question deleted successfully!",
              confirmButtonColor: "#3b82f6",
              timer: 1500,
              showConfirmButton: false,
            });
          } else {
            throw new Error("Failed to delete question");
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: "Failed to delete question: " + (err instanceof Error ? err.message : "Unknown error"),
            confirmButtonColor: "#3b82f6",
          });
        }
      }
    });
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
        {/* Header bar */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-sm font-medium text-slate-400">Dashboard / {activeTab}</h2>
            <h1 className="text-2xl font-bold text-slate-800">Questions Management</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
        </header>

        {/* Content Section (Questions UI) */}
        <div className="max-w-5xl">
          {/* Search/Generator Bar */}
         

          {/* Result Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">All {activeTab}</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchQuestions}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 disabled:text-slate-300"
                  title="Refresh questions"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                  {startIndex + 1}-{Math.min(endIndex, questions.length)} of {questions.length} Items
                </span>
              </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedQuestions.map((q, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors border-b border-slate-200">
                    <td className="px-6 py-4 text-sm text-slate-600 leading-relaxed">
                      {editingId === q._id ? (
                        <input
                          type="text"
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && q._id) handleSaveEdit(q._id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                      ) : (
                        q.content
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === q._id ? (
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => q._id && handleSaveEdit(q._id)}
                            className="text-green-600 text-xs font-bold hover:underline"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="text-red-600 text-xs font-bold hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3 justify-end">
                          <button 
                            onClick={() => handleEdit(q)}
                            className="text-blue-600 text-xs font-bold hover:underline"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => q._id && handleDelete(q._id)}
                            className="text-red-600 text-xs font-bold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {questions.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <HelpCircle className="w-12 h-12 text-slate-200" />
                <p className="text-slate-400 text-sm">No data available. Use the generator above.</p>
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="text-sm text-slate-600">
                  Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-white disabled:text-slate-300 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-white disabled:text-slate-300 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}