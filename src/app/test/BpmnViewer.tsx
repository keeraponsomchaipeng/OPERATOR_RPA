import React, { useEffect, useRef } from 'react';
import BpmnViewer from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';

interface BpmnProps {
  xml: string;
}

const Bpmn: React.FC<BpmnProps> = ({ xml }) => {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (xml && viewerRef.current) {
      const viewer = new BpmnViewer({ container: viewerRef.current });

      viewer.importXML(xml, (err: any) => {
        if (err) {
          console.error('failed to import BPMN 2.0 xml diagram', err);
        } else {
          console.log('BPMN 2.0 xml diagram was imported successfully');
        }
      });
    }
  }, [xml]);

  return (
    <div ref={viewerRef} style={{ width: '100%', height: '500px' }} />
  );
};

export default Bpmn;
