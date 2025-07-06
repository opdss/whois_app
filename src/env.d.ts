import type { AppEvent, WhoisInfo, SettingKey, WhoisTask } from './interfaces';

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}



declare global {
  interface Window {
    myApi: {
      addEventListener(
        type: AppEvent,
        listener: () => void,
        options?: { signal: AbortSignal },
      ): void;
      arch: string;

      addEventListener(type: 'whoisInfoDone',listener: (info:WhoisInfo)=>void, options?: { signal: AbortSignal });

      whoisLookup: (domain: string) => Promise<WhoisInfo>;
      getWhoisInfo: (domain: string) => Promise<WhoisInfo>;

      getWhoisTask: (taskId:string) => Promise<WhoisTask>;
      addWhoisTask: (domains:string[]) => Promise<WhoisTask>;

      getSetting: (key:SettingKey) => Promise<any>;

      startWhoisTask: (taskId:string) => Promise<boolean>;
    };
  }
}
