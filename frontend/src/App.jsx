import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Recipe from "./pages/Recipe";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div>
      <nav className="navbar">
        <h2>Coffee Shop</h2>

        <div className="nav-buttons">
          <button onClick={() => setPage("dashboard")}>Dashboard</button>

          <button onClick={() => setPage("sales")}>Bán hàng</button>

          <button onClick={() => setPage("inventory")}>Nhập nguyên liệu</button>

          <button onClick={() => setPage("recipe")}>Công thức</button>
          <button onClick={() => setPage("products")}>Sản phẩm</button>
          <button onClick={() => setPage("orders")}>Lịch sử đơn</button>
        </div>
      </nav>

      <main className="page-content">
        {page === "dashboard" && <Dashboard />}

        {page === "sales" && <Sales />}

        {page === "inventory" && <Inventory />}

        {page === "recipe" && <Recipe />}
        {page === "products" && <Products />}
        {page === "orders" && <Orders />}
      </main>
    </div>
  );
}

export default App;
