import React, { useEffect, useRef } from 'react';
import BpmnViewer from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';

interface BpmnProps {
  xmlcurrent: string;
}

const Bpmn: React.FC<BpmnProps> = ({ xmlcurrent }) => {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (xmlcurrent && viewerRef.current) {
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
