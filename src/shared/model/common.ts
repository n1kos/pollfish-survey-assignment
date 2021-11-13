export interface SurveyResponse {
  success: boolean;
  data: Survey[];
}

export interface Survey {
  prompt: string;
  answers: [string?];
  id: string;
}
