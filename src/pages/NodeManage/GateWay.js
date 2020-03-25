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
  Progress,
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

import styles from './GateWay.less';
import node_success from '../assets/node_success.png';
import node_close from '../assets/node_close.png';
import node_error from '../assets/node_error.png';

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
const statusMap = ['default', 'success', 'error' ];
const status = [ '已关闭', '运行中', '无法使用' ];
const freq = ["470.3 ~ 471.7 MHz", "471.9 ~ 473.3 MHz", "473.5 ~ 474.9 MHz", "475.1 ~ 476.5 MHz", "476.7 ~ 478.1 MHz", "478.3 ~ 479.7 MHz", 
              "479.9 ~ 481.3 MHz", "481.5 ~ 482.9 MHz", "483.1 ~ 484.5 MHz", "484.7 ~ 486.1 MHz", "486.3 ~ 487.7 MHz", "487.9 ~ 489.3 MHz" ];

const baiduMapSDK = "/getmaps";

/* eslint react/no-multi-comp:0 */
@connect(({ gateway, loading }) => ({
  gateway,
  loading: false,
}))
@Form.create()
class NodeManage extends PureComponent {
  state = {
    mapVisible: false,
    proVisible: [],
    updatemapVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    viewType: true,
  };

  columns = [
    {
      title: '节点ID',
      dataIndex: 'nodeId',
      render: val => <span>{val}</span>,
    },
    {
      title: 'Mac地址',
      dataIndex: 'MAC',
      render: val => <span>{val}</span>,
    },
    {
      title: '节点状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '运行频率',
      align:'center',
      render: val => {
        return <Dropdown disabled={val.status!=1}  
                overlay={
                  <Menu onClick={(p) => this.handleFreqClick(p, val)} >
                    <Menu.Item key="1">{freq[0]}</Menu.Item>
                    <Menu.Item key="2">{freq[1]}</Menu.Item>
                    <Menu.Item key="3">{freq[2]}</Menu.Item>
                    <Menu.Item key="4">{freq[3]}</Menu.Item>
                    <Menu.Item key="5">{freq[4]}</Menu.Item>
                    <Menu.Item key="6">{freq[5]}</Menu.Item>
                    <Menu.Item key="7">{freq[6]}</Menu.Item>
                    <Menu.Item key="8">{freq[7]}</Menu.Item>
                    <Menu.Item key="9">{freq[8]}</Menu.Item>
                    <Menu.Item key="10">{freq[9]}</Menu.Item>
                    <Menu.Item key="11">{freq[10]}</Menu.Item>
                    <Menu.Item key="12">{freq[11]}</Menu.Item>
                  </Menu>
                } trigger={['click']}>
                <Button style={{ marginLeft: 8 }}>{freq[val.freq-1]}<Icon type="down" /></Button>
              </Dropdown>;
      },
    },
    {
      title: '地点信息',
      align:'center',
      render: val => {
        return <Button icon="info-circle" type="primary" onClick={ () => this.showMap(val) }>查看地点</Button>;
      },
    },
    {
      title: '网关操作',
      align:'center',
      render: val => {
        return <Button icon="caret-right" type="primary" disabled={ val.status != 0 } onClick={ () => { window.open("https://thulpwan.net/gateone/"); } }>控制网关</Button>;
      },
    },
  ];

  uploadFile = (val) => {
    // notification.open({
    //   message: '提示',
    //   description: val,
    // });
  }

  showMap = (val) => {
    this.handleMapVisible(true);
    setTimeout(function() {
      var map = new BMap.Map("map", {minZoom: 15, maxZoom: 40});    // 创建Map实例
      map.centerAndZoom(new BMap.Point(val.longitude, val.latitude), 40);  // 初始化地图,设置中心点坐标和地图级别

      var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});
      var top_left_navigation = new BMap.NavigationControl(); 
      map.addControl(new BMap.MapTypeControl({ 
        mapTypes:[
            BMAP_NORMAL_MAP,
        ]}));   
      map.addControl(top_left_control);
      map.addControl(top_left_navigation);
      map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
      map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

      var myIcon;
      if (val.status == 0)
        myIcon = new BMap.Icon(node_success, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      else if (val.status == 1)
        myIcon = new BMap.Icon(node_close, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      else
        myIcon = new BMap.Icon(node_error, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      var point = new BMap.Point(val.longitude, val.latitude);
      var label = new BMap.Label("经度：" + val.longitude + "<br>纬度：" + val.latitude, { offset:new BMap.Size(30, -30) });
      var marker = new BMap.Marker(point, { icon:myIcon }); 
      map.addOverlay(marker);  
      marker.setLabel(label);
    }, "100");
  }

  handleFreqClick = (p, val) => {
    console.log(p);
    console.log(val);
    var key = `1`;
    var btn = (
      <Button type="primary" size="small" onClick={() => this.changeFreq(p, val, key)}>
        确定
      </Button> 
    );
    notification.open({
      message: '提示',
      description: '您确定要修改该网关' + val.nodeId + '的频率为' + freq[parseInt(p.key) - 1] + '吗？',
      btn,
      key,
    });
  }

  changeFreq = (p, val, key) => {
    notification.close(key);
    $.ajax({
      type: 'post',
      url: server_url + '/gateway/frequency', 
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      data: {
        "ids": [val.nodeId],
        "frequency": p.key
      }, 
      success: data => {},
      complete: data => {
        if (data.statusText != "success" || data.status != 200) {
          notification.error({
            message: '错误',
            description: '修改频率失败失败！',
          });
        } else {
          notification.success({
            message: '成功',
            description: '修改频率成功！操作可能存在数秒钟的延迟，请耐心等待！',
          });
        }
      }
    })
  }

  operates = (val) => {
    var rows = this.state.selectedRows;
    if (rows.length == 0) {
      notification.info({
        message: '提示',
        description: '您尚未选择节点，无法进行批量操作！',
      });
    } else if(val == 0) {
      var ids = [];
      for (let row of rows) {
        ids.push(row.nodeId);
        if (row.status != 3 && row.status != 0) {
          notification.warning({
            message: '警告',
            description: '您选择的节点中有已启动或者无法使用的节点！',
          });
          return;
        }
      }
      this.operateNode(ids, val);
    } else {
      var ids = [];
      for (let row of rows) {
        ids.push(row.nodeId);
        if (row.status == 3 || row.status == 0 || row.status == 4) {
          notification.warning({
            message: '警告',
            description: '您选择的节点中有已关闭、烧录中或者无法使用的节点！',
          });
          return;
        }
      }
      this.operateNode(ids, val);
    }
  }

  operateNode = (id, opt) => {
    var str = ["启动", "关闭", "重启"];
    var ids = [id];
    $.ajax({
      type: 'post',
      url: server_url + '/gateway/operate', 
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      data: {
        "ids": ids,
        "opt": opt
      }, 
      success: data => {},
      complete: data => {
        if (data.statusText != "success" || data.status != 200) {
          notification.error({
            message: '错误',
            description: '网关' + str[opt] + '失败！',
          });
        } else {
          notification.success({
            message: '成功',
            description: '网关' + str[opt] + '成功！操作可能存在数秒钟的延迟，请耐心等待！',
          });
        }
      }
    });
  }

  handleDownload = (id) => {
    var ids = new Array();
    ids.push(id);
    this.downloadNode(ids);
  }

  downloadNode = (ids) => {
    $.ajax({
      type: 'post',
      url: server_url + '/node/data', 
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      data: {
        "id": ids[0],
        "starttime": new Date(1541073600085),
        "endtime": new Date()
      }, 
      success: data => {},
      complete: data => {
        console.log(data);
      }
    })
  }

  componentWillMount() {
    const { dispatch, onCreate } = this.props;
    const { viewType } = this.state;
    getAuth();
    $.ajax({
      // async: false,
      type: 'get',
      // url: server_url + '/order/getallnode',
      url: server_url + '/order/getallnode',
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,      
      data: {}, 
      success: data => {
        $.getScript("http://api.map.baidu.com/getscript?v=3.0&ak=ecTz4cxT7Ss7PXvycAukomg91sxCllWO&services=&t=20181029164750", function() {});
        dispatch({
          type: 'gateway/fetch',
          payload: JSON.parse(data)
        });
      },
      complete: data => {
        if (data.statusText != "success" || data.status != 200) {
          notification.open({
            message: '提示',
            description: '网络错误，您无法看到数据或看到的是不正确的数据！',
          });
        }
      }
    })
  }

  componentDidMount() {}

  handleMapVisible = flag => {
    this.setState({
      mapVisible: !!flag,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, node } = this.props;
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
      type: 'node/sort',
      payload: { params, node },
    });
  };

  render() {
    const {
      gateway: { data },
      loading,
    } = this.props;
    const { selectedRows, mapVisible, mapNode } = this.state;

    return (
      <PageHeaderWrapper 
        title="网关列表"
        >
        <Modal
          destroyOnClose
          title="网关地图"
          visible={mapVisible}
          footer={null}
          onCancel={() => this.handleMapVisible()}>
          <div id="map" className={ styles.mapForm }></div>
        </Modal>
        <Card bordered={false}>
            <StandardTable
              selectedRows={selectedRows}
              selections={false}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              showPage={false}
            />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default NodeManage;
