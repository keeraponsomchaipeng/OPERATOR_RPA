"use client"

import React, { useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';

const width =1200
const height =600

const FormDisabledDemo: React.FC = () => {
  return (
    <div className={styles.fullscreenz}>
      <h3>ตัวอย่างการใช้งาน Flow DEMO_webapp_RPA</h3>
      <div>เบื้องต้นหาเราต้องการที่จะ Start Flow การทำงาน ให้เข้ามาที่ Run Process จากนั้นเลือก Flow ที่ต้องการจะ RUN ในที่นี้จะเลือก RUN Flow “DEMO_webapp_RPA” </div>
      <Image src="/img006.png" alt="My Image" width={width} height={height} />
      <div>จากนั้น คลิกที่ Submit ถ้าไม่มี ERROR เกิดขึ้น Status จะโชว่า Start flow successfully</div>
      <Image src="/img007.png" alt="My Image" width={width} height={height} />
      <div>จากนั้น เราสามารถมาตรวจสอบที่หน้า Process ว่า Flow ของเรา เริ่มต้นทำงานแล้วหรือยัง</div>
      <Image src="/img008.png" alt="My Image" width={width} height={height} />
      <div>จะทำการ Refresh page ก่อนหนึ่งครั้ง เพื่อให้แสดงข้อมูลที่เป็นข้อมูลล่าสุด จะสังเกตุได้ว่า Flow ได้ทำการเริ่มต้นการ RUN แล้ว และอยู่ในขั้นตอน Upload_file_24shopping</div>
      <div>ซึ่งเราจำเป็นที่จะต้องทำการ Upload file ที่ใช้ในการทำงาน ให้เข้าที่เมนู Upload file</div>
      <Image src="/img009.png" alt="My Image" width={width} height={height} />
      <div>เลือก Flow ที่ต้องการ Upload file จากนั้นคลิกที่ Uploadfile</div>
      <Image src="/img010.png" alt="My Image" width={width} height={height} />
      <div>เลือก File ที่ต้องการ Upload ซึ่ง ชื่อ File จะเป็นชื่ออะไรก็ได้ แต่ว่าภายใน zip file ที่เราจะ Upload ต้องเป็นชื่อที่ถูกต้องเพื่อให้ Robot สามารถทำงานได้</div>
      <Image src="/img011.png" alt="My Image" width={width} height={height} />
      <div>เมื่อทำการคลิกอัพโหลดแล้ว ให้รอจนกว่าจะทำการอัพโหลดเสร็จ ในส่วนนี้ขึ้นอยู่กับความเร็วของอินเตอรเน็ตของผู้ใช้งาน และขนาดของ File</div>
      <Image src="/img012.png" alt="My Image" width={width} height={height} />
      <div>เมื่ออัพโหลดเสร็จแล้ว ตัวอักษรจะเป็นสีเขียว และมีข้อความขึ้นว่าอัพโหลดเสร็จแล้วจากนั้นลองตรวจสอบในหน้า Process อีกครั้ง</div>
      <Image src="/img013.png" alt="My Image" width={width} height={height} />
      <div>จะเห็นได้ว่า กระบวนการ ดำเนินการถึงขั้นตอนการ Generate_Report แล้ว User สามารถปิดหน้าเว็บไซต์ได้เลย เพราะไม่มีขั้นตอนที่ User จะต้องทำงานการหน้าเว็บด้วยแล้ว</div>
    </div>
  );
};

export default function DemoWebappRPA() {
  return <FormDisabledDemo />;
}


