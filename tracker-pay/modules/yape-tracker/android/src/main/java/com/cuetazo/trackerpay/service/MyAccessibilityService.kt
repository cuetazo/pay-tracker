package com.cuetazo.trackerpay.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.cuetazo.trackerpay.model.YapeTransaction

class MyAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "YAPE_ACCESSIBILITY"
        private const val YAPE_PACKAGE = "com.bcp.innovacxion.yapeapp"
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (event.packageName != YAPE_PACKAGE) return
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val rootNode = rootInActiveWindow ?: return

        val texts = mutableListOf<String>()
        collectTexts(rootNode, texts)

        // 🔍 Filtro logcat: YAPE_ACCESSIBILITY
        // Deja esto prendido la primera vez que hagas un yapeo real: te muestra
        // TODO el texto de la pantalla en orden, con su índice. Con eso ajustas
        // los índices/regex de extractYapeData si Yape cambia el layout.
        Log.d(TAG, "==== Texto de pantalla (${texts.size} nodos) ====")
        texts.forEachIndexed { i, t -> Log.d(TAG, "[$i] '$t'") }
        logNodeTree(rootNode) // árbol completo con resourceId, útil para apuntar por id en vez de por posición

        if (!texts.contains("¡Yapeaste!")) return

        val data = extractYapeData(texts)
        Log.d(TAG, "Parsed transaction: $data")

        if (data.codigo.isNullOrBlank()) {
            Log.w(TAG, "No se pudo extraer el código de seguridad, se descarta (evita duplicados sin control)")
            return
        }

        if (YapeSessionStore.wasProcessed(this, data.codigo!!)) {
            Log.d(TAG, "Operación ${data.codigo} ya fue procesada, se ignora")
            return
        }
        YapeSessionStore.markProcessed(this, data.codigo!!)

        // En vez de mandarlo directo, mostramos la ventana flotante para confirmar/editar
        val intent = Intent(this, OverlayService::class.java).apply {
            putExtra(OverlayService.EXTRA_MONTO, data.monto)
            putExtra(OverlayService.EXTRA_NOMBRE, data.nombre)
            putExtra(OverlayService.EXTRA_CODIGO, data.codigo)
            putExtra(OverlayService.EXTRA_TIPO, data.tipo ?: "Emitido")
        }
        startService(intent)
    }

    override fun onInterrupt() {}

    private fun logNodeTree(node: AccessibilityNodeInfo, depth: Int = 0) {
        val indent = "  ".repeat(depth)
        Log.d(TAG, "$indent[${node.className}] id=${node.viewIdResourceName} text='${node.text}'")
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { logNodeTree(it, depth + 1) }
        }
    }

    private fun collectTexts(node: AccessibilityNodeInfo, list: MutableList<String>) {
        node.text?.toString()?.let { if (it.isNotBlank()) list.add(it) }
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { collectTexts(it, list) }
        }
    }

    /**
     * Heurística sobre la pantalla "¡Yapeaste!". Como Yape no expone resource-id
     * estables en todas las versiones, seguimos yendo por texto, pero ahora:
     *  - también capturamos "S/123.45" pegado (antes solo agarraba "S/" suelto
     *    seguido de otro nodo, que es lo que probablemente estaba fallando)
     *  - todo queda logueado arriba para poder ajustar esto sin adivinar
     */
    private fun extractYapeData(texts: List<String>): YapeTransaction {
        val data = YapeTransaction()

        for (i in texts.indices) {
            val text = texts[i]
            when {
                text == "S/" && i + 1 < texts.size -> data.monto = texts[i + 1]
                Regex("^S/\\s?\\d").containsMatchIn(text) -> data.monto = text.replace("S/", "").trim()
                text.contains("*") && data.nombre == null -> data.nombre = text
                text.matches(Regex("\\d{6,}")) -> data.codigo = text
            }
        }
        return data
    }
}
