"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  HelpCircle,
  Layers,
  RefreshCw,
  Search,
  X,
  Play
} from "lucide-react";
import AdminProtection from "@/components/AdminProtection";
import AdminSidebar from "@/components/admin/AdminSidebar";
import EmptyState from "@/components/admin/EmptyState";

interface Question {
  _id?: string;
  categoryId: string;
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Questions");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editType, setEditType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const ITEMS_PER_PAGE = 50;

  // Helper function to get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.title : 'Unknown';
  };

  // Filter questions based on search query
  const filteredQuestions = questions.filter(question => {
    const categoryName = getCategoryName(question.categoryId).toLowerCase();
    const content = question.content.toLowerCase();
    const level = question.level.toLowerCase();
    const type = question.type.toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      categoryName.includes(query) ||
      content.includes(query) ||
      level.includes(query) ||
      type.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredQuestions.length, currentPage, totalPages]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleNavigation = (path: string, name: string) => {
    setActiveTab(name);
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
    setEditCategoryId(question.categoryId);
    setEditLevel(question.level);
    setEditType(question.type);
  };

  const handleSaveEdit = async (questionId: string) => {
    setIsSaving(true);
    try {
      // First, generate new voice for the edited content
      const voiceResponse = await fetch("/api/questions/generateVoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editContent }),
      });

      let audioUrl = "";
      if (voiceResponse.ok) {
        const voiceData = await voiceResponse.json();
        if (voiceData.success) {
          audioUrl = voiceData.audioUrl;
        }
      }

      // Then update the question with new content, category, level, type, and audio
      const updateBody: any = { 
        id: questionId, 
        content: editContent,
        categoryId: editCategoryId,
        level: editLevel,
        type: editType
      };
      if (audioUrl) {
        updateBody.audioUrl = audioUrl;
      }

      const response = await fetch("/api/questions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });

      if (response.ok) {
        setQuestions(questions.map(q => 
          q._id === questionId 
            ? { ...q, content: editContent, categoryId: editCategoryId, level: editLevel, type: editType, audioUrl: audioUrl || q.audioUrl } 
            : q
        ));
        setEditingId(null);
        setEditContent("");
        setEditCategoryId("");
        setEditLevel("");
        setEditType("");
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Question updated and voice regenerated successfully!",
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
    } finally {
      setIsSaving(false);
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

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handlePlayAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      Swal.fire({
        icon: "info",
        title: "No Audio Available",
        text: "This question doesn't have an audio file yet.",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  return (
    <AdminProtection>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <AdminSidebar activeTab={activeTab} onNavigate={handleNavigation} />

        <main className="flex-1 ml-64 p-8">
          <div className="max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Questions Management</h1>
              <p className="text-slate-500 text-sm">Browse and manage all questions in the system.</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by category, content, level, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-slate-600">
                  Found <span className="font-bold text-blue-600">{filteredQuestions.length}</span> result{filteredQuestions.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              )}
            </div>

            {/* Result Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">
                  {searchQuery ? 'Search Results' : 'All Questions'}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchQuestions}
                    disabled={loading || isSaving}
                    className="text-blue-600 hover:text-blue-700 disabled:text-slate-300"
                    title="Refresh questions"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading || isSaving ? 'animate-spin' : ''}`} />
                  </button>
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                    {filteredQuestions.length === 0 ? '0' : `${startIndex + 1}-${Math.min(endIndex, filteredQuestions.length)}`} of {filteredQuestions.length} Items
                  </span>
                </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Level & Type</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedQuestions.map((q, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors border-b border-slate-200">
                      <td className="px-6 py-4">
                        {editingId === q._id ? (
                          <select
                            value={editCategoryId}
                            onChange={(e) => setEditCategoryId(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat._id} value={cat._id}>
                                {cat.title}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {getCategoryName(q.categoryId)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 leading-relaxed">
                        {editingId === q._id ? (
                          <input
                            type="text"
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && q._id && !isSaving) handleSaveEdit(q._id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                        ) : (
                          q.content
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === q._id ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</span>
                              <select
                                value={editLevel}
                                onChange={(e) => setEditLevel(e.target.value)}
                                className="border border-slate-300 rounded px-2 py-1 text-xs"
                              >
                                <option value="">Select Level</option>
                                <option value="junior">Junior</option>
                                <option value="middle">Middle</option>
                                <option value="senior">Senior</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
                              <select
                                value={editType}
                                onChange={(e) => setEditType(e.target.value)}
                                className="border border-slate-300 rounded px-2 py-1 text-xs"
                              >
                                <option value="">Select Type</option>
                                <option value="intro">Intro</option>
                                <option value="core">Core</option>
                                <option value="closing">Closing</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                                q.level.toLowerCase() === 'junior' ? 'bg-green-50 text-green-700 border-green-200' :
                                q.level.toLowerCase() === 'mid' || q.level.toLowerCase() === 'middle' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                q.level.toLowerCase() === 'senior' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                              }`}>
                                {q.level.charAt(0).toUpperCase() + q.level.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                                q.type.toLowerCase() === 'intro' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                q.type.toLowerCase() === 'core' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                q.type.toLowerCase() === 'closing' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                              }`}>
                                {q.type.charAt(0).toUpperCase() + q.type.slice(1)}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingId === q._id ? (
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => q._id && handleSaveEdit(q._id)}
                              disabled={isSaving}
                              className="text-green-600 text-xs font-bold hover:underline disabled:text-slate-300 disabled:cursor-not-allowed"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              disabled={isSaving}
                              className="text-red-600 text-xs font-bold hover:underline disabled:text-slate-300 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-3 justify-end">
                            <button 
                              onClick={() => handlePlayAudio(q.audioUrl)}
                              disabled={isSaving}
                              className="text-green-600 text-xs font-bold hover:underline disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1"
                              title="Play Audio"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Play
                            </button>
                            <button 
                              onClick={() => handleEdit(q)}
                              disabled={isSaving}
                              className="text-blue-600 text-xs font-bold hover:underline disabled:text-slate-300 disabled:cursor-not-allowed"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => q._id && handleDelete(q._id)}
                              disabled={isSaving}
                              className="text-red-600 text-xs font-bold hover:underline disabled:text-slate-300 disabled:cursor-not-allowed"
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
              {filteredQuestions.length === 0 && (
                <EmptyState 
                  icon={HelpCircle}
                  message={searchQuery ? `No questions found for "${searchQuery}"` : "No data available. Create some questions to get started."}
                />
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
                      disabled={currentPage === 1 || isSaving}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-white disabled:text-slate-300 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || isSaving}
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
    </AdminProtection>
  );
}