import Database from 'better-sqlite3';
import path from 'path';
import { whoisInfoTable, whoisTaskTable, settingsTable } from './tables';
import {Settings} from 'src/main/db/settings';
import { WhoisInfoDB } from 'src/main/db/whois_info';

class DB {
  private dbPath:string = ""
  private db: Database.Database | null = null
  private settingsDB: Settings | null = null
  private whoisInfoDB: WhoisInfoDB | null = null
  constructor() {
    // const userDataPath = app.getPath('userData');
    // console.log("userDataPath:", userDataPath)
    this.dbPath = path.join("/Users/pzzz/whois_app", 'app.db');
  }

  initialize(): boolean {
    try {
      console.log('Database initializing...', this.dbPath);
      this.db = new Database(this.dbPath);
      this.ensureTables();
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      return false;
    }
  }

  // 验证密码是否正确
  verifyPassword():boolean {
    return true
  }

  private ensureTables():void {
    this.db?.exec(`${whoisInfoTable};${whoisTaskTable};${settingsTable}`)
  }

  settings(): Settings {
    if (!this.settingsDB) {
      this.settingsDB = new Settings(this.db);
    }
    return this.settingsDB;
  }

  whoisInfo(): WhoisInfoDB {
    if (!this.whoisInfoDB) {
      this.whoisInfoDB = new WhoisInfoDB(this.db);
    }
    return this.whoisInfoDB;
  }

  close():void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export default new DB();
