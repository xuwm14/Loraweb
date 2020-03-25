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

import styles from './ManageUsers.less';

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
const statusMap = ['default', 'success', 'success', 'success',];
const status = ['未激活', '普通用户', '高级用户', '管理员'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleModalVisible, selectedRows, getUsers } = props;
  const okHandle = () => {
    console.log(selectedRows);
    var names = "";
    for (var i = 0; i < selectedRows.length; i++)
      names += selectedRows[i].username + " ";
    $.ajax({
      type: 'post',
      url: server_url + '/user/authority',
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true, 
      data: {
        username: names,
        power: 1
      }, 
      success: data => {
        // console.log(data);
      },
      complete: data => {
        // console.log(data);
        handleModalVisible();
        if (data.statusText == "success" && data.status == 200) {
          getUsers();
          notification.open({
            message: '提示',
            description: '操作用户成功！',
          });
        } else {
          notification.open({
            message: '提示',
            description: '操作用户失败！',
          });
        }
      }
    });
  };
  let order_list = [];
  for (var i = 0; i < selectedRows.length; i++) {
    order_list.push(<p>用户{i + 1} : { selectedRows[i].username }</p>);
  }
    
  return (
    <Modal
      destroyOnClose
      title="取消预约"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
    <h1>您即将提升以下{ selectedRows.length }个用户为普通用户，请确认</h1>
    { order_list }
    </Modal>
  );
});

/* eslint react/no-multi-comp:0 */
@connect(({ users, loading }) => ({
  users,
  loading: loading.models.rule,
}))
@Form.create()
class ManageUsers extends PureComponent {
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
      title: '用户名',
      dataIndex: 'username',
      render: val => <span>{val}</span>,
    },
    {
      title: '用户状态',
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
    this.getUsers();
    getAuth();
  }

  getUsers = () => {
    const { dispatch } = this.props;
    this.state.selectedRows = [];
    $.ajax({
      type: 'post',
      url: server_url + '/user/getUsers',
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true, 
      data: {}, 
      success: data => {
      	data = JSON.parse(data);
      	if (data.code != 1) {
      		notification.open({
				message: '提示',
				description: '您无权限查看相关数据！',
			});
      	}
      	var list = data.users, users = [];
      	for (var i in list) {
      		users.push({ "username": list[i].username, "status": list[i].status, "key": i, "disabled": list[i].status == 3 });
      	};
      	var data = {
      		list: users,
      		pagination: {
      			total: users.length,
      			pageSize: 10,
      			current: 1
      		}
      	};
        dispatch({
        	type: "users/fetch",
        	payload: data
        })
      },
      error: data => {
    		notification.error({
    			message: '提示',
    			description: '网络错误，您无法看到数据或看到的是不正确的数据！',
    		});
      }
    });
  }

  handleOrderSubmmit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0)
      notification.open({
        message: '提示',
        description: '您尚未选择操作的用户目标。',
      });
    else {
      for (var i = 0; i < selectedRows.length; i++) {
        if (selectedRows[i].status != 0) {
          notification.open({
            message: '提示',
            description: '您选择的用户中有不处于未激活状态的用户。',
          });
          return;
        }
      }
      this.handleModalVisible(true);
    }
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, users } = this.props;
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
      type: 'users/sort',
      payload: { params, users },
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
      users: { data },
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
              <Button type="primary" onClick={() => this.handleOrderSubmmit()}>
                升为普通用户
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
        <CreateForm {...parentMethods} modalVisible={modalVisible} selectedRows={ selectedRows } getUsers={this.getUsers}/>
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

export default ManageUsers;
