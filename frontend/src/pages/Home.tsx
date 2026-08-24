import React from "react";
import Navbar from '../components/common/Navbar';
import Hero from '../components/features/Hero';
import Features from '../components/features/Features';
import Footer from '../components/common/Footer';

const Home = () => {

  return (
    <>
      <Navbar />
      <div className="w-full min-h-[calc(100vh-6rem)]">
        <Hero />
        <Features />
        <Footer />
      </div>
    </>
  );
};

export default Home;
