import React from "react";
import RefreshLayout from "@/components/refresh-layout";

const Layout = ({ children }) => {
  return (
    <RefreshLayout>
      <div className="container mx-auto mt-5 px-4">{children}</div>
    </RefreshLayout>
  );
};

export default Layout;
