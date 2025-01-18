export function setAccessToken(accessToken: string) {
    localStorage.setItem('accessToken', accessToken);
}
export function getAccessToken() {
    return localStorage.getItem('accessToken');
}
export function removeAccessToken() {
    return localStorage.removeItem('accessToken');
}