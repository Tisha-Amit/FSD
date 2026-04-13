import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

function Cart() {

  const { cart, removeFromCart } = useContext(CartContext);

  return (
    <div>

      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="product-grid">

          {cart.map(item => (

            <div className="product-card" key={item.id}>

              <img src={item.image} alt={item.title} />

              <h4>{item.title}</h4>

              <p className="price">${item.price}</p>

              <button
                className="btn"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>

            </div>

          ))}

        </div>
      )}

      <br/>

      <Link to="/checkout">
        <button className="btn">Go To Checkout</button>
      </Link>

    </div>
  );
}

export default Cart;