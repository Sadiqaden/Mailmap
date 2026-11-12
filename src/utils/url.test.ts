import { describe, expect, it } from 'vitest';
import { checkHttpUrl, checkMailtoUrl } from './url';

describe('checkHttpUrl', () => {
  it('accepts a normal https URL', () => {
    const result = checkHttpUrl('https://news.example.com/unsub?id=1', { allowHttp: false });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url.hostname).toBe('news.example.com');
      expect(result.insecure).toBe(false);
    }
  });

  it('accepts http only when allowed, and flags it as insecure', () => {
    expect(checkHttpUrl('http://example.com/u', { allowHttp: false })).toEqual({
      ok: false,
      reason: 'scheme',
    });
    const allowed = checkHttpUrl('http://example.com/u', { allowHttp: true });
    expect(allowed.ok && allowed.insecure).toBe(true);
  });

  it.each([
    ['javascript:alert(1)', 'scheme'],
    ['JaVaScRiPt:alert(1)', 'scheme'],
    ['data:text/html,<script>alert(1)</script>', 'scheme'],
    ['file:///etc/passwd', 'scheme'],
    ['ftp://example.com/x', 'scheme'],
    ['not a url', 'unparseable'],
    ['https://user:pass@example.com/', 'credentials'],
    ['https://localhost/u', 'host'],
    ['https://127.0.0.1/u', 'host'],
    ['https://192.168.1.1/u', 'host'],
    ['https://[::1]/u', 'host'],
    ['https://0x7f.1/u', 'host'],
    ['https://2130706433/u', 'host'],
    ['https://printer.local/u', 'host'],
    ['https://router.lan/u', 'host'],
    ['https://intranet/u', 'host'],
    ['https://example.com:8443/u', 'port'],
  ])('rejects %s (%s)', (input, reason) => {
    expect(checkHttpUrl(input, { allowHttp: true })).toEqual({ ok: false, reason });
  });

  it('rejects overly long URLs', () => {
    const long = `https://example.com/${'a'.repeat(2100)}`;
    expect(checkHttpUrl(long, { allowHttp: false })).toEqual({ ok: false, reason: 'too-long' });
  });

  it('normalises internationalised domains to punycode, which is safer to display', () => {
    const result = checkHttpUrl('https://exämple.com/u', { allowHttp: false });
    expect(result.ok && result.url.hostname).toBe('xn--exmple-cua.com');
  });
});

describe('checkMailtoUrl', () => {
  it('parses address, subject and body', () => {
    const result = checkMailtoUrl(
      'mailto:leave@list.example.com?subject=Unsubscribe&body=Please%20remove%20me',
    );
    expect(result).toMatchObject({
      ok: true,
      address: 'leave@list.example.com',
      subject: 'Unsubscribe',
      body: 'Please remove me',
    });
  });

  it('defaults the subject to "unsubscribe"', () => {
    const result = checkMailtoUrl('mailto:leave@example.com');
    expect(result.ok && result.subject).toBe('unsubscribe');
  });

  it('drops cc/bcc so the user never emails unexpected recipients', () => {
    const result = checkMailtoUrl(
      'mailto:leave@example.com?cc=victim@example.org&bcc=x@example.org&subject=hi',
    );
    expect(result.ok && result.href).toBe('mailto:leave@example.com?subject=hi');
  });

  it('rejects multiple recipients and invalid addresses', () => {
    expect(checkMailtoUrl('mailto:a@example.com,b@example.com').ok).toBe(false);
    expect(checkMailtoUrl('mailto:not-an-address').ok).toBe(false);
  });

  it('rejects non-mailto schemes', () => {
    expect(checkMailtoUrl('https://example.com')).toEqual({ ok: false, reason: 'scheme' });
  });

  it('strips control characters and caps field length', () => {
    const result = checkMailtoUrl(
      `mailto:a@example.com?subject=${encodeURIComponent('a\u0000b')}&body=${'x'.repeat(500)}`,
    );
    expect(result.ok && result.subject).toBe('ab');
    expect(result.ok && result.body.length).toBe(300);
  });
});
