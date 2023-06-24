import React, { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import './bpmn.css'
import axios, { AxiosResponse } from 'axios';

interface BpmnProps {
  xmlcurrent: string;
  Current_Process_ID:string;
  Current_Instance_Status:string;
  runflowcheck:string;
  BPMNID:string;
}

interface DataItem {
  [key: string]: {
    [key: string]: number;
  };
}

function getClassByStatus(status: string): string {
  if (status === "Active") {
    const top = -10
    const right = 50
    return "activestatus";
  } else if (status === "COMPLETED") {
    const top = -10
    const right = 50
    return "completestatus";
  } else if (status === "FAILED") {
    const top = -10
    const right = 50
    return "failedstatus";
  } else if (status === "CANCELED") {
    const top = -10
    const right = 50
    return "canceledstatus";
  } else {
    return ""; // Return an empty string if the status doesn't match any specific class
  }
}




const Bpmn: React.FC<BpmnProps> = ({ xmlcurrent , Current_Process_ID , Current_Instance_Status , runflowcheck , BPMNID}) => {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (xmlcurrent && viewerRef.current && Current_Instance_Status) {
      const viewer = new BpmnViewer({ container: viewerRef.current });

      viewer.importXML(xmlcurrent, (err: any) => {
        if (err) {
          console.error('failed to import BPMN 2.0 xmlcurrent diagram', err);
        } else {
          console.log('BPMN 2.0 xml diagram was imported successfully');
        }
        const canvas = viewer.get('canvas');
        const overlays = viewer.get('overlays');

        // Zoom to fit full viewport
        canvas.zoom('fit-viewport');
        overlays.add(Current_Process_ID, {
          position: {
            top: -10,
            right:50,
          },
          show: {
            minZoom: 0.5,
            maxZoom: 5.0,
          },
          html: `<div >
                  <div class="${getClassByStatus(Current_Instance_Status)}">${Current_Instance_Status}</div>
                </div>`,
        });
      });
    } else if (xmlcurrent && viewerRef.current && runflowcheck === "runprocess") {
      const postData = {
        bpmnid : [BPMNID]
      }
      axios.post('http://localhost:8000/trackprocess/', postData)
      .then((response: AxiosResponse) => {
        const res = response.data;
        const viewer = new BpmnViewer({ container: viewerRef.current });
        /// Create Post request for check all status
        viewer.importXML(xmlcurrent, (err: any) => {
          if (err) {
            console.error('failed to import BPMN 2.0 xmlcurrent diagram', err);
          } else {
            console.log('BPMN 2.0 xml diagram was imported successfully');
          }
          const canvas = viewer.get('canvas');
          const overlays = viewer.get('overlays');
          canvas.zoom('fit-viewport');
          const overlayData:any = res.map((item: any) => {
            const key = Object.keys(item)[0];
            const keysstatus = Object.keys(item[key])[0];
            const countstatus = item[key][keysstatus]
            console.log('Key:', keysstatus);
          
            let topstatus: number;
            let rightstatus: number;
          
            if (keysstatus === "Active") {
              topstatus = -10;
              rightstatus = 40;
            } else if (keysstatus === "FAILED") {
              topstatus = 60;
              rightstatus = 40;
            } else if (keysstatus === "CANCELED") {
              topstatus = 60;
              rightstatus = 150;
            } else if (keysstatus === "COMPLETED") {
              topstatus = 80;
              rightstatus = 40;
            }
          
            return {
              key,
              keysstatus,
              topstatus,
              rightstatus,
              countstatus
            };
          });
          
          overlayData.forEach((data:any) => {
            if (data.key) {
              try {
                overlays.add(data.key, {
                  position: {
                    top: data.topstatus,
                    right: data.rightstatus,
                  },
                  show: {
                    minZoom: 0.5,
                    maxZoom: 5.0,
                  },
                  html: `<div>
                            <div class="${getClassByStatus(data.keysstatus)}">${data.keysstatus} </div>
                            <h4 >${data.countstatus}</h4>
                          </div>`,
                });
              } catch (error) {
                console.log(`Error adding overlay for key: ${data.key}`);
                console.error(error);
              }
            }
          });
          
          
          

   });
      })

      .catch((error: Error) => {
        console.log(error);
      });
      


    } else if (xmlcurrent && viewerRef.current) {
      const viewer = new BpmnViewer({ container: viewerRef.current });

      viewer.importXML(xmlcurrent, (err: any) => {
        if (err) {
          console.error('failed to import BPMN 2.0 xmlcurrent diagram', err);
        } else {
          console.log('BPMN 2.0 xml diagram was imported successfully');
        }
      });      
    }
  }, [xmlcurrent]);


  // useEffect(() => { /// Test for loop
  //   responseData.forEach((item) => {
  //     const key = Object.keys(item)[0];
  //     // if (item['Upload_file_24shoping']) {
  //     //   console.log(item['Upload_file_24shoping']['Active']);
  //     // }
  //     console.log('Key:', key);
      
  //   });
  // }, [responseData]);
  

  return (
    <div ref={viewerRef} style={{ width: '100%', height: '500px' }} />
  );
};

export default Bpmn;
