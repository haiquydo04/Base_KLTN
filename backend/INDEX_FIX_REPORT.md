# MongoDB Index Fix Report - User Schema

**Date:** 2026-03-31
**Project:** LoveAI Dating App
**Status:** ✅ RESOLVED

---

## Problem

**Error:**
```
E11000 duplicate key error collection: dating-app.users index: facebookId_1 dup key: { facebookId: null }
```

**Root Cause:**
- `facebookId` và `googleId` có `default: null` trong schema
- MongoDB unique index không cho phép nhiều documents có cùng giá trị `null`
- Khi nhiều user đăng ký bằng email (không có Facebook/Google), họ đều có `facebookId: null` → **violate unique index**

---

## Solution

### 1. Schema Changes (`backend/src/models/User.js`)

**Before (❌ Problem):**
```javascript
facebookId: {
  type: String,
  sparse: true,
  unique: true,
  default: null  // ❌ Nhiều user sẽ có null = duplicate!
},
googleId: {
  type: String,
  sparse: true,
  unique: true,
  default: null  // ❌ Nhiều user sẽ có null = duplicate!
}
```

**After (✅ Fixed):**
```javascript
// KHÔNG có default: null - field sẽ không tồn tại khi không cần
facebookId: {
  type: String,
  sparse: true
},
googleId: {
  type: String,
  sparse: true
}
```

### 2. Database Index Changes

**Index Type:** `partialFilterExpression` (partial unique index)

**facebookId_1:**
```javascript
{
  facebookId: 1
},
{
  unique: true,
  partialFilterExpression: { facebookId: { $type: "string" } }
}
```

**googleId_1:**
```javascript
{
  googleId: 1
},
{
  unique: true,
  partialFilterExpression: { googleId: { $type: "string" } }
}
```

**How it works:**
- Chỉ index những documents có `facebookId`/`googleId` là **string**
- Documents không có field này (undefined) sẽ **không được index**
- Đảm bảo unique cho các giá trị thực, không conflict với null/undefined

---

## Test Results

| Test | Result | Description |
|------|--------|-------------|
| Create user with null social IDs | ✅ PASS | Nhiều user cùng không có FB/Google |
| Create user with unique facebookId | ✅ PASS | Không bị duplicate |
| Create user with unique googleId | ✅ PASS | Không bị duplicate |
| Insert duplicate facebookId | ✅ PASS | Bị rejected đúng cách |
| Insert duplicate googleId | ✅ PASS | Bị rejected đúng cách |
| Password verification | ✅ PASS | bcrypt hoạt động đúng |

---

## Current Indexes on `users` Collection

| Index Name | Fields | Options |
|------------|--------|---------|
| `_id_` | `_id` | - |
| `email_1` | `email` | unique |
| `username_text` | `_fts:text` | text search |
| `location_2dsphere` | `location` | 2dsphere geospatial |
| `username_1` | `username` | unique |
| `facebookId_1` | `facebookId` | **unique, partial (string only)** |
| `googleId_1` | `googleId` | **unique, partial (string only)** |

---

## Passport Strategy (Google/Facebook OAuth)

**Location:** `backend/src/config/passport.js`

**Features:**
1. ✅ Kiểm tra `profile.id` trước khi sử dụng
2. ✅ Kiểm tra email có giá trị
3. ✅ Merge account nếu email đã tồn tại
4. ✅ Tạo user mới với social ID
5. ✅ Xử lý lỗi đúng cách

**Flow:**
```
Google OAuth → Check googleId exists → If yes, login
                                  → If no, check email exists → Link googleId to existing user
                                                            → If no, create new user
```

---

## Auth Service (socialLogin)

**Location:** `backend/src/services/auth.service.js`

**Features:**
1. ✅ Tìm user theo social ID
2. ✅ Merge account nếu email đã tồn tại
3. ✅ Tạo safe username
4. ✅ Xử lý null values không gây crash

---

## Next Steps

1. ✅ Schema đã được fix
2. ✅ Database indexes đã được fix
3. ✅ Passport strategy đã được kiểm tra
4. ✅ Tests đều passed

**Backend có thể restart và hoạt động bình thường.**

---

## Files Modified

| File | Change |
|------|--------|
| `backend/src/models/User.js` | Removed `default: null` từ facebookId/googleId |
| MongoDB `users` collection | Dropped old indexes, created partial unique indexes |

---

## Verification Commands

```bash
# Check indexes in MongoDB shell
db.users.getIndexes()

# Should show:
# - facebookId_1: { unique: true, partialFilterExpression: { facebookId: { $type: "string" } } }
# - googleId_1: { unique: true, partialFilterExpression: { googleId: { $type: "string" } } }
```
