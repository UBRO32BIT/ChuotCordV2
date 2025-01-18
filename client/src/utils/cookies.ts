import Cookies from 'js-cookie';

export function setTokenToCookies(token: string) {
    Cookies.set('refreshToken', token, {secure: true});
}

export function getTokenFromCookies() {
    return Cookies.get('refreshToken');
}

export function removeTokenFromCookies() {
    Cookies.remove('refreshToken');
}