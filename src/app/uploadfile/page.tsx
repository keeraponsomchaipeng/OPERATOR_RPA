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

      // Read the file contents
      const startTime = performance.now();
      reader.onload = async (fileEvent) => {
        const fileContents = fileEvent.target?.result;
        if (typeof fileContents === 'string') {
          setUploadStatus('Preparing to upload file...');
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
              setUploadStatus('Upload file: ' + file.name + ' successful');
              // Perform further actions if needed
            } else {
              console.error('POST request failed');
              setUploadStatus('Upload file: ' + file.name + ' failed');
              // Handle error cases if needed
            }
          } catch (error) {
            console.error('Error occurred while making the POST request:', error);
            setUploadStatus('Error occurred');
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            setElapsedTime(elapsedTime); // Update the state with the elapsed time
            // Handle error cases if needed
          }
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
      <p className={styles.button}>Status: {uploadStatus}</p>
      <div>processtime = {elapsedTime}</div>
    </div>
  );
};

export default Uploadfile;
