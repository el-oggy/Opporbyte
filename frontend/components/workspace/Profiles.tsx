"use client";
import { useState } from "react";
import { Badge, Button, Card, Field, PageHeading } from "@/components/ui";
import { json, request } from "./api";
import { demoState } from "./demo";
import { ActionNotice, LoadState, useAction, useResource } from "./common";
import type { CareerProfile, ProjectItem } from "./types";
import type { ViewProps } from "./WorkspacePage";
import styles from "./Workspace.module.css";
const split = (text: string) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
function CommaInput({
  id,
  items,
  onChange,
  multiline = false,
}: {
  id: string;
  items: string[];
  onChange: (items: string[]) => void;
  multiline?: boolean;
}) {
  const [text, setText] = useState(items.join(", "));
  const update = (value: string) => {
    setText(value);
    onChange(split(value));
  };
  return multiline ? (
    <textarea id={id} value={text} onChange={(e) => update(e.target.value)} />
  ) : (
    <input id={id} value={text} onChange={(e) => update(e.target.value)} />
  );
}
export default function Profiles({ demo, profile }: ViewProps) {
  const resource = useResource(
    async () =>
      demo
        ? structuredClone(demoState.profiles[profile])
        : request<CareerProfile>(`/profiles/${profile}`),
    [demo, profile],
  );
  return (
    <>
      <PageHeading title="Make your search your own.">
        The preferences, experience, and skills that shape your next
        opportunity.
      </PageHeading>
      <LoadState
        loading={resource.loading}
        error={resource.error}
        retry={resource.refresh}
      />
      {resource.data && (
        <ProfileEditor
          key={resource.data.id}
          initial={resource.data}
          demo={demo}
        />
      )}
      <Card className={styles.futureCareers}>
        <Badge tone="cyan">More paths ahead</Badge>
        <h2>Your ambition doesn’t fit in a dropdown.</h2>
        <p>
          Healthcare, design, finance, education, and custom careers are part of
          the broader product direction. This owner workspace currently saves
          Software and Semiconductor profiles.
        </p>
        <div className={styles.chips}>
          {[
            "Engineering",
            "Design",
            "Healthcare",
            "Finance",
            "Marketing",
            "Education",
            "Research",
            "Your own path",
          ].map((career) => (
            <Badge key={career}>{career} · planned</Badge>
          ))}
        </div>
      </Card>
    </>
  );
}
function ProfileEditor({
  initial,
  demo,
}: {
  initial: CareerProfile;
  demo: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const [projectKeys, setProjectKeys] = useState(() =>
    initial.projects.map((_, index) => `existing-${index}`),
  );
  const action = useAction();
  const update = <K extends keyof CareerProfile>(
    key: K,
    value: CareerProfile[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const updateProject = (
    index: number,
    key: keyof ProjectItem,
    value: string | string[],
  ) =>
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, i) =>
        i === index ? { ...project, [key]: value } : project,
      ),
    }));
  return (
    <form
      className={styles.profileForm}
      onSubmit={(e) => {
        e.preventDefault();
        action.run(
          async () => {
            const {
              id: _id,
              user_id: _user,
              profile_type: _type,
              created_at: _created,
              updated_at: _updated,
              ...payload
            } = draft;
            void _id;
            void _user;
            void _type;
            void _created;
            void _updated;
            if (demo)
              demoState.profiles[draft.profile_type] = structuredClone(draft);
            else {
              const saved = await request<CareerProfile>(
                `/profiles/${draft.profile_type}`,
                json("PUT", payload),
              );
              setDraft(saved);
            }
          },
          demo
            ? "Example preferences updated for this browser session."
            : "Career profile saved.",
        );
      }}
    >
      <div className={styles.profileGrid}>
        <Card>
          <div className={styles.sectionHead}>
            <h2>Your direction</h2>
            <Badge tone="cyan">
              {draft.profile_type === "software" ? "Software" : "Semiconductor"}
            </Badge>
          </div>
          <div className={styles.form}>
            <Field label="Profile name" htmlFor="profile-title">
              <input
                id="profile-title"
                required
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>
            <Field label="Professional summary" htmlFor="profile-summary">
              <textarea
                id="profile-summary"
                rows={4}
                value={draft.summary}
                onChange={(e) => update("summary", e.target.value)}
              />
            </Field>
            <Field
              label="Target roles"
              htmlFor="profile-roles"
              hint="Separate titles with commas."
            >
              <input
                id="profile-roles"
                defaultValue={draft.target_job_titles.join(", ")}
                onChange={(e) =>
                  update("target_job_titles", split(e.target.value))
                }
              />
            </Field>
            <Field
              label="Technical skills"
              htmlFor="profile-skills"
              hint="Use skills you can support with verified experience."
            >
              <textarea
                id="profile-skills"
                rows={3}
                defaultValue={draft.technical_skills.join(", ")}
                onChange={(e) =>
                  update("technical_skills", split(e.target.value))
                }
              />
            </Field>
            <Field label="Experience level" htmlFor="profile-experience">
              <select
                id="profile-experience"
                value={draft.experience_level}
                onChange={(e) => update("experience_level", e.target.value)}
              >
                {[
                  "Entry-level",
                  "Junior",
                  "Mid-level",
                  "Senior",
                  "Lead",
                  "Executive",
                ].map((level) => (
                  <option key={level}>{level}</option>
                ))}
                {![
                  "Entry-level",
                  "Junior",
                  "Mid-level",
                  "Senior",
                  "Lead",
                  "Executive",
                ].includes(draft.experience_level) && (
                  <option>{draft.experience_level}</option>
                )}
              </select>
            </Field>
          </div>
        </Card>
        <Card>
          <h2>What works for you</h2>
          <div className={styles.form}>
            <Field
              label="Preferred locations"
              htmlFor="profile-locations"
              hint="Separate locations with commas."
            >
              <input
                id="profile-locations"
                defaultValue={draft.preferred_locations.join(", ")}
                onChange={(e) =>
                  update("preferred_locations", split(e.target.value))
                }
              />
            </Field>
            <fieldset className={styles.checkGroup}>
              <legend>Work preferences</legend>
              {["remote", "hybrid", "on-site"].map((work) => (
                <label key={work}>
                  <input
                    type="checkbox"
                    checked={draft.work_preference.includes(work)}
                    onChange={(e) =>
                      update(
                        "work_preference",
                        e.target.checked
                          ? [...draft.work_preference, work]
                          : draft.work_preference.filter((v) => v !== work),
                      )
                    }
                  />
                  {work === "on-site"
                    ? "On-site"
                    : work[0].toUpperCase() + work.slice(1)}
                </label>
              ))}
            </fieldset>
            <Field
              label="Employment types"
              htmlFor="profile-employment"
              hint="For example full-time, contract, internship."
            >
              <input
                id="profile-employment"
                defaultValue={draft.employment_type.join(", ")}
                onChange={(e) =>
                  update("employment_type", split(e.target.value))
                }
              />
            </Field>
            <div className={styles.twoFields}>
              <Field label="Minimum salary" htmlFor="profile-min">
                <input
                  id="profile-min"
                  type="number"
                  min="0"
                  value={draft.salary_expectation.min_salary}
                  onChange={(e) =>
                    update("salary_expectation", {
                      ...draft.salary_expectation,
                      min_salary: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Target salary" htmlFor="profile-target">
                <input
                  id="profile-target"
                  type="number"
                  min="0"
                  value={draft.salary_expectation.target_salary}
                  onChange={(e) =>
                    update("salary_expectation", {
                      ...draft.salary_expectation,
                      target_salary: Number(e.target.value),
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Currency" htmlFor="profile-currency">
              <input
                id="profile-currency"
                maxLength={3}
                value={draft.salary_expectation.currency}
                onChange={(e) =>
                  update("salary_expectation", {
                    ...draft.salary_expectation,
                    currency: e.target.value.toUpperCase(),
                  })
                }
              />
            </Field>
            <Field label="Companies to exclude" htmlFor="profile-excluded">
              <input
                id="profile-excluded"
                defaultValue={draft.excluded_companies.join(", ")}
                onChange={(e) =>
                  update("excluded_companies", split(e.target.value))
                }
              />
            </Field>
            <Field
              label={`Matching threshold: ${draft.matching_threshold}%`}
              htmlFor="profile-threshold"
              hint="Minimum score you want to use when reviewing your matches."
            >
              <input
                id="profile-threshold"
                type="range"
                min="0"
                max="100"
                value={draft.matching_threshold}
                onChange={(e) =>
                  update("matching_threshold", Number(e.target.value))
                }
              />
            </Field>
          </div>
        </Card>
      </div>
      <Card>
        <div className={styles.sectionHead}>
          <h2>Projects that show your work</h2>
          <Button
            variant="secondary"
            onClick={() => {
              setProjectKeys((keys) => [...keys, `added-${Date.now()}`]);
              update("projects", [
                ...draft.projects,
                {
                  title: "",
                  description: "",
                  technologies: [],
                  highlights: [],
                },
              ]);
            }}
          >
            Add project
          </Button>
        </div>
        {!draft.projects.length && (
          <p className={styles.muted}>
            Add relevant projects to strengthen your profile.
          </p>
        )}
        {draft.projects.map((project, index) => (
          <div className={styles.projectEditor} key={projectKeys[index]}>
            <Field
              label={`Project ${index + 1} title`}
              htmlFor={`project-title-${index}`}
            >
              <input
                id={`project-title-${index}`}
                required
                value={project.title}
                onChange={(e) => updateProject(index, "title", e.target.value)}
              />
            </Field>
            <Field label="Description" htmlFor={`project-description-${index}`}>
              <textarea
                id={`project-description-${index}`}
                value={project.description}
                onChange={(e) =>
                  updateProject(index, "description", e.target.value)
                }
              />
            </Field>
            <Field label="Technologies" htmlFor={`project-tech-${index}`}>
              <CommaInput
                id={`project-tech-${index}`}
                items={project.technologies}
                onChange={(items) =>
                  updateProject(index, "technologies", items)
                }
              />
            </Field>
            <Field
              label="Highlights"
              htmlFor={`project-highlights-${index}`}
              hint="Separate highlights with commas."
            >
              <CommaInput
                id={`project-highlights-${index}`}
                items={project.highlights}
                onChange={(items) => updateProject(index, "highlights", items)}
                multiline
              />
            </Field>
            <Button
              variant="ghost"
              onClick={() => {
                setProjectKeys((keys) => keys.filter((_, i) => i !== index));
                update(
                  "projects",
                  draft.projects.filter((_, i) => i !== index),
                );
              }}
            >
              Remove project
            </Button>
          </div>
        ))}
      </Card>
      <div className={styles.saveBar}>
        <p>
          {demo
            ? "Preview preferences remain in memory."
            : "Saved preferences apply only to this career profile."}
        </p>
        <Button type="submit" disabled={action.busy}>
          {action.busy ? "Saving…" : "Save preferences"}
        </Button>
      </div>
      <ActionNotice {...action} />
    </form>
  );
}
