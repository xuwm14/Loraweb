import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  notification,
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './OrderNode.less';
import $ from 'jquery';
import { server_url, getAuth } from '@/services/api';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const FormItem = Form.Item;
const range = 10;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['success', 'error', 'processing','default' ];
const status = ['无人预约', '关闭预约', '有他人预约', '已被预约' ];
const maxOrderNum = 8;

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleModalVisible, selectedRows, getAllOrder } = props;
  const okHandle = () => {
    var s = new Array(), e = new Array();
    for (var i = 0; i < selectedRows.length; i++) {
      s.push(new Date(selectedRows[i].startTime));
      e.push(new Date(selectedRows[i].endTime));
    }
    $.ajax({
      type: 'post',
      url: server_url + '/order/new',
      xhrFields: {
        withCredentials: true
      },
      traditional:true,
      crossDomain: true, 
      data: {
        startTime: s,
        endTime: e
      }, 
      success: data => {
        // console.log(data);
      },
      complete: data => {
        handleModalVisible();
        if (data.statusText == "success" && data.status == 200) {
          var res = JSON.parse(data.responseText);
          if (res.code == 1) {
            getAllOrder(selectedRows);
            notification.open({
              message: '提示',
              description: '预约成功！',
            });
          } else {
            notification.open({
              message: '提示',
              description: '预约失败，部分时间已经无法预约！',
            });
          }
        } else {
          notification.open({
            message: '提示',
            description: '预约失败！',
          });
        }
      }
    });
  };
  let order_list = [];
  for (var i = 0; i < selectedRows.length; i++) {
    order_list.push(<p>预约{i + 1} : { moment(selectedRows[i].startTime).format('YYYY-MM-DD HH:mm:ss') } -- { moment(selectedRows[i].endTime).format('YYYY-MM-DD HH:mm:ss') }</p>);
  }
    
  return (
    <Modal
      destroyOnClose
      title="批量预约"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
    <h1>您选择了以下{ selectedRows.length }个预约，请确认</h1>
    { order_list }
    </Modal>
  );
});

/* eslint react/no-multi-comp:0 */
@connect(({ orders, loading }) => ({
  orders,
  loading: loading.models.rule,
}))
@Form.create()
class OrderNode extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    selectedRows: [],
    my_order: 0,
    timeRange: [moment().startOf("day"), moment().add(range + 1, 'days').startOf("day")],
  };

  columns = [
    {
      title: '使用开始时间',
      dataIndex: 'startTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '使用结束时间',
      dataIndex: 'endTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '节点使用时间',
      dataIndex: 'time',
      sorter: true,
      render: val => `${val} 小时`,
    },
    {
      title: '预约状态',
      dataIndex: 'status',
      sorter: true,
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
        {
          text: status[2],
          value: 2,
        },
        {
          text: status[3],
          value: 3,
        },
      ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
  ];

  componentDidMount() {
    this.getAllOrder();
    getAuth();
  }

  getAllOrder = (rows) => {
    const { dispatch } = this.props;
    $.ajax({
      type: 'post',
      url: server_url + '/order/getorder',
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true, 
      data: {}, 
      success: data => {
        data = JSON.parse(data);
        if (data.code == 1) {
          // console.log(data);
          this.state.my_order = data.myorder_count;
          var rlt = [];
          var list = data.order_list;
          list.sort();
          for (var i = 0; i < list.length; i++) {
            for (var j = list.length - 1; j > i; j--) {
              if (list[j]["start_time"] < list[j - 1]["start_time"]) {
                var l = list[j];
                list[j] = list[j - 1];
                list[j - 1] = l;
              }
            }
          }
          var key = 0;
          for (var i = 0; i < list.length; i++) {
            if (list[i].status != 4)
              rlt.push({ "startTime": list[i].start_time, "endTime":list[i].end_time, "status": list[i].status, "time": 1, "key": key++, "disabled": list[i].status != 0 && list[i].status != 2});
          }
          var pag = {
            total: rlt.length,
            pageSize: 10,
            current: 1,
          };
          dispatch({
            type: 'orders/fetch',
            payload: {
              list: rlt,
              pagination: pag,
            }
          });
          dispatch({
            type: 'orders/rows',
            payload: [],
          })
        }
      },
      complete: data => {
        if (data.statusText != "success" || data.status != 200) {
          notification.open({
            message: '提示',
            description: '网络错误，您无法看到数据或看到的是不正确的数据！',
          });
        }
      }
    });
  }

  handleOrderSubmmit = () => {
    const { selectedRows } = this.props.orders;
    const { my_order } = this.state;
    if (selectedRows.length == 0)
      notification.open({
        message: '提示',
        description: '您尚未选择预约时间，无法提交预约。',
      });
    else if (my_order + selectedRows.length > maxOrderNum) 
      notification.open({
        message: '提示',
        description: '您选择的预约数加上已成功预约的时间大于' + maxOrderNum + '个小时，无法提交预约。如果想更改预约时间，请取消部分预约后再继续预约！',
      });
    else {
      this.handleModalVisible(true);
    }
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, orders } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'orders/sort',
      payload: { params, orders },
    });
  };

  handleFormReset = () => {
    const { dispatch, orders } = this.props;
    dispatch({
      type: 'orders/reset',
      payload: orders.source_data,
    });
  };

  handleSelectRows = keys => {
    const { dispatch, orders: { first_data } } = this.props;
    // console.log(keys);
    // console.log(first_data);
    var rows = [], list = first_data.list;
    for (var j = 0; j < keys.length; j++) {
      for (var i = 0; i < list.length; i++) {
        if (keys[j] == list[i].key) {
          rows.push(list[i]);
          break;
        }
      }
    }
    // console.log(rows);
    dispatch ({
      type: 'orders/rows',
      payload: rows
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  disabledDate = (current) => {
    const sADay = moment().add(range + 1, 'days').endOf("day");
    return current && (current < moment().startOf('day') ||  current > sADay);
  }

  handleRangeChange = (time0) => {
    if (time0.length == 2)
      this.state.timeRange = time0;
  }

  handleRangeReset = () => {
    this.state.timeRange = [ moment().startOf("day"), moment().add(range + 1, 'days').startOf("day") ];
    console.log(this.state.timeRange);
  }

  setRangeTime = () => {
    const { dispatch, orders } = this.props;
    dispatch({
      type: 'orders/range',
      payload: { "range": this.state.timeRange, "source_data": orders.first_data }
    });
  }

  render() {
    const {
      orders: { data, source_data, selectedRows },
      loading,
      dispatch,
    } = this.props;
    const { modalVisible, updateModalVisible, stepFormValues, my_order } = this.state;

    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
    };

    return (
      <PageHeaderWrapper title="节点预定">
        <Card bordered={false}>
          <div className={styles.tableListForm}>
            <RangePicker disabledDate={ this.disabledDate }
              onChange = { (time0) => this.handleRangeChange(time0) }
              defaultValue={[moment().startOf("day"), moment().add(range + 1, 'days').startOf("day")]}
              format="YYYY-MM-DD HH:mm:ss"
              showTime={{ format: 'HH' }}
              onOk = { (time0) => this.handleRangeChange(time0) }
              />
            <Button style={{ marginLeft: "30px" }} type="primary" onClick={ () => this.setRangeTime() }>筛选</Button>
          </div>
          <br />
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleOrderSubmmit()}>
                批量预约
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              total={my_order + selectedRows.length}
              columns={this.columns}
              onSelectRowkey={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} selectedRows={selectedRows} getAllOrder={this.getAllOrder} />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default OrderNode;
