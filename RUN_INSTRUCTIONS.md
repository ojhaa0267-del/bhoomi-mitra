# Bhoomi Mitra - Hackathon Demo Runbook

Good luck with your presentation! Follow these exact steps tomorrow morning to start your project smoothly in VS Code.

## 🟢 Step 1: Open VS Code
1. Open VS Code.
2. Go to **File > Open Folder** and select your `h_project` folder:
   `C:\PORTHFOLIO\digi-grow-portfolio\h_project`

---

## 🟢 Step 2: Start the AI Backend (Terminal 1)
This will start the Mock Database, the Gemini AI Voice Agent, and the Edge-TTS engine.

1. In VS Code, go to the top menu and click **Terminal > New Terminal**.
2. Type the following command to start the backend:
   ```powershell
   python mock-land-api-db.py
   ```
   *(Agar `python` kaam na kare, toh `py mock-land-api-db.py` use kijiye)*
3. Aapko aisi line dikhegi: `Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)`
4. **Is terminal ko aise hi chalu chhod dijiye.**

---

## 🟢 Step 3: Start the Frontend (Terminal 2)
1. VS Code ke terminal panel mein, plus `+` icon par click karke ek **New Terminal** open karein.
2. Frontend folder mein jaane ke liye likhein:
   ```powershell
   cd frontend
   ```
3. Ab frontend server start karne ke liye likhein:
   ```powershell
   npm run dev
   ```
4. Screen par ek URL aayega (jaise `http://localhost:5173`). Us par **Ctrl + Click** karein. Aapka Dashboard browser mein khul jayega!

---

## 🟢 Step 4: Demo Testing (How to present to your team)

Jab Dashboard open ho jaye, tab apne team members ko aise impress karein:

1. **Map Demo**: Left side mein diye gaye Map par "Toggle Satellite" par click karke ESRI High-Res Satellite view dikhayein.
2. **Search Demo**: Upar Search bar mein in teen mein se koi bhi ek 14-digit Bhu-Aadhar ID daalein aur `Enter` dabayein:
   - `14029857364101` (Safe Plot, Low Risk)
   - `14029857364102` (Medium Risk, Metro Expansion)
   - `14029857364103` (High Risk, Active Court Case)
3. **AI Voice Agent Demo**: Bottom-right mein jo "Bhoomi Mitra AI" ka Floating Button hai, uspe click karein.
   - Text input mein likhein: *"Plot ka risk status kya hai?"*
   - Ya Mic icon par click karke Hindi mein bolein: *"Bhaiya, is zameen ka mutation hone mein kitna time lagega?"*
   - Agent ekdum natural Hindi aawaz (Edge TTS) mein jawaab dega!

> [!TIP]
> Agar presentation dete waqt aawaz na aaye (due to no internet), toh AI automatically browser ki robotic aawaz par fallback kar jayega, isliye apka demo fail nahi hoga!
