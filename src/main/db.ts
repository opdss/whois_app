import db from 'src/main/db/db'

export function setupDB() {
  // ipcMainManager.handle(
  //   IpcEvents.addWhoisInfo,
  //   (_: IpcMainInvokeEvent, whoisInfo: WhoisInfo) => db.addWhoisInfo(whoisInfo)
  // );
  // const passwd = "123456"
  const isInitialized = db.initialize();
  if (!isInitialized) {
    console.error('Failed to initialize database');
    return;
  }
  // 验证密码
  const isValid =  db.verifyPassword();
  console.log('Password valid:', isValid);
}
