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
import { DownloadOutlined } from '@ant-design/icons';
import Link from 'next/link';

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
];




const FormDisabledDemo: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>(''); // default is 'middle'
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [selected, setSelected] = useState(options[0].value);
  const [xml, setXml] = React.useState<string>();
  const [bpmnKey, setBpmnKey] = React.useState<number>(0); // Adding state to track key
  const [bpmnID, setdatabpmn] = React.useState<string>();
  const [submitStatus, setsubmitStatus] = useState<string>('');
  const [checkactive, setcheckactive] = useState<string>('');
  const handleUpload = () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.click();

    // Listen for file selection
    input.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      setUploadStatus('Preparing to upload file...');
      // Read the file contents
      const startTime = performance.now();
      reader.onload = async (fileEvent) => {
        const fileContents = fileEvent.target?.result;
        if (typeof fileContents === 'string') {
          // Encode the file contents as base64
          const encodedData = btoa(fileContents);
          console.log('Encoded data:', encodedData);
          setUploadStatus('Encoding file for upload ...');
          // Create the request data
          const data = {
            encoded: encodedData,
            to_flow: bpmnID
          };

          // Set the upload status to 'Uploading'
          setUploadStatus('Start Uploading file: ' + file.name);

          // Make the POST request
          try {
            const response = await fetch('http://localhost:8001/decode', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            // Handle the response
            if (response.ok) {
              console.log('POST request successful');
              setUploadStatus('Upload file: ' + file.name + ' successful. Start run next process already you can check status from "Process" tab');
              const uploadStatusElement = document.getElementById('upload-status');
              if (uploadStatusElement) {
                uploadStatusElement.style.color = 'green';
              }
              // Perform further actions if needed
            } else if (response.status === 404) {
              console.error('POST request failed');
              setUploadStatus('Please start flow "DEMO_webapp_RPA" first');
              const uploadStatusElement = document.getElementById('upload-status');
              if (uploadStatusElement) {
                uploadStatusElement.style.color = 'red';
              }
              // Handle error cases if needed
            } else {
              console.error('POST request failed with 4040');
              setUploadStatus('Please start flow before uploading file');
              const uploadStatusElement = document.getElementById('upload-status');
              if (uploadStatusElement) {
                uploadStatusElement.style.color = 'red';
              }
              // Handle error cases if needed
            }
          } catch (error) {
            console.error('Error occurred while making the POST request:', error);
            setUploadStatus('Error occurred while making the POST request');
            const uploadStatusElement = document.getElementById('upload-status');
            if (uploadStatusElement) {
              uploadStatusElement.style.color = 'red';
            }
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            setElapsedTime(elapsedTime); // Update the state with the elapsed time
            // Handle error cases if needed
          }
        }else{
          setUploadStatus('ERROR occurred while making upload');
          const uploadStatusElement = document.getElementById('upload-status');
          if (uploadStatusElement) {
            uploadStatusElement.style.color = 'red';
          }
          setElapsedTime(elapsedTime);
        }
      };

      reader.readAsBinaryString(file);
    });
  };
  function clasify_bpmn(bpmn:any){
    if (bpmn === "DEMO_webapp_RPA"){
      console.log(bpmn)
      return <div>
              <h1>
                <Link href={`http://localhost:3000/doc/${bpmn}`}>Document</Link>
              </h1>
              <Button onClick={handleUpload} type="primary" shape="round" icon={<DownloadOutlined />}  className={styles.button}>
                Uploadfile
              </Button>
              <p id="upload-status" className={styles.button}>Status: {uploadStatus}</p>
              <div>processtime = {elapsedTime}</div>
            </div>
    }
  }

  const handleChange = (value:string) => {
    setSelected(value);
    const xmlz = Buffer.from(x[value], 'base64').toString('utf-8');
    setBpmnKey(prevKey => prevKey + 1);
    setXml(xmlz)
    setdatabpmn(value)
  };

  const checkactiveprocess = () => {
    const url = 'http://localhost:8000/checkactiveprocess';
    const payload = { bpmnprocessID_pl: selected };
    setcheckactive('Start Request check active process');
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          setcheckactive('Request failed');
          throw new Error('Request failed');
        }
      })
      .then(data => {
        if (data['List of Active ProcessInstanceKey'].length !== 0) {
          const statusMessage = JSON.stringify(data);
          setcheckactive(`${statusMessage}`);
        } else {
          setcheckactive('Have no flow are active.');
        }    
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  const handleSubmit = () => {
    const url = 'http://localhost:8000/startflow';
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
          return response.json();
        } else {
          setsubmitStatus('Request failed');
          throw new Error('Request failed');
        }
      })
      .then(data => {
        if (data['List of Active ProcessInstanceKey'].length !== 0) {
          const errorMessage = "Cannot start flow due to active flow Please cancel all process as follows list of this process instance. ";
          const statusMessage = JSON.stringify(data);
          setsubmitStatus(`${errorMessage} ${statusMessage}`);
        } else {
          setsubmitStatus('Start flow successfully');
        }    
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
        <div>{clasify_bpmn(bpmnID)}</div>
        <Button onClick={checkactiveprocess}>CheckActiveProcess</Button>
        <p>{checkactive}</p>
      </Form>
      <Bpmn className={styles.bpmn} key={bpmnKey} xmlcurrent={xml}/>
    </div>
  );
};

export default () => <FormDisabledDemo />;


