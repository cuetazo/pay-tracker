package com.cuetazo.trackerpay.service

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.*
import org.json.JSONObject

/**
 * Ventana flotante que aparece encima de cualquier app cuando se detecta un
 * yapeo (por accesibilidad o por notificación). Permite editar destinatario
 * y elegir categoría/budget antes de guardar en Supabase.
 *
 * Requiere permiso SYSTEM_ALERT_WINDOW, que el usuario otorga manualmente
 * (Settings.ACTION_MANAGE_OVERLAY_PERMISSION) — pídelo desde el JS con
 * YapeTracker.requestOverlayPermission().
 */
class OverlayService : Service() {

    companion object {
        const val EXTRA_MONTO = "monto"
        const val EXTRA_NOMBRE = "nombre"
        const val EXTRA_CODIGO = "codigo"
        const val EXTRA_TIPO = "tipo"
        private const val TAG = "YAPE_OVERLAY"
    }

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private var categories: List<JSONObject> = emptyList()

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!Settings.canDrawOverlays(this)) {
            Log.w(TAG, "Falta permiso SYSTEM_ALERT_WINDOW, no se puede mostrar el overlay")
            stopSelf()
            return START_NOT_STICKY
        }

        val monto = intent?.getStringExtra(EXTRA_MONTO)
        val nombre = intent?.getStringExtra(EXTRA_NOMBRE)
        val codigo = intent?.getStringExtra(EXTRA_CODIGO)
        val tipo = intent?.getStringExtra(EXTRA_TIPO) ?: "Emitido"

        showOverlay(monto, nombre, codigo, tipo)
        return START_NOT_STICKY
    }

    private fun showOverlay(monto: String?, nombre: String?, codigo: String?, tipo: String) {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val montoInput = EditText(this).apply {
            setText(monto ?: "")
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL
        }
        val nombreInput = EditText(this).apply { setText(nombre ?: "") }
        val categorySpinner = Spinner(this)
        val title = TextView(this).apply {
            text = if (tipo == "Recibido") "Yape recibido" else "Yapeaste"
            textSize = 18f
        }
        val btnConfirm = Button(this).apply { text = "Confirmar" }
        val btnCancel = Button(this).apply { text = "Cancelar" }

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
            setBackgroundColor(0xFFFFFFFF.toInt())
            addView(title)
            addView(TextView(this@OverlayService).apply { text = "Monto (S/):" })
            addView(montoInput)
            addView(TextView(this@OverlayService).apply { text = "Destinatario:" })
            addView(nombreInput)
            addView(TextView(this@OverlayService).apply { text = "Categoría:" })
            addView(categorySpinner)
            addView(LinearLayout(this@OverlayService).apply {
                orientation = LinearLayout.HORIZONTAL
                addView(btnCancel)
                addView(btnConfirm)
            })
        }

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply { gravity = Gravity.CENTER }

        windowManager.addView(layout, params)
        overlayView = layout

        SupabaseApi.fetchCategories(this) { list, err ->
            if (err != null) {
                Log.e(TAG, "Error cargando categorías", err)
                return@fetchCategories
            }
            categories = list ?: emptyList()
            val names = categories.map { it.optString("name") }
            categorySpinner.post {
                categorySpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, names)
            }
        }

        btnCancel.setOnClickListener { removeOverlay() }

        btnConfirm.setOnClickListener {
            val finalMonto = montoInput.text.toString().replace(",", ".").toDoubleOrNull() ?: 0.0
            val finalNombre = nombreInput.text.toString()
            val selectedCategory = categories.getOrNull(categorySpinner.selectedItemPosition)
            val categoryId = selectedCategory?.optString("id")

            SupabaseApi.insertTransaction(
                ctx = this,
                amount = finalMonto,
                destinatary = finalNombre,
                code = codigo,
                type = tipo,
                categoryId = categoryId,
                origin = "yape"
            ) { result, error ->
                if (error != null) {
                    Log.e(TAG, "Error guardando transacción", error)
                } else {
                    Log.d(TAG, "Transacción guardada: $result")
                    if (categoryId != null && selectedCategory != null) {
                        val current = selectedCategory.optDouble("current_spending", 0.0)
                        SupabaseApi.incrementCategorySpending(this, categoryId, finalMonto, current)
                    }
                }
            }
            removeOverlay()
        }
    }

    private fun removeOverlay() {
        overlayView?.let {
            try { windowManager.removeView(it) } catch (e: Exception) { Log.e(TAG, "Error quitando overlay", e) }
        }
        overlayView = null
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlay()
    }
}
