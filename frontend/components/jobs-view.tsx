"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Eye, Plus, Settings, Briefcase } from "lucide-react";
import { apiService, type Job } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

export function JobsView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoApprovalEmails, setAutoApprovalEmails] = useState<string[]>([
    "trusted@organic.coop",
    "researcher@university.edu",
  ]);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobs();
      setJobs(response.jobs);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const addAutoApprovalEmail = () => {
    if (newEmail && !autoApprovalEmails.includes(newEmail)) {
      setAutoApprovalEmails([...autoApprovalEmails, newEmail]);
      setNewEmail("");
    }
  };

  const removeAutoApprovalEmail = (email: string) => {
    setAutoApprovalEmails(autoApprovalEmails.filter((e) => e !== email));
  };

  const handleJobAction = (jobId: number, action: "approve" | "deny") => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? { ...job, status: action === "approve" ? "approved" : "denied" }
          : job
      )
    );
  };

  const getJobsByStatus = (status: Job["status"]) => {
    return jobs.filter((job) => job.status === status);
  };

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "pending":
        return "border-yellow-200 bg-yellow-50 text-yellow-600 dark:border-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30";
      case "approved":
        return "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30";
      case "denied":
        return "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">
          Manage data access requests and research projects
        </p>
      </div>

      {/* Auto-approval Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Auto-approval Settings
          </CardTitle>
          <CardDescription>
            Automatically approve requests from trusted email addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="email">Add trusted email</Label>
              <Input
                id="email"
                type="email"
                placeholder="researcher@university.edu"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAutoApprovalEmail()}
              />
            </div>
            <Button onClick={addAutoApprovalEmail} className="mt-6">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {autoApprovalEmails.map((email, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {email}
                <button
                  onClick={() => removeAutoApprovalEmail(email)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Sections */}
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <Briefcase className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No jobs found
            </h3>
            <p className="text-muted-foreground mb-6">
              Jobs will appear here when researchers request access to your
              datasets
            </p>
          </div>
        </div>
      ) : (
        (["pending", "approved", "denied"] as const).map((status) => {
          const statusJobs = getJobsByStatus(status);
          if (statusJobs.length === 0) return null;

          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold capitalize">
                  {status} Jobs
                </h2>
                <Badge variant="outline">{statusJobs.length}</Badge>
              </div>

              <div className="grid gap-4">
                {statusJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {job.projectName}
                          </CardTitle>
                          <CardDescription>{job.description}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Requested {timeAgo(job.requestedTime)} by{" "}
                            {job.requesterEmail}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {/* <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Project
                        </Button> */}
                          {job.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleJobAction(job.id, "approve")
                                }
                                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleJobAction(job.id, "deny")}
                                className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Deny
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
