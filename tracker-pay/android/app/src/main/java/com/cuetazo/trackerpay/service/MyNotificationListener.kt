package com.cuetazo.trackerpay.service

import android.content.Intent
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.cuetazo.trackerpay.model.YapeNotifData

class MyNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "YAPE_NOTIF"
        private const val YAPE_PACKAGE = "com.bcp.innovacxion.yapeapp"
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        // no-op, usamos la sobrecarga con rankingMap
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?, rankingMap: RankingMap?) {
        if (sbn == null) return

        // 🐞 BUG que tenías: comparabas `packageName` (el de TU app) en vez de
        // `sbn.packageName` (el paquete que mandó la notificación). Por eso
        // nunca hacía match con Yape.
        if (sbn.packageName != YAPE_PACKAGE) return

        val extras = sbn.notification.extras
        val bigText = extras.getCharSequence("android.bigText")?.toString()
        val text = extras.getString("android.text")
        val finalText = bigText ?: text ?: return

        Log.d(TAG, "Notificación cruda: '$finalText'")

        val data = parseYapeNotification(finalText)
        Log.d(TAG, "Parseado: $data")

        if (data.codigo.isNullOrBlank()) {
            Log.w(TAG, "Notificación sin código de seguridad detectable, se ignora")
            return
        }

        // dedupe compartido con el AccessibilityService: si ya se procesó por
        // pantalla (o por otra notificación), no lo vuelve a mandar
        if (YapeSessionStore.wasProcessed(this, data.codigo)) {
            Log.d(TAG, "Operación ${data.codigo} ya procesada, se ignora")
            return
        }
        YapeSessionStore.markProcessed(this, data.codigo)

        val intent = Intent(this, OverlayService::class.java).apply {
            putExtra(OverlayService.EXTRA_MONTO, data.monto?.toString())
            putExtra(OverlayService.EXTRA_NOMBRE, data.nombre)
            putExtra(OverlayService.EXTRA_CODIGO, data.codigo)
            putExtra(OverlayService.EXTRA_TIPO, data.tipo)
        }
        startService(intent)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?, rankingMap: RankingMap?) {
        super.onNotificationRemoved(sbn, rankingMap)
    }

    fun parseYapeNotification(text: String): YapeNotifData {
        val nombre = Regex("^(.*?) te envió").find(text)?.groupValues?.get(1)
        val monto = Regex("S/\\s?(\\d+(\\.\\d+)?)").find(text)?.groupValues?.get(1)?.toDoubleOrNull()
        val codigo = Regex("seguridad es:?\\s?(\\d+)").find(text)?.groupValues?.get(1)

        Log.d(TAG, "Regex -> nombre=$nombre monto=$monto codigo=$codigo")

        return YapeNotifData(nombre, monto, codigo, "Recibido")
    }
}
