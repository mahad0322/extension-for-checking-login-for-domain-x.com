document.addEventListener("DOMContentLoaded", function () {
  const checkLoginBtn = document.getElementById("check-login-btn");
  const loginStatusDiv = document.getElementById("login-status");

  checkLoginBtn.addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const url = new URL(tabs[0].url);
          if (url.hostname === "x.com") {
              chrome.scripting.executeScript({
                  target: { tabId: tabs[0].id },
                  func: checkLoginStatusOnTab
              });
          } else {
              loginStatusDiv.innerText = "Please go to x.com to check login status.";
          }
      });
  });

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.action === "login-status") {
          const loginStatus = request.isLoggedIn ? "Logged in" : "Not logged in";
          loginStatusDiv.innerText = loginStatus;
      }
  });
});

function checkLoginStatusOnTab() {
  setTimeout(() => {
      fetch("https://x.com", {
          method: "GET",
          headers: {
              "User-Agent": navigator.userAgent,
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": navigator.language || "en-US,en;q=0.5",
              "Cache-Control": "no-cache",
              "Pragma": "no-cache",
              "Connection": "keep-alive",
              "Upgrade-Insecure-Requests": "1",
          },
          credentials: "same-origin",
      })
      .then(response => response.text())
      .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const signInBtn = document.querySelector("#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010 > main > div > div > div.css-175oi2r.r-tv6buo > div > div > div.css-175oi2r > div.css-175oi2r.r-2o02ov > a > div > span > span")
          const isLoggedIn = signInBtn === null;
          chrome.runtime.sendMessage({ action: "login-status", isLoggedIn });
      })
      .catch(error => {
          console.error('Error fetching page:', error);
          chrome.runtime.sendMessage({ action: "login-status", isLoggedIn: false });
      });
  }, 3000);
}
