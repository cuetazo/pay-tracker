package com.cuetazo.trackerpay.service

import android.content.Context

/**
 * Guarda, del lado nativo, lo mínimo que el servicio en 2do plano necesita
 * para funcionar sin depender de que la app esté abierta:
 *  - sesión de supabase (url, anon key, access token, userId) -> la sube el
 *    authStore de RN cada vez que cambia la sesión.
 *  - set de "códigos de seguridad" ya procesados, para no duplicar transacciones
 *    aunque el AccessibilityService dispare el evento varias veces o llegue
 *    también la notificación push del mismo yapeo.
 */
object YapeSessionStore {
    private const val PREFS = "yape_tracker_prefs"
    private const val KEY_PROCESSED_CODES = "processed_codes"
    private const val KEY_ACCESS_TOKEN = "supabase_access_token"
    private const val KEY_USER_ID = "supabase_user_id"
    private const val KEY_SUPABASE_URL = "supabase_url"
    private const val KEY_SUPABASE_ANON_KEY = "supabase_anon_key"
    private const val MAX_STORED_CODES = 300

    private fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun wasProcessed(ctx: Context, codigo: String): Boolean {
        val set = prefs(ctx).getStringSet(KEY_PROCESSED_CODES, emptySet()) ?: emptySet()
        return set.contains(codigo)
    }

    fun markProcessed(ctx: Context, codigo: String) {
        val p = prefs(ctx)
        val set = (p.getStringSet(KEY_PROCESSED_CODES, emptySet()) ?: emptySet()).toMutableSet()
        set.add(codigo)
        val trimmed = if (set.size > MAX_STORED_CODES) set.toList().takeLast(MAX_STORED_CODES).toSet() else set
        p.edit().putStringSet(KEY_PROCESSED_CODES, trimmed).apply()
    }

    fun saveSession(ctx: Context, url: String, anonKey: String, accessToken: String, userId: String) {
        prefs(ctx).edit()
            .putString(KEY_SUPABASE_URL, url)
            .putString(KEY_SUPABASE_ANON_KEY, anonKey)
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_USER_ID, userId)
            .apply()
    }

    fun clearSession(ctx: Context) {
        prefs(ctx).edit()
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_USER_ID)
            .apply()
    }

    fun getSupabaseUrl(ctx: Context) = prefs(ctx).getString(KEY_SUPABASE_URL, null)
    fun getAnonKey(ctx: Context) = prefs(ctx).getString(KEY_SUPABASE_ANON_KEY, null)
    fun getAccessToken(ctx: Context) = prefs(ctx).getString(KEY_ACCESS_TOKEN, null)
    fun getUserId(ctx: Context) = prefs(ctx).getString(KEY_USER_ID, null)
}
