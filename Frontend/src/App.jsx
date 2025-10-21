import React, { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import axios from "axios";
import "./App.css";

export default function App() {
  const [code, setCode] = useState(`function sum(a, b) {
  return a + b;
}`);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  async function reviewCode() {
    setLoading(true);
    setReview(null);
    try {
      const response = await axios.post("http://localhost:3000/ai/get-review", {
        code,
      });

      setReview(response.data); // Store JSON response
    } catch (error) {
      console.error(error);
      setReview({
        error: "Unable to connect to AI service. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {/* LEFT: Code Editor */}
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code) =>
              Prism.highlight(code, Prism.languages.javascript, "javascript")
            }
            padding={12}
            className="code-editor"
            style={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 16,
              backgroundColor: "#1e1e1e",
              color: "#fff",
              borderRadius: "8px",
              height: "100%",
              width: "100%",
            }}
          />
        </div>

        <button className="review" onClick={reviewCode} disabled={loading}>
          {loading ? "Reviewing..." : "Review"}
        </button>
      </div>

      {/* RIGHT: AI Review */}
      <div className="right">
        {!review && !loading && (
          <p className="placeholder">💡 Your AI review will appear here...</p>
        )}

        {loading && <p className="loading">Analyzing your code...</p>}

        {review && !review.error && (
  <div className="review-box fade-in">
    {/* ✅ Dynamically check if code is good or weak */}
    {review.finalVerdict.toLowerCase().includes("well-written") ||
    review.finalVerdict.toLowerCase().includes("no significant improvements") ? (
      <>
        <h3>🟢 Good Code:</h3>
        <pre className="code-block">{code}</pre>

        <h3>💡 Suggestions:</h3>
        <ul>
          <li>✨ {review.bestPractices}</li>
          <li>⚙️ {review.efficiency}</li>
          <li>🧠 {review.readability}</li>
        </ul>

        <h3>📋 Final Verdict:</h3>
        <p className="final good">{review.finalVerdict}</p>
      </>
    ) : (
      <>
        <h3>❌ Bad Code:</h3>
        <pre className="code-block">{code}</pre>

        <h3>🔍 Issues:</h3>
        <ul>
          <li>❌ {review.syntax}</li>
          <li>❌ {review.bestPractices}</li>
        </ul>

        <h3>✅ Recommended Fix:</h3>
        <pre className="code-block">function sum(a, b) &#123; return a + b; &#125;</pre>

        <h3>💡 Improvements:</h3>
        <ul>
          <li>⚙️ {review.efficiency}</li>
          <li>🧠 {review.readability}</li>
        </ul>

        <h3>🧾 Final Verdict:</h3>
        <p className="final bad">{review.finalVerdict}</p>
      </>
    )}
  </div>
)}


        {review?.error && <p className="error">{review.error}</p>}
      </div>
    </main>
  );
}
