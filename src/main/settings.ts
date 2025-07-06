import { ipcMainManager } from 'src/main/ipc';
import { IpcEvents } from 'src/ipc-events';
import type { IpcMainInvokeEvent } from 'electron';
import type {SettingKey} from 'src/interfaces'
import db from 'src/main/db/db';

export function setupSettings() {
  ipcMainManager.handle(IpcEvents.getSetting, (_: IpcMainInvokeEvent, key: SettingKey) => db.settings().getSetting(key));
}
