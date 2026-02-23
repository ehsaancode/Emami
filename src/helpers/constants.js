export const environment = 'DEV';
export const baseUrlApi = 'https://staging-php.csdservice.dinetestapi.com';
//export const  baseApiUrl = 'https://puspendu.csdservice.dinetestapi.com/api';
export const LOGIN_PAGE = '/authentication/login';
export const emailRegEx = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
export const telephoneRegEx = /^[0-9]{10,11}$/;
export const passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const pagesizeArray = [10, 20, 30, 40];
export const takes = 10;
export const dataCollect = 'fromApi'; //"fromData" //fromApi
export const baseApiUrl = 'https://prasun.panditjia.api.redoq.host/api';
export const app_version = import.meta.env.VITE_APP_VERSION || '0.0.0';
