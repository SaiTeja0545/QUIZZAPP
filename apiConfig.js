// apiConfig.js
(function () {
  const CONFIG = Object.freeze({
    API_BASE: "http://localhost:3000",
    QUESTIONS: "/questions",
    USERS: "/users",
    SCORES: "/quiz_scores"
  });

  Object.defineProperty(window, "APP_CONFIG", {
    value: CONFIG,
    writable: false,
    configurable: false
  });
})();

