//Simulador de Carrito de compras.


//FUNCIONES:

function productoFinalIva(precioTotal) {
    return (precioTotal * 21) / 100;

}

function productosEnCarrito(arreglo) {
    let mostrarCarrito = arreglo.map((el, index) => (index + 1) + ". " + el.nombre + " -- $" + el.precio);
    return mostrarCarrito.join("\n");
}



function iterarArrayMuestraProducto(accion) {
    let concatNombreYPrecio = "";
    for (elemento of productosDisponibles) {
        concatNombreYPrecio += (elemento.numeroPieza+ " " + "-- " + elemento.nombre + "\n" + "Precio: $ " + elemento.precio + "    " + "Stock: " + elemento.stock + "\n\n");
    }
    return concatNombreYPrecio;
}


function mostrarCarrito() {
    if (carroDeCompras.length === 0) {
        alert("Su carrito de compras está vacío.");
    } else {
        let carritoTexto = "Productos en su carrito:\n\n";
        let totalPrecio = 0;

        for (const producto of carroDeCompras) {
            carritoTexto += producto.nombre + " -- $" + producto.precio + "\n";
            totalPrecio += producto.precio;
        }

        const iva = productoFinalIva(totalPrecio);
        const precioFinal = totalPrecio + iva;

        carritoTexto += "\nTotal: $" + totalPrecio + "\nIVA (21%): $" + iva + "\nPRECIO FINAL TOTAL: $" + precioFinal;

        alert(carritoTexto);

        const confirmarQuitarProducto = confirm("¿Desea quitar algún producto del carrito?");
        if (confirmarQuitarProducto) {
            quitarArticuloCarrito();
        } else {
            const confirmarTerminarCompra = confirm("¿Desea terminar la compra?");
            if (confirmarTerminarCompra) {
                alert("Muchas gracias por su compra");
                carroDeCompras = [];
                guardarCarritoEnLocalStorage();
            }
        }
    }
}


function quitarArticuloCarrito() {
    while (true) {
        productosEnCarrito(carroDeCompras);

        const articulo = prompt("¿Cuántos productos desea eliminar?:\n" + productosEnCarrito(carroDeCompras) + "\n\nIngrese (00) para salir");
        if (articulo.toLowerCase() === "00") {
            break;
        }

        const index = parseInt(articulo) - 1;

        if (!isNaN(index) && index >= 0 && index < carroDeCompras.length) {
            const devolverArticulo = carroDeCompras.splice(index, 1)[0];
            productosDisponibles[devolverArticulo.numeroPieza - 1].stock++;
            alert("Producto eliminado con éxito.");
            
            guardarCarritoEnLocalStorage();

        } else {
            alert("Por favor, ingrese una opción válida.");
        }
    }

    const confirmarTerminarCompra = confirm("¿Desea terminar la compra?");
    if (confirmarTerminarCompra) {
        alert("Muchas gracias por su compra");
    }
}


function agregarBotonAlCarrito() {
    productosDisponibles.forEach((producto, index) => {
        const id = `producto-${index + 1}`;
        const card = document.getElementById(id);

        if (card) {
            let botonElement = card.querySelector('.btn-carrito');

            if (!botonElement) {
                botonElement = document.createElement('button');
                botonElement.className = 'btn btn-primary btn-carrito d-block mx-auto my-3';
                botonElement.textContent = 'Añadir al carrito';
                botonElement.addEventListener('click', () => {
                    añadirAlCarrito(index);
                });

                const cardBody = card.querySelector('.card-body');
                cardBody.appendChild(botonElement);
            }
        }
    });
}


function actualizarInformacionEnDOM() {
    productosDisponibles.forEach(producto => {
        const id = `producto-${producto.numeroPieza}`;
        const card = document.getElementById(id);

        if (card) {
            const precioElement = card.querySelector('.card-text');
            let stockElement = card.querySelector('.stock-text');

            if (precioElement) {
                precioElement.textContent = `Precio: $${producto.precio}`;
            }

            if (!stockElement) {
                stockElement = document.createElement('p');
                stockElement.className = 'stock-text';
                card.querySelector('.card-body').appendChild(stockElement);
            }

            if (producto.stock > 0) {
                stockElement.textContent = `Stock: ${producto.stock}`;
            } else {
                stockElement.textContent = 'Sin Stock';
            }
        }
    });
}


function añadirAlCarrito(productoIndex) {
    const cantidad = parseInt(prompt("¿Cuántos productos desea adquirir?"));

    if (cantidad > 0 && cantidad <= productosDisponibles[productoIndex].stock) {
        for (let contador = 0; contador < cantidad; contador++) {
            carroDeCompras.push(productosDisponibles[productoIndex]);
            productosDisponibles[productoIndex].stock--;
        }
        alert("¡Producto añadido al carrito con éxito!");
        
        actualizarInformacionEnDOM();
        guardarCarritoEnLocalStorage();

    } else {
        alert("No tenemos esa cantidad de stock en esa pieza.");
    }
}


function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carroDeCompras');
    if (carritoGuardado) {
        carroDeCompras = JSON.parse(carritoGuardado);
    }
}


function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carroDeCompras', JSON.stringify(carroDeCompras));
}


//VARIABLES


let listadoDeProductosElegidos = "";
let productosListados;
let opcionesMenu;
let precioTotal = 0;
let carroDeCompras = [];


class Producto { //Función constructora

    constructor(numeroPieza, nombre, precio, madera, stock) {

        this.numeroPieza = numeroPieza;
        this.nombre = nombre;
        this.precio = precio;
        this.madera = madera;
        this.stock = stock;

    }
}

const productosDisponibles = [

    new Producto(1, "Guerrero Vikingo", 25000, "Cedro", 1),
    new Producto(2, "Earl Vikingo", 10000, "Cedro", 1),
    new Producto(3, "Earl Vikingo II", 10000, "Cedro", 1),
    new Producto(4, "Hechicero", 12000, "Cedro", 2),
    new Producto(5, "Sabio", 8000, "Cedro", 1),
    new Producto(6, "Guardia", 10000, "Cedro", 1),
    new Producto(7, "Rey", 10000, "Fresno", 1),
    new Producto(8, "Reina", 10000, "Fresno", 1),
    new Producto(9, "Escudera", 12000, "Cedro", 1),
    new Producto(10, "Caballero", 18000, "Fresno", 1),
    new Producto(11, "Caballero II", 18000, "Fresno", 1),
    new Producto(12, "Hechicero II", 12000, "Fresno", 1),

];


function iniciarPrograma() {
    cargarCarritoDesdeLocalStorage();
}

document.addEventListener('DOMContentLoaded', function() {
    actualizarInformacionEnDOM();
    agregarBotonAlCarrito();
    iniciarPrograma();
});
