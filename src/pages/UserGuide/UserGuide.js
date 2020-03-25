import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import Exception from '@/components/Exception';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import { formatMessage, FormattedMessage } from 'umi/locale';
import numeral from 'numeral';
import {
  Row,
  Col,
  Icon,
  Card,
  Tabs,
  Table,
  Radio,
  DatePicker,
  Tooltip,
  Menu,
  Dropdown,
} from 'antd';
import {
  ChartCard,
  MiniArea,
  MiniBar,
  MiniProgress,
  Field,
  Bar,
  Pie,
  TimelineChart,
} from '@/components/Charts';

import node_order from '../assets/节点预约.png';
import about_menu from '../assets/菜单.png';
import order_state from '../assets/预约状态.png';
import my_order from '../assets/我的预约.png';
import my_state from '../assets/我的状态.png';
import node_list from '../assets/节点列表.png';
import node_state from '../assets/节点状态.png';

@connect(({ chart, loading }) => ({
  chart,
  loading: loading.effects['chart/fetch'],
}))

class System extends Component {

	state = {
		loading : true
	};

	componentDidMount() {}

	render() {
    return (
    	<GridContent>
        <Card title="使用说明" style={{ marginBottom: 24 }} bordered={false}>
          <h4 style={{ marginBottom: 16 }}>使用前提</h4>
          <p>&emsp;&emsp;在使用本系统前，用户需要提供自己的邮箱以注册账户，在账户注册成功以后，利用注册成功的账户登录系统，才可以使用整个系统。</p>
          <h4 style={{ marginBottom: 16 }}>菜单说明</h4>
          <img src={about_menu} style={{ marginBottom: 12, marginLeft: 12 }} />
          <p>&emsp;&emsp;在使用账户登录系统之后，用户可能看到的全部菜单选项如图所示。对其中各个菜单的功能说明如下：</p>
          <ul>
            <li><strong>系统概况：</strong>对系统进行了一个整体的说明；</li>
            <li><strong>使用说明：</strong>指导用户如何使用整个系统；</li>
            <li><strong>节点预定：</strong>用户可以在此预约整个系统并查看自己的预约结果；</li>
            <li><strong>节点管理：</strong>在用户预定系统成功后，在预定的时间内才会出现(如果到了预定的时间还没有出现该菜单选项，请重新登录系统)，该菜单选项内的页面可以让用户对系统的LoRa节点和网关进行操作；</li>
            <li><strong>LoRaServer：</strong>提供了LoRa的部分管理功能;</li>
            <li><strong>关于我们：</strong>简单介绍了清华大学软件学院可信网络与系统研究所的整体情况;</li>
          </ul>
          <p>&emsp;&emsp;本文重点介绍节点预定功能和节点管理菜单对应的功能，由于其它菜单的功能过于简单，本文不再赘述。</p>
          <h4 style={{ marginBottom: 16 }}>节点预定功能</h4>
          <p>&emsp;&emsp;节点预定下有两个菜单选项，分别为预定节点和我的预定。预定节点的界面如下图所示。</p>
          <img src={node_order} style={{ marginBottom: 12, marginLeft: 12, width:"90%" }} />
          <p>&emsp;&emsp;这里是用户预约系统使用时间的地方，每次预约的时间段为整点开始的一个小时。在自己想要使用的时间段打上勾以后，点击批量预约按钮就可以提交预约了。
            用户提交的预约可能直接获得系统批准，也可能需要等待管理员的审核才能得到批准。用户最多可以在此进行十天内（最多240个）的预约，目前用户能预约的最长时间为8个小时（包括已经提交但未得到批准的预约时间、预约成功且未过时的时间）。
          如果用户的预约时间已满（即超过八个小时），需要取消已有的预约才能进行新的预约。</p>
          <img src={order_state} style={{ marginBottom: 12, marginLeft: 12 }} />
          <p>&emsp;&emsp;每个预约有如图所示的四种状态，其中无人预约代表没有任何人预约这个时间段；关闭预约代表管理员已经关闭了这个时间段的预约，可能用作他处；
            有他人预约代表有除了用户本人以外的其它人预约了这个时间段，但是还没有得到批准；已被使用代表他人对这个时间段的预约已经得到了批准，其它人已经无法预约。</p>
          <p>&emsp;&emsp;用户已经提交了的预约可以在我的预约里面查看，我的预约界面如下图所示。</p>
          <img src={my_order} style={{ marginBottom: 12, marginLeft: 12, width:"90%" }} />
          <p>&emsp;&emsp;用户可以在此看到自己提交的预约时间段和其对应的状态，用户还可以在此选择自己的预约并申请取消该预约，已过时的预约无法被取消且取消预约操作无法被撤销，请慎重！</p>
          <img src={my_state} style={{ marginBottom: 12, marginLeft: 12 }} />
          <p>&emsp;&emsp;如图所示，用户已经提交了的预约状态有四种。其中预约审批中代表预约已经提交，目前等待管理员的审批；预约成功代表预约已经得到通过，用户可以在对应的时间段内管理节点和网关；
            预约失败代表管理员拒绝了用户的预约；已过使用时间代表当前的时间已经大于该预约时间，预约已经无法使用。</p>
          <h4 style={{ marginBottom: 16 }}>节点管理功能</h4>
          <p>&emsp;&emsp;用户在预约得到批准后，在对应的时间段内登录系统，就可以使用节点管理功能（如未看到节点管理菜单，请重新登录系统）。节点管理菜单下有三个子菜单，其中节点列表对应的界面如下。</p>
          <img src={node_list} style={{ marginBottom: 12, marginLeft: 12, width: "90%" }} />
          <p>&emsp;&emsp;用户可以在此对系统的所有节点进行启动、关闭、重启、烧录节点、下载数据、查看日志和查看地点的操作。其中烧录节点需要上传一个bin文件，然后对应的节点就会运行该bin文件；
            下载数据则是下载该节点的历史输出数据；查看日志可以实时查看节点打印的日志信息；而查看地点则会在地图上展示节点并显示其经纬度信息。</p>
          <img src={node_state} style={{ marginBottom: 12, marginLeft: 12 }} />
          <p>&emsp;&emsp;节点有如图所示的五种状态，其中无法使用代表节点出了故障，无法被使用；可烧录代表节点处于开启状态且从未进行过任何的烧录；
            运行中代表节点处于开启状态且进行过至少一次的烧录；已关闭代表节点已经被关闭；烧录中代表节点正在烧录文件，请勿进行其他操作。</p>
        </Card>
      </GridContent>
    )
	}
}

export default System;
