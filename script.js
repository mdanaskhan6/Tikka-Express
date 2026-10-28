const dishes = [
  {id:1,name:"Paneer Tikka",category:"Starters",price:249,rating:"4.8",badge:"BESTSELLER",desc:"Smoky paneer cubes marinated with Indian spices.",image:"images/food/paneer-tikka.jpg"},
  {id:2,name:"Chicken Tikka",category:"Starters",price:299,rating:"4.9",badge:"CHEF'S PICK",desc:"Juicy chicken pieces grilled with a bold tikka marinade.",image:"images/food/chicken-tikka.jpg"},
  {id:3,name:"Veg Samosa",category:"Starters",price:99,rating:"4.7",badge:"CRISPY",desc:"Golden pastry pockets filled with spiced potato and peas.",image:"images/food/veg-samosa.jpg"},
  {id:4,name:"Butter Chicken",category:"Main Course",price:329,rating:"4.9",badge:"FAN FAVOURITE",desc:"Tender chicken in a creamy tomato-butter gravy.",image:"images/food/butter-chicken.jpg"},
  {id:5,name:"Shahi Paneer",category:"Main Course",price:279,rating:"4.8",badge:"VEG FAVOURITE",desc:"Soft paneer in a rich, silky and aromatic gravy.",image:"images/food/shahi-paneer.jpg"},
  {id:6,name:"Chicken Biryani",category:"Rice & Biryani",price:299,rating:"4.9",badge:"POPULAR",desc:"Fragrant basmati rice layered with spiced chicken.",image:"images/food/chicken-biryani.jpg"},
  {id:7,name:"Veg Biryani",category:"Rice & Biryani",price:229,rating:"4.6",badge:"VEG",desc:"Aromatic rice cooked with vegetables and warming spices.",image:"images/food/veg-biryani.jpg"},
  {id:8,name:"Garlic Naan",category:"Breads",price:59,rating:"4.8",badge:"FRESHLY BAKED",desc:"Soft tandoor-baked naan brushed with garlic butter.",image:"images/food/garlic-naan.jpg"},
  {id:9,name:"Gulab Jamun",category:"Desserts",price:99,rating:"4.7",badge:"SWEET TREAT",desc:"Soft milk dumplings soaked in fragrant sugar syrup.",image:"images/food/gulab-jamun.jpg"}
];

const menuEl = document.getElementById("menu");
const chipsEl = document.getElementById("chips");
const searchEl = document.getElementById("q");
const drawer = document.getElementById("drawer");
const scrim = document.getElementById("scrim");
const cartBody = document.getElementById("cartBody");
const countEl = document.getElementById("count");
const drawerCount = document.getElementById("drawerCount");
const toast = document.getElementById("toast");
let activeCategory = "All";
let cart = {};
let toastTimer;

const categories = ["All", ...new Set(dishes.map(d => d.category))];
const money = amount => new Intl.NumberFormat("en-IN", {style:"currency", currency:"INR", maximumFractionDigits:0}).format(amount);

function renderChips(){
  chipsEl.innerHTML = categories.map(category =>
    `<button class="chip ${category === activeCategory ? "active" : ""}" type="button" data-category="${category}">${category}</button>`
  ).join("");
}
function renderMenu(){
  const query = searchEl.value.trim().toLowerCase();
  const filtered = dishes.filter(d =>
    (activeCategory === "All" || d.category === activeCategory) &&
    (d.name.toLowerCase().includes(query) || d.desc.toLowerCase().includes(query) || d.category.toLowerCase().includes(query))
  );
  if(!filtered.length){
    menuEl.innerHTML = `<div class="empty-menu"><h3>No dishes found</h3><p>Try another search or choose a different category.</p></div>`;
    return;
  }
  menuEl.innerHTML = filtered.map(d => `
    <article class="food-card">
      <div class="food-image">
        <img src="${d.image}" alt="${d.name}" loading="lazy" onerror="this.onerror=null;this.src='images/${({
          1:"paneer-tikka.jpg",2:"chicken-tikka.jpg",3:"veg-samosa.jpg",4:"butter-chicken.jpg",5:"butter-chicken.jpg",6:"chicken-biryani.jpg",7:"veg-biryani.jpg",8:"garlic-naan.jpg",9:"gulab-jamun.jpg"
        })[d.id]}';this.classList.add('local-fallback')">
        <span class="badge">${d.badge}</span>
      </div>
      <div class="food-info">
        <div class="food-top"><h3>${d.name}</h3><span class="price">${money(d.price)}</span></div>
        <p>${d.desc}</p>
        <div class="food-bottom"><span class="rating">★ ${d.rating} <span style="color:#a89b8d">· ${d.category}</span></span>
          <button class="add-btn" type="button" data-add="${d.id}">＋ Add to cart</button>
        </div>
      </div>
    </article>`).join("");
}
function openCart(){
  drawer.classList.add("open"); scrim.classList.add("show");
  document.body.style.overflow = "hidden";
  renderCart();
  document.getElementById("closeCart").focus();
}
function closeCart(){
  drawer.classList.remove("open"); scrim.classList.remove("show");
  document.body.style.overflow = "";
  document.getElementById("openCart").focus();
}
function cartQuantity(){return Object.values(cart).reduce((sum,item)=>sum+item.qty,0)}
function cartTotal(){return Object.values(cart).reduce((sum,item)=>sum+item.qty*item.dish.price,0)}
function addToCart(id){
  const dish = dishes.find(d=>d.id===id);
  if(!cart[id]) cart[id]={dish,qty:0};
  cart[id].qty++;
  renderCart(); showToast(`${dish.name} added to your cart`);
}
function changeQty(id,delta){
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty<=0) delete cart[id];
  renderCart();
}
function removeItem(id){delete cart[id];renderCart();showToast("Item removed from cart")}
function renderCart(){
  const qty=cartQuantity();
  countEl.textContent=qty;
  drawerCount.textContent=`${qty} ${qty===1?"item":"items"}`;
  if(!qty){
    cartBody.innerHTML=`<div class="cart-empty"><div class="empty-icon">🛍️</div><h3>Your cart is hungry!</h3><p>Add something delicious from our menu and it will show up here.</p><button class="primary-btn" type="button" id="browseMenu">Browse menu →</button></div>`;
    document.getElementById("browseMenu").addEventListener("click",()=>{closeCart();document.getElementById("menu-section").scrollIntoView({behavior:"smooth"})});
    return;
  }
  const items=Object.values(cart).map(({dish,qty})=>`
    <div class="cart-item">
      <img src="${dish.image}" alt="" onerror="this.onerror=null;this.src='images/${({
          1:"paneer-tikka.jpg",2:"chicken-tikka.jpg",3:"veg-samosa.jpg",4:"butter-chicken.jpg",5:"butter-chicken.jpg",6:"chicken-biryani.jpg",7:"veg-biryani.jpg",8:"garlic-naan.jpg",9:"gulab-jamun.jpg"
        })[dish.id]}';this.classList.add('local-fallback')">
      <div><h4>${dish.name}</h4><span class="item-price">${money(dish.price*qty)}</span>
        <div class="qty"><button type="button" data-qty="${dish.id}" data-delta="-1" aria-label="Decrease ${dish.name} quantity">−</button><span>${qty}</span><button type="button" data-qty="${dish.id}" data-delta="1" aria-label="Increase ${dish.name} quantity">+</button></div>
      </div><button class="remove" type="button" data-remove="${dish.id}" aria-label="Remove ${dish.name}">×</button>
    </div>`).join("");
  const total=cartTotal();
  cartBody.innerHTML=`<div class="cart-items">${items}</div>
    <div class="cart-summary">
      <div class="summary-row"><span>Subtotal</span><strong>${money(total)}</strong></div>
      <div class="summary-row"><span>Delivery fee</span><strong>${total>=499?"FREE":money(35)}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${money(total+(total>=499?0:35))}</strong></div>
      <form class="checkout-form" id="checkoutForm">
        <label>Your name<input name="customer" required minlength="2" placeholder="Enter your name" autocomplete="name"></label>
        <label>Delivery address<textarea name="address" required minlength="8" placeholder="House no., street, area..." autocomplete="street-address"></textarea></label>
        <label>Phone number<input name="phone" required inputmode="tel" pattern="[0-9+() -]{8,16}" placeholder="Your contact number" autocomplete="tel"></label>
        <button class="checkout-btn" type="submit">Place demo order · ${money(total+(total>=499?0:35))}</button>
      </form>
      <p class="demo-note">Delivery is free on orders of ₹499 or more.</p>
    </div>`;
}
function showToast(message){
  toast.textContent=message;toast.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
}

chipsEl.addEventListener("click",event=>{
  const button=event.target.closest("[data-category]");
  if(!button)return;
  activeCategory=button.dataset.category;renderChips();renderMenu();
});
menuEl.addEventListener("click",event=>{
  const button=event.target.closest("[data-add]");
  if(button)addToCart(Number(button.dataset.add));
});
cartBody.addEventListener("click",event=>{
  const qty=event.target.closest("[data-qty]");
  const remove=event.target.closest("[data-remove]");
  if(qty)changeQty(Number(qty.dataset.qty),Number(qty.dataset.delta));
  if(remove)removeItem(Number(remove.dataset.remove));
});
cartBody.addEventListener("submit",event=>{
  if(event.target.id!=="checkoutForm")return;
  event.preventDefault();
  const form=new FormData(event.target);
  const orderId="TE"+Math.random().toString(36).slice(2,7).toUpperCase();
  const summary=Object.values(cart).map(i=>`${i.qty} × ${i.dish.name}`).join(", ");
  cartBody.innerHTML=`<div class="cart-empty"><div class="empty-icon">🎉</div><h3>Your order placed!</h3><p>Thanks, ${String(form.get("customer")).replace(/[<>]/g,"")}. Your Order reference code is <strong>${orderId}</strong>.</p><p><strong>Items:</strong> ${summary}</p><p>Your order is preparing.</p><button class="primary-btn" id="finishOrder" type="button">Back to menu →</button></div>`;
  cart={};countEl.textContent="0";drawerCount.textContent="0 items";
  document.getElementById("finishOrder").addEventListener("click",()=>{closeCart();renderCart();document.getElementById("menu-section").scrollIntoView({behavior:"smooth"})});
});
searchEl.addEventListener("input",renderMenu);
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
scrim.addEventListener("click",closeCart);
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&drawer.classList.contains("open"))closeCart()});
document.getElementById("year").textContent=new Date().getFullYear();
renderChips();renderMenu();renderCart();


// Scroll reveal for section headings and feature panel.
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach(element => element.classList.add("visible"));
}
