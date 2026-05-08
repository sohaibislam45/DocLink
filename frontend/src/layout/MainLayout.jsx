import { Outlet } from 'react-router-dom';
import Navbar from './header/Navbar';
import Footer from './footer/Footer';

const MainLayout = () => {
  return (
    <div className="bg-background-primary min-h-screen text-text-primary overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
