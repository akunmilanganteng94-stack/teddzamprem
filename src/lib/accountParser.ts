export interface ParsedAccount {
  email: string;
  accessGmail: string;
}

/**
 * Extracts and normalizes email and Gmail access details from AM API responses.
 * Specifically crafted for the AM bulk API:
 * {"creator":"dapjisync","status":true,"data":{"message":"...","total":1,"emails":[{"email":"...","access_link":"..."}]}}
 * Also supports legacy formats, stringified JSON, and pipe-separated strings.
 */
export function parseAccountDetails(raw: any): ParsedAccount[] {
  if (!raw) return [];

  let data = raw;

  // If string, attempt JSON parse or line split
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      const lines = data.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
      const parsed: ParsedAccount[] = [];
      for (const line of lines) {
        if (line.includes('|')) {
          const parts = line.split('|');
          parsed.push({
            email: parts[0]?.trim() || '',
            accessGmail: parts.slice(1).join('|').trim(),
          });
        } else if (line.includes(':') && line.includes('@')) {
          const parts = line.split(':');
          parsed.push({
            email: parts[0]?.trim() || '',
            accessGmail: parts.slice(1).join(':').trim(),
          });
        } else if (line.includes('@')) {
          parsed.push({ email: line, accessGmail: '-' });
        }
      }
      if (parsed.length > 0) return parsed;
    }
  }

  // Extract array of email accounts from various possible nested properties
  let itemsArray: any[] | null = null;

  if (Array.isArray(data)) {
    itemsArray = data;
  } else if (data && typeof data === 'object') {
    if (data.data?.emails && Array.isArray(data.data.emails)) {
      itemsArray = data.data.emails;
    } else if (data.emails && Array.isArray(data.emails)) {
      itemsArray = data.emails;
    } else if (data.data?.data?.emails && Array.isArray(data.data.data.emails)) {
      itemsArray = data.data.data.emails;
    } else if (data.data?.accounts && Array.isArray(data.data.accounts)) {
      itemsArray = data.data.accounts;
    } else if (data.accounts && Array.isArray(data.accounts)) {
      itemsArray = data.accounts;
    } else if (data.data?.result && Array.isArray(data.data.result)) {
      itemsArray = data.data.result;
    } else if (data.result && Array.isArray(data.result)) {
      itemsArray = data.result;
    } else if (data.data?.items && Array.isArray(data.data.items)) {
      itemsArray = data.data.items;
    } else if (data.items && Array.isArray(data.items)) {
      itemsArray = data.items;
    } else if (Array.isArray(data.data)) {
      itemsArray = data.data;
    } else if (Array.isArray(data.list)) {
      itemsArray = data.list;
    }
  }

  if (itemsArray && Array.isArray(itemsArray)) {
    const list: ParsedAccount[] = [];
    for (const item of itemsArray) {
      if (typeof item === 'string') {
        if (item.includes('|')) {
          const parts = item.split('|');
          list.push({
            email: parts[0]?.trim() || '',
            accessGmail: parts.slice(1).join('|').trim(),
          });
        } else if (item.includes(':')) {
          const parts = item.split(':');
          list.push({
            email: parts[0]?.trim() || '',
            accessGmail: parts.slice(1).join(':').trim(),
          });
        } else {
          list.push({ email: item.trim(), accessGmail: '-' });
        }
      } else if (item && typeof item === 'object') {
        const email =
          item.email ||
          item.mail ||
          item.username ||
          item.user ||
          item.account ||
          '';

        const accessGmail =
          item.access_link ||
          item.accessLink ||
          item.access_gmail ||
          item.akses_gmail ||
          item.access ||
          item.akses ||
          item.link ||
          item.url ||
          item.gmail ||
          item.password ||
          item.pass ||
          '';

        if (email || accessGmail) {
          list.push({
            email: String(email || '-').trim(),
            accessGmail: String(accessGmail || '-').trim(),
          });
        }
      }
    }
    if (list.length > 0) return list;
  }

  // Single object fallback
  if (data && typeof data === 'object') {
    const email = data.email || data.mail || data.username || '';
    const accessGmail =
      data.access_link ||
      data.accessLink ||
      data.access_gmail ||
      data.akses_gmail ||
      data.access ||
      data.akses ||
      data.link ||
      data.url ||
      data.gmail ||
      data.password ||
      data.pass ||
      '';

    if (email || accessGmail) {
      return [
        {
          email: String(email || '-').trim(),
          accessGmail: String(accessGmail || '-').trim(),
        },
      ];
    }
  }

  return [];
}
