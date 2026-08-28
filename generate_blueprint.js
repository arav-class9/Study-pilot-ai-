const fs = require('fs');

const privatePermissions = {
  read: "auth != null && auth.uid == resource.data.userId",
  create: "auth != null && request.resource.data.userId == auth.uid",
  update: "auth != null && resource.data.userId == auth.uid",
  delete: "auth != null && resource.data.userId == auth.uid"
};

const publicPermissions = {
  read: "true",
  create: "false",
  update: "false",
  delete: "false"
};

const models = {
  User: {
    collection: "users",
    fields: {
      uid: "string",
      email: "string",
      createdAt: "timestamp",
      updatedAt: "timestamp"
    },
    permissions: {
      read: "auth != null && auth.uid == resource.id",
      create: "auth != null && auth.uid == request.resource.id",
      update: "auth != null && auth.uid == resource.id",
      delete: "auth != null && auth.uid == resource.id"
    }
  },
  Profile: {
    collection: "profiles",
    fields: {
      userId: "string",
      name: "string?",
      email: "string",
      profilePhoto: "string?",
      classLevel: "string?",
      board: "string?",
      targetExam: "string?",
      preferredSubjects: "string[]?",
      studyGoals: "string?",
      createdAt: "timestamp",
      updatedAt: "timestamp"
    },
    permissions: privatePermissions
  },
  Subject: {
    collection: "subjects",
    fields: { name: "string", board: "string", classLevel: "string" },
    permissions: publicPermissions
  },
  Chapter: {
    collection: "chapters",
    fields: { subjectId: "string", name: "string" },
    permissions: publicPermissions
  },
  Topic: {
    collection: "topics",
    fields: { chapterId: "string", name: "string" },
    permissions: publicPermissions
  },
  Question: {
    collection: "questions",
    fields: { topicId: "string", type: "string", text: "string" },
    permissions: publicPermissions
  },
  QuizAttempt: {
    collection: "quizAttempts",
    fields: { userId: "string", score: "number", timestamp: "timestamp" },
    permissions: privatePermissions
  },
  ExamAttempt: {
    collection: "examAttempts",
    fields: { userId: "string", score: "number", timestamp: "timestamp" },
    permissions: privatePermissions
  },
  Mistake: {
    collection: "mistakes",
    fields: { userId: "string", questionId: "string", type: "string" },
    permissions: privatePermissions
  },
  Weakness: {
    collection: "weaknesses",
    fields: { userId: "string", topicId: "string", score: "number" },
    permissions: privatePermissions
  },
  StudyPlan: {
    collection: "studyPlans",
    fields: { userId: "string", title: "string" },
    permissions: privatePermissions
  },
  StudySession: {
    collection: "studySessions",
    fields: { userId: "string", duration: "number" },
    permissions: privatePermissions
  },
  RevisionItem: {
    collection: "revisionItems",
    fields: { userId: "string", nextReviewAt: "timestamp" },
    permissions: privatePermissions
  },
  Note: {
    collection: "notes",
    fields: { userId: "string", title: "string", content: "string" },
    permissions: privatePermissions
  },
  AiConversation: {
    collection: "aiConversations",
    fields: { userId: "string", title: "string", timestamp: "timestamp" },
    permissions: privatePermissions
  },
  AiMessage: {
    collection: "aiMessages",
    fields: { userId: "string", conversationId: "string", text: "string" },
    permissions: privatePermissions
  },
  Bookmark: {
    collection: "bookmarks",
    fields: { userId: "string", targetId: "string", type: "string" },
    permissions: privatePermissions
  },
  Achievement: {
    collection: "achievements",
    fields: { userId: "string", name: "string", date: "timestamp" },
    permissions: privatePermissions
  },
  Notification: {
    collection: "notifications",
    fields: { userId: "string", title: "string", body: "string", read: "boolean" },
    permissions: privatePermissions
  },
  Subscription: {
    collection: "subscriptions",
    fields: { userId: "string", plan: "string", status: "string" },
    permissions: privatePermissions
  },
  UsageLimit: {
    collection: "usageLimits",
    fields: { userId: "string", aiQuestions: "number" },
    permissions: privatePermissions
  }
};

fs.writeFileSync('firebase-blueprint.json', JSON.stringify({ models }, null, 2));
