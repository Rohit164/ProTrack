// components/ProjectList.jsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getProjects } from "@/actions/organizations";
import DeleteProject from "./delete-project";
import AddMember from "./add-member";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function ProjectList({ orgId }) {
  const projects = await getProjects(orgId);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex gap-2">
          <AddMember orgId={orgId} />
          <Link href="/project/create">
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>New Project</span>
            </Button>
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started
              </p>
              <Link href="/project/create">
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>Create Project</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {project.name}
                  <DeleteProject projectId={project.id} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{project.description}</p>
                <Link
                  href={`/project/${project.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Project
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
