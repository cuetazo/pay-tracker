package com.cuetazo.trackerpay.model

data class YapeTransaction(
    var monto: String? = null,
    var nombre: String? = null,
    var codigo: String? = null,
    var tipo: String? = "Emitido"
)
