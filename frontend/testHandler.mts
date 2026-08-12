import handler from './server.ts';

const fakeReq: any = {
  method: 'GET',
  url: '/share/hhg-test123',
  path: '/share/hhg-test123',
  originalUrl: '/share/hhg-test123',
  headers: { host: 'example.com', 'x-forwarded-proto': 'https' },
  query: {},
  params: {},
  body: undefined,
};
const fakeRes: any = {
  statusCode: 0,
  headers: {},
  set(c: any, v: any) { return this; },
  status(c: number) { this.statusCode = c; return this; },
  json(o: any) { console.log('JSON', this.statusCode, JSON.stringify(o)); return this; },
  send(o: any) { console.log('SEND', this.statusCode, String(o).slice(0, 200)); return this; },
  redirect(u: any) { console.log('REDIRECT', u); return this; },
  end(o: any) { console.log('END', this.statusCode, o ? String(o).slice(0, 200) : ''); return this; },
};

try {
  console.log('Invoking handler...');
  await handler(fakeReq, fakeRes);
  console.log('Handler returned without throwing.');
} catch (err) {
  console.error('CRASH AT INVOCATION:', err);
}
process.exit(0);
