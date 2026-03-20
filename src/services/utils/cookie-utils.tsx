export function setCookie(name: string, value: string) {
  // Set the expiration to 2 hours from now
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + 8 * 60 * 60 * 1000);
  const cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
  document.cookie = cookie;
}

export function getCookie(cookieName: string) {
  const cookies = document.cookie;
  const cookieArray = cookies.split(';');

  let cookieValue = '';

  cookieArray.forEach((cookie) => {
    const [name, value] = cookie.split('=');
    const trimmedName = name.trim();

    if (trimmedName === cookieName) {
      cookieValue = value.trim();
    }
  });

  if (cookieValue !== "") {
    const dedecryptTokenValue = cookieValue;
    return dedecryptTokenValue;
  } else {
    return null;
  }
}

export function removeCookie(name: string): void {
  // Set the expiration to 2 hours from now
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() - 1);
  document.cookie = `${name}=; expires=${expirationDate.toUTCString()}; path=/;`;
}