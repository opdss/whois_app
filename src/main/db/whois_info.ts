import type { WhoisInfo, WhoisTask } from 'src/interfaces';
import type Database from 'better-sqlite3';

export class WhoisInfoDB {
  private db:  Database.Database|null = null;
  constructor(db:  Database.Database|null) {
    this.db = db;
  }

  // 用户操作
  addWhoisInfo(info:WhoisInfo) {
    let raw = info.raw || ""
    if (raw && typeof info.raw != "string") {
      raw = JSON.stringify(raw)
    }
    const stmt = this.db?.prepare('INSERT INTO whois_info (domain, status, statusText, createTime, expireTime, updateTime, ' +
      'registerName,registerCountry, registerStateProvince,dnsServer,concatPerson, concatEmail,raw, tryNum, lastQueryTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    return stmt?.run(info.domain,info.status, info.statusText, info.createTime,info.expireTime, info.updateTime,
      info.registerName, info.registerCountry, info.registerStateProvince, info.dnsServer, info.concatPerson, info.concatEmail , raw, info.tryNum, info.lastQueryTime).lastInsertRowid;
  }

  getWhoisInfo(domain:string):any {
    return this.db?.prepare('SELECT * FROM whois_info where domain = ?').get(domain)
  }

  updateWhoisInfo(info:WhoisInfo) {
    let raw = info.raw || ""
    if (raw && typeof info.raw != "string") {
      raw = JSON.stringify(raw)
    }
    const stmt = this.db?.prepare('UPDATE whois_info SET status = ?, statusText = ?, expireTime = ?, updateTime = ?, registerName = ?, registerCountry = ?, dnsServer = ?, concatPerson = ?, concatEmail = ?, raw = ?, tryNum = ?, lastQueryTime = ? WHERE domain = ?');
    return stmt?.run(info.status, info.statusText, info.expireTime, info.updateTime, info.registerName, info.registerCountry, info.dnsServer, info.concatPerson, info.concatEmail , raw, info.tryNum, info.lastQueryTime, info.domain);
  }


  // 用户操作
  addWhoisTask(info:WhoisTask) {
    const stmt = this.db?.prepare('INSERT INTO whois_task (taskId, domains, createTime, completeTime) ' +
      ' VALUES (?, ?, ?, ?)');
    return stmt?.run(info.taskId, info.domains, info.createTime,info.completeTime).lastInsertRowid;
  }

  getWhoisTask(taskId:string):any {
    return this.db?.prepare('SELECT * FROM whois_task where taskId = ?').get(taskId)
  }

}
