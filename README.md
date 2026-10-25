# @vercy/storage

Official TypeScript/JavaScript SDK and HTTP REST API for **Vercy Cloud Storage**, enabling developers deploying applications on Vercy to upload, manage, and retrieve persistent files with zero-copy performance.

Works seamlessly with **Node.js, Next.js, Express, PHP (Laravel/Symfony/WordPress), Python, and direct cURL**.

---

## Features
* **Blazing Fast**: Backed by NVMe storage and Nginx zero-copy `sendfile`.
* **Automatic WebP Optimization**: Built-in single-core image compression saving up to 98% bandwidth.
* **Responsive Sizing**: On-demand thumbnail (`?size=sm`) and compressed display (`?size=md`) variants.
* **Zero-Downtime Safe**: Files persist across container redeploys and restarts.
* **Public & Private Access (Coming Soon)**: Public edge CDN URLs or temporary HMAC-signed presigned download links.
* **Zero-Config in Vercy**: Automatically reads `VERCY_STORAGE_API_KEY`.
* **Language-Agnostic**: Native TypeScript SDK or standard HTTP `PUT`/`GET`/`DELETE` for PHP, Python, Go, etc.

---

## File Size Limits
* **Images**: Up to **10 MB** (automatically transcodes `_sm.webp` and `_md.webp`)
* **Videos**: Up to **200 MB** (`.mp4`, `.mov`, `.webm`, `.avi`, `.mkv`)
* **All other files**: Up to **100 MB** (`.pdf`, `.zip`, `.csv`, `.docx`, etc.)

---

## JavaScript / TypeScript SDK

### Installation

```bash
npm install @vercy/storage
```

Set your API key in `.env` (or generate it in your Vercy Project Dashboard):
```env
VERCY_STORAGE_API_KEY="vcy_storage_rw_proj_123_abc456..."
```

### 1. Upload a File (`put`)
```typescript
import { put } from '@vercy/storage';
import fs from 'fs';

// Upload from Buffer / File / Stream / String
const fileBuffer = fs.readFileSync('./avatar.png');
const file = await put('avatars/avatar.png', fileBuffer, {
  access: 'public',
  contentType: 'image/png',
});

console.log(file.url);
// Output: https://storage.vercy.fun/avatars/fil609gu9qt369pbbt4kga969fv.png
```

### 2. Responsive Image Sizing URLs
Images uploaded to Vercy Storage support automatic responsive format parameters without changing your code:

```typescript
// 1. Raw original image (full quality, up to 10MB)
const rawUrl = file.url; 

// 2. Fast thumbnail for avatars, tables, and grids (~6 KB, 98% smaller)
const thumbUrl = `${file.url}?size=sm`;

// 3. Web-optimized compressed display (~37 KB, 87% smaller)
const webpUrl = `${file.url}?size=md`;
```

### 3. Delete a File (`del`)
```typescript
import { del } from '@vercy/storage';

// Delete by URL or Pathname (single or array)
await del('https://storage.vercy.fun/avatars/fil609gu9qt369pbbt4kga969fv.png');
await del(['avatars/pic1.png', 'avatars/pic2.png']);
```

### 4. Fetch File Metadata (`head`)
```typescript
import { head } from '@vercy/storage';

const file = await head('avatars/fil609gu9qt369pbbt4kga969fv.png');
console.log(file.size, file.contentType, file.originalFilename);
```

### 5. Private Files & Presigned Download Links (`getDownloadUrl`) (Coming Soon)
For sensitive documents (invoices, legal PDFs, private exports):

> **Note**: Private file access and presigned HMAC download URLs are currently in active development and coming soon.

```typescript
import { put, getDownloadUrl } from '@vercy/storage';

// 1. Upload with private access
const doc = await put('invoices/inv_102.pdf', pdfBuffer, {
  access: 'private',
});

// 2. Generate a temporary 15-minute download link
const { downloadUrl, expiresAt } = await getDownloadUrl(doc.pathname, {
  expiresIn: 900, // 15 minutes (in seconds)
});

console.log('Download link:', downloadUrl);
```

---

## PHP Integration (Laravel, WordPress, or Vanilla PHP)

PHP applications can upload directly to Vercy Cloud Storage using standard HTTP requests with zero external packages.

### Method A: Using PHP cURL (Recommended)

```php
<?php
$apiKey = getenv('VERCY_STORAGE_API_KEY');
$filePath = '/path/to/profile.png';
$fileData = file_get_contents($filePath);

$ch = curl_init('https://vercy.fun/api/v1/storage');
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => 'PUT',
    CURLOPT_POSTFIELDS    => $fileData,
    CURLOPT_HTTPHEADER    => [
        "Authorization: Bearer {$apiKey}",
        "x-pathname: avatars/profile.png",
        "x-access: public",
        "Content-Type: image/png",
        "Content-Length: " . strlen($fileData),
    ],
    CURLOPT_RETURNTRANSFER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $result = json_decode($response, true);
    echo "Public URL: " . $result['url'] . "\n";
    echo "Thumbnail: "  . $result['url'] . "?size=sm\n";
    echo "WebP Display: " . $result['url'] . "?size=md\n";
} else {
    echo "Upload failed with HTTP {$httpCode}: {$response}\n";
}
```

### Method B: Using `file_get_contents` (No cURL extension needed)

```php
<?php
$apiKey   = getenv('VERCY_STORAGE_API_KEY');
$fileData = file_get_contents('./document.pdf');

$options = [
    'http' => [
        'method'  => 'PUT',
        'header'  => [
            "Authorization: Bearer {$apiKey}",
            "x-pathname: documents/contract.pdf",
            "x-access: public",
            "Content-Type: application/pdf",
            "Content-Length: " . strlen($fileData),
        ],
        'content' => $fileData,
        'ignore_errors' => true,
    ],
];

$context  = stream_context_create($options);
$response = file_get_contents('https://vercy.fun/api/v1/storage', false, $context);
$result   = json_decode($response, true);

echo "Uploaded: " . $result['url'];
```

---

## Direct HTTP / cURL API

You can upload files from bash scripts, Docker containers, or any programming language:

```bash
# Upload a file via HTTP PUT
curl -X PUT "https://vercy.fun/api/v1/storage" \
  -H "Authorization: Bearer $VERCY_STORAGE_API_KEY" \
  -H "x-pathname: avatars/avatar.png" \
  -H "x-access: public" \
  -H "Content-Type: image/png" \
  --data-binary "@./avatar.png"
```

### API Headers Reference:
| Header | Description | Default |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <VERCY_STORAGE_API_KEY>` | **Required** |
| `x-pathname` | Destination pathname (e.g. `avatars/avatar.png`) | `file` |
| `x-folder` | Optional 1-level alphanumeric folder name | (none) |
| `x-access` | `public` or `private` (Coming Soon) | `public` |
| `Content-Type` | MIME type (`image/png`, `application/pdf`, etc.) | inferred |

---

## License
MIT © Vercy Cloud