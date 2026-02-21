---
name: gcs-video-upload
description: Use when the user needs to upload, manage, or configure private video storage in Google Cloud Storage (GCS) for the Baxtli Men platform.
---

# GCS Video Upload Skill

## Overview
This skill defines the standard procedure for managing private video uploads to the `antigravity-videos-yoga` bucket. It uses **Signed Resumable URLs** to ensure secure, high-performance direct-to-cloud transfers without overloading the application server.

## Workflow

### 1. Upload Initialization
Direct-to-cloud uploads MUST happen through the backend `/api/admin/videos/upload-url` endpoint to maintain security.
- **Request**: FileName and ContentType.
- **Response**: Signed PUT URL from GCS.

### 2. Client-Side Transfer
The client uses the signed URL to perform a standard `PUT` request.
- **Header**: `Content-Type` must match the original request.
- **Progress**: Use `XMLHttpRequest.upload` to track progress for large files.

### 3. File Naming Convention
All video files should be prefixed with a timestamp or unique hash to avoid collisions:
- `[timestamp]-[slugified-filename].mp4`

## Implementation Details

### Configuration
Verify `.env` contains:
- `GCS_UPLOAD_BUCKET="antigravity-videos-yoga"`

### Signed URL Constraints
- **Action**: `resumable` (for large files) or `write`.
- **Expiry**: Default to 60 minutes for uploads.
- **Security**: Endpoint MUST be guarded by `getLocalUser()` and `ADMIN` role checks.

## Common Pitfalls
- **CORS Errors**: The GCS bucket must have CORS configuration to allow `PUT` from the app domain.
- **Expiry**: If the upload takes longer than the signed URL expiry, it will fail.
- **Payload Limits**: Ensure the server-side JSON body limit is sufficient if sending metadata (default is usually 1MB).

## Performance Optimization
Always use **Resumable Uploads** via the `resumable: true` or `action: 'resumable'` options in the GCS Node.js SDK for files > 10MB.
