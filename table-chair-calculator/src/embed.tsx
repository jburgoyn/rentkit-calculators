import { createRoot } from 'react-dom/client';
import App from './App';
import { getEmbedConfig } from './embed-config';

const CONTAINER_ID = 'rentkit-table-calculator';

function mount() {
  const el = document.getElementById(CONTAINER_ID) ?? document.getElementById('root');
  if (!el) return;
  const config = getEmbedConfig(el);
  const root = createRoot(el);
  root.render(<App config={config} />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
