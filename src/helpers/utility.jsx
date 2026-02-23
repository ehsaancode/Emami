import moment from 'moment-timezone';
import { toast, Slide, Flip } from 'react-toastify';

export const checkInt = function (num) {
  num = parseInt(num);
  if (isNaN(num) || num === '' || num === 0 || num === '0') {
    return 0;
  } else {
    return num;
  }
};
export const checkFloat = function (num) {
  num = parseFloat(num);
  if (isNaN(num) || num === 0.0 || num === '' || num === 0 || num === '0') {
    return 0.0;
  } else {
    num = formatTotal(num);
    num = parseFloat(num);
    if (isNaN(num) || num === 0.0 || num === '' || num === 0 || num === '0') {
      return 0.0;
    } else {
      return num;
    }
  }
};
export const checkEmpty = function (mixedVar) {
  var key;
  if (typeof mixedVar == 'object') {
    for (key in mixedVar) {
      if (Object.hasOwnProperty.bind(mixedVar)(key)) {
        return false;
      }
    }
    return true;
  } else {
    var undef;

    var i;
    var len;
    var emptyValues = [undef, null, 'null', false, 0, '', '0', '0.00', '0.0', 'empty', undefined, 'undefined'];
    if (typeof mixedVar == 'string') {
      mixedVar = mixedVar.trim();
    }

    for (i = 0, len = emptyValues.length; i < len; i++) {
      if (mixedVar === emptyValues[i]) {
        return true;
      }
    }
  }
  return false;
};

export const findIndex = function (mixedVar, key, value) {
  let index = '';
  // if (typeof mixedVar == 'object')
  // {
  // 	var f;
  // 	var filteredElements = mixedVar.filter(function(item, index) { f = index; return item[key] == value; });
  // 	if (filteredElements.length) {
  // 	index = f;
  // }
  // }else if (typeof mixedVar == 'array')
  // {

  // }

  index = mixedVar.findIndex(({ key }) => key === value);
  return index;
};

export const formatTotal = function (num) {
  return number_format(Math.round(num * 100) / 100, 2, '.', '');
};
export const formatTotalCurrency = function (num) {
  return '£' + number_format(Math.round(num * 100) / 100, 2, '.', '');
};

export const number_format = function (number, decimals, dec_point, thousands_sep) {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep == 'undefined' ? ',' : thousands_sep,
    dec = typeof dec_point == 'undefined' ? '.' : dec_point,
    s = '',
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE checkFloat(0.55).toFixed(0) = 0
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
};

export const cleanString = function (string) {
  string = string.trim();
  string = string.replace(/ /g, '-');
  // eslint-disable-next-line
  string = string.replace(/[^A-Za-z0-9\-]/g, '');
  string = string.replace(/-+/g, '-');
  return string;
};

export const mergeObj = (finalObj, newObj) => {
  var finalObjFirstInsertKey = 0;
  if (!checkEmpty(finalObj)) {
    finalObjFirstInsertKey = finalObj.length;
  }
  if (!checkEmpty(newObj)) {
    for (let i in newObj) {
      finalObj[finalObjFirstInsertKey] = newObj[i];
    }
  }
  return finalObj;
};

export const validateMobileNumber = (number) => {
  number = number.trim();
  number = checkInt(number);
  number = number + '';
  if (number.length === 10) {
    return true;
  } else {
    return false;
  }
};

export const validateEmailAddress = (email) => {
  return email;
};

export const carbon = {
  now: function (req) {
    return moment().tz(req.locals.tz).format('YYYY-MM-DD HH:mm:ss');
  },
  parse: function (date) {
    return moment.parseZone(date).format('YYYY-MM-DD HH:mm:ss');
  },
  yesterday: function (req) {
    return moment().subtract(1, 'days').tz(req.locals.tz).format('YYYY-MM-DD HH:mm:ss');
  },
  fromDay: function (req, dayCount) {
    return moment().subtract(dayCount, 'days').tz(req.locals.tz).format('YYYY-MM-DD HH:mm:ss');
  },
  tomorrow: function (req) {
    return moment().add(1, 'days').tz(req.locals.tz).format('YYYY-MM-DD HH:mm:ss');
  },
  format: function (date, frmt) {
    return moment.parseZone(date).format(frmt);
  },
  strtotime: function (req, date) {
    return moment(date).tz(req.locals.tz).valueOf() / 1000; //new Date(date).getTime() / 1000;
  },
  isGreater: function (date1, date2) {
    date1 = moment.parseZone(date1);
    date2 = moment.parseZone(date2);
    if (date1 > date2) {
      return true;
    } else {
      return false;
    }
  },
  isGreaterOrEqual: function (date1, date2) {
    date1 = moment.parseZone(date1);
    date2 = moment.parseZone(date2);
    if (date1 >= date2) {
      return true;
    } else {
      return false;
    }
  },
  isLessOrEqual: function (date1, date2) {
    date1 = moment.parseZone(date1);
    date2 = moment.parseZone(date2);
    if (date1 <= date2) {
      return true;
    } else {
      return false;
    }
  },
  addDay: function (date, day) {
    //return  moment.parseZone(date).add(day,'days').tz(req.locals.tz).format('YYYY-MM-DD HH:mm:ss');
    return moment.parseZone(date).add(day, 'days').format('YYYY-MM-DD HH:mm:ss');
  },
  addMonth: function (date, months) {
    //return  moment.parseZone(date).add(day,'days').tz(req.locals.tz).format('YYYY-MM-DD HH:mm:ss');
    return moment.parseZone(date).add(months, 'months').format('YYYY-MM-DD HH:mm:ss');
  },
  addDayFormat: function (date, day, frmt) {
    //return  moment.parseZone(date).add(day,'days').tz(req.locals.tz).format('YYYY-MM-DD HH:mm:ss');
    return moment.parseZone(date).add(day, 'days').format(frmt);
  },
  subDay: function (date, day) {
    return moment.parseZone(date).subtract(day, 'days').format('YYYY-MM-DD HH:mm:ss');
  },
  addMinutes: function (date, minutes) {
    return moment.parseZone(date).add(minutes, 'minutes').format('YYYY-MM-DD HH:mm:ss');
  },
  subMinutes: function (date, minutes) {
    return moment.parseZone(date).subtract(minutes, 'minutes').format('YYYY-MM-DD HH:mm:ss');
  },
  subSeconds: function (date, seconds) {
    return moment.parseZone(date).subtract(seconds, 'seconds').format('YYYY-MM-DD HH:mm:ss');
  },
  diff: function (date1, date2, unit) {
    date1 = moment.parseZone(date1);
    date2 = moment.parseZone(date2);
    return date1.diff(date2, unit, true);
  },
  endofMonth: (date, frmt) => moment(date).clone().endOf('month').format(frmt),
  firstOfMonth: (date, frmt) => moment(date).clone().startOf('month').format(frmt),
  subMonths: function (date, months) {
    return moment.parseZone(date).subtract(months, 'months').format('YYYY-MM-DD HH:mm:ss');
  },
  subWeek: function (date, week) {
    return moment.parseZone(date).subtract(week, 'week').format('YYYY-MM-DD HH:mm:ss');
  },
};

export const setStotage = (key, value) => {
  localStorage.setItem(key, value);
};
export const setStorageJson = (key, value) => {
  try {
    value = JSON.stringify(value);
    localStorage.setItem(key, value);
  } catch (err) {
    console.log("Couldn't save data: " + err);
  }
};
export const getStorage = (key) => {
  return localStorage.getItem(key);
};
export const getStorageJson = (key, obj) => {
  if (obj === undefined) {
    obj = false;
  }
  var value = '';
  try {
    value = localStorage.getItem(key);
    value = JSON.parse(value);
    if (checkEmpty(value)) {
      if (obj) {
        value = {};
      } else {
        value = [];
      }
    }
  } catch (err) {
    if (obj) {
      value = {};
    } else {
      value = [];
    }
  }
  return value;
};
export const removeStorage = (key) => {
  localStorage.removeItem(key);
};
export const clearStorage = () => {
  localStorage.clear();
};
export const setAuthStorage = (resp) => {
  console.log(resp?.data);

  setStotage('login_info', JSON.stringify(resp?.data));
  setStotage('userid', resp?.data?.user_Id);
};
export const setBasicdataStorage = (resp) => {
  let config = getStorageJson('config');
  config.basicdata = resp;
  setStorageJson('config', config);
};

export const preapre_dropdown_options = (object, keyOfValue, keyOfLabel, defaultValue = 0, defaultLabel = 'All') => {
  let finalResponse = [
    {
      value: defaultValue,
      label: defaultLabel,
    },
  ];
  for (let i in object) {
    finalResponse.push({
      value: object[i][keyOfValue],
      label: object[i][keyOfLabel],
    });
  }
  return finalResponse;
};
export const externalLink = (url) => {
  if (url) {
    window.open('https://' + url, '_blank');
  }
};

export const toastMessage = (type, message) =>
  toast[type](`${message}`, {
    position: 'top-right',
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: 'colored',
  });

export const successnotify = (apiMessage) =>
  toast.success(`${apiMessage}`, {
    position: 'top-right',
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: 'light',
  });

// you should always add this in your component and import react-toastify
{
  /* <ToastContainer
  position="top-right"
  autoClose={2000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover={false}
  theme="light"
/> */
}

export const errorNotify = (apiMessage) =>
  toast.error(`${apiMessage}`, {
    position: 'top-right',
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: 'light',
  });

export const Toastslideerror = (mes) =>
  toast.error(<p className="text-white tx-16 mb-0 ">{mes}</p>, {
    position: toast.POSITION.TOP_RIGHT,
    hideProgressBar: true,
    transition: Slide,
    autoClose: 1000,
    theme: 'colored',
  });

export const Toastslidesucc = (mes) =>
  toast.success(<p className="text-white tx-16 mb-0 ">{mes}</p>, {
    position: toast.POSITION.TOP_RIGHT,
    hideProgressBar: true,
    transition: Slide,
    autoClose: 1000,
    theme: 'colored',
  });


export const toArray = (value) => (Array.isArray(value) ? value : []);

export const normalizeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const getSafeDate = (dateValue) => {
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue;
  }
  return null;
};

const buildValidatedDate = (year, month, day) => {
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
};

export const parseDateValue = (value) => {
  if (!value) return null;

  const safeDate = getSafeDate(value);
  if (safeDate) return safeDate;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const dayMonthYearMatch = trimmed.match(
      /^(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{4})$/
    );
    if (dayMonthYearMatch) {
      const day = Number(dayMonthYearMatch[1]);
      const month = Number(dayMonthYearMatch[2]);
      const year = Number(dayMonthYearMatch[3]);
      return buildValidatedDate(year, month, day);
    }

    const yearMonthDayMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yearMonthDayMatch) {
      const year = Number(yearMonthDayMatch[1]);
      const month = Number(yearMonthDayMatch[2]);
      const day = Number(yearMonthDayMatch[3]);
      return buildValidatedDate(year, month, day);
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    return null;
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

export const formatEventDate = (dateValue) => {
  const safeDate = parseDateValue(dateValue);
  if (!safeDate) return "";
  const day = `${safeDate.getDate()}`.padStart(2, "0");
  const month = `${safeDate.getMonth() + 1}`.padStart(2, "0");
  const year = safeDate.getFullYear();
  return `${day}-${month}-${year}`;
};

// export const formatDateForApi = (dateValue) => formatEventDate(dateValue);

// export const formatDateForDisplay = (dateValue) => formatEventDate(dateValue);

export const to24HourTime = (timeValue) => {
  if (!timeValue) return "";
  if (/^\d{1,2}:\d{2}$/.test(timeValue)) return timeValue;
  const match = timeValue.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return timeValue;
  let hour = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minutes}`;
};
