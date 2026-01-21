> ⚠️ IMPORTANT: Before building, replace app/google-services.json with your actual Firebase config. See Setup Instructions below.

**Group No:** 15

**Group Members:**
- EG/2022/4975 — Chathuranga H.A.G.
- EG/2022/5069 — Herath N.L.

## Overview

Enigma is a modern Android chat app built with Kotlin and Jetpack Compose. It uses Firebase for real-time messaging, authentication, storage, and push notifications. It also includes an AI assistant powered by Google Gemini for smart, context-aware replies. Media uploads use Cloudinary for fast, reliable delivery.

## Features

### Implemented

1. Authentication
  - Email/password sign up and login
  - Google Sign-In
  - Phone number + OTP verification
  - Password reset

2. Real-time Chat
  - 1:1 messaging with Firestore sync
  - Message status: sending, sent, delivered, read
  - Unread counts per chat
  - Typing indicators
  - Reply to message, soft delete
  - Reactions (emoji per message)

3. Group Chat
  - Create groups with multiple participants
  - Add/remove members
  - Group name and photo

4. AI Assistant (Gemini)
  - Dedicated AI chat with Enigma AI
  - Context-aware responses (recent history)
  - Configurable model settings

5. Stories (Status)
  - Post image stories (24-hour visibility)
  - View contacts’ recent stories
  - Reactions and view count

6. Media & Voice
  - Image/file sharing (Cloudinary uploads)
  - Voice message recording and duration
  - Speech-to-text input

7. Profiles & People
  - Edit profile: name, bio/status, photo
  - Search users by name/email/phone
  - Block/unblock users
  - Online presence and last seen

8. Notifications
  - Firebase Cloud Messaging (FCM)
  - New message notifications
  - Call-style notifications (audio/video UI)

9. UI/UX
  - Material Design 3 + Compose
  - Light/Dark/System theme
  - Dynamic color on Android 12+

## Tech Stack

- Language: Kotlin
- UI: Jetpack Compose (Material3)
- Architecture: MVVM + repositories
- DI: Hilt
- Backend: Firebase Auth, Firestore, Storage, FCM
- AI: Google Gemini 1.5 Flash via Retrofit
- Media: Cloudinary REST uploads
- Images: Coil
- Async: Coroutines + Flow
- Preferences: DataStore
- Navigation: Navigation Compose

## Setup Instructions

### Prerequisites

- Android Studio (2023.1.1 Hedgehog or later)
- JDK 11+
- Android SDK API 24+
- Firebase project
- Cloudinary account (for media)
- Gemini API key (Google AI Studio)

### 1) Clone

```bash
git clone <repository-url>
cd Enigma
```

### 2) Firebase

1. Create a project in Firebase Console.
2. Add Android app:
  - Package: com.example.enigma
  - Add SHA-1 for Google Sign-In if needed.
3. Download google-services.json and place it under app/.
4. Enable services:
  - Authentication: Email/Password, Google, Phone
  - Firestore Database
  - Cloud Storage
  - Cloud Messaging

Recommended Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
   match /users/{userId} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && request.auth.uid == userId;
   }
   match /chats/{chatId} {
    allow read, update, delete: if request.auth != null && request.auth.uid in resource.data.participantIds;
    allow create: if request.auth != null && request.auth.uid in request.resource.data.participantIds;
   }
   match /messages/{messageId} {
    allow read, create, update, delete: if request.auth != null;
   }
   match /stories/{storyId} {
    allow read, create, update, delete: if request.auth != null;
   }
  }
}
```

Storage rules (10MB max):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
   match /{allPaths=**} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
   }
  }
}
```

### 3) Cloudinary

1. Create a Cloudinary account.
2. Create an unsigned upload preset (e.g., `chat_images`).
3. Update constants in code:
  - CLOUD_NAME and UPLOAD_PRESET in [app/src/main/java/com/example/enigma/utils/Constants.kt](app/src/main/java/com/example/enigma/utils/Constants.kt)

### 4) Gemini API Key

1. Get a free key from Google AI Studio: https://aistudio.google.com/app/apikey
2. Set your key in [app/src/main/java/com/example/enigma/utils/Constants.kt](app/src/main/java/com/example/enigma/utils/Constants.kt) → `AI_API_KEY`.
  - Do not commit real keys to public repos.

### 5) Build & Run

1. Open the project in Android Studio.
2. Let Gradle sync; ensure `compileSdk` 36 and `jvmTarget` 11 match your setup.
3. Run on a device/emulator.

## Project Structure

```
app/
├── src/main/
│   ├── java/com/example/enigma/
│   │   ├── data/{local,model,remote,repository}
│   │   ├── di/{FirebaseModule,NetworkModule}
│   │   ├── navigation/{Screen,NavGraph}
│   │   ├── services/EnigmaFirebaseMessagingService.kt
│   │   ├── ui/{auth,chat,call,profile,settings,status,theme}
│   │   ├── utils/{Constants,CloudinaryHelper,NotificationHelper,VoiceRecorder,SpeechToTextHelper}
│   │   ├── EnigmaApplication.kt
│   │   └── MainActivity.kt
│   └── res/
```

## Usage

- Create account via Email/Google/Phone.
- Start chats from New Chat; create group chats.
- Long-press mic to record voice; use image/file picker.
- Open AI chat to talk to Enigma AI.
- Post/view Stories from Status.
- Manage theme and settings under Settings.

## Troubleshooting

- Google Services error: ensure app/google-services.json exists.
- Firebase failures: verify console setup and rules.
- Media uploads failing: check Cloudinary preset/name.
- AI not responding: verify Gemini API key.

## Roadmap

- End-to-end encryption
- Peer-to-peer calls (WebRTC)
- Backup/restore
- Message forwarding and scheduling
- Multi-language support

## Dependencies

See gradle/libs.versions.toml for complete list.

Key versions:
- Compose BOM
- Firebase BOM
- Hilt
- Retrofit/OkHttp
- Coil
- Kotlin

## Acknowledgments

- Firebase, Google AI Studio (Gemini)
- Cloudinary
- Jetpack Compose + Material Design

— Developed by Group 15 (Academic Project)
