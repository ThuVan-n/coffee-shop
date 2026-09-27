import { useEffect, useState } from "react";

function Recipe() {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [recipeItems, setRecipeItems] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ========================================
  // LOAD PRODUCTS + INGREDIENTS
  // ========================================

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      });

    fetch("http://localhost:3000/api/ingredients")
      .then((response) => response.json())
      .then((data) => {
        setIngredients(data);
      });
  }, []);

  // ========================================
  // LOAD RECIPE
  // ========================================

  const loadRecipe = (productId) => {
    if (!productId) {
      setRecipeItems([]);
      return;
    }

    fetch(`http://localhost:3000/api/recipes/${productId}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.ingredients)) {
          setRecipeItems(
            data.ingredients.map((item) => ({
              ingredient_id: Number(item.ingredient_id),
              quantity: Number(item.quantity),
            })),
          );
        } else {
          setRecipeItems([]);
        }
      })
      .catch((error) => {
        console.error("Lỗi lấy công thức:", error);

        setRecipeItems([]);
      });
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;

    setSelectedProduct(productId);
    setMessage("");

    loadRecipe(productId);
  };

  // ========================================
  // ADD INGREDIENT
  // ========================================

  const addIngredient = () => {
    setRecipeItems([
      ...recipeItems,
      {
        ingredient_id: "",
        quantity: 0,
      },
    ]);
  };

  // ========================================
  // CHANGE INGREDIENT
  // ========================================

  const updateIngredient = (index, field, value) => {
    const newItems = [...recipeItems];

    newItems[index] = {
      ...newItems[index],
      [field]: field === "quantity" ? Number(value) : Number(value),
    };

    setRecipeItems(newItems);
  };

  // ========================================
  // REMOVE INGREDIENT
  // ========================================

  const removeIngredient = (index) => {
    setRecipeItems(recipeItems.filter((_, itemIndex) => itemIndex !== index));
  };

  // ========================================
  // SAVE RECIPE
  // ========================================

  const saveRecipe = () => {
    if (!selectedProduct) {
      setMessage("Vui lòng chọn sản phẩm.");
      return;
    }

    if (recipeItems.length === 0) {
      setMessage("Công thức phải có ít nhất một nguyên liệu.");
      return;
    }

    for (const item of recipeItems) {
      if (!item.ingredient_id || item.quantity <= 0) {
        setMessage("Vui lòng chọn nguyên liệu và số lượng hợp lệ.");
        return;
      }
    }

    setLoading(true);
    setMessage("");

    fetch(`http://localhost:3000/api/recipes/${selectedProduct}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: recipeItems,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể lưu công thức");
        }

        return data;
      })
      .then((data) => {
        setMessage(data.message);

        loadRecipe(selectedProduct);
      })
      .catch((error) => {
        console.error("Lỗi lưu công thức:", error);

        setMessage(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ========================================
  // DELETE RECIPE
  // ========================================

  const deleteRecipe = () => {
    if (!selectedProduct) {
      return;
    }

    const product = products.find(
      (item) => item.id === Number(selectedProduct),
    );

    const confirmed = window.confirm(`Xóa công thức của ${product?.name}?`);

    if (!confirmed) {
      return;
    }

    fetch(`http://localhost:3000/api/recipes/${selectedProduct}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể xóa");
        }

        return data;
      })
      .then((data) => {
        setRecipeItems([]);
        setMessage(data.message);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  };

  // ========================================
  // CALCULATE COST
  // ========================================

  const totalCost = recipeItems.reduce((sum, item) => {
    const ingredient = ingredients.find(
      (ingredient) => ingredient.id === Number(item.ingredient_id),
    );

    if (!ingredient) {
      return sum;
    }

    return sum + Number(item.quantity) * Number(ingredient.cost_per_unit);
  }, 0);

  const selectedProductData = products.find(
    (product) => product.id === Number(selectedProduct),
  );

  const sellingPrice = Number(selectedProductData?.price || 0);

  const grossProfit = sellingPrice - totalCost;

  return (
    <div className="recipe-page">
      <h1>Quản lý công thức</h1>

      {/* PRODUCT */}

      <div className="recipe-section">
        <label>Chọn sản phẩm</label>

        <select value={selectedProduct} onChange={handleProductChange}>
          <option value="">-- Chọn sản phẩm --</option>

          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <div className="recipe-section">
          <h2>{selectedProductData?.name}</h2>

          {/* INGREDIENTS */}

          {recipeItems.map((item, index) => (
            <div className="recipe-edit-row" key={index}>
              <select
                value={item.ingredient_id}
                onChange={(event) =>
                  updateIngredient(index, "ingredient_id", event.target.value)
                }
              >
                <option value="">-- Nguyên liệu --</option>

                {ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} ({ingredient.unit})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(event) =>
                  updateIngredient(index, "quantity", event.target.value)
                }
              />

              <button type="button" onClick={() => removeIngredient(index)}>
                Xóa
              </button>
            </div>
          ))}

          <div className="recipe-buttons">
            <button type="button" onClick={addIngredient}>
              + Thêm nguyên liệu
            </button>

            <button type="button" onClick={saveRecipe} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu công thức"}
            </button>

            <button type="button" onClick={deleteRecipe}>
              Xóa công thức
            </button>
          </div>

          {message && <p className="product-message">{message}</p>}

          {/* COST */}

          <div className="recipe-summary">
            <div>
              <span>Giá bán</span>

              <strong>{sellingPrice.toLocaleString("vi-VN")}đ</strong>
            </div>

            <div>
              <span>Giá vốn</span>

              <strong>{totalCost.toLocaleString("vi-VN")}đ</strong>
            </div>

            <div>
              <span>Gross Profit</span>

              <strong>{grossProfit.toLocaleString("vi-VN")}đ</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipe;
