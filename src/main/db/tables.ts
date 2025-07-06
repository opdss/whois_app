
export const settingsTable: string = `
   CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      val TEXT NOT NULL
   );
 `

export const whoisInfoTable: string = `
   CREATE TABLE IF NOT EXISTS whois_info (
      domain TEXT PRIMARY KEY NOT NULL,
      status INTEGER NOT NULL,
      statusText TEXT NOT NULL,
      createTime TEXT NOT NULL,
      expireTime TEXT NOT NULL,
      updateTime TEXT NOT NULL,
      registerName TEXT NOT NULL,
      registerCountry TEXT NOT NULL,
      registerStateProvince TEXT NOT NULL,
      dnsServer TEXT NOT NULL,
      concatPerson TEXT NOT NULL,
      concatEmail TEXT NOT NULL,
      raw TEXT NOT NULL,
      tryNum INTEGER not null default 0,
      lastQueryTime INTEGER not null
   );
 `


export const whoisTaskTable:string = `
   CREATE TABLE IF NOT EXISTS whois_task (
      taskId TEXT PRIMARY KEY NOT NULL,
      domains TEXT NOT NULL,
      createTime INTEGER not null,
      completeTime INTEGER not null
   );
 `
