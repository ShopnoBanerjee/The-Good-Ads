"use client";

import Header from '@/components/header';
import Intro from '@/components/intro';
import Wwd from '@/components/wwd';
import Footer from '@/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <Intro />
      <Wwd />
      <Footer />
    </>
  );
};

export default Home;
