# Claude Context - MinhaVez Project

## Critical Requirements

### 🎨 Dark/Light Mode Compatibility
**ALWAYS ensure ALL components support both dark and light modes.**

- Use Tailwind's `dark:` prefix for dark mode styles
- Common patterns:
  - Backgrounds: `bg-white dark:bg-black` or `bg-zinc-50 dark:bg-zinc-900`
  - Text: `text-zinc-900 dark:text-white` or `text-zinc-600 dark:text-zinc-400`
  - Borders: `border-zinc-200 dark:border-zinc-800`
  - Hover states: `hover:bg-zinc-100 dark:hover:bg-zinc-800`

### Theme System
- Theme is managed in localStorage with key `theme`
- Values: `'light'` or `'dark'`
- Applied to `document.documentElement.classList`
- Header component handles theme toggle

### Component Guidelines
- Never create components with only light mode styles
- Always test both light and dark themes
- Sidebar uses: `bg-zinc-950 dark:bg-zinc-950` (always dark)
- Main content uses: `bg-zinc-50 dark:bg-black`

## Project Structure
- Next.js 15.5.4 with App Router
- Supabase for backend
- TypeScript + Tailwind CSS
- Dark mode is the default theme

## UI Style
- Inspired by Supabase/VSCode
- Sidebar expands on hover (no toggle button)
- Header is full-width and fixed at top
- Sidebar starts below header (top-16)
