# 📊 Project Database Schema - LoveAI (Prisma Format)

Tài liệu này chứa cấu trúc database được trích xuất trực tiếp từ cơ sở dữ liệu thực tế thông qua **Prisma Introspection**. Đây là định dạng chính xác nhất phản ánh các collection và field hiện có trong database.

---

## 🛠️ Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// Kiểu dữ liệu nhúng (Embedded Types)

type AdminlogsMetadata {
  ip String
}

type UsersLocation {
  coordinates Float[]
  type        String
}

type UsersPreferences {
  gender String
  maxAge Int
  minAge Int
}

// Các Model (Collections)

model adminlogs {
  id          String             @id @default(auto()) @map("_id") @db.ObjectId
  v           Int                @map("__v")
  action      String
  adminId     String             @db.ObjectId
  createdAt   DateTime           @db.Date
  description String
  deviceInfo  String
  metadata    AdminlogsMetadata?
  targetId    String?            @db.ObjectId
  updatedAt   DateTime           @db.Date

  @@index([adminId], map: "adminId_1")
  @@index([createdAt(sort: Desc)], map: "createdAt_-1")
  @@index([action], map: "action_1")
}

model blocks {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  /// Field referred in an index, but found no data to define the type.
  blockedId Json?
  /// Field referred in an index, but found no data to define the type.
  createdAt Json?
  /// Field referred in an index, but found no data to define the type.
  userId    Json?

  @@unique([userId, blockedId], map: "userId_1_blockedId_1")
  @@index([userId, createdAt(sort: Desc)], map: "userId_1_createdAt_-1")
  @@index([blockedId], map: "blockedId_1")
}

model conversationmembers {
  id             String @id @default(auto()) @map("_id") @db.ObjectId
  /// Field referred in an index, but found no data to define the type.
  conversationId Json?
  /// Field referred in an index, but found no data to define the type.
  userId         Json?

  @@unique([conversationId, userId], map: "conversationId_1_userId_1")
  @@index([userId], map: "userId_1")
}

model conversations {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  v         Int      @map("__v")
  avatar    String
  createdAt DateTime @db.Date
  matchId   String   @db.ObjectId
  name      String
  type      String
  updatedAt DateTime @db.Date

  @@index([type], map: "type_1")
  @@index([matchId], map: "matchId_1")
}

model matches {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  v            Int      @map("__v")
  createdAt    DateTime @db.Date
  isActive     Boolean
  lastActivity DateTime @db.Date
  matchedAt    DateTime @db.Date
  updatedAt    DateTime @db.Date
  user1Id      String   @db.ObjectId
  user2Id      String   @db.ObjectId
  /// Could not determine type: the field only had null or empty values in the sample set.
  users        Json?

  @@unique([user1Id, user2Id], map: "user1Id_1_user2Id_1")
  @@index([users], map: "users_1")
  @@index([lastActivity(sort: Desc)], map: "lastActivity_-1")
}

model messages {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  v              Int      @map("__v")
  content        String
  conversationId String   @db.ObjectId
  createdAt      DateTime @db.Date
  isRead         Boolean
  matchId        String   @db.ObjectId
  /// Could not determine type: the field only had null or empty values in the sample set.
  mediaUrl       Json?
  messageType    String
  sender         String   @db.ObjectId
  senderId       String   @db.ObjectId
  status         String
  updatedAt      DateTime @db.Date

  @@index([conversationId, createdAt(sort: Desc)], map: "conversationId_1_createdAt_-1")
  @@index([senderId], map: "senderId_1")
  @@index([matchId, createdAt(sort: Desc)], map: "matchId_1_createdAt_-1")
  @@index([senderId, isRead], map: "senderId_1_isRead_1")
}

model reports {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  /// Field referred in an index, but found no data to define the type.
  createdAt  Json?
  /// Field referred in an index, but found no data to define the type.
  reporterId Json?
  /// Field referred in an index, but found no data to define the type.
  status     Json?
  /// Field referred in an index, but found no data to define the type.
  targetId   Json?

  @@unique([reporterId, targetId], map: "reporterId_1_targetId_1")
  @@index([reporterId, createdAt(sort: Desc)], map: "reporterId_1_createdAt_-1")
  @@index([targetId, status], map: "targetId_1_status_1")
  @@index([status, createdAt(sort: Desc)], map: "status_1_createdAt_-1")
}

model roles {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  v           Int      @map("__v")
  createdAt   DateTime @db.Date
  description String
  name        String
  permissions String[]
  updatedAt   DateTime @db.Date

  @@index([name], map: "name_1")
}

model savedfilters {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  /// Field referred in an index, but found no data to define the type.
  userId Json?

  @@index([userId], map: "userId_1")
}

model swipes {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  v         Int      @map("__v")
  action    String
  createdAt DateTime @db.Date
  swipedId  String   @db.ObjectId
  swiperId  String   @db.ObjectId
  updatedAt DateTime @db.Date

  @@unique([swiperId, swipedId], map: "swiperId_1_swipedId_1")
  @@index([swiperId], map: "swiperId_1")
  @@index([swipedId], map: "swipedId_1")
}

model tags {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  v           Int      @map("__v")
  category    String
  createdAt   DateTime @db.Date
  description String
  icon        String
  name        String   @unique(map: "name_1")
  status      String
  updatedAt   DateTime @db.Date
  usageCount  Int

  @@index([category], map: "category_1")
  @@index([usageCount(sort: Desc)], map: "usageCount_-1")
}

model userprofiles {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  /// Field referred in an index, but found no data to define the type.
  userId Json?  @unique(map: "userId_1")
}

model userroles {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  v          Int      @map("__v")
  assignedAt DateTime @db.Date
  createdAt  DateTime @db.Date
  roleId     String   @db.ObjectId
  updatedAt  DateTime @db.Date
  userId     String   @db.ObjectId

  @@unique([userId, roleId], map: "userId_1_roleId_1")
  @@index([roleId], map: "roleId_1")
}

model users {
  id                String           @id @default(auto()) @map("_id") @db.ObjectId
  v                 Int              @map("__v")
  age               Int
  avatar            String
  bio               String
  createdAt         DateTime         @db.Date
  drinking          String
  education         String
  email             String           @unique(map: "email_1")
  /// Field referred in an index, but found no data to define the type.
  facebookId        Json?
  failedAttempts    Int
  fakeScore         Int
  fullName          String
  gender            String
  /// Field referred in an index, but found no data to define the type.
  googleId          Json?
  height            Int
  interests         String[]
  isEmailVerified   Boolean
  isFake            Boolean
  isLocked          Boolean
  isOnline          Boolean
  isVerifiedProfile Boolean
  kycStatus         String
  lastLogin         DateTime?        @db.Date
  lastSeen          DateTime         @db.Date
  location          UsersLocation
  locationText      String
  loginMethod       String
  lookingFor        String
  occupation        String
  passwordHash      String
  photos            String[]
  preferences       UsersPreferences
  profileCompletion Int
  /// Could not determine type: the field only had null or empty values in the sample set.
  resetOTP          Json?
  /// Could not determine type: the field only had null or empty values in the sample set.
  resetOtpExpire    Json?
  role              String
  smoking           String
  status            String
  updatedAt         DateTime         @db.Date
  username          String           @unique(map: "username_1")

  @@index([facebookId], map: "facebookId_1")
  @@index([googleId], map: "googleId_1")
  @@index([location], map: "location_2dsphere")
}

model usertags {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  v         Int      @map("__v")
  createdAt DateTime @db.Date
  tagId     String   @db.ObjectId
  updatedAt DateTime @db.Date
  userId    String   @db.ObjectId

  @@unique([userId, tagId], map: "userId_1_tagId_1")
  @@index([tagId], map: "tagId_1")
}

model videocalls {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  v              Int      @map("__v")
  callerId       String   @db.ObjectId
  createdAt      DateTime @db.Date
  duration       Int
  endedAt        DateTime @db.Date
  matchAccepted  Boolean
  matchRequested Boolean
  receiverId     String   @db.ObjectId
  startedAt      DateTime @db.Date
  status         String
  updatedAt      DateTime @db.Date

  @@index([callerId], map: "callerId_1")
  @@index([receiverId], map: "receiverId_1")
  @@index([status], map: "status_1")
}

// ─── PB23: Quản trị Phiên làm việc (Session Management) ───

type UserSessionsDeviceInfo {
  browser        String
  browserVersion String
  os             String
  osVersion      String
  device         String
  deviceType     String   // "desktop" | "mobile" | "tablet" | "unknown"
}

model user_sessions {
  id              String                  @id @default(auto()) @map("_id") @db.ObjectId
  userId          String                  @db.ObjectId
  tokenHash       String                  @unique
  tokenExpiresAt  DateTime                @db.Date
  ipAddress       String
  userAgent       String
  deviceInfo      UserSessionsDeviceInfo
  status          String                  // "active" | "expired" | "revoked"
  riskLevel       String                  // "normal" | "suspicious" | "high_risk"
  riskReasons     String[]
  loginAt         DateTime                @db.Date
  lastActiveAt    DateTime                @db.Date
  revokedAt       DateTime?               @db.Date
  revokedBy       String?                 @db.ObjectId
  revokeReason    String?
  createdAt       DateTime                @db.Date
  updatedAt       DateTime                @db.Date

  @@index([userId, status], map: "userId_1_status_1")
  @@index([ipAddress], map: "ipAddress_1")
  @@index([status, riskLevel], map: "status_1_riskLevel_1")
  @@index([loginAt(sort: Desc)], map: "loginAt_-1")
  @@index([tokenExpiresAt], map: "tokenExpiresAt_1")
  @@index([tokenHash], map: "tokenHash_1")
}
```

---

> [!NOTE]
> Các trường có kiểu dữ liệu là `Json?` hoặc có ghi chú `Could not determine type` là do trong database hiện tại các trường này chưa có dữ liệu mẫu (null hoặc empty) nên Prisma không thể tự suy luận kiểu dữ liệu cụ thể (như String, ObjectId, v.v.). Bạn có thể cập nhật thủ công các kiểu này nếu cần.

> [!IMPORTANT]
> **PB23 - user_sessions**: Collection này được thêm mới để hỗ trợ tính năng Quản trị Phiên làm việc. Lưu trữ thông tin session (token hash, IP, device, risk level) và hỗ trợ Admin kill session / force logout. TTL index tự động xóa sessions hết hạn sau 30 ngày.
