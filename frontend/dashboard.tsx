"use client";

import { useState } from "react";
import { Layout } from "./components/layout";
import { DatasetsView } from "./components/datasets-view";
import { JobsView } from "./components/jobs-view";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"datasets" | "jobs">("datasets");

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Content */}
      {activeTab === "datasets" ? <DatasetsView /> : <JobsView />}
    </Layout>
  );
}
