'use client'
import React from 'react';
import {  Radio, Space, Table, Tag  } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import styles from './transaction.module.css'
import Bpmn from '../process/BpmnViewer';



interface DataType {
  key: number;
  BpmnProcessID: string;
  ProcessInstanceKey: string; // ProcessInstanceKey has been changed to number
  Current_Process_ID:string;
  Current_Instance_Status:string;
  Starttime:string;
  Endtime:string;
  xhtml:string;
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
    render: () => (
      <Space size="middle">
        <a>Restart </a>
        <a>Cancel</a>
      </Space>
    ),
  },
];



const url = 'http://localhost:8000/process/';

let data: DataType[]; // Define the data variable

axios.get(url)
  .then(response => {
    const z = response.data;
    data = z; // Assign the response data to the data variable
    console.log(z);
  })
  .catch(error => {
    console.error('Error:', error);
  });


  const Appz: React.FC = () => {

    const [xml, setXml] = React.useState<string>();
    const [bpmnKey, setBpmnKey] = React.useState<number>(0); // Adding state to track key
  
    const handleClick = (Id:any, record:any) => {
      const xmlz = Buffer.from(record.xhtml, 'base64').toString('utf-8');
      setXml(xmlz);
      setBpmnKey(prevKey => prevKey + 1); // Incrementing the key to force remount
      console.log(Id);
      console.log(record);
    }
  
    return(
    <div>
    <div className={styles.flowdiagram}>
    <Bpmn key={bpmnKey} xmlcurrent={xml}/> {/* Using key prop here */}
    </div>
    <Table columns={columns} dataSource={data} pagination={{ pageSize: 50 }} scroll={{ y: 330 }} onRow={
      (record :any ) => ({
        onClick: () => handleClick(record.id, record)
      })
    } />
    </div>
    )
  };
  
  export default Appz;