"use client";

import { ActionForm } from "@/components/ActionForm";
import type { Task } from "@/lib/projects";
import { removeTask, saveTask } from "./actions";
import { TaskFields, type Option } from "./TaskFields";
import { ScreenshotField } from "./ScreenshotField";
import s from "./projects.module.css";

/** The task dialog's content, shared by the board and the list. */
export function TaskEditor({ task: t, projects, users, today }: { task: Task; projects: Option[]; users: Option[]; today: string }) {
  return (
    <>
      <ActionForm action={saveTask} submit="Save task" className={`form ${s.dialogform}`}>
        <TaskFields task={t} projects={projects} users={users} today={today} />
      </ActionForm>
      <ScreenshotField taskId={t.id} has={t.screenshot} version={t.screenshot_version} />
      {/* The server allows it for whoever created the task, or an admin. */}
      <div className="danger">
        <ActionForm action={removeTask} submit="Delete task" pending="Deleting…" danger className="form form--row">
          <input type="hidden" name="id" value={t.id} />
        </ActionForm>
      </div>
    </>
  );
}
