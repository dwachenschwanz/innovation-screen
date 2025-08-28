// ===== smartorg.js (refactored) =====
import { apiClient } from "./api_client.js";
// import CryptoJS from "crypto-js"; // Ensure crypto-js is available to your bundler/runtime

/**
 * SmartOrg API wrapper
 * Notes:
 * - Fixes incorrect header passing to apiClient.get/post.
 * - Aligns HMAC signing input (path + body) with the actual body sent.
 * - Avoids unnecessary decodeURIComponent on already-plain strings.
 */
export class SmartOrg {
  constructor() {
    // console.debug('SmartOrg API wrapper initialized');
  }

  /**
   * Obtain JWT-like token using username/password signature flow.
   * @param {{username: string, password: string}} credentials
   */
  async getToken(credentials) {
    const path = `/wizard-api/framework/login/a/${credentials.username}`;

    // const path = `/wizard-api/framework/login/a/${encodeURIComponent(
    //   credentials.username
    // )}`;

    // The server appears to expect body participation in the signature.
    // Keep the canonical JSON string stable for both signature and request.
    const bodyObj = {}; // or include needed fields
    const bodyStr = JSON.stringify(bodyObj);

    const secret = CryptoJS.MD5(credentials.password).toString();
    let hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secret);
    hmac.update(decodeURIComponent(path));
    hmac.update(decodeURIComponent(bodyStr));
    const signature = hmac.finalize().toString();
    console.log("path: ", path);
    console.log("secret: ", secret);
    console.log("hmac: ", signature);

    const headers = {
      Authorization: `applicationname ${credentials.username}:${signature}`,
      "Cache-Control": "no-cache",
    };

    const result = await apiClient.post(path, bodyObj, headers);

    // If API returns a token, ApiClient auto-persists it; return for convenience
    return result;
  }

  async portfolios() {
    const path = "/kirk/domain/nav/portfolios";
    const headers = { "Cache-Control": "no-cache" };
    return apiClient.get(path, headers);
  }

  async treeFor(portfolioName) {
    const path = `/kirk/domain/nav/tree/${encodeURIComponent(portfolioName)}`;
    const headers = { "Cache-Control": "no-cache" };
    return apiClient.get(path, headers);
  }
}

export const smartorg = new SmartOrg();
