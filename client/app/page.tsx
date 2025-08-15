"use client";

import Header from '@/components/header';
import Intro from '@/components/intro';
import Wwd from '@/components/wwd';
import React from 'react';

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <Intro />
      <Wwd />
    </>
  );
};

export default Home;
