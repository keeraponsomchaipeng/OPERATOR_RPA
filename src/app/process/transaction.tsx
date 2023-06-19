'use client'
import React from 'react';
import { Popconfirm, Radio, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios, { AxiosResponse } from 'axios';
import styles from './transaction.module.css'
import Bpmn from '../process/BpmnViewer';



interface DataType {
  key: number;
  BpmnProcessID: string;
  ProcessInstanceKey: string; // ProcessInstanceKey has been changed to number
  Current_Process_ID: string;
  Current_Instance_Status: string;
  Starttime: string;
  Endtime: string;
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
  },
  {
    title: 'Current_Process_ID',
    dataIndex: 'Current_Process_ID',
  },
  {
    title: 'Current_Instance_Status',
    dataIndex: 'Current_Instance_Status',
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




const Appz: React.FC = () => {
  const [data, setData] = React.useState<DataType[]>([])
  React.useEffect(() => {
  
    const url = 'http://localhost:8000/processs/';

    
    const data = { //Send dept for authentication
      dept: '24shopping'
    };

    axios.post(url, data)
      .then(response => {
        const z = response.data;
        const dataxhtml = response.data[0]?.xhtml
        //data = z; // Assign the response data to the data variable
        setData(response.data)
        console.log(z);
        console.log(dataxhtml)
        const xmlz = Buffer.from(dataxhtml, 'base64').toString('utf-8');
        setXml(xmlz)
      })
      .catch(error => {
        console.error('Error:', error);
      });
      
  }, [])
  const [xml, setXml] = React.useState<string>();
  const [bpmnKey, setBpmnKey] = React.useState<number>(0); // Adding state to track key

  const handleClick = (Id: any, record: any) => {
    const xmlz = Buffer.from(record.xhtml, 'base64').toString('utf-8');
    setXml(xmlz);
    setBpmnKey(prevKey => prevKey + 1); // Incrementing the key to force remount
    console.log(Id);
    console.log(record);
    // alert(`Cell clicked! Id: ${Id}, BpmnProcessID: ${record.BpmnProcessID}`)
  }

  return (
    <div>
      <div className={styles.flowdiagram}>
        <Bpmn key={bpmnKey} xmlcurrent={xml} /> {/* Using key prop here */}
      </div>
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 50 }} scroll={{ y: 330 }} onRow={(record: any) => ({ onClick: () => handleClick(record.id, record) })} />
    </div>
  )
};

export default Appz;