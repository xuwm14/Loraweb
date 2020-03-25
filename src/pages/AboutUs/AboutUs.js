import React, { Component } from 'react';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import {
  Card,
} from 'antd';

import home from '../assets/home.jpeg';

class System extends Component {

	state = {
		loading : true
	};

	render() {

    return (
    	<GridContent>
        <Card title="关于我们" style={{ marginBottom: 24 }} bordered={false}>
          <img src={home} style={{ width:"50%", marginLeft: "25%", marginBottom: 24 }}/>
          <p>　　可信网络与系统研究所成立于2012年，依托于清华大学软件学院，主要从事以计算机网络与系统的设计、分析、实现等为核心的教学科研工作，刘云浩教授任所长。
          该所现有ACM/IEEE Fellow 1人，教育部长江学者特聘教授1人，国家自然科学杰出青年基金获得者1人、优秀青年基金获得者3人，教授1人，副教授3人，助理教授1人，助理研究员4人，以及博士后多人。</p><br/>
          <p>　　研究所在国家自然科学基金、973计划、863计划、国家发改委物联网技术产业化项目的支持下，在以下多个领域开展科研工作：</p>
          <ul>
            <li><strong>传感网系统与测量：</strong>传感网和无线自组网协议设计、规模化传感网系统架构、系统测量技术、测量数据挖掘和基于数据的系统改进；</li>
            <li><strong>网络管理与诊断：</strong>传感网诊断技术，规模化复杂系统管理，移动平台性能管理，未来网络测试管理技术；</li>
            <li><strong>定位与移动计算：</strong>传感网定位与可定位性、室内定位、位置服务与隐私、群智感知计算；</li>
            <li><strong>无源感知网络：</strong>无源感知技术，安全与隐私保护，普适计算，RFID技术；</li>
            <li><strong>云计算与未来网络：</strong>云计算核心技术、云存储实用系统、云下载前沿研究、未来网络探索；</li>
          </ul>
          <br/>
          <p>　　围绕上述研究工作，在国际高水平学术会议和期刊上共发表论文一百余篇，包括CCS、CHI、FAST、ICDCS、ICNP、IMC、INFOCOM、Middleware、MobiCom、MobiHoc、MobiSys、NDSS、NSDI、PerCom、RTSS、SenSys、SIGMETRICS、SIGMOD、UbiComp、VLDB、WWW、Communications of the ACM、IEEE 
          Journal on Selected Areas in Communications、IEEE/ACM Transactions on Networking、IEEE Transactions on Paralell and Distributed Systems、IEEE Transactions on Mobile Computing、IEEE Transactions on Wireless Communications、IEEE Transactions on Computers、IEEE Transactions on Cloud Computing等。单篇论文最高国际他引超过1000次，论文累计他引超过10000次。研究所成员曾获得香港政府最佳创新与研究特等奖、教育部自然科学奖一等奖、国家自然科学奖二等奖、中国计算机学会物联网青年成就奖、中国计算机学会优秀博士论文奖、中国人工智能学会优秀博士论文奖、以及多个国际学术会议的最佳论文奖。</p> 
          <br/><br/>
        </Card>
      </GridContent>
    )
	}
}

export default System;
