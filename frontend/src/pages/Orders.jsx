import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/orders")
      .then((response) => response.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi lấy đơn hàng:", error);
        setLoading(false);
      });
  }, []);

  // =========================
  // XEM CHI TIẾT ĐƠN
  // =========================

  const handleViewOrder = (orderId) => {
    fetch(`http://localhost:3000/api/orders/${orderId}`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedOrder(data);
      })
      .catch((error) => {
        console.error("Lỗi lấy chi tiết đơn:", error);
      });
  };

  if (loading) {
    return <h2>Đang tải lịch sử đơn hàng...</h2>;
  }

  return (
    <div className="dashboard">
      <h1>Lịch sử đơn hàng</h1>

      {/* =========================
          ORDER LIST
      ========================= */}

      <div className="section">
        <h2>Danh sách đơn hàng</h2>

        <table className="product-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Thời gian</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>

                <td>{new Date(order.created_at).toLocaleString("vi-VN")}</td>

                <td>{Number(order.total_amount).toLocaleString("vi-VN")}đ</td>

                <td>
                  {order.status === "completed" ? "✓ Hoàn thành" : order.status}
                </td>

                <td>
                  <button onClick={() => handleViewOrder(order.id)}>Xem</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================
          ORDER DETAIL
      ========================= */}

      {selectedOrder && (
        <div className="section">
          <h2>Chi tiết đơn #{selectedOrder.id}</h2>

          <p>
            Thời gian:{" "}
            {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
          </p>

          <p>Trạng thái: {selectedOrder.status}</p>

          <table className="product-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>SL</th>
                <th>Giá bán</th>
                <th>Doanh thu</th>
                <th>Giá vốn</th>
                <th>Gross Profit</th>
              </tr>
            </thead>

            <tbody>
              {selectedOrder.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product}</td>

                  <td>{item.quantity}</td>

                  <td>{item.unit_price.toLocaleString("vi-VN")}đ</td>

                  <td>{item.subtotal.toLocaleString("vi-VN")}đ</td>

                  <td>{item.cost_subtotal.toLocaleString("vi-VN")}đ</td>

                  <td>{item.gross_profit.toLocaleString("vi-VN")}đ</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>
            Tổng đơn: {selectedOrder.total_amount.toLocaleString("vi-VN")}đ
          </h3>

          <button onClick={() => setSelectedOrder(null)}>Đóng chi tiết</button>
        </div>
      )}
    </div>
  );
}

export default Orders;
