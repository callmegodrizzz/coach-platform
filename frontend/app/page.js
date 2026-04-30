import Header from '../components/Header';
import Hero from '../components/sections/Hero';
import Author from '../components/sections/Author';
import Programs from '../components/sections/Programs';
import Format from '../components/sections/Format';
import Reviews from '../components/sections/Reviews';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Author />
      <Programs />
      <Format />
      <Reviews />
      <Footer />
    </>
  );
}
