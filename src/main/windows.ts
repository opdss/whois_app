// import * as path from 'node:path';

import {  BrowserWindow, shell } from 'electron';

// import { createContextMenu } from './context-menu';
import { ipcMainManager } from './ipc';
import { IpcEvents } from '../ipc-events';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = fileURLToPath(new URL('.', import.meta.url));

// Keep a global reference of the window objects, if we don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
export let browserWindows: Array<BrowserWindow | null> = [];

let mainIsReadyResolver: () => void;
const mainIsReadyPromise = new Promise<void>(
  (resolve) => (mainIsReadyResolver = resolve),
);

export function mainIsReady() {
  mainIsReadyResolver();
}

export function safelyOpenWebURL(url: string) {
    const { protocol } = new URL(url);
    if (['http:', 'https:'].includes(protocol)) {
      shell.openExternal(url).catch(err => console.error(err))
    }
}

/**
 * Gets default options for the main window
 */
export function getMainWindowOptions(): Electron.BrowserWindowConstructorOptions {
  // const HEADER_COMMANDS_HEIGHT = 50;
  // const MACOS_TRAFFIC_LIGHTS_HEIGHT = 16;

  return {
    width: 1400,
    height: 900,
    minHeight: 600,
    minWidth: 600,
    // titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    // titleBarOverlay: process.platform === 'darwin',
    // trafficLightPosition: {
    //   x: 20,
    //   y: HEADER_COMMANDS_HEIGHT / 2 - MACOS_TRAFFIC_LIGHTS_HEIGHT / 2,
    // },
    acceptFirstMouse: true,
    // backgroundColor: '#1d2427',
    show: false,
    webPreferences: {
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      ),
    },
  };
}

/**
 * Creates a new main window.
 */
export function createMainWindow(): Electron.BrowserWindow {
  console.log(`Creating main window`);
  let browserWindow: BrowserWindow | null;
  browserWindow = new BrowserWindow(getMainWindowOptions());
  if (process.env.DEV) {
     browserWindow.loadURL(process.env.APP_URL).catch(err => console.error(err))
  } else {
     browserWindow.loadFile('index.html').catch(err => console.error(err))
  }
  browserWindow.webContents.once('dom-ready', () => {
    if (browserWindow) {
      browserWindow.show();
      // createContextMenu(browserWindow);
    }
  });

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    browserWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    browserWindow.webContents.on('devtools-opened', () => {
      browserWindow?.webContents.closeDevTools();
    });
  }

  // browserWindow.on('focus', () => {
  //   if (browserWindow) {
  //     ipcMainManager.send(IpcEvents.SET_SHOW_ME_TEMPLATE);
  //   }
  // });

  browserWindow.on('closed', () => {
    browserWindows = browserWindows.filter((bw) => browserWindow !== bw);

    browserWindow = null;
  });

  browserWindow.webContents.setWindowOpenHandler((details) => {
    safelyOpenWebURL(details.url);
    return { action: 'deny' };
  });

  browserWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    safelyOpenWebURL(url);
  });

  ipcMainManager.on(IpcEvents.reloadWindow, () => {
    browserWindow?.reload();
  });

  browserWindows.push(browserWindow);

  return browserWindow;
}

/**
 * Gets or creates the main window, returning it in both cases.
 */
export async function getOrCreateMainWindow(): Promise<Electron.BrowserWindow> {
  await mainIsReadyPromise;
  return (
    BrowserWindow.getFocusedWindow() || browserWindows[0] || createMainWindow()
  );
}
