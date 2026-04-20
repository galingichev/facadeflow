# FacadeFlow Agent Rules (CRITICAL)

## Architecture Rules
- This project uses Expo Router
- ALL screens MUST be inside: app/
- DO NOT create screens inside src/screens/

## Routing Rules
- Projects list screen MUST be:
  app/(tabs)/projects/index.tsx

- Project details:
  app/(tabs)/projects/[id].tsx

## Data Fetching Rule (MANDATORY)
- Every screen that loads data MUST call:

useEffect(() => {
  refresh();
}, []);

## API Rules
- Always use: EXPO_PUBLIC_API_URL
- Never hardcode localhost

## File Editing Rule
- ALWAYS modify existing files if they exist
- NEVER duplicate screens in different folders

## Goal
- Build a working MVP, not perfect architecture
- Prioritize:
  1. Data loading
  2. CRUD working
  3. Navigation working
