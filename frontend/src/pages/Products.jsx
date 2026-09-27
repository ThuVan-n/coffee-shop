import { useEffect, useState } from "react";

function Products() {
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = () => {
    fetch("http://localhost:3000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Lỗi lấy sản phẩm:", error);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setMessage("Giá sản phẩm phải lớn hơn 0.");
      return;
    }

    setLoading(true);
    setMessage("");

    const productData = {
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
    };

    const url = editingId
      ? `http://localhost:3000/api/products/${editingId}`
      : "http://localhost:3000/api/products";

    const method = editingId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Có lỗi xảy ra");
        }

        return data;
      })
      .then((data) => {
        setMessage(data.message);

        resetForm();
        fetchProducts();
      })
      .catch((error) => {
        console.error("Lỗi sản phẩm:", error);

        setMessage(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description || "");

    setMessage("");
  };

  const handleDelete = (id, productName) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa "${productName}" không?`,
    );

    if (!confirmed) {
      return;
    }

    fetch(`http://localhost:3000/api/products/${id}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể xóa sản phẩm");
        }

        return data;
      })
      .then((data) => {
        setMessage(data.message);

        fetchProducts();
      })
      .catch((error) => {
        console.error("Lỗi xóa:", error);

        setMessage(error.message);
      });
  };

  return (
    <div className="products-page">
      <h1>Quản lý sản phẩm</h1>

      {/* FORM */}

      <div className="product-form-section">
        <h2>{editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h2>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên sản phẩm</label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ví dụ: Latte"
            />
          </div>

          <div className="form-group">
            <label>Giá bán</label>

            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Ví dụ: 30000"
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>

            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả sản phẩm"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading
                ? "Đang lưu..."
                : editingId
                  ? "Cập nhật"
                  : "Thêm sản phẩm"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Hủy
              </button>
            )}
          </div>
        </form>

        {message && <p className="product-message">{message}</p>}
      </div>

      {/* PRODUCT LIST */}

      <div className="product-list-section">
        <h2>Danh sách sản phẩm</h2>

        <table className="product-management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Giá bán</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>

                <td>{product.name}</td>

                <td>{Number(product.price).toLocaleString("vi-VN")}đ</td>

                <td>{product.description || "-"}</td>

                <td className="product-actions">
                  <button onClick={() => handleEdit(product)}>Sửa</button>

                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
