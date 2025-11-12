import React, { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import axios from "axios";
import "./App.css";

/* ---------- Utility functions ---------- */

const getText = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
};

// Detect real syntax errors (not “no syntax errors found”)
function hasSyntaxError(review) {
  const s = (
    getText(review, ["syntax", "finalVerdict", "review"]) || ""
  ).toLowerCase();

  if (/no\s+syntax\s+errors?\s+found/.test(s)) return false;

  return /syntax\s*error|unexpected token|invalid syntax|missing\s*[;)]|unterminated|parse error|unbalanced/i.test(
    s
  );
}

// Detect actual logic/semantic problems
function hasLogicError(review) {
  const s = (
    getText(review, ["finalVerdict", "bestPractices", "efficiency", "readability"]) ||
    ""
  ).toLowerCase();

  const bad =
    /logic (bug|error|fault)|incorrect result|wrong output|fails? (test|case)|undefined variable|reference error|runtime error|crash|security (risk|vulnerability)/i.test(
      s
    );

  const good =
    /well[-\s]?written|works as intended|correct|valid|no significant (issues|improvements)|clean|good code|meets requirements/i.test(
      s
    );

  return bad && !good;
}

// Determine if the AI thinks code is “good”
function isGood(review) {
  const verdict = getText(review, ["finalVerdict", "review"]).toLowerCase();
  const positive =
    /well[-\s]?written|correct|valid|no significant (issues|improvements)|clean|works as intended|good code|meets requirements/i.test(
      verdict
    );
  if (positive) return true;
  return !hasSyntaxError(review) && !hasLogicError(review);
}

/* ---------- Component ---------- */

export default function App() {
  const [code, setCode] = useState(`function sum(a, b) {
  return a + b;
}`);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => Prism.highlightAll(), [code]);

  async function reviewCode() {
    setLoading(true);
    setReview(null);
    try {
      const { data } = await axios.post(`${API_BASE}/ai/get-review`, { code });
      const norm =
        typeof data === "object" && data !== null
          ? data
          : { review: String(data || ""), finalVerdict: String(data || "") };

      const shaped = {
        syntax: norm.syntax ?? "",
        bestPractices: norm.bestPractices ?? "",
        efficiency: norm.efficiency ?? "",
        readability: norm.readability ?? "",
        finalVerdict: norm.finalVerdict ?? norm.review ?? "",
        review: norm.review ?? "",
      };

      setReview({
        ...shaped,
        _isGood: isGood(shaped),
        _hasSyntaxError: hasSyntaxError(shaped),
        _hasLogicError: hasLogicError(shaped),
      });
    } catch (err) {
      console.error(err);
      setReview({
        error: "Unable to connect to AI service. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  const showBad =
    review &&
    !review.error &&
    (review._hasSyntaxError || review._hasLogicError) &&
    !review._isGood;

  // Header title logic
  const headerTitle = review
    ? showBad
      ? review._hasSyntaxError
        ? "❌ Bad Code Detected"
        : "⚠️ Wrong Code Detected"
      : "🟢 Review & Suggestions"
    : "";

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

      {/* RIGHT: Review Panel */}
      <div className="right">
        {!review && !loading && (
          <p className="placeholder">💡 Your AI review will appear here...</p>
        )}
        {loading && <p className="loading">Analyzing your code...</p>}

        {review && !review.error && (
          <div className="review-box fade-in">
            <h3>{headerTitle}</h3>
            <pre className="code-block">{code}</pre>

            {(review.bestPractices ||
              review.efficiency ||
              review.readability ||
              review.syntax) && (
              <>
                <h3>💡 Improvements:</h3>
                <ul>
                  {review.syntax && <li>❌ {review.syntax}</li>}
                  {review.bestPractices && <li>✨ {review.bestPractices}</li>}
                  {review.efficiency && <li>⚙️ {review.efficiency}</li>}
                  {review.readability && <li>🧠 {review.readability}</li>}
                </ul>
              </>
            )}

            {review.finalVerdict && (
              <>
                <h3>📋 Final Verdict:</h3>
                <p
                  className={`final ${
                    showBad ? "bad" : "good"
                  }`}
                >
                  {review.finalVerdict}
                </p>
              </>
            )}
          </div>
        )}

        {review?.error && <p className="error">{review.error}</p>}
      </div>
    </main>
  );
}