// ============================================================================
// app.js — front-end logic. Calls the JSON API and draws everything with Plotly.
// ============================================================================

const DARK = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#cdd9e5", family: "ui-sans-serif, system-ui" },
  margin: { l: 40, r: 16, t: 10, b: 40 },
};

async function api(path, body) {
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function setStatus(id, msg, isError = false) {
  const el = document.getElementById(id);
  el.textContent = msg || "";
  el.classList.toggle("error", isError);
}

// Wrap a button click: disables button, shows "thinking…", surfaces errors.
function busy(btnId, statusId, fn) {
  return async () => {
    const btn = document.getElementById(btnId);
    btn.disabled = true;
    setStatus(statusId, "Running the model… (first call downloads it, ~25 MB)");
    try {
      await fn();
      setStatus(statusId, "");
    } catch (err) {
      setStatus(statusId, err.message, true);
    } finally {
      btn.disabled = false;
    }
  };
}

// ---- Tabs -----------------------------------------------------------------
document.getElementById("tabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  tab.classList.add("active");
  const panel = document.getElementById(tab.dataset.tab);
  panel.classList.add("active");
  // Plotly needs a resize nudge when a hidden div becomes visible.
  panel.querySelectorAll(".js-plotly-plot").forEach((p) => Plotly.Plots.resize(p));
});

// ---- Model badge ----------------------------------------------------------
api("/api/info")
  .then((info) => {
    document.getElementById("modelBadge").textContent = `${info.model} · ${info.dim}-D`;
  })
  .catch(() => (document.getElementById("modelBadge").textContent = "model info unavailable"));

// ===========================================================================
// ① OVERVIEW
// ===========================================================================
document.getElementById("overviewLoad").addEventListener(
  "click",
  busy("overviewLoad", "overviewStatus", async () => {
    const data = await api("/api/overview");
    const { corpus, points, explained, matrix, topicColors } = data;

    // 3-D scatter coloured by topic.
    const byTopic = {};
    corpus.forEach((c, i) => {
      (byTopic[c.topic] ||= { x: [], y: [], z: [], text: [] });
      byTopic[c.topic].x.push(points[i][0]);
      byTopic[c.topic].y.push(points[i][1]);
      byTopic[c.topic].z.push(points[i][2]);
      byTopic[c.topic].text.push(c.text);
    });
    const traces = Object.entries(byTopic).map(([topic, g]) => ({
      type: "scatter3d", mode: "markers", name: topic,
      x: g.x, y: g.y, z: g.z, text: g.text, hoverinfo: "text+name",
      marker: { size: 6, color: topicColors[topic], opacity: 0.9 },
    }));
    Plotly.newPlot("overviewScatter", traces, {
      ...DARK, legend: { orientation: "h" },
      scene: { xaxis: { title: "PC1" }, yaxis: { title: "PC2" }, zaxis: { title: "PC3" } },
    }, { responsive: true, displayModeBar: false });
    document.getElementById("overviewVar").textContent =
      `PC1+PC2+PC3 capture ${(explained.reduce((a, b) => a + b, 0) * 100).toFixed(1)}% of the variance.`;

    // Heatmap.
    const labels = corpus.map((c, i) => `${i}: ${c.text.slice(0, 24)}…`);
    Plotly.newPlot("overviewHeat", [{
      type: "heatmap", z: matrix, x: labels, y: labels,
      colorscale: "Viridis", zmin: -0.2, zmax: 1, hoverongaps: false,
      colorbar: { title: "cos", thickness: 12 },
    }], {
      ...DARK, margin: { l: 10, r: 10, t: 10, b: 10 },
      xaxis: { showticklabels: false }, yaxis: { showticklabels: false },
    }, { responsive: true, displayModeBar: false });
  })
);

// ===========================================================================
// ② TOKENIZE
// ===========================================================================
document.getElementById("tokenBtn").addEventListener(
  "click",
  busy("tokenBtn", "tokenStatus", async () => {
    const text = document.getElementById("tokenInput").value;
    const { tokens, ids } = await api("/api/tokenize", { text });
    const box = document.getElementById("tokenChips");
    box.innerHTML = "";
    // ids include [CLS] ... [SEP]; render those as special chips too.
    const special = new Set(["[CLS]", "[SEP]", "[PAD]", "[UNK]"]);
    // Build a token list aligned to ids: [CLS] + tokens + [SEP]
    const aligned = ["[CLS]", ...tokens, "[SEP]"];
    aligned.forEach((tok, i) => {
      const chip = document.createElement("div");
      const cont = tok.startsWith("##");
      chip.className = "chip" + (cont ? " cont" : "") + (special.has(tok) ? " special" : "");
      chip.innerHTML = `<span class="tok">${escapeHtml(tok)}</span><span class="id">${ids[i] ?? ""}</span>`;
      box.appendChild(chip);
    });
    setStatus("tokenStatus", `${tokens.length} sub-word tokens · ${ids.length} ids (with special tokens). Yellow = "##" continuation.`);
  })
);

// ===========================================================================
// ③ EMBEDDING
// ===========================================================================
document.getElementById("embedBtn").addEventListener(
  "click",
  busy("embedBtn", "embedStatus", async () => {
    const text = document.getElementById("embedInput").value;
    const { vectors, dim } = await api("/api/embed", { text });
    const v = vectors[0];

    Plotly.newPlot("embedBars", [{
      type: "bar", y: v, marker: { color: v, colorscale: "RdBu", cmid: 0 },
    }], {
      ...DARK, xaxis: { title: `${dim} dimensions` }, yaxis: { title: "value" },
    }, { responsive: true, displayModeBar: false });

    Plotly.newPlot("embedStrip", [{
      type: "heatmap", z: [v], colorscale: "RdBu", zmid: 0, showscale: false,
    }], {
      ...DARK, margin: { l: 10, r: 10, t: 6, b: 6 },
      xaxis: { showticklabels: false }, yaxis: { showticklabels: false },
    }, { responsive: true, displayModeBar: false });

    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    document.getElementById("embedMeta").textContent =
      `Vector length (L2 norm) = ${norm.toFixed(4)} (≈1, normalized). This ${dim}-number "fingerprint" represents the whole sentence.`;
  })
);

// ===========================================================================
// ④ SIMILARITY
// ===========================================================================
document.getElementById("simPairBtn").addEventListener(
  "click",
  busy("simPairBtn", "simStatus", async () => {
    const a = document.getElementById("simA").value;
    const b = document.getElementById("simB").value;
    const { matrix } = await api("/api/similarity", { texts: [a, b] });
    const score = matrix[0][1];
    const color = score >= 0.6 ? "#31c48d" : score >= 0.3 ? "#f0b429" : "#ff7b72";
    Plotly.newPlot("simGauge", [{
      type: "indicator", mode: "gauge+number", value: score,
      number: { valueformat: ".3f" },
      gauge: {
        axis: { range: [-1, 1] },
        bar: { color },
        steps: [
          { range: [-1, 0], color: "#3a2330" },
          { range: [0, 0.3], color: "#2a2f3a" },
          { range: [0.3, 0.6], color: "#3a3520" },
          { range: [0.6, 1], color: "#1f3a2e" },
        ],
      },
    }], { ...DARK, margin: { t: 20, b: 10, l: 30, r: 30 } }, { responsive: true, displayModeBar: false });
    setStatus("simStatus", `cosine similarity = ${score.toFixed(4)}`);
  })
);

document.getElementById("simMatrixBtn").addEventListener(
  "click",
  busy("simMatrixBtn", "simStatus", async () => {
    const texts = document.getElementById("simList").value.split("\n").map((s) => s.trim()).filter(Boolean);
    const { matrix, labels } = await api("/api/similarity", { texts });
    const short = labels.map((s, i) => `${i}: ${s.slice(0, 18)}…`);
    Plotly.newPlot("simMatrix", [{
      type: "heatmap", z: matrix, x: short, y: short,
      colorscale: "Viridis", zmin: -0.2, zmax: 1,
      text: matrix.map((row) => row.map((v) => v.toFixed(2))),
      texttemplate: "%{text}", textfont: { size: 10 },
      colorbar: { title: "cos", thickness: 12 },
    }], {
      ...DARK, margin: { l: 90, r: 10, t: 10, b: 90 },
      xaxis: { tickangle: -30 },
    }, { responsive: true, displayModeBar: false });
    setStatus("simStatus", `${labels.length}×${labels.length} matrix computed.`);
  })
);

// ===========================================================================
// ⑤ SEARCH
// ===========================================================================
document.getElementById("searchBtn").addEventListener(
  "click",
  busy("searchBtn", "searchStatus", async () => {
    const query = document.getElementById("searchInput").value;
    const { results } = await api("/api/search", { query });
    const box = document.getElementById("searchResults");
    box.innerHTML = "";
    results.slice(0, 8).forEach((r) => {
      const pct = Math.max(0, Math.min(1, r.score)) * 100;
      const div = document.createElement("div");
      div.className = "result";
      div.innerHTML = `
        <div class="score">${r.score.toFixed(3)}</div>
        <div class="body">
          <div class="text">${escapeHtml(r.text)}</div>
          <div class="meterwrap"><div class="meter" style="width:${pct}%"></div></div>
          <div class="topic">topic: ${escapeHtml(r.topic)}</div>
        </div>`;
      box.appendChild(div);
    });
    setStatus("searchStatus", `Ranked ${results.length} documents by meaning.`);
  })
);

// ===========================================================================
// ⑥ MAP (PROJECTION)
// ===========================================================================
document.getElementById("projBtn").addEventListener(
  "click",
  busy("projBtn", "projStatus", async () => {
    const raw = document.getElementById("projList").value.split("\n").map((s) => s.trim()).filter(Boolean);
    const components = Number(document.querySelector('input[name="dims"]:checked').value);
    const body = { components };
    if (raw.length >= 2) body.texts = raw; // else server uses built-in corpus
    const { points, explained, labels, topics, topicColors } = await api("/api/project", body);

    const byTopic = {};
    labels.forEach((label, i) => {
      const t = topics[i];
      (byTopic[t] ||= { x: [], y: [], z: [], text: [] });
      byTopic[t].x.push(points[i][0]);
      byTopic[t].y.push(points[i][1]);
      byTopic[t].z.push(components === 3 ? points[i][2] : 0);
      byTopic[t].text.push(label);
    });

    const traces = Object.entries(byTopic).map(([topic, g]) => ({
      type: components === 3 ? "scatter3d" : "scatter",
      mode: "markers", name: topic,
      x: g.x, y: g.y, ...(components === 3 ? { z: g.z } : {}),
      text: g.text, hoverinfo: "text+name",
      marker: { size: components === 3 ? 6 : 12, color: (topicColors && topicColors[topic]) || "#4ea1ff", opacity: 0.9 },
    }));

    const layout = components === 3
      ? { ...DARK, legend: { orientation: "h" }, scene: { xaxis: { title: "PC1" }, yaxis: { title: "PC2" }, zaxis: { title: "PC3" } } }
      : { ...DARK, legend: { orientation: "h" }, xaxis: { title: "PC1" }, yaxis: { title: "PC2" } };

    Plotly.newPlot("projScatter", traces, layout, { responsive: true, displayModeBar: false });
    document.getElementById("projVar").textContent =
      `Showing ${labels.length} sentences. Components capture ${(explained.reduce((a, b) => a + b, 0) * 100).toFixed(1)}% of variance.`;
  })
);

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
