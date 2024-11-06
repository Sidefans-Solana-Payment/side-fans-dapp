import { Outlet } from 'umi';

export default function Layout() {
  return (
    <div className="w-full h-screen">
      <Outlet />
    </div>
  );
}
