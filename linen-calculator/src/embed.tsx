import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const CONTAINER_ID = 'rentkit-linen-calculator';

function getMountElement(): HTMLElement {
  const el = document.getElementById(CONTAINER_ID);
  if (!el) {
    const div = document.createElement('div');
    div.id = CONTAINER_ID;
    document.body.appendChild(div);
    return div;
  }
  return el;
}

const root = ReactDOM.createRoot(getMountElement());
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
