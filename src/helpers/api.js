import axios from 'axios';
import { checkEmpty, getStorage } from './utility';
export const CONFIG = {
    'Accept':'application/json',
    'Content-Type':'application/json',
    'Cache-Control' : 'no-cache',
    'uuid': '',
    'jjpi': '',
    'redoq_csd_staff_id': '',
    'staffid': '',
    'timezone':'Europe/London'
};

export const getReq     = (url = null , params = null, config = CONFIG) => {      
    let loginInfo = getStorage('login_info');

    config.uuid = getStorage('uuid');
    config.jjpi = getStorage('jjpi');
    config.redoq_csd_staff_id = getStorage('staffid');
    config.staffid = getStorage('staffid');

    if (loginInfo?.token) {
        config.Authorization = `Bearer ${loginInfo.token}`;
    }
    
    return axios({
        url,
        method: "GET",
        headers: config,
        params: params || undefined,
        withCredentials: true,
    })
    .then(res => res)
    .catch(err => err);
};


export const postReq    = (url = null , params = null, config = CONFIG) => {

    let userid = getStorage('userid');      
    let loginInfo;

    try {
        loginInfo = JSON.parse(getStorage("login_info") || "{}");
    } catch {
        loginInfo = {};
    }
    
    config.userid = !checkEmpty(userid) ? userid : "";

    if (loginInfo?.token) {
        config.Authorization = `Bearer ${loginInfo.token}`;
    }

    return axios
        .post(url, params, { headers: config })
        .then(response => response.data)
        .catch(error => {
            throw error;
        });
};
