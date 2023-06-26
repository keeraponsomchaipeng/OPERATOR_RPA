"use client"
import {
  Button,
  Form,
  Input,
  Select,
  Switch,
  Spin,
} from 'antd';
import React, { useState } from 'react';
import styles from './page.module.css';
import axios, { AxiosResponse } from 'axios';
import { x } from './bpmn';
import Bpmn from '../process/BpmnViewer';
import { DownloadOutlined , FileTextOutlined} from '@ant-design/icons';
import Link from 'next/link';
// import downloadfile_func from '../runprocess/downloadfile';

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
    value: 'Testone_more_flow',
    label: 'Testone_more_flow',
  },
];




const FormDisabledDemo: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>(''); // default is 'middle'
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [selected, setSelected] = useState();
  const [xml, setXml] = React.useState<string>();
  const [bpmnKey, setBpmnKey] = React.useState<number>(0); // Adding state to track key
  const [bpmnID, setdatabpmn] = React.useState<string>();
  const [submitStatus, setsubmitStatus] = useState<string>('');
  const [checkactive, setcheckactive] = useState<string>('');
  const [downloadStatus, setDownloadStatus] = useState<string>(''); // default is 'middle'
  const [isDivEnabledupload, setIsDivEnabledupload] = useState(false);
  const [isDivEnableddownload, setIsDivEnableddownload] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingicon, setIsUploadingicon] = useState(false);
  const [isEnableselect, setIsSelecting] = useState(false);

  function downloadfile_func() {
    const handleDownload = async () => {
      try {
        console.log("Start Downloading...");
        setDownloadStatus("Preparing file to download...");
        setIsDownloading(true)
        const payload = {
          bpmn: bpmnID,
          userid: "keeraponsom"
        };
  
        const response = await axios.post('http://localhost:8001/download_sendsms', payload, {
          responseType: 'blob',
        });
        if (response.status === 201) {
          setDownloadStatus("Need to wait until complete all task to download result file");
          setIsDownloading(false)
        } else if (response.status === 200) {
          setDownloadStatus("Start downloadfile to your computer");
          setIsDownloading(false)
          setIsDivEnableddownload(false)
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'Download_File.zip');
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          setDownloadStatus("Have some error occured, Please contact RPA keerapon");
          setIsDownloading(false)
        }

      } catch (error) {
        setDownloadStatus("Have some error occured, Please contact RPA keerapon");
        setIsDownloading(false)
        console.error(error);
      }
    };
  
    return (<div>
      <div className={isDivEnableddownload ? styles.disabled : styles.disableddiv}>
        <Button onClick={handleDownload} type="primary" icon={<DownloadOutlined />} size={"Default"}>Download result file</Button>
      </div>
      
      <div className={styles.statuscss}>Status : {downloadStatus} {isDownloading && <Spin size="large"/>}</div>
      </div>
    );
  }

  const handleUpload = () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.click();

    // Listen for file selection
    input.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.files && target.files.length > 0){
      const file = target.files[0];
      const reader = new FileReader();
      setUploadStatus('Preparing to upload file...');
      setIsUploadingicon(true)
      // Read the file contents
      const startTime = performance.now();
      reader.onload = async (fileEvent) => {
        const fileContents = fileEvent.target?.result;
        if (typeof fileContents === 'string') {
          // Encode the file contents as base64
          const encodedData = btoa(fileContents);
          setUploadStatus('Encoding file for upload ...');
          setIsUploadingicon(true)
          // Create the request data
          const data = {
            encoded: encodedData,
            to_flow: bpmnID
          };

          // Set the upload status to 'Uploading'
          setUploadStatus('Start Uploading file: ' + file.name);
          setIsUploadingicon(true)
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
              setIsUploadingicon(false)
              setIsUploading(true)
              const uploadStatusElement = document.getElementById('upload-status');
              if (uploadStatusElement) {
                uploadStatusElement.style.color = 'rgb(0, 100, 0)';
              }
              // Perform further actions if needed
            } else if (response.status === 404) {
              console.error('POST request failed');
              setUploadStatus('Please start flow "DEMO_webapp_RPA" first');
              setIsUploadingicon(false)
              const uploadStatusElement = document.getElementById('upload-status');
              if (uploadStatusElement) {
                uploadStatusElement.style.color = 'red';
              }
              // Handle error cases if needed
            } else {
              console.error('POST request failed with 4040');
              setUploadStatus('Please start flow before uploading file');
              setIsUploadingicon(false)
              const uploadStatusElement = document.getElementById('upload-status');
              if (uploadStatusElement) {
                uploadStatusElement.style.color = 'red';
              }
              // Handle error cases if needed
            }
          } catch (error) {
            console.error('Error occurred while making the POST request:', error);
            setUploadStatus('Error occurred while making the POST request');
            setIsUploadingicon(false)
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
          setIsUploadingicon(false)
          const uploadStatusElement = document.getElementById('upload-status');
          if (uploadStatusElement) {
            uploadStatusElement.style.color = 'red';
          }
          setElapsedTime(elapsedTime);
        }
      };

      reader.readAsBinaryString(file);
    }
    });
  };
// Pre check for current step that's upload or not
  React.useEffect(() => {
    if (bpmnID === "DEMO_webapp_RPA") {
      checkactiveprocess();
    }
  }, [bpmnID]);

  function clasify_bpmn(bpmn:any){
    if (bpmn === "DEMO_webapp_RPA"){
      return <div>
        <div className={isEnableselect ? styles.disabled : styles.disableddiv}>
        <div className={styles.borderstep}>
        <h2 className={styles.stepdivine}>
          Step 2 : Start Process  <Button icon={<FileTextOutlined />} href={`http://localhost:3000/doc/${bpmn}`} /> 
        </h2>
            <div className={styles.stepdivine}>
              <Button onClick={handleSubmit}>Start Process</Button>
              </div >
              <pre className={styles.stepdivine}>{submitStatus}</pre>
              <div className={isDivEnabledupload ? styles.disabled : styles.disableddiv}>
              <h2 className={styles.boxmargin}>Step 3 : Upload file</h2>
              <Button onClick={handleUpload} type="primary" shape="round" icon={<DownloadOutlined />}  className={isUploadingicon ? styles.disboxmargin : styles.boxmargin}>
                Uploadfile
              </Button>
              <div className={isDivEnabledupload ? styles.disabled : styles.disableddiv}></div>
              <p id="upload-status" className={styles.back_status}>Status: {uploadStatus} {isUploadingicon && <Spin size="large"/>}</p>
              <div>processtime = {elapsedTime}</div>
              </div>
              <h2 className={styles.marginbox}>
                Final step : Download file result
              </h2>
              <div>{downloadfile_func()}</div>
              </div>
              <div className={styles.borderstep}>
              <Button onClick={checkactiveprocess} className={styles.marginbox} >CheckActiveProcess</Button>
              <pre>{checkactive}</pre>
              </div>
              </div>
            </div>
    } else {
      return <div>
      <div className={styles.borderstep}>
      <div className={isEnableselect ? styles.disabled : styles.disableddiv}>
        <div className={styles.borderstep}>
      <h2 className={styles.stepdivine}>
        Step 2 : Start Process
      </h2>
      <div>
        <Button onClick={handleSubmit}>Start Process</Button>
      </div>
      <pre className={styles.stepdivine}>{submitStatus}</pre>
      </div>
      <Button onClick={checkactiveprocess} className={styles.marginbox} >CheckActiveProcess</Button>
      <pre>{checkactive}</pre>
      </div>
      </div>
      </div>
    }
  }

  const handleChange = (value:any) => {
    console.log(value)
    setSelected(value);
    const xmlz = Buffer.from(x[value], 'base64').toString('utf-8');
    setBpmnKey(prevKey => prevKey + 1);
    setXml(xmlz)
    setdatabpmn(value)
    setIsSelecting(true)
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
        if (data.length !== 0) {
          // const statusMessage = JSON.stringify(data);
          // setcheckactive(`${statusMessage}`);
          const formattedData = Object.entries(data[0]).map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`).join('\n');
          const datacheck = data[0]
          setcheckactive(formattedData);
          if (datacheck['Current_Process_ID'] === "Upload_file_24shoping") { // check for flow DEMO_webapp_RPA
            setIsDivEnabledupload(true)
          } 
          else if (datacheck['Current_Process_ID'] === "UserTask_download_file_result") {
            setIsDivEnableddownload(true)
          }
        } else {
          setcheckactive(`Have no active process for ${bpmnID}`);
        }    
      })
      .catch(error => {
        console.error('Error:', error);
        setcheckactive(`Some error occured, unable to check ${bpmnID} .`)
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
        if (data.length !== 0) {
          const errorMessage = "Cannot start flow due to active flow.\nPlease cancel all active process as follows list of this process instance. ";
          // const statusMessage = JSON.stringify(data);
          const statusMessage = Object.entries(data[0]).map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`).join('\n');
          setsubmitStatus(`${errorMessage}\n${statusMessage}`);
        } else {
          setIsDivEnabledupload(true);
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
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
      >
        <div className={styles.borderstep}>
        <h2 className={styles.stepdivine}>Step 1 : Select Process</h2>
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
        </div>
        <div>{clasify_bpmn(bpmnID)}</div>
      </Form>
      <Bpmn 
      key={bpmnKey} 
      xmlcurrent={xml ?? ''}
      runflowcheck="runprocess" 
      BPMNID={bpmnID ?? ''}
      Current_Process_ID=""
      Current_Instance_Status="" />
    </div>
  );
};

// export default () => <FormDisabledDemo />;

const Page: React.FC = () => {
  return <FormDisabledDemo />;
};

export default Page;
