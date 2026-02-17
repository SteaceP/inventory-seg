import { getUser } from "../auth";
import { createResponse } from "../helpers";

import type { Env } from "../types";

/**
 * Handle image upload to Cloudflare R2
 * POST /api/storage/upload
 */
export async function handleStorageUpload(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const user = await getUser(request, env);
    if (!user) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucketName = formData.get("bucket");
    const fileName = formData.get("fileName");

    if (!file || !bucketName || !fileName) {
      return createResponse(
        { error: "Missing required fields (file, bucket, fileName)" },
        400,
        env,
        request
      );
    }

    let folderPrefix = "";
    if (bucketName === "inventory-images") {
      folderPrefix = "inventory-images/";
    } else if (bucketName === "appliance-images") {
      folderPrefix = "appliance-images/";
    } else if (bucketName === "avatars") {
      folderPrefix = "avatars/";
    } else {
      return createResponse(
        { error: "Invalid bucket name" },
        400,
        env,
        request
      );
    }

    const fullPath = `${folderPrefix}${fileName}`;

    // Upload to consolidated R2 bucket
    const arrayBuffer = await file.arrayBuffer();
    await env.SEG_INVENTORY_DATA.put(fullPath, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Generate the public URL using the user's provided domain
    const publicUrl = `https://inv-seg-data.coderage.pro/${fullPath}`;

    return createResponse(
      { success: true, url: publicUrl, filePath: fullPath },
      201,
      env,
      request
    );
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}

/**
 * Handle serving images from R2
 * GET /storage/:bucket/:file
 */
export async function handleStorageGet(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const bucketName = pathParts[2];
    const fileName = pathParts[3];

    if (!bucketName || !fileName) {
      return new Response("Not Found", { status: 404 });
    }

    let folderPrefix = "";
    if (bucketName === "inventory-images") {
      folderPrefix = "inventory-images/";
    } else if (bucketName === "appliance-images") {
      folderPrefix = "appliance-images/";
    } else if (bucketName === "avatars") {
      folderPrefix = "avatars/";
    } else {
      return new Response("Not Found", { status: 404 });
    }

    const fullPath = `${folderPrefix}${fileName}`;
    const object = await env.SEG_INVENTORY_DATA.get(fullPath);

    if (object === null) {
      return new Response("Object Not Found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000"); // 1 year cache

    return new Response(object.body, {
      headers,
    });
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}
