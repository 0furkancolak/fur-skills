export type SkillName =
  | "fur-do"
  | "fur-check"
  | "fur-debug"
  | "fur-task"
  | "fur-init"
  | "fur-done"
  | "fur-status"
  | "fur-ui-design"
  | "fur-ui-review"
  | "fur-ui-clone";

export interface GraderProfile {
  requiredHeadings: string[];
}

const EXECUTOR_HEADINGS = [
  "## Task Understanding",
  "## Acceptance Criteria Coverage",
  "## Implementation Details",
  "## Files Changed",
  "## Verification",
  "## Risks and Follow-ups",
];

const GATE_HEADINGS = [
  "## Check Result",
  "## Findings",
  "## Acceptance Criteria",
  "## Verification",
  "## Gaps",
];

const PLANNER_HEADINGS = [
  "## Task Result",
  "## Clarifications",
  "## Next",
];

const ORCHESTRATOR_HEADINGS = [
  "## Summary",
  "## Counts / State",
  "## Next Action",
];

const DONE_HEADINGS = [
  "## Done",
  "## Verification Summary",
  "## Risks and Follow-ups",
];

const DIAGNOSTIC_HEADINGS = [
  "## Root Cause",
  "## Feedback Loop",
  "## Hypotheses Tested",
  "## Fix",
  "## Verification",
  "## Remaining Risk",
  "## Prevention",
];

export const GRADER_PROFILES: Record<SkillName, GraderProfile> = {
  "fur-do": { requiredHeadings: EXECUTOR_HEADINGS },
  "fur-ui-clone": { requiredHeadings: EXECUTOR_HEADINGS },
  "fur-check": { requiredHeadings: GATE_HEADINGS },
  "fur-ui-review": { requiredHeadings: GATE_HEADINGS },
  "fur-task": { requiredHeadings: PLANNER_HEADINGS },
  "fur-ui-design": { requiredHeadings: PLANNER_HEADINGS },
  "fur-debug": { requiredHeadings: DIAGNOSTIC_HEADINGS },
  "fur-init": { requiredHeadings: ORCHESTRATOR_HEADINGS },
  "fur-done": { requiredHeadings: DONE_HEADINGS },
  "fur-status": { requiredHeadings: ORCHESTRATOR_HEADINGS },
};

export function isSkillName(name: string): name is SkillName {
  return name in GRADER_PROFILES;
}
