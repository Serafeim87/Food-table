
var cart = {
  
  hPdt : null,    
  hItems : null,   
  items : {},      
  iURL : "assets/", 
  currency : "$",   
  total : 0,        

  save : () => localStorage.setItem("cart", JSON.stringify(cart.items)),
  load : () => {
    cart.items = localStorage.getItem("cart");
    if (cart.items == null) { cart.items = {}; }
    else { cart.items = JSON.parse(cart.items); }
  },

  nuke : () => { if (confirm("Empty cart?")) {
    cart.items = {};
    localStorage.removeItem("cart");
    cart.list();
  }},

  init : () => {
  
    cart.hPdt = document.getElementById("cart-products");
    cart.hItems = document.getElementById("cart-items");

    cart.hPdt.innerHTML = "";
    let template = document.getElementById("template-product").content, p, item;
    for (let id in products) {
      p = products[id];
      item = template.cloneNode(true);
      item.querySelector(".p-img").src = cart.iURL + p.img;
      item.querySelector(".p-name").textContent = p.name;
      item.querySelector(".p-category").textContent = p.category;
      item.querySelector(".p-price").textContent = cart.currency + p.price.toFixed(2);
      item.querySelector(".p-add").onclick = () => cart.add(id);
      cart.hPdt.appendChild(item);
    }

    cart.load();

    cart.list();
  },

  
  list : () => {
   
    cart.hItems.innerHTML = "";
    let item,currency, part, pdt, empty = true;
    for (let key in cart.items) {
      if (cart.items.hasOwnProperty(key)) { empty = false; break; }
    }

    
    if (empty) {
      item = document.createElement("div");
      item.innerHTML = "Cart is empty";
      cart.hItems.appendChild(item);
    }

    else {
      let template = document.getElementById("template-cart").content,
          p, total = 0, subtotal = 0;
      for (let id in cart.items) {
     
        p = products[id];
        item = template.cloneNode(true);
        item.querySelector(".c-del").onclick = () => cart.remove(id);
        item.querySelector(".c-name").textContent = p.name;
        item.querySelector(".c-price").textContent ="$" +p.price;
        item.querySelector(".c-qty").value = cart.items[id];
        item.querySelector(".c-qty").onchange = function () { cart.change(id, this.value); };
        cart.hItems.appendChild(item);

        subtotal = cart.items[id] * p.price;
        total += subtotal;
      }

      item = document.createElement("div");
      item.className = "c-total";
      item.id = "c-total";
      item.innerHTML ="TOTAL: $" + total.toFixed(2);
      cart.hItems.appendChild(item);

      item = document.getElementById("template-cart-checkout").content.cloneNode(true);
      cart.hItems.appendChild(item);
    }
  },

  add : id => {
    if (cart.items[id] == undefined) { cart.items[id] = 1; }
    else { cart.items[id]++; }
    cart.save(); cart.list();
  },

  change : (pid, qty) => {

    if (qty <= 0) {
      delete cart.items[pid];
      cart.save(); cart.list();
    }

    else {
      cart.items[pid] = qty;
      var total = 0;
      for (let id in cart.items) {
        total += cart.items[id] * products[id].price;
        document.getElementById("c-total").innerHTML ="TOTAL: $" + total;
      }
    }
  },

  remove : id => {
    delete cart.items[id];
    cart.save();
    cart.list();
  },

  checkout : () => {
 
    const peer = new Peer(null, {
      host: "localhost",
      port: 9000,
      path: "/"
    });

    peer.on("open", id => {
      var conn = peer.connect("MANAGER");
      conn.on("open", () => conn.send(JSON.stringify(cart.items)));
      conn.on("close", () => {
        cart.items = {};
        localStorage.removeItem("cart");
        cart.list();
        alert("Order sent!");
      });
    });
  }
};
window.addEventListener("DOMContentLoaded", cart.init);