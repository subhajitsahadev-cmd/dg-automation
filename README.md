# DG Automation — Chatbot with Local CSV

## 📁 Folder Structure

```
dg-automation/
├── server.js          ← Node.js Express backend
├── package.json
├── data/
│   ├── faq.csv        ← Edit this to update chatbot Q&A
│   └── customers.csv  ← Phone leads are auto-saved here
└── public/
    └── index.html     ← Full website + chatbot
```

---

## 🚀 How to Run

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start the server
node server.js

# 3. Open browser
http://localhost:3000
```

---

## 📋 API Endpoints

| Method | Endpoint         | What it does                         |
|--------|------------------|--------------------------------------|
| GET    | `/api/faq`       | Returns all rows from faq.csv        |
| POST   | `/api/lead`      | Saves phone + question to customers.csv |
| GET    | `/api/customers` | Returns all saved leads              |

---

## ✏️ How to Update FAQ (Q&A)

Just edit `data/faq.csv` in any text editor or Excel/Google Sheets.

**Column format:**
```
ID, Category, User Question, Chatbot Answer, Purpose
```

**Example row:**
```
11, Support, "What are your business hours?", "We are available Mon–Sat 9am–6pm IST. Email: support@dgautomation.com", Info
```

- Save the file
- The chatbot picks up changes **immediately** (no restart needed)

---

## 👥 Viewing Saved Leads

Open `data/customers.csv` in Excel or any spreadsheet app.

Or hit the API:
```
http://localhost:3000/api/customers
```

**Columns saved:**
```
ID | Phone Number | Question Asked | Date | Time | Status
```

---

## 🔄 Phone Capture Logic

The chatbot asks for a phone number when:
1. A user asks something **not in the FAQ**
2. A user asks about **pricing, cost, quotes**
3. A user asks to **talk to a human / agent / call**

Once the number is entered, it's instantly appended to `customers.csv`.
