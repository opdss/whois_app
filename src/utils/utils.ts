export function fmtDate(timestamp:any, timeZone:number=0):string {
  timeZone = timeZone || 0;
  let date = timestamp && typeof timestamp != 'object' ? new Date(timestamp) : typeof timestamp == 'object' ? timestamp : new Date();
  if (date == 'Invalid Date') {
    return '获取失败';
  }
  //本地时间与GMT时间的时间偏移差
  const offset = date.getTimezoneOffset() * 60000;
  //得到现在的格林尼治时间
  date = new Date(date.getTime() + offset + 3600000 * timeZone);
  const s1 = '-';
  const s2 = ':';
  const pad = (num:number):string => {
    return num < 10 ? '0' + num.toString() : num+"";
  };
  return date.getFullYear()
    + s1 + pad(date.getMonth() + 1)
    + s1 + pad(date.getDate())
    + ' '
    + pad(date.getHours())
    + s2 + pad(date.getMinutes())
    + s2 + pad(date.getSeconds());
}


export function sleep(sec:number) {
  const exitTime = new Date().getTime() + (sec*1000);
  while (true) {
    if (new Date().getTime() > exitTime)
      return;
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) return;
    lastCall = now;
    return func(...args);
  };
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private readonly limit: number,  // 允许的最大请求数
    private readonly windowMs: number  // 时间窗口(毫秒)
  ) {}

  check(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // 移除时间窗口外的记录
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);

    if (validTimestamps.length >= this.limit) {
      return false; // 超过限制
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true; // 允许请求
  }
}
