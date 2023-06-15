"use client"

import React, { useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

const width =1200
const height =600
const FormDisabledDemo: React.FC = () => {
  
  return (
    <div className={styles.fullscreenz}>
      <h1>วิธีการใช้งาน Web UI ในการ Run Robot</h1>
      <Link href="https://youtu.be/RZnbGo1tuSg">
        <h1 style={{ color: 'red' }}>คลิปอธิบายวิธีการใช้งาน</h1>
      </Link>
      <h3>ในเมนูปัจจุบัน มีทั้งสิ้น  5 เมนู</h3>
      <Image src="/img001.png" alt="My Image" width={width} height={height} />
      <h3>เมนู Dashboard </h3>
      <div>ใช้สำหรับติดตามสถานะของ Robot ปัจจุบันยังไม่พร้อมใช้งาน จะมีการ ปรับปรุงในอนาคต</div>
      <Image src="/img002.png" alt="My Image" width={width} height={height} />
      <h3>เมนู Process </h3>
      <div>ใช้สำหรับดูรายละเอียด ประวัติของ Flow ที่กำลัง RUN อยู่</div>
      <Image src="/img003.png" alt="My Image" width={width} height={height} />
      <h3>รายละเอียดของแต่ละ Column</h3>
      <div>BpmnProcessID : เป็นชื่อ ID ของ Flow</div>
      <div>ProcessInstanceKey : เป็นเลขของ Process งานนั้นๆ</div>
      <div>Current_Process_ID : เป็น Column ไว้ใช้อ้างอิงถึงว่าปัจจุบัน Process อยู่ในขั้นตอนไหนแล้ว และ Status เป็นอย่างไร </div>
      <div>รายละเอียดของ status</div>
      <div>-	Active : กระบวนการนั้นๆ กำลังทำงานอยู่ หรือ รอการทำงาน </div>
      <div>-	TIME_OUT : กระบวนการนั้นๆ หมดระยะเวลาทำงาน </div>
      <div>-	CANCELED : กระบวนการนั้นๆ ถูกยกเลิกโดยผู้ใช้งาน </div>
      <div>-	INCIDENT : กระบวนการนั้นๆมี ERROR เกิดขึ้น </div>
      <div>Starttime : เวลาที่ Process เริ่มต้นทำงาน</div>
      <div>Endtime : เวลาที่ Process  สิ้นสุด</div>
      <div>Action : ใช้สำหรับ ยกเลิก Flow หรือ Restartflow</div>
      <h3>เมนู Run process</h3>
      <Image src="/img004.png" alt="My Image" width={width} height={height} />
      <div>ใช้สำหรับ Start Flow BPMN Process ที่ต้องการ</div>
      <h3>เมนู Upload file</h3>
      <Image src="/img005.png" alt="My Image" width={width} height={height} />
      <div>เมื่อมีงานที่มีความจำเป็นในการ Upload file สำหรับ Run Process สามารถทำได้ที่เมนูนี้</div>
    </div>
  );
};

export default () => <FormDisabledDemo />;


