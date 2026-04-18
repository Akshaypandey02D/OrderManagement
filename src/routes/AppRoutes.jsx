import { useRoutes } from 'react-router-dom';
import { Suspense } from 'react';
import { routesConfig } from './routesConfig';

export default function AppRoutes() {
  const element = useRoutes(routesConfig);
  
  return (
    <Suspense fallback={null}>
      {element}
    </Suspense>
  );
}

