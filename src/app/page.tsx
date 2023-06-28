"use client"
import Link from 'next/link';
import React from 'react';
import { Breadcrumb, Layout, Menu, theme,Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} 
from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header, Content, Footer } = Layout;

export default function Home() 
  {
    const {
    token: { colorBgContainer },
  } = theme.useToken();

  const rounter = useRouter()

  React.useEffect(() => {
    const url = 'https://cpalloidcuat.auth.ap-southeast-1.amazoncognito.com/login?client_id=47a7tut24n5fdqsatauin2qd5a&response_type=code&scope=email+openid+profile&redirect_uri=https://10.182.37.125:3000/callback';

    rounter.push(url)
  }
    );


  return (
    <Layout className="layout">
      <Content style={{ padding: '0 50px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-content" style={{ background: colorBgContainer }}>
          Content
        </div>
      </Content>
    </Layout>
  )
}

