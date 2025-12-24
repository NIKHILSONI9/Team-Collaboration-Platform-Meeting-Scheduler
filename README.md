


# AI Meeting Scheduler

An AI-powered meeting scheduling platform that allows multiple users to collaborate in real-time, chat, and automatically schedule meetings using AI-based intent detection.  
This project has a **Python (Flask)** backend and a **React.js** frontend.

---

## 🚀 Features
- **Group Chat** with multi-user support
- **AI Meeting Scheduling** based on conversation context
- **Calendar View** for easy scheduling
- **Email Confirmation** for scheduled meetings
- **Real-Time Communication** (optional Socket.IO integration)
- **Responsive UI** built with React

---

## 📂 Project Structure
```

AI-Meeting-Scheduler/
│
├── backend/                # Flask backend API
│   ├── app.py               # Main Flask server
│   ├── realtime.py          # Optional Socket.IO server
│   ├── requirements.txt     # Backend dependencies
│   └── venv/                # Virtual environment (ignored in Git)
│
├── frontend/               # React.js frontend
│   ├── src/                 # React components & styles
│   ├── public/              # Static files
│   ├── package.json         # Frontend dependencies
│   └── node\_modules/        # Installed dependencies (ignored in Git)
│
└── README.md                # Project documentation

````

---

## 🛠 Installation & Setup

### **For the Backend (Python/Flask)**

1️⃣ Navigate to the backend directory:
```bash
cd backend
````

2️⃣ Activate the virtual environment (if using one):

**On macOS/Linux:**

```bash
source venv/bin/activate
```

**On Windows:**

```bash
venv\Scripts\activate
```

3️⃣ Install dependencies:

```bash
pip install -r requirements.txt
```

4️⃣ Run the Flask backend server:


python app.py
```

Or if using Socket.IO for real-time features:

```bash
python realtime.py
```

---

### **For the Frontend (React)**

1️⃣ Open a **new terminal window/tab** and navigate to the frontend directory:

```bash
cd frontend
```

2️⃣ Install dependencies:

```bash
npm install
```

3️⃣ Start the React development server:

```bash
npm start
```

---

## 💡 Usage

* Open the frontend in your browser (usually at `http://localhost:3000`)
* The backend API runs on `http://localhost:5000` by default
* Chat with multiple users and let the AI automatically detect meeting times

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Nikhil Soni**
[GitHub](https://github.com/NIKHILSONI9)

```

If you want, I can also give you the `.gitignore` content so you don’t accidentally push `venv` and `node_modules` to GitHub. That will keep your repo clean.
```
