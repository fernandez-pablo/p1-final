// --- defino la Clase Producto
class Producto {
  // agrego el njevo atributo 'stock' al constructor
  constructor(id, nombre, precio, imagen, descripcion, categoria, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.imagen = imagen;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.stock = stock; // agrego atributo para el stock
  }
  // visto en las ultimas clases el atributo "data-id" datos personalizados (data attributes) almaceno info en el elemento HTML
  toHTML() {
    // agrego indicador de stock 
    return `
            <img src="${this.imagen}" alt="${this.nombre}">
            <h3>${this.nombre}</h3>
            <p>${this.categoria}</p>
            <p><b>Precio: $${this.precio.toFixed(3)}</b></p>
            <p class="stock-info">Stock: ${
              this.stock > 0 ? this.stock : "Agotado"
            }</p>
            <button class="btn btn-pipo btn-agregar-carrito" data-id="${
              this.id
            }" ${this.stock <= 0 ? "disabled" : ""}>Agregar al Carrito</button>
            <button class="btn btn-info btn-ver-mas" data-id="${
              this.id
            }">Ver Más</button>
        `;
  }
}

// -- defino de la Clase Carrito
class Carrito {
  constructor() {
    this.items = [];
    this.loadFromLocalStorage();
  }
  // levanto la data del local storage
  loadFromLocalStorage() {
    const storedCart = localStorage.getItem("carritoCompras");
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      this.items = parsedCart.map((item) => ({
        //  el stock también se carga del storage
        producto: new Producto(
          item.producto.id,
          item.producto.nombre,
          item.producto.precio,
          item.producto.imagen,
          item.producto.descripcion,
          item.producto.categoria,
          item.producto.stock
        ),
        cantidad: item.cantidad,
        subtotal: item.subtotal,
      }));
    }
  }
  // guardo en local storage pasandolo a un string
  saveToLocalStorage() {
    localStorage.setItem("carritoCompras", JSON.stringify(this.items));
  }

  agregarProducto(productoNuevo) {
    // referencia al producto en productosDisponibles para manipular  stock 
    const productoEnStock = productosDisponibles.find(
      (p) => p.id === productoNuevo.id
    );

    if (!productoEnStock || productoEnStock.stock <= 0) {
      alert(
        `Lo sentimos, no hay stock disponible para ${productoNuevo.nombre}.`
      );
      return false; // No se pudo agregar por falta de stock
    }

    const itemExistente = this.items.find(
      (item) => item.producto.id === productoNuevo.id
    );

    if (itemExistente) {
      if (productoEnStock.stock > 0) {
        itemExistente.cantidad++;
        itemExistente.subtotal =
          itemExistente.producto.precio * itemExistente.cantidad;
        productoEnStock.stock--; // Disminuye el stock del producto disponible
      } else {
        alert(`No hay más stock disponible para ${productoNuevo.nombre}.`);
        return false;
      }
    } else {
      //  Producto con el stock actual
      if (productoEnStock.stock > 0) {
        this.items.push({
          producto: new Producto(
            productoEnStock.id,
            productoEnStock.nombre,
            productoEnStock.precio,
            productoEnStock.imagen,
            productoEnStock.descripcion,
            productoEnStock.categoria,
            productoEnStock.stock
          ), // instancia para el carrito
          cantidad: 1,
          subtotal: productoEnStock.precio,
        });
        productoEnStock.stock--; // Disminuye el stock del producto disponible
      } else {
        alert(`No hay más stock disponible para ${productoNuevo.nombre}.`);
        return false;
      }
    }
    this.saveToLocalStorage();
    return true; // Producto agregado
  }

  eliminarProducto(productId) {
    const itemAEliminar = this.items.find(
      (item) => item.producto.id === productId
    );
    if (itemAEliminar) {
      // Devolver el stock al producto disponible
      const productoEnStock = productosDisponibles.find(
        (p) => p.id === productId
      );
      if (productoEnStock) {
        productoEnStock.stock += itemAEliminar.cantidad;
      }
    }
    this.items = this.items.filter((item) => item.producto.id !== productId);
    this.saveToLocalStorage();
  }
  // metodos para sumar y restar productos
  cambiarCantidad(productId, operacion) {
    const itemExistente = this.items.find(
      (item) => item.producto.id === productId
    );
    const productoEnStock = productosDisponibles.find(
      (p) => p.id === productId
    );

    if (itemExistente && productoEnStock) {
      if (operacion === "sumar") {
        if (productoEnStock.stock > 0) {
          itemExistente.cantidad++;
          productoEnStock.stock--; // Disminuye el stock disponible
        } else {
          alert(
            `No hay más stock disponible para ${itemExistente.producto.nombre}.`
          );
          return false; // No permite sumar si no hay stock
        }
      } else if (operacion === "restar") {
        itemExistente.cantidad--;
        productoEnStock.stock++; // Aumenta el stock disponible
      }

      if (itemExistente.cantidad <= 0) {
        this.eliminarProducto(productId);
        this.saveToLocalStorage(); // Guardar el cambio después de eliminar
        return true; // Indica que se eliminó
      }

      itemExistente.subtotal =
        itemExistente.producto.precio * itemExistente.cantidad;
    }
    this.saveToLocalStorage();
    return true; // Producto agregado o modificado
  }
  ////contadores del carrito
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.cantidad, 0);
  }

  getTotalPagar() {
    return this.items.reduce((total, item) => total + item.subtotal, 0);
  }

  getItems() {
    return this.items;
  }

  estaVacio() {
    return this.items.length === 0;
  }

  vaciarCarrito() {
    this.items = [];
    this.saveToLocalStorage();
  }
}

// --- Creo carrito y Datos Iniciales 
let productosDisponibles = [];
let productosFiltradosOrdenados = []; // variable para almacenar los productos después de filtrar y ordenar
const miCarrito = new Carrito();

// acá guardo las referencias a  elementos del DOM 
const productosContainer = document.getElementById("productos-container");

// Referencias para la barra superior
const totalResumenElement = document.getElementById("total-resumen");
const itemCountElement = document.getElementById("item-count");

// Referencias a las modales
const carritoModal = document.getElementById("carrito-modal");
const detalleProductoModal = document.getElementById("detalle-producto-modal");
// Nueva referencia para la modal de oferta
const ofertaModal = document.getElementById("oferta-modal");
// Nueva referencia para la modal de checkout
const checkoutModal = document.getElementById("checkout-modal");

// Botoncito para abrir la modal del carrito
const verCarritoBtn = document.getElementById("toggleCarritoBtn");

//  guardo las referencias para los filtros de categoria y precio 
const selectCategoria = document.getElementById("select-categoria");
const selectOrdenPrecio = document.getElementById("select-orden-precio");

// Referencia al contenedor de la lista de ítems del carrito dentro del modal
let listaCarritoUl;
let totalCarritoP; // Referencia al elemento del total en el carrito

//   creo los elementos html  relacion con la clase Carrito 
function renderizarProductos(productosARenderizar) {
  productosContainer.innerHTML = "";
  productosARenderizar.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.classList.add("producto");
    productoDiv.innerHTML = producto.toHTML();
    productosContainer.appendChild(productoDiv);
  });
  // capturo el evento click del boton agregar al carrito
  document
    .querySelectorAll(".producto .btn-agregar-carrito")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        const productId = parseInt(event.target.dataset.id);
        const productoToAdd = productosDisponibles.find(
          (p) => p.id === productId
        );
        if (productoToAdd) {
          // Solo actualizo la vista si se pudo agregar el producto (hay stock)
          if (miCarrito.agregarProducto(productoToAdd)) {
            actualizarVistaCarrito();
            renderizarProductos(productosFiltradosOrdenados); // Volver a renderizar para actualizar el stock visible
          }
        }
      });
    });
  // capturo el evento click del boton ver mas detalles del producto en la modal
  document.querySelectorAll(".producto .btn-ver-mas").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = parseInt(event.target.dataset.id);
      const productoToShow = productosDisponibles.find(
        (p) => p.id === productId
      );
      if (productoToShow) {
        mostrarDetalleProductoModal(productoToShow);
      }
    });
  });
}

function actualizarVistaCarrito() {
  if (itemCountElement) {
    itemCountElement.textContent = miCarrito.getTotalItems();
  }
  if (totalResumenElement) {
    totalResumenElement.textContent = `Total: $${miCarrito
      .getTotalPagar()
      .toFixed(3)}`;
  }
  // Si el carrito modal está visible, actualiza su contenido parcialmente
  if (carritoModal.classList.contains("visible") && listaCarritoUl) {
    // Si el carrito está vacío, renderiza todo el contenido del modal de nuevo
    // para mostrar el mensaje "El carrito está vacío."
    if (miCarrito.estaVacio()) {
      renderizarContenidoCarritoModal();
    } else {
      // Si no está vacío, solo actualiza el total
      if (totalCarritoP) {
        totalCarritoP.textContent = `Total: $${miCarrito.getTotalPagar().toFixed(3)}`;
      }
    }
  }
}

//  Mostrar/Ocultar Carrito modal 
function toggleCarritoModal() {
  carritoModal.classList.toggle("visible");
  if (carritoModal.classList.contains("visible")) {
    renderizarContenidoCarritoModal(); // Siempre renderiza completamente al abrir
  }
}

/// creo los elemntos del carito modal
function renderizarContenidoCarritoModal() {
  // Limpiar el contenido anterior del modal
  while (carritoModal.firstChild) {
    carritoModal.removeChild(carritoModal.firstChild);
  }

  const modalContentDiv = document.createElement("div");
  modalContentDiv.classList.add("modal-content");
  // creo el boton con un span para cerrr el carrito
  const closeButton = document.createElement("span");
  closeButton.classList.add("close-button");
  closeButton.textContent = "×";
  // le agrego el listener para la funcion ver/ocultar modal con el toggle
  closeButton.addEventListener("click", toggleCarritoModal);
  modalContentDiv.appendChild(closeButton);

  const h2Title = document.createElement("h2");
  h2Title.textContent = "Tu Carrito de Compras";
  modalContentDiv.appendChild(h2Title);

  listaCarritoUl = document.createElement("ul"); 
  

  if (miCarrito.estaVacio()) {
    const emptyLi = document.createElement("li");
    emptyLi.textContent = "El carrito está vacío.";
    listaCarritoUl.appendChild(emptyLi);
  } else {
    miCarrito.getItems().forEach((item) => {
      const li = crearElementoItemCarrito(item); // recorro los items
      listaCarritoUl.appendChild(li);
    });
  }
  modalContentDiv.appendChild(listaCarritoUl);

  totalCarritoP = document.createElement("p"); // total carrito
  totalCarritoP.id = "total-carrito";
  totalCarritoP.textContent = `Total: $${miCarrito.getTotalPagar().toFixed(3)}`;
  modalContentDiv.appendChild(totalCarritoP);

  const btnVaciarCarrito = document.createElement("button");
  btnVaciarCarrito.classList.add("btn", "btn-pipo");
  btnVaciarCarrito.textContent = "Vaciar Carrito";
  btnVaciarCarrito.addEventListener("click", () => {
    // Al vaciar, devuelvo el stock de todos los productos al array principal
    miCarrito.items.forEach((item) => {
      const productoEnStock = productosDisponibles.find(
        (p) => p.id === item.producto.id
      );
      if (productoEnStock) {
        productoEnStock.stock += item.cantidad;
      }
    });
    miCarrito.vaciarCarrito(); // Usa el método vaciarCarrito
    renderizarContenidoCarritoModal(); // Vuelvo a renderizar para mostrar "carrito vacío"
    actualizarVistaCarrito();
    renderizarProductos(productosFiltradosOrdenados); // Actualizar stock visible
  });
  modalContentDiv.appendChild(btnVaciarCarrito);

  // creo el boton COMPRAR
  if (!miCarrito.estaVacio()) {
    const btnComprar = document.createElement("button");
    btnComprar.classList.add("btn", "btn-warning");
    btnComprar.setAttribute("id", "comprita");
    btnComprar.textContent = "Comprar";
    modalContentDiv.appendChild(btnComprar);

    // Event listener para el botón "Comprar"
    btnComprar.addEventListener("click", () => {
      toggleCarritoModal(); // Cierra el modal del carrito
      mostrarCheckoutModal(); // Abre el modal de checkout
    });
  }
  carritoModal.appendChild(modalContentDiv);
}

// Nueva función para crear un elemento de ítem de carrito
function crearElementoItemCarrito(item) {
  const li = document.createElement("li");
  li.setAttribute("data-id", item.producto.id); // Añadir data-id al li para facilitar la selección 

  const divProductoInfo = document.createElement("div");
  divProductoInfo.textContent = item.producto.nombre;

  const divCantidadControles = document.createElement("div");
  divCantidadControles.classList.add("cantidad-controles");

  const btnRestar = document.createElement("button");
  btnRestar.classList.add("restar");
  btnRestar.textContent = "-";
  btnRestar.setAttribute("data-id", item.producto.id);
  btnRestar.addEventListener("click", (event) => {
    const id = parseInt(event.target.dataset.id);
    if (miCarrito.cambiarCantidad(id, "restar")) { // Verifica si la operación fue exitosa (no se encontró stock)
      const updatedItem = miCarrito.getItems().find(i => i.producto.id === id);
      if (updatedItem) {
        actualizarItemEnCarritoModal(updatedItem);
      } else {
        eliminarItemDelDOM(id); // Si no se encuentra, se eliminó
      }
      actualizarVistaCarrito();
      renderizarProductos(productosFiltradosOrdenados); // Actualizar stock visible
    }
  });
  divCantidadControles.appendChild(btnRestar);

  const spanCantidad = document.createElement("span");
  spanCantidad.classList.add("item-cantidad"); // Clase para fácil selección
  spanCantidad.textContent = item.cantidad;
  divCantidadControles.appendChild(spanCantidad);

  const btnSumar = document.createElement("button");
  btnSumar.classList.add("sumar");
  btnSumar.textContent = "+";
  btnSumar.setAttribute("data-id", item.producto.id);
  btnSumar.addEventListener("click", (event) => {
    const id = parseInt(event.target.dataset.id);
    if (miCarrito.cambiarCantidad(id, "sumar")) { // Verifica si la operación fue exitosa
      const updatedItem = miCarrito.getItems().find(i => i.producto.id === id);
      if (updatedItem) {
        actualizarItemEnCarritoModal(updatedItem);
      }
      actualizarVistaCarrito();
      renderizarProductos(productosFiltradosOrdenados); // Actualizar stock visible
    }
  });
  divCantidadControles.appendChild(btnSumar);

  divProductoInfo.appendChild(divCantidadControles);

  const divImgChiquita = document.createElement("div");
  divImgChiquita.classList.add("img-chiquita");
  const imgChiquita = document.createElement("img");
  imgChiquita.setAttribute("src", item.producto.imagen);
  imgChiquita.setAttribute("alt", item.producto.nombre);
  divImgChiquita.appendChild(imgChiquita);
  divProductoInfo.appendChild(divImgChiquita);

  li.appendChild(divProductoInfo);

  const divSubtotalEliminar = document.createElement("div");
  const spanSubtotal = document.createElement("span");
  spanSubtotal.classList.add("item-subtotal"); // Clase para fácil selección
  spanSubtotal.textContent = `$${item.subtotal.toFixed(3)}`;
  divSubtotalEliminar.appendChild(spanSubtotal);

  const btnEliminar = document.createElement("button");
  btnEliminar.classList.add("eliminar", "btn-pipo");
  btnEliminar.textContent = "X";
  btnEliminar.setAttribute("data-id", item.producto.id);
  btnEliminar.addEventListener("click", (event) => {
    const id = parseInt(event.target.dataset.id);
    miCarrito.eliminarProducto(id);
    eliminarItemDelDOM(id); // Eliminar del DOM directamente
    actualizarVistaCarrito();
    renderizarProductos(productosFiltradosOrdenados); // Actualizar stock visible
  });
  divSubtotalEliminar.appendChild(btnEliminar);

  li.appendChild(divSubtotalEliminar);
  return li;
}

// Nueva función para actualizar un ítem específico en el modal del carrito
function actualizarItemEnCarritoModal(item) {
  const itemElement = listaCarritoUl.querySelector(`li[data-id="${item.producto.id}"]`);
  if (itemElement) {
    itemElement.querySelector(".item-cantidad").textContent = item.cantidad;
    itemElement.querySelector(".item-subtotal").textContent = `$${item.subtotal.toFixed(3)}`;
  } else {
    // Si el elemento no existe (porque se acaba de agregar un producto al carrito)
    // Si el carrito se abrió estando vacío y luego se agregó algo, 'renderizarContenidoCarritoModal'
    // ya se encargaría de dibujar todo.
    renderizarContenidoCarritoModal(); // Esto  si el item no se encuentra
  }
}

//  función para eliminar un ítem específico del DOM del carrito
function eliminarItemDelDOM(productId) {
  const itemElement = listaCarritoUl.querySelector(`li[data-id="${productId}"]`);
  if (itemElement) {
    itemElement.remove();
    // Si después de eliminar, el carrito queda vacío, mostramos el mensaje
    if (miCarrito.estaVacio()) {
      const emptyLi = document.createElement("li");
      emptyLi.textContent = "El carrito está vacío.";
      listaCarritoUl.appendChild(emptyLi);
      // También ocultar el botón de comprar y vaciar
      const btnComprar = carritoModal.querySelector('#comprita');
      if(btnComprar) btnComprar.remove();
      const btnVaciar = carritoModal.querySelector('.btn-pipo:contains("Vaciar Carrito")');
      if(btnVaciar) btnVaciar.remove();
    }
  }
}

// muestro el detalle del producto en la modal
function mostrarDetalleProductoModal(producto) {
  while (detalleProductoModal.firstChild) {
    detalleProductoModal.removeChild(detalleProductoModal.firstChild);
  }

  const modalContentDiv = document.createElement("div");
  modalContentDiv.classList.add("modal-content");

  const closeButton = document.createElement("span");
  closeButton.classList.add("close-button");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", cerrarDetalleProductoModal);
  modalContentDiv.appendChild(closeButton);

  const detalleContenidoDiv = document.createElement("div");
  detalleContenidoDiv.classList.add("detalle-producto-contenido");

  const img = document.createElement("img");
  img.setAttribute("src", producto.imagen);
  img.setAttribute("alt", producto.nombre);
  detalleContenidoDiv.appendChild(img);

  const h2 = document.createElement("h2");
  h2.textContent = producto.nombre;
  detalleContenidoDiv.appendChild(h2);

  const pDescripcion = document.createElement("p");
  pDescripcion.textContent = producto.descripcion;
  detalleContenidoDiv.appendChild(pDescripcion);

  const pPrecio = document.createElement("p");
  const bPrecio = document.createElement("b");
  bPrecio.textContent = `Precio: $${producto.precio.toFixed(3)}`;
  pPrecio.appendChild(bPrecio);
  detalleContenidoDiv.appendChild(pPrecio);

  // Añadir información de stock en el detalle del producto
  const pStock = document.createElement("p");
  pStock.classList.add("stock-info");
  pStock.textContent = `Stock disponible: ${
    producto.stock > 0 ? producto.stock : "Agotado"
  }`;
  detalleContenidoDiv.appendChild(pStock);

  const agregarCarritoBtn = document.createElement("button");
  agregarCarritoBtn.classList.add("btn", "btn-pipo");
  agregarCarritoBtn.textContent = "Agregar al Carrito";
  agregarCarritoBtn.setAttribute("data-id", producto.id);
  // Deshabilitar si no hay stock
  if (producto.stock <= 0) {
    agregarCarritoBtn.disabled = true;
  }
  agregarCarritoBtn.addEventListener("click", (event) => {
    const productId = parseInt(event.target.dataset.id);
    const productoToAdd = productosDisponibles.find(
      (p) => p.id === productId
    );
    if (productoToAdd) {
      if (miCarrito.agregarProducto(productoToAdd)) {
        actualizarVistaCarrito();
        cerrarDetalleProductoModal();
        renderizarProductos(productosFiltradosOrdenados); // Actualizar stock visible
      }
    }
  });

  detalleContenidoDiv.appendChild(agregarCarritoBtn);
  modalContentDiv.appendChild(detalleContenidoDiv);
  detalleProductoModal.appendChild(modalContentDiv);
  detalleProductoModal.classList.add("visible");
}
// funcioncita para cerra la modal
function cerrarDetalleProductoModal() {
  detalleProductoModal.classList.remove("visible");
}

// Función para mostrar la modal de oferta
function mostrarOfertaModal(categoria) {
  // Limpiar contenido anterior
  while (ofertaModal.firstChild) {
    ofertaModal.removeChild(ofertaModal.firstChild);
  }

  const modalContentDiv = document.createElement("div");
  modalContentDiv.classList.add("modal-content");

  const h2 = document.createElement("h2");
  h2.textContent = `¡Oferta Especial en ${categoria.toUpperCase()}!`;
  modalContentDiv.appendChild(h2);

  const p = document.createElement("p");
  p.textContent =
    "¡Aprovecha descuentos increíbles en esta categoría por tiempo limitado!";
  modalContentDiv.appendChild(p);

  const img = document.createElement("img");
    
  switch (categoria) {
    case "Cartoons": img.src = "./images/oferta_Cartoons.jpg";
      break;
    case "Cine y Series": img.src = "./images/ofertaCinev.jpg";
      break;
    case "Artistas": img.src = "./images/ofertaArtistas.jpg";
      break;

  }

  //agregadooo puedo usar switch

  /*img.src = '../images/oferta1.jpeg'; // Puedes reemplazar con una imagen real*/
  img.alt = "Oferta Especial";
  modalContentDiv.appendChild(img);
  ofertaModal.appendChild(modalContentDiv);
  ofertaModal.classList.add("visible"); // Mostrar la moda
  // Desaparecer la modal después de 5 segundos
  setTimeout(() => {
    ofertaModal.classList.remove("visible");
  }, 10000);
}

//Aplica los filtros de categoría y ordenamiento de precio a los productos.
//Renderiza los productos actualizados en la vista.

function aplicarFiltrosYOrdenamiento() {
  // Trabaja con una copia de los productos originales
  let productosFiltrados = productosDisponibles;

  // Filtrar por categoría
  const categoriaSeleccionada = selectCategoria.value;
  if (categoriaSeleccionada && categoriaSeleccionada !== "todas") {
    productosFiltrados = productosFiltrados.filter(
      (producto) => producto.categoria === categoriaSeleccionada
    );
    mostrarOfertaModal(categoriaSeleccionada); // Mostrar oferta al cambiar de categoría
  } else {
    // no muestra noda si la categoria es todas
  }

  // Ordenar por precio
  const ordenSeleccionado = selectOrdenPrecio.value;
  if (ordenSeleccionado === "ascendente") {
    productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (ordenSeleccionado === "descendente") {
    productosFiltrados.sort((a, b) => b.precio - a.precio);
  }
  // Guarda el resultado para renderizar
  productosFiltradosOrdenados = productosFiltrados;
  renderizarProductos(productosFiltradosOrdenados);
}

//Llena el select de categorías con las categorías únicas de los productos disponibles.

function cargarFiltroCategorias() {
  const categorias = new Set();
  productosDisponibles.forEach((producto) => {
    categorias.add(producto.categoria);
  });

  // Limpiar opciones existentes, excepto la primera "Todas" si ya existe
  // Mantiene la opción 'Todas' si es la primera
  while (selectCategoria.children.length > 1) {
    selectCategoria.removeChild(selectCategoria.lastChild);
  }

  // Crear y añadir opciones para cada categoría única
  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.setAttribute("value", categoria);
    option.textContent = categoria;
    selectCategoria.appendChild(option);
  });
}

// función para cargar productos desde JSON
function cargarProductosDesdeJSON() {
  fetch("productos.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Asegúrate de que el JSON incluya el atributo 'stock'
      productosDisponibles = data.map(
        (p) =>
          new Producto(
            p.id,
            p.nombre,
            p.precio,
            p.imagen,
            p.descripcion,
            p.categoria,
            p.stock
          )
      );
      console.log("Productos cargados desde JSON:", productosDisponibles);

      // Inicialmente, mostrar todos los productos
      productosFiltradosOrdenados = productosDisponibles;
      renderizarProductos(productosFiltradosOrdenados);
      actualizarVistaCarrito();

      // cargar el filtro de categorías
      cargarFiltroCategorias();

      // Event Listeners para los filtros y ordenar
      if (selectCategoria) {
        selectCategoria.addEventListener("change", aplicarFiltrosYOrdenamiento);
      }
      if (selectOrdenPrecio) {
        selectOrdenPrecio.addEventListener("change", aplicarFiltrosYOrdenamiento);
      }

      // Event Listener para abrir la modal del carrito
      if (verCarritoBtn) {
        verCarritoBtn.addEventListener("click", toggleCarritoModal);
      }

      //  Listener para cerrar la modal del carrito haciendo clic fuera
      carritoModal.addEventListener("click", (e) => {
        if (e.target === carritoModal) {
          toggleCarritoModal();
        }
      });

      // Event Listener para cerrar la modal de detalle haciendo clic fuera de ella
      detalleProductoModal.addEventListener("click", (e) => {
        if (e.target === detalleProductoModal) {
          cerrarDetalleProductoModal();
        }
      });

      // Event listener para cerrar la modal de oferta haciendo clic fuera de ella (opcional, si quieres que se cierre antes de los 5 segundos)
      ofertaModal.addEventListener("click", (e) => {
        if (e.target === ofertaModal) {
          ofertaModal.classList.remove("visible");
        }
      });

      // Event listener para cerrar la modal de checkout haciendo clic fuera de ella
      checkoutModal.addEventListener("click", (e) => {
        if (e.target === checkoutModal) {
          cerrarCheckoutModal();
        }
      });
    })
    .catch((error) => {
      console.error("Error al cargar los productos desde JSON:", error);
    });
}

cargarProductosDesdeJSON();