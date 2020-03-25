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
import $ from 'jquery';
import { server_url, getAuth } from '@/services/api';

import styles from './MyOrder.less';

const FormItem = Form.Item;
const range = 30;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['processing', 'success','error', 'default'];
const status = ['预约审批中', '预约成功', '预约失败', '已过使用时间'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleModalVisible, selectedRows, getMyOrders } = props;
  const okHandle = () => {
    console.log(selectedRows[0].startTime);
    var ids = new Array();
    for (var i = 0; i < selectedRows.length; i++)
      ids.push(selectedRows[i].key);
    $.ajax({
      type: 'post',
      url: server_url + '/order/cancel',
      xhrFields: {
        withCredentials: true
      },
      traditional: true,
      crossDomain: true, 
      data: {
        orderId: ids
      }, 
      success: data => {
        // console.log(data);
      },
      complete: data => {
        // console.log(data);
        handleModalVisible();
        if (data.statusText == "success" && data.status == 200) {
          getMyOrders();
          notification.open({
            message: '提示',
            description: '取消预约成功！',
          });
        } else {
          notification.open({
            message: '提示',
            description: '取消预约失败！',
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
      title="取消预约"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
    <h1>您即将取消以下{ selectedRows.length }个预约，请确认</h1>
    { order_list }
    </Modal>
  );
});

/* eslint react/no-multi-comp:0 */
@connect(({ myorder, loading }) => ({
  myorder,
  loading: loading.models.rule,
}))
@Form.create()
class MyOrder extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
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
      // mark to display a total number
      needTotal: true,
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
    this.getMyOrders();
    getAuth();
  }

  getMyOrders = () => {
    const { dispatch } = this.props;
    $.ajax({
      type: 'post',
      url: server_url + '/order/getmyorder',
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true, 
      data: {}, 
      success: data => {
        data = JSON.parse(data);
        if (data.code == 1) {
          var rlt = [];
          var list = data.order_list;
          list.sort();
          for (var i = 0; i < list.length; i++) {
            for (var j = list.length - 1; j > i; j--) {
              if (list[j]["start_time"] > list[j - 1]["start_time"]) {
                var l = list[j];
                list[j] = list[j - 1];
                list[j - 1] = l;
              }
            }
          }
          for (var i = 0; i < list.length; i++) {
            var dis = false;
            if (list[i].start_time < new Date() && list[i].status != 2) {
              list[i].status = 3;
            }
            if (list[i].status == 2 || list[i].status == 3)
              dis = true;
            rlt.push({ "startTime": list[i].start_time, "endTime":list[i].end_time, "status": list[i].status, "time": 1, "key": list[i].id, "disabled": dis});
          }
          var pag = {
            total: rlt.length,
            pageSize: 10,
            current: 1,
          };
          dispatch({
            type: 'myorder/fetch',
            payload: {
              list: rlt,
              pagination: pag,
            }
          });
          this.setState({
            selectedRows: [],
          }); 
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
    const { selectedRows } = this.state;
    if (selectedRows.length == 0)
      notification.open({
        message: '提示',
        description: '您尚未选择取消预约的目标。',
      });
    else {
      this.handleModalVisible(true);
    }
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, myorder } = this.props;
    const { formValues } = this.state;

    // console.log(this.props.myorder);

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

    dispatch( {
      type: 'myorder/sort',
      payload: params,
      payload: { params, myorder },
    });

    // window.setTimeout(() => {
    //   console.log(this.props.myorder);
    // }, 1000)
  };

  // handleFormReset = () => {
  //   const { form, dispatch } = this.props;
  //   form.resetFields();
  //   this.setState({
  //     formValues: {},
  //   });
  //   dispatch({
  //     type: 'rule/fetch',
  //     payload: {},
  //   });
  // };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
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
    const sADay = moment().add(range, 'days')
    return current && (current < moment().startOf('day') ||  current > sADay);
  }

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    const { RangePicker } = DatePicker;
    const range_num = [ moment().startOf('day'), moment().add(range, 'days') ];

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="预约范围">
              {getFieldDecorator('date_range', {initialValue: range_num})(
                <RangePicker style={{ width: '150%' }} 
                  allowClear={false}
                  disabledDate={this.disabledDate}
                  default={this.range}/>
              )}
            </FormItem>
          </Col>
          
          <Col md={8} sm={24}>
            <span className={styles.submitButtons} style={{ paddingLeft:"40%" }}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      myorder: { data },
      loading,
    } = this.props;
    const { selectedRows, modalVisible, updateModalVisible, stepFormValues } = this.state;

    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
    };
    return (
      <PageHeaderWrapper title="我的预定">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleOrderSubmmit()}>
                取消预约
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} selectedRows={ selectedRows } getMyOrders={this.getMyOrders}/>
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

export default MyOrder;
