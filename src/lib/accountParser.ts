import { ParsedAccount, OrderRecord } from '../types';

/**
 * Builds direct access link for Gmail webmail.
 * Pre-populates the email in Google's Account Chooser / sign-in screen.
 */
export function getGmailAccessUrl(email?: string): string {
  if (!email || !email.includes('@')) {
    return 'https://mail.google.com/';
  }
  const cleanEmail = email.trim();
  return `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(cleanEmail)}&continue=${encodeURIComponent('https://mail.google.com/mail/')}`;
}

/**
 * Extracts and normalizes accounts from any API response or stored order records.
 */
export function parseAccountString(str: string, index: number = 0): ParsedAccount | null {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  let email = '';
  let password = '';

  // Case 1: email|password
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|');
    email = parts[0]?.trim() || '';
    password = parts.slice(1).join('|').trim();
  }
  // Case 2: email:password (ensure not http: or json)
  else if (trimmed.includes(':') && !trimmed.startsWith('http')) {
    const parts = trimmed.split(':');
    email = parts[0]?.trim() || '';
    password = parts.slice(1).join(':').trim();
  }
  // Case 3: email, password or whitespace
  else if (trimmed.includes(' ')) {
    const parts = trimmed.split(/\s+/);
    if (parts[0].includes('@')) {
      email = parts[0].trim();
      password = parts.slice(1).join(' ').trim();
    }
  } else if (trimmed.includes('@')) {
    email = trimmed;
  }

  // Regex extraction fallback if still not clean
  if (!email || !email.includes('@')) {
    const emailMatch = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0];
      const remainder = trimmed.replace(email, '').replace(/^[:|\s]+/, '').trim();
      if (remainder && !password) {
        password = remainder;
      }
    }
  }

  if (!email) return null;

  const domain = email.split('@')[1]?.toLowerCase() || '';
  const gmailUrl = getGmailAccessUrl(email);

  return {
    id: `acc-${index}-${email}`,
    email,
    password: password || undefined,
    accessLink: gmailUrl,
    raw: trimmed,
    domain,
    gmailUrl,
  };
}

/**
 * Robust extractor for an order object, checking parsedAccounts, accounts array,
 * or raw apiResponse from curl -X POST "https://am.dapjisync.my.id/api/bulk"
 */
export function extractAccountsFromOrder(order: Partial<OrderRecord>): ParsedAccount[] {
  if (order.parsedAccounts && order.parsedAccounts.length > 0) {
    return order.parsedAccounts;
  }

  const results: ParsedAccount[] = [];

  // 1. Check explicit accounts array
  if (Array.isArray(order.accounts) && order.accounts.length > 0) {
    order.accounts.forEach((acc, idx) => {
      const parsed = parseAccountString(String(acc), idx);
      if (parsed) results.push(parsed);
    });
    if (results.length > 0) return results;
  }

  // 2. Check apiResponse object
  const api = order.apiResponse;
  if (api) {
    // If api is a string
    if (typeof api === 'string') {
      const lines = api.split(/[\r\n]+/);
      lines.forEach((line, idx) => {
        const parsed = parseAccountString(line, idx);
        if (parsed) results.push(parsed);
      });
      if (results.length > 0) return results;
    }

    // Check candidate arrays, prioritizing dapjisync structure:
    // data.emails or data.data.emails or emails
    const candidateArrays = [
      api.data?.emails,
      api.data?.data?.emails,
      api.emails,
      api.data?.data,
      api.data,
      api.accounts,
      api.data?.accounts,
      api.result,
      api.results,
      api.items,
      api.list,
    ];

    for (const arr of candidateArrays) {
      if (Array.isArray(arr) && arr.length > 0) {
        arr.forEach((item, idx) => {
          if (typeof item === 'string') {
            const p = parseAccountString(item, idx);
            if (p) results.push(p);
          } else if (item && typeof item === 'object') {
            const email = item.email || item.username || item.user || item.mail || item.gmail;
            const password = item.password || item.pass || item.pwd;
            const accessLink = item.access_link || item.accessLink || item.link;
            if (email) {
              const cleanEmail = String(email).trim();
              const finalAccessLink = accessLink ? String(accessLink).trim() : getGmailAccessUrl(cleanEmail);
              results.push({
                id: `api-acc-${idx}-${cleanEmail}`,
                email: cleanEmail,
                password: password ? String(password).trim() : undefined,
                accessLink: finalAccessLink,
                raw: JSON.stringify(item),
                domain: cleanEmail.split('@')[1]?.toLowerCase() || '',
                gmailUrl: finalAccessLink,
              });
            }
          }
        });
        if (results.length > 0) return results;
      }
    }

    // If api.data is a string with newlines
    if (typeof api.data === 'string') {
      const lines = api.data.split(/[\r\n]+/);
      lines.forEach((line: string, idx: number) => {
        const p = parseAccountString(line, idx);
        if (p) results.push(p);
      });
      if (results.length > 0) return results;
    }
  }

  return results;
}
