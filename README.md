# Student360

Student360 is a unified, premium full-stack university services hub designed to bring academic management, interactive AI guidance, and mental wellness support together in a single, cohesive dashboard.

---

## Problem Statement
University students face a fragmented digital experience. Academic records, attendance calculators, class recovery calculators, assignment tracking, grievance portals, placement cells, and student welfare support are scattered across legacy, outdated systems. 
This lack of centralization leads to:
*   Missed assignment deadlines and low attendance warnings.
*   Delayed resolution of complaints (hostel, facility, accounts).
*   Ineffective career preparation and low resume compatibility scores.
*   Academic stress and lack of easily accessible mental health guidance.

---

## Project Description
**Student360** resolves this fragmentation by building a modern, glassmorphic, and high-performance React hub. Features include:
1.  **AI Assistant (Glena)**: A persistent, intelligent sidebar chat assistant that answers student questions regarding course outlines, scholarship applications, and campus timings.
2.  **Attendance Tracker & Predictor**: Interactive circular dashboard progress bars, detailed class records, and an attendance recovery calculator showing the exact number of consecutive classes a student must attend to reach target percentages.
3.  **Assignment Hub**: A central feed displaying pending work, grades, and AI-generated study recommendations.
4.  **Lodge Grievance Portal**: A real-time complaint ticket logging system with attachments, categorized routes (Hostel, Academics, Finance), and department assignment tracking.
5.  **Serenity Page (Mental Wellness)**: A calming space featuring high-performance WebGL particle backgrounds (using React Bits + `ogl`) and a comforting mental health bot to help students manage stress.
6.  **ATS Resume Builder**: An interactive ATS-friendly builder with an integrated AI reviewer that scores resumes against target job descriptions.

---

## Google AI Usage

### Tools / Models Used
*   **Gemma 4 (gemma4:e2b)** local inference via Ollama.
*   **Gemini API** / Google AI Studio models.

### Tech Stack Used
*   **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts, OGL (WebGL)
*   **Backend**: Node.js, Express, Socket.io, JWT Authentication
*   **Database**: MongoDB / Mongoose (with a fallback to a fully operational In-Memory DB if MongoDB is unavailable)

### How Google AI Was Used
1.  **Glena Assistant Chatbot**: Powers semantic parsing of campus questions, mapping them against student profiles (academic departments, current grades) to give tailored guidance.
2.  **Resume ATS Optimizer**: Evaluates uploaded resume texts against job requirements, returning match scores, core strengths, skill gaps, and custom AI recommendations.
3.  **Mental Health Support Bot**: Utilizes prompt structures to provide box breathing, cognitive reframing, and local welfare escalations.

---

## GitHub Repo Link of the Project
[Link of the GitHub Repository](https://github.com/aswind/student360)

---

## Proof of Google AI Usage
Documentation, API calls, and console proofs are included in the `/proofs` directory.

---

## Screenshots
Screenshots of the glassmorphic dashboard, attendance calculators, and AI interfaces are placed in the `/screenshots` directory.

---

## Demo Video
Upload your demo video to Google Drive and paste the shareable link here:  
[Watch Demo Video](https://drive.google.com/drive/folders/your-folder-id) *(max 3 minutes)*

---

## Installation Steps

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/) (Optional - falls back to In-Memory DB automatically)
*   [Ollama](https://ollama.com/) (Optional - runs mock AI engine if Ollama is not active on port 11434)

### Setup & Run
1.  Clone the repository:
    ```bash
    git clone https://github.com/aswind/student360.git
    cd student360
    ```

2.  Install dependencies for both frontend and backend concurrently:
    ```bash
    npm run install-all
    ```

3.  Configure environment files (A pre-configured `.env` is provided in the root directory):
    ```bash
    # Root .env contains:
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/campusone
    OLLAMA_BASE_URL=http://localhost:11434
    GEMMA_MODEL=gemma4:e2b
    ```

4.  Start the project:
    ```bash
    npm run dev
    ```
    *(Starts the Node server on port 5000 and Vite client on port 5173 concurrently.)*
