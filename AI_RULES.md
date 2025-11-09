# AI Assistant Rules for Blue Square AI Website

This document outlines the core technologies and specific rules for using libraries within the project. Adhering to these guidelines ensures consistency, maintainability, and alignment with the project's design principles.

## 1. Tech Stack Summary (5-10 points)

*   **Framework:** Next.js (React) with TypeScript.
*   **Styling:** Tailwind CSS for utility-first styling.
*   **UI Components:** Shadcn/ui (built on Radix UI) for all standard components (Buttons, Cards, Dialogs, Forms, etc.).
*   **Routing:** Next.js App Router for page-based routing.
*   **State Management:** React hooks (`useState`, `useContext`) for local and global state (via custom providers).
*   **Forms:** React Hook Form with Zod for schema validation.
*   **Icons:** Lucide-React.
*   **Backend/Database:** Firebase (Firestore, Auth) for data persistence and user management.
*   **AI Integration:** Genkit for defining and running AI flows (e.g., the intelligent chatbot).
*   **Animations:** Custom CSS keyframes (e.g., `fade-in-up`) and `tailwindcss-animate`.

## 2. Library Usage Rules

| Feature / Use Case | Recommended Library / Tool | Specific Rule |
| :--- | :--- | :--- |
| **UI Components** | `shadcn/ui` (e.g., `Button`, `Card`, `Dialog`) | **MUST** be used for all standard UI elements. Do not create custom components if a shadcn/ui equivalent exists. |
| **Styling** | Tailwind CSS | **MUST** be used exclusively for all styling. Prioritize utility classes over custom CSS. |
| **Icons** | `lucide-react` | **MUST** be used for all icons. |
| **Forms & Validation** | `react-hook-form` & `zod` | **MUST** be used for defining form structure, handling submission, and validation. |
| **Data Fetching (Firestore)** | Custom Firebase Hooks (`useCollection`, `useDoc`) | **MUST** be used for real-time data access. Ensure all references/queries are wrapped in `useMemoFirebase`. |
| **Non-Blocking Writes (Firestore)** | Custom Firebase Non-Blocking Functions (`addDocumentNonBlocking`, etc.) | **MUST** be used for all Firestore write operations to prevent blocking the UI. |
| **Toasts/Notifications** | `useToast` hook (from `src/hooks/use-toast.ts`) | **MUST** be used for all user feedback notifications. |
| **Carousels** | `embla-carousel-react` | **MUST** be used for creating carousels/sliders. |
| **Animations** | `src/app/globals.css` utilities (`fade-in-up`, `fade-in`) | Use existing utility classes for scroll-based or page-load animations. |
| **AI Flows** | `genkit` | All AI logic must be defined as a Genkit flow in `src/ai/flows/`. |