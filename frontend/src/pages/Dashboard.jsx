import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [productProfit, setProductProfit] = useState([]);
  const [revenueByDay, setRevenueByDay] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // =========================
    // DASHBOARD
    // =========================

    fetch("http://localhost:3000/api/reports/dashboard")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Dashboard API lỗi");
        }

        return response.json();
      })
      .then((data) => {
        setDashboard(data);
      })
      .catch((error) => {
        console.error("Lỗi dashboard:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    // =========================
    // REVENUE BY DAY
    // =========================

    fetch("http://localhost:3000/api/reports/revenue-by-day")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Revenue by day API lỗi");
        }

        return response.json();
      })
      .then((data) => {
        setRevenueByDay(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Lỗi revenue by day:", error);
        setRevenueByDay([]);
      });

    // =========================
    // TOP PRODUCTS
    // =========================

    fetch("http://localhost:3000/api/reports/top-products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Top products API lỗi");
        }

        return response.json();
      })
      .then((data) => {
        setTopProducts(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Lỗi top products:", error);
        setTopProducts([]);
      });

    // =========================
    // LOW STOCK
    // =========================

    fetch("http://localhost:3000/api/ingredients/low-stock")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Low stock API lỗi");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Low stock:", data);

        setLowStock(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Lỗi low stock:", error);
        setLowStock([]);
      });

    // =========================
    // PRODUCT PROFIT
    // =========================

    fetch("http://localhost:3000/api/reports/product-profit")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Product profit API lỗi");
        }

        return response.json();
      })
      .then((data) => {
        setProductProfit(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Lỗi product profit:", error);
        setProductProfit([]);
      });
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <h2>Đang tải dashboard...</h2>;
  }

  // =========================
  // DASHBOARD ERROR
  // =========================

  if (!dashboard) {
    return <h2>Không thể tải dữ liệu dashboard.</h2>;
  }

  return (
    <div className="dashboard">
      {/* =========================
          TITLE
      ========================= */}

      <h1>Coffee Shop Dashboard</h1>

      {/* =========================
          KPI
      ========================= */}

      <div className="kpi-container">
        <div className="kpi-card">
          <h3>Đơn hôm nay</h3>
          <p>{dashboard.today_orders}</p>
        </div>

        <div className="kpi-card">
          <h3>Doanh thu hôm nay</h3>

          <p>{Number(dashboard.today_revenue).toLocaleString("vi-VN")}đ</p>
        </div>

        <div className="kpi-card">
          <h3>Tổng doanh thu</h3>

          <p>{Number(dashboard.total_revenue).toLocaleString("vi-VN")}đ</p>
        </div>

        <div className="kpi-card">
          <h3>Gross Profit</h3>

          <p>{Number(dashboard.total_gross_profit).toLocaleString("vi-VN")}đ</p>
        </div>

        <div className="kpi-card">
          <h3>Nguyên liệu sắp hết</h3>

          <p>{dashboard.low_stock_count}</p>
        </div>
      </div>

      {/* =========================
          LOW STOCK
      ========================= */}

      <div className="section">
        <h2>⚠️ Nguyên liệu sắp hết</h2>

        {lowStock.length === 0 ? (
          <p className="stock-ok">✓ Tất cả nguyên liệu đang ở mức an toàn.</p>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Nguyên liệu</th>
                <th>Tồn kho</th>
                <th>Mức tối thiểu</th>
                <th>Đơn vị</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {lowStock.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td>{ingredient.name}</td>

                  <td>
                    {Number(ingredient.stock_quantity).toLocaleString("vi-VN")}
                  </td>

                  <td>
                    {Number(ingredient.minimum_stock).toLocaleString("vi-VN")}
                  </td>

                  <td>{ingredient.unit}</td>

                  <td>⚠️ Sắp hết</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================
          TOP PRODUCTS
      ========================= */}

      <div className="section">
        <h2>Sản phẩm bán chạy</h2>

        <table className="product-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng bán</th>
              <th>Doanh thu</th>
            </tr>
          </thead>

          <tbody>
            {topProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.product}</td>

                <td>{product.total_quantity}</td>

                <td>
                  {Number(product.total_revenue).toLocaleString("vi-VN")}đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================
          PRODUCT PROFIT
      ========================= */}

      <div className="section">
        <h2>Phân tích lợi nhuận sản phẩm</h2>

        <table className="product-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SL bán</th>
              <th>Doanh thu</th>
              <th>Giá vốn</th>
              <th>Gross Profit</th>
              <th>Margin</th>
            </tr>
          </thead>

          <tbody>
            {productProfit.map((product) => (
              <tr key={product.id}>
                <td>{product.product}</td>

                <td>{product.total_quantity}</td>

                <td>
                  {Number(product.total_revenue).toLocaleString("vi-VN")}đ
                </td>

                <td>
                  {Number(product.total_ingredient_cost).toLocaleString(
                    "vi-VN",
                  )}
                  đ
                </td>

                <td>{Number(product.gross_profit).toLocaleString("vi-VN")}đ</td>

                <td>
                  {product.total_revenue > 0
                    ? (
                        (product.gross_profit / product.total_revenue) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================
          REVENUE CHART
      ========================= */}

      <div className="section">
        <h2>Biểu đồ doanh thu</h2>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `${Number(value).toLocaleString("vi-VN")}đ`
                }
              />

              <Line
                type="monotone"
                dataKey="total_revenue"
                strokeWidth={3}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========================
          REVENUE BY DAY TABLE
      ========================= */}

      <div className="section">
        <h2>Doanh thu theo ngày</h2>

        <table className="product-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Số đơn</th>
              <th>Doanh thu</th>
            </tr>
          </thead>

          <tbody>
            {revenueByDay.map((item) => (
              <tr key={item.date}>
                <td>{item.date}</td>

                <td>{item.total_orders}</td>

                <td>{Number(item.total_revenue).toLocaleString("vi-VN")}đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
