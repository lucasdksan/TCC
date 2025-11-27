import { useState } from "react";
import "./index.css";
import markdownToHtml from "./lib/markdownToHtml";

function App() {
  const [resultAnalytics, setResultAnalytics] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleStartAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5678/webhook-test/f0351812-d283-4cd0-b9fa-92a77434f557");
      const data = await response.text();
      setResultAnalytics(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error starting analytics:", error);
    }
  }

  return (
    <div className="app-container">
      <div className="card">
        <div className="header-row">
          <div>
            <h1 className="title">Vtex Order Analytics</h1>
            <p className="subtitle">Gere relatórios rápidos a partir do webhook de teste.</p>
          </div>
          <div>
            <button className="btn" onClick={handleStartAnalytics} disabled={loading} aria-label="Iniciar análise">
              {loading ? "Analisando..." : "Iniciar análise"}
            </button>
          </div>
        </div>

        <div className="result-area">
          { loading && <p className="loading-text">Carregando dados do webhook...</p> }
          {resultAnalytics ? (
            <div>
              <h2 className="result-title">Analytics Result:</h2>
              <pre className="result-pre" dangerouslySetInnerHTML={{ __html: markdownToHtml(resultAnalytics) }}></pre>
            </div>
          ) : (
            <p className="muted">Clique em "Iniciar análise" para carregar os dados do webhook.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;