// apiConfig.js
(function () {
  const CONFIG = Object.freeze({
    API_BASE: "https://quizzapp-9l86.onrender.com",
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


