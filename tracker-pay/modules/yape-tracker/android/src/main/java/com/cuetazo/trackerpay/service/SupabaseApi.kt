package com.cuetazo.trackerpay.service

import android.content.Context
import android.util.Log
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

/**
 * Reemplaza a MyWebhookClient/webhook.kt: en vez de mandar a Google Sheets,
 * pega directo a la REST API de Supabase (PostgREST) usando el access_token
 * de la sesión que el authStore (RN) sube al lado nativo.
 */
object SupabaseApi {
    private const val TAG = "YAPE_SUPABASE"
    private val client = OkHttpClient()

    private fun headers(ctx: Context, prefer: String = "return=representation"): Headers {
        val anon = YapeSessionStore.getAnonKey(ctx) ?: ""
        val token = YapeSessionStore.getAccessToken(ctx) ?: anon
        return Headers.Builder()
            .add("apikey", anon)
            .add("Authorization", "Bearer $token")
            .add("Content-Type", "application/json")
            .add("Prefer", prefer)
            .build()
    }

    fun insertTransaction(
        ctx: Context,
        amount: Double,
        destinatary: String?,
        code: String?,
        type: String,
        categoryId: String?,
        origin: String,
        callback: (JSONObject?, Exception?) -> Unit
    ) {
        val baseUrl = YapeSessionStore.getSupabaseUrl(ctx)
        val userId = YapeSessionStore.getUserId(ctx)
        if (baseUrl == null || userId == null) {
            callback(null, Exception("No hay sesión de Supabase guardada. Abre la app e inicia sesión primero."))
            return
        }

        val body = JSONObject().apply {
            put("amount", amount)
            put("destinatary", destinatary)
            put("code", code)
            put("type", type)
            put("origin", origin)
            put("userId", userId)
            if (categoryId != null) put("categoryId", categoryId)
        }

        Log.d(TAG, "POST transactions -> $body")

        val request = Request.Builder()
            .url("$baseUrl/rest/v1/transactions")
            .headers(headers(ctx))
            .post(body.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Error insertando transacción", e)
                callback(null, e)
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    val raw = it.body?.string()
                    if (it.isSuccessful) {
                        val arr = JSONArray(raw ?: "[]")
                        Log.d(TAG, "Transacción guardada: $raw")
                        callback(if (arr.length() > 0) arr.getJSONObject(0) else null, null)
                    } else {
                        Log.e(TAG, "Supabase error ${it.code}: $raw")
                        callback(null, Exception("Supabase error ${it.code}: $raw"))
                    }
                }
            }
        })
    }

    fun fetchCategories(ctx: Context, callback: (List<JSONObject>?, Exception?) -> Unit) {
        val baseUrl = YapeSessionStore.getSupabaseUrl(ctx)
        val userId = YapeSessionStore.getUserId(ctx)
        if (baseUrl == null || userId == null) {
            callback(null, Exception("No hay sesión activa"))
            return
        }
        val request = Request.Builder()
            .url("$baseUrl/rest/v1/category?userId=eq.$userId&select=id,name,icon,color,current_spending,limit_amount")
            .headers(headers(ctx))
            .get()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Error cargando categorías", e)
                callback(null, e)
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    val raw = it.body?.string()
                    if (!it.isSuccessful) {
                        callback(null, Exception("Supabase error ${it.code}: $raw"))
                        return
                    }
                    val arr = JSONArray(raw ?: "[]")
                    val list = (0 until arr.length()).map { i -> arr.getJSONObject(i) }
                    callback(list, null)
                }
            }
        })
    }

    /**
     * Suma `amount` al current_spending de la categoría.
     * OJO: esto es GET (ya lo tienes en memoria) + PATCH, no es atómico.
     * Si vas a tener varios yapeos casi simultáneos, mejor crea una función
     * RPC en Postgres (ej. increment_category_spending(cat_id, delta)) y
     * llámala vía POST a /rest/v1/rpc/increment_category_spending.
     */
    fun incrementCategorySpending(ctx: Context, categoryId: String, amount: Double, current: Double) {
        val baseUrl = YapeSessionStore.getSupabaseUrl(ctx) ?: return
        val newValue = current + amount
        val body = JSONObject().put("current_spending", newValue)

        val request = Request.Builder()
            .url("$baseUrl/rest/v1/category?id=eq.$categoryId")
            .headers(headers(ctx, prefer = "return=minimal"))
            .patch(body.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Error actualizando categoría", e)
            }

            override fun onResponse(call: Call, response: Response) {
                response.close()
            }
        })
    }
}
