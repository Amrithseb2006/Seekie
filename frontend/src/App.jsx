import { useState, useRef, useCallback } from "react";

const API = "https://medicalrag-53ry.onrender.com";

const ICONS = {
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  file: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  spinner: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  ),
  cross: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  doc: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
};

function ScoreBar({ score }) {
  const pct = Math.round(score * 100);
  const color = pct > 70 ? "#4ade80" : pct > 45 ? "#facc15" : "#f87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: "#1e2a1e", borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 11, color, fontFamily: "monospace", minWidth: 36 }}>{pct}%</span>
    </div>
  );
}

function ChunkCard({ chunk, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      border: "1px solid #1e2a1e", borderRadius: 8, overflow: "hidden",
      background: "#0b130b", marginBottom: 8, transition: "border-color 0.2s"
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#2a4a2a"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a1e"}
    >
      <div
        style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
        onClick={() => setExpanded(v => !v)}
      >
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#4a6a4a", minWidth: 20 }}>
          [{String(index).padStart(2, "0")}]
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#6aaa6a", fontFamily: "monospace" }}>
              {chunk.source}
            </span>
            <span style={{ fontSize: 10, color: "#3a5a3a", fontFamily: "monospace" }}>
              p.{chunk.page}
            </span>
            {chunk.section && chunk.section !== "Unknown" && (
              <span style={{ fontSize: 10, color: "#3a5a3a", fontFamily: "monospace",
                maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                § {chunk.section}
              </span>
            )}
          </div>
          <ScoreBar score={chunk.score} />
        </div>
        <span style={{ color: "#3a5a3a", fontSize: 12, marginLeft: 8 }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid #1e2a1e" }}>
          <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.7, color: "#8aaa8a", fontFamily: "monospace" }}>
            {chunk.text}
          </p>
        </div>
      )}
    </div>
  );
}

function AnswerPanel({ answer, chunks }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        background: "#0b130b", border: "1px solid #1e3a1e",
        borderRadius: 10, padding: "18px 20px", marginBottom: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#4a8a4a",
            background: "#0f200f", padding: "2px 8px", borderRadius: 4, border: "1px solid #2a4a2a"
          }}>RESPONSE</span>
        </div>
        <p style={{ margin: 0, lineHeight: 1.8, color: "#c8dcc8", fontSize: 14 }}>{answer}</p>
      </div>

      {chunks.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#4a6a4a" }}>
              SOURCE CHUNKS ({chunks.length})
            </span>
            <div style={{ flex: 1, height: 1, background: "#1e2a1e" }} />
          </div>
          {chunks.map((c, i) => <ChunkCard key={i} chunk={c} index={i + 1} />)}
        </>
      )}
    </div>
  );
}

function IngestPanel({ onDone }) {
  const [file, setFile] = useState(null);
  const [useImages, setUseImages] = useState(false);
  const [status, setStatus] = useState(null); // null | "uploading" | "polling" | "done" | "error"
  const [job, setJob] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef();
  const pollRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".pdf")) setFile(f);
  }, []);

  const pollStatus = useCallback(async (jobId) => {
    try {
      const res = await fetch(`${API}/ingest/status/${jobId}`);
      const data = await res.json();
      setJob(data);
      if (data.status === "done") {
        setStatus("done");
        clearInterval(pollRef.current);
        if (onDone) onDone();
      } else if (data.status === "failed") {
        setStatus("error");
        setErrorMsg(data.error || "Ingestion failed.");
        clearInterval(pollRef.current);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Lost connection to server.");
      clearInterval(pollRef.current);
    }
  }, [onDone]);

  const handleIngest = async () => {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API}/ingest?use_image_captions=${useImages}`, {
        method: "POST", body: form,
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      const { job_id } = await res.json();
      setStatus("polling");
      pollRef.current = setInterval(() => pollStatus(job_id), 2000);
      pollStatus(job_id);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e.message);
    }
  };

  const reset = () => {
    clearInterval(pollRef.current);
    setFile(null); setStatus(null); setJob(null); setErrorMsg("");
  };

  const pct = job?.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;

  return (
    <div>
      {!status && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${file ? "#2a5a2a" : "#1e2a1e"}`,
              borderRadius: 10, padding: "36px 20px", textAlign: "center",
              cursor: "pointer", transition: "all 0.2s",
              background: file ? "#0b1a0b" : "transparent",
            }}
            onMouseEnter={e => !file && (e.currentTarget.style.borderColor = "#2a3a2a")}
            onMouseLeave={e => !file && (e.currentTarget.style.borderColor = "#1e2a1e")}
          >
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
              onChange={e => setFile(e.target.files[0])} />
            <div style={{ color: file ? "#4a8a4a" : "#3a5a3a", marginBottom: 10 }}>
              {ICONS.upload}
            </div>
            {file ? (
              <div>
                <div style={{ color: "#8aaa8a", fontSize: 13, fontFamily: "monospace" }}>
                  {ICONS.file} &nbsp;{file.name}
                </div>
                <div style={{ color: "#4a6a4a", fontSize: 11, marginTop: 4 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, color: "#4a6a4a", fontSize: 13 }}>
                Drop a PDF here or click to browse
              </p>
            )}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0", cursor: "pointer" }}>
            <div
              onClick={() => setUseImages(v => !v)}
              style={{
                width: 36, height: 20, borderRadius: 10, background: useImages ? "#2a5a2a" : "#1e2a1e",
                position: "relative", transition: "background 0.2s", cursor: "pointer",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: useImages ? 18 : 3, width: 14, height: 14,
                borderRadius: "50%", background: useImages ? "#4aaa4a" : "#3a5a3a",
                transition: "left 0.2s",
              }} />
            </div>
            <span style={{ fontSize: 13, color: "#6a8a6a" }}>Enable image captioning via Gemini</span>
          </label>

          <button
            onClick={handleIngest}
            disabled={!file}
            style={{
              width: "100%", padding: "12px", borderRadius: 8,
              background: file ? "#0f300f" : "#0b150b",
              border: `1px solid ${file ? "#2a5a2a" : "#1e2a1e"}`,
              color: file ? "#8adc8a" : "#3a5a3a",
              fontSize: 13, fontFamily: "monospace", cursor: file ? "pointer" : "not-allowed",
              transition: "all 0.2s", letterSpacing: "0.05em",
            }}
            onMouseEnter={e => file && (e.currentTarget.style.background = "#143014")}
            onMouseLeave={e => file && (e.currentTarget.style.background = "#0f300f")}
          >
            INGEST DOCUMENT
          </button>
        </>
      )}

      {(status === "uploading" || status === "polling") && (
        <div style={{ padding: "20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ color: "#4aaa4a" }}>{ICONS.spinner}</span>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6aaa6a" }}>
              {status === "uploading" ? "UPLOADING..." : job?.message || "PROCESSING..."}
            </span>
          </div>
          {job?.total > 0 && (
            <>
              <div style={{ height: 4, background: "#1e2a1e", borderRadius: 2, marginBottom: 8 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#4aaa4a", borderRadius: 2, transition: "width 0.4s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#4a6a4a" }}>
                  {job.processed} / {job.total} chunks
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#4a8a4a" }}>{pct}%</span>
              </div>
            </>
          )}
        </div>
      )}

      {status === "done" && (
        <div style={{ padding: "16px", background: "#0b1a0b", borderRadius: 8, border: "1px solid #2a5a2a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "#4aaa4a" }}>{ICONS.check}</span>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#4aaa4a" }}>INGESTION COMPLETE</span>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6a8a6a" }}>{job?.message}</p>
          <button onClick={reset} style={{
            fontSize: 11, fontFamily: "monospace", background: "none", border: "1px solid #2a4a2a",
            borderRadius: 6, color: "#4a6a4a", padding: "6px 14px", cursor: "pointer"
          }}>
            INGEST ANOTHER
          </button>
        </div>
      )}

      {status === "error" && (
        <div style={{ padding: "16px", background: "#1a0b0b", borderRadius: 8, border: "1px solid #5a2a2a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "#aa4a4a" }}>{ICONS.cross}</span>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#aa4a4a" }}>INGESTION FAILED</span>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#8a6a6a" }}>{errorMsg}</p>
          <button onClick={reset} style={{
            fontSize: 11, fontFamily: "monospace", background: "none", border: "1px solid #4a2a2a",
            borderRadius: 6, color: "#6a4a4a", padding: "6px 14px", cursor: "pointer"
          }}>
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}

function QueryPanel() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const history = useRef([]);

  const handleQuery = async () => {
    if (!query.trim() || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), top_k: topK }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      const data = await res.json();
      history.current.unshift({ q: query.trim(), a: data });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4a6a4a" }}>
            {ICONS.search}
          </div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleQuery()}
            placeholder="Ask a clinical question..."
            style={{
              width: "100%", padding: "11px 14px 11px 38px",
              background: "#0b130b", border: "1px solid #1e2a1e",
              borderRadius: 8, color: "#c8dcc8", fontSize: 13,
              fontFamily: "monospace", outline: "none", boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#2a5a2a"}
            onBlur={e => e.target.style.borderColor = "#1e2a1e"}
          />
        </div>
        <select
          value={topK}
          onChange={e => setTopK(Number(e.target.value))}
          style={{
            padding: "0 12px", background: "#0b130b", border: "1px solid #1e2a1e",
            borderRadius: 8, color: "#6a8a6a", fontSize: 12, fontFamily: "monospace",
            cursor: "pointer", outline: "none",
          }}
        >
          {[3, 5, 8, 10].map(k => <option key={k} value={k}>top {k}</option>)}
        </select>
        <button
          onClick={handleQuery}
          disabled={!query.trim() || loading}
          style={{
            padding: "0 18px", background: loading ? "#0b1a0b" : "#0f300f",
            border: "1px solid #2a5a2a", borderRadius: 8,
            color: loading ? "#4a6a4a" : "#8adc8a",
            fontFamily: "monospace", fontSize: 12, cursor: "pointer",
            letterSpacing: "0.05em", transition: "all 0.2s",
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = "#143014")}
          onMouseLeave={e => !loading && (e.currentTarget.style.background = "#0f300f")}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {ICONS.spinner} QUERYING
            </span>
          ) : "SEARCH"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "#1a0b0b", borderRadius: 8,
          border: "1px solid #5a2a2a", color: "#aa6a6a", fontSize: 13, marginTop: 8 }}>
          {error}
        </div>
      )}

      {result && <AnswerPanel answer={result.answer} chunks={result.chunks} />}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("query");

  return (
    <div style={{
      minHeight: "100vh", background: "#060d06", color: "#c8dcc8",
      fontFamily: "'DM Mono', 'Courier New', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #1e4a1e; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0b130b; }
        ::-webkit-scrollbar-thumb { background: #2a4a2a; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; transform-origin: center; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        input::placeholder { color: #3a5a3a; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e2a1e", padding: "0 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4aaa4a",
              boxShadow: "0 0 6px #4aaa4a" }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600,
              color: "#c8dcc8", letterSpacing: "0.08em" }}>
              MEDI<span style={{ color: "#4aaa4a" }}>RAG</span>
            </span>
            <span style={{ fontSize: 10, color: "#3a5a3a", fontFamily: "monospace",
              borderLeft: "1px solid #1e2a1e", paddingLeft: 10 }}>
              WHO Clinical Guidelines
            </span>
          </div>

          <div style={{ display: "flex", gap: 2 }}>
            {["query", "ingest"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "6px 16px", background: "none",
                  border: tab === t ? "1px solid #2a5a2a" : "1px solid transparent",
                  borderRadius: 6, color: tab === t ? "#8adc8a" : "#4a6a4a",
                  fontFamily: "monospace", fontSize: 11, cursor: "pointer",
                  letterSpacing: "0.06em", transition: "all 0.15s",
                  background: tab === t ? "#0b1a0b" : "none",
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px" }}>
        {tab === "query" ? (
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 500,
                color: "#e8f8e8", marginBottom: 6 }}>
                Clinical Query Interface
              </h1>
              <p style={{ fontSize: 13, color: "#4a6a4a" }}>
                Retrieve context-grounded answers from indexed WHO guidelines. Powered by Pinecone + Groq.
              </p>
            </div>
            <QueryPanel />
          </div>
        ) : (
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 500,
                color: "#e8f8e8", marginBottom: 6 }}>
                Document Ingestion
              </h1>
              <p style={{ fontSize: 13, color: "#4a6a4a" }}>
                Upload a PDF to extract, chunk, embed, and index into the knowledge base.
              </p>
            </div>
            <IngestPanel onDone={() => {}} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e2a1e", padding: "14px 32px", marginTop: 48 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#2a4a2a", fontFamily: "monospace" }}>
            medirag v1.0 · llama-text-embed-v2 · llama-3.3-70b
          </span>
          <span style={{ fontSize: 10, color: "#2a4a2a", fontFamily: "monospace" }}>
            {API}
          </span>
        </div>
      </div>
    </div>
  );
}
