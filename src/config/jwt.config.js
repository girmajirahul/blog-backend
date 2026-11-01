// export const JWT_CONFIG = {
//   accessSecret:  process.env.JWT_ACCESS_SECRET  || "access_secret_change_in_production",
//   refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret_change_in_production",
//   accessExpiry:  process.env.JWT_ACCESS_EXPIRY  || "15m",   // short lived
//   refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",    // long lived
//   cookieOptions: {
//     httpOnly:  true,
//     secure:    process.env.NODE_ENV === "production",
//     sameSite:  "strict",
//     maxAge:    7 * 24 * 60 * 60 * 1000, // 7 days in ms
//   },
// };


const isProduction = process.env.NODE_ENV === "production";

export const JWT_CONFIG = {
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,

  accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",

  cookieOptions: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

