"use client";

// React
import { useState } from "react";

// Components
import { ActivityLineChart } from "@/components/activity-line-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Edit,
  FolderOpen,
  Loader2,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";

// Utils
import { apiService, type Dataset } from "@/lib/api";

interface DatasetActionsSheetProps {
  dataset: Dataset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Action = "view" | "update";

export function DatasetActionsSheet({
  dataset,
  open,
  onOpenChange,
  onSuccess,
}: DatasetActionsSheetProps) {
  const [action, setAction] = useState<Action>("view");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(dataset?.name || "");
  const [description, setDescription] = useState(dataset?.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataset) return;

    if (!name.trim()) {
      setError("Please enter a dataset name");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim() || "");

      if (file) {
        formData.append("dataset", file);
      }

      const result = await apiService.updateDataset(dataset.id, formData);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onSuccess();
          resetForm();
          setAction("view");
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update dataset");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!dataset) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiService.deleteDataset(dataset.name);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete dataset");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDownload = async () => {
    if (!dataset) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiService.downloadDataset(dataset.id);
      const blob = new Blob([response.data], { type: response.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = dataset.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess("Dataset downloaded successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download dataset"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setName(dataset?.name || "");
    setDescription(dataset?.description || "");
    setError("");
    setSuccess("");
    setLoading(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      resetForm();
      setAction("view");
    }
    onOpenChange(newOpen);
  };

  if (!dataset) return null;

  const renderContent = () => {
    switch (action) {
      case "update":
        return (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataset-file">
                Update Dataset File (optional)
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  id="dataset-file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="dataset-file" className="cursor-pointer">
                  <div className="space-y-2">
                    <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium text-primary hover:underline">
                        Click to select a new file
                      </span>
                      <p className="text-muted-foreground mt-1">
                        Current file: {dataset.name}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Dataset Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter dataset name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the dataset"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAction("view")}
                className="mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Update Dataset
                  </>
                )}
              </Button>
            </div>
          </form>
        );

      case "view":
      default:
        return (
          <div className="flex flex-col h-full space-y-4">
            {/* Dataset Statistics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Format</div>
                <div className="font-medium">{dataset.type.toUpperCase()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Size</div>
                <div className="font-medium">{dataset.size}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Created</div>
                <div className="font-medium">
                  {new Date(dataset.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Last Updated</div>
                <div className="font-medium">
                  {new Date(dataset.lastUpdated).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Activity Graph */}
            <ActivityLineChart data={dataset.activityData} />

            {/* Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleDownload();
                  }}
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Dataset
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setAction("update")}
                  disabled={loading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Update Dataset
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Dataset
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="overflow-y-auto flex flex-col">
          <SheetHeader>
            <SheetTitle>
              {action === "update" ? `Update ${dataset.name}` : dataset.name}
            </SheetTitle>
            <SheetDescription>
              {action === "update"
                ? "Update your dataset information"
                : dataset.description}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="break-all">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {renderContent()}
          </div>

          {action === "view" && (
            <SheetFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
                autoFocus={true}
              >
                Close
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Dataset
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{dataset.name}</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
