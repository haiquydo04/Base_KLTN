# 📋 BACKEND API ENDPOINTS REPORT

> **Project:** Dating App Backend
> **Generated:** Auto-generated from codebase analysis
> **Total Endpoints:** ~50

---

## 📊 SUMMARY

| Category | Count |
|----------|-------|
| Auth | 12 |
| User | 5 |
| Match | 6 |
| Message | 4 |
| Profile | 6 |
| Discovery | 2 |
| Interest/Tags | 5 |
| Safety (Report/Block) | 5 |
| Admin | 14 |
| Health | 1 |
| **TOTAL** | **~60** |

---

## 🔐 AUTH ENDPOINTS (`/api/auth`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| POST | `/auth/register` | `register.controller.js` | User | ❌ | Register new user |
| POST | `/auth/register-json` | `register.controller.js` | User | ❌ | Register (JSON format) |
| POST | `/auth/login` | `login.controller.js` | User | ❌ | Login with email/password |
| GET | `/auth/google` | passport | - | ❌ | Google OAuth initiation |
| GET | `/auth/google/callback` | passport | User | ❌ | Google OAuth callback |
| GET | `/auth/facebook` | passport | - | ❌ | Facebook OAuth initiation |
| GET | `/auth/facebook/callback` | passport | User | ❌ | Facebook OAuth callback |
| POST | `/auth/google-login` | `googleLogin.controller.js` | User | ❌ | Google token login |
| GET | `/auth/me` | `me.controller.js` | User | ✅ | Get current user info |
| POST | `/auth/logout` | `logout.controller.js` | - | ✅ | Logout user |
| POST | `/auth/forgot-password` | `forgotPassword.controller.js` | User | ❌ | Request password reset OTP |
| POST | `/auth/verify-otp` | `verifyOTP.controller.js` | User | ❌ | Verify OTP code |
| POST | `/auth/reset-password` | `resetPassword.controller.js` | User | ❌ | Reset password with OTP |
| POST | `/auth/link-facebook` | `linkSocial.controller.js` | User | ✅ | Link Facebook account |
| POST | `/auth/link-google` | `linkSocial.controller.js` | User | ✅ | Link Google account |

---

## 👤 USER ENDPOINTS (`/api/users`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| GET | `/users` | `getUsers.controller.js` | User | ✅ | Get paginated users list |
| GET | `/users/:id` | `getUserById.controller.js` | User | ✅ | Get user by ID |
| GET | `/users/recommendations` | `getRecommendedUsers.controller.js` | User | ✅ | Get AI recommendations |
| GET | `/users/matches` | `getUserMatches.controller.js` | User, Match | ✅ | Get user's matches |
| PUT | `/users/profile` | `updateProfile.controller.js` | User | ✅ | Update user profile |

---

## 💗 MATCH ENDPOINTS (`/api/match`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| POST | `/match/like` | `likeUser.controller.js` | User, Swipe | ✅ | Like a user (PB09) |
| POST | `/match/pass` | `passUser.controller.js` | User, Swipe | ✅ | Pass a user (PB09) |
| GET | `/match/likes` | `getLikes.controller.js` | Swipe | ✅ | Get users who liked me |
| GET | `/match/mutual` | `getMutualLikes.controller.js` | Swipe | ✅ | Get mutual likes |
| GET | `/match/swipes` | `getSwipeHistory.controller.js` | Swipe | ✅ | Get swipe history |
| DELETE | `/match/:matchId` | `unmatch.controller.js` | Match | ✅ | Unmatch with user |

---

## 💬 MESSAGE ENDPOINTS (`/api/messages`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| GET | `/messages/conversations` | `getConversations.controller.js` | Conversation | ✅ | Get all conversations |
| GET | `/messages/:matchId` | `getMessages.controller.js` | Message | ✅ | Get messages for a match |
| POST | `/messages/:matchId` | `sendMessage.controller.js` | Message | ✅ | Send message |
| PUT | `/messages/:matchId/read` | `markAsRead.controller.js` | Message | ✅ | Mark messages as read |

---

## 👤 Profile ENDPOINTS (`/api/profile`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| GET | `/profile` | `userProfile.controller.js` | UserProfile | ✅ | Get my profile (PB06) |
| PUT | `/profile` | `userProfile.controller.js` | UserProfile | ✅ | Create/Update profile (PB06) |
| GET | `/profile/stats` | `profileStats.controller.js` | User | ✅ | Get profile stats |

---

## 📋 PROFILE V1 ENDPOINTS (`/api/v1/profiles`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| GET | `/v1/profiles/stats` | `profileStats.controller.js` | User | ✅ | Get profile stats v1 |
| GET | `/v1/profiles/:userId` | `profile.controller.js` | User | ✅ | Get basic profile info |
| GET | `/v1/profiles/:userId/full` | `profile.controller.js` | User, Match | ✅ | Get full profile detail |

---

## 📍 DISCOVERY ENDPOINTS (`/api`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| POST | `/update-location` | `discovery.controller.js` | User | ✅ | Update user location |
| GET | `/discovery` | `discovery.controller.js` | User | ✅ | Get nearby users |

---

## 🏷️ INTEREST/TAG ENDPOINTS (`/api`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| GET | `/tags` | `interest.controller.js` | Tag | ❌ | Get popular tags (PB07) |
| GET | `/users/interests` | `interest.controller.js` | Tag, UserTag | ✅ | Get my interests |
| POST | `/users/interests` | `interest.controller.js` | Tag, UserTag | ✅ | Update interests (PB07) |
| POST | `/users/interests/add` | `interest.controller.js` | Tag, UserTag | ✅ | Add single interest |
| DELETE | `/users/interests/:tagId` | `interest.controller.js` | Tag, UserTag | ✅ | Remove interest |

---

## 🛡️ SAFETY ENDPOINTS (`/api`)

| Method | Endpoint | Controller | Model | Auth | Description |
|--------|----------|------------|-------|------|-------------|
| GET | `/report/reasons` | `safety.controller.js` | - | ❌ | Get report reasons |
| POST | `/report` | `safety.controller.js` | Report | ✅ | Create a report |
| POST | `/block` | `safety.controller.js` | Block | ✅ | Block a user |
| GET | `/block` | `safety.controller.js` | Block | ✅ | Get blocked users |
| DELETE | `/block/:targetId` | `safety.controller.js` | Block | ✅ | Unblock user |

---

## 🔧 ADMIN ENDPOINTS (`/api/admin`)

### Auth
| Method | Endpoint | Controller | Auth | Description |
|--------|----------|------------|------|-------------|
| POST | `/admin/login` | `adminAuth.controller.js` | ❌ | Admin login |
| GET | `/admin/me` | middleware | ✅ | Get admin info |

### User Management
| Method | Endpoint | Controller | Auth | Description |
|--------|----------|------------|------|-------------|
| GET | `/admin/users` | `adminUserController.js` | ✅ | Get all users (PB19) |
| PUT | `/admin/users/:id/status` | `adminUserController.js` | ✅ | Toggle user status (PB19) |
| PUT | `/admin/users/:id/role` | `adminUserController.js` | ✅ | Update user role (PB19) |

### Categories (PB20)
| Method | Endpoint | Controller | Auth | Description |
|--------|----------|------------|------|-------------|
| GET | `/admin/categories` | `adminCategoryController.js` | ✅ | Get categories |
| POST | `/admin/categories` | `adminCategoryController.js` | ✅ | Add category |
| PUT | `/admin/categories/:id` | `adminCategoryController.js` | ✅ | Update category |
| DELETE | `/admin/categories/:id` | `adminCategoryController.js` | ✅ | Delete category |
| PUT | `/admin/categories/:id/status` | `adminCategoryController.js` | ✅ | Toggle category status |

### Dashboard (PB18)
| Method | Endpoint | Controller | Auth | Description |
|--------|----------|------------|------|-------------|
| GET | `/admin/dashboard/stats` | `adminDashboardController.js` | ✅ | Dashboard statistics |
| GET | `/admin/dashboard/growth` | `adminDashboardController.js` | ✅ | User growth data |
| GET | `/admin/dashboard/gender` | `adminDashboardController.js` | ✅ | Gender distribution |
| GET | `/admin/dashboard/recent-users` | `adminDashboardController.js` | ✅ | Recent users list |

---

## 🗄️ DATABASE MODELS

| Model | Collection | Schema Fields |
|-------|------------|---------------|
| User | users | username, email, passwordHash, facebookId, googleId, loginMethod, fullName, age, gender, bio, avatar, photos, interests, **location (GeoJSON)**, locationText, occupation, education, height, drinking, smoking, lookingFor, preferences, isOnline, lastSeen, role, isLocked, otpCode, isEmailVerified, kycStatus, isFake, fakeScore, status, profileCompletion |
| Match | matches | user1Id, user2Id, users[], matchedAt, lastActivity, isActive |
| Message | messages | conversationId, matchId, senderId, sender[], content, mediaUrl, image[], status, isRead, messageType |
| Swipe | swipes | swiperId, swipedId, action (like/pass) |
| Conversation | conversations | type, name, avatar, matchId |
| ConversationMember | conversationmembers | conversationId, userId, role, joinedAt, unreadCount, lastReadAt |
| Tag | tags | name, category, status, description, icon, usageCount |
| UserTag | usertags | userId, tagId |
| Report | reports | reporterId, targetId, reason, description, evidence[], status, adminNotes, reviewedBy, reviewedAt |
| Block | blocks | userId, blockedId, reason |
| Role | roles | name, description, permissions[] |
| UserRole | userroles | userId, roleId |
| VideoCall | videocalls | callerId, receiverId, startedAt, endedAt, duration, matchRequested, matchAccepted, status |
| VideoSession | videosessions | participants[], sessionType, status, startedAt, endedAt, duration |
| SavedFilter | savedfilters | userId, filterName, filterCriteria |
| AdminLog | adminlogs | adminId, action, targetId, description, deviceInfo |

---

## ⚠️ IMPORTANT NOTES

### 1. Location Field Format (IMPORTANT)
The `User.location` field uses **GeoJSON format**:
```javascript
{
  type: 'Point',
  coordinates: [longitude, latitude]  // [lng, lat] NOT [lat, lng]
}
```

**❌ WRONG (old seed):**
```javascript
location: 'Ha Noi'  // String - will cause 2dsphere index error!
```

**✅ CORRECT (new seed):**
```javascript
location: {
  type: 'Point',
  coordinates: [105.8542, 21.0285]  // GeoJSON [longitude, latitude]
}
```

### 2. Authentication
- Most endpoints require JWT token in header:
  ```
  Authorization: Bearer <token>
  ```
- Admin endpoints require both `authenticate` AND `authorizeAdmin` middleware

### 3. Common Response Format
```javascript
{
  success: true,
  data: { ... },
  message: 'Success message'
}
// or
{
  success: false,
  message: 'Error message'
}
```

---

## 🧪 TESTING

### Run Tests
```bash
cd backend
node test_endpoints.js
```

### Run Seed
```bash
cd backend
node seed_data.js
```

### Test User Credentials
```
Password: password123
Email: See seed output for generated emails
```

---

## 📁 FILE STRUCTURE

```
backend/
├── src/
│   ├── controllers/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── discovery/
│   │   ├── interest/
│   │   ├── match/
│   │   ├── message/
│   │   ├── profile/
│   │   ├── safety/
│   │   └── user/
│   ├── models/
│   │   ├── User.js
│   │   ├── Match.js
│   │   ├── Message.js
│   │   ├── Swipe.js
│   │   ├── Tag.js
│   │   ├── UserTag.js
│   │   ├── Report.js
│   │   ├── Block.js
│   │   ├── Conversation.js
│   │   ├── VideoCall.js
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── discovery.routes.js
│   │   ├── interest.routes.js
│   │   └── safety.routes.js
│   ├── services/
│   ├── middleware/
│   └── utils/
├── test_endpoints.js    ← NEW: Auto test all endpoints
└── seed_data.js         ← NEW: Seed with correct schema
```

---

## 🔍 ENDPOINT ISSUES TO WATCH

| Issue | Endpoint | Cause | Solution |
|-------|----------|-------|----------|
| Location string | `seed.js` | Old seed uses string instead of GeoJSON | Use `seed_data.js` instead |
| Empty arrays | Various | No seed data | Run `node seed_data.js` |
| 2dsphere index | Discovery | Missing 2dsphere index | MongoDB auto-creates from schema |
| Auth failures | Protected routes | Missing/invalid JWT | Login first, copy token |

---

*Report auto-generated - Last updated: Auto*
