import React, { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import { Link } from "react-router-dom";

function ProductList() {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(res => setProducts(res.data));
  }, []);

  return (
    <div>

      <h2>Products</h2>

      <div className="product-grid">

        {products.map(product => (

          <div className="product-card" key={product.id}>

            <img src={product.image} alt={product.title} />

            <h4>{product.title}</h4>

            <p className="price">${product.price}</p>

            <Link to={`/product/${product.id}`}>
              <button className="btn">View Details</button>
            </Link>

          </div>

        ))}

      </div>

    </div>
  );
}

export default ProductList;