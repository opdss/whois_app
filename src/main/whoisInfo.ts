import { whoisJson } from 'src/main/whois/index.js';
import type { IpcMainInvokeEvent } from 'electron';
import { ipcMainManager } from './ipc';
import { IpcEvents } from '../ipc-events';
import type { WhoisInfo, WhoisTask } from 'src/interfaces';
import { WhoisInfoStatus } from 'src/interfaces';
import db from 'src/main/db/db';
import {createWhoisInfo} from 'src/utils/domain';
import crypto from 'crypto';
import { whoisJsonRdap } from 'src/main/whois/rdap';
// import { sleep } from 'src/utils/utils';

function  getWhoisInfo(domain: string): Promise<WhoisInfo> {
  return new Promise<WhoisInfo>((resolve, reject) => {
    const whoisInfo = db.whoisInfo().getWhoisInfo(domain);
    console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().getWhoisInfo(${domain})):`, whoisInfo)
    const toQuery = function(data:WhoisInfo|null) {
      if (domain.includes(".app") || domain.includes(".dev")) {
        whoisJsonRdap(domain).then(res => {
          if (data) {
            console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().updateWhoisInfo(${domain})):`, db.whoisInfo().updateWhoisInfo(res));
          } else {
            console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().addWhoisInfo(${domain})):`, db.whoisInfo().addWhoisInfo(res));
          }
          data = res
          data.fromCache = false
          resolve(data);
        }).catch((e) => {
          console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().addWhoisInfo(${domain})): err => `, e);
          if (data) {
            data.tryNum++
            console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().updateWhoisInfo(${domain})):`, db.whoisInfo().updateWhoisInfo(data));
          } else {
            data = createWhoisInfo(domain, null);
            data.tryNum++
            console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().addWhoisInfo(${domain})):`, db.whoisInfo().addWhoisInfo(data));
          }
          reject(e as Error)
        })
      } else {
        whoisJson(domain)
          .then((res) => {
            if (data) {
              data = createWhoisInfo(domain, res)
              console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().updateWhoisInfo(${domain})):`, db.whoisInfo().updateWhoisInfo(data));
            } else {
              data = createWhoisInfo(domain, res);
              console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().addWhoisInfo(${domain})):`, db.whoisInfo().addWhoisInfo(data));
            }
            data.fromCache = false
            resolve(data);
          })
          .catch(e => {
            console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().addWhoisInfo(${domain})): err => `, e);
            if (data) {
              data.tryNum++
              console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().updateWhoisInfo(${domain})):`, db.whoisInfo().updateWhoisInfo(data));
            } else {
              data = createWhoisInfo(domain, null);
              data.tryNum++
              console.log(`main.whoisInfo.getWhoisInfo(db.whoisInfo().addWhoisInfo(${domain})):`, db.whoisInfo().addWhoisInfo(data));
            }
            reject(e as Error)
          });
      }
    }
    if (!whoisInfo) {
      toQuery(whoisInfo)
      return
    }
    if ((whoisInfo.status == WhoisInfoStatus.queryError || whoisInfo.status == WhoisInfoStatus.unregistered) && (whoisInfo.tryNum < 7 || (whoisInfo.lastQueryTime + (86400000*7)) < new Date().getTime()) ) {
      toQuery(whoisInfo)
      return
    }
    whoisInfo.fromCache = true
    resolve(whoisInfo);
  });
}

function addWhoisTask(domains: string[]): WhoisTask {
  const task: WhoisTask = {taskId:"", domains: domains.join(","), createTime:new Date().getTime(), completeTime: 0}
  if (domains.length == 0) {
    return task
  }
  task.taskId = crypto.createHash('md5').update(domains.join(",")).digest('hex');
  const exists = db.whoisInfo().getWhoisTask(task.taskId)
  if (exists && exists?.taskId != "") {
    db.settings().setSettings('lastWhoisTaskId', exists.taskId)
    return exists
  }
  console.log("db.whoisInfo().addWhoisTask()", db.whoisInfo().addWhoisTask(task))
  db.settings().setSettings('lastWhoisTaskId', task.taskId)
  return task
}

  function startWhoisTask(taskId: string) {
  console.log(`db.whoisInfo().startWhoisTask(${taskId})`)
  db.settings().setSettings('lastWhoisTaskId', taskId)
  const taskInfo = db.whoisInfo().getWhoisTask(taskId)
  console.log(`db.whoisInfo().startWhoisTask(${taskId}):`, taskInfo)
  // if (taskInfo && taskInfo.domains.length > 0) {
  //   for (let i=0;i<taskInfo.domains.length;i++) {
  //      await getWhoisInfo(taskInfo.domains[i]).then(res=>{
  //
  //      }).catch(() => {
  //
  //      })
  //   }
  // }
  return true
}




export function setupWhois() {
  ipcMainManager.handle(IpcEvents.whoisLookup, (_: IpcMainInvokeEvent, name: string) =>
    whoisJson(name),
  );
  ipcMainManager.handle(IpcEvents.getWhoisInfo, (_: IpcMainInvokeEvent, name: string) =>
    getWhoisInfo(name),
  );


  ipcMainManager.handle(IpcEvents.getWhoisTask, (_: IpcMainInvokeEvent, taskId: string) =>
    db.whoisInfo().getWhoisTask(taskId),
  );

  ipcMainManager.handle(IpcEvents.addWhoisTask, (_: IpcMainInvokeEvent, domains: string[]) =>
    addWhoisTask(domains),
  );

  ipcMainManager.handle(IpcEvents.startWhoisTask, (_: IpcMainInvokeEvent, taskId: string) =>
    startWhoisTask(taskId),
  );


}
