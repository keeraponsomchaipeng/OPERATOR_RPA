'use client'
import { Popconfirm, Radio, Space, Table, Tag } from 'antd';
import type { ColumnsType, TableProps  } from 'antd/es/table';
import axios, { AxiosResponse } from 'axios';
import styles from './transaction.module.css'
import Bpmn from '../process/BpmnViewer';
import React, { useState } from 'react';



interface DataType {
  key: number;
  BpmnProcessID: string;
  ProcessInstanceKey: number; // ProcessInstanceKey has been changed to number
  Current_Process_ID: string;
  Current_Instance_Status: string;
  Starttime: Date;
  Endtime: Date;
  xhtml: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'BpmnProcessID',
    dataIndex: 'BpmnProcessID',
  },
  {
    title: 'ProcessInstanceKey',
    dataIndex: 'ProcessInstanceKey',
    sorter: {
      compare: (a, b) => a.ProcessInstanceKey - b.ProcessInstanceKey,
      multiple: 3,
    },
  },
  {
    title: 'Current_Process_ID',
    dataIndex: 'Current_Process_ID',
  },
  {
    title: 'Current_Instance_Status',
    dataIndex: 'Current_Instance_Status',
    filters: [
      {
        text: 'COMPLETED',
        value: 'COMPLETED',
      },
      {
        text: 'FAILED',
        value: 'FAILED',
      },
      {
        text: 'Active',
        value: 'Active',
      },
      {
        text: 'CANCELED',
        value: 'CANCELED',
      },
    ],
    // specify the condition of filtering result
    // here is that finding the name started with `value`
    onFilter: (value: any, record) => record.Current_Instance_Status.indexOf(value) === 0,
  },
  {
    title: 'Starttime',
    dataIndex: 'Starttime',
  },
  {
    title: 'Endtime',
    dataIndex: 'Endtime',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Popconfirm
        title="Are you sure want to cancel ?"
        onConfirm={() => handleCancel(record)}>
        <a>Cancel</a>
      </Popconfirm>
    ),
  },
];

const handleCancel = (value: any) => {
  // Function implementation
  console.log(value.ProcessInstanceKey, "Hello za");


  interface Post {
    Processinstance: number;
  }

  const postData: Post = {
    Processinstance: value.ProcessInstanceKey,
  };

  interface DictionaryResponse {
    [key: string]: string;
  }
  let x: DictionaryResponse = {};

  axios.post('http://localhost:8000/cancel/', postData)
    .then((response: AxiosResponse) => {
      x = response.data;
    })
    .catch((error: Error) => {
      console.log(error);
    });
};

const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};


const Transaction: React.FC = () => {
  const [data, setData] = React.useState<DataType[]>([])
  React.useEffect(() => {
    const url = 'http://localhost:8000/processs/';
    
    const data = { //Send dept for authentication
      dept: '24shopping'
    };

    axios.post(url, data)
      .then(response => {
        const z = response.data;
        const dataxhtml = response.data[0]?.xhtml;
        setData(response.data);
        console.log(z);
        console.log(dataxhtml);
        const xmlz = Buffer.from(dataxhtml, 'base64').toString('utf-8');
        setXml(xmlz);
      })
      .catch(error => {
        console.error('Error:', error);
      });
      
  }, [])
  const [xml, setXml] = React.useState<any>();
  const [bpmnKey, setBpmnKey] = React.useState<number>(0); // Adding state to track key
  const [cur_process_id, setcur_process_id] = React.useState<any>();
  const [cur_instance_status, setcur_instance_status] = React.useState<any>();

  const handleClick = (Id: any, record: any) => {
    const xmlz = Buffer.from(record.xhtml, 'base64').toString('utf-8');
    setcur_process_id(record.Current_Process_ID);
    setcur_instance_status(record.Current_Instance_Status);
    setXml(xmlz);
    setBpmnKey(prevKey => prevKey + 1); // Incrementing the key to force remount

    // alert(`Cell clicked! Id: ${Id}, BpmnProcessID: ${record.BpmnProcessID}`)
  }

  return (
    <div>
      <div className={styles.flowdiagram}>
        <Bpmn 
          key={bpmnKey} 
          xmlcurrent={xml} 
          Current_Process_ID={cur_process_id} 
          Current_Instance_Status={cur_instance_status} 
          runflowcheck="" 
          BPMNID=""/> 
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        onChange={onChange} 
        pagination={{ pageSize: 50 }} 
        scroll={{ y: 330 }}  
        onRow={(record: any) => ({ onClick: () => handleClick(record.id, record) })} 
      />
    </div>
  )
};

export default Transaction;