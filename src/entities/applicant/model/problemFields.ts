import type { ApplicantProblemField } from "./types";

const PROBLEM_FIELD_VALUES: readonly ApplicantProblemField[] = [
  "remark",
  "specialty",
  "applicantName",
  "gender",
  "seumterId",
  "educationCompletionNumber",
  "educationExpirationDate",
  "officeAddress",
  "zone",
  "businessType",
  "registrationNumber",
  "engineeringServiceNumber1",
  "engineeringServiceNumber2",
  "engineeringServiceNumber3",
  "engineeringServiceRegisteredAt",
  "appliedScales",
  "personnel",
  "applicationForm",
  "consentForm",
  "serviceRegistrationCertificate",
  "careerCertificates",
  "businessRegistrationCertificate",
  "administrativeSanctionCheck",
  "supervisorEducationCertificate",
  "technicianEducationCertificate",
  "zoneChangeRequest",
  "zoneChangeAttachments",
] as const;

const PROBLEM_FIELD_SET = new Set<ApplicantProblemField>(PROBLEM_FIELD_VALUES);

export function getProblemFieldList(): ApplicantProblemField[] {
  return [...PROBLEM_FIELD_VALUES];
}

function normalizeField(value: unknown): ApplicantProblemField | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed === "technicalPersonnel") {
    return "personnel";
  }
  if (trimmed === "careerCertificate") {
    return "careerCertificates";
  }
  if (trimmed === "zoneCode") {
    return "zone";
  }
  if (PROBLEM_FIELD_SET.has(trimmed as ApplicantProblemField)) {
    return trimmed as ApplicantProblemField;
  }
  return null;
}

export function decodeProblemFields(source: unknown): ApplicantProblemField[] {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    const result: ApplicantProblemField[] = [];
    source.forEach((item) => {
      const normalized = normalizeField(item);
      if (normalized && !result.includes(normalized)) {
        result.push(normalized);
      }
    });
    return result;
  }

  if (typeof source === "string") {
    try {
      const parsed = JSON.parse(source);
      if (Array.isArray(parsed)) {
        return decodeProblemFields(parsed);
      }
    } catch {
      const normalized = normalizeField(source);
      return normalized ? [normalized] : [];
    }
  }

  return [];
}

export function isProblemFieldSelected(
  source: unknown,
  field: ApplicantProblemField,
): boolean {
  return decodeProblemFields(source).includes(field);
}

export function mergeProblemFields(
  base: unknown,
  updates: Iterable<ApplicantProblemField> | null | undefined,
): ApplicantProblemField[] {
  const baseList = new Set(decodeProblemFields(base));
  if (updates) {
    for (const value of updates) {
      if (PROBLEM_FIELD_SET.has(value)) {
        baseList.add(value);
      }
    }
  }
  return Array.from(baseList);
}
