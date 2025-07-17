# AI Assistant Rules for ADHiDe Application

This document outlines the technical stack and guidelines for developing the ADHiDe application.

## Tech Stack Overview

*   **Frontend Framework**: React (version 18.x) for building the user interface.
*   **Language**: TypeScript for type safety and improved developer experience.
*   **Build Tool**: Vite for a fast development server and optimized builds.
*   **Styling**: Tailwind CSS for utility-first CSS, enabling rapid and consistent UI development.
*   **Icons**: Lucide React for a comprehensive set of customizable SVG icons.
*   **UI Components**: Shadcn/ui (built on Radix UI) is the preferred library for pre-built, accessible UI components.
*   **Routing**: React Router for declarative navigation within the single-page application.
*   **State Management**: React's Context API (`AppContext`) and `useState` for application-wide and component-specific state, respectively.
*   **Data Persistence**: Custom `useLocalStorage` hook for client-side data storage.

## Library Usage Guidelines

*   **UI Components**:
    *   **Primary Choice**: Always prioritize using components from `shadcn/ui` for common UI elements (e.g., buttons, forms, modals).
    *   **Custom Components**: If a required component is not available in `shadcn/ui` or needs significant custom logic/styling, create a new, dedicated component file in `src/components/`. These custom components should be styled exclusively with Tailwind CSS.
*   **Icons**: Use `lucide-react` for all icon needs. Import specific icons as needed.
*   **Styling**: All styling must be done using Tailwind CSS classes. Avoid inline styles or separate CSS files unless absolutely necessary for global overrides (e.g., `src/index.css`).
*   **Routing**: Implement and manage application routes using `react-router-dom`. All main routes should be defined in `src/App.tsx`.
*   **State Management**:
    *   For global application state (user data, habits, missions, etc.), use the `AppContext` in `src/contexts/AppContext.tsx`.
    *   For component-local state, use React's `useState` hook.
    *   For persistent client-side data, leverage the `useLocalStorage` hook.
*   **Date & Time**: Use native JavaScript `Date` objects for handling dates and times. No external date libraries are currently in use or required.
*   **Utility Functions**: Create small, focused utility files (e.g., `src/utils/`) for reusable logic that doesn't belong in components or hooks.