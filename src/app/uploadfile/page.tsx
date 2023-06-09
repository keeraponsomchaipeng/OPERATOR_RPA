'use client'
import React, { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Radio, Space, Divider } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import styles from './page.module.css'

const Uploadfile: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [size, setSize] = useState<SizeType>('large'); // default is 'middle'
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const startFlow = () => {
    console.log("Start Laew");
  };

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
        if (typeof fileContents === 'string' && file.name == "Data_yim.zip") {
          // Encode the file contents as base64
          const encodedData = btoa(fileContents);
          console.log('Encoded data:', encodedData);
          setUploadStatus('Encoding file for upload ...');
          // Create the request data
          const data = {
            encoded: encodedData,
          };

          // Set the upload status to 'Uploading'
          setUploadStatus('Start Uploading file: ' + file.name);

          // Make the POST request
          try {
            const response = await fetch('http://10.182.37.125:8001/decode', {
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
              setUploadStatus('Please start flow "following_sms" first');
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
          setUploadStatus('Upload file Wrong file please upload Data_yim.zip');
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

  return (
    <div className={styles.upload}>
      <Button onClick={handleUpload} type="primary" shape="round" icon={<DownloadOutlined />} size={size} className={styles.button}>
        Uploadfile
      </Button>
      <p id="upload-status" className={styles.button}>Status: {uploadStatus}</p>
      <div>processtime = {elapsedTime}</div>
    </div>
  );
};

export default Uploadfile;
