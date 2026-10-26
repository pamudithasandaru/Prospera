import { useEffect, useState } from 'react';
import Chat from './components/Chat.jsx';
import Admin from './components/Admin.jsx';
import { getHealth } from './api.js';

export default function App() {
  const [tab, setTab] = useState('chat');
  const [online, setOnline] = useState(null);

  useEffect(() => {
    getHealth()
      .then((h) => setOnline(h.qdrant && h.openai_key_set ? 'ok' : 'degraded'))
      .catch(() => setOnline('down'));
  }, [tab]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src="/haritha-bhoomi-logo.png" alt="හරිත භූමි — Haritha Bhoomi" />
        </div>
        <nav>
          <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}>Chat</button>
          <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>Documents</button>
        </nav>
        <span className={`status ${online || ''}`} title="Backend status">
          {online === 'ok' ? 'Online' : online === 'degraded' ? 'Setup needed' : online === 'down' ? 'Offline' : '…'}
        </span>
      </header>
      <main>{tab === 'chat' ? <Chat /> : <Admin />}</main>
    </div>
  );
}
