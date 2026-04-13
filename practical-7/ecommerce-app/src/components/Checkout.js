import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { processPayment } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const { user } = useAuth();

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const [form, setForm] = useState({
    cardHolder: user?.name || "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, message, transactionId }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setResult(null);
  };

  // Client-side validation
  const validate = () => {
    const newErrors = {};
    if (!form.cardHolder.trim()) newErrors.cardHolder = "Card holder name is required";
    if (!form.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
    else if (!/^\d{16}$/.test(form.cardNumber)) newErrors.cardNumber = "Card number must be exactly 16 digits";
    if (!form.expiryMonth) newErrors.expiryMonth = "Expiry month is required";
    if (!form.expiryYear) newErrors.expiryYear = "Expiry year is required";
    if (!form.cvv) newErrors.cvv = "CVV is required";
    else if (!/^\d{3,4}$/.test(form.cvv)) newErrors.cvv = "CVV must be 3-4 digits";
    if (cart.length === 0) newErrors.cart = "Your cart is empty";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await processPayment({
        amount: total.toFixed(2),
        cardNumber: form.cardNumber,
        cvv: form.cvv,
        cardHolder: form.cardHolder,
        expiryMonth: parseInt(form.expiryMonth),
        expiryYear: parseInt(form.expiryYear),
      });
      setResult({ success: true, ...res.data });
      setCart([]); // Clear cart on success
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fieldErrors = {};
        data.errors.forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setErrors(fieldErrors);
      } else {
        setResult({ success: false, message: data?.message || "Payment failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="checkout-wrapper">
      <h2>Checkout</h2>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        {cart.length === 0 && !result?.success ? (
          <p className="empty-text">Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div className="order-item" key={item.id}>
                <span>{item.title.substring(0, 32)}...</span>
                <span className="price">${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>Total:</strong>
              <strong className="price">${total.toFixed(2)}</strong>
            </div>
          </>
        )}
        {errors.cart && <span className="field-error">{errors.cart}</span>}
      </div>

      {/* Payment Result */}
      {result && (
        <div className={`alert ${result.success ? "alert-success" : "alert-error"}`}>
          <div className="result-icon">{result.success ? "✅" : "❌"}</div>
          <div>
            <strong>{result.message}</strong>
            {result.transactionId && (
              <p className="transaction-id">Transaction ID: {result.transactionId}</p>
            )}
          </div>
        </div>
      )}

      {/* Payment Form */}
      {!result?.success && (
        <div className="payment-section">
          <h3>💳 Payment Details</h3>
          <p className="payment-hint">
            <em>Test tip: Use card ending in <strong>0000</strong> to simulate a failed payment.</em>
          </p>

          <form onSubmit={handleSubmit} className="payment-form" noValidate>
            <div className={`form-group ${errors.cardHolder ? "has-error" : ""}`}>
              <label htmlFor="cardHolder">Card Holder Name</label>
              <input
                id="cardHolder"
                type="text"
                name="cardHolder"
                placeholder="Name on card"
                value={form.cardHolder}
                onChange={handleChange}
              />
              {errors.cardHolder && <span className="field-error">{errors.cardHolder}</span>}
            </div>

            <div className={`form-group ${errors.cardNumber ? "has-error" : ""}`}>
              <label htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                type="text"
                name="cardNumber"
                placeholder="16-digit card number"
                maxLength={16}
                value={form.cardNumber}
                onChange={handleChange}
              />
              {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.expiryMonth ? "has-error" : ""}`}>
                <label htmlFor="expiryMonth">Expiry Month</label>
                <select id="expiryMonth" name="expiryMonth" value={form.expiryMonth} onChange={handleChange}>
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
                {errors.expiryMonth && <span className="field-error">{errors.expiryMonth}</span>}
              </div>

              <div className={`form-group ${errors.expiryYear ? "has-error" : ""}`}>
                <label htmlFor="expiryYear">Expiry Year</label>
                <select id="expiryYear" name="expiryYear" value={form.expiryYear} onChange={handleChange}>
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => currentYear + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {errors.expiryYear && <span className="field-error">{errors.expiryYear}</span>}
              </div>

              <div className={`form-group ${errors.cvv ? "has-error" : ""}`}>
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  type="password"
                  name="cvv"
                  placeholder="•••"
                  maxLength={4}
                  value={form.cvv}
                  onChange={handleChange}
                />
                {errors.cvv && <span className="field-error">{errors.cvv}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full pay-btn"
              disabled={loading || cart.length === 0}
            >
              {loading ? <span className="spinner" /> : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Checkout;