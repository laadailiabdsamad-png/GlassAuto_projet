# GlassAuto Express HR: mobile frontend

React Native (Expo) application for leave management, HR document requests and absence justification.
Frontend only: all data is fictional and every operation is simulated in memory by mock services. The interface is in French.

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | 22.13 or later (LTS 24 recommended) |
| Expo Go | SDK 58 (current App Store and Play Store version) |

## Install and launch

Unzip the project into a short path such as `C:\dev` (Windows limits long paths), then run:

```bash
cd glassauto-frontend
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS). The phone and the computer must be on the same network. If they are not, use:

```bash
npx expo start --tunnel
```

Direct launch on an emulator or simulator:

```bash
npx expo start --android
npx expo start --ios
```

After changing `tailwind.config.js` or `global.css`, clear the cache:

```bash
npx expo start --clear
```

## Verify the build

```bash
npx expo-doctor
npx expo export --platform android
npx expo export --platform ios
```

## Demo accounts

Tap a profile on the login screen, or sign in with the shared password `demo2026`. You can switch profile at any time from **Mon profil > Changer de profil de démonstration**; data entered during the session is kept.

| Role | Person | E-mail |
| --- | --- | --- |
| Collaborateur | Yassine Berrada | y.berrada@glassauto.demo |
| Responsable de centre | Salma Idrissi | s.idrissi@glassauto.demo |
| Responsable technique | Mehdi Ouazzani | m.ouazzani@glassauto.demo |
| Service RH | Nadia Bennis | n.bennis@glassauto.demo |

Authentication is simulated. It provides no real security and must be replaced by the backend.

## Suggested live demonstration

1. **Collaborateur**: request a leave on the planned period (allowed), then try a date less than 20 days away outside the plan (blocked with an alert).
2. **Responsable de centre**: open the request, pick a local substitute and approve. Then open the request of Anas El Fassi: no local substitute exists, so transfer it.
3. **Responsable technique**: search the 31 centres, select a substitute and notify the manager.
4. **Responsable de centre**: confirm the technical answer.
5. **Service RH**: approve. The balance is deducted and the employee is notified.
6. **Service RH > Documents**: mark a document ready for pickup. The employee receives the pickup notification.
7. **Service RH > Absences**: review a justification and open the payroll check.

**Mon profil > Paramètres > Réinitialiser les données** restores the initial dataset.

## Business rules implemented

- Leave workflow: employee, centre manager, technical manager when no local substitute exists, HR.
- A substitute must have the same job, must not be on leave and must not already be replacing someone.
- A request outside the submitted annual plan needs 20 days of notice.
- Managers' own leaves, and requests whose manager is unavailable, go straight to HR.
- The balance is deducted only on final HR approval, and only for annual leave.
- Working days exclude Sundays and fixed-date Moroccan national holidays. Religious holidays with variable dates are not included.
- Documents are collected in person at the HR office. There is no download.
- Absence justifications concern past dates only and feed the payroll check.

## Project structure

```
glassauto-frontend/
  App.js
  app.json, babel.config.js, metro.config.js, tailwind.config.js, global.css
  assets/
  src/
    api/          Axios client, endpoints, configuration
    components/   ui, charts, calendar, domain
    context/      data, authentication, preferences, feedback
    data/         fictional dataset (220 employees, 31 centres)
    hooks/
    navigation/   one navigator per role
    screens/      auth, collaborator, manager, technical, hr, shared
    services/     mock and http implementations with the same interface
    theme/        brand palette and fonts
    utils/        dates, leave rules, substitution, workflow, analytics
```

## Connecting a backend later

Screens never call a mock directly. `src/services/index.js` selects the implementation:

- no `EXPO_PUBLIC_API_URL`: mock services
- `EXPO_PUBLIC_API_URL` defined: Axios services from `src/services/http`

Copy `.env.example` to `.env`, set the URL and adapt `src/api/endpoints.js`. Record fields follow the report's data model (`id_demande`, `validation_respo`, `solde_reste`, `is_ready_for_pickup`, and so on).

## Technical stack

Expo SDK 58, React Native 0.88, React 19.3, JavaScript, NativeWind 4.2, Tailwind CSS 3.4, React Navigation 7, React Context API, Axios, Reanimated 4, react-native-calendars, react-native-gifted-charts, react-native-svg.
