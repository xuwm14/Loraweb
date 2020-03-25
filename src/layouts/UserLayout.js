import React, { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import DocumentTitle from 'react-document-title';
import Link from 'umi/link';
import { Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';
import SelectLang from '@/components/SelectLang';
import styles from './UserLayout.less';
import logo from '../assets/logo.svg';

const copyright = (
  <Fragment>
    Contact Us: jiliangwang@tsinghua.edu.cn <br />
    <a href="http://www.miit.gov.cn/"> 京ICP备18048670号 </a>
  </Fragment>
);

class UserLayout extends React.PureComponent {
  // @TODO "title"
  // getPageTitle() {
  //   const { routerData, location } = this.props;
  //   const { pathname } = location;
  //   let title = 'Ant Design Pro';
  //   if (routerData[pathname] && routerData[pathname].name) {
  //     title = `${routerData[pathname].name} - Ant Design Pro`;
  //   }
  //   return title;
  // }

  render() {
    const { children } = this.props;
    return (
      // @TODO <DocumentTitle title={this.getPageTitle()}>
      <React.Fragment>
        <DocumentTitle title={'Online LPWAN Testbed'} />
        <div className={styles.container}>
          <div className={styles.lang}>
            <SelectLang />
          </div>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={logo} />
                  <span className={styles.title}>Online LPWAN Testbed</span>
                </Link>
              </div>
              <div className={styles.desc}>低功耗广域网在线测试平台</div>
            </div>
            {children}
          </div>
          <GlobalFooter copyright={copyright} />
        </div>
      </React.Fragment>
    );
  }
}

export default UserLayout;
