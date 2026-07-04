package com.cuetazo.trackerpay.yapetracker

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.cuetazo.trackerpay.service.YapeSessionStore
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class YapeTrackerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("YapeTracker")

        // Llamar esto cada vez que cambie la sesión de Supabase en tu authStore
        // (silentSignIn, SignIn, refresh de token).
        Function("setSession") { supabaseUrl: String, anonKey: String, accessToken: String, userId: String ->
            appContext.reactContext?.let { ctx ->
                YapeSessionStore.saveSession(ctx, supabaseUrl, anonKey, accessToken, userId)
            }
        }

        // Llamar en SignOut
        Function("clearSession") {
            appContext.reactContext?.let { ctx ->
                YapeSessionStore.clearSession(ctx)
            }
        }

        Function("hasOverlayPermission") {
            val ctx = appContext.reactContext
            if (ctx != null) Settings.canDrawOverlays(ctx) else false
        }

        Function("requestOverlayPermission") {
            appContext.reactContext?.let { ctx ->
                ctx.startActivity(
                    Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${ctx.packageName}"))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                )
            }
        }

        Function("isAccessibilityServiceEnabled") {
            val ctx = appContext.reactContext
            if (ctx != null) {
                val enabled = Settings.Secure.getString(
                    ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                ) ?: ""
                enabled.contains("${ctx.packageName}/${ctx.packageName}.service.MyAccessibilityService")
            } else {
                false
            }
        }

        Function("openAccessibilitySettings") {
            appContext.reactContext?.let { ctx ->
                ctx.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            }
        }

        Function("isNotificationListenerEnabled") {
            val ctx = appContext.reactContext
            if (ctx != null) {
                val enabled = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners") ?: ""
                enabled.contains(ctx.packageName)
            } else {
                false
            }
        }

        Function("openNotificationListenerSettings") {
            appContext.reactContext?.let { ctx ->
                ctx.startActivity(
                    Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                )
            }
        }
    }
}
