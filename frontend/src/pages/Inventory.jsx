import { useEffect, useState } from "react";

function Inventory() {
  const [ingredients, setIngredients] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchIngredients = () => {
    fetch("http://localhost:3000/api/ingredients")
      .then((response) => response.json())
      .then((data) => {
        setIngredients(data);
      })
      .catch((error) => {
        console.error("Lỗi lấy nguyên liệu:", error);
      });
  };

  const fetchTransactions = () => {
    fetch("http://localhost:3000/api/stock-transactions")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions(data.transactions || []);
        }
      })
      .catch((error) => {
        console.error("Lỗi lấy lịch sử kho:", error);
      });
  };

  useEffect(() => {
    fetchIngredients();
    fetchTransactions();
  }, []);

  const handlePurchase = (event) => {
    event.preventDefault();

    if (!selectedIngredient) {
      setMessage("Vui lòng chọn nguyên liệu.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setMessage("Số lượng nhập phải lớn hơn 0.");
      return;
    }

    setLoading(true);
    setMessage("");

    const purchaseData = {
      ingredient_id: Number(selectedIngredient),
      quantity: Number(quantity),
      note: note || "Nhập nguyên liệu",
    };

    fetch("http://localhost:3000/api/ingredients/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(purchaseData),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Nhập kho thất bại");
        }

        return data;
      })
      .then((data) => {
        setMessage(
          `Nhập kho thành công: ${data.ingredient} +${data.quantity_added} ${data.unit}`,
        );

        setQuantity("");
        setNote("");

        fetchIngredients();
        fetchTransactions();
      })
      .catch((error) => {
        console.error("Lỗi nhập kho:", error);
        setMessage(`Nhập kho thất bại: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="inventory-page">
      <h1>Quản lý nguyên liệu</h1>

      {/* ========================= */}
      {/* NHẬP KHO */}
      {/* ========================= */}

      <div className="inventory-section">
        <h2>Nhập nguyên liệu</h2>

        <form className="purchase-form" onSubmit={handlePurchase}>
          <div className="form-group">
            <label>Nguyên liệu</label>

            <select
              value={selectedIngredient}
              onChange={(event) => setSelectedIngredient(event.target.value)}
            >
              <option value="">-- Chọn nguyên liệu --</option>

              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Số lượng</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ví dụ: 500"
            />
          </div>

          <div className="form-group">
            <label>Ghi chú</label>

            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: Nhập thêm cà phê"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Đang nhập..." : "Nhập kho"}
          </button>
        </form>

        {message && <p className="inventory-message">{message}</p>}
      </div>

      {/* ========================= */}
      {/* TỒN KHO */}
      {/* ========================= */}

      <div className="inventory-section">
        <h2>Tồn kho nguyên liệu</h2>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Nguyên liệu</th>
              <th>Đơn vị</th>
              <th>Tồn kho</th>
              <th>Giá / đơn vị</th>
              <th>Tồn tối thiểu</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {ingredients.map((ingredient) => {
              const stock = Number(ingredient.stock_quantity);

              const minimum = Number(ingredient.minimum_stock);

              const lowStock = stock <= minimum;

              return (
                <tr key={ingredient.id}>
                  <td>{ingredient.name}</td>

                  <td>{ingredient.unit}</td>

                  <td>{stock.toLocaleString("vi-VN")}</td>

                  <td>
                    {Number(ingredient.cost_per_unit).toLocaleString("vi-VN")}đ
                  </td>

                  <td>{minimum.toLocaleString("vi-VN")}</td>

                  <td>
                    {lowStock ? (
                      <span className="stock-low">Sắp hết</span>
                    ) : (
                      <span className="stock-ok">Đủ hàng</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================= */}
      {/* LỊCH SỬ KHO */}
      {/* ========================= */}

      <div className="inventory-section">
        <h2>Lịch sử nhập / xuất kho</h2>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Nguyên liệu</th>
              <th>Loại</th>
              <th>Số lượng</th>
              <th>Đơn hàng</th>
              <th>Ghi chú</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => {
              const quantityValue = Number(transaction.quantity);

              const isPurchase = transaction.transaction_type === "PURCHASE";

              return (
                <tr key={transaction.id}>
                  <td>
                    {new Date(transaction.created_at).toLocaleString("vi-VN")}
                  </td>

                  <td>{transaction.ingredient}</td>

                  <td>
                    {isPurchase ? (
                      <span className="transaction-purchase">NHẬP</span>
                    ) : (
                      <span className="transaction-sale">XUẤT</span>
                    )}
                  </td>

                  <td>
                    {quantityValue > 0 ? "+" : ""}
                    {quantityValue.toLocaleString("vi-VN")}
                  </td>

                  <td>
                    {transaction.reference_id
                      ? `#${transaction.reference_id}`
                      : "-"}
                  </td>

                  <td>{transaction.note || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;
