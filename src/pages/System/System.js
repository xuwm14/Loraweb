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

@connect(({ chart }) => ({
  chart
}))

class System extends Component {

	state = {
		loading : true
	};

	componentDidMount() {
    const { dispatch } = this.props;
  }

	render() {

		const { loading: propsLoding, currentTabKey } = this.state;
    const { chart, loading: stateLoading } = this.props;
    const {
      visitData,
      visitData2,
      num1, num2, num3,
      
    } = chart;
    const loading = propsLoding || stateLoading;

		const topColResponsiveProps = {
      xs: 8,
      sm: 8,
      md: 8,
      lg: 8,
      xl: 8,
      style: { marginBottom: 24 },
    };

    return (
    	<GridContent>
    		<Row gutter={24}>
    			<Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={false}
              title={<FormattedMessage id="app.analysis.totaluser" defaultMessage="用户数" />}
              action={
                <Tooltip
                  title={
                    <FormattedMessage id="app.analysis.intro.totaluser" defaultMessage="用户数" />
                  }
                >
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={45}
              contentHeight={46}
            >
            </ChartCard>
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={false}
              title={<FormattedMessage id="app.analysis.nodenum" defaultMessage="节点数" />}
              action={
                <Tooltip
                  title={
                    <FormattedMessage id="app.analysis.intro.nodenum" defaultMessage="节点数" />
                  }
                >
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={60}
              contentHeight={46}
            >
            </ChartCard>
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              loading={false}
              bordered={false}
              title={
                <FormattedMessage
                  id="app.analysis.runnum"
                  defaultMessage="运行的节点数"
                />
              }
              action={
                <Tooltip
                  title={
                    <FormattedMessage id="app.analysis.intro.runnum" defaultMessage="当前运行中的结点总数" />
                  }
                >
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={40}
              contentHeight={46}
            >
            </ChartCard>
          </Col>
        </Row>
        <Card title="系统说明" style={{ marginBottom: 24 }} bordered={false}>
          <h4 style={{ marginBottom: 16 }}>总体描述</h4>
          <p>&emsp;&emsp;本系统是由清华大学软件学院可信网络与系统研究所提供的LoRa在线测试平台。</p>
          <p>&emsp;&emsp;本系统针对的用户主要是具备一定电脑使用知识以及LoRa协议知识的科研人员，旨在为这些科研人员提供在线的LoRa节点实验功能。</p>
          <p>&emsp;&emsp;在本系统中，清华大学软件学院提供了一些架设在各个地方的LoRa节点，这些LoRa节点的数据与服务器相连接。
          用户可以通过网页执行操作，这些操作会通过服务器直接反馈到节点上，用户同时也可以通过网页查看各个节点的日志并下载相关数据。</p>
          <h4 style={{ marginBottom: 16 }}>使用说明</h4>
          <p>&emsp;&emsp;在使用本系统前，用户需要先注册账户，在账户注册成功以后，才可以利用注册成功的账户登录系统。</p>
          <p>&emsp;&emsp;用户在登录系统后，不能马上获取LoRa节点的使用权，需要在网站上选择对应的时间段进行预约，预约成功以后用户才可以在对应的时间段拥有系统所有LoRa节点的使用权。
            预约的时间段一过，LoRa节点的使用权便会被回收，需要在新的预约时间段内，用户才可以使用LoRa节点。</p>
          <p>&emsp;&emsp;用户在拥有使用权时，可以对所有LoRa节点执行开始、关闭、重启、烧录文件、查看日志和下载数据等操作。
            用户还可以在地图上查看每个LoRa节点的位置信息，以使用户对系统的整体布局有更为全面的了解（具体的操作步骤可以查看使用说明）。</p>
          <h4 style={{ marginBottom: 16 }}>系统管理</h4>
          <p>&emsp;&emsp;用户在使用系统时严禁进行任何破坏性行为，包括恶意烧录不合理文件、攻击后台服务器、过于频繁的关闭或启动节点、进行不合规的预约等行为。</p>
          <p>&emsp;&emsp;系统有管理员监管后台数据，一旦发现任何破坏性的行为，管理员有权取消用户的节点使用权乃至于封禁不合规的用户账号。
            如果用户的恶意行为对系统的LoRa节点造成了不可挽回的损失，管理员有权向用户索取相对应的赔偿。</p>
          <p>&emsp;&emsp;本系统中所有LoRa节点的使用权最终归软件学院所有。在需要时，管理员可能在后台取消部分用户在某些时间段的预约，或者直接删除系统中的部分节点。
            当然，出于维护用户体验的需要，我们会尽力避免以上情况的发生。</p>
        </Card>
      </GridContent>
    )
	}
}

export default System;
