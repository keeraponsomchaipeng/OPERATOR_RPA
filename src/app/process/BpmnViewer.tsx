import React, { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import './bpmn.css'
import axios, { AxiosResponse } from 'axios';

interface BpmnProps {
  key:number;
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
    return "activestatus";
  } else if (status === "COMPLETED") {
    return "completestatus";
  } else if (status === "FAILED") {
    return "failedstatus";
  } else if (status === "CANCELED") {
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
        
        let iconstatus: string = ""
        if (Current_Instance_Status === "Active") {
          iconstatus = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15">
          <circle cx="8" cy="8" r="5.5" fill="white" />
          <circle cx="8" cy="8" r="3.7" fill="none" stroke="rgb(23, 247, 101)" stroke-width="0.75" />
        </svg>
        `
        } else if (Current_Instance_Status === "FAILED") {
          iconstatus = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15">
          <circle cx="8" cy="8" r="7" fill="white" />
          <text x="8" y="12" font-size="11"  text-anchor="middle" fill="red">!</text>
        </svg>
        
        `
        } else if (Current_Instance_Status === "CANCELED") {
          iconstatus = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
          <circle cx="8" cy="8" r="5" stroke="white" stroke-width="4" />
          <circle cx="8" cy="8" r="4.7" fill="rgb(138, 136, 136)" stroke="rgb(138, 136, 136)" />
          <line x1="12" y1="4" x2="3.5" y2="12.5" stroke="white" stroke-width="2" />
        </svg>
        
        `
        } else if (Current_Instance_Status === "COMPLETED") {
          iconstatus = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke="white" stroke-width="2" fill="white" x="0px" y="0px" width="16" height="16" viewBox="0 0 122.88 122.88" enable-background="new 0 0 122.88 122.88" xml:space="preserve"><g><path d="M34.388,67.984c-0.286-0.308-0.542-0.638-0.762-0.981c-0.221-0.345-0.414-0.714-0.573-1.097 c-0.531-1.265-0.675-2.631-0.451-3.934c0.224-1.294,0.812-2.531,1.744-3.548l0.34-0.35c2.293-2.185,5.771-2.592,8.499-0.951 c0.39,0.233,0.762,0.51,1.109,0.827l0.034,0.031c1.931,1.852,5.198,4.881,7.343,6.79l1.841,1.651l22.532-23.635 c0.317-0.327,0.666-0.62,1.035-0.876c0.378-0.261,0.775-0.482,1.185-0.661c0.414-0.181,0.852-0.323,1.3-0.421 c0.447-0.099,0.903-0.155,1.356-0.165h0.026c0.451-0.005,0.893,0.027,1.341,0.103c0.437,0.074,0.876,0.193,1.333,0.369 c0.421,0.161,0.825,0.363,1.207,0.604c0.365,0.231,0.721,0.506,1.056,0.822l0.162,0.147c0.316,0.313,0.601,0.653,0.85,1.014 c0.256,0.369,0.475,0.766,0.652,1.178c0.183,0.414,0.325,0.852,0.424,1.299c0.1,0.439,0.154,0.895,0.165,1.36v0.23 c-0.004,0.399-0.042,0.804-0.114,1.204c-0.079,0.435-0.198,0.863-0.356,1.271c-0.16,0.418-0.365,0.825-0.607,1.21 c-0.238,0.377-0.518,0.739-0.832,1.07l-27.219,28.56c-0.32,0.342-0.663,0.642-1.022,0.898c-0.369,0.264-0.767,0.491-1.183,0.681 c-0.417,0.188-0.851,0.337-1.288,0.44c-0.435,0.104-0.889,0.166-1.35,0.187l-0.125,0.003c-0.423,0.009-0.84-0.016-1.241-0.078 l-0.102-0.02c-0.415-0.07-0.819-0.174-1.205-0.31c-0.421-0.15-0.833-0.343-1.226-0.575l-0.063-0.04 c-0.371-0.224-0.717-0.477-1.032-0.754l-0.063-0.06c-1.58-1.466-3.297-2.958-5.033-4.466c-3.007-2.613-7.178-6.382-9.678-9.02 L34.388,67.984L34.388,67.984z M61.44,0c16.96,0,32.328,6.883,43.453,17.987c11.104,11.125,17.986,26.493,17.986,43.453 c0,16.961-6.883,32.329-17.986,43.454C93.769,115.998,78.4,122.88,61.44,122.88c-16.961,0-32.329-6.882-43.454-17.986 C6.882,93.769,0,78.4,0,61.439C0,44.48,6.882,29.112,17.986,17.987C29.112,6.883,44.479,0,61.44,0L61.44,0z M96.899,25.981 C87.826,16.907,75.29,11.296,61.44,11.296c-13.851,0-26.387,5.611-35.46,14.685c-9.073,9.073-14.684,21.609-14.684,35.458 c0,13.851,5.611,26.387,14.684,35.46s21.609,14.685,35.46,14.685c13.85,0,26.386-5.611,35.459-14.685s14.684-21.609,14.684-35.46 C111.583,47.59,105.973,35.054,96.899,25.981L96.899,25.981z"/></g></svg>
        `
        }
        overlays.add(Current_Process_ID, {
          
          position: {
            top: 69,
            right:118,
          },
          show: {
            minZoom: 0.5,
            maxZoom: 5.0,
          },
          html: `<div class="${getClassByStatus(Current_Instance_Status)}">
                  <div style="margin-right: 3px;margin-left: 3px;margin-top: 3px;margin-bottom: 3px;">${iconstatus}</div>
                  <div style="margin-right: 6px;margin-top: 3px;margin-bottom: 3px;">1</div>
                </div>`,
        });
      });
    } else if (xmlcurrent && viewerRef.current && runflowcheck === "runprocess") {
      const postData = {
        bpmnid : [BPMNID]
      }
      axios.post('https://10.182.37.125:8000/trackprocess/', postData)
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
          
            let topstatus: number = 0;
            let rightstatus: number = 0;
            let iconstatus: string = ""
            if (keysstatus === "Active") {
              topstatus = 69;
              rightstatus = 118;
              iconstatus = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15">
              <circle cx="8" cy="8" r="5.5" fill="white" />
              <circle cx="8" cy="8" r="3.7" fill="none" stroke="rgb(23, 247, 101)" stroke-width="0.75" />
            </svg>
            `
            } else if (keysstatus === "FAILED") {
              topstatus = 69;
              rightstatus = 17;
              iconstatus = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15">
              <circle cx="8" cy="8" r="7" fill="white" />
              <text x="8" y="12" font-size="11"  text-anchor="middle" fill="red">!</text>
            </svg>
            
            `
            } else if (keysstatus === "CANCELED") {
              topstatus = -15;
              rightstatus = 118;
              iconstatus = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <circle cx="8" cy="8" r="5" stroke="white" stroke-width="4" />
              <circle cx="8" cy="8" r="4.7" fill="rgb(138, 136, 136)" stroke="rgb(138, 136, 136)" />
              <line x1="12" y1="4" x2="3.5" y2="12.5" stroke="white" stroke-width="2" />
            </svg>
            
            `
            } else if (keysstatus === "COMPLETED") {
              topstatus = -15;
              rightstatus = 17;
              iconstatus = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke="white" stroke-width="2" fill="white" x="0px" y="0px" width="16" height="16" viewBox="0 0 122.88 122.88" enable-background="new 0 0 122.88 122.88" xml:space="preserve"><g><path d="M34.388,67.984c-0.286-0.308-0.542-0.638-0.762-0.981c-0.221-0.345-0.414-0.714-0.573-1.097 c-0.531-1.265-0.675-2.631-0.451-3.934c0.224-1.294,0.812-2.531,1.744-3.548l0.34-0.35c2.293-2.185,5.771-2.592,8.499-0.951 c0.39,0.233,0.762,0.51,1.109,0.827l0.034,0.031c1.931,1.852,5.198,4.881,7.343,6.79l1.841,1.651l22.532-23.635 c0.317-0.327,0.666-0.62,1.035-0.876c0.378-0.261,0.775-0.482,1.185-0.661c0.414-0.181,0.852-0.323,1.3-0.421 c0.447-0.099,0.903-0.155,1.356-0.165h0.026c0.451-0.005,0.893,0.027,1.341,0.103c0.437,0.074,0.876,0.193,1.333,0.369 c0.421,0.161,0.825,0.363,1.207,0.604c0.365,0.231,0.721,0.506,1.056,0.822l0.162,0.147c0.316,0.313,0.601,0.653,0.85,1.014 c0.256,0.369,0.475,0.766,0.652,1.178c0.183,0.414,0.325,0.852,0.424,1.299c0.1,0.439,0.154,0.895,0.165,1.36v0.23 c-0.004,0.399-0.042,0.804-0.114,1.204c-0.079,0.435-0.198,0.863-0.356,1.271c-0.16,0.418-0.365,0.825-0.607,1.21 c-0.238,0.377-0.518,0.739-0.832,1.07l-27.219,28.56c-0.32,0.342-0.663,0.642-1.022,0.898c-0.369,0.264-0.767,0.491-1.183,0.681 c-0.417,0.188-0.851,0.337-1.288,0.44c-0.435,0.104-0.889,0.166-1.35,0.187l-0.125,0.003c-0.423,0.009-0.84-0.016-1.241-0.078 l-0.102-0.02c-0.415-0.07-0.819-0.174-1.205-0.31c-0.421-0.15-0.833-0.343-1.226-0.575l-0.063-0.04 c-0.371-0.224-0.717-0.477-1.032-0.754l-0.063-0.06c-1.58-1.466-3.297-2.958-5.033-4.466c-3.007-2.613-7.178-6.382-9.678-9.02 L34.388,67.984L34.388,67.984z M61.44,0c16.96,0,32.328,6.883,43.453,17.987c11.104,11.125,17.986,26.493,17.986,43.453 c0,16.961-6.883,32.329-17.986,43.454C93.769,115.998,78.4,122.88,61.44,122.88c-16.961,0-32.329-6.882-43.454-17.986 C6.882,93.769,0,78.4,0,61.439C0,44.48,6.882,29.112,17.986,17.987C29.112,6.883,44.479,0,61.44,0L61.44,0z M96.899,25.981 C87.826,16.907,75.29,11.296,61.44,11.296c-13.851,0-26.387,5.611-35.46,14.685c-9.073,9.073-14.684,21.609-14.684,35.458 c0,13.851,5.611,26.387,14.684,35.46s21.609,14.685,35.46,14.685c13.85,0,26.386-5.611,35.459-14.685s14.684-21.609,14.684-35.46 C111.583,47.59,105.973,35.054,96.899,25.981L96.899,25.981z"/></g></svg>
            `
            }
          
            return {
              key,
              keysstatus,
              topstatus,
              rightstatus,
              countstatus,
              iconstatus
            };
          });
          
          let mincount = Infinity;
          let maxcount = 0;
          overlayData.forEach((item:any) => {
            
            const number = item.countstatus
            if (item.keysstatus === "Active") {
              if (typeof number === 'number' && number < mincount) {
                mincount = number;
              }
              if (typeof number === 'number' && number > maxcount) {
                maxcount = number;
            }
          }
        });

          function performrgb (divcolor: number): {r: number, g: number, b: number, a: number} {
            if (divcolor <= 255) {
              const r = 0;
              const g = 255;
              const b = 255 - divcolor;
              // const a = 0.6*divcolor/765;
              const a = 0.35;
              return { r, g, b ,a};
            } else if (divcolor > 255 && divcolor <= 510) {
              const r = divcolor - 255;
              const g = 255;
              const b = 0;
              // const a = 0.6*divcolor/765;
              const a = 0.35;
              return { r, g, b ,a};
            } else if (divcolor > 510) {
              const r = 255;
              const g = 255 - (divcolor - 510);
              const b = 0;
              // const a = 0.6*divcolor/765;
              const a = 0.35;
              return { r, g, b ,a};
            } else {
              // Default values
              return { r: 0, g: 0, b: 0, a: 0 };
            }
          }
          
          
          overlayData.forEach((data:any) => {
            if (data.key) {
              try {                  
                const divinecolor:number = (765/maxcount)*data.countstatus;
                const { r, g, b, a } = performrgb(divinecolor);
                // const countheatmapColor = {
                //   red: r,
                //   green: g,
                //   blue: b,
                //   alpha: 0.783                
                // };
                // const root = document.documentElement;
                // root.style.setProperty('--countheatmap-color', `rgba(${countheatmapColor.red}, ${countheatmapColor.green}, ${countheatmapColor.blue}, ${countheatmapColor.alpha})`);
                overlays.add(data.key, {
                  position: {
                    top: data.topstatus,
                    right: data.rightstatus,
                  },
                  show: {
                    minZoom: 0.5,
                    maxZoom: 5.0,
                  },
                  html: `<div class="${getClassByStatus(data.keysstatus)}">
                            <div style="margin-right: 3px;margin-left: 3px;margin-top: 3px;margin-bottom: 3px;">${data.iconstatus}</div>
                            <div style="margin-right: 6px;margin-top: 3px;margin-bottom: 3px;">${data.countstatus}</div>
                          </div>`,
                });
                if (data.keysstatus === "Active") {
                overlays.add(data.key, {
                  position: {
                    top: -20,
                    right: 120,
                  },
                  show: {
                    minZoom: 0.5,
                    maxZoom: 5.0,
                  },
                  html: `<div>
                            <div class="testclass" style="background: radial-gradient(ellipse at center, rgba(${r}, ${g}, ${b}, ${a}), rgba(${r}, ${g}, ${b}, 0))"></div>
                          </div>`,
                });
              }
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
