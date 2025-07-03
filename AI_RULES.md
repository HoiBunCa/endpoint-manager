# AI Rules for Endpoint Manager Application

This document outlines the core technologies and conventions used in the Endpoint Manager application to ensure consistency, maintainability, and efficient development.

## Tech Stack Overview

*   **React**: The primary JavaScript library for building the user interface.
*   **TypeScript**: Used for type safety and improved code quality across the entire codebase.
*   **React Router**: Manages client-side routing and navigation within the single-page application.
*   **Tailwind CSS**: A utility-first CSS framework for rapid and consistent styling.
*   **shadcn/ui**: A collection of reusable UI components built with Radix UI and styled with Tailwind CSS, providing a consistent and accessible design system.
*   **Lucide React**: Provides a comprehensive set of customizable SVG icons for the application.
*   **Leaflet & React-Leaflet**: Libraries for interactive maps, used to display device locations.
*   **Chart.js & React-Chartjs-2**: Used for creating dynamic and interactive data visualizations and charts.
*   **date-fns**: A lightweight library for parsing, validating, manipulating, and formatting dates.
*   **clsx**: A tiny utility for constructing `className` strings conditionally.

## Library Usage Rules

To maintain a clean and efficient codebase, please adhere to the following guidelines when using libraries:

*   **UI Components & Styling**:
    *   **Components**: Prioritize using `shadcn/ui` components for all standard UI elements (buttons, inputs, dialogs, etc.). If a specific `shadcn/ui` component doesn't fit the need, create a new, small, and focused custom component.
    *   **Styling**: All styling must be done using **Tailwind CSS** classes. Avoid writing custom CSS unless absolutely necessary for complex, non-Tailwind-achievable styles.
    *   **Icons**: Primarily use icons from the **Lucide React** library. For specific needs where Lucide React does not offer a suitable icon, or for custom visual elements (e.g., custom buttons with embedded images), other image sources or custom SVG/CSS can be used, ensuring they are optimized for performance and maintain consistency with the overall design.
*   **Routing**:
    *   **Navigation**: Use **React Router** (`react-router-dom`) for all application navigation.
    *   **Route Definitions**: All main application routes should be defined and managed within `src/App.tsx`.
*   **State Management**:
    *   **Local State**: Use React's `useState` and `useReducer` hooks for component-level state.
    *   **Global State**: For application-wide state, utilize React's `Context API` (e.g., `AuthContext`, `NotificationContext`). Avoid external state management libraries unless explicitly approved.
*   **API Communication**:
    *   **Service Layer**: All interactions with the backend API must go through the `apiService` located in `src/services/apiService.ts`. Do not make direct `fetch` or `axios` calls in components.
*   **Mapping**:
    *   **Maps**: Use **Leaflet** and **React-Leaflet** for all map-related functionalities and visualizations.
*   **Charting**:
    *   **Data Visualization**: Use **Chart.js** with its React wrapper, **React-Chartjs-2**, for all data charting requirements.
*   **Date & Time**:
    *   **Formatting/Manipulation**: Use **date-fns** for any date and time formatting, parsing, or manipulation tasks.
*   **Conditional Class Names**:
    *   **Class Utilities**: Use `clsx` for constructing conditional Tailwind CSS class strings.

## Code Structure Guidelines

*   All source code resides in the `src` directory.
*   Application pages are located in `src/pages/`.
*   Reusable UI components are located in `src/components/`.
*   Each new component or hook must be created in its own dedicated file.
*   Components should ideally be 100 lines of code or less. Refactor larger components into smaller, more focused ones.