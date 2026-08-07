const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { HTTP_STATUS } = require('../constants');

/**
 * Auth Service — handles registration, login, token refresh, and logout.
 */
const authService = {
  async sendOtp(data) {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already registered and verified');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.otpCode = undefined;
      existingUser.otpExpiresAt = undefined;
      existingUser.isVerified = true; // BYPASS OTP: Auto verify
      await existingUser.save();
    } else {
      await User.create({ name, email, password, otpCode: undefined, otpExpiresAt: undefined, isVerified: true }); // BYPASS OTP: Auto verify
    }

    // Send real email instead of just dev console log
    // [DISABLED PER USER REQUEST TO BYPASS OTP FLOW]
    // const emailService = require('../utils/emailService');
    // await emailService.sendRegistrationOtp(email, name, otpCode);

    return { message: 'Registration successful' };
  },

  async verifyOtpAndRegister(email, otpCode) {
    const user = await User.findOne({ email }).select('+password +otpCode +otpExpiresAt');
    if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    if (user.isVerified) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'User already verified');
    
    if (user.otpCode !== otpCode || user.otpExpiresAt < new Date()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired OTP');
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const tokenPayload = { userId: user._id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user: user.toJSON(), accessToken, refreshToken };
  },

  /**
   * Log in user and return tokens.
   */
  async login(email, password) {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !user.isActive) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }
    if (user.isVerified === false) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Please verify your account first');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const tokenPayload = { userId: user._id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return user without sensitive fields
    const userObj = user.toJSON();
    return { user: userObj, accessToken, refreshToken };
  },

  /**
   * Issue a new access token using a valid refresh token.
   */
  async refreshAccessToken(incomingRefreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token mismatch or user not found');
    }

    const tokenPayload = { userId: user._id, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  /**
   * Logout: invalidate the refresh token.
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  },
};

module.exports = authService;
