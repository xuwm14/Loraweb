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

class System extends Component {

	state = {
		loading : true
	};

	componentDidMount() {
    window.history.go(-1);
    window.open("https://loraserver.thulpwan.top/#/login");
  }

	render() {

    return (
    	<></>
    )
	}
}

export default System;
