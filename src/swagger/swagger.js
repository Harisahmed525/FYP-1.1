// src/swagger/swagger.js

module.exports = {
  openapi: "3.0.0",
  info: {
    title: "MockMate Backend API",
    version: "1.0.0",
    description: "API documentation for the MockMate interview preparation platform."
  },

  servers: [
    {
      url: process.env.SERVER_URL || "http://localhost:5000",
      description: "Local development server"
    }
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },

    schemas: {
      // -------------------------
      // AUTH SCHEMAS
      // -------------------------
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 }
        }
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" }
        }
      },

      UpdateProfileRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" }
        }
      },

      ChangePasswordRequest: {
        type: "object",
        required: ["oldPassword", "newPassword"],
        properties: {
          oldPassword: { type: "string" },
          newPassword: { type: "string", minLength: 6 }
        }
      },

      // -------------------------
      // PRE-INTERVIEW SCHEMA
      // -------------------------
      PreInterviewSetup: {
        type: "object",
        required: ["desiredRole", "experienceLevel"],
        properties: {
          desiredRole: { type: "string" },
          industry: { type: "string" },
          educationLevel: { type: "string" },
          experienceLevel: { type: "string" }
        }
      },

      // -------------------------
      // INTERVIEW SESSION SCHEMAS
      // -------------------------
      StartInterviewRequest: {
        type: "object",
        required: ["setupId"],
        properties: { setupId: { type: "string" } }
      },

      AnswerRequest: {
        type: "object",
        required: ["sessionId", "answer"],
        properties: {
          sessionId: { type: "string" },
          answer: { type: "string" }
        }
      },

      EmotionLogRequest: {
        type: "object",
        required: ["sessionId", "emotion"],
        properties: {
          sessionId: { type: "string" },
          emotion: { type: "string" },
          eyeContact: { type: "number" },
          facialExpression: { type: "number" },
          gestures: { type: "number" },
          time: { type: "number" }
        }
      },

      FinishInterviewRequest: {
        type: "object",
        required: ["sessionId"],
        properties: {
          sessionId: { type: "string" }
        }
      },

      // -------------------------
      // PERFORMANCE SUMMARY SCHEMA
      // -------------------------
      PerformanceSummary: {
        type: "object",
        properties: {
          interviewsCompleted: { type: "number" },
          hoursPracticed: { type: "number" },
          skillsMastered: { type: "number" },

          progressOverTime: {
            type: "array",
            items: { type: "number" }
          },

          overallScore: { type: "number" },
          improvement: { type: "number" },

          answerQuality: {
            type: "object",
            properties: {
              score: { type: "number" },
              technicalAccuracy: { type: "number" },
              completeness: { type: "number" },
              conciseness: { type: "number" },
              problemSolving: { type: "number" }
            }
          },

          bodyLanguage: {
            type: "object",
            properties: {
              score: { type: "number" },
              eyeContact: { type: "number" },
              facialExpressions: { type: "number" },
              handGestures: { type: "number" },
              toneOfVoice: { type: "number" }
            }
          },

          upcomingInterviews: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                date: { type: "string" },
                time: { type: "string" },
                status: { type: "string" }
              }
            }
          }
        }
      }
    }
  },

  // ---------------------------------------------------------
  //                    API ENDPOINTS
  // ---------------------------------------------------------
  paths: {
    // -------------------------
    // AUTH ROUTES
    // -------------------------
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } }
          }
        },
        responses: { 201: { description: "User registered" } }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } }
          }
        },
        responses: { 200: { description: "Login success" } }
      }
    },

    // -------------------------
    // PROFILE ROUTES
    // -------------------------
    "/api/profile/me": {
      get: {
        tags: ["Profile"],
        security: [{ bearerAuth: [] }],
        summary: "Get logged-in user profile",
        responses: { 200: { description: "User fetched" } }
      }
    },

    "/api/profile/update": {
      put: {
        tags: ["Profile"],
        security: [{ bearerAuth: [] }],
        summary: "Update name & email",
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateProfileRequest" } }
          }
        },
        responses: { 200: { description: "Profile updated" } }
      }
    },

    "/api/profile/update-password": {
      put: {
        tags: ["Profile"],
        security: [{ bearerAuth: [] }],
        summary: "Change password",
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } }
          }
        },
        responses: { 200: { description: "Password updated" } }
      }
    },

    // -------------------------
    // PRE-INTERVIEW ROUTES
    // -------------------------
    "/api/interview/setup": {
      post: {
        tags: ["PreInterview"],
        security: [{ bearerAuth: [] }],
        summary: "Create a pre-interview setup",
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PreInterviewSetup" } }
          }
        },
        responses: { 201: { description: "Setup created" } }
      },

      get: {
        tags: ["PreInterview"],
        security: [{ bearerAuth: [] }],
        summary: "Get user's pre-interview setups",
        parameters: [
          { name: "latest", in: "query", schema: { type: "boolean" } }
        ],
        responses: { 200: { description: "Fetched setups" } }
      }
    },

    "/api/interview/setup/{id}": {
      delete: {
        tags: ["PreInterview"],
        security: [{ bearerAuth: [] }],
        summary: "Delete setup by ID",
        parameters: [
          { name: "id", required: true, in: "path", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Deleted" } }
      }
    },

    // -------------------------
    // AI
    // -------------------------
    "/api/interview/generate-questions": {
      post: {
        tags: ["AI"],
        security: [{ bearerAuth: [] }],
        summary: "Generate 7 interview questions",
        responses: { 200: { description: "Questions generated" } }
      }
    },

    // -------------------------
    // INTERVIEW SESSION
    // -------------------------
    "/api/interview/start": {
      post: {
        tags: ["InterviewSession"],
        security: [{ bearerAuth: [] }],
        summary: "Start an interview session",
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/StartInterviewRequest" } }
          }
        },
        responses: { 200: { description: "Session started" } }
      }
    },

    "/api/interview/answer": {
      post: {
        tags: ["InterviewSession"],
        security: [{ bearerAuth: [] }],
        summary: "Submit answer → Get next question",
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AnswerRequest" } }
          }
        },
        responses: { 200: { description: "Next question returned" } }
      }
    },

    "/api/interview/emotion-log": {
      post: {
        tags: ["InterviewSession"],
        security: [{ bearerAuth: [] }],
        summary: "Log facial emotion data from frontend",
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/EmotionLogRequest" } }
          }
        },
        responses: { 200: { description: "Emotion logged" } }
      }
    },

    "/api/interview/upload-video": {
      post: {
        tags: ["InterviewSession"],
        security: [{ bearerAuth: [] }],
        summary: "Upload final interview video",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  video: { type: "string", format: "binary" },
                  sessionId: { type: "string" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Video uploaded" } }
      }
    },

    "/api/interview/finish": {
      post: {
        tags: ["InterviewSession"],
        security: [{ bearerAuth: [] }],
        summary: "Finish interview & run AI evaluation",
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/FinishInterviewRequest" } }
          }
        },
        responses: { 200: { description: "Evaluation completed" } }
      }
    },

    // -------------------------
    // PERFORMANCE ROUTE
    // -------------------------
    "/api/performance/summary": {
      get: {
        tags: ["Performance"],
        security: [{ bearerAuth: [] }],
        summary: "Get full performance summary (dashboard + performance page)",
        responses: {
          200: {
            description: "Performance summary returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PerformanceSummary" }
              }
            }
          }
        }
      }
    }
  }
};
