import { stringify } from 'qs';
import request from '@/utils/request';
import { reloadAuthorized } from '@/utils/Authorized';
import { setAuthority, getAuthority } from '@/utils/authority';
import { routerRedux } from 'dva/router';
import $ from 'jquery';

var server_url = "http://thulpwan.net:8080";
export { server_url };

export async function getAuth() {
  $.ajax({
    // async: false,
    type: 'post',
    url: server_url + '/order/canuse', 
    data: {}, 
    xhrFields: {
      withCredentials: true
    },
    crossDomain: true,
    success: data => {
      data = JSON.parse(data);
      if(data.code == -1) {
        setAuthority("guest");
        reloadAuthorized();
        window.location.reload();
        return;
      }
      if(getAuthority()[0] == "admin")
        return;
      if (data.code == 0) {
        setAuthority("user");
        reloadAuthorized();
      } else if (data.code == 1) {
        setAuthority("superUser");
        reloadAuthorized();
      }
    }
  });
}

export async function reloadAuth() {
  getAuth();
}

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'update',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function removeFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'delete',
    },
  });
}

export async function addFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'post',
    },
  });
}

export async function updateFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'update',
    },
  });
}

export async function fakeAccountLogin(params) {
  console.log(JSON.stringify(params).replace(/,/g, '&')); 
  return request('http://thulpwan.net/login?username=admin&password=342', {
    method: 'POST',
    headers: new Headers({
      'Origin': 'http://localhost:8000',
    }),
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/captcha?mobile=${mobile}`);
}
