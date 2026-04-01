function InventoryPage({
  totalSkus,
  totalUnits,
  lowStockCount,
  handleAddItem,
  skuInputRef,
  sku,
  setSku,
  name,
  setName,
  size,
  setSize,
  qty,
  setQty,
  search,
  setSearch,
  filteredInventory,
  handleChangeQty,
  handleDeleteItem,
}) {



  return (
  <>
    <div className="sectionCard">
      <h3 className="sectionTitle">Inventory</h3>

      <div className="stats">
        <div className="card">
          <div className="label">Total SKUs</div>
          <div className="value">{totalSkus}</div>
        </div>

        <div className="card">
          <div className="label">Total Units</div>
          <div className="value">{totalUnits}</div>
        </div>

        <div className="card">
          <div className="label">Low Stock</div>
          <div className="value">{lowStockCount}</div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAddItem()
        }}
      >
        <input
          ref={skuInputRef}
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />

        <input
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
        />

        <input
          type="number"
          placeholder="Qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <button type="submit" className="primaryButton">
          Add Item
        </button>
      </form>

      <input
        placeholder="Search inventory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInventory.map((item, index) => (
              <tr key={index} className={item.qty <= 5 ? "low-stock" : ""}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.size}</td>
                <td>{item.qty}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleChangeQty(index, -1)}
                  >
                    -
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeQty(index, 1)}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
)
}

export default InventoryPage