"use client"
import {
  Button,
  Form,
  Input,
  Select,
  Switch,
} from 'antd';
import React, { useState } from 'react';
import styles from './page.module.css';
import axios, { AxiosResponse } from 'axios';
import { x } from './bpmn';
import Bpmn from '../process/BpmnViewer';

 // Print the entire x object
const options = [
  {
    value: 'CAMUNDA_CLOUD_RPA_TEST',
    label: 'CAMUNDA_CLOUD_RPA_TEST',
  },
  {
    value: 'DEMO_webapp_RPA',
    label: 'DEMO_webapp_RPA',
  },
  {
    value: 'Selenium_flow',
    label: 'Selenium_flow',
  },
  {
    value: 'advance_sharepoint',
    label: 'advance_sharepoint',
  },
];




const FormDisabledDemo: React.FC = () => {
  const [selected, setSelected] = useState(options[0].value);
  const [xml, setXml] = React.useState<string>();
  const [bpmnKey, setBpmnKey] = React.useState<number>(0); // Adding state to track key
  

  const handleChange = (value:string) => {
    setSelected(value);
    const xmlz = Buffer.from(x[value], 'base64').toString('utf-8');
    setBpmnKey(prevKey => prevKey + 1);
    setXml(xmlz)
  };

  const [submitStatus, setsubmitStatus] = useState<string>('');
  const handleSubmit = () => {
    const url = 'http://10.182.37.125:8000/startflow';
    const payload = { bpmnprocessID_pl: selected };

    
    setsubmitStatus('Preparing to upload file...');
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (response.ok) {
          setsubmitStatus('Start flow successfully');
          return response.json();
        } else {
          setsubmitStatus('Request failed');
          throw new Error('Request failed');
        }
      })
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  

  return (
    <div className={styles.fullscreenz}>
      <Form
        className={styles.Upload}
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
      >
        <Form.Item label="BPMN Process">
          <Select
            onChange={handleChange}
            showSearch
            style={{ width: 250 }}
            placeholder="Search to Select"
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').includes(input)}
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={options}
            value={selected}
          />
        </Form.Item>
        <Button onClick={handleSubmit}>Submit</Button>
        <p>Status : {submitStatus}</p>
      </Form>
      <Bpmn className={styles.bpmn} key={bpmnKey} xmlcurrent={xml}/>
    </div>
  );
};

export default () => <FormDisabledDemo />;


