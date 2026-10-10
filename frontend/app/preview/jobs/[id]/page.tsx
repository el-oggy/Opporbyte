import WorkspacePage from "@/components/workspace/WorkspacePage";
export default async function Page({params}:{params:Promise<{id:string}>}) { const {id}=await params; return <WorkspacePage section="job" jobId={id} mode="demo" />; }
