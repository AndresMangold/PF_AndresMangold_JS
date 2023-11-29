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
        concatNombreYPrecio += (elemento.numeroPieza + " " + "-- " + elemento.nombre + "\n" + "Precio: $ " + elemento.precio + "    " + "Stock: " + elemento.stock + "\n\n");
    }
    return concatNombreYPrecio;
}


function mostrarCarrito() {
    if (carroDeCompras.length === 0) {
        Swal.fire({
            title: 'Carrito Vacío',
            text: 'Su carrito de compras está vacío.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } else {
        let carritoTexto = "<div style='text-align: left;'>Productos en su carrito:<br/><br/>";

        for (const producto of carroDeCompras) {
            carritoTexto += producto.nombre + " -- $" + producto.precio + "<br/>";
        }

        const totalPrecio = carroDeCompras.reduce((total, producto) => total + producto.precio, 0);
        const iva = productoFinalIva(totalPrecio);
        const precioFinal = totalPrecio + iva;

        carritoTexto += "<br/>Total: $" + totalPrecio + "<br/>";
        carritoTexto += "IVA (21%): $" + iva + "<br/>";
        carritoTexto += "<strong>Precio Final Total: $" + precioFinal + "</strong></div>"; 

        Swal.fire({
            title: 'Resumen de la Compra',
            html: carritoTexto,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Quitar ítem',
            cancelButtonText: 'Continuar',
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-success',
            }
        }).then((result) => {
            if (result.value) {
                quitarArticuloCarrito();
            } else {
                Swal.fire({
                    title: '¿Desea terminar la compra?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    cancelButtonText: 'No'
                }).then((result) => {
                    if (result.value) {
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "¡Muchas Gracias por su compra!",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        carroDeCompras = [];
                        guardarCarritoEnLocalStorage();
                    }
                });
            }
        });
    }
}





function mostrarEliminarProducto() {
    return new Promise((resolve, reject) => {
        const cantidadInput = document.createElement('input');
        cantidadInput.type = 'number';
        cantidadInput.placeholder = 'Ingrese la cantidad';
        cantidadInput.min = '1';

        const content = document.createElement('div');
        content.appendChild(document.createTextNode('¿Cuántos productos desea eliminar?'));
        content.appendChild(document.createElement('br'));
        content.appendChild(productosEnCarrito(carroDeCompras));
        content.appendChild(document.createElement('br'));
        content.appendChild(cantidadInput);

        Swal.fire({
            title: 'Eliminar Producto',
            html: content,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const cantidad = cantidadInput.value;
                return new Promise((resolve) => {
                    setTimeout(() => {
                        if (isNaN(cantidad) || cantidad <= 0) {
                            Swal.showValidationMessage('Por favor, ingrese una cantidad válida');
                        } else {
                            resolve(cantidad);
                        }
                    }, 500);
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(parseInt(result.value));
            } else {
                reject(new Error('Operación cancelada'));
            }
        });
    });
}



function quitarArticuloCarrito() {
    function eliminarProducto(index) {
        const devolverArticulo = carroDeCompras.splice(index, 1)[0];
        productosDisponibles[devolverArticulo.numeroPieza - 1].stock++;

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Producto eliminado con éxito',
            showConfirmButton: false,
            timer: 1500
        });

        guardarCarritoEnLocalStorage();
        mostrarCarrito();
    }

    let salir = false;
    while (!salir) {
        productosEnCarrito(carroDeCompras);

        const articulo = prompt("¿Cuántos productos desea eliminar?:\n" + productosEnCarrito(carroDeCompras));
        if (articulo === null) {
            salir = true;
        } else {
            const index = parseInt(articulo) - 1;

            if (!isNaN(index) && index >= 0 && index < carroDeCompras.length) {
                eliminarProducto(index);
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Por favor, ingresa una opción válida',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    }

    if (!salir) {  
        mostrarCarrito();
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
                botonElement.className = 'btn btn-success btn-carrito d-block mx-auto my-3';
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
        Toastify({
            text: "¡Producto añadido con éxito!",
            duration: 3000,
            destination: "https://github.com/apvarun/toastify-js",
            newWindow: true,
            close: true,
            gravity: "top", 
            position: "right",
            stopOnFocus: true, 
            style: {
                background: "linear-gradient(to right, #30c622, #2e8a34",
            },
            onClick: function () { } 
        }).showToast();

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

document.addEventListener('DOMContentLoaded', function () {
    actualizarInformacionEnDOM();
    agregarBotonAlCarrito();
    iniciarPrograma();
});
