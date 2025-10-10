# The GoodAds 📢

**The GoodAds** is a full-stack, collaborative platform designed to seamlessly connect businesses with creative professionals ("society members"). It provides a comprehensive suite of tools for posting projects, managing proposals, tracking progress with milestones, and communicating in real-time.

This repository contains the complete monorepo, including the Next.js frontend and the FastAPI backend.

## ✨ Key Features

* **👥 Dual User Roles** : Separate, feature-rich dashboards for **Businesses** (to post projects and manage freelancers) and **Society Members** (to find work and showcase portfolios).
* **🛒 Project Marketplace** : Businesses can post project requirements, and society members can browse and submit detailed proposals.
* **🎯 Milestone & Task Tracking** : A robust system for defining project milestones and tracking individual task completion, ensuring clarity and accountability for both parties.
* **💬 Real-Time Chat** : Integrated chat functionality for direct and instant communication between businesses and the creators they hire.
* **🔒 Secure Authentication** : Built with Supabase for secure and reliable user authentication and management.
* **💅 Modern UI** : A sleek, responsive, and user-friendly interface built with Next.js, TypeScript, and shadcn/ui.

## 🛠️ Tech Stack

The project is a monorepo divided into a `client` (frontend) and a `server` (backend).

| **Area**            | **Technology**                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend**        | **Next.js** , **React** , **TypeScript** , **Tailwind CSS** , **shadcn/ui** ,**Zustand**(State Management),**React Hook Form** |
| **Backend**         | **Python** , **FastAPI** ,**Uvicorn**(ASGI Server)                                                                                                     |
| **Database & Auth** | **Supabase**(PostgreSQL Database, Authentication, Storage)                                                                                                         |
| **Deployment**      | **Docker** ,**GitHub Actions**(CI/CD)                                                                                                                        |

## 📂 Project Structure

The repository is structured as a monorepo with two main packages:

```
└── shopnobanerjee-the-good-ads/
    ├── .github/              # GitHub Actions CI/CD workflows
    ├── client/               # Next.js 14+ frontend application
    │   ├── app/              # App Router, components, and pages
    │   ├── components/       # Shared UI components (powered by shadcn/ui)
    │   ├── lib/              # Utility functions and Supabase client
    │   └── ...
    ├── server/               # FastAPI backend application
    │   ├── app/              # Main application source code
    │   │   ├── api/          # API endpoint logic
    │   │   ├── core/         # Configuration and security
    │   │   ├── models/       # Database models
    │   │   └── services/     # Business logic and external services
    │   └── Dockerfile        # Docker configuration for the server
    └── README.md             # You are here!

```

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

* **Node.js** (v18 or higher)
* **Python** (v3.10 or higher) & `pip`
* **Git**
* **Docker** (optional, for running the backend in a container)
* A **Supabase** project for your database and authentication keys.

### Installation & Setup

1. **Clone the repository:**
   ```
   git clone [https://github.com/shopnobanerjee/the-good-ads.git](https://github.com/shopnobanerjee/the-good-ads.git)
   cd the-good-ads

   ```
2. **Set up the Backend (`server`):**
   * Navigate to the server directory:
     ```
     cd server

     ```
   * Create a virtual environment and activate it:
     ```
     python -m venv venv
     source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

     ```
   * Install the required Python packages:
     ```
     pip install -r requirements.txt

     ```
   * Set up environment variables. Copy the example file:
     ```
     cp .env.example .env

     ```
   * Populate the `.env` file with your Supabase project URL, anon key, and service role key.
3. **Set up the Frontend (`client`):**
   * Navigate to the client directory from the root:
     ```
     cd ../client

     ```
   * Install the required npm packages:
     ```
     npm install

     ```
   * Set up environment variables. Copy the example file:
     ```
     cp .env.example .env.local

     ```
   * Populate the `.env.local` file with your **public** Supabase URL and anon key.

### Running the Application

You'll need to run both the backend and frontend servers concurrently in separate terminal windows.

1. **Run the Backend Server:**
   * In your terminal, navigate to the `/server` directory and run:
     ```
     uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

     ```
   * The API will be available at `http://localhost:8000`.
2. **Run the Frontend Development Server:**
   * In a new terminal, navigate to the `/client` directory and run:
     ```
     npm run dev

     ```
   * Open your browser and navigate to `http://localhost:3000`.

You should now have the full application running locally! 🎉
