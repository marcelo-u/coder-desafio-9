const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const PORT = 3333;
const app = express();

//funciona como indice
let counter = 0;
const productos = [];

//objeto con el mensaje de error para producto no encontrado
const NO_PRODUCT_FOUND = {
  error: "producto no encontrado",
};
//objecto con el mensaje de error para listado no encontrado
const NO_PRODUCTS_FOUND = {
  error: "no hay productos cargados",
};

//mw para validar que los 3 campos del producto no sean falsies
const productSchemaCheckerMiddleware = (req, res, next) => {
  const producto = req.body;
  //agrego una validación sencilla que me avise si alguno de los 3 campos no está definido
  if (!producto.title || !producto.price || !producto.thumbnail) {
    res.status(400).send(`Wrong format: ${JSON.stringify(req.body)}`);
  } else next();
};

//mw para validar que el producto buscado esté presente
const isProductPresentMiddleware = (req, res, next) => {
  const index = productos.findIndex((producto) => producto.id == req.params.id);
  if (index === -1) {
    res.status(404).send(NO_PRODUCT_FOUND);
  } else {
    req.index = index;
    next();
  }
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//metodod que devuelve el array de productos
router.get("/productos", (req, res) => {
  productos.length > 0
    ? res.send(productos)
    : res.status(404).send(NO_PRODUCTS_FOUND);
});
//metodo que devuelve el producto de un id dado
router.get("/productos/:id", isProductPresentMiddleware, (req, res) => {
  const producto = productos[req.index];
  res.send(producto);
});
//metodo que postea un nuevo producto
router.post("/productos", productSchemaCheckerMiddleware, (req, res) => {
  const producto = req.body;
  producto.price = Number(producto.price);
  producto.id = ++counter;
  productos.push(producto);
  res.send(producto);
});
//metodo para pisar un producto de un id dado
router.put(
  "/productos/:id",
  productSchemaCheckerMiddleware,
  isProductPresentMiddleware,
  (req, res) => {
    const producto = req.body;
    producto.id = Number(req.params.id);
    productos[req.index] = producto;
    res.send(producto);
  }
);
//metodo para borrar un producto de un id dado
router.delete("/productos/:id", isProductPresentMiddleware, (req, res) => {
  const producto = productos[req.index];
  productos.splice(req.index, 1);
  res.send(producto);
});
//agrego el alias public
app.use("/public", express.static("resources"));

app.use("/api", router);
app.listen(PORT, () => console.log("server's up"));
