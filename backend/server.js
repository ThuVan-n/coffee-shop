const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }

  console.log("Connected to MySQL!");
});

app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(results[0]);
  });
});
// ===============================
// CREATE PRODUCT
// ===============================

app.post("/api/products", (req, res) => {
  const { name, price, description } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      message: "Tên sản phẩm không hợp lệ",
    });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({
      message: "Giá sản phẩm phải lớn hơn 0",
    });
  }

  const sql = `
    INSERT INTO products
    (name, price, stock, description)
    VALUES (?, ?, 0, ?)
  `;

  db.query(sql, [name.trim(), price, description || ""], (err, result) => {
    if (err) {
      console.error("Lỗi thêm sản phẩm:", err);

      return res.status(500).json({
        message: "Không thể thêm sản phẩm",
      });
    }

    res.status(201).json({
      message: "Thêm sản phẩm thành công",
      product_id: result.insertId,
    });
  });
});

// ===============================
// UPDATE PRODUCT
// ===============================

app.put("/api/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const { name, price, description } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "ID sản phẩm không hợp lệ",
    });
  }

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      message: "Tên sản phẩm không hợp lệ",
    });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({
      message: "Giá sản phẩm phải lớn hơn 0",
    });
  }

  const sql = `
    UPDATE products
    SET
      name = ?,
      price = ?,
      description = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name.trim(), price, description || "", productId],
    (err, result) => {
      if (err) {
        console.error("Lỗi sửa sản phẩm:", err);

        return res.status(500).json({
          message: "Không thể sửa sản phẩm",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy sản phẩm",
        });
      }

      res.json({
        message: "Cập nhật sản phẩm thành công",
      });
    },
  );
});

// ===============================
// DELETE PRODUCT
// ===============================

app.delete("/api/products/:id", (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "ID sản phẩm không hợp lệ",
    });
  }

  const sql = `
    DELETE FROM products
    WHERE id = ?
  `;

  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error("Lỗi xóa sản phẩm:", err);

      return res.status(500).json({
        message: "Không thể xóa sản phẩm. Sản phẩm có thể đang được sử dụng.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json({
      message: "Xóa sản phẩm thành công",
    });
  });
});
app.get("/api/orders", (req, res) => {
  const sql = `
    SELECT
      id,
      total_amount,
      status,
      created_at
    FROM orders
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("ORDER ERROR:", err);

      return res.status(500).json({
        message: "Lỗi khi lấy danh sách đơn hàng",
        error: err.message,
      });
    }

    res.json(results);
  });
});
app.get("/api/orders/:id/ingredients", (req, res) => {
  const orderId = req.params.id;

  getIngredientNeeds(orderId, (err, ingredients) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi khi tính nguyên liệu",
        error: err.message,
      });
    }

    res.json({
      order_id: orderId,
      ingredients: ingredients,
    });
  });
});
// =========================
// lấy danh sách đơn hàng
// =========================

app.get("/api/orders", (req, res) => {
  const sql = `
    SELECT
      id,
      total_amount,
      status,
      created_at
    FROM orders
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Lỗi lấy lịch sử đơn hàng",
        error: err.message,
      });
    }

    const data = results.map((row) => ({
      id: row.id,
      total_amount: Number(row.total_amount),
      status: row.status,
      created_at: row.created_at,
    }));

    res.json(data);
  });
});
// =========================
// GET ORDER DETAIL
// =========================

app.get("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;

  const sql = `
    SELECT
      o.id AS order_id,
      o.total_amount,
      o.status,
      o.created_at,

      oi.id AS order_item_id,
      oi.product_id,
      p.name AS product,
      oi.quantity,
      oi.unit_price,
      oi.subtotal,
      oi.unit_cost,
      oi.cost_subtotal,

      (oi.subtotal - oi.cost_subtotal) AS gross_profit

    FROM orders o

    JOIN order_items oi
      ON o.id = oi.order_id

    JOIN products p
      ON oi.product_id = p.id

    WHERE o.id = ?

    ORDER BY oi.id
  `;

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Lỗi lấy chi tiết đơn hàng",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    const order = {
      id: results[0].order_id,
      total_amount: Number(results[0].total_amount),
      status: results[0].status,
      created_at: results[0].created_at,

      items: results.map((row) => ({
        id: row.order_item_id,
        product_id: row.product_id,
        product: row.product,
        quantity: Number(row.quantity),
        unit_price: Number(row.unit_price),
        subtotal: Number(row.subtotal),
        unit_cost: Number(row.unit_cost),
        cost_subtotal: Number(row.cost_subtotal),
        gross_profit: Number(row.gross_profit),
      })),
    };

    res.json(order);
  });
});
// hàm tính nguyên liệu
function getIngredientNeeds(orderId, callback) {
  const sql = `
    SELECT
      i.id AS ingredient_id,
      i.name AS ingredient,
      i.unit,
      i.stock_quantity AS current_stock,
      SUM(ri.quantity * oi.quantity) AS quantity_needed
    FROM order_items oi
    JOIN recipes r
      ON oi.product_id = r.product_id
    JOIN recipe_items ri
      ON r.id = ri.recipe_id
    JOIN ingredients i
      ON ri.ingredient_id = i.id
    WHERE oi.order_id = ?
    GROUP BY
      i.id,
      i.name,
      i.unit,
      i.stock_quantity
    ORDER BY i.id
  `;

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    callback(null, results);
  });
}
//hàm kiểm tra kho nguyên liệu
function checkIngredientStock(ingredients) {
  for (const ingredient of ingredients) {
    const currentStock = Number(ingredient.current_stock);
    const quantityNeeded = Number(ingredient.quantity_needed);

    if (currentStock < quantityNeeded) {
      return {
        enough: false,
        ingredient: ingredient.ingredient,
        current_stock: currentStock,
        quantity_needed: quantityNeeded,
      };
    }
  }

  return {
    enough: true,
  };
}

// hàm test nguyên liệu
app.get("/api/orders/:id/check-stock", (req, res) => {
  const orderId = req.params.id;

  getIngredientNeeds(orderId, (err, ingredients) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi khi lấy nguyên liệu",
        error: err.message,
      });
    }

    const stockCheck = checkIngredientStock(ingredients);

    if (!stockCheck.enough) {
      return res.status(400).json({
        message: "Không đủ nguyên liệu",
        ingredient: stockCheck.ingredient,
        current_stock: stockCheck.current_stock,
        quantity_needed: stockCheck.quantity_needed,
      });
    }

    res.json({
      message: "Đủ nguyên liệu",
      stock_status: "ENOUGH",
    });
  });
});
// hàm api xem lịch sử kho
app.get("/api/stock-transactions", (req, res) => {
  const sql = `
    SELECT
      st.id,
      st.ingredient_id,
      i.name AS ingredient,
      i.unit,
      st.transaction_type,
      st.quantity,
      st.reference_id,
      st.note,
      st.created_at
    FROM stock_transactions st
    JOIN ingredients i
      ON st.ingredient_id = i.id
    ORDER BY st.created_at DESC, st.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi khi lấy lịch sử kho",
        error: err.message,
      });
    }

    res.json(results);
  });
});
app.get("/api/stock-transactions", (req, res) => {
  const sql = `
    SELECT
      st.id,
      st.ingredient_id,
      i.name AS ingredient,
      i.unit,
      st.transaction_type,
      st.quantity,
      st.reference_id,
      st.note,
      st.created_at
    FROM stock_transactions st
    JOIN ingredients i
      ON st.ingredient_id = i.id
    ORDER BY st.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Lỗi lấy lịch sử kho",
        error: err.message,
      });
    }

    const data = results.map((row) => ({
      id: row.id,
      ingredient_id: row.ingredient_id,
      ingredient: row.ingredient,
      unit: row.unit,
      transaction_type: row.transaction_type,
      quantity: Number(row.quantity),
      reference_id: row.reference_id,
      note: row.note,
      created_at: row.created_at,
    }));

    res.json(data);
  });
});
// cảnh báo khi nguyên liệu trong kho thấp
app.get("/api/ingredients/low-stock", (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      unit,
      stock_quantity,
      minimum_stock,
      (minimum_stock - stock_quantity) AS shortage
    FROM ingredients
    WHERE stock_quantity <= minimum_stock
    ORDER BY stock_quantity ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi khi kiểm tra nguyên liệu sắp hết",
        error: err.message,
      });
    }

    res.json({
      count: results.length,
      ingredients: results,
    });
  });
});

// tạo hàm trừ kho
function deductIngredients(ingredients, orderId, callback) {
  let index = 0;

  function deductNext() {
    // Đã xử lý hết nguyên liệu
    if (index >= ingredients.length) {
      return callback(null);
    }

    const ingredient = ingredients[index];

    const sql = `
      UPDATE ingredients
      SET stock_quantity = stock_quantity - ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [Number(ingredient.quantity_needed), ingredient.ingredient_id],
      (err) => {
        if (err) {
          return callback(err);
        }

        // Chuyển sang nguyên liệu tiếp theo
        index++;

        deductNext();
      },
    );
  }

  deductNext();
}

// hàm ghi lại lịch sử
function createStockTransactions(ingredients, orderId, callback) {
  const values = ingredients.map((ingredient) => [
    ingredient.ingredient_id,
    "SALE",
    -Number(ingredient.quantity_needed),
    orderId,
    `Used for Order #${orderId}`,
  ]);

  const sql = `
    INSERT INTO stock_transactions
    (
      ingredient_id,
      transaction_type,
      quantity,
      reference_id,
      note
    )
    VALUES ?
  `;

  db.query(sql, [values], (err) => {
    if (err) {
      return callback(err);
    }

    callback(null);
  });
}

app.post("/api/products", (req, res) => {
  const { name, price, stock, description } = req.body;

  const sql = `
        INSERT INTO products (name, price, stock, description)
        VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [name, price, stock, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: "Product added successfully",
      id: result.insertId,
    });
  });
});

function getProductCosts(productIds, callback) {
  const sql = `
    SELECT
      r.product_id,
      COALESCE(
        SUM(ri.quantity * i.cost_per_unit),
        0
      ) AS unit_cost
    FROM recipes r
    JOIN recipe_items ri
      ON r.id = ri.recipe_id
    JOIN ingredients i
      ON ri.ingredient_id = i.id
    WHERE r.product_id IN (?)
    GROUP BY r.product_id
  `;

  db.query(sql, [productIds], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    const costs = {};

    results.forEach((row) => {
      costs[row.product_id] = Number(row.unit_cost);
    });

    callback(null, costs);
  });
}
app.post("/api/orders", (req, res) => {
  const { items } = req.body;

  // =========================
  // 1. KIỂM TRA DỮ LIỆU
  // =========================

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Đơn hàng phải có ít nhất một sản phẩm",
    });
  }

  for (const item of items) {
    if (
      !Number.isInteger(Number(item.product_id)) ||
      Number(item.product_id) <= 0
    ) {
      return res.status(400).json({
        message: "product_id không hợp lệ",
      });
    }

    if (
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) <= 0
    ) {
      return res.status(400).json({
        message: "quantity phải là số nguyên dương",
      });
    }
  }

  const productIds = [...new Set(items.map((item) => Number(item.product_id)))];

  // =========================
  // 2. LẤY SẢN PHẨM
  // =========================

  const productSql = `
    SELECT
      id,
      name,
      price
    FROM products
    WHERE id IN (?)
  `;

  db.query(productSql, [productIds], (err, products) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Lỗi lấy sản phẩm",
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    if (products.length !== productIds.length) {
      const foundIds = products.map((product) => product.id);

      const missingIds = productIds.filter((id) => !foundIds.includes(id));

      return res.status(400).json({
        message: "Có sản phẩm không tồn tại",
        missing_product_ids: missingIds,
      });
    }

    // =========================
    // 3. LẤY GIÁ VỐN
    // =========================

    getProductCosts(productIds, (err, productCosts) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Lỗi tính giá vốn",
        });
      }

      // =========================
      // 4. KIỂM TRA CÓ CÔNG THỨC
      // =========================

      for (const productId of productIds) {
        if (productCosts[productId] === undefined) {
          const product = products.find((p) => p.id === productId);

          return res.status(400).json({
            message: `Sản phẩm "${product.name}" chưa có công thức`,
          });
        }
      }

      // =========================
      // 5. TẠO ORDER ITEMS
      // =========================

      const orderItems = [];

      let totalAmount = 0;

      for (const item of items) {
        const product = products.find((p) => p.id === Number(item.product_id));

        const quantity = Number(item.quantity);

        const unitPrice = Number(product.price);

        const unitCost = Number(productCosts[product.id]);

        const subtotal = unitPrice * quantity;

        const costSubtotal = unitCost * quantity;

        totalAmount += subtotal;

        orderItems.push({
          product_id: product.id,
          quantity: quantity,
          unit_price: unitPrice,
          subtotal: subtotal,
          unit_cost: unitCost,
          cost_subtotal: costSubtotal,
        });
      }

      // =========================
      // 6. BẮT ĐẦU TRANSACTION
      // =========================

      db.beginTransaction((err) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Không thể bắt đầu transaction",
          });
        }

        // =========================
        // 7. TẠO ORDER
        // =========================

        const insertOrderSql = `
              INSERT INTO orders
              (total_amount, status)
              VALUES (?, 'pending')
            `;

        db.query(insertOrderSql, [totalAmount], (err, orderResult) => {
          if (err) {
            return db.rollback(() => {
              console.error(err);

              res.status(500).json({
                message: "Không thể tạo đơn hàng",
              });
            });
          }

          const orderId = orderResult.insertId;

          // =========================
          // 8. TẠO ORDER ITEMS
          // =========================

          const values = orderItems.map((item) => [
            orderId,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.subtotal,
            item.unit_cost,
            item.cost_subtotal,
          ]);

          const insertItemsSql = `
                  INSERT INTO order_items
                  (
                    order_id,
                    product_id,
                    quantity,
                    unit_price,
                    subtotal,
                    unit_cost,
                    cost_subtotal
                  )
                  VALUES ?
                `;

          db.query(insertItemsSql, [values], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error(err);

                res.status(500).json({
                  message: "Không thể tạo chi tiết đơn hàng",
                });
              });
            }

            // =========================
            // 9. TÍNH NGUYÊN LIỆU
            // =========================

            getIngredientNeeds(orderId, (err, ingredients) => {
              if (err) {
                return db.rollback(() => {
                  console.error(err);

                  res.status(500).json({
                    message: "Không thể tính nguyên liệu",
                  });
                });
              }

              // =========================
              // 10. KIỂM TRA TỒN KHO
              // =========================

              const stockCheck = checkIngredientStock(ingredients);

              if (!stockCheck.enough) {
                return db.rollback(() => {
                  res.status(400).json({
                    message: `Không đủ nguyên liệu: ${stockCheck.ingredient}`,

                    current_stock: stockCheck.current_stock,

                    quantity_needed: stockCheck.quantity_needed,
                  });
                });
              }

              // =========================
              // 11. TRỪ NGUYÊN LIỆU
              // =========================

              deductIngredients(ingredients, orderId, (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error(err);

                    res.status(500).json({
                      message: "Không thể trừ nguyên liệu",
                    });
                  });
                }

                // =========================
                // 12. GHI LỊCH SỬ KHO
                // =========================

                createStockTransactions(ingredients, orderId, (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error(err);

                      res.status(500).json({
                        message: "Không thể tạo lịch sử kho",
                      });
                    });
                  }

                  // =========================
                  // 13. HOÀN THÀNH ORDER
                  // =========================

                  const updateOrderSql = `
                                  UPDATE orders
                                  SET status = 'completed'
                                  WHERE id = ?
                                `;

                  db.query(updateOrderSql, [orderId], (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error(err);

                        res.status(500).json({
                          message: "Không thể hoàn tất đơn hàng",
                        });
                      });
                    }

                    // =========================
                    // 14. COMMIT
                    // =========================

                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          console.error(err);

                          res.status(500).json({
                            message: "Không thể commit đơn hàng",
                          });
                        });
                      }

                      // =========================
                      // 15. TRẢ KẾT QUẢ
                      // =========================

                      res.status(201).json({
                        message: "Tạo đơn hàng thành công",

                        order_id: orderId,

                        total_amount: totalAmount,

                        status: "completed",
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// tạo api nhập nguyên liệu
app.post("/api/ingredients/purchase", (req, res) => {
  const { ingredient_id, quantity, note } = req.body;

  // 1. Validate
  if (!Number.isInteger(ingredient_id) || ingredient_id <= 0) {
    return res.status(400).json({
      message: "ingredient_id không hợp lệ",
    });
  }

  if (typeof quantity !== "number" || quantity <= 0) {
    return res.status(400).json({
      message: "quantity phải lớn hơn 0",
    });
  }

  // 2. Kiểm tra nguyên liệu tồn tại
  const findSql = `
    SELECT id, name, unit, stock_quantity
    FROM ingredients
    WHERE id = ?
  `;

  db.query(findSql, [ingredient_id], (err, ingredients) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi khi tìm nguyên liệu",
        error: err.message,
      });
    }

    if (ingredients.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy nguyên liệu",
      });
    }

    const ingredient = ingredients[0];

    // 3. Bắt đầu transaction
    db.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({
          message: "Không thể bắt đầu transaction",
          error: err.message,
        });
      }

      // 4. Tăng tồn kho
      const updateSql = `
          UPDATE ingredients
          SET stock_quantity = stock_quantity + ?
          WHERE id = ?
        `;

      db.query(updateSql, [quantity, ingredient_id], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({
              message: "Lỗi cập nhật kho",
              error: err.message,
            });
          });
        }

        // 5. Ghi lịch sử nhập kho
        const transactionSql = `
              INSERT INTO stock_transactions
              (
                ingredient_id,
                transaction_type,
                quantity,
                reference_id,
                note
              )
              VALUES (?, ?, ?, ?, ?)
            `;

        db.query(
          transactionSql,
          [
            ingredient_id,
            "PURCHASE",
            quantity,
            null,
            note || "Nhập nguyên liệu",
          ],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({
                  message: "Lỗi ghi lịch sử nhập kho",
                  error: err.message,
                });
              });
            }

            // 6. Commit
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({
                    message: "Lỗi commit transaction",
                    error: err.message,
                  });
                });
              }

              const newStock = Number(ingredient.stock_quantity) + quantity;

              res.json({
                message: "Nhập kho thành công",
                ingredient_id: ingredient_id,
                ingredient: ingredient.name,
                quantity_added: quantity,
                unit: ingredient.unit,
                stock_before: Number(ingredient.stock_quantity),
                stock_after: newStock,
              });
            });
          },
        );
      });
    });
  });
});
app.put("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const { name, price, stock, description } = req.body;

  const sql = `
    UPDATE products
    SET name = ?, price = ?, stock = ?, description = ?
    WHERE id = ?
  `;

  db.query(sql, [name, price, stock, description, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: "Product updated successfully",
    });
  });
});
app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
    });
  });
});
// báo cáo doanh thu ngày
app.get("/api/reports/today", (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total_amount), 0) AS total_revenue
    FROM orders
    WHERE status = 'completed'
      AND DATE(created_at) = CURDATE()
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi khi lấy báo cáo hôm nay",
        error: err.message,
      });
    }

    res.json({
      date: new Date().toISOString().slice(0, 10),
      total_orders: Number(results[0].total_orders),
      total_revenue: Number(results[0].total_revenue),
    });
  });
});
// doanh thu theo ngày
app.get("/api/reports/revenue-by-day", (req, res) => {
  const sql = `
    SELECT
      DATE_FORMAT(
        CONVERT_TZ(created_at, '+00:00', '+07:00'),
        '%Y-%m-%d'
      ) AS date,

      COUNT(*) AS total_orders,

      COALESCE(
        SUM(total_amount),
        0
      ) AS total_revenue

    FROM orders

    WHERE status = 'completed'

    GROUP BY
      DATE_FORMAT(
        CONVERT_TZ(created_at, '+00:00', '+07:00'),
        '%Y-%m-%d'
      )

    ORDER BY date ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Lỗi lấy doanh thu theo ngày",
      });
    }

    const data = results.map((row) => ({
      date: row.date,
      total_orders: Number(row.total_orders),
      total_revenue: Number(row.total_revenue),
    }));

    res.json(data);
  });
});
// api top sản phẩm bán chạy
app.get("/api/reports/top-products", (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.name AS product,
      SUM(oi.quantity) AS total_quantity,
      SUM(oi.subtotal) AS total_revenue
    FROM order_items oi
    JOIN orders o
      ON oi.order_id = o.id
    JOIN products p
      ON oi.product_id = p.id
    WHERE o.status = 'completed'
    GROUP BY
      p.id,
      p.name
    ORDER BY
      total_quantity DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi khi lấy sản phẩm bán chạy",
        error: err.message,
      });
    }

    const data = results.map((row) => ({
      id: row.id,
      product: row.product,
      total_quantity: Number(row.total_quantity),
      total_revenue: Number(row.total_revenue),
    }));

    res.json(data);
  });
});
// tính lợi nhuận
app.get("/api/reports/product-profit", (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.name AS product,

      SUM(oi.quantity) AS total_quantity,

      SUM(oi.subtotal) AS total_revenue,

      SUM(oi.cost_subtotal) AS total_ingredient_cost,

      SUM(
        oi.subtotal - oi.cost_subtotal
      ) AS gross_profit

    FROM order_items oi

    JOIN orders o
      ON oi.order_id = o.id

    JOIN products p
      ON oi.product_id = p.id

    WHERE o.status = 'completed'

    GROUP BY
      p.id,
      p.name

    ORDER BY gross_profit DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Lỗi lấy báo cáo lợi nhuận",
      });
    }

    const data = results.map((row) => ({
      id: row.id,
      product: row.product,
      total_quantity: Number(row.total_quantity),
      total_revenue: Number(row.total_revenue),
      total_ingredient_cost: Number(row.total_ingredient_cost),
      gross_profit: Number(row.gross_profit),
    }));

    res.json(data);
  });
});
// bản báo cáo
app.get("/api/reports/dashboard", (req, res) => {
  const sql = `

    SELECT

      (
        SELECT COUNT(*)
        FROM orders
        WHERE status = 'completed'
          AND DATE(created_at) = CURDATE()
      ) AS today_orders,

      (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM orders
        WHERE status = 'completed'
          AND DATE(created_at) = CURDATE()
      ) AS today_revenue,

      (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM orders
        WHERE status = 'completed'
      ) AS total_revenue,

      (
        SELECT COUNT(*)
        FROM ingredients
        WHERE stock_quantity <= minimum_stock
      ) AS low_stock_count,

      (
    SELECT COALESCE(
        SUM(
            oi.subtotal - oi.cost_subtotal
        ),
        0
    )
    FROM order_items oi
    JOIN orders o
        ON oi.order_id = o.id
    WHERE o.status = 'completed'
) AS total_gross_profit

  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi khi lấy dashboard",
        error: err.message,
      });
    }

    const row = results[0];

    res.json({
      today_orders: Number(row.today_orders),
      today_revenue: Number(row.today_revenue),
      total_revenue: Number(row.total_revenue),
      total_gross_profit: Number(row.total_gross_profit),
      low_stock_count: Number(row.low_stock_count),
    });
  });
});
// api lấy danh sách nguyên liệu
app.get("/api/ingredients", (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      unit,
      stock_quantity,
      cost_per_unit,
      minimum_stock
    FROM ingredients
    ORDER BY id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lỗi lấy nguyên liệu:", err);
      return res.status(500).json({
        message: "Lỗi server",
      });
    }

    res.json(results);
  });
});
// api lấy công thức
app.get("/api/recipes/:productId", (req, res) => {
  const productId = Number(req.params.productId);

  const sql = `
    SELECT
      r.id AS recipe_id,
      p.id AS product_id,
      p.name AS product,
      i.id AS ingredient_id,
      i.name AS ingredient,
      i.unit,
      ri.quantity,
      i.cost_per_unit,
      (ri.quantity * i.cost_per_unit) AS ingredient_cost
    FROM recipes r
    JOIN products p
      ON r.product_id = p.id
    JOIN recipe_items ri
      ON r.id = ri.recipe_id
    JOIN ingredients i
      ON ri.ingredient_id = i.id
    WHERE p.id = ?
    ORDER BY i.id
  `;

  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error("Lỗi lấy công thức:", err);

      return res.status(500).json({
        message: "Lỗi server",
      });
    }

    const totalCost = results.reduce(
      (sum, item) => sum + Number(item.ingredient_cost),
      0,
    );

    res.json({
      product_id: productId,
      product: results.length > 0 ? results[0].product : null,
      ingredients: results,
      total_cost: totalCost,
    });
  });
});

// ========================================
// CREATE / UPDATE RECIPE
// ========================================

app.put("/api/recipes/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  const { items } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "Product ID không hợp lệ",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Công thức phải có ít nhất một nguyên liệu",
    });
  }

  for (const item of items) {
    if (
      !Number.isInteger(Number(item.ingredient_id)) ||
      Number(item.ingredient_id) <= 0 ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0
    ) {
      return res.status(400).json({
        message: "Nguyên liệu hoặc số lượng không hợp lệ",
      });
    }
  }

  // Kiểm tra sản phẩm
  db.query(
    "SELECT id, name FROM products WHERE id = ?",
    [productId],
    (err, products) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Lỗi kiểm tra sản phẩm",
        });
      }

      if (products.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy sản phẩm",
        });
      }

      db.beginTransaction((err) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Không thể bắt đầu transaction",
          });
        }

        // Tìm recipe hiện tại
        db.query(
          "SELECT id FROM recipes WHERE product_id = ?",
          [productId],
          (err, recipes) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({
                  message: "Lỗi tìm công thức",
                });
              });
            }

            const createRecipeItems = (recipeId) => {
              const values = items.map((item) => [
                recipeId,
                Number(item.ingredient_id),
                item.quantity,
              ]);

              const insertSql = `
                INSERT INTO recipe_items
                (recipe_id, ingredient_id, quantity)
                VALUES ?
              `;

              db.query(insertSql, [values], (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error(err);

                    res.status(500).json({
                      message: "Không thể lưu nguyên liệu công thức",
                    });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({
                        message: "Không thể commit công thức",
                      });
                    });
                  }

                  res.json({
                    message: "Lưu công thức thành công",
                    product_id: productId,
                  });
                });
              });
            };

            // Chưa có recipe
            if (recipes.length === 0) {
              db.query(
                "INSERT INTO recipes (product_id) VALUES (?)",
                [productId],
                (err, result) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({
                        message: "Không thể tạo công thức",
                      });
                    });
                  }

                  createRecipeItems(result.insertId);
                },
              );

              return;
            }

            // Đã có recipe
            const recipeId = recipes[0].id;

            db.query(
              "DELETE FROM recipe_items WHERE recipe_id = ?",
              [recipeId],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({
                      message: "Không thể cập nhật công thức",
                    });
                  });
                }

                createRecipeItems(recipeId);
              },
            );
          },
        );
      });
    },
  );
});

// xóa toàn bộ công thức sản phẩm
app.delete("/api/recipes/:productId", (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "Product ID không hợp lệ",
    });
  }

  db.query(
    "DELETE FROM recipes WHERE product_id = ?",
    [productId],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Không thể xóa công thức",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Sản phẩm chưa có công thức",
        });
      }

      res.json({
        message: "Xóa công thức thành công",
      });
    },
  );
});
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
