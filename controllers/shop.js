const { Op } = require('sequelize');
const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(err => console.error(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts();
    })
    .then(products =>
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your cart',
        products: products,
      })
    )
    .catch(err => console.error(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  // set default quantity we will use to insert/update in db (cart_items table)
  let calculatedQuantity = 1;
  req.user
    // this code somehow really sucks, so I will explain things going on here
    // get user cart
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      // get products from cart (cart_items table) by product id in request
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      // if query results is not an empty array - product object is the first item of this array
      if (products.length) {
        product = products[0];
      }
      // if product already exists in cart - we set the quantity value as an incremented old one
      if (product) {
        calculatedQuantity += product.cart_item.quantity;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then(product => {
      // insert cart_item of the product with calculated quantity
      return fetchedCart.addProduct(product, {
        through: { quantity: calculatedQuantity },
      });
    })
    .then(() => res.redirect('/cart'))
    .catch(err => console.error(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      return product.cart_item.destroy();
    })
    .then(() => res.redirect('/cart'))
    .catch(err => console.error(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ['products'] })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(err => console.error(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          order.addProducts(
            products.map(product => {
              product.order_item = { quantity: product.cart_item.quantity };
              return product;
            })
          );
        })
        .catch(err => console.err(err));
    })
    .then(() => fetchedCart.setProducts(null))
    .then(() => res.redirect('/orders'))
    .catch(err => console.error(err));
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};
