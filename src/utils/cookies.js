export function setLoginCookie(name, value, minutes) {
  const date = new Date();
  // Set expiration time in minutes
  date.setTime(date.getTime() + minutes * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
  // document.getElementById('cookie-message').innerText = `Cookie ${name} set!`;
}

export function setBooleanCookie(name, value, minutes) {
  const date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  // Convert the boolean value to a string ('true' or 'false') before storing
  document.cookie =
    name + "=" + (value ? "true" : "false") + ";" + expires + ";path=/";
  // document.getElementById('cookie-message').innerText = `Cookie ${name} set to ${value}!`;
}

// Function to get the value of a cookie by name
export function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

// Function to check if a cookie exists and display its value
export function checkCookie() {
  const username = getCookie("username");
  // if (username !== null) {
  //   document.getElementById('cookie-message').innerText = "Cookie found: " + username;
  // } else {
  //   document.getElementById('cookie-message').innerText = "Cookie not found or expired!";
  // }
}

// Function to delete a cookie
export function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  // document.getElementById('cookie-message').innerText = `Cookie ${name} deleted!`;
}
