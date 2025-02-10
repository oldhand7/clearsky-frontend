import { ReactNode } from 'react';

export type Route = {
  path: string;
  element: ReactNode;
};

export type RoutesConfig = {
  public: Route[];
  private: Route[];
};
