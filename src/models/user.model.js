// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//       minlength: [2, "Name must be at least 2 characters"],
//       maxlength: [50, "Name cannot exceed 50 characters"],
//     },

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       trim: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
//     },

//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [6, "Password must be at least 6 characters"],
//       select: false, // never return password in queries by default
//     },

//     avatar: {
//       type: String,
//       default: "",
//     },

//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },

//     bio: {
//       type: String,
//       default: "",
//       maxlength: [300, "Bio cannot exceed 300 characters"],
//     },

//     refreshToken: {
//       type: String,
//       default: null,
//       select: false,
//     },
//     authProvider: {
//       type: String,
//       enum: ["local", "github"],
//       default: "local",
//     },

//     githubId: {
//       type: String,
//       sparse: true,
//       unique: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ── Hash password before save ──────────────────────────────────
// userSchema.pre("save", async function (next) {
//   // Only hash if password was modified
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // ── Instance method: compare password ─────────────────────────
// userSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // ── Remove sensitive fields when converting to JSON ───────────
// userSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.password;
//   delete obj.refreshToken;
//   return obj;
// };

// export default mongoose.model("User", userSchema);



import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    // Required only for local authentication
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    bio: {
      type: String,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    // Authentication provider
    authProvider: {
      type: String,
      enum: ["local", "github"],
      default: "local",
    },

    // Unique GitHub account ID
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password only when a password is provided or modified
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password safely
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) {
    return false;
  }

  return bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive fields from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.refreshToken;

  return obj;
};

export default mongoose.model("User", userSchema);
