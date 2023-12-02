//Simulador de Carrito de compras - Andrés Mangold.-

//Este programa simula el funcionamiento de un carrito de compras de un sitio especializado en venta de esculturas de madera.
//En el mismo, aparecen todos los elementos requeridos según consigna: estructura de datos basada en arrays y objetos, y métodos de array,
//utilización de funciones, condicionales e iteradores, sintaxis avanzada, generación y manipulación del DOM, utilización 
//de librerías (sweetalert y toatify) para eventos, implementación de funciones asincrónicas y el método fetch para consumir 
//una API externa. 



//FUNCIONES:

async function cargarProductosDesdeAPI() {
    try {
        const response = await fetch('https://my-json-server.typicode.com/AndresMangold/DB_AndresMangold_JS/articles');
        if (!response.ok) {
            throw new Error('Error al cargar los productos desde la API');
        }

        const productosDesdeAPI = await response.json();
        return productosDesdeAPI.map(producto => new Producto(producto.numeroPieza, producto.nombre, producto.precio, producto.madera, producto.stock));
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

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

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.tabIndex = '-1';
    modal.role = 'dialog';
    modal.id = 'eliminarProductoModal';

    const modalDialog = document.createElement('div');
    modalDialog.className = 'modal-dialog';
    modalDialog.role = 'document';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';

    const modalTitle = document.createElement('h5');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = 'Eliminar Producto';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'close';
    closeButton.setAttribute('data-dismiss', 'modal');
    closeButton.setAttribute('aria-label', 'Close');

    const closeIcon = document.createElement('span');
    closeIcon.setAttribute('aria-hidden', 'true');
    closeIcon.innerHTML = '&times;';

    closeButton.appendChild(closeIcon);

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    const selectLabel = document.createElement('p');
    selectLabel.textContent = 'Seleccione el producto que desea eliminar:';

    const table = document.createElement('table');
    table.className = 'table';

    const thead = document.createElement('thead');
    const theadRow = document.createElement('tr');

    const th1 = document.createElement('th');
    th1.scope = 'col';
    th1.textContent = '#';

    const th2 = document.createElement('th');
    th2.scope = 'col';
    th2.textContent = 'Nombre';

    const th3 = document.createElement('th');
    th3.scope = 'col';
    th3.textContent = 'Eliminar';

    theadRow.appendChild(th1);
    theadRow.appendChild(th2);
    theadRow.appendChild(th3);

    thead.appendChild(theadRow);

    const tbody = document.createElement('tbody');
    carroDeCompras.forEach((producto, index) => {
        const tr = document.createElement('tr');

        const td1 = document.createElement('th');
        td1.scope = 'row';
        td1.textContent = index + 1;

        const td2 = document.createElement('td');
        td2.textContent = producto.nombre;

        const td3 = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'productoEliminar';
        checkbox.value = index + 1;

        td3.appendChild(checkbox);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    modalBody.appendChild(selectLabel);
    modalBody.appendChild(table);

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.setAttribute('data-dismiss', 'modal');
    cancelButton.textContent = 'Cancelar';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger';
    deleteButton.textContent = 'Eliminar';

    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(deleteButton);

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);

    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);

    document.body.appendChild(modal);

    $('#eliminarProductoModal').modal('show');

    deleteButton.addEventListener('click', function () {
        const checkboxes = document.querySelectorAll('input[name="productoEliminar"]:checked');

        if (checkboxes.length > 0) {
            checkboxes.forEach(checkbox => {
                const index = parseInt(checkbox.value) - 1;
                eliminarProducto(index);
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Por favor, seleccione al menos un producto',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }

        $('#eliminarProductoModal').modal('hide');
    });
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

function abrirSweetAlertCantidad(callback) {
    Swal.fire({
        title: 'Ingrese la cantidad',
        input: 'number',
        inputAttributes: {
            min: 1,
        },
        showCancelButton: true,
        confirmButtonText: 'Añadir al carrito',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: (cantidad) => {
            cantidad = parseInt(cantidad);
            return new Promise((resolve, reject) => {
                if (!isNaN(cantidad) && cantidad > 0) {
                    resolve(cantidad);
                } else {
                    reject('Por favor, ingrese una cantidad válida');
                }
            });
        },
    }).then((result) => {
        if (!result.dismiss) {
            callback(result.value);
        }
    });
}

function añadirAlCarrito(productoIndex) {
    abrirSweetAlertCantidad(function (cantidad) {
        if (cantidad <= productosDisponibles[productoIndex].stock) {
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
    });
}

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carroDeCompras');
    if (carritoGuardado) {
        carroDeCompras = JSON.parse(carritoGuardado);

        for (const productoCarrito of carroDeCompras) {
            const index = productoCarrito.numeroPieza - 1;
            productosDisponibles[index].stock--;
        }
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

let productosDisponibles = [];

async function iniciarPrograma() {
    productosDisponibles = await cargarProductosDesdeAPI();
    cargarCarritoDesdeLocalStorage();
}


document.addEventListener('DOMContentLoaded', async function () {
    await iniciarPrograma();
    actualizarInformacionEnDOM();
    agregarBotonAlCarrito();
    
});
