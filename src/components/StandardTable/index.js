import React, { PureComponent, Fragment } from 'react';
import { Table, Alert } from 'antd';
import styles from './index.less';

function initTotalList(columns) {
  const totalList = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

class StandardTable extends PureComponent {
  constructor(props) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);

    this.state = {
      selectedRowKeys: [],
      needTotalList,
    };
  }

  static getDerivedStateFromProps(nextProps) {
    // clean state
    // console.log(nextProps);
    if (nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns);
      return {
        selectedRowKeys: [],
        needTotalList,
      };
    }
    return null;
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    // console.log(selectedRows)
    let { needTotalList } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex], 10), 0),
    }));
    const { onSelectRow, onSelectRowkey } = this.props;
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }
    if (onSelectRowkey) {
      onSelectRowkey(selectedRowKeys);
    }

    this.setState({ selectedRowKeys, needTotalList });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const {
      data: { list, pagination },
      showPage,
      loading,
      columns,
      rowKey,
      selections,
      total,
    } = this.props; 

    console.log();

    let paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };

    let rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };

    if (showPage == false)
      paginationProps = false;

    if (selections == false)
      rowSelection = null;

    return (
      <div className={styles.standardTable}>
        {selections != false &&
        <div className={styles.tableAlert}>
          <Alert
            message={
              <Fragment>
                selected <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> rows&nbsp;&nbsp;
                {
                  total != undefined && 
                  <span style={{ marginLeft: 8 }} >
                    加上已预约时间总计&nbsp;
                    <span style={{ fontWeight: 600 }}>
                      {total}
                    </span>
                    小时
                  </span>
                }
                {needTotalList.map(item => (
                  <span style={{ marginLeft: 8 }} key={item.dataIndex}>
                    {item.title}
                    总计&nbsp;
                    <span style={{ fontWeight: 600 }}>
                      {item.render ? item.render(item.total) : item.total}
                    </span>
                  </span>
                ))}
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  clear
                </a>
              </Fragment>
            }
            type="info"
            showIcon
          />
        </div>
        }
        <Table
          loading={loading}
          rowKey={rowKey || 'key'}
          rowSelection={rowSelection}
          dataSource={list}
          columns={columns}
          pagination={paginationProps}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default StandardTable;
