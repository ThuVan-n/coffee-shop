import { useEffect, useState } from "react";

function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Lấy sản phẩm từ Backend
  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Lỗi lấy sản phẩm:", error);
      });
  }, []);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
        },
      ]);
    }
  };

  // Tăng số lượng
  const increaseQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  // Giảm số lượng
  const decreaseQuantity = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // Xóa sản phẩm
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // =========================
  // THANH TOÁN
  // =========================

  const checkout = () => {
    if (cart.length === 0) {
      setMessage("Giỏ hàng đang trống.");
      return;
    }

    setCheckoutLoading(true);
    setMessage("");

    const orderData = {
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Thanh toán thất bại");
        }

        return data;
      })
      .then((data) => {
        console.log("Order:", data);

        setMessage(
          `Thanh toán thành công! Đơn #${data.order_id} - ${Number(
            data.total_amount,
          ).toLocaleString("vi-VN")}đ`,
        );

        // Xóa giỏ hàng sau khi thanh toán thành công
        setCart([]);
      })
      .catch((error) => {
        console.error("Lỗi thanh toán:", error);
        setMessage(`Thanh toán thất bại: ${error.message}`);
      })
      .finally(() => {
        setCheckoutLoading(false);
      });
  };

  return (
    <div className="sales-page">
      {/* =========================
          DANH SÁCH SẢN PHẨM
      ========================= */}

      <div className="products-area">
        <h1>Bán hàng</h1>

        <div className="product-grid">
          {products.map((product) => (
            <div
              className="product-card"
              key={product.id}
              onClick={() => addToCart(product)}
            >
              <h3>{product.name}</h3>

              <p className="product-price">
                {Number(product.price).toLocaleString("vi-VN")}đ
              </p>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  addToCart(product);
                }}
              >
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* =========================
          GIỎ HÀNG
      ========================= */}

      <div className="cart-area">
        <h2>Giỏ hàng</h2>

        {cart.length === 0 ? (
          <p>Chưa có sản phẩm</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>

                  <p>
                    {item.price.toLocaleString("vi-VN")}đ × {item.quantity}
                  </p>
                </div>

                <div className="quantity-controls">
                  <button onClick={() => decreaseQuantity(item.id)}>−</button>

                  <span>{item.quantity}</span>

                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </div>

                <div>
                  <strong>
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </strong>
                </div>

                <button
                  className="remove-button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TỔNG TIỀN */}

        <div className="cart-total">
          <span>Tổng tiền</span>

          <strong>{total.toLocaleString("vi-VN")}đ</strong>
        </div>

        {/* THÔNG BÁO */}

        {message && <p className="checkout-message">{message}</p>}

        {/* THANH TOÁN */}

        <button
          className="checkout-button"
          disabled={cart.length === 0 || checkoutLoading}
          onClick={checkout}
        >
          {checkoutLoading ? "Đang thanh toán..." : "Thanh toán"}
        </button>
      </div>
    </div>
  );
}

export default Sales;
