# Standalone Wearable Health Monitoring System – Companion App

##  Project Overview

This is a **cross-platform mobile app built with React Native**, designed to act as a companion to a **standalone wearable health monitoring device**. The device independently tracks vital health metrics and triggers emergency alerts, while the app provides an optional interface for caregivers and medical responders.

This project is developed for innovation platforms like **Samsung Solve for Tomorrow India 2025**, with a strong focus on **rural healthcare**, **elderly support**, and **emergency response in low-tech environments**.

---

##  Key Features

-  Real-time health data display (Heart Rate, Temperature, SpO₂, Fall Detection)
-  Emergency alert notifications (auto-triggered by the device)
-  GPS-based location tracking of the user
-  Health history and vitals log
-  Manage emergency contacts for fast communication
-  Push notifications to alert caregivers or family

---

##  Purpose

To create a seamless connection between:
- A **non-tech-savvy user** wearing the health device, and
- Their **family, caregivers, or emergency services**

The app ensures real-time monitoring, rapid alerts, and fast decision-making in case of health anomalies — even in rural or remote areas.

---

##  Target Users

- Elderly people, especially those living alone
- Patients in rural areas without quick access to healthcare
- Family members who want real-time updates
- Emergency responders receiving auto-triggered SOS alerts

---

##  Tech Stack

- **React Native** – Cross-platform app development
- **Firebase** – Realtime database, authentication, notifications
- **Bluetooth/GSM/GPS** – For device communication and emergency location
- **Optional:** Expo – For easier development and testing

---

##  Development Scope

You can begin building parts of the app *before* hardware is ready:
- UI Components (Vitals Dashboard, Emergency Screens, Alert Logs)
- Firebase Authentication & Realtime DB structure
- Push Notification system
- Navigation flow (React Navigation)
- Mock data display for testing

---

##  Folder Structure (As planned)

```plaintext
/components        // Reusable UI parts (charts, alert cards, buttons)
/screens           // Main screens: Dashboard, Alerts, Profile, Settings
/services          // Firebase integration, device communication modules
/assets            // Icons, fonts, placeholder images
