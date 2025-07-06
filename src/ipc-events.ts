export enum IpcEvents {
  reloadWindow = 'reloadWindow',
  whoisInfoQuery= "whoisInfoQuery",
  whoisLookup= 'whoisLookup',
  addWhoisInfo= 'addWhoisInfo',
  getWhoisInfo= 'getWhoisInfo',

  addWhoisTask= 'addWhoisTask',
  getWhoisTask= 'getWhoisTask',
  startWhoisTask= 'startWhoisTask',

  whoisInfoDone = 'whoisInfoDone', //查询完成


  getSetting= 'getSetting',
}

export const ipcMainEvents = [
  IpcEvents.reloadWindow,
  IpcEvents.whoisInfoQuery,
  IpcEvents.whoisLookup,
  IpcEvents.addWhoisInfo,
  IpcEvents.getWhoisInfo,

  IpcEvents.addWhoisTask,
  IpcEvents.getWhoisTask,
  IpcEvents.startWhoisTask,

  IpcEvents.whoisInfoDone,
  IpcEvents.getSetting,


];

export const WebContentsReadyForIpcSignal =  "WebContentsReadyForIpcSignal"

