import type {Settings as SettingsT, Setting, SettingKey} from 'src/interfaces';
import type Database from 'better-sqlite3';

export class Settings {
  private db:  Database.Database|null = null;
  private init: boolean = false;
  private settings: SettingsT = {
    backendQueryLimit: 100,
    lastWhoisTaskId: '',
    whoisQueryTryNum: 3,
  }
  constructor(db:  Database.Database|null) {
    this.db = db;
  }

  getSettings(): SettingsT {
    if (this.init) {
      return this.settings;
    }
    const res = this.db?.prepare('SELECT * FROM settings').all()
    if (res) {
      res.forEach((item => {
        const _item = item as Setting
        if (_item.key == "backendQueryLimit") {
          const val = _item.val * 1
          if (val > 0 ) {
            this.settings.backendQueryLimit = val
          }
        } else if (_item.key == "lastWhoisTaskId") {
          this.settings.lastWhoisTaskId = _item.val
        } else if (_item.key == "whoisQueryTryNum") {
          const val = _item.val * 1
          if (val > 0 ) {
            this.settings.whoisQueryTryNum = val
          }
        }
      }))
      this.init = true
    }
    return this.settings;
  }

  setSettings(key:SettingKey, v: any): boolean {
    if (key == "backendQueryLimit" && typeof v == "number" && v > 0) {
      this.settings.backendQueryLimit = v
      this.db?.prepare('UPDATE settings SET val = ? WHERE key = ?').run(v, key)
    } else if (key == "lastWhoisTaskId") {
      this.settings.lastWhoisTaskId = v
      this.db?.prepare('UPDATE settings SET val = ? WHERE key = ?').run(v, key)
    }else if (key == "whoisQueryTryNum") {
      this.settings.whoisQueryTryNum = v
      this.db?.prepare('UPDATE settings SET val = ? WHERE key = ?').run(v, key)
    }
    return true;
  }

  getSetting(key:SettingKey):any {
    console.log("this.getSettings()", this.getSettings())
    return this.getSettings()[key];
  }
}
