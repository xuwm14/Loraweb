import { queryRule, removeRule, addRule, updateRule } from '@/services/api';

export default {
  namespace: 'users',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    source_data: {
      list: [],
      pagination: {},
    },
    selectedRows: []
  },

  effects: {
    *changeRows({ payload }, { call, put }) {
      yield put({
        type: 'rows',
        payload: payload,
      });
    },
    *fetch({ payload }, { call, put }){
      yield put({
        type: 'save2',
        payload: payload,
      });
    },
    *range({ payload }, { call, put }) {
      var data0 = payload.range[0].valueOf(), data1 = payload.range[1].valueOf();
      var new_list = [], list = payload.source_data.list;
      for (var i = 0; i < list.length; i++) {
        if (list[i].startTime >= data0 && list[i].startTime <= data1)
          new_list.push(list[i]);
      }
      var data = {
        list: new_list,
        pagination: {
          total: new_list.length,
          pageSize: payload.source_data.pagination.pageSize,
          current: 1
        },
      };
      yield put({
        type: 'save2',
        payload: data,
      });
    },
    *reset({ payload }, { call, put }) {
      yield put({
        type: 'save3',
        payload: payload,
      });
    },
    *sort({ payload }, { call, put }) {
      let params = payload.params;
      let dataSource = payload.users.source_data.list;

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
        type: 'save3',
        payload: result,
      });
    },
  },

  reducers: {
    rows(state, action) {
      return {
        ...state,
        selectedRows: action.payload,
      };
    },
    save2(state, action) {
      return {
        ...state,
        source_data: action.payload,
        data: action.payload,
      };
    },
    save3(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
