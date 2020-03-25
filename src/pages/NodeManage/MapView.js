import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  notification,
  Avatar,
  Row,
  Col,
  Card,
  Upload,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  Skeleton,
  DatePicker,
  Layout,
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

import styles from './MapView.less';

import node_success from '../assets/node_success.png';
import node_close from '../assets/node_close.png';
import node_error from '../assets/node_error.png';
import net_close from '../assets/net_close.png';
import net_error from '../assets/net_error.png';
import net_success from '../assets/net_success.png';

const freq = ["470.3 ~ 471.7 MHz", "471.9 ~ 473.3 MHz", "473.5 ~ 474.9 MHz", "475.1 ~ 476.5 MHz", "476.7 ~ 478.1 MHz", "478.3 ~ 479.7 MHz", 
              "479.9 ~ 481.3 MHz", "481.5 ~ 482.9 MHz", "483.1 ~ 484.5 MHz", "484.7 ~ 486.1 MHz", "486.3 ~ 487.7 MHz", "487.9 ~ 489.3 MHz" ];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleModalVisible, node_select, data} = props;
  const { Meta } = Card;
  let id = 0, mac = 0, lon = 0, lat = 0, status = 0;
  let select = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i].nodeId == node_select) {
      select = i;
      break;
    }
  }
  if (data.length > 0 && select > -1) {
    id = data[select].nodeId;
    mac = data[select].MAC;
    lon = data[select].longitude;
    lat = data[select].latitude;
    status = data[select].status;
  }

  const buttons = [
    null,
    [
      <Button key="upload" type="primary">上传文件</Button>,
      <Button key="download" type="primary">下载数据</Button>,
      <Button key="log">查看日志</Button>,
      <Button key="close" type="danger">关闭</Button>,
      <Button key="restart" type="danger">重启</Button>,
    ],[
      <Button key="upload" type="primary">上传文件</Button>,
      <Button key="download" type="primary">下载数据</Button>,
      <Button key="log">查看日志</Button>,
      <Button key="close" type="danger">关闭</Button>,
      <Button key="restart" type="danger">重启</Button>,
    ],[
      <Button key="upload" type="primary">上传文件</Button>,
      <Button key="download" type="primary">下载数据</Button>,
      <Button key="log">查看日志</Button>,
      <Button key="start" type="primary">开启</Button>,
    ],[
      <Button key="upload" type="primary">上传文件</Button>,
      <Button key="download" type="primary">下载数据</Button>,
      <Button key="log">查看日志</Button>,
      <Button key="close" type="danger">关闭</Button>,
      <Button key="restart" type="danger">重启</Button>,
    ]
  ];

  const states = ['无法使用', '可烧录', '运行中', '已关闭', '烧录中' ];

  const btns = buttons[status];

  return (
    <Modal
      destroyOnClose
      title="节点信息"
      visible={modalVisible}
      footer={null}
      onCancel={() => handleModalVisible()}
    >
      <p>节点ID: { id }</p>
      <p>MAC地址: { mac }</p>
      <p>经度: { lon }</p>
      <p>纬度: { lat }</p>
      <p>节点状态: { states[status] }</p>
    </Modal>
  );
});

const GateForm = Form.create()(props => {
  const { modalVisible, form, handleModalVisible2, gate_select, data} = props;
  const { Meta } = Card;
  let id = 0, mac = 0, lon = 0, lat = 0, status = 0, freq_index = 0;
  let select = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i].nodeId == gate_select) {
      select = i;
      break;
    }
  }
  if (data.length > 0 && select > -1) {
    id = data[select].nodeId;
    mac = data[select].MAC;
    lon = data[select].longitude;
    lat = data[select].latitude;
    status = data[select].status;
    freq_index = data[select].freq;
  }

  const buttons = [
    [
      <Button key="start" type="primary">开启</Button>,
    ],[
      <Button key="close" type="danger">关闭</Button>,
      <Button key="restart" type="danger">重启</Button>,
    ],null
  ];

  const states = ['关闭中', '运行中', '无法使用' ];

  const btns = buttons[status];

  return (
    <Modal
      destroyOnClose
      title="网关信息"
      visible={modalVisible}
      footer={null}
      onCancel={() => handleModalVisible2()}
    >
      <p>网关ID: { id }</p>
      <p>MAC地址: { mac }</p>
      <p>运行频率: { freq[freq_index-1] }</p>
      <p>经度: { lon }</p>
      <p>纬度: { lat }</p>
      <p>网关状态: { states[status] }</p>
    </Modal>
  );
});

const { Header, Content, Footer, Sider } = Layout;
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
const statusMap = ['success', 'processing', 'error'];
const status = ['运行中', '已关闭', '停止使用'];

/* eslint react/no-multi-comp:0 */
@connect(({ node, gateway, loading }) => ({
  node,
  gateway,
  loading: loading.models.node,
}))
@Form.create()
class MapView extends PureComponent {
  state = {
    gate_select: -1,
    node_select: 0,
    modalVisible: false,
    nodalVisible2: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    viewType: true,
  };

  selectNode = (id1, id2) => {
    this.setState({
      node_select: id1,
      gate_select: id2
    });
  }

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleModalVisible2 = flag => {
    this.setState({
      modalVisible2: !!flag,
    });
  };

  uploadFile = (val) => {
    // notification.open({
    //   message: '提示',
    //   description: val,
    // });
    console.log(window);
    console.log(window.BMap);
  }

  handleMenuClick = (val, key) => {
    if (key.key == "start") {
      if (val.status != 1) {
        notification.open({
          message: '提示',
          description: '节点处于运行或无法使用状态，不可执行启动操作.',
        });
      }
      else {
        $.ajax({
          type: 'post',
          url: server_url + '/node/opt', 
          xhrFields: {
            withCredentials: true
          },
          crossDomain: true,
          data: {
            nodeId: val.nodeId,
            opt: 1
          }, 
          success: data => {
            console.log(data);
          }
        })
      }
    } else if (key.key == "close") {
      if (val.status != 0) {
        notification.open({
          message: '提示',
          description: '节点处于关闭或无法使用状态，不可执行关闭操作.',
        });
      }
    }
    else if (key.key == "restart") {
      if (val.status != 0) {
        notification.open({
          message: '提示',
          description: '节点处于关闭或无法使用状态，不可执行重启操作.',
        });
      }
    }
  }

  addMap = (payload) => {
    var handleModalVisible = this.handleModalVisible, selectNode =  this.selectNode, handleModalVisible2 = this.handleModalVisible2;
    let data = [];
    if (payload.code == 1) {
      for (let i = 0; i < payload.nodeId.length; i++) {
        data.push({
          key: payload.nodeId[i], 
          latitude: payload.latitude_position[i], 
          longitude: payload.longitude_position[i], 
          status: payload.status[i], 
          nodeId: payload.nodeId[i], 
          MAC: payload.MAC[i],
          disabled: payload.status[i] == 2,
        });
      }
    }
    var dom1 = $(".ant-layout-content")[0];
    $("#allmap").css("height", (dom1.clientHeight) + "px");

    var map = new BMap.Map("allmap", {minZoom: 15, maxZoom: 40});    // 创建Map实例
    map.centerAndZoom(new BMap.Point(116.340956, 40.006628), 15);  // 初始化地图,设置中心点坐标和地图级别

    var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});
    var top_left_navigation = new BMap.NavigationControl(); 
    map.addControl(new BMap.MapTypeControl({ 
      mapTypes:[
          BMAP_NORMAL_MAP,
      ]
    }));   
    map.addControl(top_left_control);
    map.addControl(top_left_navigation);
    map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
    var list0 = payload.gatewayList;

    for (var i = 0; i < data.length; i++) {
      var myIcon;
      if (data[i].status == 1 || data[i].status == 2 || data[i].status == 4)
        myIcon = new BMap.Icon(node_success, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      else if (data[i].status == 3)
        myIcon = new BMap.Icon(node_close, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      else
        myIcon = new BMap.Icon(node_error, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      var point = new BMap.Point(data[i].longitude, data[i].latitude);
      var label = new BMap.Label("节点" + data[i].nodeId, { offset:new BMap.Size(20, -20) });
      var marker = new BMap.Marker(point, { icon:myIcon }); 
      map.addOverlay(marker);  
      marker.setLabel(label);
      marker.addEventListener("click", function(e) {
        var cnt = e.target.getLabel().content.substring(2);
        selectNode(cnt, -1);
        handleModalVisible(true);
      });
    }

    for (var i = 0; i < list0.status.length; i++) {
      var myIcon;
      if (list0.status[i] == 1)
        myIcon = new BMap.Icon(net_success, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      else if (list0.status[i] == 0)
        myIcon = new BMap.Icon(net_close, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      else
        myIcon = new BMap.Icon(net_error, new BMap.Size(32,32), { anchor: new BMap.Size(15, 30) });
      var point = new BMap.Point(list0.longitude_position[i], list0.latitude_position[i]);
      var label = new BMap.Label("网关" + list0.gatewayId[i], { offset:new BMap.Size(20, -20) });
      var marker = new BMap.Marker(point, { icon:myIcon }); 
      map.addOverlay(marker);  
      marker.setLabel(label);
      marker.addEventListener("click", function(e) {
        var cnt = e.target.getLabel().content.substring(2);
        selectNode(-1, cnt);
        handleModalVisible2(true);
      });
    }
  }

  componentWillMount() {
    const { dispatch, onCreate, data } = this.props;
    const { viewType } = this.state;
    const addMap = this.addMap;
    getAuth();
    $.ajax({
      // async: false,
      type: 'get',
      url: server_url + '/order/getallnode',
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,      
      data: {}, 
      success: payload => {
        payload = JSON.parse(payload);
        dispatch({
          type: 'node/fetch',
          payload: payload
        });
        dispatch({
          type: 'gateway/fetch',
          payload: payload
        });
        $.getScript("http://api.map.baidu.com/getscript?v=3.0&ak=ecTz4cxT7Ss7PXvycAukomg91sxCllWO&services=&t=20181029164750", 
          function() {
            addMap(payload);
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

  render() {
    const {
      node: { data, source_data },
      gateway: gateway,
      loading,
    } = this.props;
    const { selectedRows, node_select, gate_select, modalVisible, modalVisible2, updateModalVisible, stepFormValues } = this.state;

    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
      handleModalVisible2: this.handleModalVisible2,
    };

    const content = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.contentLink}>
          <a>
            <img alt="" src={ node_success } />
            运行中节点
          </a>
          <a>
            <img alt="" src={ node_close } />
            关闭中节点
          </a>
          <a>
            <img alt="" src={ node_error } />
            无法使用的节点
          </a>
          <a>
            <img alt="" src={ net_success } />
            运行中网关
          </a>
          <a>
            <img alt="" src={ net_close } />
            关闭中网关
          </a>
          <a>
            <img alt="" src={ net_error } />
            无法使用的网关
          </a>
        </div>
      </div>
    );

    return (
      <PageHeaderWrapper 
        title="节点地图"
        content={content}
        >
        <Content id="allmap"></Content>
        <CreateForm {...parentMethods} modalVisible={modalVisible} node_select={node_select} data={data.list}/>
        <GateForm {...parentMethods} modalVisible={modalVisible2} gate_select={gate_select} data={gateway.data.list}/>
      </PageHeaderWrapper>
    );
  }
}

export default MapView;
