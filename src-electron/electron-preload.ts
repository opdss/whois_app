import { IpcEvents } from 'src/ipc-events';
import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { AppEvent, SettingKey} from 'src/interfaces';

const channelMapping: Record<AppEvent, IpcEvents> = {
  'whoisInfoDone': IpcEvents.whoisInfoDone,
} as const;

contextBridge.exposeInMainWorld('myApi', {
  addEventListener(
    type: AppEvent,
    listener: (...args: any[]) => void,
    options?: { signal: AbortSignal },
  ) {
    const channel = channelMapping[type];
    if (channel) {
      const ipcListener = (_event: IpcRendererEvent, ...args: any[]) => {
        listener(...args);
      };
      ipcRenderer.on(channel, ipcListener);
      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          ipcRenderer.off(channel, ipcListener);
        });
      }
    }
  },

  // addEventListener(type: 'whoisInfoDone',listener: (info:WhoisInfo)=>void) {
  //
  // },

  whoisLookup(domain:string) {
    return ipcRenderer.invoke(IpcEvents.whoisLookup, domain);
  },
  getWhoisInfo(domain:string) {
    return ipcRenderer.invoke(IpcEvents.getWhoisInfo, domain);
  },

  addWhoisTask(domains:string[]) {
    return ipcRenderer.invoke(IpcEvents.addWhoisTask, domains)
  },
  getWhoisTask(taskId:string) {
    return ipcRenderer.invoke(IpcEvents.getWhoisTask, taskId)
  },
  startWhoisTask(taskId:string) {
    return ipcRenderer.invoke(IpcEvents.startWhoisTask, taskId)
  },

  getSetting(key:SettingKey) {
    return ipcRenderer.invoke(IpcEvents.getSetting, key)
  }
})



