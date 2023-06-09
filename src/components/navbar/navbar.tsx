"use client"
import Link from 'next/link';
import React from 'react';
import { Breadcrumb, Layout, Menu, theme,Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  LineChartOutlined,
  NodeIndexOutlined
} 
from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export default function Navbar() 
  {
    const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className="layout">
      <Header >
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <LineChartOutlined />,
              label: (<Link href="/dashboard">dashboard</Link>),
            },
            {
              key: '2',
              icon: <NodeIndexOutlined />,
              label: (<Link href="/process">Process</Link>),
            },
            {
              key: '3',
              icon: <PlayCircleOutlined />,
              label: (<Link href="/runprocess">Run Process</Link>),
            },
            {
              key: '4',
              icon: <UploadOutlined />,
              label: (<Link href="/uploadfile">Upload file</Link>),
            },
          ]}
        />
      </Header>
    </Layout>
  )
}

