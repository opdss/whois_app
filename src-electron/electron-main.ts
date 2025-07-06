import { app } from 'electron';
import os from 'os';
import { getOrCreateMainWindow, mainIsReady } from 'src/main/windows';
import {setupWhois} from 'src/main/whoisInfo'
import { setupDB } from 'src/main/db';
import { setupSettings } from 'src/main/settings';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

/**
 * Handle the app's "ready" event. This is essentially
 * the method that takes care of booting the application.
 */
export async function onReady() {
  // Do this after setting everything up to ensure that
  // any IPC listeners are set up before they're used
  setupDB()
  setupWhois()
  setupSettings()
  mainIsReady();
  await getOrCreateMainWindow();
}

app.whenReady().then(onReady).catch(err=>console.error(err))

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  app.whenReady().then(getOrCreateMainWindow).catch(err=>console.error(err))
});
