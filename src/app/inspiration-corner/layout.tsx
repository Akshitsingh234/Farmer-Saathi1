import { FC, ReactNode } from "react";

interface InspirationCornerLayoutProps {
  children: ReactNode;
}

const InspirationCornerLayout: FC<InspirationCornerLayoutProps> = ({ children }) => {
  return (
    <div className="h-full w-full">
      {children}
    </div>
  );
};

export default InspirationCornerLayout;
