# @vercy/storage

Official TypeScript/JavaScript SDK for **Vercy Cloud Storage**, enabling developers deploying applications on Vercy to upload, manage, and retrieve persistent files with zero-copy performance.

---

## Features
* 🚀 **Blazing Fast**: Backed by NVMe storage and Nginx zero-copy `sendfile`.
* 🛡️ **Zero-Downtime Safe**: Files persist across container redeploys and restarts.
* 🔐 **Public & Private Access**: Public CDN URLs or temporary HMAC-signed presigned download links.
* 📦 **Zero-Config in Vercy**: Automatically reads `VERCY_STORAGE_API_KEY`.
* 🪶 **Lightweight**: Zero external dependencies, pure native `fetch`.

---

## Installation

```bash
npm install @vercy/storage
```

Or if you encounter peer dependency conflicts:

```bash
npm install @vercy/storage --legacy-peer-deps
```

---

## Quickstart

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
const file = await put('avatars/john.png', fileBuffer, {
  access: 'public',
  contentType: 'image/png',
});

console.log(file.url);
// Output: https://storage.vercy.fun/proj_123/avatars/john-a8f9c2.png
```

### 2. Delete a File (`del`)
```typescript
import { del } from '@vercy/storage';

// Delete by URL or Pathname (single or array)
await del('https://storage.vercy.fun/proj_123/avatars/john-a8f9c2.png');
await del(['avatars/pic1.png', 'avatars/pic2.png']);
```

### 3. List Files (`list`)
```typescript
import { list } from '@vercy/storage';

const { files, hasMore, cursor } = await list({
  prefix: 'avatars/',
  limit: 20,
});

for (const f of files) {
  console.log(`${f.pathname} (${f.size} bytes) -> ${f.url}`);
}
```

### 4. Private Files & Presigned Download Links (`getDownloadUrl`)
For sensitive documents (invoices, legal PDFs, private exports):

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

## Usage with Next.js (App Router)

### Server Action / Route Handler:
```typescript
// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercy/storage';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: 'public',
  });

  return NextResponse.json(blob);
}
```

---

## License
MIT © Vercy Cloud