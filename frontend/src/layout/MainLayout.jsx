import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './header/Navbar';
import Footer from './footer/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isRoomPage = location.pathname.startsWith('/room/');

  return (
    <div className="bg-background-primary min-h-screen text-text-primary overflow-x-hidden flex flex-col">
      {!isRoomPage && <Navbar />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isRoomPage && <Footer />}
    </div>
  );
};

export default MainLayout;
