import  util from 'util'
import  whois from 'whois'
import { decodeEntity } from 'html-entities';
import { camelCase } from 'change-case';

const DELIMITER = ':';
const lookup = util.promisify(whois.lookup);


//Checks whether a delimiter followed by a space common in this result
function getCommonDelimiterForm(rawData, delimiter) {
  const delimiterPattern = new RegExp(delimiter + '\\S+', 'g');
  const delimiterWSpacePattern = new RegExp(delimiter + ' ', 'g');
  const delimiterMatches = rawData.match(delimiterPattern) || [];
  const delimiterWSpaceMatches = rawData.match(delimiterWSpacePattern) || [];

  if (delimiterMatches.length > delimiterWSpaceMatches.length) {
    return delimiter;
  }
  return delimiter + ' ';
}

function parseRawData(rawData) {
  const result  = {};
  rawData = decodeEntity(rawData)
  rawData = rawData.replace(/:\s*\r\n/g, ': ');
  const lines = rawData.split('\n');
  const delimiter = getCommonDelimiterForm(rawData, DELIMITER);
  lines.forEach(function(line){
    line = line.trim();
    // colon space because that's the standard delimiter - not ':' as that's used in eg, http links
    if ( line && line.includes(delimiter) ) {
      const lineParts = line.split(DELIMITER);
      // 'Greater than' since lines often have more than one colon, eg values with URLs
      if ( lineParts.length >= 2 ) {
        const key = camelCase(lineParts[0]||""),
          value = lineParts.splice(1).join(DELIMITER).trim()
        // If multiple lines use the same key, combine the values
        if ( key in result ) {
          result[key] = `${result[key]} ${value}`;
          return
        }
        result[key] = value;
      }
    }
  });
  return result;
}

export async function whoisJson(domain){
  const rawData = await lookup(domain,{timeout: 15000, follow: 2})
  console.log(`main.whois.whoisJson(${domain}):rawData => `, rawData)
  let result=  {};
  if ( typeof rawData === 'object' ) {
    result = rawData.map(function(data) {
      data.data = parseRawData(data.data);
      return data;
    });
  } else {
    result = parseRawData(rawData);
  }
  console.log(`main.whois.whoisJson(${domain}):result => `, result)
  return result;
}

