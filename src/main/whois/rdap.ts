import { domain as domainRdap } from 'node-rdap';
import type { WhoisInfo } from 'src/interfaces';
import { WhoisInfoStatus } from 'src/interfaces';
import { createWhoisInfo, DomainStatus } from 'src/utils/domain';

export function whoisJsonRdap(domain: string): Promise<WhoisInfo> {
  return new Promise<WhoisInfo>((resolve, reject) => {
    domainRdap(domain)
      .then((res) => {
        console.log('whoisJsonRdap', res);
        const info = createWhoisInfo(domain, null);
        if (res) {
          if (res?.errorCode == 404) {
            info.status = WhoisInfoStatus.unregistered;
            info.statusText = '未注册';
          } else if (res?.ldhName == domain) {
            info.status = WhoisInfoStatus.registered;
            const ent = res && res.entities ? res.entities[0] : null;
            const secEnt = ent && ent.entities ? ent.entities[0] : null;
            info.statusText = res?.status ? processStatus(res?.status) : '';
            const vcard = secEnt && secEnt.vcardArray ? secEnt.vcardArray[1] : [];
            vcard.forEach((item) => {
              switch (item[0]) {
                case 'email':
                  info.concatEmail = item[3] as string;
                  break;
                case 'fn':
                  info.concatPerson = item[3] as string;
                  break;
              }
            });
            res?.events?.forEach((item) => {
              switch (item.eventAction) {
                case 'registration':
                  info.createTime = item.eventDate;
                  break;
                case 'last changed':
                  info.updateTime = item.eventDate;
                  break;
                case 'expiration':
                  info.expireTime = item.eventDate;
              }
            });
            info.dnsServer =
              res.nameservers && res?.nameservers.length > 0
                ? res.nameservers.map((item) => item.ldhName || '').join(',')
                : '';
          }
        }
        console.log('info', info);
        resolve(info);
      })
      .catch((e: Error) => {
        if (e.toString().includes('404')) {
          const info = createWhoisInfo(domain, null);
          info.status = WhoisInfoStatus.unregistered;
          info.statusText = '未注册';
          resolve(info);
          return;
        }
        console.log('whoisJsonRdap err', e);
        reject(e);
      });
  });
}

function processStatus(status: string[]): string {
  if (status && status.length > 0) {
    return status
      .map((s) => {
        return DomainStatus[spaceToCamelCase(s)] || s;
      })
      .join(',');
  }
  return '';
}
function spaceToCamelCase(str: string): string {
  return str.replace(/\s+(.)/g, (match, char) => char.toUpperCase());
}
