import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { auth, askBackend, initAuth } from './auth';
import './style.css';

function App() {
  const [result, setResult] = useState('هنوز درخواستی به بک‌اند نرسیده.');
  const [busy, setBusy] = useState(false);
  async function check(withToken: boolean) {
    setBusy(true);
    try {
      const user = await askBackend(withToken);
      setResult(JSON.stringify(user, null, 2));
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'ارتباط برقرار نشد.');
    } finally {
      setBusy(false);
    }
  }
  return <main><h1>چه کسی وارد شده؟</h1>
    <section><h2>۱ · مرورگر من</h2>
      {auth.authenticated ? <><p>نام کاربری <b>{auth.tokenParsed?.preferred_username}</b></p>
        <p>شناسهٔ کاربر <bdi>{auth.subject}</bdi></p>
        <button onClick={() => auth.logout({ redirectUri: location.origin + '/' })}>خروج</button></>
        : <><p>هنوز وارد حسابی نشدی.</p><button onClick={() => auth.login()}>ورود به حساب</button></>}
    </section>
    <section><h2>۲ · پاسخ FastAPI</h2><p>همان درخواست را با توکن و بدون توکن امتحان کن.</p>
      <button disabled={busy || !auth.authenticated} onClick={() => check(true)}>ارسال با توکن</button>
      <button disabled={busy} onClick={() => check(false)}>ارسال بدون توکن</button>
      <pre dir="auto" aria-live="polite">{busy ? 'در حال بررسی…' : result}</pre>
    </section></main>;
}

const root = createRoot(document.getElementById('root')!);
auth.onAuthLogout = () => location.reload();
initAuth().then(() => root.render(<App />)).catch(() =>
  root.render(<main><p>ارتباط با Keycloak برقرار نشد. پس از آماده شدن سرویس، دوباره امتحان کن.</p>
    <button onClick={() => location.reload()}>تلاش دوباره</button></main>));
