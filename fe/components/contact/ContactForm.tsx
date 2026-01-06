"use client";

import React, { useState, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SubmissionState = "idle" | "loading" | "success" | "error";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/csv",
];

const initialFormState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export const ContactForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [files, setFiles] = useState<File[]>([]);
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        return;
      }
    }

    setFiles((prev) => {
      const combined = [...prev, ...fileArray];
      if (combined.length > MAX_FILES) {
        setErrorMessage(`Maximum ${MAX_FILES} files allowed`);
        return prev;
      }
      setErrorMessage("");
      return combined;
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Invalid email format";
    if (!form.subject.trim()) return "Subject is required";
    if (!form.message.trim()) return "Message is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmissionState("loading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("subject", form.subject);
      formData.append("message", form.message);

      for (const file of files) {
        formData.append("attachments", file);
      }

      await apiClient.post("/api/contact", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmissionState("success");
      setForm(initialFormState);
      setFiles([]);
    } catch (error) {
      setSubmissionState("error");
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setErrorMessage(
        axiosError.response?.data?.message ??
          "Failed to send message. Please try again."
      );
    }
  };

  if (submissionState === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Thanks!
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          We've received your message and will get back to you soon.
        </p>
        <Button onClick={() => setSubmissionState("idle")} variant="outline">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={handleInputChange}
            disabled={submissionState === "loading"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleInputChange}
            disabled={submissionState === "loading"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          type="text"
          placeholder="How can we help?"
          value={form.subject}
          onChange={handleInputChange}
          disabled={submissionState === "loading"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us more about your question or feedback..."
          value={form.message}
          onChange={handleInputChange}
          disabled={submissionState === "loading"}
          className="flex w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[0.01px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>Attachments (optional)</Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-zinc-200 dark:border-zinc-800 hover:border-primary/50",
            submissionState === "loading" && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            multiple
            onChange={handleFileInputChange}
            disabled={
              submissionState === "loading" || files.length >= MAX_FILES
            }
            className="hidden"
            id="file-upload"
            accept={ALLOWED_FILE_TYPES.join(",")}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Max {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
              >
                <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                  disabled={submissionState === "loading"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={submissionState === "loading"}
      >
        {submissionState === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
};
