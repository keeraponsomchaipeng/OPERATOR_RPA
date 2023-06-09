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


const options = [
  {
    value: 'CAMUNDA_CLOUD_RPA_TEST',
    label: 'rap_shopat24',
  },
  {
    value: 'DEMO_webapp_RPA',
    label: 'DEMO_webapp_RPA',
  },
  {
    value: 'Selenium_flow',
    label: 'Web_scraping',
  },
  {
    value: 'advance_sharepoint',
    label: 'Grade_calculations',
  },
];

const FormDisabledDemo: React.FC = () => {
  const [selected, setSelected] = useState(options[0].value);
  

  const handleChange = (value:string) => {
    setSelected(value);
  };
  
  const thisisflow = (value:string) => {
    setSelected(value);
    return value
  }

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
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Form
        className={styles.Upload}
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
      >
        <Form.Item label="Who are you">
          <Input />
        </Form.Item>
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
        <Form.Item label="Line notification" valuePropName="checked">
          <Switch/>
        </Form.Item>
        <Button onClick={handleSubmit}>Submit</Button>
        <p>Status : {submitStatus}</p>
      </Form>
      <div >
        Flowkub
      </div>
    </div>
  );
};

export default () => <FormDisabledDemo />;


