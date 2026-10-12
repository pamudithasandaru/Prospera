import { useCallback, useEffect, useState } from 'react';
import { deleteDocument, listDocuments, uploadDocument } from '../api.js';

const CATEGORIES = ['general', 'courses', 'products', 'schemes', 'facilities', 'farming'];

export default function Admin() {
  const [key, setKey] = useState(() => {
    try {
      return sessionStorage.getItem('sprout_admin_key') || '';
    } catch {
      return '';
    }
  });
  const [docs, setDocs] = useState(null);
  const [category, setCategory] = useState('general');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!key) return;
    try {
      setDocs(await listDocuments(key));
      setMsg(null);
    } catch (e) {
      setDocs(null);
      setMsg({ error: true, text: e.message });
    }
  }, [key]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function saveKey(e) {
    e.preventDefault();
    const k = new FormData(e.target).get('key').trim();
    try {
      sessionStorage.setItem('sprout_admin_key', k);
    } catch {
      /* storage unavailable: key lives in memory only */
    }
    setKey(k);
  }

  async function onUpload(e) {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return;
    setBusy(true);
    setMsg({ text: `Uploading ${file.name}… this can take a moment.` });
    try {
      const r = await uploadDocument(key, file, category);
      setMsg({ text: `Added ${r.source} (${r.chunks} chunks).` });
      e.target.reset();
      await listDocuments(key).then(setDocs);
    } catch (err) {
      setMsg({ error: true, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(d) {
    if (!window.confirm(`Delete "${d.source}" and all its chunks?`)) return;
    try {
      await deleteDocument(key, d.doc_id);
      setMsg({ text: `Deleted ${d.source}.` });
      await refresh();
    } catch (err) {
      setMsg({ error: true, text: err.message });
    }
  }

  if (!key || (msg?.error && !docs)) {
    return (
      <section className="admin card">
        <h2>Admin access</h2>
        <form onSubmit={saveKey} className="row">
          <input name="key" type="password" placeholder="Admin key" defaultValue={key} autoComplete="off" required />
          <button type="submit">Unlock</button>
        </form>
        {msg && <p className="notice error">{msg.text}</p>}
      </section>
    );
  }

  return (
    <section className="admin">
      <form className="card row" onSubmit={onUpload}>
        <input type="file" name="file" accept=".pdf,.docx,.txt,.md" required />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button type="submit" disabled={busy}>Upload</button>
      </form>
      {msg && <p className={`notice ${msg.error ? 'error' : ''}`}>{msg.text}</p>}
      <div className="card">
        <h2>Knowledge base {docs && <small>({docs.length} documents)</small>}</h2>
        {docs?.length === 0 && <p>No documents yet. Upload a PDF, DOCX, TXT or MD file.</p>}
        {docs?.length > 0 && (
          <table>
            <thead>
              <tr><th>Document</th><th>Category</th><th>Chunks</th><th /></tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.doc_id}>
                  <td>{d.source}</td>
                  <td><span className="tag cat">{d.category}</span></td>
                  <td>{d.chunks}</td>
                  <td><button className="ghost danger" onClick={() => onDelete(d)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
