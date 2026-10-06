import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CabinetShowcase } from './components/cabinet-showcase/CabinetShowcase';
import './shell.css';

document.documentElement.classList.add('cabinet-lab-page');

createRoot(document.getElementById('cabinet-lab-root')!).render(
  <StrictMode><div className="cabinet-lab"><CabinetShowcase /></div></StrictMode>,
);
