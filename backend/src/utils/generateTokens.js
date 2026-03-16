// backend/src/utils/generateTokens.js

const generateTokens = async (user, res) => {
  // Generate both tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token in database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  // 👆 validateBeforeSave: false → skip validation (we don't want to
  //    re-validate name, email etc. just to save a token)

  // Cookie options
  const accessTokenOptions = {
    httpOnly: true,     // 👈 Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === "production",  // 👈 HTTPS only in production
    sameSite: "strict", // 👈 CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
  };

  const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  // Set cookies in response
  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);

  return { accessToken, refreshToken };
};

export default generateTokens;