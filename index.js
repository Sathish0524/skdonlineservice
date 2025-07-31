const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const url = require('url');

const app = express();
const upload = multer({ dest: 'uploads/' });

// === Configure These (REAL credentials in production!) ===
const GMAIL_USER = 'skdonlineservice@gmail.com'; // <-- Set your email/app password here
const GMAIL_PASS = 'poagoqmrhkriptqw';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

const services = {
  "PAN": ["New PAN", "PAN Correction"],
  "Aadhaar": ["Name Correction", "DOB Correction", "Address Change"],
  "Smart Card": ["New Smart Card", "Remove Member", "Add Member", "Address Change"]
};

// Icons for service cards
const serviceIcons = {
  "PAN": `<svg viewBox="0 0 44 44" fill="none" width="42" height="42"><circle cx="22" cy="22" r="21" fill="#4265ee" stroke="#9d7eff" stroke-width="2"/><rect x="11" y="17" width="22" height="10" rx="2" fill="#fff"/><rect x="15" y="21" width="4" height="2" rx="1" fill="#74aaff"/><rect x="25" y="21" width="4" height="2" rx="1" fill="#74aaff"/><rect x="19" y="19" width="6" height="6" rx="2" fill="#cfc9ff"/><rect x="14" y="24" width="16" height="2" rx="1" fill="#bc9eee"/></svg>`,
  "Aadhaar": `<svg width="42" height="42" viewBox="0 0 44 44" fill="none"><ellipse cx="22" cy="33" rx="11" ry="6" fill="#fff"/><circle cx="22" cy="20" r="9" fill="#b6a9fa" stroke="#4265ee" stroke-width="2"/><circle cx="22" cy="20" r="5" fill="#e1dbfb"/><path d="M9 30c3-10 23-10 26 0" stroke="#836efc" stroke-width="2" fill="none"/></svg>`,
  "Smart Card": `<svg width="42" height="42" viewBox="0 0 44 44" fill="none"><rect x="6" y="13" width="32" height="18" rx="3" fill="#edefff" stroke="#b9a8fa" stroke-width="2"/><rect x="15" y="18" width="9" height="4" rx="2" fill="#cbadfb"/><rect x="27" y="18" width="5" height="2" rx="1" fill="#cbadfb"/><rect x="27" y="22" width="5" height="2" rx="1" fill="#cbadfb"/><ellipse cx="12" cy="27" rx="2" ry="1.5" fill="#bfc8e0"/></svg>`
};

// === HOMEPAGE: Visually Rich, Clickable Cards ===
app.get('/', (req, res) => {
  const svcCards = [
    {
      key: 'PAN',
      desc: "Apply for new PAN card or make corrections to existing details",
      features: ['New PAN', 'PAN Correction']
    },
    {
      key: 'Aadhaar',
      desc: "Update your Aadhaar details including name, DOB, and address",
      features: ['Name Correction', 'DOB Correction', 'Address Change']
    },
    {
      key: 'Smart Card',
      desc: "Manage your smart card – add/remove members or update details",
      features: ['New Smart Card', 'Remove Member', 'Add Member', 'Address Change']
    }
  ].map(card => `
    <a class="svc-card" href="/subcategory?service=${encodeURIComponent(card.key)}">
      <div class="svc-icon">${serviceIcons[card.key]}</div>
      <div class="svc-title">${card.key} Services</div>
      <div class="svc-desc">${card.desc}</div>
      <ul class="svc-list">
        ${card.features.map(f => `<li><svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 20 20"><path d="M5 11l4 4L17 7" /></svg>${f}</li>`).join('')}
      </ul>
    </a>
  `).join('');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkD Online Service - Choose Your Service</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', Poppins, Arial, sans-serif;
      background: linear-gradient(120deg, #e5e9ff 0%, #f9fcff 100%);
      color: #28324b;
      min-height: 100vh;
    }
    .container { max-width: 1070px; margin: 2.8em auto 0 auto; padding: 0 1.7em; }
    .pagetitle {
      font-size: 2.4em;
      font-weight: 900;
      letter-spacing: 1.2px;
      text-align: center;
      margin-bottom: 0.6em;
      color: #2f3573;
    }
    .pagesub {
      text-align: center;
      max-width: 630px;
      margin: 0 auto 2.5em auto;
      color: #586291;
      font-size: 1.28em;
      line-height: 1.47;
    }
    .card-row { display: flex; gap: 2em; justify-content: center; flex-wrap: wrap; margin-bottom: 2.1em;}
    .svc-card {
      flex: 1 1 280px; max-width: 330px; 
      background: #fff; border-radius: 18px;
      padding: 2.1em 1.6em 1.7em 1.6em;
      box-shadow: 0 8px 36px #3a277c14;
      margin: 0.5em 0;
      transition: box-shadow 0.17s, transform 0.12s;
      display: flex; flex-direction: column; align-items: center;
      text-decoration: none; color: #24336f;
      font-weight: 600;
    }
    .svc-card:hover { box-shadow: 0 16px 44px #3a277c21; transform: translateY(-4px) scale(1.025); background: #f8faff;}
    .svc-icon { width: 42px; height: 42px; margin-bottom: .6em;}
    .svc-title { font-size: 1.22em; font-weight: 800; color: #2242cd; margin-bottom: .24em;}
    .svc-desc { color: #4e5b7a; font-size: 1.04em; font-weight: 400; text-align: center; margin-bottom: .6em;}
    .svc-list { list-style: none; padding: 0; margin: 0 0 0.2em 0; width: 100%;}
    .svc-list li {
      display: flex; align-items: center; color: #158a25;
      font-weight: 600; font-size: 1em; margin: 0.23em 0;
    }
    .svc-list li svg { margin-right: .43em; color: #37bd5f; width: 1.28em; height: 1.28em; flex-shrink: 0;}
    .info-row { display: flex; gap: 1.5em; justify-content: center; margin: 2.3em 0 0 0; flex-wrap: wrap;}
    .info-box {
      background: #fbfbff; min-width: 270px; flex: 1 1 260px;
      border-radius: 13px; font-size: 1.04em; color: #3a338e;
      display: flex; align-items: center; box-shadow: 0 3px 18px #bdbdfc27;
      padding: 1.3em 1.6em; font-weight: 600; margin-bottom: 1.4em;
    }
    .info-box svg {width: 1.43em; height: 1.43em; margin-right: 0.6em; color: #2f73e8;}
    .info-box.secure svg {color: #56b752;}
    @media (max-width: 992px) {
      .card-row { gap: 1em; }
      .svc-card { min-width: 280px; }
    }
    @media (max-width: 700px) {
      .container { padding: 0 0.5em; }
      .card-row { flex-direction: column; align-items: stretch; }
      .svc-card { margin: 0.6em 0; }
      .info-row { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="pagetitle">SKD Online Service</div>
    <div class="pagesub">
      Select from our range of government document services.<br>
      We make it easy to apply for and manage your official documents.
    </div>
    <div class="card-row">${svcCards}</div>
    <div class="info-row">
      <div class="info-box">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" stroke="#2f73e8" stroke-width="2" fill="#dbeafe"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M11 7v4.5l2.5 2.5"/></svg>
        Quick Processing<br>Most applications are processed within 7–15 business days
      </div>
      <div class="info-box secure">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3l7 4v5c0 5.5-3.8 10.7-7 12C8.8 22.1 5 16.5 5 12V7l7-4z" stroke="#4cbc57" stroke-width="2" fill="#d9f7e3"/></svg>
        Secure &amp; Reliable<br>Your documents are processed securely with government standards
      </div>
    </div>
  </div>
</body>
</html>`);
});

// --- Subcategory / Sub-service selection ---
app.get('/subcategory', (req, res) => {
  const query = url.parse(req.url,true).query;
  const mainService = query.service;
  if (!mainService || !services[mainService]) return res.redirect('/');
  const subBtns = services[mainService].map((sub, i) =>
    `<button class="sub-btn" style="animation-delay:${i*0.07}s"
      data-main="${mainService}" data-sub="${sub}" aria-label="${sub}">${sub}</button>`
  ).join('');
  res.send(`
  <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <title>${mainService} - SkD Online Service</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body{background:linear-gradient(135deg,#389cff 0,#cfbaff 90%);
      font-family:'Segoe UI',Verdana,sans-serif;
      margin:0;opacity:0;transition:opacity .6s;}
    body.fade-in{opacity:1;}
    header{background:linear-gradient(90deg,#2561bb,#9a4aff 95%);
      color:#fff;padding:1.5em 1em 1em 1em; text-align:center; box-shadow:0 6px 17px #4b2ea033;}
    header h1{margin:0;font-size:2rem; letter-spacing:2px;}
    main{max-width:430px;margin:3.8em auto 5em auto; background:#fff;
      box-shadow:0 7px 38px #2e136c1f; border-radius:18px; padding:2.4em 1.6em;}
    h2{color:#5751d7; text-align:center; font-weight:900;}
    .sub-btn{display:block;width:100%;margin:1.1em 0;background:linear-gradient(90deg,#e1eaff,#c8a1ff);border:2px solid #7c49d3;border-radius:17px;font-size:1.11rem;font-weight:800;color:#421d8d;padding:1em;cursor:pointer;box-shadow:0 2px 11px #7837c947;transition:background .18s,color .18s,box-shadow .18s;opacity:0;transform:translateY(18px);animation:fadeInUp .5s cubic-bezier(.44,1.4,.8,1.3) forwards;}
    .sub-btn:hover,.sub-btn:focus{background:#5124c2;color:#fff;box-shadow:0 7px 21px #6a37a957;}
    .back-link{display:block;text-align:center;color:#5321bb;font-weight:700;text-decoration:underline;margin-top:2em;}
    @keyframes fadeInUp{to{opacity:1;transform:translateY(0);}}
  </style>
  </head><body>
    <header><h1>SkD Online Service</h1></header>
    <main>
      <h2>Select Service Type<br><span style="font-size:.9em;font-weight:600;">(${mainService})</span></h2>
      ${subBtns}
      <a href="/" class="back-link">← Back to Main Services</a>
    </main>
    <script>
      document.body.classList.add('fade-in');
      document.querySelectorAll('.sub-btn').forEach(btn=>{
        btn.onclick=()=>{window.location.href='/form?main='+encodeURIComponent(btn.dataset.main)+'&sub='+encodeURIComponent(btn.dataset.sub);}
      });
    </script>
  </body></html>
  `);
});

// --- Form page with upload ---
app.get('/form', (req, res) => {
  const query = url.parse(req.url,true).query;
  const main = query.main || '', sub = query.sub || '';
  if (!main || !sub) return res.redirect('/');
  res.send(`
  <!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8" />
    <title>${main} - ${sub} — SkD Online Service</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {opacity: 0; transition: opacity 0.7s ease-in-out; font-family:'Segoe UI',Verdana,sans-serif;margin:0;background:linear-gradient(135deg,#a8edea 0%,#cab1ff 100%);color: #31376f;}
      body.fade-in{opacity:1;}
      header{background:linear-gradient(90deg, #3568fa, #a77bff 86%);color:white;padding:1.3em 1em; text-align:center;}
      header h1{margin:0;font-size:1.7rem; font-weight:900;}
      main{max-width:510px;margin:3.2em auto 4em; background:#fff; box-shadow:0 10px 45px #9682fd28; border-radius:19px; padding:2.1em 1.15em 2.4em 1.17em; border-left:8px solid #6f49d6;}
      h2{text-align:center; margin:0 0 1.12em;color:#5c3bc2;font-weight:900;}
      label{display:block;margin-top:1em; font-weight:700;}
      input,select{width:100%;padding:0.54em;margin-top:0.19em; font-size:1em; font-weight:500; border-radius:7px;border:1.3px solid #bcadee;background:#f5fafe; box-shadow: 0 2px 8px #e4e8ff62; outline: none;transition: border .2s;}
      input:focus,select:focus{border:1.7px solid #683bcc;background:#f2f1ff;}
      button{margin-top:2.2em;width:100%;padding:1.13em 1em;background:linear-gradient(90deg,#4053ea,#bf62fa 90%);border:none;border-radius:25px; color:white;font-size:1.15em;font-weight:900; cursor:pointer;box-shadow:0 9px 24px #ccabfa9f;transition: background .19s;}
      button:hover,button:focus{background:linear-gradient(90deg,#b464ee 3%,#4768f7 91%);}
      #statusText{margin-top:1.25em;text-align:center;font-weight:700;font-size:1.03rem;}
      #statusText.success{color:#0fa946;}
      #statusText.error{color:#bb2e7c;}
      a.back-link{display:block;margin-top:2em;text-align:center;font-weight:700;color:#6643be;text-decoration:underline;}
    </style>
  </head>
  <body>
    <header><h1>SkD Online Service</h1></header>
    <main>
      <h2>${main} - ${sub}</h2>
      <form id="serviceForm" enctype="multipart/form-data" method="post" action="/upload" novalidate>
        <label for="fullName">Full Name *</label>
        <input id="fullName" name="FullName" required autocomplete="name"/>
        <label for="mobile">Mobile Number *</label>
        <input id="mobile" name="Mobile" required pattern="\\d{10}" autocomplete="tel" title="10 digit mobile number"/>
        <label for="email">Email (optional)</label>
        <input id="email" type="email" name="Email" autocomplete="email"/>
        <label>Service *</label>
        <input type="text" name="Service" readonly value="${main} - ${sub}" />
        <label for="file">Upload Document *</label>
        <input id="file" type="file" name="file" accept=".jpg,.jpeg,.png,.pdf" required/>
        <button type="submit">Submit Application</button>
      </form>
      <div id="statusText" role="alert" aria-live="polite"></div>
      <a href="/subcategory?service=${encodeURIComponent(main)}" class="back-link">&larr; Back to ${main} Options</a>
    </main>
    <script>
      document.body.classList.add('fade-in');
      const form = document.getElementById('serviceForm');
      const statusText = document.getElementById('statusText');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusText.textContent = '';
        statusText.className = '';
        const formData = new FormData(form);
        try {
          const res = await fetch('/upload', { method: 'POST', body: formData });
          const text = await res.text();
          if (/success|emailed/i.test(text)) {
            statusText.textContent = text;
            statusText.classList.add('success');
            form.reset();
          } else {
            statusText.textContent = text;
            statusText.classList.add('error');
          }
        } catch (err) {
          statusText.textContent = 'Network error or server unreachable.';
          statusText.classList.add('error');
        }
      });
    </script>
  </body></html>
  `);
});

// --- File Upload and Email Logic ---
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file uploaded.');
    let emailBody = 'New document upload:\n\n';
    for (const k in req.body) {
      if (k !== 'file') emailBody += `${k}: ${req.body[k]}\n`;
    }
    await transporter.sendMail({
      from: GMAIL_USER,
      to: GMAIL_USER,
      subject: `[SkD] New upload - ${req.body.Service || 'Unknown'}`,
      text: emailBody,
      attachments: [{ filename: req.file.originalname, path: req.file.path }]
    });
    fs.unlink(req.file.path, () => {});
    res.send('File uploaded and emailed successfully!');
  } catch (e) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error(e);
    res.status(500).send(`Upload succeeded, but email failed. (${e.message})`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SkD Online Service running on http://localhost:${PORT}`));
