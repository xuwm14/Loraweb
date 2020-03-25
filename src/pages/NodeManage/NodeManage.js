import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  notification,
  Upload,
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

import styles from './NodeManage.less';
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
const statusMap = ['error', 'processing', 'success', 'default', 'processing' ];
const status = [ 'Error', 'Can burn', 'Running', 'Shutdown', 'Burning' ];

const baiduMapSDK = "/getmaps";

/* eslint react/no-multi-comp:0 */
@connect(({ node, loading }) => ({
  node,
  loading: loading.models.node,
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
      title: 'node ID',
      dataIndex: 'nodeId',
      sorter: true,
      render: val => <span>{val}</span>,
    },
    {
      title: 'Mac Address',
      dataIndex: 'MAC',
      render: val => <span>{val}</span>,
    },
    {
      title: 'Node State',
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
        {
          text: status[4],
          value: 4,
        },
      ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: 'Node Address',
      align:'center',
      render: val => {
        return <Button icon="info-circle" type="primary" onClick={ () => this.showMap(val) }>Show Address</Button>;
      },
    },
    {
      title: 'Burn',
      align:'center',
      render: val => {
        return <>
            <Upload
              customRequest={(option) => this.customRequest(option, val, this.props.dispatch, this.props.node.source_data)}
              beforeUpload = {this.beforeUpload}
              fileList={this.state.fileList} >
            <Button icon="upload" type="primary" disabled={ val.status != 1 && val.status != 2 }>Upload File</Button>
            {this.state.proVisible[val.key] && <Progress visible={false} percent={0} />}
            </Upload>
          </>;
      },
    },
    {
      title: 'Download',
      align:'center',
      render: val => { 
        return <Button icon="download" type="primary" disabled={ val.status == 0 || val.status == 3 } onClick={ () => this.handleDownload(val.nodeId) }>Download Data</Button>;
      },
    },
    {
      title: 'Logs',
      align:'center',
      render: val => {
        return <Button icon="info-circle" type="primary" disabled={ val.status == 0 || val.status == 3 } onClick={ () => this.viewLog(val) }>Show Log</Button>;
      },
    },
    {
      title: 'Others',
      align:'center',
      render: (val) => {
        return  (
        <Dropdown overlay=
          <Menu onClick={(key) => this.handleMenuClick(val, key)}>
            <Menu.Item key="start">
              启动节点
            </Menu.Item>
            <Menu.Item key="close">
              关闭节点
            </Menu.Item>
            <Menu.Item key="restart">
              重启节点
            </Menu.Item>
          </Menu>>
          <a href="javascript:;">
            More Opts <Icon type="down" />
          </a>
        </Dropdown>);
      },
    },
  ];

  customRequest = (option, val, dispatch, data)=> {
    var s = option.file.name.split(".");
    var s1 = s[s.length - 1];
    if (s1 != "bin") {
      notification.warning({
        message: '警告',
        description: '请选择bin文件！',
      });
      return;
    }
    const formData = new FormData();
    formData.append("ids", val.nodeId);
    formData.append("ischange", 0);
    formData.append('file',option.file);
    $.ajax({
      url: server_url + "/node/burn",
      method: 'post',
      processData: false,
      contentType:false,
      xhrFields: {
        withCredentials: true
      },
      enctype: "multipart/form-data",
      data: formData,
      success: (res) => {
        //res为文件上传成功之后返回的信息，res.responseText为接口返回的值
        notification.success({
          message: '成功',
          description: '节点' + val.nodeId + '正在烧录中，请在数秒后刷新页面！',
        });
        for (var i = 0; i < data.list.length; i++) {
          if (data.list[i].nodeId == val.nodeId)
            data.list[i].status = 4;
        }
        dispatch({
          type: 'node/update',
          payload: data
        });
      },
      error: () => {
        notification.error({
          message: '失败',
          description: '节点' + val.nodeId + '烧录失败！',
        });
      },
    });
  }

  multiburn = (option, dispatch, data)=> {
    var rows = this.state.selectedRows;
    var s = option.file.name.split(".");
    var s1 = s[s.length - 1];
    if (s1 != "bin") {
      notification.warning({
        message: '警告',
        description: '请选择bin文件！',
      });
      return;
    }
    if (rows.length == 0) {
      notification.warning({
        message: '警告',
        description: '您还未选择进行烧录的节点！',
      });
      return;
    }
    var ids = [];
    for (var i = 0; i < rows.length; i++) {
      ids.push(rows[i].nodeId); 
      if (rows[i].status != 2 && rows[i].status != 1) {
        notification.warning({
          message: '警告',
          description: '您选择的节点中有节点不处于开启状态！',
        });
        return;
      }
    }
    const formData = new FormData();
    formData.append("ids", ids);
    formData.append("ischange", 0);
    formData.append('file',option.file);
    $.ajax({
      url: server_url + "/node/burn",
      method: 'post',
      processData: false,
      contentType: false,
      xhrFields: {
        withCredentials: true
      },
      enctype: "multipart/form-data",
      data: formData,
      success: (res) => {
        //res为文件上传成功之后返回的信息，res.responseText为接口返回的值
        notification.success({
          message: '成功',
          description: '节点正在烧录中，请在数秒后刷新页面！',
        });
        for (var i = 0; i < rows.length; i++) {
           data.list[rows[i].key].status = 4;
        }
        dispatch({
          type: 'node/update',
          payload: data
        });
      },
      error: () => {
        notification.error({
          message: '失败',
          description: '节点批量烧录失败！',
        });
      },
    });
  }

  // uploadFile = (val) => {
  //   $("#load_bin").remove();
  //   document.upload = this.upload;
  //   $("#mulupload").append('<input type="file" id="load_bin" name="file" onchange ="{ upload() }">');
  //   // notification.open({
  //   //   message: '提示',
  //   //   description: val,
  //   // });
  // }

  upload = (val) => {
    // console.log($('#load_bin')[0].files[0]);
    var myform = new FormData();
    myform.append('file',$('#load_bin')[0].files[0]);
    myform.append("ids", 5);
    myform.append("ischange", 0);
    $.ajax({
        url: server_url + "/node/burn",
        type: "POST",
        data: {},
        processData: false,
        success: function (data) {
            console.log(data);
        },
        error:function(data){
            console.log(data)
        }
    });
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

  handleMenuClick = (val, key) => {
    if (key.key == "start") {
      if (val.status != 3 && val.status != 0) {
        notification.open({
          message: '提示',
          description: '节点处于运行或无法使用状态，不可执行启动操作.',
        });
      }
      else {
        var id = new Array();
        id.push(val.nodeId);
        this.operateNode(id, 0);
      }
    } else if (key.key == "close") {
      if (val.status == 0 || val.status == 3 || val.status == 4) {
        notification.open({
          message: '提示',
          description: '节点处于关闭、烧录或无法使用状态，不可执行关闭操作.',
        });
      } else {
        var id = new Array();
        id.push(val.nodeId);
        this.operateNode(id, 1);
      }
    }
    else if (key.key == "restart") {
      if (val.status == 3 || val.status == 0 || val.status == 4) {
        notification.open({
          message: '提示',
          description: '节点处于关闭、烧录或无法使用状态，不可执行重启操作.',
        });
      } else {
        var id = new Array();
        id.push(val.nodeId);
        this.operateNode(id, 2);
      }
    }
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

  operateNode = (ids, opt) => {
    var str = ["启动", "关闭", "重启"];
    $.ajax({
      type: 'post',
      url: server_url + '/node/operate', 
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
            description: '节点' + str[opt] + '失败！',
          });
        } else {
          notification.success({
            message: '成功',
            description: '节点' + str[opt] + '成功！操作可能存在数秒钟的延迟，请耐心等待！',
          });
        }
      }
    })
  }

  handleDownload = (id) => {
    var ids = new Array();
    ids.push(id);
    this.downloadNode(ids);
  }

  downloadNode = (ids) => {
    $.ajax({
      type: 'post',
      url: server_url + '/node/datas', 
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      data: {
        "ids": ids,
        "starttime": new Date(1541073600085),
        "endtime": new Date()
      }, 
      success: data => {},
      error: data => {
        notification.error({
          message: '失败',
          description: '网络错误！',
        });
      }
    });
  }

  viewLog(val) {
    $.ajax({
      type: 'post',
      url: server_url + '/node/log', 
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      data: {
        "id": val.nodeId,
        "starttime": new Date(1541073600085),
        "endtime": new Date()
      }, 
      success: data => {},
      error: data => {
        notification.error({
          message: '失败',
          description: '网络错误！',
        });
      }
    });
  }

  componentWillMount() {
    $.getScript("http://api.map.baidu.com/getscript?v=3.0&ak=ecTz4cxT7Ss7PXvycAukomg91sxCllWO&services=&t=20181029164750", function() {});
    this.getallnode();
  }

  getallnode() {
    const { dispatch, onCreate } = this.props;
    const { viewType } = this.state;
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
      success: data => {
        dispatch({
          type: 'node/fetch',
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

  componentDidMount() {
    let server = server_url.split("//")[1];
    server = server.split(":")[0];
    let socket = new WebSocket("ws://" + server + ":8080/websocket");
    socket.onopen = () => {
      console.log("socket开启成功！");
      socket.send("nodes message");
    }
    socket.onclose = function (event) { console.log(event); };
    socket.onerror = function (event) { console.log(event); };
    socket.onmessage = function (event) {
      //$("#log").append("<p>"+event.data+"</p>");
      console.log(event);
      var str1 = String(event.data);
      var startWith = function(s, str){
    		if(str == null || str== "" || s.length== 0 || str.length > s.length)
    			return false;
    		if(s.substr(0,str.length) == str)
    		    return true;
    		else
    		    return false;      
    		return true; 
    	};	
      var path, str_list, node_id;
    	if(startWith(str1, "data file ")) {
        var path = str1.substring(10);
        console.log(path);
        window.open(server_url + "/file/download?path=" + encodeURIComponent(path));
    	}
      else if(startWith(str1, "fail-message-data ")) {
          notification.error({
            message: '失败',
            description: '该节点暂时没有数据文件，请先烧录以后再下载数据文件！',
          });
      }
      // else if(message.startsWith("data file ")){
      //   console.log("data");
      //     // path = message.substring(10);
      //     // openDownloadDialog("<%=basePath%>file/download?path="+encodeURIComponent(path));
      // }
      // else if(message.startsWith("start message ")){
      //     // str_list = m_split(message, " ", 5);
      //     // node_id = parseInt(str_list[2]);
      //     // if(isNaN(node_id)) return;
      //     // if(str_list[3]==="succ"){
      //     //     toastr.success("Start node "+ node_id +" successfully.");
      //     // }
      //     // else{
      //     //     toastr.success("Failed to start node " + node_id + ":"+str_list[4]);
      //     // }
      // }
      // else if(message.startsWith("stop message ")){
      //     // str_list = m_split(message, " ", 5);
      //     // node_id = parseInt(str_list[2]);
      //     // if(isNaN(node_id)) return;
      //     // if(str_list[3]==="succ"){
      //     //     toastr.success("Stop node "+ node_id +"successfully.");
      //     // }
      //     // else{
      //     //     toastr.error("Failed to stop node " + node_id + ":"+str_list[4]);
      //     // }
      // }
      // else if(message.startsWith("restart message ")){
      //     // str_list = m_split(message, " ", 5);
      //     // node_id = parseInt(str_list[2]);
      //     // if(isNaN(node_id)) return;
      //     // if(str_list[3]==="succ"){
      //     //     toastr.success("Restart node "+ node_id +"successfully.");
      //     // }
      //     // else{
      //     //     toastr.error("Failed to restart node " + node_id + ":"+str_list[4]);
      //     // }
      // }
      // else if(message.startsWith("burn message ")){
      //     str_list = m_split(message, " ", 5);
      //     // node_id = parseInt(str_list[2]);
      //     // if(isNaN(node_id)) return;
      //     // if(str_list[3]==="succ"){
      //     //     toastr.success("Burn node "+node_id+"successfully.");
      //     // }
      //     // else{
      //     //     toastr.error("Failed to burn node"+node_id+":"+str_list[4]);
      //     // }
      // }
      // else if(message.startsWith("burn progress ")){
      //     // str_list = m_split(message, " ", 4);
      //     // node_id = parseInt(str_list[2]);
      //     // if(isNaN(node_id)) return;
      //     // setNodeStatus(node_id, 4 ,str_list[3]);
      // }
      // else if(message.startsWith("status change ")){
      //     // str_list = m_split(message, " ", 4);
      //     // node_id = parseInt(str_list[2]);
      //     // if(isNaN(node_id)) return;
      //     // var status = parseInt(str_list[3]);
      //     // if(isNaN(status)) return;
      //     // setNodeStatus(node_id, status)
      // }
      // else if(message.startsWith("fail-message-data ")){
      //     // str_list = m_split(message, " ", 3);
      //     // toastr.error("failed to get data file of node " + str_list[1] + ":" + str_list[2]);
      // }
    };
  }

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

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  render() {
    const {
      node: { data, source_data },
      loading,
    } = this.props;
    const { selectedRows, mapVisible, mapNode } = this.state;

    return (
      <PageHeaderWrapper 
        title="Node List"
        >
        <Modal
          destroyOnClose
          title="节点地图"
          visible={mapVisible}
          footer={null}
          onCancel={() => this.handleMapVisible()}>
          <div id="map" className={ styles.mapForm }></div>
        </Modal>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div id="mulupload" className={styles.tableListOperator}>
              <Button icon="caret-right" type="normer" onClick={() => this.operates(0)}>
                Start Up all
              </Button>
              <Button icon="pause-circle" type="danger" onClick={() => this.operates(1)}>
                Shutdown all
              </Button>
              <Button icon="redo" type="danger" onClick={() => this.operates(2)}>
                Restart all
              </Button>
              <Button icon="download" type="primary" onClick={() => this.uploadFile(true)}>
                Download all
              </Button>
              <Upload
                customRequest={(option) => this.multiburn(option, this.props.dispatch, this.props.node.source_data)}
                beforeUpload = {this.beforeUpload}
                fileList={this.state.fileList} >
                <Button icon="upload" type="primary" >
                  Burn all
                </Button>
              </Upload>
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
      </PageHeaderWrapper>
    );
  }
}

export default NodeManage;
