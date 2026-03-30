import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="w-full min-h-[calc(100vh-6rem)]">
        <Hero />
        <Features />
      </div>
    </>
  );
};

export default Home;
