function mostrarCheckoutModal() {
  checkoutModal.classList.add("visible");
  // Limpiar el contenido previo
  while (checkoutModal.firstChild) {
    checkoutModal.removeChild(checkoutModal.firstChild);
  }

  const modalContentDiv = document.createElement("div");
  modalContentDiv.classList.add("modal-content");

  const closeButton = document.createElement("span");
  closeButton.classList.add("close-button");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", cerrarCheckoutModal); // Para cerrar la modal
  modalContentDiv.appendChild(closeButton);

  const titulo = document.createElement("p");
  titulo.classList.add("h3", "w-75", "bg-info", "m-auto");
  titulo.textContent = "Detalle de Compra";
  modalContentDiv.appendChild(titulo);

  // Mostrar resumen del carrito
  const resumenCarritoDiv = document.createElement("div");
  resumenCarritoDiv.classList.add("resumen-carrito-checkout");

  if (miCarrito.estaVacio()) {
    const p = document.createElement("p");
    p.textContent = "Tu carrito está vacío. ¡No hay nada para comprar!";
    resumenCarritoDiv.appendChild(p);
  } else {
    const ul = document.createElement("ul");
    miCarrito.getItems().forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.producto.nombre} x ${item.cantidad} - $${item.subtotal.toFixed(3)}`;
      ul.appendChild(li);
    });
    resumenCarritoDiv.appendChild(ul);

    const totalP = document.createElement("p");
    totalP.classList.add("total-checkout", "h2");
    totalP.textContent = `Total a pagar: $${miCarrito.getTotalPagar().toFixed(3)}`;
    resumenCarritoDiv.appendChild(totalP);
  }
  modalContentDiv.appendChild(resumenCarritoDiv);

  // Formulario de checkout
  const formulario = document.createElement("form");
  formulario.id = "form-checkout";
  formulario.setAttribute("action", '#');
  formulario.setAttribute("method", 'post');

  const campos = [
    { label: "Nombre completo", id: "nombre", type: "text", required: true },
    { label: "Teléfono", id: "telefono", type: "tel", required: true },
    { label: "Email", id: "email", type: "email", required: true },
    { label: "Domicilio", id: "domicilio", type: "text", required: true },
    { label: "Fecha de entrega", id: "fecha-entrega", type: "date", required: true },
  ];

  campos.forEach((campo) => {
    const label = document.createElement("label");
    label.setAttribute("for", campo.id);
    label.textContent = campo.label;

    const input = document.createElement("input");
    input.id = campo.id;
    input.name = campo.id;
    input.type = campo.type;
    if (campo.required) input.required = true;

    // Si el input es de tipo "date", guardo su referencia para setearle el minimo de fecha de entraga
    if (campo.id === "fecha-entrega") {
      inputFechaEntrega = input;
    }

    formulario.appendChild(label);
    formulario.appendChild(input);
  });

  ///////// MINIMO DE FECHA DE ENTREGA
  // Solo aplica el atributo 'min' si el input de fecha fue encontrado
  if (inputFechaEntrega) {
    // Obtengo la fecha actual
    const now = new Date(Date.now());
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    // SE entrega 2 dias después de la fecha de compra
    now.setDate(now.getDate() + 2);
    const dia = now.getDate().toString().padStart(2, "0"); // para que el día también tenga 2 dígitos
    //  minimo del calendario
    inputFechaEntrega.setAttribute("min", `${year}-${month}-${dia}`);
  }
  //////// FIN MINIMO FECHA ENTREGA
  
  

  const labelMetodoPago = document.createElement("label");
  labelMetodoPago.setAttribute("for", "metodo-pago");
  labelMetodoPago.textContent = "Método de pago";

  const selectMetodoPago = document.createElement("select");
  selectMetodoPago.id = "metodo-pago";
  selectMetodoPago.name = "metodo-pago";
  selectMetodoPago.required = true;

  const opcionesMetodoPago = [
    { value: "", text: "Seleccionar" },
    { value: "credito", text: "Tarjeta de crédito" },
    { value: "debito", text: "Tarjeta de débito" },
    { value: "efectivo", text: "Efectivo" },
  ];

  opcionesMetodoPago.forEach((opcion) => {
    const option = document.createElement("option");
    option.value = opcion.value;
    option.textContent = opcion.text;
    selectMetodoPago.appendChild(option);
  });

  formulario.appendChild(labelMetodoPago);
  formulario.appendChild(selectMetodoPago);

  const divCuotas = document.createElement("div");
  divCuotas.id = "opciones-cuotas";
  divCuotas.style.display = "none";

  const labelCuotas = document.createElement("label");
  labelCuotas.setAttribute("for", "cuotas");
  labelCuotas.textContent = "Cuotas";

  const selectCuotas = document.createElement("select");
  selectCuotas.id = "cuotas";
  selectCuotas.name = "cuotas";

  const opcionesCuotas = [
    { value: "1", text: "1 cuota sin interés" },
    { value: "3", text: "3 cuotas sin interés" },
    { value: "6", text: "6 cuotas sin interés" },
    { value: "12", text: "12 cuotas sin interés" },
  ];

  opcionesCuotas.forEach((opcion) => {
    const option = document.createElement("option");
    option.value = opcion.value;
    option.textContent = opcion.text;
    selectCuotas.appendChild(option);
  });

  divCuotas.appendChild(labelCuotas);
  divCuotas.appendChild(selectCuotas);
  formulario.appendChild(divCuotas);

  // Mostrar cuotas solo si el método de pago es tarjeta
  selectMetodoPago.addEventListener("change", () => {
    divCuotas.style.display =
      selectMetodoPago.value === "credito" ? "block" : "none";
  });

  // Botones del formulario
  const divBotones = document.createElement("div");
  divBotones.id = "botones-checkout";

  const botonCancelar = document.createElement("button");
  botonCancelar.type = "button";
  botonCancelar.id = "cancelar-compra";
  botonCancelar.textContent = "Cancelar";
  botonCancelar.classList.add("btn", "btn-pipo"); // Añadir para estilos
  // Evento para cancelar el checkout
  botonCancelar.addEventListener("click", () => {
    cerrarCheckoutModal();
    toggleCarritoModal(); // Volver a mostrar el carrito si se cancela
  });

  const botonConfirmar = document.createElement("button");
  botonConfirmar.type = "submit";
  botonConfirmar.id = "confirmar-compra";
  botonConfirmar.textContent = "Confirmar Compra";
  botonConfirmar.classList.add("btn", "btn-warning"); //  clases para estilos

  divBotones.appendChild(botonCancelar);
  divBotones.appendChild(botonConfirmar);
  formulario.appendChild(divBotones);

  modalContentDiv.appendChild(formulario);
  checkoutModal.appendChild(modalContentDiv);

  // Evento para confirmar la compra
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const datosCliente = {
      nombre: formulario.nombre.value,
      telefono: formulario.telefono.value,
      email: formulario.email.value,
      lugarEntrega: formulario["domicilio"].value,
      fechaEntrega: formulario["fecha-entrega"].value,
      metodoPago: formulario["metodo-pago"].value,
      cuotas: formulario["cuotas"] ? formulario["cuotas"].value : "1",
    };

    if (
      !datosCliente.nombre ||
      !datosCliente.telefono ||
      !datosCliente.email ||
      !datosCliente.lugarEntrega ||
      !datosCliente.fechaEntrega ||
      !datosCliente.metodoPago
    ) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    //  mensaje de confirmación de compra
    while (modalContentDiv.firstChild) {
      modalContentDiv.removeChild(modalContentDiv.firstChild);
    }

    const mensajeConfirmacion = document.createElement("div");
    mensajeConfirmacion.id = "mensaje-confirmacion";

    const tituloExito = document.createElement("h3");
    tituloExito.textContent = `¡Gracias por tu compra ${datosCliente.nombre}!`;

    const descripcionExito = document.createElement("p");
    descripcionExito.textContent = `Podrás hacer el seguimiento con el código enviado a tu mail: ${datosCliente.email}`;

    const botonCerrar = document.createElement("button");
    botonCerrar.classList.add("btn", "btn-pipo"); //  clase para estilos
    botonCerrar.textContent = "Cerrar";
    botonCerrar.addEventListener("click", () => {
      cerrarCheckoutModal();
      miCarrito.vaciarCarrito();
      actualizarVistaCarrito(); // Actualizar vista del carrito y productos
      renderizarProductos(productosFiltradosOrdenados);
    });

    mensajeConfirmacion.appendChild(tituloExito);
    mensajeConfirmacion.appendChild(descripcionExito);
    mensajeConfirmacion.appendChild(botonCerrar);
    modalContentDiv.appendChild(mensajeConfirmacion);
  });
}

function cerrarCheckoutModal() {
  checkoutModal.classList.remove("visible");
}