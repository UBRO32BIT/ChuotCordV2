import { Routes, Route, Navigate } from 'react-router-dom'
import { privateRoutes, publicRoutes } from './routes';
import { useSelector } from 'react-redux';
function Router() {
  const user = useSelector((state: any) => state?.user?.user);
  return (
    <Routes>
        <Route>
        {privateRoutes.map((route, index) => {
          const Page = route.page;
          return (
            <Route
              key={index}
              path={route.path}
              element={
                user ? (
                  <Page />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          );
        })}
      {publicRoutes.map((route, index) => {
        const Page = route.page;
        return (
          <Route
            key={index}
            path={route.path}
            element={<Page />}
          />
        );
      })}
        </Route>
      
    </Routes>
  )
}

export default Router