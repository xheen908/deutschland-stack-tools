# API Documentation

## Base URL
`http://localhost:3000/api/v1`

## Endpoints

### POST `/validate`
Validate a single document.

**Form Data Parameters:**
- `file` (Binary): The document to validate (.odt, .ods, .odp, .odf, .pdf)
- `mode` (String, optional): "odf", "pdfua", or "auto". Default: "auto"
- `strict` (Boolean, optional): If true, treats warnings as errors. Default: false

**Response (200 OK):**
Returns a JSON object containing `status`, `detected_format`, `checks`, and `summary`.

---

### POST `/validate/batch`
Validate multiple documents in a single request.

**Form Data Parameters:**
- `files[]` (Binary array): The documents to validate.

**Response (200 OK):**
Returns a JSON object with a summary of `valid`, `invalid`, and `warnings`, along with an array of `results` for each file.

---

### GET `/health`
Health check endpoint for load balancers.

**Response (200 OK):**
Returns the status of the API and validation engines.

---

### GET `/info`
Standards information endpoint.

**Response (200 OK):**
Returns supported standards and legal basis information.
