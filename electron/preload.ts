// Electron preload script
// Expose safe APIs to renderer process

import { app } from 'electron';

// Make app.getPath available to renderer
(window as any).electron = {
  getDocumentsPath: () => app.getPath('documents')
};
