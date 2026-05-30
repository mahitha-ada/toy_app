// ----------------------------------------------------------------------------
// lib/pca.js
//
// Embeddings live in hundreds of dimensions (all-MiniLM-L6-v2 uses 384). You
// cannot plot 384 dimensions. PCA (Principal Component Analysis) finds the few
// directions along which the data varies the most, and projects everything onto
// them — so we can squash 384-D down to 2-D or 3-D and actually SEE the clusters.
//
// Implemented from scratch with power iteration so you can read exactly how it
// works. Not the fastest method in the world, but perfectly fine for the handful
// of sentences in a tutorial, and it has zero dependencies.
// ----------------------------------------------------------------------------

/** Subtract the column-wise mean so the cloud of points is centered on origin. */
function meanCenter(rows) {
  const n = rows.length;
  const d = rows[0].length;
  const mean = new Array(d).fill(0);
  for (const r of rows) for (let j = 0; j < d; j++) mean[j] += r[j];
  for (let j = 0; j < d; j++) mean[j] /= n;
  const centered = rows.map((r) => r.map((v, j) => v - mean[j]));
  return { centered, mean };
}

/** Covariance matrix (d×d) of already-centered rows. Symmetric. */
function covariance(centered) {
  const n = centered.length;
  const d = centered[0].length;
  const cov = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const r of centered) {
    for (let i = 0; i < d; i++) {
      const ri = r[i];
      if (ri === 0) continue;
      for (let j = i; j < d; j++) {
        cov[i][j] += ri * r[j];
      }
    }
  }
  const denom = Math.max(1, n - 1);
  for (let i = 0; i < d; i++) {
    for (let j = i; j < d; j++) {
      cov[i][j] /= denom;
      cov[j][i] = cov[i][j];
    }
  }
  return cov;
}

function matVec(m, v) {
  const d = m.length;
  const out = new Array(d).fill(0);
  for (let i = 0; i < d; i++) {
    let s = 0;
    const row = m[i];
    for (let j = 0; j < d; j++) s += row[j] * v[j];
    out[i] = s;
  }
  return out;
}

function norm(v) {
  let s = 0;
  for (const x of v) s += x * x;
  return Math.sqrt(s);
}

/** Top eigenvector of a symmetric matrix via power iteration. */
function topEigenvector(m, iterations = 200) {
  const d = m.length;
  // Start from a deterministic-ish vector so results are reproducible.
  let v = new Array(d).fill(0).map((_, i) => Math.sin(i + 1));
  let nrm = norm(v) || 1;
  v = v.map((x) => x / nrm);
  for (let it = 0; it < iterations; it++) {
    const mv = matVec(m, v);
    nrm = norm(mv);
    if (nrm < 1e-12) break;
    v = mv.map((x) => x / nrm);
  }
  return { vector: v, eigenvalue: nrm };
}

/** Remove an already-found component from the matrix (deflation) so the next
 *  power iteration finds the *next* most important direction. */
function deflate(m, eigenvector, eigenvalue) {
  const d = m.length;
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      m[i][j] -= eigenvalue * eigenvector[i] * eigenvector[j];
    }
  }
}

/**
 * Project rows (n × d) down to `components` dimensions (2 or 3).
 *
 * @returns {
 *   points:        n × components array of coordinates to plot,
 *   explained:     fraction of total variance captured by each component,
 *   totalVariance: sum of all eigenvalues (for reference)
 * }
 */
export function pca(rows, components = 2) {
  if (!rows.length) return { points: [], explained: [], totalVariance: 0 };
  const { centered } = meanCenter(rows);
  const cov = covariance(centered);

  // Total variance = trace of covariance matrix (sum of the diagonal).
  let totalVariance = 0;
  for (let i = 0; i < cov.length; i++) totalVariance += cov[i][i];

  const axes = [];
  const explained = [];
  const work = cov.map((r) => r.slice()); // copy: deflation mutates it
  for (let c = 0; c < components; c++) {
    const { vector, eigenvalue } = topEigenvector(work);
    axes.push(vector);
    explained.push(totalVariance > 0 ? eigenvalue / totalVariance : 0);
    deflate(work, vector, eigenvalue);
  }

  // Project every centered row onto the chosen axes.
  const points = centered.map((r) => axes.map((axis) => dotRaw(r, axis)));
  return { points, explained, totalVariance };
}

function dotRaw(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
