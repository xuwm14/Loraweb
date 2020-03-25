import { queryRule, removeRule, addRule, updateRule } from '@/services/api';

export default {
  namespace: 'node',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    source_data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      let data = [];
      if (payload.code == 1) {
        for (let i = 0; i < payload.nodeId.length; i++) {
          data.push({
            key:i, 
            latitude: payload.latitude_position[i], 
            longitude: payload.longitude_position[i], 
            status: payload.status[i], 
            nodeId: payload.nodeId[i], 
            MAC: payload.MAC[i],
            disabled: payload.status[i] == 0,
          });
        }
      }
      var rlt = {
        list: data,
        pagination: {
          total: data.length,
          pageSize:10, 
          current: 1
        }};
      yield put({
        type: 'save',
        payload: rlt,
      });
    },
    *sort({ payload }, { call, put }) {
      let params = payload.params;
      let dataSource = payload.node.source_data.list;

      if (params.sorter) {
        const s = params.sorter.split('_');
        dataSource = dataSource.sort((prev, next) => {
          if (s[1] === 'descend') {
            return next[s[0]] - prev[s[0]];
          }
          return prev[s[0]] - next[s[0]];
        });
      }

      if (params.status) {
        const status = params.status.split(',');
        let filterDataSource = [];
        status.forEach(s => {
          filterDataSource = filterDataSource.concat(
            dataSource.filter(data => parseInt(data.status, 10) === parseInt(s[0], 10))
          );
        });
        dataSource = filterDataSource;
      }

      if (params.name) {
        dataSource = dataSource.filter(data => data.name.indexOf(params.name) > -1);
      }

      let pageSize = 10;
      if (params.pageSize) {
        pageSize = params.pageSize * 1;
      }

      const result = {
        list: dataSource,
        pagination: {
          total: dataSource.length,
          pageSize,
          current: parseInt(params.currentPage, 10) || 1,
        },
      };

      yield put({
        type: 'save2',
        payload: result,
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
        source_data: action.payload,
        data: action.payload,
      };
    },
    save2(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
