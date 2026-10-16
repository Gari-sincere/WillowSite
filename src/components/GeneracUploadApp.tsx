import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

function formatBytes(size: number | null) {
  if (size === null) {
    return "Unknown size";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadedAt(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function GeneracUploadForm() {
  const uploads = useQuery(api.generacUploads.list);
  const generateUploadUrl = useMutation(api.generacUploads.generateUploadUrl);
  const saveUpload = useMutation(api.generacUploads.save);
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setStatus("idle");
    setMessage("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedFile === null) {
      return;
    }

    setStatus("uploading");
    setMessage(`Uploading ${selectedFile.name}…`);

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type || "application/octet-stream" },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error(`Upload failed with status ${result.status}`);
      }

      const payload: unknown = await result.json();
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("storageId" in payload) ||
        typeof payload.storageId !== "string"
      ) {
        throw new Error("Convex did not return a storage id");
      }

      await saveUpload({
        storageId: payload.storageId as Id<"_storage">,
        filename: selectedFile.name,
      });

      setSelectedFile(null);
      if (fileInput.current) {
        fileInput.current.value = "";
      }
      setStatus("success");
      setMessage("File uploaded to Convex.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-forest/15 bg-white/70 p-6 shadow-sm sm:p-8"
      >
        <label className="block text-sm font-medium text-forest/80" htmlFor="generac-file">
          Choose a file
        </label>
        <input
          id="generac-file"
          ref={fileInput}
          type="file"
          onChange={onFileChange}
          className="mt-3 block w-full rounded-xl border border-forest/20 bg-cream px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream hover:file:bg-forest-deep"
        />

        {selectedFile && (
          <p className="mt-3 text-sm text-forest/70">
            Selected: <span className="font-medium text-forest">{selectedFile.name}</span>{" "}
            ({formatBytes(selectedFile.size)})
          </p>
        )}

        <button
          type="submit"
          disabled={selectedFile === null || status === "uploading"}
          className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : "Upload to Convex"}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm ${status === "error" ? "text-red-700" : "text-forest/80"}`}
            role="status"
          >
            {message}
          </p>
        )}
      </form>

      <section>
        <h2 className="text-xl font-medium tracking-tight">Recent uploads</h2>
        <ul className="mt-4 divide-y divide-forest/15 rounded-2xl border border-forest/15 bg-white/70">
          {uploads === undefined ? (
            <li className="px-6 py-5 text-sm text-forest/70">Loading…</li>
          ) : uploads.length === 0 ? (
            <li className="px-6 py-5 text-sm text-forest/70">No files uploaded yet.</li>
          ) : (
            uploads.map((upload) => (
              <li key={upload._id} className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{upload.filename}</p>
                  <p className="mt-1 text-sm text-forest/70">
                    {formatBytes(upload.size)}
                    {upload.contentType ? ` · ${upload.contentType}` : ""}
                    {` · ${formatUploadedAt(upload._creationTime)}`}
                  </p>
                </div>
                {upload.url ? (
                  <a
                    href={upload.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold underline underline-offset-4 hover:text-forest-deep"
                  >
                    Open file
                  </a>
                ) : (
                  <span className="text-sm text-forest/50">Unavailable</span>
                )}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

export default function GeneracUploadApp() {
  return (
    <ConvexProvider client={convex}>
      <GeneracUploadForm />
    </ConvexProvider>
  );
}
