import { queryRule, removeRule, addRule, updateRule } from '@/services/api';

export default {
  namespace: 'gateway',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      let rlt = payload.gatewayList, list = rlt.status;
      let data = [];
      for (let i = 0; i < list.length; i++) {
        data.push({
          key:i, 
          latitude: rlt.latitude_position[i], 
          longitude: rlt.longitude_position[i], 
          status: rlt.status[i], 
          nodeId: rlt.gatewayId[i], 
          freq: rlt.frequency[i],
          MAC: rlt.MAC[i],
          disabled: payload.status[i] == 2,
        });
      }
      yield put({
        type: 'save',
        payload: {
          list: data,
          pagination: {}
        },
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put }) {
      yield put({
        type: 'save',
        payload: payload,
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
