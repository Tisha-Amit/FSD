let cartCount = 0;
let totalPrice = 0;

function addToCart(price) {
    cartCount++;
    totalPrice += price;
    updateCart();
}

function removeFromCart(price) {
    if (cartCount > 0 && totalPrice >= price) {
        cartCount--;
        totalPrice -= price;
        updateCart();
    }
}

function updateCart() {
    document.getElementById("cartCount").innerText = cartCount;
    document.getElementById("totalPrice").innerText = totalPrice;
}
