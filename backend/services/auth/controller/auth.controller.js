
import { app } from "../config/firebase.js";
import { getAuth } from "firebase-admin/auth";
import crypto from "node:crypto";
import bcryptjs from "bcryptjs";

import User from "../model/userSchema.js";
import redis from "../../../shared/redis/redis.js";

const SESSION_TTL = 7 * 24 * 60 * 60;

// Google authentication
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Firebase token is required",
      });
    }

    const decoded = await getAuth(app).verifyIdToken(token);

    if (!decoded.email || !decoded.email_verified) {
      return res.status(401).json({
        message: "A verified email is required",
      });
    }

    const email = decoded.email.toLowerCase().trim();

    let user = await User.findOne({
      firebaseId: decoded.uid,
    });

    if (!user) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          message: "An account already exists with this email",
        });
      }

      user = await User.create({
        firebaseId: decoded.uid,
        name: decoded.name || email.split("@")[0],
        email,
        avatar: decoded.picture || "",
      });
    }

    // Create a new Redis session
    const session = crypto.randomUUID();

    await redis.set(
      `session-${session}`,
      JSON.stringify({
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }),
      "EX",
      SESSION_TTL
    );

    // Store session ID in an HTTP-only cookie
    res.cookie("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Google login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    if (error.code?.startsWith("auth/")) {
      return res.status(401).json({
        message: "Invalid or expired Firebase token",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account already exists with this email",
      });
    }

    return res.status(500).json({
      message: "Internal server error during Google login",
    });
  }
};

// Native registration
export const register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and at most 72 bytes",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash the actual user-provided password
    const passwordHash = await bcryptjs.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatar: typeof avatar === "string" ? avatar : "",
    });

    // Create a new Redis session
    const session = crypto.randomUUID();

    await redis.set(
      `session-${session}`,
      JSON.stringify({
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }),
      "EX",
      SESSION_TTL
    );

    res.cookie("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL * 1000,
      path: "/",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error during registration",
    });
  }
};

// Native login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Verify the supplied password against the stored hash
    const isPasswordValid = await bcryptjs.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create a new Redis session
    const session = crypto.randomUUID();

    await redis.set(
      `session-${session}`,
      JSON.stringify({
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }),
      "EX",
      SESSION_TTL
    );

    res.cookie("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error during login",
    });
  }
};


// Logout
export const logout = async (req, res) => {
  try {
    const session = req.cookies?.session;

    if (session) {
      // Delete the session from Redis
      await redis.del(`session-${session}`);
    }

    // Clear the browser cookie
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};