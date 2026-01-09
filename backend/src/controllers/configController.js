/**
 * Check backend configuration status
 */
const checkConfig = async (req, res) => {
  try {
    const config = {
      googleCalendar: {
        configured: !!(process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET),
        hasClientId: !!process.env.GOOGLE_CALENDAR_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        hasRedirectUri: !!process.env.GOOGLE_CALENDAR_REDIRECT_URI,
      },
      phonePe: {
        configured: !!(process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_SALT_KEY),
      },
      weather: {
        configured: !!process.env.OPENWEATHERMAP_API_KEY,
      },
      aws: {
        configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      },
    };

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  checkConfig,
};

