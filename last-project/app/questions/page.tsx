"use client";

import { useState } from "react";

interface Question {
  _id?: string;
  categoryID: string;
  level: string;
  type: string;
  content: string;
  followUp: boolean;
  audioUrl?: string;
}

export default function BulkQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  // Form inputs for generation
  const [categoryID, setCategoryID] = useState("");
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");

  const handleGenerateQuestions = async () => {
    if (!categoryID || !level || !type) {
      setError("Please fill in categoryID, level, and type");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/questions/createBulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryID, level, type, count: 10 }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate questions");
      }

      // Insert generated questions into table
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleInsertQuestions = async () => {
    if (questions.length === 0) {
      setError("No questions to insert");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress("Starting voice generation...");

    try {
      // Step 1: Generate voices and upload to Cloudinary
      const questionsWithAudio = [];
      
      for (let i = 0; i < questions.length; i++) {
        setProgress(`Generating voice ${i + 1} of ${questions.length}...`);
        
        const question = questions[i];
        
        // Call API to generate speech and upload to Cloudinary
        const voiceResponse = await fetch("/api/questions/generateVoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: question.content }),
        });

        const voiceData = await voiceResponse.json();

        if (!voiceData.success) {
          throw new Error(`Failed to generate voice for question ${i + 1}: ${voiceData.error}`);
        }

        // Add the audio URL to the question
        questionsWithAudio.push({
          ...question,
          audioUrl: voiceData.audioUrl,
        });
      }

      setProgress("Inserting questions into database...");

      // Step 2: Insert questions with audio URLs
      const response = await fetch("/api/questions/insertBulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsWithAudio }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to insert questions");
      }

      alert(`Successfully inserted ${data.inserted} questions with audio`);
      setQuestions([]);
      setProgress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Bulk Question Generator</h1>

      {/* Generation Form */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Generate Questions</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Category ID"
            value={categoryID}
            onChange={(e) => setCategoryID(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Level (e.g., junior, mid, senior)"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Type (e.g., technical, behavioral)"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={handleGenerateQuestions}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate 10 Questions"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Progress Display */}
      {progress && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded">
          {progress}
        </div>
      )}

      {/* Questions Table */}
      {questions.length > 0 && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">
              Generated Questions ({questions.length})
            </h2>
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">#</th>
                  <th className="border p-2">Content</th>
                  <th className="border p-2">Level</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Follow Up</th>
                  <th className="border p-2">Audio URL</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question, index) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">
                      <textarea
                        value={question.content}
                        onChange={(e) =>
                          handleEditQuestion(index, "content", e.target.value)
                        }
                        className="w-full border p-1 rounded"
                        rows={3}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={question.level}
                        onChange={(e) =>
                          handleEditQuestion(index, "level", e.target.value)
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={question.type}
                        onChange={(e) =>
                          handleEditQuestion(index, "type", e.target.value)
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={question.followUp}
                        onChange={(e) =>
                          handleEditQuestion(index, "followUp", e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={question.audioUrl || ""}
                        onChange={(e) =>
                          handleEditQuestion(index, "audioUrl", e.target.value)
                        }
                        placeholder="Will be generated"
                        className="w-full border p-1 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleInsertQuestions}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Generate Audio & Insert Questions"}
          </button>
        </>
      )}

      {questions.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          No questions generated yet. Fill in the form above and click "Generate 10 Questions".
        </div>
      )}
    </div>
  );
}