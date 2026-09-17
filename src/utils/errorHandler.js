/**
 * Extracts a user-friendly error message from an error object (Axios, Network, or Error).
 *
 * @param {any} error
 * @param {string} fallback
 * @returns {string}
 */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  // Server error response message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (typeof error.response?.data === "string" && error.response.data.trim().length > 0) {
    // If HTML error page, strip tags or extract text
    if (error.response.data.includes("<html") || error.response.data.includes("<pre>")) {
      const match = error.response.data.match(/<pre>(.*?)<\/pre>/s);
      if (match && match[1]) {
        return match[1].replace(/<br\s*[\/]?>/gi, " ").replace(/&nbsp;/g, " ").trim();
      }
    } else {
      return error.response.data;
    }
  }

  // Network or DNS error
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Network connection error. Please check your internet connection or verify the server is accessible.";
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
}
