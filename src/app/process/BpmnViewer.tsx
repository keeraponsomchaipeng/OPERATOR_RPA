import React, { useEffect, useRef } from 'react';
import BpmnViewer from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
import './bpmn.css'

interface BpmnProps {
  xmlcurrent: string;
  current_bpmn_process:string;
  Current_Instance_Status:string;
}

const Bpmn: React.FC<BpmnProps> = ({ xmlcurrent , current_bpmn_process , Current_Instance_Status}) => {
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
        overlays.add(current_bpmn_process, {
          position: {
            top: -10,
            right:50,
          },
          show: {
            minZoom: 0.5,
            maxZoom: 5.0,
          },
          html: `<div >
                  <div class="activestatus">${Current_Instance_Status}</div>
                </div>`,
        });
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

  return (
    <div ref={viewerRef} style={{ width: '100%', height: '500px' }} />
  );
};

export default Bpmn;
