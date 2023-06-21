'use client'
import React from 'react';
import axios from 'axios';

export default function downloadfile() {
  const handleDownload = async () => {
    try {
      console.log("Start Downloading...");
      const payload = {
        processinstance: "2251799813689395",
        dept: "24shopping"
      };

      const response = await axios.post('http://localhost:8001/download_sendsms', payload, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'your_file_name.ext');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      Hello
      <button onClick={handleDownload}>downloadtest</button>
    </div>
  );
}

