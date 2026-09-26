# AegisContractGuard - OpenAPI v2 Target Grounded Specifications

Direktori ini memuat grounded target schema (`openapi_v2.json`) yang digunakan oleh **AegisContractGuard** untuk mendeteksi, mengaudit, dan memicu mekanisme *closed-loop auto-healing* terhadap *API contract drift*.

---

## 1. Ringkasan Breaking Changes (v1 -> v2)

API State v2 memperkenalkan dua perubahan signifikan yang merusak kompatibilitas mundur (*backward compatibility*):

| Kategori Drift | Detail Perubahan di v1 | Detail Perubahan di v2 | Dampak pada Client v1 |
| :--- | :--- | :--- | :--- |
| **Response Schema Drift** | Field `id` berupa `integer` (contoh: `101`) | Field `id` digantikan oleh `account_id` berupa `string` (contoh: `"acc_101"`) | Client v1 mengalami `TypeError` atau `undefined` saat membaca `user.id`, dan gagal validasi runtime / test assertion. |
| **Transport Protocol Drift** | Header `x-api-version` tidak diwajibkan / opsional | Header `x-api-version: 2.0` diwajibkan (*mandatory*) | Client v1 menerima status HTTP `400 Bad Request` dengan error payload `{"detail": "Missing mandatory header: x-api-version"}`. |

---

## 2. Struktur Endpoint Target v2

### `GET /users/{user_id}`
- **Request Headers**:
  - `x-api-version: 2.0` (**Mandatory**)
- **Path Parameter**:
  - `user_id`: string (menerima ID numerik seperti `"101"` atau ID beralias `"acc_101"`)
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "account_id": "acc_101",
    "user_name": "johndoe",
    "email": "john@example.com",
    "status": "active"
  }
  ```
- **Error Response jika Header Hilang (HTTP 400 Bad Request)**:
  ```json
  {
    "detail": "Missing mandatory header: x-api-version"
  }
  ```

---

## 3. Cara Mengekspor Ulang Spesifikasi dari FastAPI
Jika ada pembaruan pada model Pydantic di `backend/app/main_v2.py`, jalankan skrip generator:

```bash
python3 backend/generate_openapi.py
```

Skrip ini akan menginspeksi metadata FastAPI dan mengekspor schema terstandarisasi OpenAPI 3.1.0 ke berkas `bob-specs/openapi_v2.json`.
