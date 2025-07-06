export type AppEvent =
  | 'whoisInfoDone';

export type SettingKey = keyof Settings;

export interface Settings {
  backendQueryLimit:number //后台查询数量
  lastWhoisTaskId:string //最后一次whois查询任务
  whoisQueryTryNum:number //whois查询次数
}


export enum WhoisInfoStatus {
  registered = 1,
  unregistered = 0,
  reserve = 2, //保留域名
  queryError = -1,
}


export interface Setting {
  key:SettingKey,
  val: any
}

export interface WhoisInfo{
  domain: string, //域名
  status: WhoisInfoStatus, //注册查询状态
  statusText?: string, //状态
  createTime?: string, //注册信息
  expireTime?:string, //过期时间
  updateTime?:string, //更新时间
  registerName?:string, //注册商
  registerCountry?:string, //注册国家
  registerStateProvince?:string, //注册省市
  dnsServer?: string,// dnsServer
  concatPerson?:string, //联系人
  concatEmail?:string, //联系人游戏
  raw: string,// 原始信息
  tryNum: number; //重试次数
  lastQueryTime: number;//最后查询时间
  fromCache?: boolean;
}

export interface WhoisTask {
  taskId: string, //域名的hash值
  domains: string, //所有域名
  createTime: number;//开始时间
  completeTime: number; // 完成时间
}
