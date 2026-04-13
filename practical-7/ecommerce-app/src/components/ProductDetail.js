import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/api";
import { CartContext } from "../context/CartContext";

function ProductDetail() {

  const { id } = useParams();
  const [product, setProduct] = useState({});
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    getProduct(id).then(res => setProduct(res.data));
  }, [id]);

  return (
    <div className="product-card">

      <img src={product.image} alt={product.title} />

      <h2>{product.title}</h2>

      <p>{product.description}</p>

      <h3 className="price">${product.price}</h3>

      <button className="btn" onClick={() => addToCart(product)}>
        Add To Cart
      </button>

    </div>
  );
}

export default ProductDetail;