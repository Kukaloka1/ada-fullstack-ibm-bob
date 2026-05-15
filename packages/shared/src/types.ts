export type AdaWorkflowStep =
  | "mission_intake"
  | "planning_gate"
  | "spec_builder"
  | "bob_mission"
  | "qa_gate"
  | "delivery_report";

export type AdaQaStatus = "PASS" | "CONDITIONAL_PASS" | "FAIL";

export type AdaChatRole = "user" | "ada" | "system";
