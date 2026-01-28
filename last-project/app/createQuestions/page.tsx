"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import {
  PlusCircle,
  Database,
  Loader2,
  HelpCircle,
  Trash2,
  Send,
} from "lucide-react";
import AdminProtection from "@/components/AdminProtection";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

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

export default function BulkQuestionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Create Questions");

  // Sync activeTab with current route
  useEffect(() => {
    if (pathname === "/createQuestions") {
      setActiveTab("Create Questions");
    }
  }, [pathname]);

  // Form inputs
  const [categoryId, setCategoryId] = useState("");
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");
  const [count, setCount] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"individual" | "bulk">("individual");

  const handleNavigation = (path: string, name: string) => {
    setActiveTab(name);
    router.push(path);
  };

  // Fetch categories on mount
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
  }, []);

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
        setQuestions(
          questions.map((q) =>
            q._id === questionId ? { ...q, content: editContent } : q,
          ),
        );
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
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update question",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Failed to update question: " +
          (err instanceof Error ? err.message : "Unknown error"),
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleAddQuestion = async () => {
    if (!categoryId || !level || !type || !questionContent) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all fields including question content",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Generate voice for the question
      const voiceResponse = await fetch("/api/questions/generateVoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: questionContent }),
      });

      const voiceData = await voiceResponse.json();
      if (!voiceData.success) {
        throw new Error("Failed to generate voice");
      }

      // Create question object with audio URL
      const questionWithVoice = {
        categoryId,
        level,
        type,
        content: questionContent,
        followUp,
        audioUrl: voiceData.audioUrl,
      };

      // Insert question to database
      const insertResponse = await fetch("/api/questions/insertBulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: [questionWithVoice] }),
      });

      const insertData = await insertResponse.json();

      if (insertData.success || insertData.inserted > 0) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Question created and inserted successfully!",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
          showConfirmButton: false,
        });
        // Clear form
        setQuestionContent("");
        setFollowUp(false);
        setError(null);
      } else {
        throw new Error(insertData.error || "Failed to insert question");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text:
          "Failed to create question: " +
          (err instanceof Error ? err.message : "Unknown error"),
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleGenerateBulk = async () => {
    if (!categoryId || !level || !type) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in category, level, and type for bulk generation",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    if (questions.length + count > 20) {
      Swal.fire({
        icon: "warning",
        title: "Limit Exceeded",
        text: `You can only generate a maximum of 20 questions. You already have ${questions.length} question(s), so you can only add ${20 - questions.length} more.`,
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/questions/createBulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, level, type, count }),
      });
      const data = await response.json();
      if (data.success && data.questions) {
        setQuestions([...questions, ...data.questions]);
        setError(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Generation Failed",
          text: "Failed to generate questions",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Generation Error",
        text:
          "Failed to generate questions: " +
          (err instanceof Error ? err.message : "Unknown error"),
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Questions",
        text: "Please add at least one question",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Generate voices for all questions
      const questionsWithVoices = await Promise.all(
        questions.map(async (q) => {
          try {
            const voiceResponse = await fetch("/api/questions/generateVoice", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: q.content }),
            });
            const voiceData = await voiceResponse.json();
            return {
              ...q,
              audioUrl: voiceData.success ? voiceData.audioUrl : undefined,
            };
          } catch (err) {
            console.error("Failed to generate voice:", err);
            return q;
          }
        }),
      );

      // Insert all questions in bulk
      const bulkResponse = await fetch("/api/questions/insertBulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsWithVoices }),
      });

      const bulkData = await bulkResponse.json();
      if (bulkData.success || bulkData.inserted > 0) {
        setError(null);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Successfully inserted ${bulkData.inserted} question(s)!`,
          confirmButtonColor: "#3b82f6",
        });
        setQuestions([]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Insertion Failed",
          text: `Failed to insert questions. ${bulkData.error || ""}`,
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text:
          "Failed to submit questions: " +
          (err instanceof Error ? err.message : "Unknown error"),
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminProtection>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <AdminSidebar activeTab={activeTab} onNavigate={handleNavigation} />

        <main className="flex-1 ml-64 p-8">
          <AdminHeader
            title="Create Questions"
            description="Add interview questions individually or generate them in bulk"
            isAdding={false}
            onToggleAdd={() => {}}
          />

          {/* Content Section (Questions UI) */}
          <div className="max-w-5xl">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Mode Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode("individual")}
                disabled={questions.length > 0}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  mode === "individual"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                } ${questions.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Individual Creation
              </button>
              <button
                onClick={() => setMode("bulk")}
                disabled={questions.length > 0}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  mode === "bulk"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                } ${questions.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Bulk Generation
              </button>
            </div>

            {/* Form to Add Questions */}
            {mode === "individual" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
                <h3 className="font-bold text-slate-800 mb-4">Add Question</h3>
                {questions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-blue-700 text-sm">
                    One question added. Submit or remove it to add another.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Category
                    </label>
                    <select
                      disabled={submitting}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Level
                    </label>
                    <select
                      disabled={submitting}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="">Select Level...</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Type
                    </label>
                    <select
                      disabled={submitting}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="">Select Type...</option>
                      <option value="intro">Intro</option>
                      <option value="core">Core</option>
                      <option value="closing">Closing</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer disabled:cursor-not-allowed disabled:text-slate-400">
                      <input
                        disabled={submitting}
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 disabled:cursor-not-allowed"
                        checked={followUp}
                        onChange={(e) => setFollowUp(e.target.checked)}
                      />
                      Follow Up Question
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Question Content
                  </label>
                  <textarea
                    disabled={submitting}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 h-24 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
                    placeholder="Enter question content..."
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleAddQuestion}
                  disabled={submitting}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  {submitting ? "Creating..." : "Create Question"}
                </button>
              </div>
            )}

            {/* Bulk Generation Form */}
            {mode === "bulk" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
                <h3 className="font-bold text-slate-800 mb-4">
                  Generate Questions in Bulk
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  AI will generate questions based on your criteria
                </p>
                {questions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-blue-700 text-sm">
                    You have {questions.length} question(s). You can add up to{" "}
                    {20 - questions.length} more questions (maximum 20 total).
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Level
                    </label>
                    <select
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="">Select Level...</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Type
                    </label>
                    <select
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="">Select Type...</option>
                      <option value="intro">Intro</option>
                      <option value="core">Core</option>
                      <option value="closing">Closing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Number of Questions
                      <span className="text-red-600 font-bold ml-2">
                        (Max 20 questions)
                      </span>
                    </label>{" "}
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                      placeholder="10"
                      value={count}
                      onChange={(e) =>
                        setCount(Math.min(20, parseInt(e.target.value) || 10))
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateBulk}
                  disabled={loading || questions.length >= 20}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  title={
                    questions.length >= 20 ? "Maximum 20 questions reached" : ""
                  }
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  {loading ? "Generating..." : "Generate Questions"}
                </button>
              </div>
            )}

            {/* Result Table - Only show in bulk mode */}
            {mode === "bulk" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">
                    Questions to Submit
                  </h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                    {questions.length} Items
                  </span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {questions.map((q, i) => (
                      <tr
                        key={i}
                        className="group hover:bg-slate-50 transition-colors border-b border-slate-200"
                      >
                        <td className="px-6 py-4 text-sm text-slate-600 leading-relaxed">
                          {editingId === `${i}` ? (
                            <textarea
                              className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 h-32 resize-none"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                              {q.content}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === `${i}` ? (
                            <div className="flex gap-2 justify-end flex-col">
                              <button
                                onClick={() => {
                                  setQuestions(
                                    questions.map((question, idx) =>
                                      idx === i
                                        ? { ...question, content: editContent }
                                        : question,
                                    ),
                                  );
                                  setEditingId(null);
                                  setEditContent("");
                                }}
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
                            <div className="flex gap-2 justify-end flex-col">
                              <button
                                onClick={() => {
                                  setEditingId(`${i}`);
                                  setEditContent(q.content);
                                }}
                                className="text-blue-600 text-xs font-bold hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveQuestion(i)}
                                className="text-red-600 text-xs font-bold hover:underline flex items-center gap-1 justify-end"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
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
                    <p className="text-slate-400 text-sm">
                      No questions added yet. Add one above.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button - Only show in bulk mode */}
            {mode === "bulk" && questions.length > 0 && (
              <div className="mt-8 flex gap-3 justify-end">
                <button
                  onClick={() => setQuestions([])}
                  className="px-6 py-3 rounded-lg font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition"
                  disabled={submitting}
                >
                  Clear All
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:bg-slate-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Generate Voices & Submit
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminProtection>
  );
}
